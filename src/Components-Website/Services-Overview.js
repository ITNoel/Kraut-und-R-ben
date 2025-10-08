// src/Services-Overview.js

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Services-Overview.css';
import emptyIllustration from '../assets/empty-services.png';
import SearchBar from './SearchBar';
import actionIcon from '../assets/Buttons/action-icon.svg';
import personIcon from '../assets/fonts/person-icon.svg';
import personsIcon from '../assets/fonts/persons-icon.svg';
import settingsIcon from '../assets/fonts/settings.icon.svg';
import { ROUTES } from '../app/routes';

export default function ServicesOverview({ onSelect, services = [], onEditService, onDeleteServices, departments = [] }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localServices, setLocalServices] = useState(Array.isArray(services) ? services : []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const actionsRef = useRef();

  useEffect(() => {
    const handleClickOutside = e => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) setActionsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLocalServices(Array.isArray(services) ? services : []);
  }, [services]);

  const statusClass = status => {
    switch (status) {
      case 'disabled': return 'department-overview__status department-overview__status--disabled';
      case 'draft': return 'department-overview__status department-overview__status--draft';
      case 'active':
      default: return 'department-overview__status department-overview__status--active';
    }
  };

  const displayedServices = (Array.isArray(localServices) ? localServices : []).filter((s) => {
    const matchesTerm = !search || (s?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (s?.status ?? 'active') === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || (() => {
      const deptId = typeof s.department === 'object' ? s.department?.id : s.department;
      return String(deptId) === String(departmentFilter);
    })();
    return matchesTerm && matchesStatus && matchesDepartment;
  });

  const toggleSelectAll = (checked) => {
    if (checked) setSelectedRows(displayedServices.map(s => s.id ?? s.name ?? String(Math.random())));
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
      const remaining = localServices.filter(s => !(idsToDelete.includes(s.id) || idsToDelete.includes(s.name)));
      setLocalServices(remaining);
      if (typeof onDeleteServices === 'function') {
        const ids = localServices
          .filter(s => (idsToDelete.includes(s.id) || idsToDelete.includes(s.name)))
          .map(s => s.id)
          .filter(Boolean);
        onDeleteServices(ids);
      }
      setSelectedRows([]);
      setShowDeleteModal(false);
    } catch (err) {
      alert('Fehler beim Löschen: ' + (err?.message || err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="department-page department-overview services-overview">
      <div className="overview-header-wrapper">
        <div className="page-header">
          <h1 className="page-header__title">Dienste Übersicht</h1>
          <div className="page-header__actions">
            <div className="actions-dropdown-wrapper" ref={actionsRef}>
              <button
                className="btn more-actions"
                onClick={() => setActionsOpen(v => !v)}
                disabled={selectedRows.length === 0}
                style={{ opacity: selectedRows.length === 0 ? 0.5 : 1 }}
              >
                <img src={settingsIcon} alt="" width="17" height="17" style={{ marginRight: '8px' }} />
                Weitere Aktionen
              </button>
              {actionsOpen && (
                <div className="actions-dropdown">
                  <button className="actions-dropdown__item" onClick={() => { setActionsOpen(false); setShowDeleteModal(true); }}>
                    Dienste löschen
                  </button>
                </div>
              )}
            </div>
            <button className="btn services-new" onClick={() => onSelect(ROUTES.SERVICES)}>
              Neue Dienste anlegen
            </button>
          </div>
        </div>
      </div>

      <SearchBar
        term={search}
        onTermChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: 'all', label: 'Alle' },
          { value: 'active', label: 'Aktiv' },
          { value: 'disabled', label: 'Inaktiv' },
          { value: 'draft', label: 'Entwurf' },
        ]}
        department={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        departmentOptions={[
          { value: 'all', label: 'Alle' },
          ...departments.map(d => ({ value: String(d.id), label: d.name }))
        ]}
      />

      <div className="page-container department-overview__content">
        {localServices.length === 0 ? (
          <div className="empty-state">
            <img src={emptyIllustration} alt="Keine Dienste" />
            <div className="empty-state__text">
              <h2>Willkommen in der Dienste Übersicht</h2>
              Sobald Sie Dienste hinzufügen, erscheinen diese hier.
            </div>
            <button className="btn save department-new" onClick={() => onSelect(ROUTES.SERVICES)}>Neue Dienste anlegen</button>
          </div>
        ) : (
          <>
            <table className="department-overview__table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === localServices.length && localServices.length > 0}
                      onChange={e => toggleSelectAll(e.target.checked)}
                      aria-label="Alle auswählen"
                    />
                  </th>
                  <th>Name</th>
                  <th></th>
                  <th></th>
                  <th>Abteilung</th>
                  <th>Dauer</th>
                  <th>Max. Personen</th>
                  <th>Dokumente</th>
                  <th className="status"><span className="status-wrap">Status</span></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayedServices.map((s, i) => {
                  const identifier = s.id ?? s.name ?? i;
                  const checked = selectedRows.includes(identifier);
                  const department = typeof s.department === 'object' ? (s.department?.name ?? '-') : (s.department ?? '-');
                  const duration = s.duration != null ? String(s.duration) : '-';
                  const maxPersons = s.max_persons ?? s.maxPersons ?? s.capacity ?? s.max ?? '-';
                  let documentsDisplay = '-';
                  let documentsCount = 0;
                  if (Array.isArray(s.documents)) documentsCount = s.documents.length;
                  else if (s.documents_count != null) documentsCount = s.documents_count;
                  else if (s.documents != null) documentsCount = s.documents;

                  if (documentsCount > 0) {
                    documentsDisplay = `${documentsCount} Dokumente`;
                  }
                  const rawStatus = (s.status || '').toString().toLowerCase();
                  const statusType = (['active','aktiv'].includes(rawStatus)
                    ? 'active'
                    : (['disabled','inactive','inaktiv','deaktiviert'].includes(rawStatus)
                      ? 'disabled'
                      : (['draft','entwurf'].includes(rawStatus) ? 'draft' : 'active')));
                  const statusLabel = statusType === 'active' ? 'Aktiv' : (statusType === 'disabled' ? 'Inaktiv' : 'Entwurf');

                  return (
                    <tr
                      key={identifier}
                      className={checked ? 'row-selected' : ''}
                      onClick={e => {
                        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                        toggleSelectOne(identifier, !checked);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => toggleSelectOne(identifier, e.target.checked)}
                          aria-label={`Dienst ${s.name} auswählen`}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ color: '#222' }}>{s.name}</td>
                      <td></td>
                      <td></td>
                      <td className="department-cell">
                        <img src={personsIcon} alt="" width="17" height="17" className="persons-icon" />
                        <span>{String(department)}</span>
                      </td>
                      <td style={{ color: '#222' }}>{duration}</td>
                      <td className="persons-cell">
                        <img src={personIcon} alt="" width="13" height="13" className="person-icon" />
                        <span>{maxPersons}</span>
                      </td>
                      <td className="documents-cell">
                        <span className="documents-badge">{documentsDisplay}</span>
                      </td>
                      <td className="status">
                        <span className="status-wrap">
                          <span className={statusClass(statusType)}>{statusLabel}</span>
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
                          onClick={e => {
                            e.stopPropagation();
                            if (typeof onEditService === 'function') onEditService(s, i);
                            if (typeof onSelect === 'function') onSelect(ROUTES.SERVICES);
                          }}
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
              <button className="btn view-more" onClick={() => onSelect(ROUTES.SERVICES)}>Weitere Dienste anlegen</button>
            </div>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            <h2 className="modal-title">Mehrere Dienste löschen?</h2>
            <p className="modal-subheading">
              Es werden <strong>{selectedRows.length}</strong> Dienste gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button className="btn cancel" onClick={() => setShowDeleteModal(false)}>Abbrechen</button>
              <button className="btn save" onClick={handleDeleteSelected} disabled={isDeleting}>{isDeleting ? 'Löscht…' : 'Ja, löschen'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
