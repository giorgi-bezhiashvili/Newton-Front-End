export interface FormulaData {
  _id: string;
  topic: string;
  equation: string | string[];
  grade: number;
  url?: string;
  urlName?: string;
}

export interface QuizData {
  _id: string;
  topic: string;
  assignment: string;
  answers: string[];
  grade: number;
  realAnswer?: string;
  explanation?: string;    
  url?: string;
  urlName?: string;
}

export interface ProjectData {
  _id: string;
  topic: string;
  description: string;
  projectAuthor?: string;
  grade: number;
  url?: string;
  urlName?: string;
}