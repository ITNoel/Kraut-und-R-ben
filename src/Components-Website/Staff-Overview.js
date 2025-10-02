import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Staff-Overview.css';
import emptyIllustration from '../assets/empty-staff.png';
import SearchBar from './SearchBar';
import actionIcon from '../assets/Buttons/action-icon.svg';

export default function StaffOverview({ employees = [], departments = [], onSelect, onEditEmployee, onDeleteEmployees, onNewStaff }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localEmployees, setLocalEmployees] = useState(Array.isArray(employees) ? employees : []);
  const [search, setSearch] = useState('');
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
    if (checked) setSelectedRows(displayedEmployees.map(emp => emp.id ?? emp.email ?? emp.name ?? String(Math.random())));
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
        const ids = localEmployees
          .filter(emp => (idsToDelete.includes(emp.id) || idsToDelete.includes(emp.email) || idsToDelete.includes(emp.name)))
          .map(emp => emp.id)
          .filter(Boolean);
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

  // filtered list by search term
  const displayedEmployees = (Array.isArray(localEmployees) ? localEmployees : []).filter(emp => {
    const text = [emp?.first_name, emp?.last_name, emp?.name, emp?.email]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return !search || text.includes(search.toLowerCase());
  });

  const mapStatus = raw => {
    const s = String(raw || '').toLowerCase();
    if (['disabled', 'inactive', 'inaktiv', 'deaktiviert'].includes(s)) return { type: 'disabled', label: 'Inaktiv' };
    if (['draft', 'entwurf'].includes(s)) return { type: 'draft', label: 'Entwurf' };
    return { type: 'active', label: 'Aktiv' };
  };

  return (
    <div className="department-page department-overview staff-overview">
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

      <SearchBar term={search} onTermChange={setSearch} statusOptions={null} />
      <div className="page-container department-overview__content">
        {localEmployees.length === 0 ? (
          <div className="empty-state">
            <img src={emptyIllustration} alt="Keine Sachbearbeiter" />
            <div className="empty-state__text">
              <h2>Willkommen in der Sachbearbeiter Übersicht</h2>
              Sobald Sie Sachbearbeiter hinzufügen, erscheinen diese hier.
            </div>
            <button
              className="btn save department-new"
              onClick={() => { if (typeof onNewStaff === 'function') onNewStaff(); else onSelect?.('staff'); }}
            >
              Neu Sachbearbeiter anlegen
            </button>
          </div>
        ) : (
          <>
            <table className="department-overview__table">
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
                  <th></th>
                  <th></th>
                  <th>Abteilung</th>
                  <th>Telefon</th>
                  <th className="status"><span className="status-wrap">Status</span></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayedEmployees.map((emp, i) => {
                  const identifier = emp.id ?? emp.email ?? emp.name ?? i;
                  const checked = selectedRows.includes(identifier);
                  const fullName = emp.first_name ? `${emp.first_name} ${emp.last_name || ''}` : (emp.name || emp.email || '-');
                  // Resolve department ID to name
                  let departmentName = '-';
                  if (typeof emp.department === 'object') {
                    departmentName = emp.department?.name ?? '-';
                  } else if (emp.department != null) {
                    const deptObj = departments.find(d => d.id === emp.department);
                    departmentName = deptObj?.name ?? String(emp.department);
                  }
                  const phone = emp.telephone || emp.phone || '-';
                  const { type: statusType, label: statusLabel } = mapStatus(emp.status);
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
                      <td style={{ color: '#222' }}>{fullName}</td>
                      <td></td>
                      <td></td>
                      <td style={{ textAlign: 'center' }}>{departmentName}</td>
                      <td style={{ textAlign: 'center' }}>{phone}</td>
                      <td className="status">
                        <span className="status-wrap">
                          <span className={`department-overview__status department-overview__status--${statusType}`}>
                            {statusLabel}
                          </span>
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn more-actions"
                          aria-label="Bearbeiten"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: 22,
                            padding: 0,
                            minWidth: 32,
                            minHeight: 32,
                            borderRadius: '50%'
                          }}
                          onClick={e => { e.stopPropagation(); if (typeof onEditEmployee === 'function') onEditEmployee(emp, i); }}
                        >
                          <img src={actionIcon} alt="" width={12} height={12} />
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



