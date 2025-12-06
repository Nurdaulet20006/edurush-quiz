import { supabase } from './supabase';
import { Subject, Question, User, QuizResult, Difficulty, FriendRequest, DuelSession } from '../types';

const INITIAL_SUBJECTS: Subject[] = [
  { id: 'math_lit', name: 'Mathematical Literacy', icon: 'Calculator', description: 'Applied mathematics in real world contexts.', category: 'Science' },
  { id: 'read_lit', name: 'Reading Literacy', icon: 'BookOpen', description: 'Understanding and analyzing texts.', category: 'Languages' },
  { id: 'math', name: 'Mathematics', icon: 'Sigma', description: 'Algebra, geometry, and calculus.', category: 'Science' },
  { id: 'hist_kaz', name: 'History of Kazakhstan', icon: 'Flag', description: 'Historical events of Kazakhstan.', category: 'Humanities' },
  { id: 'hist_world', name: 'World History', icon: 'Globe', description: 'Global historical events and eras.', category: 'Humanities' },
  { id: 'geo', name: 'Geography', icon: 'Map', description: 'Physical and human geography.', category: 'Science' },
  { id: 'phys', name: 'Physics', icon: 'Atom', description: 'Matter, energy, and forces.', category: 'Science' },
  { id: 'chem', name: 'Chemistry', icon: 'FlaskConical', description: 'Substances and their properties.', category: 'Science' },
  { id: 'bio', name: 'Biology', icon: 'Dna', description: 'Study of living organisms.', category: 'Science' },
  { id: 'lang_eng', name: 'English Language', icon: 'Languages', description: 'Grammar, vocabulary and comprehension.', category: 'Languages' },
];

const generateQuestions = (subjectId: string, count: number, diff?: Difficulty): Question[] => {
  const difficulties = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard];
  const questions: Question[] = [];
  
  for (let i = 0; i < count; i++) {
    const d = diff || difficulties[i % 3];
    questions.push({
      id: `${subjectId}_q_${i}_${Date.now()}_${Math.random()}`,
      subjectId,
      difficulty: d,
      text: `Sample Question ${i + 1} for ${subjectId} (${d})?`,
      options: ['Correct Answer', 'Wrong Option A', 'Wrong Option B', 'Wrong Option C'].sort(() => Math.random() - 0.5),
      correctAnswer: 'Correct Answer',
      explanation: 'Generated question explanation.'
    });
  }
  return questions;
};

