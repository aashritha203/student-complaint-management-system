import React from 'react';
import Link from 'next/link';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Calendar, MapPin } from 'lucide-react';

const ComplaintCard = ({ complaint }) => {
  const { _id, title, description, category, location, status, priority, createdAt } = complaint;

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
            {category}
          </span>
          <div className="flex gap-2">
            <PriorityBadge priority={priority} />
            <StatusBadge status={status} />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-2 hover:text-indigo-600 transition-colors">
          <Link href={`/complaints/${_id}`}>{title}</Link>
        </h3>
        
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {truncate(description, 120)}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-50 mt-auto">
        <div className="flex items-center gap-1">
          <MapPin size={14} className="text-slate-400" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-slate-400" />
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
