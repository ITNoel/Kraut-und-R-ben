// src/Staff.jsx

import React, { useState, useRef, useEffect } from 'react';
import 'react-day-picker/dist/style.css';
import '../global.css';
import './Staff.css'; // Staff.css kommt nach react-day-picker, um deren Styles zu überschreiben
import './Staff-opening-hours.css'; // Styles für Sonderzeiten
import { DayPicker } from 'react-day-picker';
import { de } from 'date-fns/locale';
import arrowIcon from '../assets/Buttons/arrow-icon.svg';
import trashIcon from '../assets/Buttons/trash-icon.svg';
import calenderIcon from '../assets/fonts/calender-icon.svg';
import addIcon from '../assets/Buttons/add-icon.svg';
import xIcon from '../assets/Buttons/x-icon.svg';
import clockIcon from '../assets/fonts/clock-icon.svg';
import plusIcon from '../assets/fonts/plus-icon.svg';
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
  // Single department selection (each employee belongs to exactly one department)
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [vacations, setVacations] = useState([]);
  const [vacationDays, setVacationDays] = useState([]);
  const [vacationRange, setVacationRange] = useState(undefined);

  // Sonderzeiten state (analog zu Öffnungszeiten in Department.js)
  const [useSonderzeiten, setUseSonderzeiten] = useState(false);
  const [timeBlocks, setTimeBlocks] = useState([
    {
      id: 1,
      selectedDays: [],
      timeStart: '',
      timeEnd: '',
      breakStart: '',
      breakEnd: ''
    }
  ]);

  const [pendingSave, setPendingSave] = useState(false);
  const [showSaveError, setShowSaveError] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    qualifications: ''
  });

  const deptRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (deptRef.current && !deptRef.current.contains(e.target)) setShowDeptDropdown(false);

      // Entferne Fokus von Kalendertagen wenn außerhalb geklickt wird
      const vacationContainer = document.querySelector('.vacation-calendar-container');
      if (vacationContainer && !vacationContainer.contains(e.target)) {
        const focusedDay = document.querySelector('.rdp-day:focus');
        if (focusedDay) {
          focusedDay.blur();
        }
      }
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
      phone: initialData.telephone ?? initialData.phone ?? '',
      qualifications: initialData.qualifications ?? ''
    });
    setHideStaff(initialData?.status === 'disabled');
    // initialData.department is numeric id -> set selectedDepartment to object if available
    if (initialData?.department != null) {
      const found = (Array.isArray(generalDepartments) ? generalDepartments : []).find(d => String(d.id) === String(initialData.department));
      setSelectedDepartment(found ?? { id: initialData.department, name: `Abteilung ${initialData.department}` });
    } else {
      setSelectedDepartment(null);
    }
    setVacations(Array.isArray(initialData.vacations) ? initialData.vacations.map(v => ({ from: new Date(v.from), to: new Date(v.to) })) : (initialData.vacations || []));

    // Sonderzeiten initialisieren
    if (initialData?.sonderzeiten) {
      setTimeBlocks(initialData.sonderzeiten);
      setUseSonderzeiten(initialData.useSonderzeiten ?? false);
    }
  }, [initialData, generalDepartments]);

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

  const handleVacationDaysSelect = (days) => {
    // Erlaube maximal 2 Tage
    if (!days || days.length === 0) {
      setVacationDays([]);
      setVacationRange(undefined);
      return;
    }

    // Begrenze auf maximal 2 Tage
    const selectedDays = days.length > 2 ? days.slice(0, 2) : days;
    setVacationDays(selectedDays);

    // Erstelle Range für die Tage dazwischen
    if (selectedDays.length === 2) {
      const sorted = [...selectedDays].sort((a, b) => a.getTime() - b.getTime());
      setVacationRange({ from: sorted[0], to: sorted[1] });
    } else {
      setVacationRange(undefined);
    }

    // Entferne Fokus von allen Kalendertagen um Rahmen zu vermeiden
    setTimeout(() => {
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement.classList && focusedElement.classList.contains('rdp-day')) {
        focusedElement.blur();
      }
    }, 0);
  };

  const addVacation = () => {
    if (vacationDays && vacationDays.length === 2) {
      const sorted = [...vacationDays].sort((a, b) => a.getTime() - b.getTime());
      const from = sorted[0];
      const to = sorted[1];
      setVacations(prev => [...prev, { from, to }]);
      setVacationDays([]);
      setVacationRange(undefined);
    } else {
      alert("Bitte genau zwei Tage auswählen.");
    }
  };

  const removeVacation = (i) => setVacations(prev => prev.filter((_, idx) => idx !== i));

  // Sonderzeiten-Funktionen (analog zu Department.js)
  const addTimeBlock = () => {
    const allSelectedDays = timeBlocks.flatMap(b => b.selectedDays);
    const allDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
    const availableDays = allDays.filter(day => !allSelectedDays.includes(day));

    if (availableDays.length === 0) {
      return;
    }

    setTimeBlocks(prev => [
      ...prev,
      {
        id: Date.now(),
        selectedDays: [],
        timeStart: '',
        timeEnd: '',
        breakStart: '',
        breakEnd: ''
      }
    ]);
  };

  const updateTimeBlock = (id, field, value) => {
    setTimeBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  const toggleDayInBlock = (blockId, day) => {
    setTimeBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        const days = block.selectedDays.includes(day)
          ? block.selectedDays.filter(d => d !== day)
          : [...block.selectedDays, day];
        return { ...block, selectedDays: days };
      }
      return block;
    }));
  };

  const areRequiredFieldsFilled = (form.first_name?.trim() || form.last_name?.trim()) !== '' && (form.email?.trim() || form.phone?.trim());

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
      qualifications: form.qualifications,
      vacations: vacations.map(v => ({ from: v.from instanceof Date ? v.from.toISOString() : v.from, to: v.to instanceof Date ? v.to.toISOString() : v.to })),
      status: hideStaff ? 'disabled' : (areRequiredFieldsFilled ? 'active' : 'draft'),
      // Sonderzeiten hinzufügen
      useSonderzeiten,
      sonderzeiten: timeBlocks
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
            <div className="section">
              <h2>Informationen</h2>
              <div className="form-grid labeled-inputs">
                <div className="form-grid two-col labeled-inputs">
                  <label>Vorname
                    <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                  </label>
                  <label>Nachname
                    <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                  </label>
                  <label>E-Mail*
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </label>
                  <label>Telefonnummer*
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </label>
                </div>
                <label className="full-width">Qualifikationen
                  <input value={form.qualifications} onChange={e => setForm(f => ({ ...f, qualifications: e.target.value }))} />
                </label>
              </div>
            </div>
          </div>

          <div className="page-container">
            <div className="section">
              <h2>Sonderzeiten</h2>
              <div className="opening-hours-toggle">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={useSonderzeiten}
                    onChange={() => setUseSonderzeiten(h => !h)}
                  />
                  <span className="slider" />
                </label>
                <span>Sonderzeiten übernehmen</span>
              </div>

              {/* Render all time blocks */}
              {timeBlocks.map((block, blockIndex) => {
                // Sammle alle bereits ausgewählten Tage aus ALLEN Blöcken
                const allSelectedDays = timeBlocks.flatMap(b => b.selectedDays);
                // Verfügbare Tage: Alle Tage minus die bereits in IRGENDEINEM Block ausgewählten
                const availableDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
                  .filter(day => !allSelectedDays.includes(day) || block.selectedDays.includes(day));

                return (
                  <div key={block.id} className="opening-hours-block">
                    {/* Selected Days Display Box */}
                    <h3 className="opening-hours-label">Wochentage</h3>
                    <div className="opening-hours-box">
                      {block.selectedDays.length === 0 ? (
                        <span className="opening-hours-placeholder">Keine Tage ausgewählt</span>
                      ) : (
                        (() => {
                          const dayOrder = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
                          const sortedDays = [...block.selectedDays].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
                          return sortedDays.map((day) => (
                            <button
                              key={day}
                              type="button"
                              className="opening-hours-day-tag"
                              onClick={() => toggleDayInBlock(block.id, day)}
                            >
                              <img src={xIcon} width={10} height={10} alt="" />
                              <span>{day}</span>
                            </button>
                          ));
                        })()
                      )}
                    </div>

                    {/* Weekday Buttons - nur noch nicht global ausgewählte Tage zeigen */}
                    <div className="opening-hours-days">
                      {availableDays
                        .filter(day => !block.selectedDays.includes(day))
                        .map((day) => (
                          <button
                            key={day}
                            type="button"
                            className="opening-hours-day-btn"
                            onClick={() => toggleDayInBlock(block.id, day)}
                          >
                            <img src={addIcon} width={14} height={14} alt="" />
                            <span>{day}</span>
                          </button>
                        ))}
                    </div>

                    {/* Time Input Fields */}
                    <div className="opening-hours-times">
                      <label className="time-input-label">
                        <div className="time-input-header">
                          <img src={clockIcon} width={18} height={18} alt="" />
                          <span>Uhrzeit Beginn*</span>
                        </div>
                        <input
                          type="time"
                          value={block.timeStart}
                          onChange={(e) => updateTimeBlock(block.id, 'timeStart', e.target.value)}
                        />
                      </label>
                      <label className="time-input-label">
                        <div className="time-input-header">
                          <img src={clockIcon} width={18} height={18} alt="" />
                          <span>Uhrzeit Ende*</span>
                        </div>
                        <input
                          type="time"
                          value={block.timeEnd}
                          onChange={(e) => updateTimeBlock(block.id, 'timeEnd', e.target.value)}
                        />
                      </label>
                      <label className="time-input-label">
                        <div className="time-input-header">
                          <img src={clockIcon} width={18} height={18} alt="" />
                          <span>Pause Beginn</span>
                        </div>
                        <input
                          type="time"
                          value={block.breakStart}
                          onChange={(e) => updateTimeBlock(block.id, 'breakStart', e.target.value)}
                        />
                      </label>
                      <label className="time-input-label">
                        <div className="time-input-header">
                          <img src={clockIcon} width={18} height={18} alt="" />
                          <span>Pause Ende</span>
                        </div>
                        <input
                          type="time"
                          value={block.breakEnd}
                          onChange={(e) => updateTimeBlock(block.id, 'breakEnd', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}

              {/* Divider */}
              <hr className="opening-hours-divider" />

              {/* Add More Button */}
              <button type="button" className="opening-hours-add-btn" onClick={addTimeBlock}>
                <img src={plusIcon} width={13} height={13} alt="" />
                <span>Mehr hinzufügen</span>
              </button>
            </div>
          </div>
        </div>

        <aside className="right-sidebar">
          <div className="page-container">
            <div className="section toggle-box">
              <span>Mitarbeiter ausblenden</span>
              <label className="switch">
                <input type="checkbox" checked={hideStaff} onChange={() => setHideStaff(s => !s)} />
                <span className="slider" />
              </label>
            </div>
          </div>

          <div className="page-container">
            <div className="section">
              <h2>Abteilung</h2>

              <div className="employee-dropdown-wrapper" ref={deptRef}>
                <button
                  type="button"
                  className={`employee-trigger ${showDeptDropdown ? 'open' : ''}`}
                  onClick={() => setShowDeptDropdown(v => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={showDeptDropdown}
                >
                  <span className="employee-trigger__chevron" aria-hidden="true">
                    <img src={arrowIcon} width={18} height={9} alt="" />
                  </span>
                  Abteilung hinzufügen
                </button>
                {showDeptDropdown && (
                  <ul className="dropdown-list" role="listbox">
                    {(Array.isArray(generalDepartments) ? generalDepartments : []).map((dept, i) => (
                      <li
                        key={i}
                        role="option"
                        tabIndex={0}
                        onClick={() => addDepartment(dept)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            addDepartment(dept);
                          }
                        }}
                      >
                        {dept.name ?? dept}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="employee-list-box">
                {selectedDepartment && (
                  <div className="employee-list-item">
                    <button className="employee-delete-btn" onClick={removeDepartment} aria-label="Abteilung entfernen">
                      <img src={trashIcon} width={16} height={16} alt="" />
                    </button>
                    <span>{selectedDepartment.name ?? selectedDepartment}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="page-container">
            <div className="section">
              <h2>Urlaub</h2>

              <button
                type="button"
                className="vacation-add-btn"
                onClick={addVacation}
              >
                <img src={calenderIcon} width={18} height={18} alt="" />
                Hinzufügen
              </button>

              <div className="vacation-calendar-container"
                onClick={(e) => {
                  // Entferne Fokus sofort nach Klick auf einen Tag
                  setTimeout(() => {
                    const focusedDay = document.querySelector('.rdp-day:focus');
                    if (focusedDay) {
                      focusedDay.blur();
                    }
                  }, 0);
                }}
              >
                <DayPicker
                  mode="multiple"
                  selected={vacationDays}
                  onSelect={handleVacationDaysSelect}
                  numberOfMonths={1}
                  showOutsideDays
                  locale={de}
                  modifiers={{
                    range_middle: (day) => {
                      if (!vacationRange?.from || !vacationRange?.to) return false;
                      const time = day.getTime();
                      const fromTime = vacationRange.from.getTime();
                      const toTime = vacationRange.to.getTime();
                      return time > fromTime && time < toTime;
                    },
                    range_start: (day) => {
                      if (!vacationRange?.from) return false;
                      return day.getTime() === vacationRange.from.getTime();
                    },
                    range_end: (day) => {
                      if (!vacationRange?.to) return false;
                      return day.getTime() === vacationRange.to.getTime();
                    }
                  }}
                  modifiersClassNames={{
                    range_middle: 'range_middle',
                    range_start: 'range_start',
                    range_end: 'range_end'
                  }}
                />
              </div>

              <div className="employee-list-box">
                {vacations.map((v, i) => (
                  <div key={i} className="employee-list-item">
                    <button className="employee-delete-btn" onClick={() => removeVacation(i)} aria-label="Urlaub entfernen">
                      <img src={trashIcon} width={16} height={16} alt="" />
                    </button>
                    <span>Von {v.from.toLocaleDateString()} bis {v.to.toLocaleDateString()}</span>
                  </div>
                ))}
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
