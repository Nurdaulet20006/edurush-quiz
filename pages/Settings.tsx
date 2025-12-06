import React, { useState } from 'react';
import { Bell, Globe, Lock, Shield } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Settings: React.FC = () => {
  const { showToast } = useToast();
  const [language, setLanguage] = useState('English (United States)');
  const [reminder, setReminder] = useState(true);

  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setReminder(checked);
    if (checked) {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showToast("Notifications enabled!", "success");
                } else {
                    showToast("Notification permission denied.", "error");
                    setReminder(false);
                }
            });
        }
    } else {
        showToast("Notifications disabled.", "info");
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLanguage(e.target.value);
      showToast(`Language set to ${e.target.value}`, "success");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y dark:divide-gray-700">
        
        {/* Notifications */}
        <div className="p-6">
             <h2 className="text-lg font-bold mb-4">Notifications</h2>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Bell className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="font-medium">Quiz Reminders</p>
                            <p className="text-sm text-gray-500">Get notified to keep your streak</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={reminder} onChange={handleReminderChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                </div>
             </div>
        </div>

        {/* Language */}
        <div className="p-6">
             <h2 className="text-lg font-bold mb-4">Language & Region</h2>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="font-medium">App Language</p>
                        <p className="text-sm text-gray-500">{language}</p>
                    </div>
                </div>
                <select 
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option>English (United States)</option>
                    <option>Russian (Русский)</option>
                </select>
             </div>
        </div>

        {/* Security */}
        <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Privacy & Security</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <Lock className="w-5 h-5 text-gray-400" />
                        <span>Change Password</span>
                    </div>
                    <span className="text-xs text-primary-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Update</span>
                </div>
                <div className="flex items-center justify-between group cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span>Two-Factor Authentication</span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Coming Soon</span>
                </div>
            </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400">Settings are saved automatically.</div>
    </div>
  );
};