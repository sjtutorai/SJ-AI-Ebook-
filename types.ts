
export interface EbookConfig {
  title: string;
  author: string;
  genre: string;
  tone: string;
  language: string;
  chapterCount: number;
  classLevel: string;
  length: 'Short' | 'Medium' | 'Long';
}

export interface Chapter {
  id: string;
  title: string;
  summary: string;
  content: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

export interface EbookMetadata {
  isbn: string;
  publisher: string;
  keywords: string;
}

export interface EbookProject {
  id: string;
  config: EbookConfig;
  outline: Chapter[];
  coverStyle: CoverStyle;
  blurb: string;
  metadata: EbookMetadata;
}

export interface CoverStyle {
  bgColor: string;
  textColor: string;
  layout: 'centered' | 'bottom' | 'minimal';
  fontFamily: 'font-serif' | 'font-sans' | 'font-mono';
  customCoverImage?: string;
  aiGeneratedImage?: string;
}

export type Step = 'setup' | 'outline' | 'writing' | 'preview';
