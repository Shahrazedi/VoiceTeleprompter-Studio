import React, { useState } from 'react';
import { Script, AppSettings } from '../types';
import { FileText, Plus, Search, Upload, Trash2, Edit3, Check, X, Play } from 'lucide-react';

interface ScriptEditorProps {
  scripts: Script[];
  setScripts: React.Dispatch<React.SetStateAction<Script[]>>;
  currentScript: Script | null;
  setCurrentScript: (script: Script) => void;
  setActiveTab: (tab: 'teleprompter' | 'scripts' | 'recordings') => void;
  settings: AppSettings;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  scripts,
  setScripts,
  currentScript,
  setCurrentScript,
  setActiveTab,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<Script['category']>('podcast');
  const [editLang, setEditLang] = useState<'ar' | 'fr' | 'en'>(settings.lang);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAr = settings.lang === 'ar';
  const isEn = settings.lang === 'en';

  const filteredScripts = scripts.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewScript = () => {
    const newScript: Script = {
      id: 'script-' + Date.now(),
      title: isAr ? 'نص جديد بدون عنوان' : isEn ? 'Untitled Script' : 'Nouveau script',
      content: isAr ? 'اكتب نصك هنا أو الصقه...' : isEn ? 'Write or paste your text here...' : 'Écrivez ou collez votre texte ici...',
      category: 'custom',
      language: settings.lang,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setScripts([newScript, ...scripts]);
    setCurrentScript(newScript);
    setEditTitle(newScript.title);
    setEditContent(newScript.content);
    setEditCategory(newScript.category);
    setEditLang(newScript.language);
    setIsEditing(true);
  };

  const handleSelectScript = (script: Script) => {
    setCurrentScript(script);
    setEditTitle(script.title);
    setEditContent(script.content);
    setEditCategory(script.category);
    setEditLang(script.language);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!currentScript) return;
    const updated: Script = {
      ...currentScript,
      title: editTitle,
      content: editContent,
      category: editCategory,
      language: editLang,
      updatedAt: Date.now(),
    };
    const newScripts = scripts.map((s) => (s.id === updated.id ? updated : s));
    setScripts(newScripts);
    localStorage.setItem('vox_scripts', JSON.stringify(newScripts));
    setCurrentScript(updated);
    setIsEditing(false);
  };

  const handleDeleteScript = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = scripts.filter((s) => s.id !== id);
    setScripts(remaining);
    localStorage.setItem('vox_scripts', JSON.stringify(remaining));
    if (currentScript?.id === id) {
      setCurrentScript(remaining[0] || null);
    }
    setDeletingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const newScript: Script = {
          id: 'script-' + Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: text,
          category: 'custom',
          language: settings.lang,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const updated = [newScript, ...scripts];
        setScripts(updated);
        localStorage.setItem('vox_scripts', JSON.stringify(updated));
        setCurrentScript(newScript);
        handleSelectScript(newScript);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isAr ? 'إدارة النصوص والسيناريوهات' : isEn ? 'Script Management' : 'Gestion des Scripts'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? 'أنشئ، عدل، أو ارفع نصوصك لتستخدمها مباشرة في شاشة القراءة.' : isEn ? 'Create, edit, or import scripts for your prompter.' : 'Créez, éditez ou importez vos textes.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-sm">
            <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{isAr ? 'رفع ملف (.txt)' : isEn ? 'Import (.txt)' : 'Importer (.txt)'}</span>
            <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleNewScript}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'نص جديد' : isEn ? 'New Script' : 'Nouveau'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Scripts List Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col h-[700px]">
          
          <div className="relative mb-4">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={isAr ? 'بحث في النصوص...' : isEn ? 'Search scripts...' : 'Rechercher...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            {['all', 'podcast', 'news', 'story', 'lecture', 'commercial', 'custom'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? (isAr ? 'الكل' : isEn ? 'All' : 'Tous') : cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredScripts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                {isAr ? 'لا توجد نصوص مطابقة' : isEn ? 'No scripts found' : 'Aucun script'}
              </div>
            ) : (
              filteredScripts.map((script) => {
                const isSelected = currentScript?.id === script.id;
                const isConfirmingDelete = deletingId === script.id;

                return (
                  <div
                    key={script.id}
                    onClick={() => handleSelectScript(script)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 relative overflow-hidden ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {isConfirmingDelete && (
                      <div
                        className="absolute inset-0 bg-red-950/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-2 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-[11px] font-bold text-white mb-2">
                          {isAr ? 'حذف هذا النص؟' : isEn ? 'Delete script?' : 'Supprimer ?'}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleDeleteScript(script.id, e)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                          >
                            {isAr ? 'نعم' : isEn ? 'Yes' : 'Oui'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(null);
                            }}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px] font-bold"
                          >
                            {isAr ? 'إلغاء' : isEn ? 'No' : 'Non'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 uppercase">
                          {script.category}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {script.language}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {script.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {script.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(script.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title={isAr ? 'حذف' : isEn ? 'Delete' : 'Supprimer'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Script Detail & Editor */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-[700px]">
          {currentScript ? (
            <div className="flex flex-col h-full">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 gap-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 text-lg font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 uppercase">
                        {currentScript.category}
                      </span>
                      <span className="text-xs text-slate-400 uppercase font-mono font-medium">
                        {currentScript.language}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {currentScript.title}
                    </h2>
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 transition-all shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isAr ? 'حفظ التعديلات' : isEn ? 'Save' : 'Enregistrer'}</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>{isAr ? 'إلغاء' : isEn ? 'Cancel' : 'Annuler'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{isAr ? 'تعديل' : isEn ? 'Edit' : 'Éditer'}</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('teleprompter')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-all shadow-md"
                      >
                        <Play className="w-4 h-4" />
                        <span>{isAr ? 'بدء القراءة والتسجيل' : isEn ? 'Record & Read' : 'Lancer'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col mt-2">
                {isEditing ? (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          {isAr ? 'التصنيف' : isEn ? 'Category' : 'Catégorie'}
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as any)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                        >
                          <option value="podcast">Podcast</option>
                          <option value="news">News</option>
                          <option value="story">Story</option>
                          <option value="lecture">Lecture</option>
                          <option value="commercial">Commercial</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          {isAr ? 'اللغة' : isEn ? 'Language' : 'Langue'}
                        </label>
                        <select
                          value={editLang}
                          onChange={(e) => setEditLang(e.target.value as any)}
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                        >
                          <option value="ar">العربية (Arabic)</option>
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        {isAr ? 'نص السيناريو' : isEn ? 'Script Content' : 'Contenu'}
                      </label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
                        placeholder={isAr ? 'اكتب أو ألصق النص هنا...' : isEn ? 'Write or paste text here...' : 'Écrivez ici...'}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                      {currentScript.content}
                    </p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'لم تقم بتحديد أي نص' : isEn ? 'No script selected' : 'Aucun script sélectionné'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                {isAr ? 'اختر نصاً من القائمة الجانبية أو قم بإنشاء نص جديد.' : isEn ? 'Choose a script from the sidebar or create a new one.' : 'Choisissez un script.'}
              </p>
              <button
                onClick={handleNewScript}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-all"
              >
                {isAr ? 'إنشاء نص جديد' : isEn ? 'Create Script' : 'Créer'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
