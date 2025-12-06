import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { QuizPage } from './pages/Quiz';
import { Leaderboard } from './pages/Leaderboard';
import { Friends } from './pages/Friends';
import { MyResults } from './pages/MyResults';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="w-8 h-8 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="quiz-setup/:subjectId" element={<QuizPage />} />
                <Route path="results" element={<MyResults />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="friends" element={<Friends />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
