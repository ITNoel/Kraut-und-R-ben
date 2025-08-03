// src/Components-Website/Department-Overview.jsx

import React, { useState, useRef, useEffect } from 'react';
import '../global.css';
import './Department-Overview.css';
import emptyIllustration from '../assets/empty-departments.png';
import { api } from '../Functions/apiClient';

export default function DepartmentOverview({ departments, generalEmployees, onNew, onEdit }) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localDepartments, setLocalDepartments] = useState(departments);
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
      setSelectedRows([]);
      setShowDeleteModal(false);
    } catch (err) {
      alert('Fehler beim Löschen: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

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
              ⋯ Weitere Aktionen
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
            className="btn add department-new"
            onClick={() => onNew(generalEmployees)}
          >
            Neu Abteilung anlegen
          </button>
        </div>
      </div>

      <div className="page-container department-overview__content">
        {localDepartments.length === 0 ? (
          <div className="empty-state">
            <img src={emptyIllustration} alt="Keine Abteilungen" />
            <h2>Willkommen in der Abteilungs Übersicht</h2>
            <p>Sobald Sie Abteilungen hinzugefügt haben, erscheinen diese hier.</p>
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
                    />
                  </th>
                  <th>Name</th>
                  <th>Personen</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {localDepartments.map((d, i) => (
                  <tr key={d.id || i}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(d.id)}
                        onChange={e => toggleSelectOne(d.id, e.target.checked)}
                      />
                    </td>
                    <td>{d.name}</td>
                    <td>{d.employees?.length ?? 0}</td>
                    <td>
                      <span className={statusClass(d.status)}>
                        {d.status === 'active'
                          ? 'Aktiv'
                          : d.status === 'disabled'
                          ? 'Inaktiv'
                          : 'Entwurf'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn more-actions"
                        aria-label="Bearbeiten"
                        onClick={() => onEdit(d, i, generalEmployees)}
                      >
                        ⋯
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="department-overview__footer">
              <button
                className="btn flat department-view-more"
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
