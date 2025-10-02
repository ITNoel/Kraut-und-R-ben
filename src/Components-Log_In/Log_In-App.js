// src/Components-Log_In/Log_In-App.jsx

import React, { useState } from 'react';
import './Log_In-App.css';
import Log_InInputs from './Log_In-Inputs';
import Log_InForgot from './Log_In-Forgot';
import ColorAnimation from './Color-Animation';
import { api } from '../Functions/apiClient';

// Toggle: offline login helper. Set to false to use real API.
const OFFLINE_LOGIN = true;

// Mock-Daten für Offline-Login (nur Test)
const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Bürgeramt Mitte', status: 'active', employees: [] },
  { id: 2, name: 'Kfz-Zulassungsstelle', status: 'active', employees: [] },
  { id: 3, name: 'Standesamt', status: 'disabled', employees: [] },
  { id: 4, name: 'Ordnungsamt', status: 'draft', employees: [] },
];

const MOCK_EMPLOYEES = [
  { id: 101, first_name: 'Anna',   last_name: 'Schmidt',   email: 'anna.schmidt@example.com',   telephone: '+49 30 1234 1001', status: 'active',   department: 1 },
  { id: 102, first_name: 'Markus', last_name: 'Weber',     email: 'markus.weber@example.com',   telephone: '+49 30 1234 1002', status: 'active',   department: 2 },
  { id: 103, first_name: 'Lea',    last_name: 'Keller',    email: 'lea.keller@example.com',     telephone: '+49 30 1234 1003', status: 'disabled', department: 0 },
  { id: 104, first_name: 'Jonas',  last_name: 'Becker',    email: 'jonas.becker@example.com',   telephone: '+49 30 1234 1004', status: 'draft',    department: 3 },
  { id: 105, first_name: 'Sarah',  last_name: 'Müller',    email: 'sarah.mueller@example.com',  telephone: '+49 30 1234 1005', status: 'active',   department: 1 },
];

const MOCK_SERVICES = [
  { id: 201, name: 'Reisepass beantragen', department: 1, duration: 30, max_persons: 1, documents: 3, status: 'active' },
  { id: 202, name: 'Ummeldung', department: 1, duration: 20, max_persons: 2, documents: 5, status: 'active' },
  { id: 203, name: 'Meldebescheinigung', department: 1, duration: 15, max_persons: 1, documents: 2, status: 'disabled' },
  { id: 204, name: 'Führerschein beantragen', department: 2, duration: 45, max_persons: 1, documents: 8, status: 'active' },
];

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
        onLogin(MOCK_DEPARTMENTS, MOCK_EMPLOYEES, MOCK_SERVICES);
        return;
      }

      // 1) Authentifizieren
      const loginResp = await api.post('/users/login/', { username, password });
      // Token aus der Antwort auslesen und global setzen
      const token = loginResp?.token ?? loginResp?.access ?? loginResp?.auth_token ?? null;
      if (token) {
        api.setToken(token);
      }

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
