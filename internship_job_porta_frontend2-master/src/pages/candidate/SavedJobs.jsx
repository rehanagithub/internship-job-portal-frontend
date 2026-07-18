import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Spinner from '../../components/Spinner.jsx';
import JobCard from '../../components/JobCard.jsx';
import { api } from '../../lib/api.js';
import toast from 'react-hot-toast';

export default function SavedJobs() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = () => {
    api.get('/saved-jobs').then(setSaved).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(fetchSaved, []);

  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/saved-jobs/${jobId}`);
      setSaved(s => s.filter(item => item.job_id !== jobId));
      toast.success('Job removed');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">{saved.length} saved</p>
      </div>
      {loading ? <Spinner size="lg" className="py-20" /> : saved.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookmarkCheck size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium text-gray-600">No saved jobs</p>
          <Link to="/jobs" className="mt-3 text-indigo-600 text-sm hover:underline">Browse jobs</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {saved.map(item => {
            const job = Array.isArray(item.job) ? item.job[0] : item.job;
            return <JobCard key={item.id} job={job} isSaved onUnsave={handleUnsave} />;
          })}
        </div>
      )}
    </Layout>
  );
}
