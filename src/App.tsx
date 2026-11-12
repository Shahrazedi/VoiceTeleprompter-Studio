import React, { useState, useEffect } from 'react';
import { Script, Recording, AppSettings } from './types';
import { SAMPLE_SCRIPTS } from './data/sampleScripts';
import { Navbar } from './components/Navbar';
import { TeleprompterView } from './components/TeleprompterView';
import { ScriptEditor } from './components/ScriptEditor';
import { RecordingsList } from './components/RecordingsList';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('vox_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      theme: 'dark',
      lang: 'ar',
      fontSize: 24,
      scrollSpeed: 3,
      mirrorMode: false,
      countdown: 3,
      fontFamily: 'sans',
      marginWidth: 'normal',
    };
  });

  const [scripts, setScripts] = useState<Script[]>(() => {
    const saved = localStorage.getItem('vox_scripts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return SAMPLE_SCRIPTS;
  });

  const [currentScript, setCurrentScript] = useState<Script | null>(() => {
    return scripts[0] || null;
  });

  const [recordings, setRecordings] = useState<Recording[]>(() => {
    const saved = localStorage.getItem('vox_recordings_meta');
    if (saved) {
      try {
        return JSON.parse(saved).map((r: any) => ({
          ...r,
          audioUrl: r.audioUrl || '',
        }));
      } catch (e) {}
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'teleprompter' | 'scripts' | 'recordings'>('teleprompter');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vox_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('vox_scripts', JSON.stringify(scripts));
  }, [scripts]);

  useEffect(() => {
    const recsToSave = recordings.map(({ audioUrl, ...rest }) => rest);
    localStorage.setItem('vox_recordings_meta', JSON.stringify(recsToSave));
  }, [recordings]);

  const handleSaveRecording = (newRec: Recording) => {
    setRecordings((prev) => [newRec, ...prev]);
    setActiveTab('recordings');
  };

  return (
    <div className={`min-h-screen flex flex-col ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        setSettings={setSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'teleprompter' && (
          <TeleprompterView
            currentScript={currentScript}
            setCurrentScript={setCurrentScript}
            settings={settings}
            setSettings={setSettings}
            onSaveRecording={handleSaveRecording}
          />
        )}

        {activeTab === 'scripts' && (
          <ScriptEditor
            scripts={scripts}
            setScripts={setScripts}
            currentScript={currentScript}
            setCurrentScript={setCurrentScript}
            setActiveTab={setActiveTab}
            settings={settings}
          />
        )}

        {activeTab === 'recordings' && (
          <RecordingsList
            recordings={recordings}
            setRecordings={setRecordings}
            settings={settings}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}
