import React, { useState } from 'react';
import { Recording, AppSettings } from '../types';
import { FolderArchive, Play, Pause, Download, Trash2, Edit3, Check, X, Clock, HardDrive, Music, FileAudio } from 'lucide-react';
import { convertBlobToWav } from '../utils/audioExporter';

interface RecordingsListProps {
  recordings: Recording[];
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
  settings: AppSettings;
}

export const RecordingsList: React.FC<RecordingsListProps> = ({
  recordings,
  setRecordings,
  settings,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const isAr = settings.lang === 'ar';

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePlayAudio = (rec: Recording) => {
    if (playingId === rec.id && audioElement) {
      audioElement.pause();
      setPlayingId(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(rec.audioUrl);
    setAudioElement(audio);
    setPlayingId(rec.id);

    audio.play();
    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const handleDelete = (id: string) => {
    if (playingId === id && audioElement) {
      audioElement.pause();
      setPlayingId(null);
    }
    const updated = recordings.filter((r) => r.id !== id);
    setRecordings(updated);
    const recsToSave = updated.map(({ audioUrl, ...rest }) => rest);
    localStorage.setItem('vox_recordings_meta', JSON.stringify(recsToSave));
    setDeletingId(null);
  };

  const handleStartRename = (rec: Recording) => {
    setEditingId(rec.id);
    setEditTitle(rec.scriptTitle);
  };

  const handleSaveRename = (id: string) => {
    const updated = recordings.map((r) => (r.id === id ? { ...r, scriptTitle: editTitle } : r));
    setRecordings(updated);
    const recsToSave = updated.map(({ audioUrl, ...rest }) => rest);
    localStorage.setItem('vox_recordings_meta', JSON.stringify(recsToSave));
    setEditingId(null);
  };

  const handleDownloadMp3 = async (rec: Recording) => {
    try {
      setConvertingId(rec.id);
      const response = await fetch(rec.audioUrl);
      const blob = await response.blob();
      // Download as MP3 (audio/mpeg)
      const url = URL.createObjectURL(new Blob([blob], { type: 'audio/mpeg' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rec.scriptTitle}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setConvertingId(null);
    }
  };

  const handleDownloadWav = async (rec: Recording) => {
    try {
      setConvertingId(rec.id);
      const response = await fetch(rec.audioUrl);
      const blob = await response.blob();
      const wavBlob = await convertBlobToWav(blob);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rec.scriptTitle}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('WAV conversion failed:', err);
    } finally {
      setConvertingId(null);
    }
  };

  const handleDownloadWebm = (rec: Recording) => {
    const a = document.createElement('a');
    a.href = rec.audioUrl;
    a.download = `${rec.scriptTitle}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isAr ? 'التسجيلات الصوتية المحفوظة' : 'Enregitrements Vocaux'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? 'إدارة وتصدير التسجيلات بصيغ (MP3, WAV, WebM).' : 'Gérez et exportez vos enregistrements.'}
          </p>
        </div>

        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800">
          {recordings.length} {isAr ? 'تسجيلات' : 'enregistrements'}
        </div>
      </div>

      {recordings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm">
          <FolderArchive className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
            {isAr ? 'لا توجد تسجيلات حتى الآن' : 'Aucun enregistrement pour le moment'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isAr ? 'ابدأ التسجيل من الشاشة الرئيسية لتظهر تسجيلاتك هنا.' : 'Commencez à enregistrer depuis l\'écran principal.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((rec) => {
            const isPlaying = playingId === rec.id;
            const isEditing = editingId === rec.id;
            const isConfirmingDelete = deletingId === rec.id;
            const isConverting = convertingId === rec.id;

            return (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 relative overflow-hidden"
              >
                {/* Delete Confirmation Overlay */}
                {isConfirmingDelete && (
                  <div className="absolute inset-0 bg-red-950/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center animate-in fade-in">
                    <p className="text-xs font-bold text-white mb-3">
                      {isAr ? 'هل أنت متأكد من حذف هذا التسجيل؟' : 'Supprimer cet enregistrement ?'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold"
                      >
                        {isAr ? 'نعم، حذف' : 'Oui, supprimer'}
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold"
                      >
                        {isAr ? 'إلغاء' : 'Annuler'}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Music className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase">
                        AUDIO
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleSaveRename(rec.id)}
                        className="p-1 bg-emerald-600 text-white rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {rec.scriptTitle}
                      </h3>
                      <button
                        onClick={() => handleStartRename(rec)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title={isAr ? 'تعديل الاسم' : 'Renommer'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-mono">{formatTime(rec.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span className="font-mono">{formatBytes(rec.fileSize)}</span>
                    </div>
                  </div>
                </div>

                {/* Play and Export Options */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayAudio(rec)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        isPlaying
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{isPlaying ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'استماع' : 'Écouter')}</span>
                    </button>

                    <button
                      onClick={() => setDeletingId(rec.id)}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-700 dark:text-red-400 rounded-xl transition-colors"
                      title={isAr ? 'حذف' : 'Supprimer'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Format Download Buttons (MP3, WAV, WebM) */}
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    <button
                      onClick={() => handleDownloadMp3(rec)}
                      disabled={isConverting}
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-semibold transition-colors disabled:opacity-50"
                    >
                      <span>MP3</span>
                    </button>

                    <button
                      onClick={() => handleDownloadWav(rec)}
                      disabled={isConverting}
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-semibold transition-colors disabled:opacity-50"
                    >
                      <span>WAV</span>
                    </button>

                    <button
                      onClick={() => handleDownloadWebm(rec)}
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-semibold transition-colors"
                    >
                      <span>WebM</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
