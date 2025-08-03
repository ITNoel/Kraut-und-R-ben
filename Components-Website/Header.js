// src/Header.jsx
import React, { useState } from 'react';
import './Header.css';

export default function Header() {
  const [search, setSearch] = useState('');

  return (
    <header className="header">

      <div className="header-buttons">
        <button className="btn change-password">Passwort ändern</button>
        <button className="btn logout">Abmelden</button>
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