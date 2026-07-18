import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];
const CATEGORIES = ['Technology', 'Marketing', 'Design', 'Finance', 'Healthcare', 'Education', 'Sales', 'Engineering', 'Operations', 'Other'];

export default function PostJob() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', job_type: 'Full-time', location: '', work_mode: 'On-site', category: '',
    salary_min: '', salary_max: '', salary_currency: 'INR', duration: '', experience_required: '',
    education_required: '', openings: 1, expires_at: '', status: 'active',
    skills_required: [], perks: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [perkInput, setPerkInput] = useState('');
  const [questions, setQuestions] = useState([]);
  const [qForm, setQForm] = useState({ question: '', question_type: 'text', options: [], is_required: false });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSkill = () => { if (skillInput.trim()) { set('skills_required', [...form.skills_required, skillInput.trim()]); setSkillInput(''); } };
  const removeSkill = (i) => set('skills_required', form.skills_required.filter((_, j) => j !== i));
  const addPerk = () => { if (perkInput.trim()) { set('perks', [...form.perks, perkInput.trim()]); setPerkInput(''); } };
  const removePerk = (i) => set('perks', form.perks.filter((_, j) => j !== i));
  const addQuestion = () => { if (qForm.question.trim()) { setQuestions(q => [...q, { ...qForm, id: Date.now() }]); setQForm({ question: '', question_type: 'text', options: [], is_required: false }); } };
  const removeQuestion = (id) => setQuestions(q => q.filter(x => x.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.job_type) { toast.error('Title, description, and job type are required'); return; }
    setSubmitting(true);
    try {
      const job = await api.post('/jobs', { ...form, salary_min: form.salary_min ? parseInt(form.salary_min) : undefined, salary_max: form.salary_max ? parseInt(form.salary_max) : undefined, openings: parseInt(form.openings) || 1 });
      // Add screening questions
      for (const q of questions) {
        const { id, ...rest } = q;
        await api.post(`/jobs/${job.id}/screening-questions`, rest);
      }
      toast.success('Job posted successfully!');
      navigate('/employer/jobs');
    } catch (err) { toast.error(err.message || 'Failed to post job'); }
    finally { setSubmitting(false); }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Job</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-8">
        {['Job Details', 'Requirements', 'Screening'].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-indigo-600' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className={`flex-1 h-0.5 w-8 ${step > i + 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Job Details */}
        {step === 1 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">Job Details</h2>
            <div><label className={labelCls}>Job Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Senior React Developer" className={inputCls} /></div>
            <div><label className={labelCls}>Description *</label><textarea rows={8} value={form.description} onChange={e => set('description', e.target.value)} required placeholder="Describe the role, responsibilities, and what you're looking for…" className={`${inputCls} resize-none`} /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className={labelCls}>Job Type *</label><select value={form.job_type} onChange={e => set('job_type', e.target.value)} className={inputCls}>{JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className={labelCls}>Work Mode</label><select value={form.work_mode} onChange={e => set('work_mode', e.target.value)} className={inputCls}>{WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
              <div><label className={labelCls}>Category</label><select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}><option value="">Select category</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Location</label><input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Mumbai, India" className={inputCls} /></div>
              <div><label className={labelCls}>Openings</label><input type="number" min="1" value={form.openings} onChange={e => set('openings', e.target.value)} className={inputCls} /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className={labelCls}>Min Salary (₹)</label><input type="number" value={form.salary_min} onChange={e => set('salary_min', e.target.value)} placeholder="300000" className={inputCls} /></div>
              <div><label className={labelCls}>Max Salary (₹)</label><input type="number" value={form.salary_max} onChange={e => set('salary_max', e.target.value)} placeholder="800000" className={inputCls} /></div>
              <div><label className={labelCls}>Duration</label><input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 6 months" className={inputCls} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Application Deadline</label><input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Post As</label><select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}><option value="active">Active (live)</option><option value="draft">Draft (save for later)</option></select></div>
            </div>
            <div className="flex justify-end"><button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Next →</button></div>
          </div>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">Requirements & Perks</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Experience Required</label><input value={form.experience_required} onChange={e => set('experience_required', e.target.value)} placeholder="e.g. 2+ years, Freshers OK" className={inputCls} /></div>
              <div><label className={labelCls}>Education Required</label><input value={form.education_required} onChange={e => set('education_required', e.target.value)} placeholder="e.g. B.Tech, Any Graduate" className={inputCls} /></div>
            </div>
            {/* Skills */}
            <div>
              <label className={labelCls}>Required Skills</label>
              <div className="flex gap-2 mb-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="e.g. React, Node.js" className={`${inputCls} flex-1`} />
                <button type="button" onClick={addSkill} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.skills_required.map((s, i) => <span key={i} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"><span>{s}</span><button type="button" onClick={() => removeSkill(i)} className="text-indigo-400 hover:text-red-500"><Trash2 size={12} /></button></span>)}
              </div>
            </div>
            {/* Perks */}
            <div>
              <label className={labelCls}>Perks & Benefits</label>
              <div className="flex gap-2 mb-2">
                <input value={perkInput} onChange={e => setPerkInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPerk())} placeholder="e.g. Health Insurance, Flexible Hours" className={`${inputCls} flex-1`} />
                <button type="button" onClick={addPerk} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.perks.map((p, i) => <span key={i} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"><span>{p}</span><button type="button" onClick={() => removePerk(i)} className="text-green-400 hover:text-red-500"><Trash2 size={12} /></button></span>)}
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">← Back</button>
              <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Screening Questions */}
        {step === 3 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-gray-900 text-lg">Screening Questions <span className="text-gray-400 font-normal text-sm">(Optional)</span></h2>
            {questions.map(q => (
              <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div><p className="text-sm font-medium text-gray-900">{q.question}</p><p className="text-xs text-gray-400">{q.question_type} {q.is_required ? '· Required' : ''}</p></div>
                <button type="button" onClick={() => removeQuestion(q.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
            <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
              <input value={qForm.question} onChange={e => setQForm(q => ({...q, question: e.target.value}))} placeholder="Type your screening question…" className={inputCls} />
              <div className="flex gap-3">
                <select value={qForm.question_type} onChange={e => setQForm(q => ({...q, question_type: e.target.value}))} className={`${inputCls} flex-1`}>
                  <option value="text">Text answer</option>
                  <option value="yes_no">Yes / No</option>
                  <option value="multiple_choice">Multiple choice</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={qForm.is_required} onChange={e => setQForm(q => ({...q, is_required: e.target.checked}))} className="accent-indigo-600" /> Required
                </label>
                <button type="button" onClick={addQuestion} disabled={!qForm.question.trim()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"><Plus size={14} /> Add</button>
              </div>
            </div>
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">← Back</button>
              <button type="submit" disabled={submitting} className="px-8 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60">{submitting ? 'Posting…' : '🚀 Post Job'}</button>
            </div>
          </div>
        )}
      </form>
    </Layout>
  );
}
