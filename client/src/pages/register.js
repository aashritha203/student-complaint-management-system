import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Lock, Shield, AlertCircle, Loader2, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export default function Register() {
  const { user, register, loading, error, clearError } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
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
    clearError();
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
    if (!formData.name || !formData.email || !formData.password) {
      setLocalErr('Please complete all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setLocalErr('Password must be at least 6 characters.');
      return;
    }

    if (formData.role !== 'student' && !formData.department) {
      setLocalErr('Please select a department for administrative staff/admin accounts.');
      return;
    }

    try {
      const data = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.role === 'student' ? '' : formData.department,
      });

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
          Create account
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in here
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg border border-slate-200 py-2 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                College Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-lg border border-slate-200 py-2 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder="john.doe@college.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 block w-full rounded-lg border border-slate-200 py-2 text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder="•••••••• (Min 6 chars)"
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

            {/* Role and Department selection disabled for public self-registration (locked to Student) */}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-755 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all items-center gap-1.5"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
