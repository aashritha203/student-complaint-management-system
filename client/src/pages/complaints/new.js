import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import FileUpload from '../../components/FileUpload';
import { AlertCircle, ArrowLeft, Loader2, Send } from 'lucide-react';
import Link from 'next/link';

export default function NewComplaint() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleFileSelect = (file) => {
    setAttachment(file);
    setError('');
  };

  const handleFileClear = () => {
    setAttachment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, location } = formData;

    if (!title || !description || !category || !location) {
      setError('Please complete all form inputs.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use FormData to support multipart uploads
      const data = new FormData();
      data.append('title', title);
      data.append('description', description);
      data.append('category', category);
      data.append('location', location);
      
      if (attachment) {
        data.append('attachment', attachment);
      }

      await api.post('/complaints', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      router.push('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Submission failed. Please confirm fields correctness.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-905 leading-none">Report an Incident</h1>
          <p className="text-xs text-slate-455 font-semibold mt-1">
            File a digital report to alert campus department staff operators.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 flex gap-2 text-rose-800 text-sm font-medium">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Brief Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="block w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/20"
            placeholder="e.g. Broken Wi-Fi router on 3rd floor"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Category
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="block w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="">-- Choose Category --</option>
              <option value="Infrastructure">Infrastructure & Buildings</option>
              <option value="Hostel">Hostel & Housing</option>
              <option value="Wi-Fi">Wi-Fi & Networks</option>
              <option value="Academics">Academics & Classrooms</option>
              <option value="Cleanliness">Cleanliness & Waste</option>
              <option value="Transportation">Transportation & Shuttle</option>
              <option value="Other">Other Issues</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Location details
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="block w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/20"
              placeholder="e.g. Block B, Room 304"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Detailed Explanation
          </label>
          <textarea
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className="block w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/20"
            placeholder="Please detail the issue here, including specific classrooms or equipment problems..."
          />
        </div>

        <div>
          <FileUpload
            onFileSelect={handleFileSelect}
            file={attachment}
            onFileClear={handleFileClear}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-755 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}
