// src/Components-Log_In/Log_In-App.jsx

import React, { useState } from 'react';
import './Log_In-App.css';
import Log_InInputs from './Log_In-Inputs';
import Log_InForgot from './Log_In-Forgot';
import ColorAnimation from './Color-Animation';
import { api } from '../Functions/apiClient';

// Toggle: offline login helper. Set to false to use real API.
const OFFLINE_LOGIN = false;

export default function Log_InApp({ onLogin }) {
  const [mode, setMode]         = useState('inputs');      // 'inputs' | 'forgot'
  const [showMessage, setShowMessage] = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleForgot = () => {
    setMode('forgot');
    setShowMessage(false);
  };
  const handleCancel = () => {
    setMode('inputs');
    setShowMessage(false);
  };
  const handleConfirm = () => {
    setMode('inputs');
    setShowMessage(true);
  };

  // Wird von Log_InInputs mit { username, password } aufgerufen
    const doLogin = async ({ username, password }) => {
    setError(null);
    setLoading(true);

    try {
      if (OFFLINE_LOGIN) {
        // Bypass API completely and continue with empty seed data
        // You can add mock items here if needed
        console.warn('[Login] OFFLINE_LOGIN active – skipping API calls');
        onLogin([], [], []);
        return;
      }

      // 1) Authentifizieren
      await api.post('/users/login/', { username, password });

      // 2) Abteilungen laden
      let deptList = await api.get('/departments');

      // 3) Mitarbeiter laden
      let empList = await api.get('/employees');

      // 4) Dienste laden
      let servicesList = await api.get('/services');

      // 5) an App.jsx weitergeben (nun mit services)
      onLogin(deptList, empList, servicesList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="log-in-container">
      <div className="log-in-left">
        {mode === 'inputs' && (
          <Log_InInputs
            onLogin={doLogin}
            onForgot={handleForgot}
            error={error}
            loading={loading}
          />
        )}
        {mode === 'forgot' && (
          <Log_InForgot
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />
        )}
      </div>

      <div className="log-in-right">
        <ColorAnimation />
        {showMessage && (
          <div className="confirmation-message">
            <h2 className="confirmation-title">
              Der Link zum Zurücksetzen deines Passwortes wurde an deine E-Mail gesendet
            </h2>
            <p className="confirmation-text">
              Solltest du keine E-Mail erhalten haben, klicke{' '}
              <a
                href="#"
                className="confirmation-link"
                onClick={handleForgot}
              >
                hier
              </a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
