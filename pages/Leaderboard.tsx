import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/mockDatabase';
import { Trophy } from 'lucide-react';
import { User } from '../types';

export const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'score' | 'quizzes'>('score');

  useEffect(() => {
      // Async fetch
      const load = async () => {
          const data = await DatabaseService.getUsers();
          setUsers(data);
      };
      load();
  }, []);

  const sortedUsers = [...users].sort((a, b) => {
    if (filter === 'score') return b.stats.totalScore - a.stats.totalScore;
    return b.stats.totalQuizzes - a.stats.totalQuizzes;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="text-yellow-500" /> Leaderboard
        </h1>
        
        <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border dark:border-gray-700">
            <button 
                onClick={() => setFilter('score')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'score' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-500'}`}
            >
                Highest Score
            </button>
            <button 
                onClick={() => setFilter('quizzes')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'quizzes' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300' : 'text-gray-500'}`}
            >
                Most Active
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">Rank</th>
              <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">User</th>
              <th className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400 text-right">
                {filter === 'score' ? 'Total Score' : 'Quizzes Completed'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {sortedUsers.map((u, index) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4">
                  {index < 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                        {index + 1}
                    </div>
                  ) : (
                    <span className="ml-3 font-mono text-gray-500">{index + 1}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-primary-600 overflow-hidden">
                         {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.username[0]}
                    </div>
                    <div>
                        <p className="font-semibold">{u.username}</p>
                        <p className="text-xs text-gray-400">{u.stats.totalCorrect} Correct Answers</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-lg">
                    {filter === 'score' ? u.stats.totalScore : u.stats.totalQuizzes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};