// Common types for the application

export interface User {
  id: string;
  email?: string;
  isGuest: boolean;
}

export type QuizType = 'multiple-choice' | 'true-false';

export interface Quiz {
  id: string;
  title: string;
  content: string;
  questions: Question[];
  createdAt: string;
  userId?: string;
  type: QuizType;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type: QuizType;
}

export interface StudyMaterial {
  id: string;
  type: 'pdf' | 'text' | 'url';
  content: string;
  name: string;
  uploadedAt: string;
}

export type PdfTutorPack = {
  title: string
  overview: string
  keyPoints: { point: string; evidence: string }[]
  examLikely: { question: string; answer: string; evidence: string }[]
  diagrams: { title: string; mermaid: string }[]
}

