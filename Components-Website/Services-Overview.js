// src/ServicesOverview.jsx

import React from 'react';
import '../global.css';
import './Services-Overview.css';

const services = [
  { name: 'Reisepass beantragen', duration: '15 min', price: '20 €', status: 'active' },
  { name: 'Abmeldung (Ausland/Nebenwohnung)', duration: '45 min', price: '10 €', status: 'active' },
  { name: 'Ummeldung (innerhalb Stadt)', duration: '15 min', price: '30 €', status: 'active' },
  { name: 'Melde-/Lebensbescheinigung', duration: '30 min', price: '25 €', status: 'disabled' },
  { name: 'Test', duration: '30 min', price: '25 €', status: 'draft' },
];

export default function ServicesOverview({ onSelect }) {
  const statusClass = status => {
    switch (status) {
      case 'active':   return 'services-overview__status services-overview__status--active';
      case 'disabled': return 'services-overview__status services-overview__status--disabled';
      case 'draft':    return 'services-overview__status services-overview__status--draft';
      default:         return 'services-overview__status';
    }
  };

  return (
    <div className="department-page services-overview">
      <div className="page-header">
        <h1 className="page-header__title">Dienste Übersicht</h1>
        <div className="page-header__actions">
          <button className="btn more-actions">
            <span aria-hidden="true">⋯</span> Weitere Aktionen
          </button>
          <button
            className="btn services-new"
            onClick={() => onSelect('services')}
          >
          Neue Dienste anlegen
          </button>
        </div>
      </div>

<div className="page-container services-overview__content">
    <table className="services-overview__table">
      <thead>
        <tr>
          <th><input type="checkbox" aria-label="Alle auswählen" /></th>
          <th>Name</th>
          <th>Dauer</th>
          <th>Preis</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {services.map((s, i) => (
          <tr key={i}>
            <td><input type="checkbox" /></td>
            <td>{s.name}</td>
            <td>{s.duration}</td>
            <td>{s.price}</td>
            <td>
              <span className={statusClass(s.status)}>
                {s.status === 'active'
                  ? 'Aktiv'
                  : s.status === 'disabled'
                  ? 'Deaktiviert'
                  : 'Entwurf'}
              </span>
            </td>
            <td>
              <button className="btn more-actions" aria-label="Aktionen">⋯</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="services-overview__footer">
      <button
        className="btn flat services-view-more"
        onClick={() => onSelect('services')}
      >
        Weitere Dienste anlegen
      </button>
    </div>
  </div>
</div>
);
}
