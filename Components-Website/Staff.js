// src/Staff.jsx

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Staff.css';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function Staff() {
  const [hideStaff, setHideStaff] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const [assignedDepartments, setAssignedDepartments] = useState([]);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const [vacations, setVacations] = useState([]);
  const [vacationRange, setVacationRange] = useState(undefined);
  const [showVacationPicker, setShowVacationPicker] = useState(false);

  const weekdays = ['Mo','Di','Mi','Do','Fr','Sa','So'];
  const availableDepartments = ['Ordnungsamt', 'Sozialwesen', 'Bürgerbüro'];

  const dayRef = useRef();
  const deptRef = useRef();
  const vacationRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dayRef.current && !dayRef.current.contains(e.target)) setShowDayPicker(false);
      if (deptRef.current && !deptRef.current.contains(e.target)) setShowDeptDropdown(false);
      if (vacationRef.current && !vacationRef.current.contains(e.target)) setShowVacationPicker(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const addDepartment = (dept) => {
    if (!assignedDepartments.includes(dept)) {
      setAssignedDepartments(prev => [...prev, dept]);
    }
    setShowDeptDropdown(false);
  };

  const removeDepartment = (index) => {
    setAssignedDepartments(prev => prev.filter((_, i) => i !== index));
  };

  const saveVacation = () => {
    if (vacationRange?.from && vacationRange?.to) {
      setVacations(prev => [...prev, vacationRange]);
      setVacationRange(undefined);
      setShowVacationPicker(false);
    } else {
      alert("Bitte einen vollständigen Zeitraum wählen.");
    }
  };

  const removeVacation = (index) => {
    setVacations(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="department-page staff-page">
      <div className="page-header">
        <h1 className="page-header__title">Sachbearbeiter:innen anlegen</h1>
        <div className="page-header__actions">
          <button className="btn cancel">Abbrechen</button>
          <button className="btn save">Speichern &amp; schließen</button>
        </div>
      </div>

      <div className="department-body">
        <div className="left-column">
          <div className="page-container">
            <h2>Informationen</h2>
            <div className="form-grid three-col">
              <input className="input" placeholder="Name*" />
              <input className="input" placeholder="E-Mail*" />
              <input className="input" placeholder="Telefonnummer*" />
            </div>
          </div>

          <div className="page-container">
            <h2>Buchbarkeit</h2>
            <div className="form-grid two-col" ref={dayRef}>
              <div>
                <label>Datum</label>
                <div
                  className={
                    `input date-input-container` +
                    (showDayPicker ? ' open' : '') +
                    (selectedDays.length > 0 ? ' filled' : '')
                  }
                  onClick={() => setShowDayPicker(v => !v)}
                >
                  <div className="date-input-value">
                    {selectedDays.length > 0
                      ? selectedDays.join(', ')
                      : 'z.B. Mo, Di, Fr'}
                  </div>
                  {showDayPicker && (
                    <div className="day-picker-dropdown">
                      {weekdays.map(day => (
                        <button
                          key={day}
                          className={`day-chip${selectedDays.includes(day) ? ' selected' : ''}`}
                          onClick={e => { e.stopPropagation(); toggleDay(day); }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label>Schicht beginn*</label>
                <input className="input" placeholder="Von" />
              </div>
              <div>
                <label>Schicht ende*</label>
                <input className="input" placeholder="Bis" />
              </div>
              <div>
                <label>Pause beginn*</label>
                <input className="input" placeholder="Von" />
              </div>
              <div>
                <label>Pause ende*</label>
                <input className="input" placeholder="Bis" />
              </div>
            </div>
          </div>
        </div>

        <aside className="right-sidebar">
          <div className="page-container">
            <div className="toggle-box">
              <span>Diese Person ausblenden</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={hideStaff}
                  onChange={() => setHideStaff(s => !s)}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          {/* Abteilungen */}
          <div className="page-container">
            <div className="section">
              <h2>Abteilungen</h2>
              <div className="list-box">
                {assignedDepartments.map((dept, index) => (
                  <div key={index} className="list-item">
                    <span>{dept}</span>
                    <button className="btn overflow" onClick={() => removeDepartment(index)}>✕</button>
                  </div>
                ))}
              </div>
              <div
                className={`service-box dashed${showDeptDropdown ? ' open' : ''}`}
                onClick={() => setShowDeptDropdown(prev => !prev)}
                ref={deptRef}
              >
                <div>Abteilung hinzufügen</div>
                {showDeptDropdown && (
                  <ul className="dropdown-list">
                    {availableDepartments.map((dept, i) => (
                      <li key={i} onClick={() => addDepartment(dept)}>
                        {dept}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Urlaub */}
          <div className="page-container">
            <div className="section">
              <h2>Urlaub</h2>
              <div className="list-box">
                {vacations.map((v, i) => (
                  <div key={i} className="list-item">
                    <span>Von {v.from.toLocaleDateString()} bis {v.to.toLocaleDateString()}</span>
                    <button className="btn overflow" onClick={() => removeVacation(i)}>✕</button>
                  </div>
                ))}
              </div>

              <div
                  className={`service-box dashed${showVacationPicker ? ' open' : ''}`}
                  ref={vacationRef}
                >
                {!showVacationPicker && (
                  <div onClick={() => setShowVacationPicker(true)}>
                    Urlaub hinzufügen
                  </div>
                )}

                {showVacationPicker && (
                  <div className="calendar-dropdown">
                    <p style={{ fontWeight: 600, marginBottom: '8px' }}>Zeitraum wählen</p>

                    <DayPicker
                      mode="range"
                      selected={vacationRange}
                      onSelect={setVacationRange}
                      numberOfMonths={1}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button className="btn save" onClick={saveVacation}>
                        Speichern
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
