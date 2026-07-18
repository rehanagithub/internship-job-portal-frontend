import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout.jsx';
import { api } from '../../lib/api.js';
import { setAuth } from '../../lib/auth.js';
import toast from 'react-hot-toast';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/verify-otp', { email, token: otp, type: 'signup' });
      setAuth(data.user, data.access_token, data.refresh_token);
      toast.success('Email verified!');
      navigate(data.user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard');
    } catch (err) { toast.error(err.message || 'Verification failed'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('OTP resent to your email');
    } catch (err) { toast.error(err.message || 'Failed to resend OTP'); }
    finally { setResending(false); }
  };

  return (
    <Layout title="Verify your email" subtitle={`We sent a 6-digit code to ${email}`}>
      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">OTP Code</label>
          <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="000000" />
        </div>
        <button type="submit" disabled={loading || otp.length < 6}
          className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
          {loading ? 'Verifying…' : 'Verify Email'}
        </button>
        <p className="text-center text-sm text-gray-500">
          Didn't receive it?{' '}
          <button type="button" onClick={handleResend} disabled={resending} className="text-indigo-600 font-medium hover:underline disabled:opacity-60">
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
        </p>
      </form>
    </Layout>
  );
}
