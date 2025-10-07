// src/Components-Log_In/Log_In-Forgot.jsx
import React from 'react';
import './Log_In-Forgot.css';
import letterIcon from '../assets/fonts/letter-icon.svg';

export default function Log_InForgot({ onCancel, onConfirm }) {
  return (
    <div className="log-in-forgot-left">
      <h1 className="forgot-title">Passwort vergessen?</h1>
      <div className="input-group forgot-input">
        <div className="input-wrapper">
          <img src={letterIcon} alt="" className="input-icon-left" width="18" height="18" />
          <input type="email" placeholder="E-Mail" />
        </div>
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
