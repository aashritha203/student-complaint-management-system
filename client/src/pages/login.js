import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export default function Login() {
  const { user, login, loading, error, clearError } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
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

  const [localErr, setLocalErr] = useState('');

  useEffect(() => {
    // Clear state error on mount
    clearError();
    
    // Redirect if logged in
    if (user) {
      if (user.role === 'admin' || user.role === 'staff') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, router, clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalErr('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setLocalErr('Please complete all login credentials fields.');
      return;
    }

    try {
      const data = await login(formData.email, formData.password);
      if (data.role === 'admin' || data.role === 'staff') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      // Handled by store state
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 rounded-lg transition-all"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
        </button>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-xl bg-indigo-600 items-center justify-center text-white font-extrabold text-2xl shadow-md mb-3">
          C
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to CampusVoice
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Or{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            register for a student account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-100">
          {(error || localErr) && (
            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 p-3 flex gap-2 text-rose-800 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <span>{error || localErr}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                College Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg border border-slate-200 py-2.5 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder="name@college.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 block w-full rounded-lg border border-slate-200 py-2.5 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-650 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-755 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all items-center gap-1.5"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}
