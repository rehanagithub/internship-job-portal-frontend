import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, FileText, Calendar, Star } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { api } from '../../lib/api.js';
import { formatDate, timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/applications/${id}`), api.get(`/messages/${id}`)]).then(([a, m]) => { setApp(a); setMessages(m); }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSendingMsg(true);
    try {
      const msg = await api.post(`/messages/${id}`, { content: newMsg });
      setMessages(m => [...m, msg]);
      setNewMsg('');
    } catch (err) { toast.error(err.message); }
    finally { setSendingMsg(false); }
  };

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;
  if (!app) return <Layout><div className="py-20 text-center text-gray-500">Application not found</div></Layout>;

  const job = Array.isArray(app.job) ? app.job[0] : app.job;
  const employer = Array.isArray(job?.employer) ? job.employer[0] : job?.employer;

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 text-sm font-medium">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Job Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">{job?.title}</h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-gray-500">{employer?.company_name} · {job?.location}</p>
            <p className="text-sm text-gray-400 mt-1">Applied {timeAgo(app.applied_at)}</p>
            {app.ai_score && (
              <div className="mt-3 flex items-center gap-2">
                <Star size={14} className="text-yellow-400" />
                <span className="text-sm text-gray-600">AI Match Score: <strong>{app.ai_score}%</strong></span>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          {app.cover_letter && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText size={16} />Cover Letter</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{app.cover_letter}</p>
            </div>
          )}

          {/* Answers */}
          {app.answers?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Screening Answers</h2>
              <div className="space-y-4">
                {app.answers.map((a, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-gray-700">{(Array.isArray(a.question) ? a.question[0] : a.question)?.question || 'Question'}</p>
                    <p className="text-sm text-gray-600 mt-1">{a.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare size={16} />Messages</h2>
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No messages yet</p>
            ) : (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800">{msg.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(msg.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={sendMessage} className="flex gap-2">
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message…"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" disabled={sendingMsg || !newMsg.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Application Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Status</span><StatusBadge status={app.status} /></div>
              <div className="flex justify-between"><span className="text-gray-400">Applied</span><span className="text-gray-700">{formatDate(app.applied_at)}</span></div>
              {app.employer_rating && <div className="flex justify-between"><span className="text-gray-400">Rating</span><span className="text-yellow-500">{'⭐'.repeat(app.employer_rating)}</span></div>}
            </div>
            <Link to={`/jobs/${job?.id}`} className="block mt-4 text-center text-sm text-indigo-600 hover:underline">View Job Posting</Link>
          </div>

          {app.employer_notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-900 mb-2 text-sm">Recruiter Notes</h3>
              <p className="text-amber-800 text-sm">{app.employer_notes}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
