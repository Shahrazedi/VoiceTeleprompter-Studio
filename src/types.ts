export interface Script {
  id: string;
  title: string;
  content: string;
  category: 'podcast' | 'news' | 'story' | 'lecture' | 'commercial' | 'custom';
  language: 'ar' | 'fr' | 'en';
  createdAt: number;
  updatedAt: number;
}

export interface Recording {
  id: string;
  scriptId?: string;
  scriptTitle: string;
  audioUrl: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  createdAt: number;
  format: string;
  mimeType: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  lang: 'ar' | 'fr' | 'en';
  fontSize: number; // 24 to 72 px
  scrollSpeed: number; // 1 to 10
  mirrorMode: boolean;
  countdown: number; // 0, 3, 5 seconds
  fontFamily: 'sans' | 'serif' | 'mono';
  marginWidth: 'narrow' | 'normal' | 'wide';
}
