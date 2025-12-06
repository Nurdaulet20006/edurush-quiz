import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    nickname: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        let success = false;
        if (isLogin) {
          success = await login(formData.email, formData.password);
          if (!success) {
            // Error is handled by showToast in AuthContext, but we set local error too
            setError('Failed to sign in. Check your credentials.');
          }
        } else {
          success = await register({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            username: formData.nickname
          });
          if (!success) {
             setError('Registration failed. Email might be taken.');
          }
        }

        if (success) {
            navigate('/');
        }
    } catch (err) {
        setError('An unexpected system error occurred.');
    } finally {
        setIsLoading(false); // Stops the button spinner
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-purple-900/90 backdrop-blur-sm"></div>
      
      <div className="relative w-full max-w-5xl h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-row animate-scale-in">
         
         {/* Left Panel - Image/Brand - ALWAYS LEFT */}
         <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary-600 to-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
            
            <div className="relative z-10">
                <div className="inline-flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-3xl font-extrabold tracking-tight">EduRush</span>
                </div>
                <h2 className="text-4xl font-bold leading-tight">
                    {isLogin ? "Welcome back, Learner!" : "Join the adventure!"}
                </h2>
                <p className="mt-4 text-primary-100 text-lg">
                    {isLogin 
                        ? "Continue your journey to mastery. Your quizzes are waiting." 
                        : "Create an account to track your progress, compete in duels, and master new subjects."}
                </p>
            </div>

            <div className="relative z-10 text-sm font-medium text-primary-200">
                © 2024 EduRush Platform. All rights reserved.
            </div>
         </div>

         {/* Right Panel - Form - ALWAYS RIGHT */}
         <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-gray-800">
            <div className="max-w-md mx-auto w-full">
                <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {isLogin ? 'Sign In' : 'Create Account'}
                </h3>
                <p className="text-gray-500 mb-8">
                    {isLogin ? 'Enter your details to proceed.' : 'Fill in the form to get started.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4 animate-fade-in">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Full Name"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500">
                                    <span className="font-bold">@</span>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Nickname"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    value={formData.nickname}
                                    onChange={e => setFormData({...formData, nickname: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500">
                            <Mail className="w-5 h-5" />
                        </div>
                        <input 
                            type="email" 
                            placeholder="Email Address"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input 
                            type="password" 
                            placeholder="Password"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-center">{error}</div>}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setFormData({ email: '', password: '', fullName: '', nickname: ''});
                        }}
                        className="text-primary-600 font-bold hover:underline mt-1 transition-colors"
                    >
                        {isLogin ? "Sign up for free" : "Log in here"}
                    </button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};