import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MessageSquare, Download, UserPlus } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { api } from '../../lib/api.js';
import { formatDate, timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';

const STATUSES = ['applied','under_review','shortlisted','interview','offered','rejected','hired'];

export default function EmployerApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [addingToPool, setAddingToPool] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/applications/${id}`), api.get(`/messages/${id}`)]).then(([a, m]) => {
      setApp(a); setMessages(m); setNotes(a.employer_notes || ''); setRating(a.employer_rating || 0);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status) => {
    try { const updated = await api.put(`/applications/${id}/status`, { status }); setApp(a => ({ ...a, status })); toast.success('Status updated'); }
    catch (err) { toast.error(err.message); }
  };

  const saveNotes = async () => {
    setSaving(true);
    try { await api.put(`/applications/${id}/notes`, { employer_notes: notes, employer_rating: rating }); toast.success('Notes saved'); }
    catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault(); if (!newMsg.trim()) return;
    setSendingMsg(true);
    try { const msg = await api.post(`/messages/${id}`, { content: newMsg }); setMessages(m => [...m, msg]); setNewMsg(''); }
    catch (err) { toast.error(err.message); } finally { setSendingMsg(false); }
  };

  const addToTalentPool = async () => {
    const cand = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
    if (!cand?.id) return;
    setAddingToPool(true);
    try { await api.post(`/employers/talent-pool/${cand.id}`, {}); toast.success('Added to talent pool!'); }
    catch (err) { toast.error(err.message); } finally { setAddingToPool(false); }
  };

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;
  if (!app) return <Layout><div className="py-20 text-center text-gray-500">Application not found</div></Layout>;

  const cand = Array.isArray(app.candidate) ? app.candidate[0] : app.candidate;
  const job = Array.isArray(app.job) ? app.job[0] : app.job;

  return (
    <Layout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 text-sm font-medium"><ArrowLeft size={18} /> Back</button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Candidate Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {(cand?.full_name?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{cand?.full_name || 'Candidate'}</h1>
                  {cand?.location && <p className="text-gray-500 text-sm">{cand.location}</p>}
                  {cand?.linkedin_url && <a href={cand.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs hover:underline mt-0.5 block">LinkedIn Profile</a>}
                </div>
              </div>
              <button onClick={addToTalentPool} disabled={addingToPool} className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 text-sm rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-60">
                <UserPlus size={14} /> Save to Talent Pool
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Applied for</span><p className="font-medium text-gray-900 mt-0.5">{job?.title}</p></div>
              <div><span className="text-gray-400">Applied</span><p className="font-medium text-gray-900 mt-0.5">{timeAgo(app.applied_at)}</p></div>
              {app.ai_score && <div><span className="text-gray-400">AI Match Score</span><p className="font-medium text-yellow-600 mt-0.5">{app.ai_score}%</p></div>}
              {app.resume_url && <div><a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline mt-4"><Download size={14} />Download Resume</a></div>}
            </div>
          </div>

          {/* Cover Letter */}
          {app.cover_letter && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Cover Letter</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{app.cover_letter}</p>
            </div>
          )}

          {/* Screening Answers */}
          {app.answers?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Screening Answers</h2>
              <div className="space-y-4">
                {app.answers.map((a, i) => {
                  const q = Array.isArray(a.question) ? a.question[0] : a.question;
                  return <div key={i}><p className="text-sm font-medium text-gray-700">{q?.question}</p><p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg px-3 py-2">{a.answer}</p></div>;
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare size={16} />Messages</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {messages.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
                : messages.map(msg => <div key={msg.id} className="p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-800">{msg.content}</p><p className="text-xs text-gray-400 mt-1">{timeAgo(msg.created_at)}</p></div>)}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Send a message to the candidate…" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" disabled={sendingMsg || !newMsg.trim()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">Send</button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
            <div className="space-y-2">
              {STATUSES.map(s => (
                <button key={s} onClick={() => updateStatus(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${app.status === s ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'}`}>
                  {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Notes & Rating */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Internal Notes</h3>
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(n => <button key={n} type="button" onClick={() => setRating(n)}><Star size={20} className={n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} /></button>)}
            </div>
            <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add private notes about this candidate…" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3" />
            <button onClick={saveNotes} disabled={saving} className="w-full py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 disabled:opacity-60">{saving ? 'Saving…' : 'Save Notes'}</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
