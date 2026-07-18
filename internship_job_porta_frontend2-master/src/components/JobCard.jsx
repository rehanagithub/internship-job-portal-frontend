import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Bookmark, BookmarkCheck, DollarSign } from 'lucide-react';
import { formatSalary, timeAgo, cn } from '../lib/utils.js';

export default function JobCard({ job, onSave, onUnsave, isSaved = false, compact = false }) {
  const employer = Array.isArray(job.employer) ? job.employer[0] : job.employer;

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all p-5', compact && 'p-4')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {employer?.logo_url ? (
              <img src={employer.logo_url} alt={employer.company_name} className="w-full h-full object-cover" />
            ) : (
              <Briefcase size={20} className="text-indigo-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1 text-sm md:text-base">
              {job.title}
            </Link>
            <p className="text-gray-500 text-sm mt-0.5 truncate">{employer?.company_name || 'Company'}</p>
          </div>
        </div>
        {(onSave || onUnsave) && (
          <button
            onClick={() => isSaved ? onUnsave?.(job.id) : onSave?.(job.id)}
            className={cn('p-2 rounded-lg transition-colors flex-shrink-0', isSaved ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50')}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={12} /> {job.location}
          </span>
        )}
        {job.job_type && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Briefcase size={12} /> {job.job_type}
          </span>
        )}
        {job.work_mode && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} /> {job.work_mode}
          </span>
        )}
      </div>

      {(job.salary_min || job.salary_max) && (
        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
          <DollarSign size={12} />
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </div>
      )}

      {job.skills_required?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.skills_required.slice(0, 4).map((skill, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{skill}</span>
          ))}
          {job.skills_required.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{job.skills_required.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
        <Link to={`/jobs/${job.id}`} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          View Details
        </Link>
      </div>
    </div>
  );
}
