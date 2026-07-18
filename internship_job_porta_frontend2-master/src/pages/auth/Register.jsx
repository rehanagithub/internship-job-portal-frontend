import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import Layout from '../../components/Layout.jsx';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'candidate', company_name: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate(form.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard');
    } catch (err) { toast.error(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <Layout title="Create your account" subtitle="Join thousands of job seekers and employers">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Toggle */}
        <div className="flex bg-[#EEF2F6] rounded-lg p-1 gap-1">
          {['candidate', 'employer'].map(r => (
            <button key={r} type="button" onClick={() => setForm(f => ({...f, role: r}))}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                form.role === r ? 'bg-[#0F1B2D] text-white shadow-sm' : 'text-[#0F1B2D]/50 hover:text-[#0F1B2D]'
              }`}>
              {r === 'candidate' ? '👤 Job Seeker' : '🏢 Employer'}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F1B2D]/80 mb-1.5">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F1B2D]/35" />
            <input type="text" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} required
              className="w-full pl-9 pr-4 py-2.5 border border-[#0F1B2D]/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50 focus:border-[#F5A623] transition-colors"
              placeholder="Your full name" />
          </div>
        </div>

        {form.role === 'employer' && (
          <div>
            <label className="block text-sm font-medium text-[#0F1B2D]/80 mb-1.5">Company Name</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F1B2D]/35" />
              <input type="text" value={form.company_name} onChange={e => setForm(f => ({...f, company_name: e.target.value}))} required={form.role === 'employer'}
                className="w-full pl-9 pr-4 py-2.5 border border-[#0F1B2D]/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50 focus:border-[#F5A623] transition-colors"
                placeholder="Your company name" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#0F1B2D]/80 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F1B2D]/35" />
            <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required
              className="w-full pl-9 pr-4 py-2.5 border border-[#0F1B2D]/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50 focus:border-[#F5A623] transition-colors"
              placeholder="you@example.com" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F1B2D]/80 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0F1B2D]/35" />
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required
              className="w-full pl-9 pr-10 py-2.5 border border-[#0F1B2D]/12 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/50 focus:border-[#F5A623] transition-colors"
              placeholder="At least 8 characters" />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F1B2D]/35 hover:text-[#0F1B2D]/70">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-[#F5A623] text-[#0F1B2D] font-semibold rounded-lg hover:bg-[#ffb84d] disabled:opacity-60 transition-colors text-sm mt-2">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
        <p className="text-center text-sm text-[#0F1B2D]/50">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2C5AA0] font-medium hover:underline">Sign in</Link>
        </p>
      </form>
    </Layout>
  );
}