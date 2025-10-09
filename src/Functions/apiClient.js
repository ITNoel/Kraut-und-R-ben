// src/Functions/apiClient.js

// Allow configuration via CRA env var with sensible fallback
const API_BASE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE)
  || 'https://webprojekt3.herokuapp.com/api';

// Globales Token (in-memory) + Persistenz in localStorage
let authToken = null;
try {
  if (typeof window !== 'undefined' && window?.localStorage) {
    const saved = window.localStorage.getItem('authToken');
    if (saved) authToken = saved;
  }
} catch {}

async function request(method, path, body = null) {
  const upper = String(method || '').toUpperCase();
  const isBodyMethod = upper !== 'GET' && upper !== 'DELETE';
  const finalPath = path;
  const finalBody = isBodyMethod ? body : null;

  const headers = { 'Content-Type': 'application/json' };
  // Token als X-Session-Token Header mitsenden (aber nicht beim Login-Endpoint)
  if (authToken && !path.includes('/users/login')) {
    headers['X-Session-Token'] = authToken;
  }

  const res = await fetch(`${API_BASE}${finalPath}`, {
    method: upper,
    headers,
    body: finalBody != null ? JSON.stringify(finalBody) : undefined,
  });

  // JSON parsen (leere Arrays bleiben leere Arrays, Errors werden später gefangen)
  let data = null;
  try {
    data = await res.json();
  } catch {
    // keine JSON-Antwort, data bleibt null
  }

  // Nur HTTP-Status auswerten, nicht den Inhalt
  if (!res.ok) {
    throw new Error(data?.message || res.statusText);
  }
  // Auch leere Listen werden hier einfach zurückgegeben
  return data;
}

export const api = {
  get:    (path)    => request('GET',    path),
  post:   (path, b) => request('POST',   path, b),
  put:    (path, b) => request('PUT',    path, b),
  delete: (path)    => request('DELETE', path),
  setToken(token) {
    authToken = token || null;
    try {
      if (typeof window !== 'undefined' && window?.localStorage) {
        if (authToken) window.localStorage.setItem('authToken', authToken);
        else window.localStorage.removeItem('authToken');
      }
    } catch {}
  },
  clearToken() {
    this.setToken(null);
  },
  getToken() {
    return authToken;
  }
};
