import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/mockDatabase';
import { QuizResult, Difficulty } from '../types';
import { Trophy, Filter, Swords } from 'lucide-react';

export const MyResults: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  useEffect(() => {
    if (user) {
        const load = async () => {
            const data = await DatabaseService.getUserResults(user.id);
            setResults(data);
        };
        load();
    }
  }, [user]);

  const filteredResults = results.filter(r => 
    filterDifficulty === 'all' || r.difficulty === filterDifficulty
  );

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">History & Results</h1>
        
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-700">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            <select 
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="bg-transparent text-sm font-medium py-1 px-2 outline-none cursor-pointer"
            >
                <option value="all">All Levels</option>
                <option value={Difficulty.Easy}>Easy</option>
                <option value={Difficulty.Medium}>Medium</option>
                <option value={Difficulty.Hard}>Hard</option>
            </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredResults.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No quiz results found.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-sm uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Difficulty</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Accuracy</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredResults.map((res) => {
                            const accuracy = Math.round((res.correctCount / res.totalQuestions) * 100);
                            return (
                                <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 dark:text-white flex flex-col">
                                            {res.subjectName || res.subjectId}
                                            {res.isDuel && (
                                                <span className="text-[10px] uppercase font-bold text-orange-500 flex items-center gap-1">
                                                    <Swords className="w-3 h-3" /> Duel vs {res.opponentName}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${res.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                                              res.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {res.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-primary-600">
                                        {res.score}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-500" style={{ width: `${accuracy}%` }} />
                                            </div>
                                            <span className="text-xs font-medium">{accuracy}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(res.date)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};