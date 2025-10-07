// src/Components-Log_In/Log_In-Inputs.jsx

import React, { useState } from 'react';
import './Log_In-Inputs.css';
import personIcon from '../assets/fonts/person-icon.svg';
import lockIcon from '../assets/fonts/lock-icon.svg';

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
          <label className="input-label">Benutzername</label>
          <div className="input-wrapper">
            <img src={personIcon} alt="" className="input-icon-left" width="17" height="17" />
            <input
              className="input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Passwort</label>
          <div className="input-wrapper">
            <img src={lockIcon} alt="" className="input-icon-left" width="18" height="18" />
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
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
