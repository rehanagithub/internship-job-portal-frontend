import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { api } from '../../lib/api.js';
import { timeAgo } from '../../lib/utils.js';
import toast from 'react-hot-toast';

export default function CandidateNotifications() {
  const [data, setData] = useState({ notifications: [], unread_count: 0 });
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api.get('/notifications').then(setData).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(fetchNotifications, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setData(d => ({ ...d, notifications: d.notifications.map(n => n.id === id ? { ...n, is_read: true } : n), unread_count: Math.max(0, d.unread_count - 1) }));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all', {});
      setData(d => ({ ...d, notifications: d.notifications.map(n => ({ ...n, is_read: true })), unread_count: 0 }));
      toast.success('All marked as read');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <Layout><Spinner size="lg" className="py-20" /></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {data.unread_count > 0 && <p className="text-indigo-600 text-sm mt-1">{data.unread_count} unread</p>}
        </div>
        {data.unread_count > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {data.notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium text-gray-600">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.notifications.map(n => (
            <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${n.is_read ? 'bg-white border-gray-200 opacity-70' : 'bg-indigo-50 border-indigo-200 hover:border-indigo-300'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${n.is_read ? 'bg-gray-100 text-gray-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                {n.message && <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
              {!n.is_read && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
