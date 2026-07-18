const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
// export const API_BASE = `http://localhost:5000/api`;
//export const API_BASE = `https://internship-job-portal-app-baackend.onrender.com`;
export const API_BASE = `https://internship-job-porta-backend.onrender.com/api`;




async function request(path, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),

  upload: (path, formData) => {
    const token = localStorage.getItem('access_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_BASE}${path}`, { method: 'POST', body: formData, headers })
      .then(async (res) => {
        if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Upload failed'); }
        return res.json();
      });
  },
};
