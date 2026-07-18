import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];
const CATEGORIES = ['Technology', 'Marketing', 'Design', 'Finance', 'Healthcare', 'Education', 'Sales', 'Engineering', 'Operations', 'Other'];

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [perkInput, setPerkInput] = useState('');

  useEffect(() => {
    api.get(`/jobs/${id}`).then(job => {
      setForm({ title: job.title || '', description: job.description || '', job_type: job.job_type || 'Full-time', location: job.location || '', work_mode: job.work_mode || 'On-site', category: job.category || '', salary_min: job.salary_min || '', salary_max: job.salary_max || '', salary_currency: job.salary_currency || 'INR', duration: job.duration || '', experience_required: job.experience_required || '', education_required: job.education_required || '', openings: job.openings || 1, expires_at: job.expires_at ? job.expires_at.split('T')[0] : '', status: job.status || 'active', skills_required: job.skills_required || [], perks: job.perks || [] });
    }).catch(() => toast.error('Failed to load job')).finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addSkill = () => { if (skillInput.trim()) { set('skills_required', [...(form.skills_required || []), skillInput.trim()]); setSkillInput(''); } };
  const removeSkill = (i) => set('skills_required', (form.skills_required || []).filter((_, j) => j !== i));
  const addPerk = () => { if (perkInput.trim()) { set('perks', [...(form.perks || []), perkInput.trim()]); setPerkInput(''); } };
  const removePerk = (i) => set('perks', (form.perks || []).filter((_, j) => j !== i));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.put(`/jobs/${id}`, { ...form, salary_min: form.salary_min ? parseInt(form.salary_min) : null, salary_max: form.salary_max ? parseInt(form.salary_max) : null, openings: parseInt(form.openings) || 1 }); toast.success('Job updated!'); navigate('/employer/jobs'); }
    catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h1>
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div><label className={labelCls}>Job Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} required className={inputCls} /></div>
        <div><label className={labelCls}>Description *</label><textarea rows={8} value={form.description} onChange={e => set('description', e.target.value)} required className={`${inputCls} resize-none`} /></div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className={labelCls}>Job Type</label><select value={form.job_type} onChange={e => set('job_type', e.target.value)} className={inputCls}>{JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className={labelCls}>Work Mode</label><select value={form.work_mode} onChange={e => set('work_mode', e.target.value)} className={inputCls}>{WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
          <div><label className={labelCls}>Category</label><select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}><option value="">Select</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={labelCls}>Location</label><input value={form.location} onChange={e => set('location', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Openings</label><input type="number" min="1" value={form.openings} onChange={e => set('openings', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Min Salary (₹)</label><input type="number" value={form.salary_min} onChange={e => set('salary_min', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Max Salary (₹)</label><input type="number" value={form.salary_max} onChange={e => set('salary_max', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Experience Required</label><input value={form.experience_required} onChange={e => set('experience_required', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Education Required</label><input value={form.education_required} onChange={e => set('education_required', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Duration</label><input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 6 months" className={inputCls} /></div>
          <div><label className={labelCls}>Status</label><select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>{['active','paused','closed','draft'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        {/* Skills */}
        <div>
          <label className={labelCls}>Required Skills</label>
          <div className="flex gap-2 mb-2"><input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add skill" className={`${inputCls} flex-1`} /><button type="button" onClick={addSkill} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus size={16} /></button></div>
          <div className="flex flex-wrap gap-2">{(form.skills_required || []).map((s, i) => <span key={i} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"><span>{s}</span><button type="button" onClick={() => removeSkill(i)}><Trash2 size={12} /></button></span>)}</div>
        </div>
        {/* Perks */}
        <div>
          <label className={labelCls}>Perks & Benefits</label>
          <div className="flex gap-2 mb-2"><input value={perkInput} onChange={e => setPerkInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPerk())} placeholder="Add perk" className={`${inputCls} flex-1`} /><button type="button" onClick={addPerk} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"><Plus size={16} /></button></div>
          <div className="flex flex-wrap gap-2">{(form.perks || []).map((p, i) => <span key={i} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"><span>{p}</span><button type="button" onClick={() => removePerk(i)}><Trash2 size={12} /></button></span>)}</div>
        </div>
        <div className="flex justify-between">
          <button type="button" onClick={() => navigate('/employer/jobs')} className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </Layout>
  );
}
