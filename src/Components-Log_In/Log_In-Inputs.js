// src/Components-Log_In/Log_In-Inputs.jsx

import React, { useState } from 'react';
import './Log_In-Inputs.css';

export default function Log_InInputs({ onLogin, onForgot, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <div className="log-in-inputs">
      <h1 className="log-in-title">Anmeldung</h1>

      {error && (
        <div className="log-in-error">
          {error}
        </div>
      )}

      <form className="log-in-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            className="input"
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            required
          />
          <span className="input-icon">👤</span>
        </div>

        <div className="input-group">
          <input
            className="input"
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <span className="input-icon">🔒</span>
        </div>

        <button
          type="submit"
          className="btn log-in-btn"
          disabled={loading || !username || !password}
        >
          {loading ? 'Lädt…' : 'Anmelden'}
        </button>
      </form>

      <a
        href="#"
        className="forgot-link"
        onClick={e => {
          e.preventDefault();
          onForgot();
        }}
      >
        Passwort vergessen?
      </a>
    </div>
  );
}
