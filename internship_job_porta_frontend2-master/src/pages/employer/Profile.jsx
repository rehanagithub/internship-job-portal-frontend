import { useState, useEffect, useRef } from 'react';
import { Upload, Building2 } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

export default function EmployerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const logoRef = useRef();

  useEffect(() => {
    api.get('/employers/profile').then(p => { setProfile(p); setForm({ company_name: p.company_name || '', industry: p.industry || '', company_size: p.company_size || '', website: p.website || '', description: p.description || '', founded_year: p.founded_year || '', headquarters: p.headquarters || '', linkedin_url: p.linkedin_url || '' }); }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const r = await api.put('/employers/profile', form); setProfile(r); toast.success('Profile updated!'); }
    catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const uploadLogo = async (file) => {
    const fd = new FormData(); fd.append('file', file);
    try { const r = await api.upload('/employers/upload-logo', fd); setProfile(p => ({ ...p, logo_url: r.url })); toast.success('Logo updated!'); }
    catch (err) { toast.error(err.message); }
  };

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;

  const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'Manufacturing', 'Media', 'Consulting', 'Real Estate', 'Other'];
  const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Profile</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {/* Logo */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl bg-indigo-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full object-contain" alt="Logo" /> : <Building2 size={36} className="text-indigo-400" />}
            </div>
            <button onClick={() => logoRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md">
              <Upload size={14} />
            </button>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.company_name}</h2>
            <p className="text-gray-500 text-sm mt-1">Upload your company logo (PNG, JPG)</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
            <input value={form.company_name} onChange={e => setForm(f => ({...f, company_name: e.target.value}))} required className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
            <select value={form.industry} onChange={e => setForm(f => ({...f, industry: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Size</label>
            <select value={form.company_size} onChange={e => setForm(f => ({...f, company_size: e.target.value}))} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select size</option>
              {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
            <input type="url" value={form.website} onChange={e => setForm(f => ({...f, website: e.target.value}))} placeholder="https://company.com" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Founded Year</label>
            <input type="number" value={form.founded_year} onChange={e => setForm(f => ({...f, founded_year: e.target.value}))} placeholder="e.g. 2015" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Headquarters</label>
            <input value={form.headquarters} onChange={e => setForm(f => ({...f, headquarters: e.target.value}))} placeholder="City, Country" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn URL</label>
            <input type="url" value={form.linkedin_url} onChange={e => setForm(f => ({...f, linkedin_url: e.target.value}))} placeholder="https://linkedin.com/company/..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Description</label>
            <textarea rows={5} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Tell candidates about your company, culture, and mission…" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save Profile'}</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
