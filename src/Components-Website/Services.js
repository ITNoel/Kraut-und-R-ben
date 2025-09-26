// src/Services.jsx

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Services.css';
import { api } from '../Functions/apiClient';
import { ROUTES } from '../app/routes';

export default function Services({ initialData = null, index = null, generalServices = [], onSaveService, onUpdateService, onCancel, generalDepartments = [] }) {
  const [hideService, setHideService] = useState(false);
  const [pendingSave, setPendingSave] = useState(false); // NEU
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // NEU
  const [pendingDelete, setPendingDelete] = useState(false); // NEU
  const [showDeleteError, setShowDeleteError] = useState(null); // NEU
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const deptRef = useRef();
  const notifRef = useRef();
  const paymentRef = useRef();

  const deptOptions = ['Bauamt', 'Sozial & Familienamt', 'Finanzabteilung', 'Personal'];
  const notifOptions = ['Team A', 'Team B', 'Team C'];
  const paymentOptions = ['Kreditkarte', 'PayPal', 'Rechnung'];

  useEffect(() => {
    function handleClickOutside(e) {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setShowDeptDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (paymentRef.current && !paymentRef.current.contains(e.target)) {
        setShowPaymentDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form state (verwende initialData falls vorhanden)
  const [form, setForm] = useState({
    name: initialData?.name || '',
    type: initialData?.type || '',
    duration: initialData?.duration || '',
    price: initialData?.price || '',
    description: initialData?.description || '',
    booking_notification: initialData?.booking_notification || '',
    payment_method: initialData?.payment_method || '',
    is_active: initialData?.is_active ?? true
  });

  // Neue Feld-Konfigurationen (6 Felder mit je 'disabled'|'optional'|'required')
  const [fieldOptions, setFieldOptions] = useState({
    address: 'optional',
    altAddress: 'optional',
    email: 'optional',
    altEmail: 'optional',
    phone: 'optional',
    altPhone: 'optional'
  });

  // initialData.fields (falls vom Server) übernehmen
  useEffect(() => {
    if (initialData?.fields && typeof initialData.fields === 'object') {
      setFieldOptions(prev => ({ ...prev, ...initialData.fields }));
    }
  }, [initialData]);

  // initialData.department (falls vorhanden) übernehmen
  useEffect(() => {
    if (initialData?.department != null) {
      const found = (Array.isArray(generalDepartments) ? generalDepartments : []).find(d => String(d.id) === String(initialData.department));
      setSelectedDepartment(found ?? { id: initialData.department, name: `Abteilung ${initialData.department}` });
    } else {
      setSelectedDepartment(null);
    }
  }, [initialData, generalDepartments]);

  const setFieldOption = (key, value) => {
    setFieldOptions(prev => ({ ...prev, [key]: value }));
  };

  const backToOverview = () => {
    if (typeof onCancel === 'function') {
      onCancel();
      return;
    }
    // no onCancel provided — nothing we can reliably do here
  };

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addDepartment = (dept) => {
    const deptObj = typeof dept === 'object' ? dept : { id: dept, name: String(dept) };
    setSelectedDepartment(deptObj);
    setShowDeptDropdown(false);
  };
  const removeDepartment = () => setSelectedDepartment(null);

  // Save (update only, bleibt im Editor) — ruft onUpdateService
  const handleSave = async () => {
    const svcObj = {
      id: initialData?.id ?? (index == null ? `local-svc-${Date.now()}` : undefined),
      name: form.name,
      type: form.type,
      duration: Number(form.duration) || form.duration,
      price: form.price != null ? String(form.price) : '0.00',
      description: form.description || '',
      booking_notification: form.booking_notification || '',
      payment_method: form.payment_method || '',
      is_active: form.is_active ?? true,
      status: hideService ? 'disabled' : ((form.name && form.duration) ? 'active' : 'draft'),
      department: selectedDepartment ? (selectedDepartment.id ?? selectedDepartment) : null,
      // Neue Feldkonfigurationen mitschicken
      fields: fieldOptions
    };
    setPendingSave(true);
    try {
      let result = svcObj;
      const isNew = !initialData?.id || String(initialData?.id).startsWith('local-');
      if (isNew) {
        const resp = await api.post('/services/create', svcObj);
        result = resp ?? svcObj;
      } else {
        const resp = await api.put(`/services/${initialData.id}/`, svcObj);
        result = resp ?? svcObj;
      }
      if (typeof onUpdateService === 'function') {
        onUpdateService(result, index);
      }
      // bleibt im Editor (kein backToOverview)
    } catch (err) {
      alert('Fehler beim Speichern des Dienstes: ' + (err.message || err));
    } finally {
      setPendingSave(false);
    }
  };

  // Save & Close — ruft onSaveService und kehrt zur Übersicht zurück
  const handleSaveAndClose = async () => {
    const svcObj = {
      id: initialData?.id ?? (index == null ? `local-svc-${Date.now()}` : undefined),
      name: form.name,
      type: form.type,
      duration: Number(form.duration) || form.duration,
      price: form.price != null ? String(form.price) : '0.00',
      description: form.description || '',
      booking_notification: form.booking_notification || '',
      payment_method: form.payment_method || '',
      is_active: form.is_active ?? true,
      status: hideService ? 'disabled' : ((form.name && form.duration) ? 'active' : 'draft'),
      department: selectedDepartment ? (selectedDepartment.id ?? selectedDepartment) : null,
      // Neue Feldkonfigurationen mitschicken
      fields: fieldOptions
    };
    setPendingSave(true);
    try {
      let result = svcObj;
      const isNew = !initialData?.id || String(initialData?.id).startsWith('local-');
      if (isNew) {
        const resp = await api.post('/services/create', svcObj);
        result = resp ?? svcObj;
      } else {
        const resp = await api.put(`/services/${initialData.id}/`, svcObj);
        result = resp ?? svcObj;
      }
      if (typeof onSaveService === 'function') {
        onSaveService(result, index);
      } else if (typeof onUpdateService === 'function') {
        onUpdateService(result, index);
      }
      backToOverview();
    } catch (err) {
      alert('Fehler beim Speichern des Dienstes: ' + (err.message || err));
    } finally {
      setPendingSave(false);
    }
  };

  // Löschen: öffnet Bestätigungsmodal
  const handleDelete = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false);
    setPendingDelete(true);
    try {
      await api.delete(`/services/${initialData.id}/`);
      if (typeof onUpdateService === 'function') {
        onUpdateService(null, index); // entferne aus globaler Liste
      }
      if (typeof onCancel === 'function') onCancel();
    } catch (err) {
      setShowDeleteError(err.message || 'Unbekannter Fehler beim Löschen');
    } finally {
      setPendingDelete(false);
    }
  };

  return (
    <div className="department-page services-page">
      <div className="page-header">
        <h1 className="page-header__title">Dienste anlegen</h1>
        <div className="page-header__actions">
          {initialData?.id && (
            <button className="btn save" onClick={handleDelete}>Löschen</button>
          )}
          <button className="btn cancel" type="button" onClick={backToOverview}>Abbrechen</button>
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
            <h2>Informationen</h2>
            <div className="form-grid two-col">
              <div className="form-item">
                <label>Art
                  <input value={form.type} onChange={e => handleChange('type', e.target.value)} />
                </label>
              </div>
              <div className="form-item">
                <label>Name *
                  <input value={form.name} onChange={e => handleChange('name', e.target.value)} />
                </label>
              </div>
              <div className="form-item">
                <label>Dauer *
                  <input value={form.duration} onChange={e => handleChange('duration', e.target.value)} />
                </label>
              </div>
              <div className="form-item">
                <label>Preis
                  <input value={form.price} onChange={e => handleChange('price', e.target.value)} />
                </label>
              </div>
              <div className="form-item full-width">
                <label>Hinweis
                  <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} />
                </label>
              </div>
            </div>
          </div>
          {/* Neue weiße Box "Felder" mit Radio-Optionen */}
          <div className="page-container">
            <h2>Felder</h2>
            <div className="fields-grid">
              {[
                { key: 'address', label: 'Adresse' },
                { key: 'altAddress', label: 'Abweichende Adresse' },
                { key: 'email', label: 'E-Mail' },
                { key: 'altEmail', label: 'Abweichende E-Mail' },
                { key: 'phone', label: 'Telefon' },
                { key: 'altPhone', label: 'abweichendes Telefon' },
              ].map(f => (
                <div className="field-box" key={f.key}>
                  <div className="field-title">{f.label}</div>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input type="radio" name={f.key} value="disabled" checked={fieldOptions[f.key] === 'disabled'} onChange={() => setFieldOption(f.key, 'disabled')} />
                      <span>deaktiviert</span>
                    </label>
                    <label className="radio-option">
                      <input type="radio" name={f.key} value="optional" checked={fieldOptions[f.key] === 'optional'} onChange={() => setFieldOption(f.key, 'optional')} />
                      <span>optional</span>
                    </label>
                    <label className="radio-option">
                      <input type="radio" name={f.key} value="required" checked={fieldOptions[f.key] === 'required'} onChange={() => setFieldOption(f.key, 'required')} />
                      <span>pflicht</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="right-sidebar">
          <div className="page-container">
            <div className="toggle-box">
              <span>Dienst ausblenden</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={hideService}
                  onChange={() => setHideService(s => !s)}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          <div className="page-container" ref={deptRef}>
            <h2>Abteilung</h2>
            <div className="list-box">
              {selectedDepartment && (
                <div className="list-item">
                  <span>{selectedDepartment.name ?? selectedDepartment}</span>
                  <button className="btn overflow" onClick={removeDepartment}>✕</button>
                </div>
              )}
            </div>
            <div
              className={`service-box dashed${showDeptDropdown ? ' open' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setShowDeptDropdown(d => !d)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDeptDropdown(d => !d); } }}
            >
              <div className="service-box__label">Abteilung auswählen</div>
              {showDeptDropdown && (
                <ul className="dropdown-list">
                  {(Array.isArray(generalDepartments) && generalDepartments.length > 0 ? generalDepartments : deptOptions).map((opt, i) => {
                    const label = typeof opt === 'string' ? opt : (opt.name ?? opt);
                    return <li key={i} onClick={() => addDepartment(opt)}>{label}</li>;
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="page-container" ref={notifRef}>
            <h2>Buchungs-Benachrichtigung</h2>
            <div
              className={`service-box dashed${showNotifDropdown ? ' open' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setShowNotifDropdown(n => !n)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowNotifDropdown(n => !n); } }}
            >
              <div className="service-box__label">Empfänger hinzufügen</div>
              {showNotifDropdown && (
                <ul className="dropdown-list">
                  {notifOptions.map((opt, i) => (
                    <li key={i} onClick={() => setShowNotifDropdown(false)}>
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="page-container" ref={paymentRef}>
            <h2>Bezahlungs-Art</h2>
            <div
              className={`service-box dashed${showPaymentDropdown ? ' open' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setShowPaymentDropdown(p => !p)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPaymentDropdown(p => !p); } }}
            >
              <div className="service-box__label">Bezahlungsart hinzufügen</div>
              {showPaymentDropdown && (
                <ul className="dropdown-list">
                  {paymentOptions.map((opt, i) => (
                    <li key={i} onClick={() => setShowPaymentDropdown(false)}>
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Modal: Fehler beim Löschen */}
      {showDeleteError && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowDeleteError(null)}>×</button>
            <h2 className="modal-title">Fehler beim Löschen</h2>
            <p className="modal-subheading">
              <strong>{showDeleteError}</strong>
            </p>
            <p>Der Dienst konnte nicht gelöscht werden. Bitte versuche es erneut oder kontaktiere den Support.</p>
            <button className="btn save" onClick={() => setShowDeleteError(null)}>Schließen</button>
          </div>
        </div>
      )}

      {/* Modal: Bestätigung vor Löschen */}
      {showConfirmDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowConfirmDeleteModal(false)}>×</button>
            <h2 className="modal-title">Dienst wirklich löschen?</h2>
            <p className="modal-subheading" style={{ marginTop: 12 }}>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <p>Möchtest du den Dienst <strong>„{form.name}“</strong> wirklich löschen?</p>
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
