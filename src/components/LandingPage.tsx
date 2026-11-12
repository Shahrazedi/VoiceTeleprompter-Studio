import React from 'react';
import { Mic, Sparkles, Sliders, FolderArchive, FileText, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { AppSettings } from '../types';

interface LandingPageProps {
  onStartStudio: () => void;
  settings: AppSettings;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartStudio, settings }) => {
  const isAr = settings.lang === 'ar';
  const isEn = settings.lang === 'en';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col justify-between">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'الجيل الجديد من استوديو التعليق الصوتي والتليبرومبتر' : isEn ? 'Next-Gen Voice-Over & Teleprompter Studio' : 'Studio pro de voix-off et prompteur'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          {isAr ? (
            <>سجل صوتك باحترافية تامة مع <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">شاشة القراءة الذكية</span></>
          ) : isEn ? (
            <>Record Pro Voice-Overs with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">Smart Teleprompter</span></>
          ) : (
            <>Enregistrez avec un <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">Prompteur Intelligent</span></>
          )}
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          {isAr
            ? 'الأداة المثالية لصناع المحتوى، المعلقين الصوتيين، ومقدمي البودكاست. دمج كامل بين تسجيل الصوت النقي وتليبرومبتر النصوص مع مساعد الذكاء الاصطناعي.'
            : isEn
            ? 'The ultimate tool for creators, voice actors, and podcasters. Combine pristine studio recording with a fluid teleprompter and AI script generator.'
            : 'L\'outil ultime pour les créateurs et doubleurs. Combinez enregistrement studio et prompteur fluide.'}
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={onStartStudio}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-base font-bold shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all cursor-pointer"
          >
            <span>{isAr ? 'دخول الاستوديو الآن' : isEn ? 'Launch Studio' : 'Lancer le studio'}</span>
            <ArrowRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-6">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">
              {isAr ? 'تسجيل استوديو نقي' : isEn ? 'Pristine Studio Recording' : 'Enregistrement studio pur'}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isAr
                ? 'جودة صوت عالية بمعايير المعلقين الصوتيين مع تصدير فوري بصيغ MP3 و WAV و WebM.'
                : isEn
                ? 'Broadcast-quality audio with instant export to MP3, WAV, and WebM formats.'
                : 'Audio de qualité professionnelle avec export instantané MP3, WAV, WebM.'}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">
              {isAr ? 'مساعد الذكاء الاصطناعي' : isEn ? 'AI Script Assistant' : 'Assistant IA'}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isAr
                ? 'ولد نصوصاً احترافية للبودكاست والنشرات الإخبارية بضغطة زر واحدة.'
                : isEn
                ? 'Generate professional scripts for podcasts and news bulletins instantly.'
                : 'Générez des scripts professionnels en un seul clic.'}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-pink-600/20 text-pink-400 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">
              {isAr ? 'تليبرومبتر متزامن' : isEn ? 'Smart Teleprompter' : 'Prompteur Intelligent'}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isAr
                ? 'تمرير تلقائي للنص أثناء التسجيل مع وضع ملء الشاشة والتحكم بالسرعة.'
                : isEn
                ? 'Auto-scrolling text during recording with full-screen mode and speed control.'
                : 'Défilement automatique du texte pendant l\'enregistrement.'}
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 VoxPrompter Pro. All rights reserved.</p>
      </footer>

    </div>
  );
};
