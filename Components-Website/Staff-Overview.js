import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Staff-Overview.css'; // reuse overview table styles
import emptyIllustration from '../assets/empty-staff.png';
import SearchBar from './SearchBar';
import actionIcon from '../assets/Buttons/action-icon.svg';

export default function StaffOverview({ employees = [], onSelect, onEditEmployee, onDeleteEmployees, onNewStaff }) {
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
    if (checked) setSelectedRows(displayedEmployees.map(emp => emp.id ?? emp.email ?? emp.name));
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
      alert('Fehler beim LÃƒÂ¶schen: ' + (err?.message || err));
    } finally {
      setIsDeleting(false);
    }
  };

  // helper: day cell content Ã¢â‚¬â€ if employee.days array exists, show check
  const renderDay = (emp, shortDay) => {
    if (Array.isArray(emp.days)) {
      return emp.days.includes(shortDay) ? 'Ã¢Å“â€œ' : '';
    }
    return ''; // no data
  };

  // filtered list by search term
  const displayedEmployees = (Array.isArray(localEmployees) ? localEmployees : []).filter(emp => {
    const text = [emp?.first_name, emp?.last_name, emp?.name, emp?.email]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return !search || text.includes(search.toLowerCase());
  });

  return (
    <div className="department-page department-overview">
      <div className="page-header">
        <h1 className="page-header__title">Sachbearbeiter ÃƒÅ“bersicht</h1>
        <div className="page-header__actions">
          <div className="actions-dropdown-wrapper" ref={actionsRef}>
            <button
              className="btn more-actions"
              onClick={() => setActionsOpen(v => !v)}
              disabled={selectedRows.length === 0}
              style={{ opacity: selectedRows.length === 0 ? 0.5 : 1 }}
            >
              <span aria-hidden="true">Ã¢â€¹Â¯</span> Weitere Aktionen
            </button>
            {actionsOpen && (
              <div className="actions-dropdown">
                <button
                  className="actions-dropdown__item"
                  onClick={() => { setActionsOpen(false); setShowDeleteModal(true); }}
                >
                  Sachbearbeiter lÃƒÂ¶schen
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
              <h2>Willkommen in der Sachbearbeiter ÃƒÅ“bersicht</h2>
              Sobald Sie Sachbearbeiter hinzufÃƒÂ¼gen, erscheinen diese hier.
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
            <table className="department-overview__table common-overview__table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === localEmployees.length && localEmployees.length > 0}
                      onChange={e => toggleSelectAll(e.target.checked)}
                      aria-label="Alle auswÃƒÂ¤hlen"
                    />
                  </th>
                  <th>Name</th>
                  <th>Abteilung</th>
                  <th>Telefon</th>
                  <th className="status">Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayedEmployees.map((emp, i) => {
                  const identifier = emp.id ?? emp.email ?? emp.name ?? i;
                  const checked = selectedRows.includes(identifier);
                  const fullName = emp.first_name ? `${emp.first_name} ${emp.last_name || ''}` : (emp.name || emp.email || '-');
                  const department = typeof emp.department === 'object' ? (emp.department?.name ?? '-') : (emp.department ?? '-');
                  const phone = emp.telephone || emp.phone || '-';
                  const rawStatus = (emp.status || '').toString().toLowerCase();
                  const statusType = (['active','aktiv'].includes(rawStatus) ? 'active' : (['disabled','inactive','inaktiv'].includes(rawStatus) ? 'disabled' : (['draft','entwurf'].includes(rawStatus) ? 'draft' : 'active')));
                  const statusLabel = statusType === 'active' ? 'Aktiv' : (statusType === 'disabled' ? 'Inaktiv' : 'Entwurf');
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
                          aria-label={`Mitarbeiter ${emp.name || emp.email} auswÃƒÂ¤hlen`}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ color: "#222" }}>{fullName}</td>
                      <td>{String(department)}</td>
                      <td>{phone}</td>
                      <td className="status">
                        <span className={`department-overview__status department-overview__status--${statusType}`}>
                          {statusLabel}
                        </span>
                      </td>
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
            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>Ãƒâ€”</button>
            <h2 className="modal-title">Mehrere Sachbearbeiter lÃƒÂ¶schen?</h2>
            <p className="modal-subheading">
              Es werden <strong>{selectedRows.length}</strong> Sachbearbeiter gelÃƒÂ¶scht. Diese Aktion kann nicht rÃƒÂ¼ckgÃƒÂ¤ngig gemacht werden.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button className="btn cancel" onClick={() => setShowDeleteModal(false)}>Abbrechen</button>
              <button className="btn save" onClick={handleDeleteSelected} disabled={isDeleting}>{isDeleting ? 'LÃƒÂ¶scheÃ¢â‚¬Â¦' : 'Ja, lÃƒÂ¶schen'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
