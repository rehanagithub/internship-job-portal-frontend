import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { api } from '../../lib/api.js';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';

export default function CandidateMessages() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/applications').then(d => setApplications(d.applications || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const loadMessages = async (app) => {
    setSelected(app);
    try { const msgs = await api.get(`/messages/${app.id}`); setMessages(msgs); }
    catch { setMessages([]); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    try {
      const msg = await api.post(`/messages/${selected.id}`, { content: newMsg });
      setMessages(m => [...m, msg]); setNewMsg('');
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <div className="grid md:grid-cols-3 gap-5 h-[70vh]">
        {/* Conversation list */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-y-auto">
          {applications.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><MessageSquare size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No applications yet</p></div>
          ) : applications.map(app => {
            const job = Array.isArray(app.job) ? app.job[0] : app.job;
            const employer = Array.isArray(job?.employer) ? job.employer[0] : job?.employer;
            return (
              <button key={app.id} onClick={() => loadMessages(app)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?.id === app.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}>
                <p className="font-medium text-gray-900 text-sm truncate">{job?.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{employer?.company_name}</p>
              </button>
            );
          })}
        </div>
        {/* Chat */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center"><MessageSquare size={40} className="mx-auto mb-2 opacity-40" /><p className="text-sm">Select a conversation</p></div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">{(Array.isArray(selected.job) ? selected.job[0] : selected.job)?.title}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start the conversation!</p>
                  : messages.map(msg => (
                    <div key={msg.id} className="p-3 bg-gray-50 rounded-lg max-w-sm">
                      <p className="text-sm text-gray-800">{msg.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(msg.created_at)}</p>
                    </div>
                  ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message…"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button type="submit" disabled={sending || !newMsg.trim()} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
