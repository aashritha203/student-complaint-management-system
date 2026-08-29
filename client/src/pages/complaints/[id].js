import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  MessageSquare,
  Paperclip,
  Send,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function ComplaintDetail() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [commentMsg, setCommentMsg] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
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
      const res = await api.get(`/complaints/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed loading details. Internal error.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentMsg.trim()) return;

    setCommentLoading(true);
    try {
      const res = await api.post(`/complaints/${id}/comments`, {
        message: commentMsg,
        isInternal: false, // Student can only post public comments
      });
      // Add the new comment to local list immediately
      setData((prev) => ({
        ...prev,
        comments: [...prev.comments, res.data],
      }));
      setCommentMsg('');
    } catch (err) {
      alert(err.response?.data?.message || 'Placing comment failed.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading complaint details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="inline-flex p-3 bg-rose-50 text-rose-600 rounded-2xl">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Error loading report details</h3>
        <p className="text-slate-505 text-sm">{error || 'This report does not exist or unauthorized.'}</p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white font-semibold text-sm px-4 py-2 rounded-lg"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const { complaint, comments } = data;
  const isImage = (url) => {
    return url && /\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|p5.6.7s|png|svg|webp)$/i.test(url);
  };

  // Convert status to visual dashboard timeline position
  const statusSteps = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'closed', label: 'Closed' },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === complaint.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top navbar header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-505 hover:text-slate-700 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
              {complaint.category}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-905 mt-1 leading-none">
              Complaint Details
            </h1>
          </div>
        </div>

        <div className="flex gap-2 self-stretch sm:self-auto shrink-0 justify-end">
          {user.role !== 'student' && (
            <Link
              href={`/admin/complaints/${complaint._id}`}
              className="bg-indigo-50 hover:bg-indigo-150 text-indigo-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors border border-indigo-100"
            >
              Configure / Triage
            </Link>
          )}
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left pane: core details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-850 leading-tight">
                {complaint.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {complaint.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
                <span>ID: {complaint._id}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Description
              </h3>
              <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Resolution note */}
            {complaint.status === 'resolved' && complaint.resolutionDetails && (
              <div className="border-t border-slate-100 pt-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
                    Resolution Note
                  </h3>
                  <p className="text-emerald-700 text-sm leading-relaxed">
                    {complaint.resolutionDetails}
                  </p>
                </div>
              </div>
            )}

            {/* Attachment display */}
            {complaint.attachmentUrl && (
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Document Attachments
                </h3>
                {isImage(complaint.attachmentUrl) ? (
                  <div className="relative group max-w-sm border border-slate-205 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={complaint.attachmentUrl.startsWith('http') ? complaint.attachmentUrl : `http://localhost:5000${complaint.attachmentUrl}`}
                      alt="Attachment Preview"
                      className="max-h-64 w-full object-cover transition-transform group-hover:scale-102"
                    />
                    <a
                      href={complaint.attachmentUrl.startsWith('http') ? complaint.attachmentUrl : `http://localhost:5000${complaint.attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1 transition-opacity"
                    >
                      <Paperclip size={14} /> Open Fullsize
                    </a>
                  </div>
                ) : (
                  <a
                    href={complaint.attachmentUrl.startsWith('http') ? complaint.attachmentUrl : `http://localhost:5000${complaint.attachmentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 hover:bg-slate-105 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition"
                  >
                    <Paperclip size={16} className="text-slate-400" />
                    <span>View Staged Document Attachment</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Comments section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare size={18} className="text-slate-500" />
              <span>Communication History ({comments.length})</span>
            </h2>

            {/* List comment messages */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-slate-455 text-sm italic pl-1">
                  No public updates posted yet.
                </p>
              ) : (
                comments.map((comm) => (
                  <div
                    key={comm._id}
                    className={`bg-white border rounded-2xl p-4 shadow-sm relative ${
                      comm.userId._id.toString() === user._id.toString()
                        ? 'border-indigo-100 bg-indigo-50/5'
                        : 'border-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {comm.userId.name}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded leading-none ${
                          comm.userId.role === 'admin' 
                            ? 'bg-rose-50 text-rose-700' 
                            : comm.userId.role === 'staff' 
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-55 text-slate-600'
                        }`}>
                          {comm.userId.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(comm.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-655 text-sm leading-relaxed whitespace-pre-line">
                      {comm.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Post comment input box */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter updates or message..."
                value={commentMsg}
                onChange={(e) => setCommentMsg(e.target.value)}
                className="flex-1 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-505/20 focus:border-indigo-505 text-sm rounded-xl px-4 py-2.5 bg-white text-slate-850"
              />
              <button
                type="submit"
                disabled={commentLoading || !commentMsg.trim()}
                className="bg-indigo-600 hover:bg-indigo-755 text-white flex items-center justify-center p-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 shrink-0"
              >
                {commentLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>

        {/* Right pane: timeline checklist tracker */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Status Timeline
            </h3>

            <div className="relative border-l-2 border-slate-100 pl-5 space-y-6">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="relative">
                    {/* Circle bulb */}
                    <div
                      className={`absolute -left-[27px] top-0.5 w-3 h-3 rounded-full border-2 transition-colors ${
                        isCompleted
                          ? isCurrent
                            ? 'bg-indigo-650 border-indigo-650 ring-4 ring-indigo-55/60'
                            : 'bg-emerald-500 border-emerald-500'
                          : 'bg-white border-slate-250'
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isCompleted
                            ? isCurrent
                              ? 'text-indigo-650 font-bold'
                              : 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                          Current status
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details metadata */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              System Info
            </h3>
            
            <div className="space-y-3.5 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-0.5">PRIORITY</p>
                <PriorityBadge priority={complaint.priority} />
              </div>
              
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-0.5">ASSIGNED TO</p>
                <p className="font-semibold text-slate-700">
                  {complaint.assignedTo
                    ? `${complaint.assignedTo.name} (${complaint.assignedTo.department || 'Staff'})`
                    : 'Unassigned'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-semibold mb-0.5">SUBMITTED BY</p>
                <p className="font-semibold text-slate-705">
                  {complaint.studentId.name}
                </p>
                <p className="text-xs text-slate-400">
                  {complaint.studentId.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
