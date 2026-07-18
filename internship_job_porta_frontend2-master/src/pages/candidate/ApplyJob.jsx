import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ cover_letter: '', resume_id: '', answers: {} });

  useEffect(() => {
    Promise.all([api.get(`/jobs/${jobId}`), api.get('/candidates/resumes')]).then(([j, r]) => { setJob(j); setResumes(r); }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const answers = Object.entries(form.answers).map(([question_id, answer]) => ({ question_id, answer }));
      await api.post('/applications', { job_id: jobId, cover_letter: form.cover_letter, resume_id: form.resume_id || undefined, answers });
      toast.success('Application submitted!');
      navigate('/candidate/applications');
    } catch (err) { toast.error(err.message || 'Failed to apply'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;
  if (!job) return <Layout><div className="py-20 text-center text-gray-500">Job not found</div></Layout>;
  if (job.has_applied) { navigate('/candidate/applications'); return null; }

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 text-sm font-medium">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h1>
          <p className="text-gray-500 mt-1">{(Array.isArray(job.employer) ? job.employer[0] : job.employer)?.company_name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Selection */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Select Resume</h2>
            {resumes.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No resumes uploaded. <a href="/candidate/profile" className="text-indigo-600 hover:underline">Upload one</a></p>
              </div>
            ) : (
              <div className="space-y-2">
                {resumes.map(r => (
                  <label key={r.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-indigo-400 transition-colors">
                    <input type="radio" name="resume" value={r.id} onChange={() => setForm(f => ({...f, resume_id: r.id}))} checked={form.resume_id === r.id} className="accent-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.file_name}</p>
                      {r.is_primary && <span className="text-xs text-indigo-500">Primary</span>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Cover Letter <span className="text-gray-400 font-normal text-sm">(Optional)</span></h2>
            <textarea rows={6} value={form.cover_letter} onChange={e => setForm(f => ({...f, cover_letter: e.target.value}))}
              placeholder="Tell the employer why you're a great fit for this role…"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>

          {/* Screening Questions */}
          {job.screening_questions?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Screening Questions</h2>
              <div className="space-y-4">
                {job.screening_questions.map(q => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{q.question}{q.is_required && <span className="text-red-500 ml-1">*</span>}</label>
                    {q.question_type === 'multiple_choice' && q.options?.length ? (
                      <div className="space-y-2">
                        {q.options.map(opt => (
                          <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                            <input type="radio" name={`q_${q.id}`} value={opt} onChange={e => setForm(f => ({...f, answers: {...f.answers, [q.id]: e.target.value}}))} className="accent-indigo-600" required={q.is_required} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : q.question_type === 'yes_no' ? (
                      <div className="flex gap-4">
                        {['Yes', 'No'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                            <input type="radio" name={`q_${q.id}`} value={opt} onChange={e => setForm(f => ({...f, answers: {...f.answers, [q.id]: e.target.value}}))} className="accent-indigo-600" required={q.is_required} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea rows={3} onChange={e => setForm(f => ({...f, answers: {...f.answers, [q.id]: e.target.value}}))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        required={q.is_required} placeholder="Your answer…" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors">
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
