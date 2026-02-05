const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let token = localStorage.getItem('dca_token') || null;

export const setToken = (t) => {
  token = t;
};

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const req = async (method, path, body, isJson = true) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: getHeaders(isJson),
    body: body && isJson ? JSON.stringify(body) : body,
  });

  if (res.status === 401) {
    // automatic sign out on invalid token
    api.setToken(null);
    localStorage.removeItem('dca_token');
    localStorage.removeItem('dca_user');
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const err = new Error(errBody?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = errBody;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
};

export const api = {
  get: (path) => req('GET', path),
  post: (path, body) => req('POST', path, body),
  put: (path, body) => req('PUT', path, body),
  del: (path) => req('DELETE', path),
  setToken,
};
