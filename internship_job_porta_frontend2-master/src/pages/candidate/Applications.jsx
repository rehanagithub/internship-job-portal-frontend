import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { api } from '../../lib/api.js';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';

const STATUSES = ['', 'applied', 'under_review', 'shortlisted', 'interview', 'offered', 'rejected', 'hired'];

export default function CandidateApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetchApplications = () => {
    setLoading(true);
    const params = status ? `?status=${status}` : '';
    api.get(`/applications${params}`).then(data => setApplications(data.applications || [])).catch(() => toast.error('Failed to load applications')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, [status]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{applications.length} total</p>
        </div>
        <Link to="/jobs" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Browse Jobs</Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'}`}>
            {s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner size="lg" className="py-20" /> : applications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium text-gray-600">No applications yet</p>
          <Link to="/jobs" className="mt-3 text-indigo-600 text-sm hover:underline">Browse jobs to apply</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const job = Array.isArray(app.job) ? app.job[0] : app.job;
            const employer = Array.isArray(job?.employer) ? job.employer[0] : job?.employer;
            return (
              <Link key={app.id} to={`/candidate/applications/${app.id}`}
                className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {employer?.logo_url ? <img src={employer.logo_url} className="w-full h-full object-cover" alt={employer.company_name} /> : <FileText size={18} className="text-indigo-500" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{job?.title}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{employer?.company_name} · Applied {timeAgo(app.applied_at)}</p>
                    {app.ai_score && <p className="text-xs text-indigo-500 mt-1">AI match: {app.ai_score}%</p>}
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </Link>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
