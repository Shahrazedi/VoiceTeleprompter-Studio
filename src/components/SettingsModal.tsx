import React from 'react';
import { AppSettings } from '../types';
import { X, Settings, Moon, Sun, Languages, Clock, Type, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
}) => {
  if (!isOpen) return null;

  const isAr = settings.lang === 'ar';
  const isEn = settings.lang === 'en';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'إعدادات التطبيق' : isEn ? 'App Settings' : 'Paramètres'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'خصص تجربة التسجيل والقراءة بالشكل الذي يناسبك.' : isEn ? 'Customize your recording and prompter experience.' : 'Personnalisez votre expérience.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? 'لغة واجهة المستخدم' : isEn ? 'Interface Language' : 'Langue de l\'interface'}
              </h4>
              <p className="text-xs text-slate-500">{isAr ? 'اختر لغة العرض' : isEn ? 'Choose language' : 'Choisissez la langue'}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setSettings({ ...settings, lang: 'ar' })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  settings.lang === 'ar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setSettings({ ...settings, lang: 'en' })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  settings.lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSettings({ ...settings, lang: 'fr' })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  settings.lang === 'fr' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Français
              </button>
            </div>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? 'الوضع المظلم' : isEn ? 'Dark Mode' : 'Mode Sombre'}
              </h4>
              <p className="text-xs text-slate-500">{isAr ? 'تبديل بين المظهر الفاتح والداكن' : isEn ? 'Switch light and dark theme' : 'Basculer clair/sombre'}</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center gap-2 text-xs font-bold"
            >
              {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>{settings.theme === 'light' ? (isAr ? 'داكن' : isEn ? 'Dark' : 'Sombre') : (isAr ? 'فاتح' : isEn ? 'Light' : 'Clair')}</span>
            </button>
          </div>

          {/* Countdown before recording */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? 'عداد تنازلي قبل التسجيل' : isEn ? 'Countdown' : 'Compte à rebours'}
              </h4>
              <p className="text-xs text-slate-500">{isAr ? 'مهلة الاستعداد' : isEn ? 'Preparation delay' : 'Délai'}</p>
            </div>
            <select
              value={settings.countdown}
              onChange={(e) => setSettings({ ...settings, countdown: parseInt(e.target.value) })}
              className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
            >
              <option value="0">{isAr ? 'بدون (فوري)' : isEn ? 'None (Instant)' : 'Aucun'}</option>
              <option value="3">3 {isAr ? 'ثوانٍ' : isEn ? 'seconds' : 'secondes'}</option>
              <option value="5">5 {isAr ? 'ثوانٍ' : isEn ? 'seconds' : 'secondes'}</option>
            </select>
          </div>

          {/* Default Scroll Speed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? 'سرعة التمرير الافتراضية' : isEn ? 'Default Scroll Speed' : 'Vitesse de défilement'}
              </h4>
              <span className="text-xs font-mono font-bold text-indigo-500">{settings.scrollSpeed}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={settings.scrollSpeed}
              onChange={(e) => setSettings({ ...settings, scrollSpeed: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            {isAr ? 'حفظ وإغلاق' : isEn ? 'Save & Close' : 'Enregistrer'}
          </button>
        </div>

      </div>
    </div>
  );
};
