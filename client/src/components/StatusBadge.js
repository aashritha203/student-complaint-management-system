import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    under_review: 'bg-amber-100 text-amber-800 border-amber-200',
    assigned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    closed: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const labels = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-800 border-slate-200';
  const label = labels[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {label}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    low: 'bg-slate-50 text-slate-700 border-slate-200',
    medium: 'bg-sky-50 text-sky-700 border-sky-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    critical: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse',
  };

  const labels = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'High Priority',
    critical: 'Critical',
  };

  const currentStyle = styles[priority] || 'bg-slate-50 text-slate-700 border-slate-200';
  const label = labels[priority] || priority;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {label}
    </span>
  );
};
