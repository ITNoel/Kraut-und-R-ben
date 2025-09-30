// src/Components-Website/Department-Overview.jsx

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Department-Overview.css';
import emptyIllustration from '../assets/empty-departments.png';
import actionIcon from '../assets/Buttons/action-icon.svg';
import { api } from '../Functions/apiClient';
import SearchBar from './SearchBar';

export default function DepartmentOverview({ departments, generalEmployees, onNew, onEdit, onDeleteSelected }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localDepartments, setLocalDepartments] = useState(departments);
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
    setLocalDepartments(departments);
  }, [departments]);

  const statusClass = status => {
    switch (status) {
      case 'active':
        return 'department-overview__status department-overview__status--active';
      case 'disabled':
        return 'department-overview__status department-overview__status--disabled';
      case 'draft':
        return 'department-overview__status department-overview__status--draft';
      default:
        return 'department-overview__status';
    }
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(localDepartments.map(d => d.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      for (const id of selectedRows) {
        await api.delete(`/departments/${id}/`);
      }
      const remaining = localDepartments.filter(d => !selectedRows.includes(d.id));
      setLocalDepartments(remaining);
      // Informiere die Elternkomponente (App) über die gelöschten IDs,
      // damit der globale Zustand synchron entfernt wird.
      if (typeof onDeleteSelected === 'function') {
        onDeleteSelected(selectedRows);
      }
      setSelectedRows([]);
      setShowDeleteModal(false);
    } catch (err) {
      alert('Fehler beim Löschen: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // filterable view
  const displayedDepartments = (Array.isArray(localDepartments) ? localDepartments : []).filter((d) => {
    const name = (d?.name ?? '').toLowerCase();
    const matchesTerm = !search || name.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (d?.status ?? 'active') === statusFilter;
    return matchesTerm && matchesStatus;
  });

  return (
    <div className="department-page department-overview">
      <div className="page-header">
        <h1 className="page-header__title">Abteilungen Übersicht</h1>
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
                  onClick={() => {
                    setActionsOpen(false);
                    setShowDeleteModal(true);
                  }}
                >
                  Abteilungen löschen
                </button>
              </div>
            )}
          </div>
          <button
            className="btn departments-new"
            onClick={() => onNew(generalEmployees)}
          >
            Neu Abteilung anlegen
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
        {localDepartments.length === 0 ? (
          <div className="empty-state">
            <img src={emptyIllustration} alt="Keine Abteilungen" />
            <div className="empty-state__text">
              <h2>Willkommen in der Abteilungs Übersicht</h2>
              Sobald Sie Abteilungen hinzugefügt haben, erscheinen diese hier.
            </div>
            <button
              className="btn save department-new"
              onClick={() => onNew(generalEmployees)}
            >
              Neu Abteilung anlegen
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
                      checked={selectedRows.length === localDepartments.length && localDepartments.length > 0}
                      onChange={e => toggleSelectAll(e.target.checked)}
                      aria-label="Alle auswählen"
                    />
                  </th>
                  <th>Name</th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th className="persons" style={{ textAlign: 'center' }}>Mitarbeiter</th>
                  <th className="status"><span className="status-wrap">Status</span></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayedDepartments.map((d, i) => {
                  const checked = selectedRows.includes(d.id);
                  const rawStatus = (d.status || '').toString().toLowerCase();
                  const statusType = (['active','aktiv'].includes(rawStatus)
                    ? 'active'
                    : (['disabled','inactive','inaktiv','deaktiviert'].includes(rawStatus)
                      ? 'disabled'
                      : (['draft','entwurf'].includes(rawStatus) ? 'draft' : 'active')));
                  const statusLabel = statusType === 'active' ? 'Aktiv' : (statusType === 'disabled' ? 'Inaktiv' : 'Entwurf');
                  return (
                    <tr
                      key={d.id || i}
                      className={checked ? 'row-selected' : ''}
                      onClick={e => {
                        // Nur Checkbox- oder Button-Klicks nicht doppelt toggeln
                        if (
                          e.target.tagName === 'INPUT' ||
                          e.target.tagName === 'BUTTON' ||
                          e.target.closest('button')
                        ) return;
                        toggleSelectOne(d.id, !checked);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => toggleSelectOne(d.id, e.target.checked)}
                          aria-label={`Abteilung ${d.name} auswählen`}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ color: "#222" }}>{d.name}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="persons" style={{ color: "#222", textAlign: 'center' }}>
                        {Array.isArray(d.employees) ? d.employees.length : d.employees ?? 0}
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
                            // Gib die vollständige Personenliste der Abteilung mit (falls gesetzt),
                            // ansonsten das globale generalEmployees als Fallback.
                          onEdit(d, i, d?.allEmployees ?? generalEmployees);
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
              <button
                className="btn view-more"
                onClick={() => onNew(generalEmployees)}
              >
                Weitere Abteilungen anlegen
              </button>
            </div>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
            <h2 className="modal-title">Mehrere Abteilungen löschen?</h2>
            <p className="modal-subheading">
              Es werden <strong>{selectedRows.length}</strong> Abteilungen gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <button className="btn cancel" onClick={() => setShowDeleteModal(false)}>Abbrechen</button>
              <button className="btn save" onClick={handleDeleteSelected} disabled={isDeleting}>
                {isDeleting ? 'Lösche…' : 'Ja, löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



