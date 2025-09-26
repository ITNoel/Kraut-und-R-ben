// src/ServicesOverview.jsx

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Services-Overview.css';
import emptyIllustration from '../assets/empty-services.png';
import SearchBar from './SearchBar';
import actionIcon from '../assets/Buttons/action-icon.svg';
import { ROUTES } from '../app/routes';

const services = [
  { name: 'Reisepass beantragen', duration: '15 min', price: '20 Ã¢â€šÂ¬', status: 'active' },
  { name: 'Abmeldung (Ausland/Nebenwohnung)', duration: '45 min', price: '10 Ã¢â€šÂ¬', status: 'active' },
  { name: 'Ummeldung (innerhalb Stadt)', duration: '15 min', price: '30 Ã¢â€šÂ¬', status: 'active' },
  { name: 'Melde-/Lebensbescheinigung', duration: '30 min', price: '25 Ã¢â€šÂ¬', status: 'disabled' },
  { name: 'Test', duration: '30 min', price: '25 Ã¢â€šÂ¬', status: 'draft' },
];

export default function ServicesOverview({ onSelect, services = [], onEditService, onDeleteServices }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localServices, setLocalServices] = useState(services);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const actionsRef = useRef();

  useEffect(() => {
    const handleClickOutside = e => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLocalServices(Array.isArray(services) ? services : []);
  }, [services]);

  const statusClass = status => {
    switch (status) {
      case 'active':   return 'department-overview__status department-overview__status--active';
      case 'disabled': return 'department-overview__status department-overview__status--disabled';
      case 'draft':    return 'department-overview__status department-overview__status--draft';
      default:         return 'department-overview__status';
    }
  };

  // derived filtered list
  const displayedServices = (Array.isArray(localServices) ? localServices : []).filter((s) => {
    const matchesTerm = !search || (s?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (s?.status ?? 'active') === statusFilter;
    return matchesTerm && matchesStatus;
  });

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(displayedServices.map(s => s.id ?? s.name));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectOne = (identifier, checked) => {
    if (checked) {
      setSelectedRows(prev => [...prev, identifier]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== identifier));
    }
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      // Hier wÃƒÂ¼rdest du API-Calls machen, falls Services serverseitig gelÃƒÂ¶scht werden sollen
      // for (const idx of selectedRows) { ... }
      // map selectedRows to ids
      const idsToDelete = selectedRows;
      const remaining = localServices.filter(s => !(idsToDelete.includes(s.id) || idsToDelete.includes(s.name)));
      setLocalServices(remaining);
      // Informiere App ÃƒÂ¼ber gelÃƒÂ¶schte IDs (falls vorhanden)
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
      alert('Fehler beim LÃƒÂ¶schen: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="department-page department-overview">
      <div className="page-header">
        <h1 className="page-header__title">Dienste ÃƒÅ“bersicht</h1>
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
                  onClick={() => {
                    setActionsOpen(false);
                    setShowDeleteModal(true);
                  }}
                >
                  Dienste lÃƒÂ¶schen
                </button>
              </div>
            )}
          </div>
          <button
            className="btn services-new"
            onClick={() => onSelect('services')}
          >
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
              <h2>Willkommen in der Dienste ÃƒÅ“bersicht</h2>
              Sobald Sie Dienste hinzufÃƒÂ¼gen, erscheinen diese hier.
            </div>
            <button className="btn save department-new" onClick={() => onSelect('services')}>Neue Dienste anlegen</button>
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
                      aria-label="Alle auswÃƒÂ¤hlen"
                    />
                  </th>
                  <th>Name</th>
                  <th>Dauer</th>
                  <th>Preis</th>
                  <th className="status"><span className="status-wrap">Status</span></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayedServices.map((s, i) => {
                  const identifier = s.id ?? s.name;
                  const checked = selectedRows.includes(identifier);
                  const rawStatus = (s.status || '').toString().toLowerCase();
                  const statusType = (['active','aktiv'].includes(rawStatus)
                    ? 'active'
                    : (['disabled','inactive','inaktiv','deaktiviert'].includes(rawStatus)
                      ? 'disabled'
                      : (['draft','entwurf'].includes(rawStatus) ? 'draft' : 'active')));
                  const statusLabel = statusType === 'active' ? 'Aktiv' : (statusType === 'disabled' ? 'Inaktiv' : 'Entwurf');
                  return (
                    <tr
                      key={identifier ?? i}
                      className={checked ? 'row-selected' : ''}
                      onClick={e => {
                        if (
                          e.target.tagName === 'INPUT' ||
                          e.target.tagName === 'BUTTON' ||
                          e.target.closest('button')
                        ) return;
                        toggleSelectOne(identifier, !checked);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => toggleSelectOne(identifier, e.target.checked)}
                          aria-label={`Dienst ${s.name} auswÃƒÂ¤hlen`}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ color: "#222" }}>{s.name}</td>
                      <td style={{ color: "#222" }}>{s.duration}</td>
                      <td style={{ color: "#222" }}>{s.price}</td>
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
                            background: "none",
                            border: "none",
                            color: "#888",
                            fontSize: 22,
                            padding: 0,
                            minWidth: 32,
                            minHeight: 32,
                            borderRadius: "50%"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            // Editiere via App-Callback (App setzt currentService und wechselt View)
                            if (typeof onEditService === 'function') onEditService(s, i);
                            // fallback: ensure navigation to the services editor
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
            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>Ãƒâ€”</button>
            <h2 className="modal-title">Mehrere Dienste lÃƒÂ¶schen?</h2>
            <p className="modal-subheading">
              Es werden <strong>{selectedRows.length}</strong> Dienste gelÃƒÂ¶scht. Diese Aktion kann nicht rÃƒÂ¼ckgÃƒÂ¤ngig gemacht werden.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button className="btn cancel" onClick={() => setShowDeleteModal(false)}>Abbrechen</button>
              <button className="btn save" onClick={handleDeleteSelected} disabled={isDeleting}>
                {isDeleting ? 'LÃƒÂ¶scheÃ¢â‚¬Â¦' : 'Ja, lÃƒÂ¶schen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

