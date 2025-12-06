import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Hash, BookOpen, Upload, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editNick, setEditNick] = useState(user?.username || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateProfile({ fullName: editName, username: editNick });
    setIsEditing(false);
    showToast("Profile updated successfully!", "success");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            updateProfile({ avatar: result });
            showToast("Avatar updated!", "success");
        };
        reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
      updateProfile({ avatar: '' });
      showToast("Avatar removed.", "info");
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden relative">
        <div className="h-40 bg-gradient-to-r from-blue-500 via-primary-500 to-indigo-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="px-8 pb-10 relative">
            <div className="absolute -top-20 left-8 md:left-12 group">
                <div className="w-40 h-40 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-xl">
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center overflow-hidden relative border-4 border-white dark:border-gray-800">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-5xl font-bold uppercase text-primary-300">{user.username[0]}</span>
                        )}
                        
                        {/* Avatar Overlay Controls */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm" title="Upload"
                             >
                                <Upload className="w-5 h-5" />
                             </button>
                             {user.avatar && (
                                <button 
                                    onClick={removeAvatar}
                                    className="p-2 bg-red-500/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm" title="Remove"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                             )}
                        </div>
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload} 
                />
            </div>
            
            <div className="pt-24 md:pl-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                    {isEditing ? (
                        <div className="space-y-4 max-w-sm">
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                <input 
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="block w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                             </div>
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nickname</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold">@</span>
                                    <input 
                                        value={editNick}
                                        onChange={e => setEditNick(e.target.value)}
                                        className="block w-full pl-8 pr-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{user.fullName}</h2>
                            <p className="text-lg text-primary-600 font-medium">@{user.username}</p>
                            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 bg-gray-50 dark:bg-gray-700/50 py-1 px-3 rounded-full w-max">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online Status: Active
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    {isEditing ? (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 transition-all"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-12 pt-10 border-t dark:border-gray-700">
                <div className="space-y-6">
                    <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Contact & Account Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-primary-500">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Email Address</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-purple-500">
                                <Hash className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">User ID</p>
                                <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">{user.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 md:col-span-2">
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-orange-500">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase">Enrolled Subjects</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{user.enrolledSubjects.length} Active Courses</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};