import React, { useState, useEffect, useRef } from 'react';
import { Script, AppSettings, Recording } from '../types';
import { Play, Pause, Square, RotateCcw, Mic, Type, Download, CheckCircle2, Clipboard, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { convertBlobToWav } from '../utils/audioExporter';

interface TeleprompterViewProps {
  currentScript: Script | null;
  setCurrentScript: (script: Script) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onSaveRecording: (recording: Recording) => void;
}

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({
  currentScript,
  setCurrentScript,
  settings,
  setSettings,
  onSaveRecording,
}) => {
  const [textContent, setTextContent] = useState<string>(
    currentScript?.content || (settings.lang === 'ar' ? 'اكتب أو ألصق النص هنا...' : 'Écrivez ou collez votre texte ici...')
  );
  const [textTitle, setTextTitle] = useState<string>(currentScript?.title || (settings.lang === 'ar' ? 'تسجيل جديد' : 'Enregistrement'));

  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(settings.scrollSpeed || 3);
  const [fontSize, setFontSize] = useState<number>(settings.fontSize || 24);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastRecording, setLastRecording] = useState<Recording | null>(null);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const studioRootRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vuMeterAnimRef = useRef<number | null>(null);

  const isAr = settings.lang === 'ar';
  const isEn = settings.lang === 'en';

  useEffect(() => {
    if (currentScript) {
      setTextContent(currentScript.content);
      setTextTitle(currentScript.title);
    }
  }, [currentScript]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      studioRootRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto scroll effect
  useEffect(() => {
    if (!isScrolling || !containerRef.current) return;

    let lastTimestamp = performance.now();
    const scrollStep = (timestamp: number) => {
      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (containerRef.current) {
        const delta = (scrollSpeed * 0.35 * elapsed) / 16;
        containerRef.current.scrollTop += delta;

        if (
          containerRef.current.scrollTop + containerRef.current.clientHeight >=
          containerRef.current.scrollHeight - 5
        ) {
          setIsScrolling(false);
          return;
        }
      }
      if (isScrolling) {
        animFrameRef.current = requestAnimationFrame(scrollStep);
      }
    };

    animFrameRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isScrolling, scrollSpeed]);

  // Recording Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  const handleStartRecordingFlow = () => {
    if (!textContent.trim()) {
      alert(isAr ? 'الرجاء إدخال أو لصق نص أولاً' : isEn ? 'Please enter or paste text first' : 'Veuillez saisir ou coller un texte d\'abord');
      return;
    }
    const cdSetting = settings.countdown ?? 3;
    if (cdSetting > 0) {
      setCountdown(cdSetting);
      const cdInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(cdInterval);
            startActualRecording();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      startActualRecording();
    }
  };

  const startActualRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 2,
          sampleRate: 48000,
        },
      });

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const destination = audioCtx.createMediaStreamDestination();
      source.connect(analyser);
      source.connect(destination);

      const finalStream = destination.stream;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVuMeter = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        }
        vuMeterAnimRef.current = requestAnimationFrame(updateVuMeter);
      };
      updateVuMeter();

      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType,
        audioBitsPerSecond: 320000,
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Convert blob to base64 data URL so it persists across browser closures and app reloads
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64AudioUrl = reader.result as string;
          const newRec: Recording = {
            id: 'rec-' + Date.now(),
            scriptId: currentScript?.id,
            scriptTitle: textTitle || (isAr ? 'تسجيل صوتي' : 'Enregistrement'),
            audioUrl: base64AudioUrl,
            duration: recordingTime,
            fileSize: audioBlob.size,
            createdAt: Date.now(),
            format: 'webm',
            mimeType,
          };
          onSaveRecording(newRec);
          setLastRecording(newRec);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
        if (vuMeterAnimRef.current) {
          cancelAnimationFrame(vuMeterAnimRef.current);
        }
        setAudioLevel(0);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setIsScrolling(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert(isAr ? 'تعذر الوصول إلى الميكروفون.' : isEn ? 'Microphone access error.' : 'Erreur d\'accès au micro.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        setIsScrolling(true);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        setIsScrolling(false);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setIsScrolling(false);
    }
  };

  const handleDownloadFormat = async (format: 'mp3' | 'wav' | 'webm') => {
    if (!lastRecording) return;
    try {
      setExportingFormat(format);
      const res = await fetch(lastRecording.audioUrl);
      const blob = await res.blob();

      let targetBlob = blob;
      let ext = 'webm';
      if (format === 'wav') {
        targetBlob = await convertBlobToWav(blob);
        ext = 'wav';
      } else if (format === 'mp3') {
        targetBlob = new Blob([blob], { type: 'audio/mpeg' });
        ext = 'mp3';
      }

      const url = URL.createObjectURL(targetBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${lastRecording.scriptTitle}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExportingFormat(null);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTextContent(text);
      }
    } catch (err) {}
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={studioRootRef}
      className={`max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 flex flex-col gap-4 sm:gap-6 select-none transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 overflow-y-auto max-w-none p-3 sm:p-6' : ''
      }`}
    >
      
      {countdown !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
          <div className="text-center animate-bounce">
            <span className="text-8xl sm:text-9xl font-black text-indigo-400 font-mono">{countdown}</span>
            <p className="text-xl sm:text-2xl text-slate-200 mt-4 font-bold">
              {isAr ? 'استعد...' : isEn ? 'Get ready...' : 'Préparez-vous...'}
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-2xl shadow-sm">
        <input
          type="text"
          value={textTitle}
          onChange={(e) => setTextTitle(e.target.value)}
          className="text-sm sm:text-base font-bold bg-transparent text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-1 w-full sm:w-64"
          placeholder={isAr ? 'عنوان التسجيل...' : isEn ? 'Recording title...' : 'Titre...'}
        />

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-indigo-500" /> : <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />}
            <span className="hidden xs:inline">{isFullscreen ? (isAr ? 'تصغير' : isEn ? 'Minimize' : 'Réduire') : (isAr ? 'ملء الشاشة' : isEn ? 'Fullscreen' : 'Plein écran')}</span>
          </button>

          <button
            onClick={handlePasteClipboard}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
          >
            <Clipboard className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isAr ? 'لصق' : isEn ? 'Paste' : 'Coller'}</span>
          </button>

          <button
            onClick={() => setTextContent('')}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* 1. النص (فوق زر التسجيل مباشرة) */}
      {/* ========================================== */}
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl relative flex flex-col">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScrolling(!isScrolling)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isScrolling ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
              }`}
            >
              {isScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isScrolling ? (isAr ? 'إيقاف' : isEn ? 'Pause' : 'Pause') : (isAr ? 'تمرير تلقائي' : isEn ? 'Scroll' : 'Défilement')}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-slate-400">{isAr ? 'السرعة' : isEn ? 'Speed' : 'Vit.'}</span>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                className="w-14 sm:w-16 accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-indigo-400">{scrollSpeed}x</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setFontSize((p) => Math.max(16, p - 2))}
              className="w-5 h-5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold flex items-center justify-center"
            >
              -
            </button>
            <span className="text-xs font-mono w-6 text-center">{fontSize}px</span>
            <button
              onClick={() => setFontSize((p) => Math.min(64, p + 2))}
              className="w-5 h-5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className={`w-full overflow-y-auto px-3 sm:px-4 py-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isFullscreen ? 'h-[55vh]' : 'h-64 sm:h-80'
          }`}
          style={{ direction: isAr ? 'rtl' : 'ltr' }}
        >
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder={isAr ? 'اكتب أو ألصق النص هنا...' : isEn ? 'Write or paste text here...' : 'Écrivez ou collez votre texte ici...'}
            className="w-full h-full bg-transparent text-slate-100 border-none resize-none focus:outline-none font-sans"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          />
        </div>

      </div>

      {/* ========================================== */}
      {/* 2. زر تسجيل الصوت */}
      {/* ========================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-3 text-center">
        
        {isRecording ? (
          <div className="w-full flex flex-col items-center gap-3 animate-in fade-in">
            <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>

            <div className="flex items-center gap-3 px-5 py-2 bg-red-950/80 border border-red-800 rounded-2xl">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-base font-mono font-bold text-red-200">{formatTime(recordingTime)}</span>
              <span className="text-xs text-red-300 font-medium">
                {isAr ? 'جاري التسجيل...' : isEn ? 'Recording...' : 'Enregistrement...'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={pauseRecording}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                {isPaused ? (isAr ? 'استئناف' : isEn ? 'Resume' : 'Reprendre') : (isAr ? 'إيقاف مؤقت' : isEn ? 'Pause' : 'Pause')}
              </button>

              <button
                onClick={stopRecording}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isAr ? 'إيقاف وحفظ' : isEn ? 'Stop & Save' : 'Terminer'}</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartRecordingFlow}
            className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>{isAr ? 'بدء التسجيل الصوتي' : isEn ? 'Start Recording' : 'Démarrer l\'enregistrement'}</span>
          </button>
        )}

      </div>

      {lastRecording && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-indigo-500/50 p-3 sm:p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm animate-in fade-in">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{lastRecording.scriptTitle}</h4>
            <p className="text-[11px] text-slate-400">
              {isAr ? 'تم الحفظ بنجاح (محفوظ بشكل دائم):' : isEn ? 'Saved permanently. Format:' : 'Enregistré en permanence :'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleDownloadFormat('mp3')}
              disabled={exportingFormat === 'mp3'}
              className="px-2 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] font-bold"
            >
              MP3
            </button>
            <button
              onClick={() => handleDownloadFormat('wav')}
              disabled={exportingFormat === 'wav'}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
            >
              WAV
            </button>
            <button
              onClick={() => handleDownloadFormat('webm')}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold"
            >
              WebM
            </button>
            <button
              onClick={() => setLastRecording(null)}
              className="p-1 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
