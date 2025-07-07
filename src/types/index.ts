export type UserRole = 'employee' | 'manager' | 'director' | 'pole_director';

export type EmotionType = 'happy' | 'sad' | 'neutral' | 'stressed' | 'excited' | 'tired';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId?: string;
  directorId?: string;
  poleDirectorId?: string;
  avatar?: string;
}

export interface EmotionEntry {
  id: string;
  userId: string;
  date: string;
  period: 'morning' | 'evening';
  emotion: EmotionType;
  comment?: string;
  timestamp: number;
}

export interface Department {
  id: string;
  name: string;
  directorId: string;
  poleDirectorId?: string;
}

export interface EmotionStats {
  total: number;
  happy: number;
  sad: number;
  neutral: number;
  stressed: number;
  excited: number;
  tired: number;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'consecutive_negative' | 'low_team_morale';
  message: string;
  date: string;
  resolved: boolean;
}