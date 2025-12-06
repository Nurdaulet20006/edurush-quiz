export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface Subject {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  category?: string;
}

export interface Question {
  id: string;
  subjectId: string;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  username: string;
  avatar?: string;
  enrolledSubjects: string[];
  stats: {
    totalQuizzes: number;
    totalScore: number;
    totalQuestionsAnswered: number;
    totalCorrect: number;
  };
  isOnline: boolean;
  friends: string[];
}

export interface QuizResult {
  id: string;
  userId: string;
  subjectId: string;
  subjectName?: string;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  date: string;
  timeSpentSeconds: number;
  correctCount: number;
  incorrectCount: number;
  isDuel?: boolean;
  opponentName?: string;
  isWinner?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface DuelSession {
  id: string;
  player1Id: string;
  player2Id: string;
  subjectId: string;
  difficulty: Difficulty;
  questionCount: number;
  questions: Question[]; 
  p1Score?: number;
  p2Score?: number;
  p1Status: 'pending' | 'finished';
  p2Status: 'pending' | 'finished';
  status: 'pending' | 'active' | 'rejected' | 'finished'; // New field for invite handshake
  winnerId?: string;
  createdAt: number;
}
