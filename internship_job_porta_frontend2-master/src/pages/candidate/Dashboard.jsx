import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, BookmarkCheck, TrendingUp, ArrowRight, User } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import JobCard from '../../components/JobCard.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/candidates/dashboard').then(setDashboard).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;

  const stats = [
    { label: 'Total Applied', value: dashboard?.total_applications || 0, icon: <FileText size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Shortlisted', value: dashboard?.shortlisted || 0, icon: <TrendingUp size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Interviews', value: dashboard?.interviews || 0, icon: <Briefcase size={20} />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Offers', value: dashboard?.offers || 0, icon: <BookmarkCheck size={20} />, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.email?.split('@')[0]}</p>
        </div>
        <Link to="/candidate/profile" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
          <User size={16} /> Edit Profile
        </Link>
      </div>

      {/* Profile Completion */}
      {dashboard?.profile_completion < 100 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-indigo-900">Complete your profile</p>
              <p className="text-indigo-600 text-sm mt-0.5">A complete profile gets 3x more views</p>
            </div>
            <span className="text-2xl font-bold text-indigo-600">{dashboard?.profile_completion || 10}%</span>
          </div>
          <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${dashboard?.profile_completion || 10}%` }} />
          </div>
          <Link to="/candidate/profile" className="inline-flex items-center gap-1 mt-3 text-sm text-indigo-600 font-medium hover:underline">
            Complete now <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-indigo-600 text-sm hover:underline">View all</Link>
          </div>
          {dashboard?.recent_applications?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No applications yet</p>
              <Link to="/jobs" className="text-indigo-600 text-sm mt-2 block hover:underline">Browse jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(dashboard?.recent_applications || []).map(app => {
                const job = Array.isArray(app.job) ? app.job[0] : app.job;
                const employer = Array.isArray(job?.employer) ? job.employer[0] : job?.employer;
                return (
                  <Link key={app.id} to={`/candidate/applications/${app.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{job?.title || 'Job'}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{employer?.company_name} · {timeAgo(app.applied_at)}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recommended Jobs</h2>
            <Link to="/jobs" className="text-indigo-600 text-sm hover:underline">Browse all</Link>
          </div>
          {dashboard?.recommended_jobs?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Briefcase size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No jobs available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(dashboard?.recommended_jobs || []).slice(0, 4).map(job => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{job.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{Array.isArray(job.employer) ? job.employer[0]?.company_name : job.employer?.company_name} · {job.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
