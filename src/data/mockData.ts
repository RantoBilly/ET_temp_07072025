import { User, EmotionEntry, Department, EmotionType } from '../types';

// Mock users data
export const mockUsers: User[] = [
  // Employees
  { id: '1', name: 'Marie Dupont', email: 'marie.dupont@company.com', role: 'employee', department: 'Marketing', managerId: '5' },
  { id: '2', name: 'Jean Martin', email: 'jean.martin@company.com', role: 'employee', department: 'IT', managerId: '6' },
  { id: '3', name: 'Sophie Bernard', email: 'sophie.bernard@company.com', role: 'employee', department: 'RH', managerId: '7' },
  { id: '4', name: 'Pierre Moreau', email: 'pierre.moreau@company.com', role: 'employee', department: 'Finance', managerId: '8' },
  
  // Managers
  { id: '5', name: 'Claire Rousseau', email: 'claire.rousseau@company.com', role: 'manager', department: 'Marketing', directorId: '9' },
  { id: '6', name: 'Thomas Leroy', email: 'thomas.leroy@company.com', role: 'manager', department: 'IT', directorId: '10' },
  { id: '7', name: 'Anne Dubois', email: 'anne.dubois@company.com', role: 'manager', department: 'RH', directorId: '11' },
  { id: '8', name: 'Michel Garnier', email: 'michel.garnier@company.com', role: 'manager', department: 'Finance', directorId: '12' },
  
  // Directors
  { id: '9', name: 'Isabelle Mercier', email: 'isabelle.mercier@company.com', role: 'director', department: 'Marketing', poleDirectorId: '13' },
  { id: '10', name: 'Laurent Blanc', email: 'laurent.blanc@company.com', role: 'director', department: 'IT', poleDirectorId: '13' },
  { id: '11', name: 'Nathalie Vincent', email: 'nathalie.vincent@company.com', role: 'director', department: 'RH', poleDirectorId: '14' },
  { id: '12', name: 'François Petit', email: 'francois.petit@company.com', role: 'director', department: 'Finance', poleDirectorId: '14' },
  
  // Pole Directors
  { id: '13', name: 'Directeur Général', email: 'dg@company.com', role: 'pole_director', department: 'Direction Générale' },
  { id: '14', name: 'Directeur Support', email: 'ds@company.com', role: 'pole_director', department: 'Direction Support' }
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'Marketing', directorId: '9', poleDirectorId: '13' },
  { id: '2', name: 'IT', directorId: '10', poleDirectorId: '13' },
  { id: '3', name: 'RH', directorId: '11', poleDirectorId: '14' },
  { id: '4', name: 'Finance', directorId: '12', poleDirectorId: '14' }
];

// Generate mock emotion entries for the last 30 days
export const generateMockEmotions = (): EmotionEntry[] => {
  const emotions: EmotionType[] = ['happy', 'sad', 'neutral', 'stressed', 'excited', 'tired'];
  const entries: EmotionEntry[] = [];
  const now = new Date();
  
  // Generate entries for each user for the last 30 days
  mockUsers.filter(user => user.role === 'employee').forEach(user => {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Morning entry
      if (Math.random() > 0.1) { // 90% chance of having morning entry
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        entries.push({
          id: `${user.id}-${dateStr}-morning`,
          userId: user.id,
          date: dateStr,
          period: 'morning',
          emotion,
          comment: Math.random() > 0.7 ? getRandomComment(emotion) : undefined,
          timestamp: date.getTime()
        });
      }
      
      // Evening entry
      if (Math.random() > 0.15) { // 85% chance of having evening entry
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        entries.push({
          id: `${user.id}-${dateStr}-evening`,
          userId: user.id,
          date: dateStr,
          period: 'evening',
          emotion,
          comment: Math.random() > 0.8 ? getRandomComment(emotion) : undefined,
          timestamp: date.getTime() + 8 * 60 * 60 * 1000 // Add 8 hours for evening
        });
      }
    }
  });
  
  return entries;
};

const getRandomComment = (emotion: EmotionType): string => {
  const comments = {
    happy: ['Très bonne journée !', 'Projet terminé avec succès', 'Excellente ambiance d\'équipe'],
    sad: ['Journée difficile', 'Problèmes personnels', 'Charge de travail importante'],
    neutral: ['Journée normale', 'Rien de particulier', 'Routine habituelle'],
    stressed: ['Délais serrés', 'Beaucoup de pression', 'Trop de réunions'],
    excited: ['Nouveau projet passionnant !', 'Bonne nouvelle !', 'Formation intéressante'],
    tired: ['Manque de sommeil', 'Journée chargée', 'Besoin de repos']
  };
  
  const emotionComments = comments[emotion];
  return emotionComments[Math.floor(Math.random() * emotionComments.length)];
};

export const mockEmotions = generateMockEmotions();