import React, { useState } from 'react';
import { DatabaseService } from '../services/mockDatabase';
import { Subject } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, Check, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { SubjectIcon } from '../components/SubjectIcon';

export const Subjects: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  // Subjects are still static/sync in this implementation for speed, but enrollment is async
  const [subjects] = useState<Subject[]>(DatabaseService.getSubjects());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isEnrolled = (subId: string) => user?.enrolledSubjects.includes(subId);

  const handleEnroll = async (subId: string) => {
    if (!user) return;
    await DatabaseService.enrollSubject(user.id, subId);
    refreshUser();
    showToast("Subject added successfully!", "success");
  };

  const handleUnenroll = async (subId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (window.confirm("Are you sure you want to remove this subject? Your progress might be hidden.")) {
        await DatabaseService.unenrollSubject(user.id, subId);
        refreshUser();
        showToast("Subject removed.", "info");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">Subject Catalog</h1>
            <p className="text-gray-500 mt-1">Explore and add subjects to your learning plan.</p>
        </div>
        <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search subjects..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((sub) => {
            const enrolled = isEnrolled(sub.id);
            return (
              <div 
                key={sub.id} 
                className={`
                    relative group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border transition-all duration-300
                    ${enrolled 
                        ? 'border-primary-500 ring-2 ring-primary-500/20 dark:border-primary-500 scale-[1.01]' 
                        : 'border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1'}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-colors duration-300 ${enrolled ? 'bg-primary-100 text-primary-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-500'}`}>
                        <SubjectIcon iconName={sub.icon} className="w-7 h-7" />
                    </div>
                    {enrolled && (
                        <div className="flex gap-2 animate-fade-in pointer-events-auto z-20">
                             <button 
                                onClick={(e) => handleUnenroll(sub.id, e)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Remove Subject"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                             <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 h-fit self-center shadow-sm">
                                <Check className="w-3 h-3" /> Added
                            </span>
                        </div>
                    )}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{sub.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 line-clamp-2 h-10 leading-relaxed">{sub.description}</p>
                
                {enrolled ? (
                     <div className="w-full py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-bold rounded-xl flex justify-center items-center cursor-default opacity-80">
                        Enrolled
                     </div>
                ) : (
                    <button 
                        onClick={() => handleEnroll(sub.id)}
                        className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-primary-600 dark:hover:bg-gray-200 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Add to My List
                    </button>
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
};
