import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
///
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <Layout title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="••••••••" />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0F1B2D]/35 hover:text-[#0F1B2D]/70">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-[#2C5AA0] hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-[#F5A623] text-[#0F1B2D] font-semibold rounded-lg hover:bg-[#ffb84d] disabled:opacity-60 transition-colors text-sm">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-[#0F1B2D]/50">
          No account?{' '}
          <Link to="/register" className="text-[#2C5AA0] font-medium hover:underline">Sign up free</Link>
        </p>
      </form>
    </Layout>
  );
}