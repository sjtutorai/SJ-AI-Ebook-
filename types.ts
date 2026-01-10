
export type ChapterTemplate = 'introduction' | 'standard' | 'case-study' | 'tutorial' | 'summary' | 'key-takeaways';
export type ThemeMode = 'light' | 'dark' | 'system';
export type FontStyle = 'modern' | 'readable';
export type AccentColor = 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';
export type ExportFormat = 'PDF' | 'EPUB' | 'DOCX';
export type PageSize = 'A4' | 'Letter';
export type FontSize = 'Small' | 'Medium' | 'Large';
export type LineSpacing = 'Normal' | 'Wide';
export type AITone = 'Simple' | 'Academic' | 'Professional' | 'Storytelling';

export interface EbookConfig {
  title: string;
  author: string;
  genre: string;
  tone: string;
  language: string;
  chapterCount: number;
  classLevel: string;
  length: 'Short' | 'Medium' | 'Long';
  wordLimit: number;
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  content: string;
  type: ChapterTemplate;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

export interface EbookMetadata {
  isbn: string;
  publisher: string;
  keywords: string;
}

export interface ProjectSnapshot {
  timestamp: number;
  name: string;
  config: EbookConfig;
  outline: Chapter[];
  coverStyle: CoverStyle;
}

export interface EbookProject {
  id: string;
  config: EbookConfig;
  outline: Chapter[];
  coverStyle: CoverStyle;
  blurb: string;
  metadata: EbookMetadata;
  updatedAt: number;
  history: ProjectSnapshot[];
}

export interface CoverStyle {
  bgColor: string;
  textColor: string;
  layout: 'centered' | 'bottom' | 'minimal';
  fontFamily: string;
  customCoverImage?: string;
  aiGeneratedImage?: string;
  artStyle?: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  dominantColor?: string;
}

export type ViewState = 'dashboard' | 'create' | 'my-books' | 'profile' | 'settings' | 'help';
export type Step = 'setup' | 'outline' | 'writing' | 'preview';

export interface StudioSettings {
  // 2. AI Generation Settings
  aiDefaults: {
    language: string;
    tone: AITone;
    chapterCount: number;
    wordLimitPerChapter: number;
    autoTOC: boolean;
  };
  // 3. Output & Download Settings
  outputDefaults: {
    format: ExportFormat;
    pageSize: PageSize;
    fontSize: FontSize;
    lineSpacing: LineSpacing;
  };
  // 4. Appearance Settings
  appearance: {
    theme: ThemeMode;
    fontStyle: FontStyle;
    accentColor: AccentColor;
  };
  // 5. Navigation & Experience
  experience: {
    enableAnimations: boolean;
    rememberLastPage: boolean;
    quickCreateShortcut: boolean;
  };
  // 6. Notifications
  notifications: {
    genComplete: boolean;
    errorAlerts: boolean;
    announcements: boolean;
  };
  // 7. Data & Storage
  storage: {
    autoSave: boolean;
    cloudSync: boolean;
  };
}
