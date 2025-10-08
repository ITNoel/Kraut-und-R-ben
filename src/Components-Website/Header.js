// src/Header.jsx
import React, { useState, useEffect } from 'react';
import logoIcon from '../assets/fonts/logo-icon.svg';
import './Header.css';

export default function Header({ onLogout }) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Bestimme das tatsächliche Scroll-Element (Page-Container oder main-content oder window)
    const findScrollContainer = () =>
      document.querySelector('.department-page') ||
      document.querySelector('.main-content') ||
      (document.scrollingElement || window);

    const container = findScrollContainer();

    const getScrollTop = () => {
      if (container === window || container === document.scrollingElement) return window.scrollY || window.pageYOffset || 0;
      return (container && container.scrollTop) || 0;
    };

    const onScroll = () => {
      const main = document.querySelector('.main-content');
      if (!main) return;
      const y = window.scrollY || window.pageYOffset || 0;
      main.classList.toggle('scrolled-under', y > 0);
    };

    // Attach listener (window and Element support 'scroll')
    window.addEventListener('scroll', onScroll, { passive: true });
    // initial state
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="header">
      <div className="header-logo">
        <img src={logoIcon} alt="Logo" />
      </div>
      <div className="header-buttons">
        <button className="btn change-password">Passwort ändern</button>
        <button className="btn logout" onClick={onLogout}>Abmelden</button>
      </div>
    </header>
  );
}
/*       <div className="search-wrapper">
        <input
          type="text"
          placeholder="Was suchen Sie?"
          value={search}
          onChange={e => setSearch(e.target.value)}
        /> 
        <button className="search-button" aria-label="Suchen">
          {/* SVG icon */   /*}
        </button>
      </div> */