export const DatabaseService = {
  getSubjects: (): Subject[] => INITIAL_SUBJECTS,

  getUsers: async (): Promise<User[]> => {
    const { data } = await supabase.from('profiles').select('*');
    if (!data) return [];
    
    return data.map((p: any) => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        username: p.username,
        avatar: p.avatar,
        enrolledSubjects: p.enrolled_subjects || [],
        friends: p.friends || [],
        isOnline: p.is_online,
        stats: p.stats || { totalQuizzes: 0, totalScore: 0, totalQuestionsAnswered: 0, totalCorrect: 0 }
    }));
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
        
        if (error) {
            console.error("Error fetching user:", error);
            return undefined;
        }
        if (!data) return undefined;

        return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            username: data.username,
            avatar: data.avatar,
            enrolledSubjects: data.enrolled_subjects || [],
            friends: data.friends || [],
            isOnline: data.is_online,
            stats: data.stats || { totalQuizzes: 0, totalScore: 0, totalQuestionsAnswered: 0, totalCorrect: 0 }
        };
    } catch (e) {
        console.error("Unexpected DB error:", e);
        return undefined;
    }
  },

  updateUser: async (user: User) => {
    const updateData = {
        full_name: user.fullName,
        username: user.username,
        avatar: user.avatar,
        enrolled_subjects: user.enrolledSubjects,
        friends: user.friends,
        is_online: user.isOnline,
        stats: user.stats
    };
    await supabase.from('profiles').update(updateData).eq('id', user.id);
  },

  enrollSubject: async (userId: string, subjectId: string) => {
    const user = await DatabaseService.getUserById(userId);
    if (user && !user.enrolledSubjects.includes(subjectId)) {
      user.enrolledSubjects.push(subjectId);
      await DatabaseService.updateUser(user);
    }
  },

  unenrollSubject: async (userId: string, subjectId: string) => {
    const user = await DatabaseService.getUserById(userId);
    if (user) {
      user.enrolledSubjects = user.enrolledSubjects.filter(id => id !== subjectId);
      await DatabaseService.updateUser(user);
    }
  },

  getQuestions: async (subjectId: string, difficulty: Difficulty, count: number): Promise<Question[]> => {
    return new Promise((resolve) => {
      const questions = generateQuestions(subjectId, count, difficulty);
      setTimeout(() => resolve(questions), 400); 
    });
  },

  saveResult: async (result: QuizResult) => {
    await supabase.from('results').insert({
        user_id: result.userId,
        subject_id: result.subjectId,
        difficulty: result.difficulty,
        score: result.score,
        correct_count: result.correctCount,
        incorrect_count: result.incorrectCount,
        total_questions: result.totalQuestions
    });

    const user = await DatabaseService.getUserById(result.userId);
    if (user) {
        user.stats.totalQuizzes += 1;
        user.stats.totalQuestionsAnswered += result.totalQuestions;
        user.stats.totalCorrect += result.correctCount;
        user.stats.totalScore += result.score;
        await DatabaseService.updateUser(user);
    }
  },
  
  getUserResults: async (userId: string): Promise<QuizResult[]> => {
    const { data } = await supabase.from('results').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!data) return [];
    
    return data.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        subjectId: r.subject_id,
        difficulty: r.difficulty,
        score: r.score,
        totalQuestions: r.total_questions,
        correctCount: r.correct_count,
        incorrectCount: r.incorrect_count,
        date: r.created_at,
        timeSpentSeconds: 0
    }));
  },

  sendFriendRequest: async (fromId: string, toId: string) => {
    await supabase.from('friend_requests').insert({ from_user_id: fromId, to_user_id: toId, status: 'pending' });
  },

  getPendingRequests: async (userId: string): Promise<FriendRequest[]> => {
    const { data } = await supabase.from('friend_requests').select('*').eq('to_user_id', userId).eq('status', 'pending');
    if (!data) return [];
    return data.map((r: any) => ({ id: r.id, fromUserId: r.from_user_id, toUserId: r.to_user_id, status: r.status }));
  },

  acceptFriendRequest: async (requestId: string) => {
    const { data: req } = await supabase.from('friend_requests').select('*').eq('id', requestId).single();
    if (!req) return;

    await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);

    const user1 = await DatabaseService.getUserById(req.from_user_id);
    const user2 = await DatabaseService.getUserById(req.to_user_id);

    if (user1 && user2) {
        if (!user1.friends.includes(user2.id)) user1.friends.push(user2.id);
        if (!user2.friends.includes(user1.id)) user2.friends.push(user1.id);
        await DatabaseService.updateUser(user1);
        await DatabaseService.updateUser(user2);
    }
  },

  rejectFriendRequest: async (requestId: string) => {
    await supabase.from('friend_requests').delete().eq('id', requestId);
  },
  
  getFriends: async (userId: string): Promise<User[]> => {
    const user = await DatabaseService.getUserById(userId);
    if (!user || !user.friends.length) return [];
    
    const { data } = await supabase.from('profiles').select('*').in('id', user.friends);
    if (!data) return [];

    return data.map((p: any) => ({
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        username: p.username,
        avatar: p.avatar,
        enrolledSubjects: p.enrolled_subjects || [],
        friends: p.friends || [],
        isOnline: p.is_online,
        stats: p.stats
    }));
  },

  createDuelSession: async (p1Id: string, p2Id: string, subjectId: string, count: number): Promise<DuelSession> => {
    const questions = generateQuestions(subjectId, count, Difficulty.Medium); 
    const { data, error } = await supabase.from('duels').insert({
        player1_id: p1Id, player2_id: p2Id, subject_id: subjectId, difficulty: Difficulty.Medium,
        question_count: count, questions: questions, p1_status: 'pending', p2_status: 'pending', status: 'pending'
    }).select().single();

    if (error || !data) throw new Error("Failed to create duel");

    return {
        id: data.id, player1Id: data.player1_id, player2Id: data.player2_id, subjectId: data.subject_id,
        difficulty: data.difficulty as Difficulty, questionCount: data.question_count, questions: data.questions,
        p1Score: data.p1_score, p2Score: data.p2_score, p1Status: data.p1_status, p2Status: data.p2_status,
        status: data.status, winnerId: data.winner_id, createdAt: new Date(data.created_at).getTime()
    };
  },

  getDuelSession: async (duelId: string): Promise<DuelSession | undefined> => {
    const { data } = await supabase.from('duels').select('*').eq('id', duelId).single();
    if (!data) return undefined;
    return {
        id: data.id, player1Id: data.player1_id, player2Id: data.player2_id, subjectId: data.subject_id,
        difficulty: data.difficulty as Difficulty, questionCount: data.question_count, questions: data.questions,
        p1Score: data.p1_score, p2Score: data.p2_score, p1Status: data.p1_status, p2Status: data.p2_status,
        status: data.status, winnerId: data.winner_id, createdAt: new Date(data.created_at).getTime()
    };
  },

  acceptDuelInvite: async (duelId: string) => {
    await supabase.from('duels').update({ status: 'active' }).eq('id', duelId);
  },

  rejectDuelInvite: async (duelId: string) => {
    await supabase.from('duels').update({ status: 'rejected' }).eq('id', duelId);
  },

  getIncomingDuels: async (userId: string): Promise<DuelSession[]> => {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data } = await supabase.from('duels').select('*')
        .eq('player2_id', userId).eq('status', 'pending').gt('created_at', oneHourAgo);
    if (!data) return [];
    return data.map((d: any) => ({
        id: d.id, player1Id: d.player1_id, player2Id: d.player2_id, subjectId: d.subject_id,
        difficulty: d.difficulty as Difficulty, questionCount: d.question_count, questions: d.questions,
        p1Score: d.p1_score, p2Score: d.p2_score, p1Status: d.p1_status, p2Status: d.p2_status,
        status: d.status, winnerId: d.winner_id, createdAt: new Date(d.created_at).getTime()
    }));
  },

  updateDuelScore: async (duelId: string, userId: string, score: number) => {
    const session = await DatabaseService.getDuelSession(duelId);
    if (!session) return;

    let updateData: any = {};
    if (session.player1Id === userId) {
        updateData.p1_score = score;
        updateData.p1_status = 'finished';
    } else {
        updateData.p2_score = score;
        updateData.p2_status = 'finished';
    }

    const isP1 = session.player1Id === userId;
    const p1Done = isP1 ? true : session.p1Status === 'finished';
    const p2Done = !isP1 ? true : session.p2Status === 'finished';
    const p1Score = isP1 ? score : session.p1Score || 0;
    const p2Score = !isP1 ? score : session.p2Score || 0;

    if (p1Done && p2Done) {
        updateData.status = 'finished';
        if (p1Score > p2Score) updateData.winner_id = session.player1Id;
        else if (p2Score > p1Score) updateData.winner_id = session.player2Id;
        else updateData.winner_id = 'draw';
    }

    await supabase.from('duels').update(updateData).eq('id', duelId);
  }
};