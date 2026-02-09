export type SlideType = 'cover' | 'content' | 'quiz' | 'ending';

export type QuizType = 'tap' | 'drag' | 'count';

export interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
  rewardMessage: string;
}

export interface Slide {
  id: string;
  type: SlideType;
  title?: string; // Large text
  content?: string; // Subtitle or main text
  speakerNotes?: string; // For TTS or teacher script
  imagePrompt: string;
  imageUrl?: string; // URL from Nano Banana
  isLoadingImage?: boolean;
  quiz?: QuizData;
}

export interface TeacherProfile {
  grades: string[];
  language: 'English' | 'Cantonese' | 'Mandarin';
  style: 'cartoon' | 'realistic' | 'storybook';
}

export interface Lesson {
  id: string;
  topic: string;
  slides: Slide[];
}

export enum AppStage {
  ONBOARDING = 'ONBOARDING',
  TOPIC_INPUT = 'TOPIC_INPUT',
  GENERATING_DRAFT = 'GENERATING_DRAFT',
  EDITOR = 'EDITOR',
  GENERATING_FINAL = 'GENERATING_FINAL',
  PLAYER = 'PLAYER',
}