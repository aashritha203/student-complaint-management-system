import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import ComplaintCard from '../components/ComplaintCard';
import { FolderKanban, PlusCircle, AlertCircle, FilePlus, Landmark } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'admin' || user.role === 'staff') {
      router.replace('/admin');
      return;
    }

    fetchComplaints();
  }, [user, router]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your complaints portfolio.');
    } finally {
      setLoading(false);
    }
  };

  // Aggregate stats
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) =>
    ['submitted', 'under_review', 'assigned', 'in_progress'].includes(c.status)
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading student dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">My Desk</h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Submit new issues and keep track of resolutions on-campus.
          </p>
        </div>
        <Link
          href="/complaints/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-755 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all shrink-0"
        >
          <PlusCircle size={18} />
          Submit Complaint
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 flex gap-2 text-rose-800 text-sm font-medium">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <FolderKanban size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
            <p className="text-xs font-semibold text-slate-455 uppercase tracking-wider">Total Filed</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Landmark size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
            <p className="text-xs font-semibold text-slate-455 uppercase tracking-wider">In Progress</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <PlusCircle className="rotate-45" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{resolvedCount}</p>
            <p className="text-xs font-semibold text-slate-455 uppercase tracking-wider">Resolved</p>
          </div>
        </div>
      </div>

      {/* Complaints List Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">My Reports History</h2>
        
        {complaints.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
            <FilePlus size={44} className="text-slate-350 mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No complaints reported</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
              You haven't submitted any complaints yet. Use the button above to file a report.
            </p>
            <Link
              href="/complaints/new"
              className="mt-4 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-bold text-sm px-4 py-2 rounded-lg transition-colors inline-block"
            >
              Report First Incident
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((c) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
