// src/Services.jsx

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Services.css';
import arrowIcon from '../assets/Buttons/arrow-icon.svg';
import trashIcon from '../assets/Buttons/trash-icon.svg';
import abordIcon from '../assets/fonts/abord-icon.svg';
import saveIcon from '../assets/fonts/save-icon.svg';
import saveMultipleIcon from '../assets/fonts/save-multiple-icon.svg';
import uploadIcon from '../assets/fonts/upload-icon.svg';
import { api } from '../Functions/apiClient';
import { ROUTES } from '../app/routes';

export default function Services({ initialData = null, index = null, generalServices = [], onSaveService, onUpdateService, onCancel, generalDepartments = [] }) {
  const [hideService, setHideService] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(null);

  // Dropdowns
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showQualificationDropdown, setShowQualificationDropdown] = useState(false);

  // Listen
  const [departments, setDepartments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [documents, setDocuments] = useState([]);

  const deptRef = useRef();
  const notifRef = useRef();
  const qualificationRef = useRef();

  // Optionen für Dropdowns
  const notifOptions = ['Team A', 'Team B', 'Team C', 'Alle Mitarbeiter'];
  const qualificationOptions = ['Führerschein', 'Erste Hilfe', 'Sprachzertifikat', 'IT-Kenntnisse'];

  useEffect(() => {
    function handleClickOutside(e) {
      if (deptRef.current && !deptRef.current.contains(e.target)) {
        setShowDeptDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (qualificationRef.current && !qualificationRef.current.contains(e.target)) {
        setShowQualificationDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form state
  const [form, setForm] = useState({
    type: initialData?.type || '',
    parallelBookings: initialData?.parallelBookings || '',
    title: initialData?.title || initialData?.name || '',
    duration: initialData?.duration || '',
    buffer: initialData?.buffer || '',
    fee: initialData?.fee || initialData?.price || '',
    maxPersons: initialData?.maxPersons || '',
    note: initialData?.note || initialData?.description || '',
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

  const setFieldOption = (key, value) => {
    setFieldOptions(prev => ({ ...prev, [key]: value }));
  };

  // Initialisierung mit vorhandenen Daten
  useEffect(() => {
    if (initialData?.departments) {
      setDepartments(Array.isArray(initialData.departments) ? initialData.departments : []);
    }
    if (initialData?.notifications) {
      setNotifications(Array.isArray(initialData.notifications) ? initialData.notifications : []);
    }
    if (initialData?.qualifications) {
      setQualifications(Array.isArray(initialData.qualifications) ? initialData.qualifications : []);
    }
    if (initialData?.documents) {
      setDocuments(Array.isArray(initialData.documents) ? initialData.documents : []);
    }
  }, [initialData]);

  const backToOverview = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    handleChange('note', e.target.value);
  };

  // Abteilungen
  const addDepartmentFromDropdown = (dept) => {
    const deptObj = typeof dept === 'object' ? dept : { id: dept, name: String(dept) };
    if (!departments.some(d => d.id === deptObj.id)) {
      setDepartments(list => [...list, deptObj]);
    }
    setShowDeptDropdown(false);
  };
  const removeDepartment = (i) => setDepartments(list => list.filter((_, idx) => idx !== i));

  // Buchungsbenachrichtigungen
  const addNotificationFromDropdown = (notif) => {
    const notifObj = typeof notif === 'object' ? notif : { id: `notif-${Date.now()}`, name: String(notif) };
    if (!notifications.some(n => n.name === notifObj.name)) {
      setNotifications(list => [...list, notifObj]);
    }
    setShowNotifDropdown(false);
  };
  const removeNotification = (i) => setNotifications(list => list.filter((_, idx) => idx !== i));

  // Qualifikationen
  const addQualificationFromDropdown = (qual) => {
    const qualObj = typeof qual === 'object' ? qual : { id: `qual-${Date.now()}`, name: String(qual) };
    if (!qualifications.some(q => q.name === qualObj.name)) {
      setQualifications(list => [...list, qualObj]);
    }
    setShowQualificationDropdown(false);
  };
  const removeQualification = (i) => setQualifications(list => list.filter((_, idx) => idx !== i));

  // Dokumente hochladen
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      id: `doc-${Date.now()}-${file.name}`,
      name: file.name,
      file: file
    }));
    setDocuments(list => [...list, ...newDocs]);
  };
  const removeDocument = (i) => setDocuments(list => list.filter((_, idx) => idx !== i));

  // Save (update only, bleibt im Editor)
  const handleSave = async () => {
    const svcObj = {
      id: initialData?.id ?? (index == null ? `local-svc-${Date.now()}` : undefined),
      type: form.type,
      parallelBookings: form.parallelBookings,
      title: form.title,
      name: form.title, // für Kompatibilität
      duration: Number(form.duration) || form.duration,
      buffer: Number(form.buffer) || form.buffer,
      fee: form.fee != null ? String(form.fee) : '0.00',
      price: form.fee, // für Kompatibilität
      maxPersons: Number(form.maxPersons) || form.maxPersons,
      note: form.note || '',
      description: form.note, // für Kompatibilität
      is_active: form.is_active ?? true,
      status: hideService ? 'disabled' : ((form.title && form.duration) ? 'active' : 'draft'),
      departments,
      notifications,
      qualifications,
      documents,
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
    } catch (err) {
      alert('Fehler beim Speichern des Dienstes: ' + (err.message || err));
    } finally {
      setPendingSave(false);
    }
  };

  // Save & Close
  const handleSaveAndClose = async () => {
    const svcObj = {
      id: initialData?.id ?? (index == null ? `local-svc-${Date.now()}` : undefined),
      type: form.type,
      parallelBookings: form.parallelBookings,
      title: form.title,
      name: form.title, // für Kompatibilität
      duration: Number(form.duration) || form.duration,
      buffer: Number(form.buffer) || form.buffer,
      fee: form.fee != null ? String(form.fee) : '0.00',
      price: form.fee, // für Kompatibilität
      maxPersons: Number(form.maxPersons) || form.maxPersons,
      note: form.note || '',
      description: form.note, // für Kompatibilität
      is_active: form.is_active ?? true,
      status: hideService ? 'disabled' : ((form.title && form.duration) ? 'active' : 'draft'),
      departments,
      notifications,
      qualifications,
      documents,
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

  const handleDelete = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false);
    setPendingDelete(true);
    try {
      await api.delete(`/services/${initialData.id}/`);
      if (typeof onUpdateService === 'function') {
        onUpdateService(null, index);
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
      <div className="services-header-wrapper">
        <div className="page-header">
          <h1 className="page-header__title">Dienste anlegen</h1>
          <div className="page-header__actions">
            {initialData?.id && (
              <button className="btn save" onClick={handleDelete}>Löschen</button>
            )}
            <button className="btn cancel" type="button" onClick={backToOverview}>
              <img src={abordIcon} width={18} height={18} alt="" />
              Abbrechen
            </button>
            <button className="btn save-draft" onClick={handleSave} disabled={pendingSave}>
              <img src={saveMultipleIcon} width={18} height={18} alt="" />
              {pendingSave ? 'Speichern…' : 'Speichern'}
            </button>
            <button className="btn save" onClick={handleSaveAndClose} disabled={pendingSave}>
              <img src={saveIcon} width={18} height={18} alt="" />
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
                  <label>Art<input name="type" value={form.type} onChange={e => handleChange('type', e.target.value)} /></label>
                  <label>Parallelbuchungen<input name="parallelBookings" value={form.parallelBookings} onChange={e => handleChange('parallelBookings', e.target.value)} /></label>
                </div>
                <label className="full-width">Titel*<input name="title" value={form.title} onChange={e => handleChange('title', e.target.value)} /></label>
                <div className="form-grid two-col labeled-inputs">
                  <label>Dauer (Minuten)*<input name="duration" value={form.duration} onChange={e => handleChange('duration', e.target.value)} /></label>
                  <label>Puffer (Minuten)<input name="buffer" value={form.buffer} onChange={e => handleChange('buffer', e.target.value)} /></label>
                  <label>Gebühr<input name="fee" value={form.fee} onChange={e => handleChange('fee', e.target.value)} /></label>
                  <label>Max. Personen<input name="maxPersons" value={form.maxPersons} onChange={e => handleChange('maxPersons', e.target.value)} /></label>
                </div>
                <label className="full-width">Hinweis<textarea name="note" value={form.note} onChange={handleTextareaChange} rows={4} /></label>
              </div>
            </div>
          </div>

          {/* Felder - Radio Buttons für Feldkonfiguration */}
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
                  <div className="field-box-content">
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
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="right-sidebar">
          <div className="page-container">
            <div className="section toggle-box">
              <span>Dienst ausblenden</span>
              <label className="switch">
                <input type="checkbox" checked={hideService} onChange={() => setHideService(h => !h)} />
                <span className="slider" />
              </label>
            </div>
          </div>

          {/* Abteilungen */}
          <div className="page-container">
            <div className="section">
              <h2>Abteilungen</h2>

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
                  Abteilungen hinzufügen
                </button>
                {showDeptDropdown && (
                  <ul className="dropdown-list" role="listbox">
                    {(Array.isArray(generalDepartments) && generalDepartments.length > 0 ? generalDepartments : []).map((opt, i) => (
                      <li
                        key={i}
                        role="option"
                        tabIndex={0}
                        onClick={() => addDepartmentFromDropdown(opt)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            addDepartmentFromDropdown(opt);
                          }
                        }}
                      >
                        {opt.name || opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="employee-list-box">
                {departments.map((d, i) => (
                  <div key={i} className="employee-list-item">
                    <button className="employee-delete-btn" onClick={() => removeDepartment(i)} aria-label="Abteilung entfernen">
                      <img src={trashIcon} width={16} height={16} alt="" />
                    </button>
                    <span>{d.name || d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buchungsbenachrichtigungen */}
          <div className="page-container">
            <div className="section">
              <h2>Buchungsbenachrichtigungen</h2>

              <div className="employee-dropdown-wrapper" ref={notifRef}>
                <button
                  type="button"
                  className={`employee-trigger ${showNotifDropdown ? 'open' : ''}`}
                  onClick={() => setShowNotifDropdown(v => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={showNotifDropdown}
                >
                  <span className="employee-trigger__chevron" aria-hidden="true">
                    <img src={arrowIcon} width={18} height={9} alt="" />
                  </span>
                  Empfänger hinzufügen
                </button>
                {showNotifDropdown && (
                  <ul className="dropdown-list" role="listbox">
                    {notifOptions.map((opt, i) => (
                      <li
                        key={i}
                        role="option"
                        tabIndex={0}
                        onClick={() => addNotificationFromDropdown(opt)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            addNotificationFromDropdown(opt);
                          }
                        }}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="employee-list-box">
                {notifications.map((n, i) => (
                  <div key={i} className="employee-list-item">
                    <button className="employee-delete-btn" onClick={() => removeNotification(i)} aria-label="Empfänger entfernen">
                      <img src={trashIcon} width={16} height={16} alt="" />
                    </button>
                    <span>{n.name || n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dokumente */}
          <div className="page-container">
            <div className="section">
              <h2>Dokumente</h2>

              <label className="file-upload-btn">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <img src={uploadIcon} width={20} height={20} alt="" className="upload-icon" />
                Dokumente hochladen
              </label>

              <div className="employee-list-box">
                {documents.map((doc, i) => (
                  <div key={i} className="employee-list-item">
                    <button className="employee-delete-btn" onClick={() => removeDocument(i)} aria-label="Dokument entfernen">
                      <img src={trashIcon} width={16} height={16} alt="" />
                    </button>
                    <span>{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Qualifikationen */}
          <div className="page-container">
            <div className="section">
              <h2>Qualifikationen</h2>

              <div className="employee-dropdown-wrapper" ref={qualificationRef}>
                <button
                  type="button"
                  className={`employee-trigger ${showQualificationDropdown ? 'open' : ''}`}
                  onClick={() => setShowQualificationDropdown(v => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={showQualificationDropdown}
                >
                  <span className="employee-trigger__chevron" aria-hidden="true">
                    <img src={arrowIcon} width={18} height={9} alt="" />
                  </span>
                  Qualifikationen hinzufügen
                </button>
                {showQualificationDropdown && (
                  <ul className="dropdown-list" role="listbox">
                    {qualificationOptions.map((opt, i) => (
                      <li
                        key={i}
                        role="option"
                        tabIndex={0}
                        onClick={() => addQualificationFromDropdown(opt)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            addQualificationFromDropdown(opt);
                          }
                        }}
                      >
                        {opt}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="employee-list-box">
                {qualifications.map((q, i) => (
                  <div key={i} className="employee-list-item">
                    <button className="employee-delete-btn" onClick={() => removeQualification(i)} aria-label="Qualifikation entfernen">
                      <img src={trashIcon} width={16} height={16} alt="" />
                    </button>
                    <span>{q.name || q}</span>
                  </div>
                ))}
              </div>
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
            <p>Möchtest du den Dienst <strong>„{form.title}"</strong> wirklich löschen?</p>
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
