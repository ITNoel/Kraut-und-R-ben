// src/Staff.jsx

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Staff.css';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { api } from '../Functions/apiClient';
import { ROUTES } from '../app/routes';

export default function Staff({
  initialData = null,
  index = null,
  onSave,       // (staffObj, index) => ...
  onUpdate,     // (staffObj, index) => ...
  onCancel,     // () => ...
  onSelect,     // fallback navigation callback (optional)
  generalDepartments = []   // NEW: Liste aller Abteilungen (Objekte mit id, name)
}) {
  const [hideStaff, setHideStaff] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  // Single department selection (each employee belongs to exactly one department)
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [vacations, setVacations] = useState([]);
  const [vacationRange, setVacationRange] = useState(undefined);
  const [showVacationPicker, setShowVacationPicker] = useState(false);

  const [pendingSave, setPendingSave] = useState(false);
  const [showSaveError, setShowSaveError] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // NEU
  const [pendingDelete, setPendingDelete] = useState(false); // NEU
  const [showDeleteError, setShowDeleteError] = useState(null); // NEU

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

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

  // Initialisierung aus initialData (falls vorhanden)
  useEffect(() => {
    if (!initialData) return;
    setForm({
      first_name: initialData.first_name ?? '',
      last_name: initialData.last_name ?? '',
      email: initialData.email ?? '',
      phone: initialData.telephone ?? initialData.phone ?? ''
    });
    setHideStaff(initialData?.status === 'disabled');
    setSelectedDays(Array.isArray(initialData.days) ? initialData.days : []);
    // initialData.department is numeric id -> set selectedDepartment to object if available
    if (initialData?.department != null) {
      const found = (Array.isArray(generalDepartments) ? generalDepartments : []).find(d => String(d.id) === String(initialData.department));
      setSelectedDepartment(found ?? { id: initialData.department, name: `Abteilung ${initialData.department}` });
    } else {
      setSelectedDepartment(null);
    }
    setVacations(Array.isArray(initialData.vacations) ? initialData.vacations.map(v => ({ from: new Date(v.from), to: new Date(v.to) })) : (initialData.vacations || []));
  }, [initialData, generalDepartments]);

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Select single department from dropdown
  const addDepartment = (dept) => {
    // dept may be object or string; prefer object with id/name
    const deptObj = typeof dept === 'object' ? dept : { id: dept.id ?? dept, name: dept.name ?? String(dept) };
    setSelectedDepartment(deptObj);
    setShowDeptDropdown(false);
  };

  const removeDepartment = () => {
    setSelectedDepartment(null);
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

  const removeVacation = (i) => setVacations(prev => prev.filter((_, idx) => idx !== i));

  const areRequiredFieldsFilled = (form.first_name?.trim() || form.last_name?.trim()) !== '' && (form.email?.trim() || form.phone?.trim());

  // Neue State: Schicht- & Pausenzeiten (für Buchbarkeit)
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [breakStart, setBreakStart] = useState('');
  const [breakEnd, setBreakEnd] = useState('');

  // Gespeicherte Buchbarkeits-Einträge (erscheinen über den Inputs)
  const [savedAvailabilities, setSavedAvailabilities] = useState([]);

  const makeStaffObj = () => {
    const name = `${form.first_name || ''}${form.last_name ? ' ' + form.last_name : ''}`.trim();
    return {
      id: initialData?.id ?? (index == null ? `local-staff-${Date.now()}` : undefined),
      first_name: form.first_name,
      last_name: form.last_name,
      date_of_birth: initialData?.date_of_birth ?? null,
      telephone: form.phone,
      position: initialData?.position ?? '',
      group: initialData?.group ?? '',
      permissions: initialData?.permissions ?? '',
      user: initialData?.user ?? null,
      // department should be id (number)
      department: selectedDepartment ? (selectedDepartment.id ?? selectedDepartment) : null,
      name,
      email: form.email,
      days: selectedDays,
      // optional: persistieren der Zeitslots
      shift_start: shiftStart,
      shift_end: shiftEnd,
      break_start: breakStart,
      break_end: breakEnd,
      vacations: vacations.map(v => ({ from: v.from instanceof Date ? v.from.toISOString() : v.from, to: v.to instanceof Date ? v.to.toISOString() : v.to })),
      status: hideStaff ? 'disabled' : (areRequiredFieldsFilled ? 'active' : 'draft')
    };
  };

  // API Save (ohne schließen) -> onUpdate callback
  const handleSave = async () => {
    const payload = makeStaffObj();
    setPendingSave(true);
    setShowSaveError(null);
    try {
      let result = payload;
      const isNew = !initialData?.id || String(initialData?.id).startsWith('local-');
      if (isNew) {
        const resp = await api.post('/employees/create', payload);
        result = resp ?? payload;
      } else {
        const resp = await api.put(`/employees/${initialData.id}/`, payload);
        result = resp ?? payload;
      }
      if (typeof onUpdate === 'function') {
        onUpdate(result, index);
      } else if (typeof onSelect === 'function') {
        // fallback: navigate back to overview if no callback provided
        onSelect('staff-overview');
      }
    } catch (err) {
      setShowSaveError(err.message || 'Fehler beim Speichern');
    } finally {
      setPendingSave(false);
    }
  };

  // API Save & Close -> onSave callback
  const handleSaveAndClose = async () => {
    const payload = makeStaffObj();
    setPendingSave(true);
    setShowSaveError(null);
    try {
      let result = payload;
      const isNew = !initialData?.id || String(initialData?.id).startsWith('local-');
      if (isNew) {
        const resp = await api.post('/employees/create', payload);
        result = resp ?? payload;
      } else {
        const resp = await api.put(`/employees/${initialData.id}/`, payload);
        result = resp ?? payload;
      }
      if (typeof onSave === 'function') {
        onSave(result, index);
      } else if (typeof onSelect === 'function') {
        onSelect('staff-overview');
      }
    } catch (err) {
      setShowSaveError(err.message || 'Fehler beim Speichern');
    } finally {
      setPendingSave(false);
    }
  };

  const handleCancelClick = () => {
    if (typeof onCancel === 'function') {
      onCancel();
      return;
    }
    if (typeof onSelect === 'function') {
      onSelect(ROUTES.STAFF_OVERVIEW);
    }
  };

  const handleDelete = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false);
    setPendingDelete(true);
    try {
      await api.delete(`/employees/${initialData.id}/`);
      if (typeof onUpdate === 'function') {
        onUpdate(null, index); // entferne aus Liste
      } else if (typeof onSelect === 'function') {
        onSelect('staff-overview');
      }
      if (typeof onCancel === 'function') onCancel();
    } catch (err) {
      setShowDeleteError(err.message || 'Unbekannter Fehler beim Löschen');
    } finally {
      setPendingDelete(false);
    }
  };

  const saveBookability = () => {
    const entry = {
      days: Array.isArray(selectedDays) ? selectedDays.slice() : [],
      shiftStart: shiftStart || null,
      shiftEnd: shiftEnd || null,
      breakStart: breakStart || null,
      breakEnd: breakEnd || null
    };
    setSavedAvailabilities(prev => [entry, ...prev]);

    // Nach dem Speichern: Eingabefelder zurücksetzen und DayPicker schließen
    setSelectedDays([]);
    setShiftStart('');
    setShiftEnd('');
    setBreakStart('');
    setBreakEnd('');
    setShowDayPicker(false);
  };

  const removeSavedAvailability = (idx) =>
    setSavedAvailabilities(prev => prev.filter((_, i) => i !== idx));

  const renderDay = (day) => selectedDays.includes(day) ? '✓' : '';

  return (
    <div className="department-page staff-page">
      <div className="staff-header-wrapper">
        <div className="page-header">
          <h1 className="page-header__title">Sachbearbeiter:in anlegen / bearbeiten</h1>
          <div className="page-header__actions">
            {initialData?.id && (
              <button className="btn save" onClick={handleDelete}>Löschen</button>
            )}
            <button className="btn cancel" type="button" onClick={handleCancelClick}>Abbrechen</button>
            <button className="btn save" onClick={handleSave} disabled={pendingSave}>
              {pendingSave ? 'Speichern…' : 'Speichern'}
            </button>
            <button className="btn save" onClick={handleSaveAndClose} disabled={pendingSave}>
              {pendingSave ? 'Speichern…' : 'Speichern &amp; schließen'}
            </button>
          </div>
        </div>
      </div>

      <div className="department-body">
        <div className="left-column">
          <div className="page-container">
            <h2>Informationen</h2>
            <div className="form-grid three-col">
              <label className="form-item">Vorname
                <input className="input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
              </label>
              <label className="form-item">Nachname
                <input className="input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
              </label>
              <label className="form-item">E-Mail*
                <input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </label>
              <label className="form-item">Telefonnummer*
                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </label>
            </div>
          </div>

          <div className="page-container">
            <h2>Buchbarkeit</h2>

            {/* Gespeicherte Buchbarkeiten (erscheinen über den Inputs) */}
            {savedAvailabilities.length > 0 && (
              <div className="list-box" style={{ marginBottom: 12 }}>
                {savedAvailabilities.map((a, i) => {
                  const daysText = (Array.isArray(a.days) && a.days.length) ? a.days.join(', ') : '—';
                  const shiftText = a.shiftStart || a.shiftEnd ? `${a.shiftStart || '--'}–${a.shiftEnd || '--'}` : '';
                  const breakText = a.breakStart || a.breakEnd ? ` (Pause ${a.breakStart || '--'}–${a.breakEnd || '--'})` : '';
                  return (
                    <div className="list-item" key={i}>
                      <span>{daysText}{shiftText ? ` • ${shiftText}${breakText}` : ''}</span>
                      <button className="btn overflow" onClick={() => removeSavedAvailability(i)}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="form-grid two-col" ref={dayRef}>
              <div>
                <label>Wochentage</label>
                <div
                  className={`input date-input-container${showDayPicker ? ' open' : ''}${selectedDays.length > 0 ? ' filled' : ''}`}
                  onClick={() => setShowDayPicker(v => !v)}
                >
                  <div className="date-input-value">
                    {selectedDays.length > 0 ? selectedDays.join(', ') : 'z.B. Mo, Di, Fr'}
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
                <label className="form-item">Schicht beginn
                  <input className="input" value={shiftStart} onChange={e => setShiftStart(e.target.value)} placeholder="z.B. 09:00" />
                </label>
              </div>
              <div>
                <label className="form-item">Schicht ende
                  <input className="input" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} placeholder="z.B. 17:00" />
                </label>
              </div>
              <div>
                <label className="form-item">Pause beginn
                  <input className="input" value={breakStart} onChange={e => setBreakStart(e.target.value)} placeholder="z.B. 12:00" />
                </label>
              </div>
              <div>
                <label className="form-item">Pause ende
                  <input className="input" value={breakEnd} onChange={e => setBreakEnd(e.target.value)} placeholder="z.B. 12:30" />
                </label>
              </div>
              {/* Buchbarkeit speichern Button */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  className="btn save"
                  onClick={saveBookability}
                  style={{ width: 'auto', maxWidth: 'none', padding: '8px 12px' }}
                >
                  Buchbarkeit speichern
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="right-sidebar">
          <div className="page-container">
            <div className="toggle-box">
              <span>Diese Person ausblenden</span>
              <label className="switch">
                <input type="checkbox" checked={hideStaff} onChange={() => setHideStaff(s => !s)} />
                <span className="slider" />
              </label>
            </div>
          </div>

          <div className="page-container">
            <div className="section">
              <h2>Abteilung</h2>
              <div className="list-box">
                {selectedDepartment && (
                  <div className="list-item">
                    <span>{selectedDepartment.name ?? selectedDepartment}</span>
                    <button className="btn overflow" onClick={removeDepartment}>✕</button>
                  </div>
                )}
              </div>
              <div className={`service-box dashed${showDeptDropdown ? ' open' : ''}`} onClick={() => setShowDeptDropdown(p => !p)} ref={deptRef}>
                <div>Abteilung auswählen</div>
                {showDeptDropdown && (
                  <ul className="dropdown-list">
                    {(Array.isArray(generalDepartments) ? generalDepartments : []).map((dept, i) => (
                      <li key={i} onClick={() => addDepartment(dept)}>
                        {dept.name ?? dept}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

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
                role="button"
                tabIndex={0}
                onClick={(e) => { if (e.target.closest('.calendar-dropdown')) return; setShowVacationPicker(v => !v); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowVacationPicker(v => !v); } }}
              >
                <div className="service-box__label">Urlaub hinzufügen</div>
                {showVacationPicker && (
                  <div className="calendar-dropdown">
                    <p style={{ fontWeight: 600, marginBottom: '8px' }}>Zeitraum wählen</p>
                    <DayPicker mode="range" selected={vacationRange} onSelect={setVacationRange} numberOfMonths={1} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button className="btn save" onClick={saveVacation}>Speichern</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal: Fehler beim Speichern */}
      {showSaveError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowSaveError(null)}>×</button>
            <h2 className="modal-title">Fehler beim Speichern</h2>
            <p className="modal-subheading"><strong>{showSaveError}</strong></p>
            <p>Die Daten konnten nicht gespeichert werden. Bitte versuche es erneut.</p>
            <button className="btn save" onClick={() => setShowSaveError(null)}>Schließen</button>
          </div>
        </div>
      )}

      {/* Modal: Fehler beim Löschen */}
      {showDeleteError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowDeleteError(null)}>×</button>
            <h2 className="modal-title">Fehler beim Löschen</h2>
            <p className="modal-subheading">
              <strong>{showDeleteError}</strong>
            </p>
            <p>Der Sachbearbeiter konnte nicht gelöscht werden. Bitte versuche es erneut oder kontaktiere den Support.</p>
            <button className="btn save" onClick={() => setShowDeleteError(null)}>Schließen</button>
          </div>
        </div>
      )}

      {/* Modal: Bestätigung vor Löschen */}
      {showConfirmDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowConfirmDeleteModal(false)}>×</button>
            <h2 className="modal-title">Sachbearbeiter:in wirklich löschen?</h2>
            <p className="modal-subheading" style={{ marginTop: 12 }}>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <p>Möchtest du die Person <strong>„{form.first_name} {form.last_name}“</strong> wirklich löschen?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button className="btn cancel" onClick={() => setShowConfirmDeleteModal(false)}>Abbrechen</button>
              <button className="btn save" onClick={handleConfirmDelete} disabled={pendingDelete}>
                {pendingDelete ? 'Lösche…' : 'Ja, löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
