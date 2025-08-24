// src/Sidebar.jsx
import logo from '../assets/logo.png';
import React, { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar({ view, onSelect }) {
  const [navState, setNavState] = useState({
    bookings: false,
    resources: false,
    usersAndRoles: false,
    finances: false,
  });

  useEffect(() => {
    // Klappe Nutzer & Rollen auf, wenn eine der Ansichten aktiv ist
    if (['department-overview', 'staff', 'services-overview'].includes(view)) {
      setNavState(s => ({ ...s, usersAndRoles: true }));
    }
  }, [view]);

  const toggleNavSection = section => {
    setNavState(s => ({ ...s, [section]: !s[section] }));
  };

  return (
    <aside className="sidebar">
      <div className="logo">
       <img src={logo} alt="Logo" />
      </div>
      <div className="navTree">
        <nav className="nav">
          {/* Dashboard */}
          <a
            href="#"
            className="dashboard-link"
            onClick={e => e.preventDefault()}
          >
            Zum Dashboard
            <span className="dashboard-icon">{/* icon */}</span>
          </a>
          <hr className="section-divider" />

          {/* Buchungen */}
          <div className={`nav-section ${navState.bookings ? 'open' : ''}`}>
            <div
              className="nav-section-header"
              onClick={() => toggleNavSection('bookings')}
            >
              <span>Buchungen</span>
              <span className="toggle-icon">
                {navState.bookings ? '−' : '+'}
              </span>
            </div>
            {navState.bookings && (
              <div className="nav-section-items">
                <a href="#">Alle Buchungen</a>
                <a href="#">Neue Buchung</a>
              </div>
            )}
            <hr className="section-divider" />
          </div>

          {/* Ressourcen */}
          <div className={`nav-section ${navState.resources ? 'open' : ''}`}>
            <div
              className="nav-section-header"
              onClick={() => toggleNavSection('resources')}
            >
              <span>Ressourcen / Locations</span>
              <span className="toggle-icon">
                {navState.resources ? '−' : '+'}
              </span>
            </div>
            {navState.resources && (
              <div className="nav-section-items">
                <a href="#">Studio 1</a>
                <a href="#">Studio 2</a>
                <a href="#">Equipment</a>
              </div>
            )}
            <hr className="section-divider" />
          </div>

          {/* Nutzer & Rollen */}
          <div className={`nav-section ${navState.usersAndRoles ? 'open' : ''}`}>
            <div
              className="nav-section-header"
              onClick={() => toggleNavSection('usersAndRoles')}
            >
              <span>Nutzer &amp; Rollen</span>
              <span className="toggle-icon">
                {navState.usersAndRoles ? '−' : '+'}
              </span>
            </div>
            {navState.usersAndRoles && (
              <div className="nav-section-items">
                <a
                  href="#"
                  className={view === 'department' ? 'active' : ''}
                  onClick={e => {
                    e.preventDefault();
                    onSelect('department-overview');
                  }}
                >
                  Abteilung
                </a>
                <a
                  href="#"
                  className={view === 'services-overview' ? 'active' : ''}
                  onClick={e => {
                    e.preventDefault();
                    onSelect('services-overview');
                  }}
                >
                  Dienste
                </a>
                <a
                  href="#"
                  className={view === 'staff-overview' ? 'active' : ''}
                  onClick={e => {
                    e.preventDefault();
                    onSelect('staff-overview');
                  }}
                >
                  Sachbearbeiter:innen
                </a>
              </div>
            )}
            <hr className="section-divider" />
          </div>

          {/* Finanzen */}
          <div className={`nav-section ${navState.finances ? 'open' : ''}`}>
            <div
              className="nav-section-header"
              onClick={() => toggleNavSection('finances')}
            >
              <span>Finanzen</span>
              <span className="toggle-icon">
                {navState.finances ? '−' : '+'}
              </span>
            </div>
            {navState.finances && (
              <div className="nav-section-items">
                <a href="#">Rechnungen</a>
                <a href="#">Zahlungen</a>
              </div>
            )}
            <hr className="section-divider" />
          </div>
        </nav>

        <div className="bottom-links">
          <a href="#">
            <span className="bottom-icon">❓</span> Support
          </a>
          <a href="#">
            <span className="bottom-icon">⚙️</span> Einstellungen
          </a>
        </div>
      </div>
    </aside>
  );
}
