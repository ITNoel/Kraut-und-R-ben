// src/Department.jsx

import React, { useState, useEffect, useRef } from 'react';
import empty_staff from '../assets/empty-staff.png';
import empty_services from '../assets/empty-services.png';
import '../global.css';
import './Department.css';
import { api } from '../Functions/apiClient';

export default function Department({
  initialData,
  generalEmployees,
  generalServices, // NEW prop
  index,
  onSave,
  onUpdate,
  onCancel,
  navigateToStaff,
  navigateToServices
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
  const [pendingSave, setPendingSave] = useState(false); // NEU
  const [showSaveError, setShowSaveError] = useState(null); // NEU
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // NEU
  const [pendingDelete, setPendingDelete] = useState(false); // NEU
  const employeeRef = useRef();

  // NEW: services dropdown / global services
  const [generalServicesList, setGeneralServicesList] = useState([]);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showNoServiceModal, setShowNoServiceModal] = useState(false);
  const serviceRef = useRef();

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
    // Stelle sicher, dass initiale services als Objekte vorliegen (falls Backend evtl. Strings liefert)
    const initServices = (initialData?.services || []).map(s => {
      if (!s) return null;
      if (typeof s === 'string') {
        return {
          id: `local-${s}`,
          name: s,
          type: '',
          duration: 0,
          price: '0.00',
          description: '',
          booking_notification: '',
          payment_method: '',
          is_active: true
        };
      }
      return s;
    }).filter(Boolean);
    setServices(initServices);
  }, [initialData]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (employeeRef.current && !employeeRef.current.contains(e.target)) {
        setShowEmployeeDropdown(false);
      }
      if (serviceRef.current && !serviceRef.current.contains(e.target)) {
        setShowServiceDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use services provided by parent (App.js). Fallback auf leeres Array.
  useEffect(() => {
    setGeneralServicesList(Array.isArray(generalServices) ? generalServices : []);
  }, [generalServices]);

  // Die Liste, die im "Person hinzufügen"-Dropdown angezeigt wird:
  // Priorität: initialData.allEmployees (jede Abteilung bekommt die komplette Liste von App),
  // Fallback: global übergebene generalEmployees.
  const employeeOptions = Array.isArray(initialData?.allEmployees)
    ? initialData.allEmployees
    : (Array.isArray(generalEmployees) ? generalEmployees : []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Pflichtfelder: Name, E-Mail, Telefonnummer
  const areRequiredFieldsFilled = form.name.trim() !== '' && form.email.trim() !== '' && form.phone.trim() !== '';

  const makeDeptObj = () => ({
    // Falls initialData noch keine id hat (neue Abteilung), erzeugen wir eine temporäre id.
    id: initialData?.id ?? (index == null ? `local-dept-${Date.now()}` : undefined),
    name: form.name.trim(),
    employees: employees,
    // Status: disabled wenn ausgeblendet, sonst active falls Pflichtfelder erfüllt, sonst draft
    status: hideDept ? 'disabled' : (areRequiredFieldsFilled ? 'active' : 'draft'),
    email: form.email,
    phone: form.phone,
    street: form.street,
    room: form.room,
    postalCode: form.postalCode,
    city: form.city,
    services
  });

  // Speichern (ohne Schließen) — macht API-Call (POST/PUT) und ruft onUpdate mit dem Server‑Objekt auf
  const handleSave = async () => {
    const deptPayload = makeDeptObj();
    setPendingSave(true);
    setShowSaveError(null);
    try {
      let result = deptPayload;
      // Bestandsabfrage: vorhandene Abteilung hat eine server-id (keine local- prefix)
      const isNew = !initialData?.id || String(initialData.id).startsWith('local-');
      if (isNew) {
        // Erstelle neue Abteilung (spezifischer Create-Endpoint)
        const resp = await api.post('/departments/create', deptPayload);
        result = resp ?? deptPayload;
      } else {
        // Update vorhandene Abteilung
        const resp = await api.put(`/departments/${initialData.id}/`, deptPayload);
        result = resp ?? deptPayload;
      }
      // Callback: onUpdate erwartet (deptData, index)
      onUpdate(result, index);
    } catch (err) {
      setShowSaveError(err.message || 'Fehler beim Speichern');
    } finally {
      setPendingSave(false);
    }
  };

  // Speichern & Schließen — macht API-Call und ruft onSave (Schließen) mit Server-Objekt
  const handleSaveAndClose = async () => {
    const deptPayload = makeDeptObj();
    setPendingSave(true);
    setShowSaveError(null);
    try {
      let result = deptPayload;
      const isNew = !initialData?.id || String(initialData.id).startsWith('local-');
      if (isNew) {
        const resp = await api.post('/departments/create', deptPayload);
        result = resp ?? deptPayload;
      } else {
        const resp = await api.put(`/departments/${initialData.id}/`, deptPayload);
        result = resp ?? deptPayload;
      }
      onSave(result, index);
    } catch (err) {
      setShowSaveError(err.message || 'Fehler beim Speichern');
    } finally {
      setPendingSave(false);
    }
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
      const name = svc.trim();
      // vermeide Duplikate nach Namen
      if (services.some(s => String(s.name).toLowerCase() === name.toLowerCase())) return;
      const svcObj = {
        id: `local-${Date.now()}`,
        name,
        type: '',
        duration: 0,
        price: '0.00',
        description: '',
        booking_notification: '',
        payment_method: '',
        is_active: true
      };
      setServices(list => [...list, svcObj]);
    }
  };

  // NEW: add from dropdown (keine Duplikate)
  const addServiceFromDropdown = svc => {
    // svc kann string oder Objekt sein. Erzeuge ein vollständiges Service-Objekt.
    const sourceObj = typeof svc === 'string' ? { name: svc } : (svc || {});
    const svcObj = {
      id: sourceObj.id ?? `remote-${Date.now()}`,
      name: sourceObj.name ?? sourceObj.title ?? `Service-${Date.now()}`,
      type: sourceObj.type ?? '',
      duration: typeof sourceObj.duration === 'number' ? sourceObj.duration : Number(sourceObj.duration) || 0,
      price: sourceObj.price != null ? String(sourceObj.price) : '0.00',
      description: sourceObj.description ?? '',
      booking_notification: sourceObj.booking_notification ?? sourceObj.bookingNotification ?? '',
      payment_method: sourceObj.payment_method ?? sourceObj.paymentMethod ?? '',
      is_active: sourceObj.is_active ?? (sourceObj.active ?? true)
    };
    // Vermeidung von Duplikaten: nach id oder name
    const exists = services.some(s => (s.id != null && s.id === svcObj.id) || (s.name && s.name.toLowerCase() === svcObj.name.toLowerCase()));
    if (!exists) {
      setServices(list => [...list, svcObj]);
    }
    setShowServiceDropdown(false);
  };

  // NEW: gleiche Semantik wie Person hinzufügen
  const handleServiceAddClick = () => {
    // Wenn es keine globalen Dienste gibt → Modal (wie Person hinzufügen)
    if (generalServicesList.length === 0) {
      setShowNoServiceModal(true);
    } else {
      setShowServiceDropdown(v => !v);
    }
  };

  const handlePersonAddClick = () => {
    // Zeige Dropdown mit der kompletten Liste (employeeOptions).
    // Falls diese Liste leer ist, öffne das No-Staff-Modal.
    if (employeeOptions.length === 0) {
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
          <button className="btn save" onClick={handleSave} disabled={pendingSave}>
            {pendingSave ? 'Speichern…' : 'Speichern'}
          </button>
          <button className="btn save" onClick={handleSaveAndClose} disabled={pendingSave}>
            {pendingSave ? 'Speichern…' : 'Speichern &amp; schließen'}
          </button>
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

              {/* Liste der aktuell zur Abteilung hinzugefügten Dienste (ohne Platzhalter) */}
              <div className="list-box" style={{ marginBottom: 12 }}>
                {services.map((s, i) => (
                  <div key={s.id ?? `${s.name}-${i}`} className="list-item">
                    <span>{s.name}</span>
                    <button className="btn overflow" onClick={() => removeService(i)}>✕</button>
                  </div>
                ))}
              </div>

               {/* Dienste anlegen: zeigt Dropdown mit globalen Diensten oder Modal wenn keine vorhanden */}
               <div className={`service-box dashed${showServiceDropdown ? ' open' : ''}`} ref={serviceRef}>
                 <div onClick={handleServiceAddClick}>Dienste anlegen</div>

                 {showServiceDropdown && (
                   <ul className="dropdown-list">
                     {generalServicesList.length > 0 ? (
                       generalServicesList.map((opt, i) => {
                         const label = typeof opt === 'string' ? opt : (opt.name || opt.title || opt.type || `Dienst ${i+1}`);
                         return (
                           <li key={i} onClick={() => addServiceFromDropdown(opt)}>{label}</li>
                         );
                       })
                     ) : (
                       <li style={{ opacity: 0.7, padding: '10px' }}>Keine Dienste verfügbar</li>
                     )}
                   </ul>
                 )}
               </div>
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
                    {employeeOptions.map((opt, i) => (
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

      {/* Modal: keine Dienste */}
      {showNoServiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowNoServiceModal(false)}>×</button>
            <h2 className="modal-title">Keine Dienste vorhanden</h2>
            <img src={empty_services} alt="Illustration" className="modal-image" />
            <p className="modal-subheading">
              <strong>Aktuell sind keine Dienste angelegt</strong>
            </p>
            <p>Sobald Sie Dienste hinzugefügt haben, erscheinen diese hier.</p>
            <button
              className="btn save"
              onClick={() => {
                onUpdate(makeDeptObj(), index);
                setShowNoServiceModal(false);
                // navigate to services editor if provided by parent
                navigateToServices?.();
              }}
            >
              💾 Speichern & weiter zu den Diensten
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

      {/* Modal: Fehler beim Speichern */}
      {showSaveError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowSaveError(null)}>×</button>
            <h2 className="modal-title">Fehler beim Speichern</h2>
            <p className="modal-subheading">
              <strong>{showSaveError}</strong>
            </p>
            <p>Die Abteilung konnte nicht gespeichert werden. Bitte versuche es erneut oder prüfe die Eingaben.</p>
            <button className="btn save" onClick={() => setShowSaveError(null)}>Schließen</button>
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