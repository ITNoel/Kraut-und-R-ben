// src/Components-Website/SearchBar.jsx

import React, { useState, useRef, useEffect } from 'react';
import './SearchBar.css';
import arrowSvg from '../assets/Buttons/arrow-icon.svg';
import lenseSvg from '../assets/lense-icon.svg';
// Inline SVGs ersetzen die Bild-Assets für bessere Schärfe/Kontrolle

export default function SearchBar({
  label = 'Filter & Ansicht',
  term,
  onTermChange,
  placeholder = 'Suche',
  status,
  onStatusChange,
  statusOptions = null,
  department,
  onDepartmentChange,
  departmentOptions = null,
}) {
  const [open, setOpen] = useState(true);
  // Custom Dropdown-State für Status
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef();
  // Custom Dropdown-State für Department
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const departmentRef = useRef();

  useEffect(() => {
    const onDocClick = (e) => {
      if (statusRef.current && !statusRef.current.contains(e.target)) {
        setStatusOpen(false);
      }
      if (departmentRef.current && !departmentRef.current.contains(e.target)) {
        setDepartmentOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
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
          <img src={arrowSvg} alt="" width={20} height={10} />
        </button>
      </div>

      {open && (
        <div className="filter-bar__controls">
          <div className="filter-bar__control filter-bar__search">
            <img className="search-icon" src={lenseSvg} width={17} height={17} alt="Suchen" />
            <input
              type="text"
              value={term ?? ''}
              onChange={(e) => onTermChange?.(e.target.value)}
              placeholder={placeholder}
            />
          </div>

          {Array.isArray(statusOptions) && statusOptions.length > 0 && (
            <div className="filter-bar__status" ref={statusRef}>
              <button
                type="button"
                className={`status-trigger ${statusOpen ? 'open' : ''}`}
                onClick={() => setStatusOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={statusOpen}
              >
                <span className="status-trigger__chevron" aria-hidden="true"><img src={arrowSvg} width={18} height={9} alt="" /></span>
                {(() => {
                  const val = status ?? '';
                  const options = Array.isArray(statusOptions) ? statusOptions : [];
                  const found = options.find((o) => o.value === val);
                  if (!found || val === '' || val === 'all') return 'Status';
                  return found.label;
                })()}
              </button>
              {statusOpen && (
                <ul className="dropdown-list" role="listbox">
                  {statusOptions.map((opt) => (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={opt.value === status}
                      tabIndex={0}
                      onClick={() => { onStatusChange?.(opt.value); setStatusOpen(false); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onStatusChange?.(opt.value);
                          setStatusOpen(false);
                        }
                      }}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {Array.isArray(departmentOptions) && departmentOptions.length > 0 && (
            <div className="filter-bar__status" ref={departmentRef}>
              <button
                type="button"
                className={`status-trigger ${departmentOpen ? 'open' : ''}`}
                onClick={() => setDepartmentOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={departmentOpen}
              >
                <span className="status-trigger__chevron" aria-hidden="true"><img src={arrowSvg} width={18} height={9} alt="" /></span>
                {(() => {
                  const val = department ?? '';
                  const options = Array.isArray(departmentOptions) ? departmentOptions : [];
                  const found = options.find((o) => o.value === val);
                  if (!found || val === '' || val === 'all') return 'Abteilung';
                  return found.label;
                })()}
              </button>
              {departmentOpen && (
                <ul className="dropdown-list" role="listbox">
                  {departmentOptions.map((opt) => (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={opt.value === department}
                      tabIndex={0}
                      onClick={() => { onDepartmentChange?.(opt.value); setDepartmentOpen(false); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onDepartmentChange?.(opt.value);
                          setDepartmentOpen(false);
                        }
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
