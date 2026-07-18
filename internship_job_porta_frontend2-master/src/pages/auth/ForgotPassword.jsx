import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) { toast.error(err.message || 'Failed to send reset email'); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <Layout title="Check your inbox" subtitle="We've sent a reset link to your email">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✉️</div>
        <p className="text-sm text-gray-500">Didn't receive it? Check your spam folder or <button onClick={() => setSent(false)} className="text-indigo-600 hover:underline">try again</button>.</p>
        <Link to="/login" className="block text-sm text-indigo-600 hover:underline">Back to login</Link>
      </div>
    </Layout>
  );

  return (
    <Layout title="Forgot password?" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors text-sm">
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
        <p className="text-center text-sm text-gray-500">
          <Link to="/login" className="text-indigo-600 hover:underline">Back to login</Link>
        </p>
      </form>
    </Layout>
  );
}
