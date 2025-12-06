import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, FriendRequest } from '../types';
import { DatabaseService } from '../services/mockDatabase';
import { supabase } from '../services/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  pendingRequests: FriendRequest[];
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  refreshUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  pendingRequests: [],
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateProfile: () => {},
  refreshUser: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  
  const prevReqCount = useRef(0);

  // Initial Session Check with Timeout Safety
  useEffect(() => {
    let mounted = true;
    
    const initSession = async () => {
        try {
            // Create a timeout promise to prevent infinite hanging (5 seconds)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Auth check timeout')), 5000)
            );

            // Race Supabase against the timeout
            const result: any = await Promise.race([
                supabase.auth.getSession(),
                timeoutPromise
            ]).catch(err => {
                console.warn("Supabase connection issue:", err);
                return { data: { session: null } }; // Fallback to no session
            });
            
            const session = result?.data?.session;

            if (session?.user) {
                const u = await DatabaseService.getUserById(session.user.id);
                if (u && mounted) {
                    setUser(u);
                    loadRequests(u.id);
                }
            }
        } catch (error) {
            console.error("Auth init failed:", error);
        } finally {
            if (mounted) setIsLoading(false);
        }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            // Only fetch if we don't have the user or the ID changed to avoid flashing/overwriting
            if (!user || user.id !== session.user.id) {
                const u = await DatabaseService.getUserById(session.user.id);
                if(u && mounted) setUser(u);
            }
        } else {
            if (mounted) setUser(null);
        }
    });

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  const loadRequests = async (userId: string) => {
      try {
        const reqs = await DatabaseService.getPendingRequests(userId);
        setPendingRequests(reqs);
      } catch (e) {
        // Silent fail for requests
      }
  };

  // Polling for real-time updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
        try {
            // 1. Sync User Stats
            const updatedUser = await DatabaseService.getUserById(user.id);
            if (updatedUser && JSON.stringify(updatedUser.stats) !== JSON.stringify(user.stats)) {
                setUser(updatedUser);
            }

            // 2. Check Friend Requests
            const reqs = await DatabaseService.getPendingRequests(user.id);
            setPendingRequests(reqs);

            if (reqs.length > prevReqCount.current) {
                 showToast(`You have ${reqs.length} friend request(s)!`, 'info');
            }
            prevReqCount.current = reqs.length;
        } catch (e) {
            // Silent catch
        }

    }, 15000); 

    return () => clearInterval(interval);
  }, [user, showToast]);

  const refreshUser = () => {
    if (user) {
        DatabaseService.getUserById(user.id).then(updated => {
            if(updated) setUser(updated);
        });
    }
  };

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
        
        if (error || !data.user) {
            console.error("Login error:", error);
            showToast(error?.message || "Invalid credentials", "error");
            return false;
        }

        const u = await DatabaseService.getUserById(data.user.id);
        
        if (u) {
            setUser(u);
            await loadRequests(u.id);
            return true;
        } else {
            console.error("User authenticated but profile not found.");
            showToast("Profile missing. Contact support.", "error");
            await supabase.auth.signOut();
            return false;
        }
    } catch (e) {
        console.error("Login exception:", e);
        showToast("An unexpected error occurred", "error");
        return false;
    } finally {
        setIsLoading(false); 
    }
  };

  const register = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email!,
            password: data.password!,
        });

        if (authError || !authData.user) {
            console.error("Registration auth error:", authError);
            showToast(authError?.message || "Registration failed", "error");
            return false;
        }

        // 1. Create Profile in DB (Snake Case - как в базе данных)
        const dbUser = {
            id: authData.user.id,
            email: data.email,
            username: data.username,
            full_name: data.fullName,
            avatar: '',
            is_online: true,
            stats: { totalQuizzes: 0, totalScore: 0, totalQuestionsAnswered: 0, totalCorrect: 0 },
            enrolled_subjects: [],
            friends: []
        };

        const { error: profileError } = await supabase.from('profiles').insert(dbUser);

        if (profileError) {
            console.error("Profile creation error:", profileError);
            showToast("Account created but profile setup failed.", "error");
            return false;
        }
        
        // 2. Update Local State (Camel Case - как в приложении)
        // Это предотвращает белый экран при доступе к enrolledSubjects
        const localUser: User = {
            id: authData.user.id,
            email: data.email!,
            username: data.username!,
            fullName: data.fullName!, // camelCase
            avatar: '',
            isOnline: true, // camelCase
            stats: { totalQuizzes: 0, totalScore: 0, totalQuestionsAnswered: 0, totalCorrect: 0 },
            enrolledSubjects: [], // camelCase!
            friends: []
        };

        setUser(localUser);
        return true;

    } catch (e) {
        console.error("Register exception:", e);
        showToast("An unexpected error occurred", "error");
        return false;
    } finally {
        setIsLoading(false); 
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPendingRequests([]);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated); 
    await DatabaseService.updateUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, pendingRequests, login, register, logout, updateProfile, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};