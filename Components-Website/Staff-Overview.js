import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Staff-Overview.css'; // reuse overview table styles
import emptyIllustration from '../assets/empty-staff.png';

export default function StaffOverview({ employees = [], onSelect, onEditEmployee, onDeleteEmployees, onNewStaff }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localEmployees, setLocalEmployees] = useState(Array.isArray(employees) ? employees : []);
  const actionsRef = useRef();

  useEffect(() => {
    setLocalEmployees(Array.isArray(employees) ? employees : []);
  }, [employees]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelectAll = checked => {
    if (checked) setSelectedRows(localEmployees.map(emp => emp.id ?? emp.email ?? emp.name));
    else setSelectedRows([]);
  };

  const toggleSelectOne = (identifier, checked) => {
    if (checked) setSelectedRows(prev => [...prev, identifier]);
    else setSelectedRows(prev => prev.filter(id => id !== identifier));
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      const idsToDelete = selectedRows;
      const remaining = localEmployees.filter(emp => !(idsToDelete.includes(emp.id) || idsToDelete.includes(emp.email) || idsToDelete.includes(emp.name)));
      setLocalEmployees(remaining);
      if (typeof onDeleteEmployees === 'function') {
        const ids = localEmployees.filter(emp => (idsToDelete.includes(emp.id) || idsToDelete.includes(emp.email) || idsToDelete.includes(emp.name))).map(emp => emp.id).filter(Boolean);
        onDeleteEmployees(ids);
      }
      setSelectedRows([]);
      setShowDeleteModal(false);
    } catch (err) {
      alert('Fehler beim Löschen: ' + (err?.message || err));
    } finally {
      setIsDeleting(false);
    }
  };

  // helper: day cell content — if employee.days array exists, show check
  const renderDay = (emp, shortDay) => {
    if (Array.isArray(emp.days)) {
      return emp.days.includes(shortDay) ? '✓' : '';
    }
    return ''; // no data
  };

  return (
    <div className="department-page department-overview">
      <div className="page-header">
        <h1 className="page-header__title">Sachbearbeiter Übersicht</h1>
        <div className="page-header__actions">
          <div className="actions-dropdown-wrapper" ref={actionsRef}>
            <button
              className="btn more-actions"
              onClick={() => setActionsOpen(v => !v)}
              disabled={selectedRows.length === 0}
              style={{ opacity: selectedRows.length === 0 ? 0.5 : 1 }}
            >
              <span aria-hidden="true">⋯</span> Weitere Aktionen
            </button>
            {actionsOpen && (
              <div className="actions-dropdown">
                <button
                  className="actions-dropdown__item"
                  onClick={() => { setActionsOpen(false); setShowDeleteModal(true); }}
                >
                  Sachbearbeiter löschen
                </button>
              </div>
            )}
          </div>

          <button
            className="btn departments-new"
            onClick={() => {
              if (typeof onNewStaff === 'function') onNewStaff();
              else onSelect?.('staff');
            }}
          >
            Neu Sachbearbeiter anlegen
          </button>
        </div>
      </div>

      <div className="page-container department-overview__content">
        {localEmployees.length === 0 ? (
          <div className="empty-state">
            <img src={emptyIllustration} alt="Keine Sachbearbeiter" />
            <h2>Willkommen in der Sachbearbeiter Übersicht</h2>
            <p>Sobald Sie Sachbearbeiter hinzufügen, erscheinen diese hier.</p>
            <button
              className="btn save department-new"
              onClick={() => { if (typeof onNewStaff === 'function') onNewStaff(); else onSelect?.('staff'); }}
            >
              Neu Sachbearbeiter anlegen
            </button>
          </div>
        ) : (
          <>
            <table className="department-overview__table common-overview__table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === localEmployees.length && localEmployees.length > 0}
                      onChange={e => toggleSelectAll(e.target.checked)}
                      aria-label="Alle auswählen"
                    />
                  </th>
                  <th>Name</th>
                  <th className="day">Mo</th>
                  <th className="day">Di</th>
                  <th className="day">Mi</th>
                  <th className="day">Do</th>
                  <th className="day">Fr</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {localEmployees.map((emp, i) => {
                  const identifier = emp.id ?? emp.email ?? emp.name ?? i;
                  const checked = selectedRows.includes(identifier);
                  return (
                    <tr key={identifier} className={checked ? 'row-selected' : ''} onClick={e => {
                      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                      toggleSelectOne(identifier, !checked);
                    }} style={{ cursor: 'pointer' }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => toggleSelectOne(identifier, e.target.checked)}
                          aria-label={`Mitarbeiter ${emp.name || emp.email} auswählen`}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ color: "#222" }}>{emp.first_name ? `${emp.first_name} ${emp.last_name || ''}` : (emp.name || emp.email || '-')}</td>
                      <td style={{ textAlign: 'center' }}>{renderDay(emp, 'Mo')}</td>
                      <td style={{ textAlign: 'center' }}>{renderDay(emp, 'Di')}</td>
                      <td style={{ textAlign: 'center' }}>{renderDay(emp, 'Mi')}</td>
                      <td style={{ textAlign: 'center' }}>{renderDay(emp, 'Do')}</td>
                      <td style={{ textAlign: 'center' }}>{renderDay(emp, 'Fr')}</td>
                      <td>
                        <button
                          className="btn more-actions"
                          aria-label="Bearbeiten"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#888",
                            fontSize: 22,
                            padding: 0,
                            minWidth: 32,
                            minHeight: 32,
                            borderRadius: "50%"
                          }}
                          onClick={e => { e.stopPropagation(); if (typeof onEditEmployee === 'function') onEditEmployee(emp, i); }}
                        >
                          ⋯
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="department-overview__footer">
              <button className="btn view-more" onClick={() => onSelect?.('staff')}>Weitere Sachbearbeiter anlegen</button>
            </div>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            <h2 className="modal-title">Mehrere Sachbearbeiter löschen?</h2>
            <p className="modal-subheading">
              Es werden <strong>{selectedRows.length}</strong> Sachbearbeiter gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button className="btn cancel" onClick={() => setShowDeleteModal(false)}>Abbrechen</button>
              <button className="btn save" onClick={handleDeleteSelected} disabled={isDeleting}>{isDeleting ? 'Lösche…' : 'Ja, löschen'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
