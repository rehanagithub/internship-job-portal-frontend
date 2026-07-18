import { useState, useEffect } from 'react';
import { Users, Trash2, Mail } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

export default function TalentPool() {
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/employers/talent-pool').then(setPool).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const remove = async (candidateId) => {
    try { await api.delete(`/employers/talent-pool/${candidateId}`); setPool(p => p.filter(item => item.candidate_id !== candidateId)); toast.success('Removed from talent pool'); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <Layout>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Talent Pool</h1><p className="text-gray-500 text-sm mt-1">{pool.length} saved candidates</p></div>

      {loading ? <Spinner size="lg" className="py-20" /> : pool.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium text-gray-600">No candidates saved yet</p>
          <p className="text-sm mt-1">Save candidates from their application pages to build your talent pool</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pool.map(item => {
            const cand = Array.isArray(item.candidate) ? item.candidate[0] : item.candidate;
            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 flex-shrink-0">
                      {(cand?.full_name?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cand?.full_name || 'Candidate'}</p>
                      {cand?.location && <p className="text-gray-500 text-xs mt-0.5">{cand.location}</p>}
                    </div>
                  </div>
                  <button onClick={() => remove(item.candidate_id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                </div>
                {item.notes && <p className="text-gray-500 text-xs bg-gray-50 rounded-lg px-3 py-2 mb-3">{item.notes}</p>}
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">{t}</span>)}
                  </div>
                )}
                {cand?.profile_completion && <div className="mt-3"><div className="flex justify-between text-xs text-gray-400 mb-1"><span>Profile</span><span>{cand.profile_completion}%</span></div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${cand.profile_completion}%` }} /></div></div>}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
