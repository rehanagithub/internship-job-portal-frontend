import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, User, GraduationCap, Briefcase, Wrench, FileText, Settings } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: <User size={16} /> },
  { id: 'education', label: 'Education', icon: <GraduationCap size={16} /> },
  { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
  { id: 'skills', label: 'Skills', icon: <Wrench size={16} /> },
  { id: 'resumes', label: 'Resumes', icon: <FileText size={16} /> },
  { id: 'preferences', label: 'Preferences', icon: <Settings size={16} /> },
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function CandidateProfile() {
  const [tab, setTab] = useState('basic');
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef();
  const resumeRef = useRef();

  useEffect(() => {
    Promise.all([
      api.get('/candidates/profile'),
      api.get('/candidates/education'),
      api.get('/candidates/experience'),
      api.get('/candidates/skills'),
      api.get('/candidates/resumes'),
      api.get('/candidates/preferences'),
    ]).then(([p, ed, ex, sk, re, pr]) => {
      setProfile(p); setEducation(ed); setExperience(ex); setSkills(sk); setResumes(re); setPreferences(pr || {});
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  // ── Basic Info ─────────────────────────────────────────────────────────────
  const [basicForm, setBasicForm] = useState({});
  useEffect(() => { if (profile) setBasicForm({ full_name: profile.full_name || '', phone: profile.phone || '', location: profile.location || '', bio: profile.bio || '', linkedin_url: profile.linkedin_url || '', github_url: profile.github_url || '', portfolio_url: profile.portfolio_url || '' }); }, [profile]);

  const saveBasic = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const updated = await api.put('/candidates/profile', basicForm);
      setProfile(updated); toast.success('Profile updated!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const uploadAvatar = async (file) => {
    const fd = new FormData(); fd.append('file', file);
    try { const r = await api.upload('/candidates/upload-avatar', fd); setProfile(p => ({ ...p, avatar_url: r.url })); toast.success('Avatar updated!'); }
    catch (err) { toast.error(err.message); }
  };

  // ── Education ─────────────────────────────────────────────────────────────
  const [eduForm, setEduForm] = useState({ school: '', degree: '', field_of_study: '', start_year: '', end_year: '', grade: '' });
  const [showEduForm, setShowEduForm] = useState(false);

  const addEducation = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const r = await api.post('/candidates/education', eduForm); setEducation(ed => [...ed, r]); setShowEduForm(false); setEduForm({ school: '', degree: '', field_of_study: '', start_year: '', end_year: '', grade: '' }); toast.success('Education added'); }
    catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  const deleteEducation = async (id) => {
    try { await api.delete(`/candidates/education/${id}`); setEducation(ed => ed.filter(e => e.id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.message); }
  };

  // ── Experience ────────────────────────────────────────────────────────────
  const [expForm, setExpForm] = useState({ company: '', role: '', location: '', start_date: '', end_date: '', is_current: false, description: '' });
  const [showExpForm, setShowExpForm] = useState(false);

  const addExperience = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const r = await api.post('/candidates/experience', expForm); setExperience(ex => [...ex, r]); setShowExpForm(false); setExpForm({ company: '', role: '', location: '', start_date: '', end_date: '', is_current: false, description: '' }); toast.success('Experience added'); }
    catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  const deleteExperience = async (id) => {
    try { await api.delete(`/candidates/experience/${id}`); setExperience(ex => ex.filter(e => e.id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.message); }
  };

  // ── Skills ────────────────────────────────────────────────────────────────
  const [skillForm, setSkillForm] = useState({ name: '', level: 'Intermediate' });
  const addSkill = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const r = await api.post('/candidates/skills', skillForm); setSkills(sk => [...sk, r]); setSkillForm({ name: '', level: 'Intermediate' }); toast.success('Skill added'); }
    catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  const deleteSkill = async (id) => {
    try { await api.delete(`/candidates/skills/${id}`); setSkills(sk => sk.filter(s => s.id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.message); }
  };

  // ── Resume Upload ─────────────────────────────────────────────────────────
  const uploadResume = async (file) => {
    const fd = new FormData(); fd.append('file', file);
    try { const r = await api.upload('/candidates/upload-resume', fd); setResumes(re => [...re, r]); toast.success('Resume uploaded!'); }
    catch (err) { toast.error(err.message); }
  };
  const deleteResume = async (id) => {
    try { await api.delete(`/candidates/resumes/${id}`); setResumes(re => re.filter(r => r.id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.message); }
  };

  // ── Preferences ───────────────────────────────────────────────────────────
  const [prefForm, setPrefForm] = useState({});
  useEffect(() => { setPrefForm(preferences); }, [preferences]);
  const savePreferences = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const r = await api.put('/candidates/preferences', prefForm); setPreferences(r); toast.success('Preferences saved!'); }
    catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;

  return (
    <Layout>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">My Profile</h1><p className="text-sm text-gray-500 mt-1">Profile completion: {profile?.profile_completion || 10}%</p></div>

      {/* Completion Bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden"><div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${profile?.profile_completion || 10}%` }} /></div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {tab === 'basic' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : <User size={32} className="text-indigo-400" />}
              </div>
              <button onClick={() => avatarRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors">
                <Upload size={12} />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            </div>
            <div><p className="font-semibold text-gray-900">{profile?.full_name || 'Your Name'}</p><p className="text-gray-500 text-sm">Upload a photo to complete your profile</p></div>
          </div>
          <form onSubmit={saveBasic} className="grid sm:grid-cols-2 gap-4">
            {[['full_name','Full Name','text'],['phone','Phone','tel'],['location','Location','text'],['linkedin_url','LinkedIn URL','url'],['github_url','GitHub URL','url'],['portfolio_url','Portfolio URL','url']].map(([k,l,t]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                <input type={t} value={basicForm[k] || ''} onChange={e => setBasicForm(f => ({...f, [k]: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
              <textarea rows={4} value={basicForm.bio || ''} onChange={e => setBasicForm(f => ({...f, bio: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Tell employers about yourself…" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Education */}
      {tab === 'education' && (
        <div className="space-y-4">
          {education.map(e => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between">
              <div><p className="font-semibold text-gray-900">{e.school}</p><p className="text-gray-500 text-sm">{e.degree} {e.field_of_study && `· ${e.field_of_study}`}</p><p className="text-gray-400 text-xs mt-1">{e.start_year} – {e.end_year || 'Present'} {e.grade && `· ${e.grade}`}</p></div>
              <button onClick={() => deleteEducation(e.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
          {!showEduForm ? (
            <button onClick={() => setShowEduForm(true)} className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl w-full hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm font-medium">
              <Plus size={16} /> Add Education
            </button>
          ) : (
            <form onSubmit={addEducation} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Add Education</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[['school','School / University *',''],['degree','Degree',''],['field_of_study','Field of Study',''],['grade','Grade / GPA',''],['start_year','Start Year',''],['end_year','End Year (leave blank if current)','']].map(([k,l]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                    <input value={eduForm[k] || ''} onChange={e => setEduForm(f => ({...f, [k]: e.target.value}))} required={k==='school'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowEduForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Adding…' : 'Add'}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Experience */}
      {tab === 'experience' && (
        <div className="space-y-4">
          {experience.map(e => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between">
              <div><p className="font-semibold text-gray-900">{e.role} at {e.company}</p><p className="text-gray-500 text-sm">{e.location}</p><p className="text-gray-400 text-xs mt-1">{e.start_date} – {e.is_current ? 'Present' : e.end_date}</p>{e.description && <p className="text-gray-600 text-sm mt-2 line-clamp-2">{e.description}</p>}</div>
              <button onClick={() => deleteExperience(e.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          ))}
          {!showExpForm ? (
            <button onClick={() => setShowExpForm(true)} className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl w-full hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm font-medium">
              <Plus size={16} /> Add Experience
            </button>
          ) : (
            <form onSubmit={addExperience} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Add Experience</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[['company','Company *'],['role','Role / Title *'],['location','Location'],['start_date','Start Date']].map(([k,l]) => (
                  <div key={k}><label className="block text-sm font-medium text-gray-700 mb-1">{l}</label><input type={k.includes('date') ? 'date' : 'text'} value={expForm[k] || ''} onChange={e => setExpForm(f => ({...f, [k]: e.target.value}))} required={k==='company'||k==='role'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                ))}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                    <input type="checkbox" checked={expForm.is_current} onChange={e => setExpForm(f => ({...f, is_current: e.target.checked, end_date: e.target.checked ? '' : f.end_date}))} className="accent-indigo-600" /> Currently working here
                  </label>
                </div>
                {!expForm.is_current && <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={expForm.end_date || ''} onChange={e => setExpForm(f => ({...f, end_date: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>}
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={3} value={expForm.description || ''} onChange={e => setExpForm(f => ({...f, description: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" /></div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowExpForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Adding…' : 'Add'}</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Skills */}
      {tab === 'skills' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {skills.map(s => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full">
                <span className="text-sm font-medium text-indigo-700">{s.name}</span>
                {s.level && <span className="text-xs text-indigo-400">{s.level}</span>}
                <button onClick={() => deleteSkill(s.id)} className="text-indigo-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          <form onSubmit={addSkill} className="flex gap-3">
            <input value={skillForm.name} onChange={e => setSkillForm(f => ({...f, name: e.target.value}))} placeholder="Skill name" required
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select value={skillForm.level} onChange={e => setSkillForm(f => ({...f, level: e.target.value}))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-1"><Plus size={16} /> Add</button>
          </form>
        </div>
      )}

      {/* Resumes */}
      {tab === 'resumes' && (
        <div className="space-y-4">
          {resumes.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center"><FileText size={18} className="text-red-500" /></div>
                <div><p className="font-medium text-gray-900 text-sm">{r.file_name}</p>{r.is_primary && <span className="text-xs text-indigo-500">Primary Resume</span>}</div>
              </div>
              <div className="flex items-center gap-2">
                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors">View</a>
                <button onClick={() => deleteResume(r.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          <div>
            <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => e.target.files?.[0] && uploadResume(e.target.files[0])} />
            <button onClick={() => resumeRef.current?.click()} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl w-full hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm font-medium">
              <Upload size={16} /> Upload Resume (PDF, DOC, DOCX)
            </button>
          </div>
        </div>
      )}

      {/* Preferences */}
      {tab === 'preferences' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={savePreferences} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              {[['preferred_role','Preferred Role'],['preferred_location','Preferred Location'],['expected_salary','Expected Salary (₹)'],['notice_period','Notice Period']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                  <input value={prefForm[k] || ''} onChange={e => setPrefForm(f => ({...f, [k]: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Job Type</label>
                <select value={prefForm.preferred_job_type || ''} onChange={e => setPrefForm(f => ({...f, preferred_job_type: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Any</option>
                  {['Full-time','Part-time','Internship','Contract','Freelance'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Work Mode</label>
                <select value={prefForm.preferred_work_mode || ''} onChange={e => setPrefForm(f => ({...f, preferred_work_mode: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Any</option>
                  {['Remote','On-site','Hybrid'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" checked={!!prefForm.open_to_work} onChange={e => setPrefForm(f => ({...f, open_to_work: e.target.checked}))} className="accent-indigo-600" />
                I'm open to work (visible to employers)
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save Preferences'}</button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}
