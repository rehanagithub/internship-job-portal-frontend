import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList, PieChart, Pie, Cell } from 'recharts';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [jobsPerf, setJobsPerf] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [insights, setInsights] = useState({ insights: [], top_skills: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/employer/overview'),
      api.get('/analytics/employer/jobs-performance'),
      api.get('/analytics/employer/funnel'),
      api.get('/analytics/employer/insights'),
    ]).then(([ov, jp, fn, ins]) => { setOverview(ov); setJobsPerf(jp || []); setFunnel(fn); setInsights(ins || { insights: [], top_skills: [] }); })
      .catch(() => toast.error('Failed to load analytics')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;

  const funnelData = funnel ? [
    { name: 'Applied', value: funnel.applied, fill: '#6366f1' },
    { name: 'Under Review', value: funnel.under_review, fill: '#8b5cf6' },
    { name: 'Shortlisted', value: funnel.shortlisted, fill: '#ec4899' },
    { name: 'Interview', value: funnel.interview, fill: '#f59e0b' },
    { name: 'Offered', value: funnel.offered, fill: '#10b981' },
    { name: 'Hired', value: funnel.hired, fill: '#22c55e' },
  ].filter(d => d.value > 0) : [];

  const statCards = overview ? [
    { label: 'Total Applications', value: overview.total_applications, color: 'text-indigo-600' },
    { label: 'Active Jobs', value: overview.active_jobs, color: 'text-blue-600' },
    { label: 'Shortlisted', value: overview.shortlisted, color: 'text-purple-600' },
    { label: 'Hired', value: overview.hired, color: 'text-green-600' },
    { label: 'Total Views', value: overview.total_views, color: 'text-orange-600' },
    { label: 'Conversion Rate', value: `${overview.conversion_rate}%`, color: 'text-emerald-600' },
  ] : [];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Jobs Performance */}
        {jobsPerf.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Jobs Performance</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={jobsPerf} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#6366f1" radius={[4,4,0,0]} name="Applications" />
                <Bar dataKey="views" fill="#e0e7ff" radius={[4,4,0,0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Hiring Funnel */}
        {funnelData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Hiring Funnel</h2>
            <div className="space-y-2">
              {funnelData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24 flex-shrink-0">{d.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className="h-full rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all"
                      style={{ width: `${Math.max(8, (d.value / (funnelData[0]?.value || 1)) * 100)}%`, background: d.fill }}>
                      {d.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Skills & Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        {insights.top_skills?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Top Skills in Applicants</h2>
            <div className="space-y-2">
              {insights.top_skills.slice(0, 8).map((s, i) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28 flex-shrink-0 truncate">{s.skill}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(s.count / (insights.top_skills[0]?.count || 1)) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.insights?.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Insights & Recommendations</h2>
            {insights.insights.map((ins, i) => (
              <div key={i} className={`p-4 rounded-xl border ${ins.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : ins.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`font-semibold text-sm ${ins.type === 'warning' ? 'text-yellow-800' : ins.type === 'success' ? 'text-green-800' : 'text-blue-800'}`}>{ins.title}</p>
                <p className={`text-xs mt-1 ${ins.type === 'warning' ? 'text-yellow-700' : ins.type === 'success' ? 'text-green-700' : 'text-blue-700'}`}>{ins.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
