// src/Components-Log_In/Log_In-Forgot.jsx
import React from 'react';
import './Log_In-Forgot.css';

export default function Log_InForgot({ onCancel, onConfirm }) {
  return (
    <div className="log-in-forgot-left">
      <h1 className="forgot-title">Passwort vergessen?</h1>
      <div className="input-group forgot-input">
        <input type="email" placeholder="E-Mail" />
        <span className="input-icon">✉️</span>
      </div>
      <div className="forgot-buttons">
        <button className="btn cancel" onClick={onCancel}>
          Abbrechen
        </button>
        <button className="btn log-in-btn" onClick={onConfirm}>
          Bestätigen
        </button>
      </div>
    </div>
  );
}
