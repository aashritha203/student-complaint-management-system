import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../utils/api';
import { StatusBadge, PriorityBadge } from '../../../components/StatusBadge';
import { ArrowLeft, User, Shield, CheckCircle, AlertCircle, MessageSquare, Loader2, Send } from 'lucide-react';

export default function AdminComplaintEditor() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { id } = router.query;

  // Local details page states
  const [data, setData] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form edit fields
  const [editFields, setEditFields] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    resolutionDetails: '',
  });

  // Comment state
  const [commentMsg, setCommentMsg] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'student') {
      router.replace('/dashboard');
      return;
    }

    if (id) {
      fetchDetails();
    }
  }, [id, user]);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [detailsRes, staffRes] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get('/admin/staff'),
      ]);

      setData(detailsRes.data);
      setStaffList(staffRes.data);
      
      const comp = detailsRes.data.complaint;
      setEditFields({
        status: comp.status,
        priority: comp.priority,
        assignedTo: comp.assignedTo?._id || '',
        resolutionDetails: comp.resolutionDetails || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed loading records details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (e) => {
    setEditFields({
      ...editFields,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const payload = {
        status: editFields.status,
        priority: editFields.priority,
        assignedTo: editFields.assignedTo || null,
        resolutionDetails: editFields.status === 'resolved' ? editFields.resolutionDetails : '',
      };

      const res = await api.put(`/admin/complaints/${id}`, payload);
      setData((prev) => ({
        ...prev,
        complaint: res.data,
      }));
      alert('Complaint configuration updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed updating complaint.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentMsg.trim()) return;

    setCommentLoading(true);
    try {
      const res = await api.post(`/complaints/${id}/comments`, {
        message: commentMsg,
        isInternal,
      });

      setData((prev) => ({
        ...prev,
        comments: [...prev.comments, res.data],
      }));
      setCommentMsg('');
      setIsInternal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit comment note.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading complaint triage panel...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4 font-sans border rounded-2xl bg-white">
        <div className="inline-flex p-3 bg-rose-50 text-rose-600 rounded-2xl">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Critical Error</h3>
        <p className="text-slate-500 text-sm">{error || 'Incident report metadata missing.'}</p>
        <Link
          href="/admin"
          className="inline-block bg-indigo-650 hover:bg-indigo-755 text-white font-semibold text-sm px-4 py-2 rounded-lg"
        >
          Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  const { complaint, comments } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-505 transition"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase">
            Triage Desk
          </span>
          <h1 className="text-2xl font-extrabold text-slate-905 mt-1 tracking-tight">
            Configure Complaint #{complaint._id.slice(-6)}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Edit settings */}
        <div className="lg:col-span-1 space-y-6">
          <form
            onSubmit={handleUpdateComplaint}
            className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 space-y-5"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-550 border-b border-slate-50 pb-2">
              Triage Settings
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Priority Tier
              </label>
              <select
                name="priority"
                value={editFields.priority}
                onChange={handleFieldChange}
                className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Workload Assignment
              </label>
              <select
                name="assignedTo"
                value={editFields.assignedTo}
                onChange={handleFieldChange}
                className="block w-full border border-slate-205 rounded-lg px-3 py-2 text-sm text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">-- Set Unassigned --</option>
                {staffList.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.department || 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Workflow Status
              </label>
              <select
                name="status"
                value={editFields.status}
                onChange={handleFieldChange}
                className="block w-full border border-slate-205 rounded-lg px-3 py-2 text-sm text-slate-855 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Resolution fields description box */}
            {editFields.status === 'resolved' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Resolution Details (Required)
                </label>
                <textarea
                  name="resolutionDetails"
                  required
                  rows={4}
                  value={editFields.resolutionDetails}
                  onChange={handleFieldChange}
                  className="block w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/20 placeholder-slate-400"
                  placeholder="Detail step validations, materials, or actions taken to resolve the student's issue..."
                />
              </div>
            )}

            <button
              type="submit"
              disabled={updateLoading}
              className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-755 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-50 shadow-sm"
            >
              {updateLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Apply Configuration
            </button>
          </form>
        </div>

        {/* Right column: Timeline report previews & admin comments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">
                File incident summary
              </p>
              <h2 className="text-xl font-extrabold text-slate-850 leading-tight mt-1">
                {complaint.title}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-3.5 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase mb-0.5">Reported By</p>
                <p className="font-semibold text-slate-700">{complaint.studentId.name}</p>
                <p className="text-slate-400 mt-0.5">{complaint.studentId.email}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase mb-0.5">Location details</p>
                <p className="font-semibold text-slate-700">{complaint.location}</p>
                <p className="text-slate-400 mt-0.5">Category: {complaint.category}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Detailed Description
              </h3>
              <p className="text-slate-655 text-sm whitespace-pre-line leading-relaxed">
                {complaint.description}
              </p>
            </div>
            
            {complaint.attachmentUrl && (
              <div className="pt-3 border-t border-slate-50">
                <a
                  href={complaint.attachmentUrl.startsWith('http') ? complaint.attachmentUrl : `http://localhost:5000${complaint.attachmentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-650 hover:underline inline-flex items-center gap-1"
                >
                  View Attached Document File Preview
                </a>
              </div>
            )}
          </div>

          {/* Comment updates log */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare size={18} className="text-slate-500" />
              <span>Communication History ({comments.length})</span>
            </h2>

            {/* List comment list */}
            <div className="space-y-3">
              {comments.filter(c => !c.isInternal || user.role !== 'student').map((comm) => (
                <div
                  key={comm._id}
                  className={`border rounded-2xl p-4 shadow-sm relative ${
                    comm.isInternal
                      ? 'bg-amber-50/50 border-amber-100'
                      : comm.userId._id.toString() === user._id.toString()
                        ? 'bg-indigo-50/5 border-indigo-100'
                        : 'bg-white border-slate-100'
                  }`}
                >
                  {comm.isInternal && (
                    <span className="absolute top-4 right-4 text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded uppercase leading-none select-none">
                      Internal Note
                    </span>
                  )}
                  <div className="flex gap-2 items-center mb-1.5">
                    <span className="text-sm font-bold text-slate-800">
                      {comm.userId.name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded leading-none ${
                        comm.userId.role === 'admin' 
                          ? 'bg-rose-50 text-rose-700' 
                          : comm.userId.role === 'staff' 
                            ? 'bg-amber-50 text-amber-705'
                            : 'bg-slate-50 text-slate-600'
                    }`}>
                      {comm.userId.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold ml-auto">
                      {new Date(comm.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-655 text-sm leading-relaxed whitespace-pre-line">
                    {comm.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Post comment input box */}
            <form onSubmit={handlePostComment} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 space-y-3">
              <input
                type="text"
                required
                placeholder="Enter updates or details..."
                value={commentMsg}
                onChange={(e) => setCommentMsg(e.target.value)}
                className="w-full border border-slate-205 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 text-sm rounded-xl px-4 py-2.5 bg-slate-50/10 text-slate-855"
              />
              
              <div className="flex justify-between items-center">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500/40 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-550">
                    Internal Note (Only visible to College Staff/Admin)
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={commentLoading || !commentMsg.trim()}
                  className="bg-indigo-600 hover:bg-indigo-755 text-white flex items-center gap-1.5 px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50 text-xs font-semibold"
                >
                  {commentLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Post update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
