import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { api } from '../../lib/api.js';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';

const STATUSES = ['', 'applied', 'under_review', 'shortlisted', 'interview', 'offered', 'rejected', 'hired'];
const SORTS = [{ value: 'applied_at', label: 'Newest first' }, { value: 'ai_score', label: 'Best match' }];

export default function EmployerApplications() {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: searchParams.get('status') || '', sort_by: 'applied_at', job_id: searchParams.get('job_id') || '' });

  const fetchApplications = () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    api.get(`/applications/employer?${params}`).then(d => setApplications(d.applications || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, [filters]);

  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(`Status updated to ${status}`);
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Applications</h1><p className="text-gray-500 text-sm mt-1">{applications.length} total</p></div>
        <select value={filters.sort_by} onChange={e => setFilters(f => ({...f, sort_by: e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilters(f => ({...f, status: s}))}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.status === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'}`}>
            {s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner size="lg" className="py-20" /> : applications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg font-medium text-gray-600">No applications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const cand = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
            const job = Array.isArray(app.job) ? app.job[0] : app.job;
            return (
              <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">
                  {(cand?.full_name?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link to={`/employer/applications/${app.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{cand?.full_name || 'Candidate'}</Link>
                    <StatusBadge status={app.status} />
                    {app.ai_score && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">Match: {app.ai_score}%</span>}
                  </div>
                  <p className="text-gray-500 text-sm mt-0.5">{job?.title} · Applied {timeAgo(app.applied_at)}</p>
                  {cand?.location && <p className="text-gray-400 text-xs mt-0.5">{cand.location}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {STATUSES.slice(1).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                  <Link to={`/employer/applications/${app.id}`} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors">View</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
