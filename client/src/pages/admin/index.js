import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Local query states
  const [stats, setStats] = useState(null);
  const [complaintsData, setComplaintsData] = useState({ complaints: [], total: 0, pages: 1 });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'student') {
      router.replace('/dashboard');
      return;
    }

    fetchAdminData();
  }, [user, router, filters, page]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // Build filter queries
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters,
      });

      const [statsRes, complaintsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/complaints?${queryParams}`),
      ]);

      setStats(statsRes.data);
      setComplaintsData(complaintsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed loading admin control panel portfolio.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(1); // Reset page on filter tweak
  };

  if(!stats && loading) {
     return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-550">Loading administrative workflow panels...</p>
      </div>
     )
  }

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Admin Console</h1>
        <p className="text-slate-500 text-sm font-semibold mt-1">
          Review, prioritize, distribute workload, and resolve campus issues efficiently.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-100 p-4 flex gap-2 text-rose-800 text-sm font-medium">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics analytics cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                <FolderKanban size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                <p className="text-xs font-semibold text-slate-455 uppercase tracking-wider">Total Incidents</p>
              </div>
            </div>
            {stats.total > 0 && (
              <span className="text-[10px] bg-slate-50 text-slate-500 font-bold px-2 py-0.5 rounded uppercase font-sans">
                Master Log
              </span>
            )}
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
                <p className="text-xs font-semibold text-slate-455 uppercase tracking-wider">Pending Action</p>
              </div>
            </div>
            {stats.total > 0 && (
              <span className="text-xs text-amber-600 font-bold">
                {((stats.pending / stats.total) * 100).toFixed(0)}% Open
              </span>
            )}
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.resolved}</p>
                <p className="text-xs font-semibold text-slate-455 uppercase tracking-wider">Resolved Tickets</p>
              </div>
            </div>
            {stats.total > 0 && (
              <span className="text-xs text-emerald-600 font-bold">
                {((stats.resolved / stats.total) * 100).toFixed(0)}% Closed
              </span>
            )}
          </div>
        </div>
      )}

      {/* Advanced search and filter criteria bar */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search title, description..."
              value={filters.search}
              onChange={handleFilterChange}
              className="pl-10 block w-full border border-slate-200 rounded-lg py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/20 placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <Filter size={14} />
              Filter By:
            </div>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Categories</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Hostel">Hostel</option>
              <option value="Wi-Fi">Wi-Fi</option>
              <option value="Academics">Academics</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Transportation">Transportation</option>
              <option value="Other">Other</option>
            </select>

            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table log */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-505 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Title & Student</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {complaintsData.complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No complaints match the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                complaintsData.complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">
                          {c.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Reports: {c.studentId.name} ({new Date(c.createdAt).toLocaleDateString()})
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded select-none">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                      {c.location}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-indigo-650">
                      {c.assignedTo ? c.assignedTo.name : <span className="text-slate-400 font-normal italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-right shrink-0">
                      <Link
                        href={`/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-650 hover:text-indigo-800"
                      >
                        Details <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {complaintsData.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/20">
            <p className="text-xs text-slate-455 font-semibold">
              Showing Page {page} of {complaintsData.pages} ({complaintsData.total} items total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, complaintsData.pages))}
                disabled={page === complaintsData.pages}
                className="px-3 py-1 bg-white border border-slate-205 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-55"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
