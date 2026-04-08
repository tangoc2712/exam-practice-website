export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Question {
  explanation?: string;
  id: string;
  domain: string;
  text: string;
  type: 'single' | 'multiple';
  options: Option[];
  hint: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface ExamIndexEntry {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  file: string;
}
