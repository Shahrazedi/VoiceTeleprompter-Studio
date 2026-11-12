import React from 'react';
import { Mic, FileText, FolderArchive, Settings, Moon, Sun, Languages } from 'lucide-react';
import { AppSettings } from '../types';
import { PWAInstallBanner } from './PWAInstallBanner';

interface NavbarProps {
  activeTab: 'teleprompter' | 'scripts' | 'recordings';
  setActiveTab: (tab: 'teleprompter' | 'scripts' | 'recordings') => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  setSettings,
  onOpenSettings,
}) => {
  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const toggleLanguage = () => {
    setSettings((prev) => {
      const nextLang = prev.lang === 'ar' ? 'fr' : prev.lang === 'fr' ? 'en' : 'ar';
      return { ...prev, lang: nextLang };
    });
  };

  const isAr = settings.lang === 'ar';
  const isEn = settings.lang === 'en';

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('teleprompter')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              VoiceTeleprompter Studio
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {isAr ? 'مسجّل الصوت والتليبرومبتر الاحترافي' : isEn ? 'Pro Voice & Teleprompter Studio' : 'Studio Voix & Prompteur'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-sm font-medium">
          <button
            onClick={() => setActiveTab('teleprompter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'teleprompter'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isAr ? 'شاشة القراءة والتسجيل' : isEn ? 'Teleprompter' : 'Prompteur'}</span>
          </button>

          <button
            onClick={() => setActiveTab('scripts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'scripts'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'النصوص' : isEn ? 'Scripts' : 'Scripts'}</span>
          </button>

          <button
            onClick={() => setActiveTab('recordings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'recordings'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>{isAr ? 'التسجيلات المحفوظة' : isEn ? 'Recordings' : 'Enregistrements'}</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallBanner settings={settings} />

          <button
            onClick={toggleLanguage}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
            title="Switch Language"
          >
            <Languages className="w-4 h-4" />
            <span className="uppercase">{settings.lang}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Mobile Bottom Bar Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 py-2 bg-white dark:bg-slate-900">
        <button
          onClick={() => setActiveTab('teleprompter')}
          className={`flex flex-col items-center gap-1 text-xs ${
            activeTab === 'teleprompter' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span>{isAr ? 'التليبرومبتر' : isEn ? 'Prompter' : 'Prompteur'}</span>
        </button>
        <button
          onClick={() => setActiveTab('scripts')}
          className={`flex flex-col items-center gap-1 text-xs ${
            activeTab === 'scripts' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>{isAr ? 'النصوص' : isEn ? 'Scripts' : 'Scripts'}</span>
        </button>
        <button
          onClick={() => setActiveTab('recordings')}
          className={`flex flex-col items-center gap-1 text-xs ${
            activeTab === 'recordings' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
          }`}
        >
          <FolderArchive className="w-5 h-5" />
          <span>{isAr ? 'التسجيلات' : isEn ? 'Records' : 'Enreg'}</span>
        </button>
      </div>
    </header>
  );
};
