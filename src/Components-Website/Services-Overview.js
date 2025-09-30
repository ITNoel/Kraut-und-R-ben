// src/Services-Overview.js

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Services-Overview.css';
import emptyIllustration from '../assets/empty-services.png';
import SearchBar from './SearchBar';
import actionIcon from '../assets/Buttons/action-icon.svg';
import { ROUTES } from '../app/routes';

export default function ServicesOverview({ onSelect, services = [], onEditService, onDeleteServices }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localServices, setLocalServices] = useState(Array.isArray(services) ? services : []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    return matchesTerm && matchesStatus;
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
              <span aria-hidden="true">⋯</span> Weitere Aktionen
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

      <SearchBar
        term={search}
        onTermChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: 'all', label: 'Status' },
          { value: 'active', label: 'Aktiv' },
          { value: 'disabled', label: 'Inaktiv' },
          { value: 'draft', label: 'Entwurf' },
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
                  if (Array.isArray(s.documents)) documentsDisplay = String(s.documents.length);
                  else if (s.documents_count != null) documentsDisplay = String(s.documents_count);
                  else if (s.documents != null) documentsDisplay = String(s.documents);
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
                      <td>{String(department)}</td>
                      <td style={{ color: '#222' }}>{duration}</td>
                      <td style={{ color: '#222' }}>{maxPersons}</td>
                      <td style={{ color: '#222' }}>{documentsDisplay}</td>
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
