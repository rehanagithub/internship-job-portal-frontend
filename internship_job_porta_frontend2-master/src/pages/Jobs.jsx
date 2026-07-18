import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import JobCard from '../components/JobCard.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
const WORK_MODES = ['Remote', 'On-site', 'Hybrid'];
const CATEGORIES = ['Technology', 'Marketing', 'Design', 'Finance', 'Healthcare', 'Education', 'Sales', 'Engineering'];

export default function Jobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    job_type: searchParams.get('job_type') || '',
    work_mode: searchParams.get('work_mode') || '',
    category: searchParams.get('category') || '',
    salary_min: searchParams.get('salary_min') || '',
    salary_max: searchParams.get('salary_max') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const data = await api.get(`/jobs?${params}`);
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [filters]);

  const fetchSavedJobs = useCallback(async () => {
    if (!user || user.role !== 'candidate') return;
    try {
      const data = await api.get('/saved-jobs');
      setSavedJobIds(new Set((data || []).map(s => s.job_id)));
    } catch {}
  }, [user]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { fetchSavedJobs(); }, [fetchSavedJobs]);

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, page: 1 }));
  };

  const handleSearch = (e) => { e.preventDefault(); fetchJobs(); };

  const handleSave = async (jobId) => {
    if (!user) { toast.error('Login to save jobs'); return; }
    try {
      await api.post(`/saved-jobs/${jobId}`, {});
      setSavedJobIds(s => new Set([...s, jobId]));
      toast.success('Job saved');
    } catch (err) { toast.error(err.message); }
  };

  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/saved-jobs/${jobId}`);
      setSavedJobIds(s => { const n = new Set(s); n.delete(jobId); return n; });
      toast.success('Job removed from saved');
    } catch (err) { toast.error(err.message); }
  };

  const activeFilterCount = [filters.job_type, filters.work_mode, filters.category, filters.salary_min, filters.salary_max].filter(Boolean).length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">{total.toLocaleString()} opportunities available</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} type="text"
            placeholder="Search by title, skill, or keyword…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Search
        </button>
        <button type="button" onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${showFilters || activeFilterCount > 0 ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
          <SlidersHorizontal size={16} />
          Filters {activeFilterCount > 0 && <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Job Type</label>
              <select value={filters.job_type} onChange={e => handleFilterChange('job_type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All types</option>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Work Mode</label>
              <select value={filters.work_mode} onChange={e => handleFilterChange('work_mode', e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All modes</option>
                {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Category</label>
              <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Min Salary (₹)</label>
              <input type="number" value={filters.salary_min} onChange={e => handleFilterChange('salary_min', e.target.value)} placeholder="e.g. 300000"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Max Salary (₹)</label>
              <input type="number" value={filters.salary_max} onChange={e => handleFilterChange('salary_max', e.target.value)} placeholder="e.g. 1000000"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => { setFilters(f => ({ ...f, job_type: '', work_mode: '', category: '', salary_min: '', salary_max: '' })); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
              <X size={14} /> Clear filters
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium text-gray-700">No jobs found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} isSaved={savedJobIds.has(job.id)} onSave={handleSave} onUnsave={handleUnsave} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="p-2 rounded-lg border border-gray-300 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600">Page {filters.page} of {totalPages}</span>
              <button disabled={filters.page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="p-2 rounded-lg border border-gray-300 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
