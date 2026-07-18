export function getToken() { return localStorage.getItem('access_token'); }
export function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}
export function setAuth(user, access_token, refresh_token) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('access_token', access_token);
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
}
export function clearAuth() {
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
export function isLoggedIn() { return !!getToken(); }
