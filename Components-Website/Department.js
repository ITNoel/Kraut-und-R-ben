// src/Department.jsx

import React, { useState, useEffect, useRef } from 'react';
import empty_staff from '../assets/empty-staff.png';
import '../global.css';
import './Department.css';
import { api } from '../Functions/apiClient';

export default function Department({
  initialData,
  generalEmployees,
  index,
  onSave,
  onUpdate,
  onCancel,
  navigateToStaff
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    room: '',
    postalCode: '',
    city: '',
  });
  const [hideDept, setHideDept] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showNoStaffModal, setShowNoStaffModal] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // NEU
  const [pendingDelete, setPendingDelete] = useState(false); // NEU
  const employeeRef = useRef();

  useEffect(() => {
    setForm({
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      street: initialData?.street || '',
      room: initialData?.room || '',
      postalCode: initialData?.postalCode || '',
      city: initialData?.city || '',
    });
    setHideDept(initialData?.status === 'disabled');

    const merged = [...(initialData?.employees || [])];
    const unique = [];
    const seen = new Set();

    for (const emp of merged) {
      const id = emp.id ?? `${emp.first_name}-${emp.last_name}`;
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(emp);
      }
    }

    setEmployees(unique);
    setServices(initialData?.services || []);
  }, [initialData]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (employeeRef.current && !employeeRef.current.contains(e.target)) {
        setShowEmployeeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const isNameValid = form.name.trim() !== '';

  const makeDeptObj = () => ({
    name: form.name.trim(),
    employees: employees,
    status: hideDept ? 'disabled' : 'active',
    email: form.email,
    phone: form.phone,
    street: form.street,
    room: form.room,
    postalCode: form.postalCode,
    city: form.city,
    services
  });

  const handleSave = () => {
    if (!isNameValid) return;
    onUpdate(makeDeptObj(), index);
  };

  const handleSaveAndClose = () => {
    if (!isNameValid) return;
    onSave(makeDeptObj(), index);
  };

  const handleCancel = () => onCancel();

  const handleDelete = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false);
    setPendingDelete(true);

    try {
      await api.delete(`/departments/${initialData.id}/`);
      onUpdate(null, index);  // aus globaler Liste entfernen
      onCancel();             // zur Übersicht zurück
    } catch (err) {
      setShowDeleteError(err.message || 'Unbekannter Fehler beim Löschen');
    } finally {
      setPendingDelete(false);
    }
  };

  const removeEmployee = i =>
    setEmployees(list => list.filter((_, idx) => idx !== i));

  const addEmployeeFromDropdown = emp => {
    if (!employees.some(e => e.id === emp.id)) {
      setEmployees(list => [...list, emp]);
    }
    setShowEmployeeDropdown(false);
  };

  const removeService = i =>
    setServices(list => list.filter((_, idx) => idx !== i));

  const addService = () => {
    const svc = prompt('Name des Dienstes');
    if (svc && svc.trim()) {
      setServices(list => [...list, svc.trim()]);
    }
  };

  const handlePersonAddClick = () => {
    if (employees.length === 0) {
      setShowNoStaffModal(true);
    } else {
      setShowEmployeeDropdown(v => !v);
    }
  };

  return (
    <div className="department-page">
      <div className="page-header">
        <h1 className="page-header__title">Abteilung anlegen</h1>
        <div className="page-header__actions">
          {initialData?.id && (
            <button className="btn save" onClick={handleDelete}>Löschen</button>
          )}
          <button className="btn cancel" onClick={handleCancel}>Abbrechen</button>
          <button className="btn save" onClick={handleSave} disabled={!isNameValid}>Speichern</button>
          <button className="btn save" onClick={handleSaveAndClose} disabled={!isNameValid}>Speichern &amp; schließen</button>
        </div>
      </div>

      <div className="department-body">
        <div className="left-column">
          <div className="page-container">
            <div className="section">
              <h2>Informationen</h2>
              <div className="form-grid two-col labeled-inputs">
                <label>Name*<input name="name" value={form.name} onChange={handleChange} /></label>
                <label>E-Mail*<input name="email" value={form.email} onChange={handleChange} /></label>
                <label>Telefonnummer*<input name="phone" value={form.phone} onChange={handleChange} /></label>
                <label>Straße<input name="street" value={form.street} onChange={handleChange} /></label>
                <label>Raum<input name="room" value={form.room} onChange={handleChange} /></label>
                <label>Postleitzahl<input name="postalCode" value={form.postalCode} onChange={handleChange} /></label>
                <label>Ort<input name="city" value={form.city} onChange={handleChange} /></label>
              </div>
            </div>
          </div>

          <div className="page-container">
            <div className="section">
              <h2>Dienste</h2>
              <div className="service-box" onClick={addService}>+ Dienste anlegen</div>
            </div>
          </div>
        </div>

        <aside className="right-sidebar">
          <div className="page-container">
            <div className="section toggle-box">
              <span>Abteilung ausblenden</span>
              <label className="switch">
                <input type="checkbox" checked={hideDept} onChange={() => setHideDept(h => !h)} />
                <span className="slider" />
              </label>
            </div>
          </div>

          <div className="page-container">
            <div className="section">
              <h2>Personen</h2>
              <div className="list-box">
                {employees.map((p, i) => (
                  <div key={i} className="list-item">
                    <span>{p.first_name} {p.last_name}</span>
                    <button className="btn overflow" onClick={() => removeEmployee(i)}>✕</button>
                  </div>
                ))}
              </div>

              <div className={`service-box dashed${showEmployeeDropdown ? ' open' : ''}`} ref={employeeRef}>
                <div onClick={handlePersonAddClick}>Person hinzufügen</div>
                {showEmployeeDropdown && (
                  <ul className="dropdown-list">
                    {generalEmployees?.map((opt, i) => (
                      <li key={i} onClick={() => addEmployeeFromDropdown(opt)}>
                        {opt.first_name} {opt.last_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal: keine Sachbearbeiter:innen */}
      {showNoStaffModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowNoStaffModal(false)}>×</button>
            <h2 className="modal-title">Keine Sachbearbeiter:innen vorhanden</h2>
            <img src={empty_staff} alt="Illustration" className="modal-image" />
            <p className="modal-subheading">
              <strong>Aktuell sind keine Sachbearbeiter:innen angelegt</strong>
            </p>
            <p>Sobald Sie Sachbearbeiter hinzugefügt haben, erscheinen diese hier.</p>
            <button
              className="btn save"
              onClick={() => {
                onUpdate(makeDeptObj(), index);
                setShowNoStaffModal(false);
                navigateToStaff?.();
              }}
            >
              💾 Speichern & weiter zu den Sachbearbeiter:innen
            </button>
          </div>
        </div>
      )}

      {/* Modal: Fehler beim Löschen */}
      {showDeleteError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowDeleteError(null)}>×</button>
            <h2 className="modal-title">Fehler beim Löschen</h2>
            <img src={empty_staff} alt="Fehler Illustration" className="modal-image" />
            <p className="modal-subheading">
              <strong>{showDeleteError}</strong>
            </p>
            <p>Die Abteilung konnte nicht gelöscht werden. Bitte versuche es erneut oder kontaktiere den Support.</p>
            <button className="btn save" onClick={() => setShowDeleteError(null)}>Schließen</button>
          </div>
        </div>
      )}

      {/* Modal: Bestätigung vor Löschen */}
      {showConfirmDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowConfirmDeleteModal(false)}>×</button>
            <h2 className="modal-title">Abteilung wirklich löschen?</h2>
            <p className="modal-subheading" style={{ marginTop: 12 }}>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <p>Möchtest du die Abteilung <strong>„{form.name}“</strong> wirklich löschen?</p>
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
