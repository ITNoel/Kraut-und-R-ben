// src/Components-Website/SearchBar.jsx

import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';
import arrowIcon from '../assets/Buttons/arrow-icon.png';
import lenseIcon from '../assets/lense-icon.png';

export default function SearchBar({
  label = 'Filter & Ansicht',
  term,
  onTermChange,
  placeholder = 'Suche',
  status,
  onStatusChange,
  statusOptions = null,
}) {
  const [open, setOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef();

  useEffect(() => {
    function handleDocClick(e) {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);
  return (
    <div className="filter-bar">
      <div className="filter-bar__header">
        <div className="filter-bar__title">
          {label}
        </div>
        <button
          type="button"
          className={`filter-bar__chevron ${open ? 'open' : 'closed'}`}
          aria-expanded={open}
          aria-label={open ? 'Filter einklappen' : 'Filter ausklappen'}
          onClick={() => setOpen(v => !v)}
        >
          <img src={arrowIcon} alt="" />
        </button>
      </div>

      {open && (
        <div className="filter-bar__controls">
          <div className="filter-bar__control filter-bar__search">
            <img src={lenseIcon} alt="Suchen" className="search-icon" />
            <input
              type="text"
              value={term ?? ''}
              onChange={(e) => onTermChange?.(e.target.value)}
              placeholder={placeholder}
            />
          </div>

          {Array.isArray(statusOptions) && statusOptions.length > 0 && (
            <div
              className={`filter-bar__status service-box dashed${statusOpen ? ' open' : ''}`}
              ref={statusRef}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                if (e.target.closest('.dropdown-list')) return;
                setStatusOpen(v => !v);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setStatusOpen(v => !v);
                }
              }}
            >
              <div className="service-box__label">
                {(() => {
                  const val = status ?? '';
                  const options = Array.isArray(statusOptions) ? statusOptions : [];
                  const found = options.find(o => o.value === val);
                  return found ? found.label : (val || 'Status');
                })()}
              </div>
              {statusOpen && (
                <ul className="dropdown-list" role="listbox">
                  {statusOptions.map((opt) => (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={opt.value === status}
                      onClick={() => {
                        onStatusChange?.(opt.value);
                        setStatusOpen(false);
                      }}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
