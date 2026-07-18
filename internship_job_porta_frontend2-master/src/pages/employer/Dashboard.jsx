import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Users, TrendingUp, Plus, ArrowRight, Eye } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/employers/dashboard').then(setDashboard).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;

  const stats = [
    { label: 'Total Jobs', value: dashboard?.total_jobs || 0, icon: <Briefcase size={20} />, color: 'bg-blue-50 text-blue-600', link: '/employer/jobs' },
    { label: 'Active Jobs', value: dashboard?.active_jobs || 0, icon: <Eye size={20} />, color: 'bg-green-50 text-green-600', link: '/employer/jobs?status=active' },
    { label: 'Applications', value: dashboard?.total_applications || 0, icon: <FileText size={20} />, color: 'bg-purple-50 text-purple-600', link: '/employer/applications' },
    { label: 'Hired', value: dashboard?.hired || 0, icon: <Users size={20} />, color: 'bg-emerald-50 text-emerald-600', link: '/employer/applications?status=hired' },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.email?.split('@')[0]}</p>
        </div>
        <Link to="/employer/post-job" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Post a Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} to={s.link} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/employer/applications" className="text-indigo-600 text-sm hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          {!dashboard?.recent_applications?.length ? (
            <div className="text-center py-8 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No applications yet</p>
              <Link to="/employer/post-job" className="text-indigo-600 text-sm mt-2 block hover:underline">Post a job to start receiving applications</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.recent_applications.map(app => {
                const cand = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
                const job = Array.isArray(app.job) ? app.job[0] : app.job;
                return (
                  <Link key={app.id} to={`/employer/applications/${app.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{cand?.full_name || 'Candidate'}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{job?.title} · {timeAgo(app.applied_at)}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Jobs */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Top Performing Jobs</h2>
            <Link to="/employer/jobs" className="text-indigo-600 text-sm hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          {!dashboard?.top_jobs?.length ? (
            <div className="text-center py-8 text-gray-400">
              <Briefcase size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No jobs posted yet</p>
              <Link to="/employer/post-job" className="text-indigo-600 text-sm mt-2 block hover:underline">Post your first job</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.top_jobs.map(job => (
                <Link key={job.id} to={`/employer/jobs/${job.id}/edit`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{job.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{job.applications_count || 0} applications · {job.views_count || 0} views</p>
                  </div>
                  <StatusBadge status={job.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { to: '/employer/applications', label: 'Review Applications', desc: 'Shortlist candidates', icon: <FileText size={20} className="text-purple-500" /> },
          { to: '/employer/analytics', label: 'View Analytics', desc: 'Track performance', icon: <TrendingUp size={20} className="text-blue-500" /> },
          { to: '/employer/talent-pool', label: 'Talent Pool', desc: 'Saved candidates', icon: <Users size={20} className="text-green-500" /> },
          { to: '/employer/profile', label: 'Company Profile', desc: 'Update company info', icon: <Briefcase size={20} className="text-orange-500" /> },
        ].map(l => (
          <Link key={l.to} to={l.to} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center mb-3">{l.icon}</div>
            <p className="font-medium text-gray-900 text-sm">{l.label}</p>
            <p className="text-gray-400 text-xs mt-0.5">{l.desc}</p>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
