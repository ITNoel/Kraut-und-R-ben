// src/Services.jsx

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Services.css';

export default function Services({ onSelect }) {
  const [hideService, setHideService] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const deptRef = useRef();
  const notifRef = useRef();
  const paymentRef = useRef();

  const deptOptions = ['Bauamt', 'Sozial & Familienamt', 'Finanzabteilung', 'Personal'];
  const notifOptions = ['Team A', 'Team B', 'Team C'];
  const paymentOptions = ['Kreditkarte', 'PayPal', 'Rechnung'];

  useEffect(() => {
    function handleClickOutside(e) {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setShowDeptDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (paymentRef.current && !paymentRef.current.contains(e.target)) {
        setShowPaymentDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // gemeinsamer Handler für Abbrechen und Speichern
  const backToOverview = () => onSelect('services-overview');

  return (
    <div className="department-page services-page">
      <div className="page-header">
        <h1 className="page-header__title">Dienste anlegen</h1>
        <div className="page-header__actions">
          <button className="btn cancel" onClick={backToOverview}>
            Abbrechen
          </button>
          <button className="btn save" onClick={backToOverview}>
            Speichern &amp; schließen
          </button>
        </div>
      </div>

      <div className="department-body">
        <div className="left-column">
          <div className="page-container">
            <h2>Informationen</h2>
            <div className="form-grid two-col">
              <div className="form-item">
                <label>Art</label>
                <input placeholder="Service" />
              </div>
              <div className="form-item">
                <label>Name *</label>
                <input placeholder="Name" />
              </div>
              <div className="form-item">
                <label>Dauer *</label>
                <input placeholder="z.B. 30 min" />
              </div>
              <div className="form-item">
                <label>Preis</label>
                <input placeholder="€" />
              </div>
              <div className="form-item full-width">
                <label>Hinweis</label>
                <textarea placeholder="Hinweis" />
              </div>
            </div>
          </div>
        </div>

        <aside className="right-sidebar">
          <div className="page-container">
            <div className="toggle-box">
              <span>Dienst ausblenden</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={hideService}
                  onChange={() => setHideService(s => !s)}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          <div className="page-container" ref={deptRef}>
            <h2>Abteilung</h2>
            <div
              className={`service-box dashed${showDeptDropdown ? ' open' : ''}`}
              onClick={() => setShowDeptDropdown(d => !d)}
            >
              Abteilung auswählen
              {showDeptDropdown && (
                <ul className="dropdown-list">
                  {deptOptions.map((opt, i) => (
                    <li key={i} onClick={() => setShowDeptDropdown(false)}>
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="page-container" ref={notifRef}>
            <h2>Buchungs-Benachrichtigung</h2>
            <div
              className={`service-box dashed${showNotifDropdown ? ' open' : ''}`}
              onClick={() => setShowNotifDropdown(n => !n)}
            >
              Empfänger hinzufügen
              {showNotifDropdown && (
                <ul className="dropdown-list">
                  {notifOptions.map((opt, i) => (
                    <li key={i} onClick={() => setShowNotifDropdown(false)}>
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="page-container" ref={paymentRef}>
            <h2>Bezahlungs-Art</h2>
            <div
              className={`service-box dashed${showPaymentDropdown ? ' open' : ''}`}
              onClick={() => setShowPaymentDropdown(p => !p)}
            >
              Bezahlungsart hinzufügen
              {showPaymentDropdown && (
                <ul className="dropdown-list">
                  {paymentOptions.map((opt, i) => (
                    <li key={i} onClick={() => setShowPaymentDropdown(false)}>
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
