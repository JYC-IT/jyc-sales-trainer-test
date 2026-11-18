export type Mode = 
  | 'Inicio' 
  | 'Live Call Simulation' 
  | 'History' 
  | 'Real Call Audit' 
  | 'Coach' 
  | 'Admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'trainee' | 'admin';
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface HistoryItem {
  id: string;
  userId?: string;
  userName?: string;
  date: string;
  timestamp?: number;
  type: 'Live Call' | 'Audio Upload';
  contactName: string;
  companyName: string;
  score: number;
  evaluation: any;
  hasAudio?: boolean;
  conversationId?: string;
  audioUrl?: string;
  difficulty?: 'friendly' | 'challenging' | 'hardcore' | string;
  durationSeconds?: number;
  xpEarned?: number;
  levelStage?: 'facil' | 'medio' | 'dificil' | 'jefe_final' | string;
  industry?: string;
}
