import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DatabaseService } from '../services/mockDatabase';
import { Subject, Difficulty, Question, QuizResult, DuelSession, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { Clock, ArrowRight, Trophy, X, Crown } from 'lucide-react';
import { SubjectIcon } from '../components/SubjectIcon';

// --- Subcomponents ---

const QuizSetup: React.FC<{ 
  subject: Subject; 
  onStart: (diff: Difficulty, count: number) => void 
}> = ({ subject, onStart }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [count, setCount] = useState(5);
  const navigate = useNavigate();

  const questionCounts = [5, 10, 15, 20];

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 animate-fade-in relative overflow-hidden">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="text-center mb-10 mt-2">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
           <SubjectIcon iconName={subject.icon} />
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">Configure Quiz</h2>
        <p className="text-lg text-gray-500 font-medium">{subject.name}</p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-4">
            {Object.values(Difficulty).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-4 px-2 rounded-2xl border-2 font-bold transition-all duration-200 transform active:scale-95 ${
                  difficulty === d 
                  ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105' 
                  : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Number of Questions</label>
          <div className="grid grid-cols-4 gap-4">
             {questionCounts.map((num) => (
                <button
                    key={num}
                    onClick={() => setCount(num)}
                    className={`py-3 rounded-2xl font-bold border-2 transition-all duration-200 ${
                        count === num
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800 shadow-sm'
                        : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-gray-50'
                    }`}
                >
                    {num}
                </button>
             ))}
          </div>
        </div>

        <button 
          onClick={() => onStart(difficulty, count)}
          className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1 transition-all duration-300"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

const QuizRunner: React.FC<{
  questions: Question[];
  subject: Subject;
  onComplete: (correct: number, incorrect: number, score: number, time: number) => void;
  isDuel?: boolean;
}> = ({ questions, subject, onComplete, isDuel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());
  
  // Timer Logic
  const [timeLeft, setTimeLeft] = useState(() => {
     let baseTime = 600; 
     const diff = questions[0]?.difficulty || Difficulty.Medium;
     if (diff === Difficulty.Medium) baseTime += (questions.length * 60); 
     else if (diff === Difficulty.Hard) baseTime += (questions.length * 90); 
     else baseTime += (questions.length * 30); 

     const hardSubjects = ['math', 'phys', 'chem', 'math_lit'];
     if (hardSubjects.includes(subject.id)) {
         baseTime = Math.floor(baseTime * 1.5);
     }
     
     return baseTime;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []); 

  const handleNext = () => {
    const isCorrect = selectedOption === questions[currentIndex].correctAnswer;
    const pointsPerQuestion = 10;
    
    if (isCorrect) {
      setScore(s => s + pointsPerQuestion);
      setCorrectCount(c => c + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      finishQuiz(isCorrect);
    }
  };

  const finishQuiz = (lastCorrect = false) => {
    const pointsPerQuestion = 10;
    const finalScore = score + (lastCorrect ? pointsPerQuestion : 0);
    const finalCorrect = correctCount + (lastCorrect ? 1 : 0);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(finalCorrect, questions.length - finalCorrect, finalScore, timeSpent);
  };

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <div className="flex items-center text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
            <span className="font-mono text-lg mr-2">Q{currentIndex + 1}</span>
            <span className="text-gray-400">/ {questions.length}</span>
            </div>
            {isDuel && (
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase animate-pulse">
                    Duel Mode
                </span>
            )}
        </div>
        <div className={`flex items-center font-mono font-bold px-4 py-2 rounded-xl shadow-sm ${timeLeft < 60 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-white dark:bg-gray-800 text-orange-500'}`}>
          <Clock className="w-5 h-5 mr-2" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 mb-8 border border-gray-100 dark:border-gray-700 relative">
        <h3 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed text-gray-800 dark:text-gray-100">{currentQ.text}</h3>

        <div className="space-y-4">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(opt)}
              className={`w-full p-5 text-left rounded-2xl border-2 transition-all flex items-center group ${
                selectedOption === opt 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md transform scale-[1.01]' 
                  : 'border-gray-100 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-5 font-bold transition-colors ${
                  selectedOption === opt ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                }`}>
                  {String.fromCharCode(65 + idx)}
              </div>
              <span className={`font-medium text-lg ${selectedOption === opt ? 'text-primary-900 dark:text-primary-100' : 'text-gray-700 dark:text-gray-300'}`}>
                  {opt}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          disabled={!selectedOption}
          onClick={handleNext}
          className="bg-primary-600 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-500/30 transform hover:scale-[1.02]"
        >
          {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- Duel Result Screen ---
const DuelResultScreen: React.FC<{ 
    session: DuelSession; 
    currentUser: User; 
    onExit: () => void 
}> = ({ session, currentUser, onExit }) => {
    
    // Find who is who
    const isPlayer1 = session.player1Id === currentUser.id;
    const myScore = isPlayer1 ? session.p1Score : session.p2Score;
    const oppScore = isPlayer1 ? session.p2Score : session.p1Score;
    
    const opponentId = isPlayer1 ? session.player2Id : session.player1Id;
    const [opponent, setOpponent] = useState<User | undefined>(undefined);

    useEffect(() => {
        DatabaseService.getUserById(opponentId).then(setOpponent);
    }, [opponentId]);

    const isWinner = session.winnerId === currentUser.id;
    const isDraw = session.winnerId === 'draw';

    return (
        <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in-up relative pt-12">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <button onClick={onExit} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><X /></button>

                <div className="mb-8">
                    <h2 className="text-3xl font-black uppercase tracking-widest text-orange-500 mb-2">Duel Results</h2>
                    <p className="text-gray-500">Me vs {opponent?.username || 'Opponent'}</p>
                </div>

                <div className="flex justify-center items-end gap-8 mb-12">
                    {/* Me */}
                    <div className="flex flex-col items-center gap-2">
                         <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold overflow-hidden relative ${isWinner ? 'border-yellow-400 ring-4 ring-yellow-400/30' : 'border-gray-200'}`}>
                             {isWinner && <Crown className="w-10 h-10 text-yellow-500 absolute -top-8 z-10" />}
                             {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover"/> : currentUser.username[0]}
                         </div>
                         <span className="text-gray-700 dark:text-gray-200 font-bold mt-2">Me</span>
                         <span className="text-4xl font-black text-primary-600">{myScore}</span>
                    </div>

                    <div className="pb-16 text-2xl font-bold text-gray-300">VS</div>

                    {/* Opponent */}
                    <div className="flex flex-col items-center gap-2">
                         <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-bold overflow-hidden relative ${!isWinner && !isDraw ? 'border-yellow-400 ring-4 ring-yellow-400/30' : 'border-gray-200'}`}>
                             {!isWinner && !isDraw && <Crown className="w-10 h-10 text-yellow-500 absolute -top-8 z-10" />}
                             {opponent?.avatar ? <img src={opponent.avatar} className="w-full h-full object-cover"/> : opponent?.username?.[0] || '?'}
                         </div>
                         <span className="text-gray-700 dark:text-gray-200 font-bold mt-2">{opponent?.username || '...'}</span>
                         <span className="text-4xl font-black text-primary-600">{oppScore}</span>
                    </div>
                </div>
                
                <div className={`py-4 rounded-xl font-bold text-xl mb-6 ${isWinner ? 'bg-green-100 text-green-700' : isDraw ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>
                    {isWinner ? 'VICTORY!' : isDraw ? 'IT\'S A DRAW!' : 'DEFEAT'}
                </div>

                <button onClick={onExit} className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

const QuizSummary: React.FC<{ result: QuizResult; onRetry: () => void }> = ({ result, onRetry }) => {
  const navigate = useNavigate();
  const percentage = Math.round((result.correctCount / result.totalQuestions) * 100);

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in-up relative">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Close Button */}
        <button 
            onClick={() => navigate('/')}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors z-10"
            title="Exit to Dashboard"
        >
            <X className="w-8 h-8" />
        </button>

        <div className="w-32 h-32 bg-gradient-to-tr from-yellow-300 to-yellow-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-bounce-slow">
          <Trophy className="w-16 h-16" />
        </div>
        
        <h2 className="text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">Quiz Completed!</h2>
        <p className="text-gray-500 text-lg mb-10">You've mastered the {result.difficulty} level.</p>

        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 mb-10">
          {percentage}%
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/30">
            <p className="text-sm text-green-600 font-bold uppercase tracking-wide mb-1">Correct</p>
            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{result.correctCount}</p>
          </div>
          <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/30">
            <p className="text-sm text-red-600 font-bold uppercase tracking-wide mb-1">Incorrect</p>
            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{result.incorrectCount}</p>
          </div>
          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
            <p className="text-sm text-blue-600 font-bold uppercase tracking-wide mb-1">Score</p>
            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{result.score}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onRetry}
            className="px-8 py-4 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/results')}
            className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 transform hover:scale-105"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export const QuizPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [step, setStep] = useState<'setup' | 'loading' | 'running' | 'waiting_duel' | 'duel_summary' | 'summary'>('setup');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [duelSession, setDuelSession] = useState<DuelSession | null>(null);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const location = useLocation();
  const duelConfig = location.state as { isDuel: boolean, duelId?: string } | undefined;

  useEffect(() => {
    const subs = DatabaseService.getSubjects();
    const sub = subs.find(s => s.id === subjectId);
    if (sub) {
        setSubject(sub);
        if (duelConfig?.isDuel && duelConfig.duelId) {
             initializeDuel(duelConfig.duelId);
        }
    }
  }, [subjectId, duelConfig]);

  const initializeDuel = async (duelId: string) => {
      setStep('loading');
      const session = await DatabaseService.getDuelSession(duelId);
      if (session) {
          setDuelSession(session);
          setQuestions(session.questions);
          setStep('running');
      } else {
          console.error("Duel session not found");
          setStep('setup');
      }
  };

  const startQuiz = async (difficulty: Difficulty, count: number) => {
    setStep('loading');
    try {
      if (!subjectId) return;
      const qs = await DatabaseService.getQuestions(subjectId, difficulty, count);
      setQuestions(qs);
      setStep('running');
    } catch (e) {
      console.error(e);
      setStep('setup');
    }
  };

  const handleComplete = async (correct: number, incorrect: number, score: number, time: number) => {
    if (!user || !subject) return;
    
    // Save Result
    const newResult: QuizResult = {
      id: `res_${Date.now()}`,
      userId: user.id,
      subjectId: subject.id,
      difficulty: questions[0].difficulty,
      score,
      totalQuestions: questions.length,
      date: new Date().toISOString(),
      timeSpentSeconds: time,
      correctCount: correct,
      incorrectCount: incorrect
    };

    if (duelConfig?.isDuel && duelConfig.duelId) {
        // Handle Duel Completion
        await DatabaseService.updateDuelScore(duelConfig.duelId, user.id, score);
        newResult.isDuel = true;
        // Find opponent name
        const session = await DatabaseService.getDuelSession(duelConfig.duelId);
        if (session) {
             const oppId = session.player1Id === user.id ? session.player2Id : session.player1Id;
             const opp = await DatabaseService.getUserById(oppId);
             newResult.opponentName = opp?.username || 'Opponent';
        }

        await DatabaseService.saveResult(newResult);
        refreshUser();
        setStep('waiting_duel');
    } else {
        // Standard Completion
        await DatabaseService.saveResult(newResult);
        refreshUser();
        setResult(newResult);
        setStep('summary');
    }
  };

  // Duel Waiting Logic (Waiting for opponent to FINISH the quiz, not accept the invite)
  useEffect(() => {
      if (step === 'waiting_duel' && duelConfig?.duelId) {
          const interval = setInterval(async () => {
              const session = await DatabaseService.getDuelSession(duelConfig.duelId!);
              if (session && session.p1Status === 'finished' && session.p2Status === 'finished') {
                  setDuelSession(session);
                  setStep('duel_summary');
                  clearInterval(interval);
              }
          }, 3000); // Check every 3 seconds for less DB load
          return () => clearInterval(interval);
      }
  }, [step, duelConfig]);

  if (!subject) return <div className="p-8 text-center text-xl font-bold text-gray-500">Subject not found</div>;

  return (
    <div className="py-8">
      {step === 'loading' && (
        <div className="text-center py-40 animate-pulse">
           <div className="w-20 h-20 border-8 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
           <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">
               {duelConfig?.isDuel ? 'Connecting to Duel...' : 'Generating your quiz...'}
           </p>
        </div>
      )}
      
      {step === 'setup' && <QuizSetup subject={subject} onStart={startQuiz} />}
      
      {step === 'running' && subject && (
          <QuizRunner 
            questions={questions} 
            subject={subject}
            onComplete={handleComplete} 
            isDuel={!!duelConfig?.isDuel} 
          />
      )}
      
      {step === 'summary' && result && <QuizSummary result={result} onRetry={() => setStep('setup')} />}
      
      {step === 'waiting_duel' && (
          <div className="text-center py-40">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Clock className="w-12 h-12 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Waiting for Opponent...</h2>
              <p className="text-gray-500">Please wait while your friend finishes their questions.</p>
          </div>
      )}

      {step === 'duel_summary' && duelSession && user && (
          <DuelResultScreen 
             session={duelSession} 
             currentUser={user} 
             onExit={() => navigate('/')} 
          />
      )}
    </div>
  );
};