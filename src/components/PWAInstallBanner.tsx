import React, { useEffect, useState } from 'react';
import { Download, WifiOff, Wifi } from 'lucide-react';
import { AppSettings } from '../types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallBannerProps {
  settings: AppSettings;
}

type LangKey = 'ar' | 'en' | 'fr';

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ settings }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const lang: LangKey = (settings.lang as LangKey) || 'ar';

  const translations = {
    ar: {
      install: 'تثبيت التطبيق (بدون إنترنت)',
      offline: 'أنت تعمل حالياً بدون اتصال بالإنترنت (وضع عدم الاتصال مفعل)',
      online: 'عاد الاتصال بالإنترنت',
      iosTitle: 'تثبيت التطبيق على آيفون / آيباد',
      iosStep1: '1. اضغط على زر "مشاركة" (Share) في شريط متصفح سفاري.',
      iosStep2: '2. انزل لأسفل واضغط على "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).',
      close: 'إغلاق',
      installIOS: 'تثبيت على آيفون',
    },
    en: {
      install: 'Install App (Offline Ready)',
      offline: 'You are currently offline. Cached data is being used.',
      online: 'Back online',
      iosTitle: 'Install on iPhone / iPad',
      iosStep1: '1. Tap the Share button in Safari toolbar.',
      iosStep2: '2. Scroll down and tap Add to Home Screen.',
      close: 'Close',
      installIOS: 'Install on iOS',
    },
    fr: {
      install: 'Installer l’application (Hors ligne)',
      offline: 'Vous êtes hors ligne. Les données en cache sont utilisées.',
      online: 'De nouveau en ligne',
      iosTitle: 'Installer sur iPhone / iPad',
      iosStep1: '1. Appuyez sur le bouton Partager dans la barre d’outils Safari.',
      iosStep2: '2. Faites défiler vers le bas et appuyez sur Sur l’écran d’accueil.',
      close: 'Fermer',
      installIOS: 'Installer sur iOS',
    },
  };

  const t = translations[lang] || translations.ar;

  useEffect(() => {
    // Check standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(true);
      setTimeout(() => setShowOfflineToast(false), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Offline / Online Toast */}
      {(!isOnline || showOfflineToast) && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 text-sm font-medium ${
            isOnline
              ? 'bg-emerald-600/90 text-white'
              : 'bg-amber-600/90 text-white animate-pulse'
          }`}
        >
          {isOnline ? <Wifi className="w-5 h-5 shrink-0" /> : <WifiOff className="w-5 h-5 shrink-0" />}
          <span>{isOnline ? t.online : t.offline}</span>
        </div>
      )}

      {/* Install Button in Navbar / Header if installable or iOS */}
      {!isInstalled && (deferredPrompt || isIOS) && (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:from-blue-700 hover:to-indigo-700 transition"
          title={t.install}
        >
          <Download className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{deferredPrompt ? t.install : t.installIOS}</span>
        </button>
      )}

      {/* iOS Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">{t.iosTitle}</h3>
            <p className="text-sm text-slate-300 space-y-2 leading-relaxed mb-6">
              <span className="block">{t.iosStep1}</span>
              <span className="block">{t.iosStep2}</span>
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
