import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { LogOut, Home, PlusCircle, ShieldAlert, Layers, Sun, Moon } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark' ||
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              C
            </div>
            <Link
              href="/"
              className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-700"
            >
              CampusVoice
            </Link>
          </div>

          {user && (
            <nav className="hidden md:flex items-center gap-6">
              {user.role === 'student' ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'text-indigo-600 font-semibold'
                        : 'text-slate-600 hover:text-indigo-500'
                    }`}
                  >
                    <Home size={16} />
                    Dashboard
                  </Link>
                  <Link
                    href="/complaints/new"
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      isActive('/complaints/new')
                        ? 'text-indigo-600 font-semibold'
                        : 'text-slate-600 hover:text-indigo-500'
                    }`}
                  >
                    <PlusCircle size={16} />
                    Submit Complaint
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin"
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'text-indigo-600 font-semibold'
                        : 'text-slate-600 hover:text-indigo-500'
                    }`}
                  >
                    <ShieldAlert size={16} />
                    Overview
                  </Link>
                  <Link
                    href="/admin/complaints"
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                      isActive('/admin/complaints')
                        ? 'text-indigo-600 font-semibold'
                        : 'text-slate-600 hover:text-indigo-500'
                    }`}
                  >
                    <Layers size={16} />
                    Manage Complaints
                  </Link>
                </>
              )}
            </nav>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 rounded-lg transition-all"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest leading-none mt-1">
                    {user.role}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 uppercase">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors px-4 py-2 rounded-lg shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <nav className="flex md:hidden items-center justify-around bg-white border border-slate-100 shadow-sm rounded-xl p-3 mb-6">
            {user.role === 'student' ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex flex-col items-center gap-1 text-xs font-semibold ${
                    isActive('/dashboard') ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  <Home size={18} />
                  Home
                </Link>
                <Link
                  href="/complaints/new"
                  className={`flex flex-col items-center gap-1 text-xs font-semibold ${
                    isActive('/complaints/new') ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  <PlusCircle size={18} />
                  File
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/admin"
                  className={`flex flex-col items-center gap-1 text-xs font-semibold ${
                    isActive('/admin') ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  <ShieldAlert size={18} />
                  Overview
                </Link>
                <Link
                  href="/admin/complaints"
                  className={`flex flex-col items-center gap-1 text-xs font-semibold ${
                    isActive('/admin/complaints') ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  <Layers size={18} />
                  Manage
                </Link>
              </>
            )}
          </nav>
        )}
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CampusVoice. Digital Complaint Resolutions.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
