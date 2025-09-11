// src/Functions/apiClient.js

// Allow configuration via CRA env var with sensible fallback
const API_BASE =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE)
  || 'https://webprojekt3.herokuapp.com/api';

async function request(method, path, body = null) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
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
  get:    path      => request('GET',    path),
  post:   (path, b) => request('POST',   path, b),
  put:    (path, b) => request('PUT',    path, b),
  delete: path      => request('DELETE', path),
};
