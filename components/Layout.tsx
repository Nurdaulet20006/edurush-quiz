import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Users, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout, pendingRequests } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/results', icon: Trophy, label: 'My Results' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/friends', icon: Users, label: 'Friends', badge: pendingRequests.length },
    { to: '/profile', icon: UserIcon, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm z-20">
        <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">EduRush</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out border-r border-gray-100 dark:border-gray-700
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 hidden md:block">
            <h1 className="text-2xl font-extrabold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
              <BookOpen className="w-8 h-8 text-primary-600" />
              EduRush
            </h1>
          </div>

          <div className="p-4 border-b dark:border-gray-700 md:hidden bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt="av" className="w-full h-full object-cover"/> : user?.username[0]}
                 </div>
                 <div>
                    <p className="font-semibold text-sm">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">@{user?.username}</p>
                 </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'}
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${item.to === location.pathname ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.label}
                {item.badge ? (
                    <span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                        {item.badge}
                    </span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t dark:border-gray-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-60px)] md:h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
