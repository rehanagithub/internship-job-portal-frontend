import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Copy, MoreVertical, Users } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { api } from '../../lib/api.js';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';

const STATUSES = ['', 'active', 'paused', 'closed', 'draft'];

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);

  const fetchJobs = () => {
    const p = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/jobs/employer/mine${p}`).then(d => setJobs(d.jobs || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [statusFilter]);

  const updateStatus = async (jobId, status) => {
    try { await api.put(`/jobs/${jobId}/status`, { status }); fetchJobs(); toast.success(`Job ${status}`); }
    catch (err) { toast.error(err.message); }
    setMenuOpen(null);
  };

  const duplicate = async (jobId) => {
    try { await api.post(`/jobs/${jobId}/duplicate`, {}); fetchJobs(); toast.success('Job duplicated as draft'); }
    catch (err) { toast.error(err.message); }
    setMenuOpen(null);
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    try { await api.delete(`/jobs/${jobId}`); fetchJobs(); toast.success('Job deleted'); }
    catch (err) { toast.error(err.message); }
    setMenuOpen(null);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">My Jobs</h1><p className="text-gray-500 text-sm mt-1">{jobs.length} total</p></div>
        <Link to="/employer/post-job" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"><Plus size={16} /> Post a Job</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-indigo-400'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <Spinner size="lg" className="py-20" /> : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg font-medium text-gray-600">No jobs found</p>
          <Link to="/employer/post-job" className="mt-3 inline-block text-indigo-600 text-sm hover:underline">Post your first job</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link to={`/employer/jobs/${job.id}/edit`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{job.title}</Link>
                  <StatusBadge status={job.status} />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Users size={12} />{job.applications_count || 0} applications</span>
                  <span className="flex items-center gap-1"><Eye size={12} />{job.views_count || 0} views</span>
                  <span>{job.job_type} · {job.location || 'Remote'}</span>
                  <span>Posted {timeAgo(job.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link to={`/jobs/${job.id}`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View"><Eye size={16} /></Link>
                <Link to={`/employer/jobs/${job.id}/edit`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit"><Pencil size={16} /></Link>
                <Link to={`/employer/applications?job_id=${job.id}`} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Applications"><Users size={16} /></Link>
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === job.id ? null : job.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical size={16} /></button>
                  {menuOpen === job.id && (
                    <div className="absolute right-0 top-10 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                      {job.status !== 'active' && <button onClick={() => updateStatus(job.id, 'active')} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50">Activate</button>}
                      {job.status === 'active' && <button onClick={() => updateStatus(job.id, 'paused')} className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50">Pause</button>}
                      {job.status !== 'closed' && <button onClick={() => updateStatus(job.id, 'closed')} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Close</button>}
                      <button onClick={() => duplicate(job.id)} className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"><Copy size={14} />Duplicate</button>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => deleteJob(job.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} />Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
