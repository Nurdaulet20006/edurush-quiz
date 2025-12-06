import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/mockDatabase';
import { Trophy, Clock, CheckCircle, Zap, BookOpen, Play, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { SubjectIcon } from '../components/SubjectIcon';

export const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    refreshUser();
  }, []); 

  // Derived Stats
  const totalCorrect = user?.stats.totalCorrect || 0;
  const totalQuestions = user?.stats.totalQuestionsAnswered || 0;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  
  const allSubjects = DatabaseService.getSubjects();
  const enrolledSubjects = allSubjects.filter(s => user?.enrolledSubjects.includes(s.id));

  const handleStartQuizClick = () => {
    if (enrolledSubjects.length === 0) {
        showToast("You haven't enrolled in any subjects yet!", "error");
        navigate('/subjects');
        return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">
                    Hello, {user?.username}!
                </h1>
                <p className="text-primary-100 text-lg md:text-xl font-medium max-w-xl">
                    Ready to crush your goals today? You're on a roll with <span className="text-white font-bold">{user?.stats.totalQuizzes} quizzes</span> completed.
                </p>
                <button 
                    onClick={handleStartQuizClick}
                    className="mt-8 bg-white text-primary-700 px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-lg flex items-center gap-3 transform hover:-translate-y-1 active:scale-95"
                >
                    <Play className="w-5 h-5 fill-current" />
                    Start New Quiz
                </button>
            </div>
            <div className="hidden md:block">
                 <Trophy className="w-32 h-32 text-yellow-300 opacity-80 drop-shadow-lg" />
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Quizzes Done', value: user?.stats.totalQuizzes, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Total Points', value: user?.stats.totalScore, icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Accuracy', value: `${accuracy}%`, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Questions', value: totalQuestions, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} shadow-inner`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subjects Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary-600" /> Your Subjects
            </h2>
            <button 
                onClick={() => navigate('/subjects')} 
                className="text-primary-600 font-bold text-sm bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
            >
                Manage Subjects
            </button>
        </div>
        
        {enrolledSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledSubjects.slice(0, 3).map(sub => (
                    <div 
                        key={sub.id} 
                        onClick={() => navigate(`/quiz-setup/${sub.id}`)}
                        className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all cursor-pointer relative overflow-hidden"
                    >
                         <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                        
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary-50 dark:bg-gray-700 text-primary-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <SubjectIcon iconName={sub.icon} className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-primary-600 transition-colors">{sub.name}</h3>
                                <p className="text-xs text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full inline-block mt-1">{sub.category || 'General'}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm font-bold text-primary-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            Take Quiz <Play className="w-4 h-4 ml-1 fill-current" />
                        </div>
                    </div>
                ))}
                 <div 
                    onClick={() => navigate('/subjects')}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all min-h-[140px]"
                 >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                        <Plus className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="font-bold text-gray-500 dark:text-gray-400">Enroll in more</span>
                </div>
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-20 h-20 bg-primary-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-400">
                    <BookOpen className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">No subjects enrolled</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">You need to add subjects to your profile before you can take quizzes.</p>
                <button 
                    onClick={() => navigate('/subjects')}
                    className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
                >
                    Browse Catalog
                </button>
            </div>
        )}
      </div>

      {/* Quiz Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border dark:border-gray-700 transform animate-scale-in">
                <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-2xl font-bold">Select Subject</h2>
                    <p className="text-gray-500">Choose a subject to start your quiz.</p>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                        {enrolledSubjects.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => navigate(`/quiz-setup/${sub.id}`)}
                                className="w-full flex items-center p-4 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 text-left group"
                            >
                                <div className="w-12 h-12 bg-white dark:bg-gray-700 text-primary-600 rounded-xl flex items-center justify-center mr-4 shadow-sm border dark:border-gray-600">
                                    <SubjectIcon iconName={sub.icon} className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg group-hover:text-primary-700 dark:group-hover:text-primary-400">{sub.name}</h3>
                                    <p className="text-xs text-gray-500">{sub.category}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                    <Play className="w-4 h-4 text-primary-600 ml-0.5" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
