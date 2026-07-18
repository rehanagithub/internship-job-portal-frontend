import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, DollarSign, Users, Eye, Bookmark, BookmarkCheck, ArrowLeft, Building2, Globe, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { formatSalary, timeAgo } from '../lib/utils.js';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(setJob).catch(() => toast.error('Failed to load job')).finally(() => setLoading(false));
  }, [id]);


  const handleSave = async () => {
    if (!user) { toast.error('Login to save jobs'); return; }
    setSaving(true);
    try {
      if (job.is_saved) {
        await api.delete(`/saved-jobs/${id}`);
        setJob(j => ({ ...j, is_saved: false }));
        toast.success('Job removed from saved');
      } else {
        await api.post(`/saved-jobs/${id}`, {});
        setJob(j => ({ ...j, is_saved: true }));
        toast.success('Job saved!');
      }
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;
  if (!job) return <Layout><div className="text-center py-20 text-gray-500">Job not found</div></Layout>;

  const employer = Array.isArray(job.employer) ? job.employer[0] : job.employer;

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 text-sm font-medium transition-colors">
        <ArrowLeft size={18} /> Back to jobs
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {employer?.logo_url ? <img src={employer.logo_url} alt={employer.company_name} className="w-full h-full object-cover" /> : <Building2 size={28} className="text-indigo-500" />}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-gray-500 mt-1">{employer?.company_name || 'Company'}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <StatusBadge status={job.status} />
                    {job.job_type && <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{job.job_type}</span>}
                    {job.work_mode && <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{job.work_mode}</span>}
                  </div>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className={`p-2.5 rounded-lg border transition-colors ${job.is_saved ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-gray-300 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'}`}>
                {job.is_saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
              {job.location && <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin size={14} className="text-gray-400 flex-shrink-0" />{job.location}</div>}
              {(job.salary_min || job.salary_max) && <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium"><DollarSign size={14} className="flex-shrink-0" />{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</div>}
              <div className="flex items-center gap-2 text-sm text-gray-500"><Eye size={14} className="text-gray-400 flex-shrink-0" />{job.views_count || 0} views</div>
              <div className="flex items-center gap-2 text-sm text-gray-500"><Clock size={14} className="text-gray-400 flex-shrink-0" />{timeAgo(job.created_at)}</div>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 mb-3">About the Role</h2>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</div>
            </div>

            {job.skills_required?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill, i) => <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full">{skill}</span>)}
                </div>
              </div>
            )}

            {job.perks?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-gray-900 mb-3">Perks & Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {job.perks.map((perk, i) => <span key={i} className="px-3 py-1 bg-green-50 text-green-600 text-sm rounded-full">✓ {perk}</span>)}
                </div>
              </div>
            )}

            {job.screening_questions?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-gray-900 mb-3">Screening Questions</h2>
                <ul className="space-y-2">
                  {job.screening_questions.map((q, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-indigo-400 font-medium mt-0.5">{i+1}.</span>{q.question}{q.is_required && <span className="text-red-400 text-xs ml-1">*</span>}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Apply Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            {job.has_applied ? (
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="font-semibold text-gray-900">Application Submitted</p>
                <p className="text-gray-500 text-sm mt-1">You have already applied to this job</p>
                <Link to="/candidate/applications" className="block mt-4 text-indigo-600 text-sm hover:underline font-medium">View Applications</Link>
              </div>
            ) : user?.role === 'candidate' ? (
              <button onClick={() => navigate(`/candidate/apply/${id}`)}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                Apply Now
              </button>
            ) : user?.role === 'employer' ? (
              <p className="text-center text-sm text-gray-500">Employers cannot apply to jobs</p>
            ) : (
              <div className="space-y-2">
                <button onClick={() => navigate(`/candidate/apply/${id}`)}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
                  Apply Now
                </button>
                <p className="text-center text-xs text-gray-500">
                  <Link to="/login" className="text-indigo-600 hover:underline">Login</Link> or <Link to="/register" className="text-indigo-600 hover:underline">Register</Link> to apply
                </p>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-gray-100 space-y-3 text-sm text-gray-600">
              {job.experience_required && <div className="flex justify-between"><span className="text-gray-400">Experience</span><span className="font-medium">{job.experience_required}</span></div>}
              {job.education_required && <div className="flex justify-between"><span className="text-gray-400">Education</span><span className="font-medium">{job.education_required}</span></div>}
              {job.openings && <div className="flex justify-between"><span className="text-gray-400">Openings</span><span className="font-medium">{job.openings}</span></div>}
              {job.duration && <div className="flex justify-between"><span className="text-gray-400">Duration</span><span className="font-medium">{job.duration}</span></div>}
              {job.expires_at && <div className="flex justify-between"><span className="text-gray-400">Deadline</span><span className="font-medium">{new Date(job.expires_at).toLocaleDateString()}</span></div>}
            </div>
          </div>

          {/* Company Info */}
          {employer && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">About {employer.company_name}</h3>
              {employer.description && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{employer.description}</p>}
              <div className="space-y-2 text-sm text-gray-500">
                {employer.industry && <div className="flex items-center gap-2"><Briefcase size={14} />{employer.industry}</div>}
                {employer.company_size && <div className="flex items-center gap-2"><Users size={14} />{employer.company_size} employees</div>}
                {employer.website && <a href={employer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:underline"><Globe size={14} />Website <ExternalLink size={12} /></a>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
