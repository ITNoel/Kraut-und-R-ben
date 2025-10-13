// src/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { ROUTES } from '../app/routes';
import './Sidebar.css';
import dashboardIcon from '../assets/Sidebar/dashboard-icon.svg';
import buchungenIcon from '../assets/Sidebar/buchungen-icon.svg';
import locationsIcon from '../assets/Sidebar/locations-icon.svg';
import verwaltungIcon from '../assets/Sidebar/verwaltung-icon.svg';
import supportIcon from '../assets/Sidebar/support-icon.svg';
import settingsIcon from '../assets/Sidebar/settings-icon.svg';

export default function Sidebar({ view, onSelect, expanded, onExpandChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync internal state with parent's expanded prop
  useEffect(() => {
    setIsExpanded(expanded || false);
  }, [expanded]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: dashboardIcon,
      iconSize: 20,
      route: ROUTES.DASHBOARD,
    },
    {
      id: 'buchungen',
      label: 'Buchungen',
      icon: buchungenIcon,
      iconSize: 20,
      route: ROUTES.BOOKINGS,
    },
    {
      id: 'locations',
      label: 'Locations',
      icon: locationsIcon,
      iconSize: 20,
      route: ROUTES.LOCATIONS,
    },
    {
      id: 'verwaltung',
      label: 'Verwaltung',
      icon: verwaltungIcon,
      iconSize: 20,
      route: ROUTES.ADMIN,
      // Verwaltung enthält die Untermenüs
      subItems: [
        { id: 'department', label: 'Abteilungen', route: ROUTES.DEPARTMENT_OVERVIEW },
        { id: 'services', label: 'Dienste', route: ROUTES.SERVICES_OVERVIEW },
        { id: 'staff', label: 'Personal', route: ROUTES.STAFF_OVERVIEW },
      ],
      subRoutes: [ROUTES.DEPARTMENT_OVERVIEW, ROUTES.SERVICES_OVERVIEW, ROUTES.STAFF_OVERVIEW],
    },
  ];

  const bottomItems = [
    {
      id: 'support',
      label: 'Support',
      icon: supportIcon,
      iconSize: 20,
      route: null, // Will handle differently
    },
    {
      id: 'einstellungen',
      label: 'Einstellungen',
      icon: settingsIcon,
      iconSize: 20,
      route: null, // Will handle differently
    },
  ];

  const handleItemClick = (item) => {
    if (item.id === 'verwaltung') {
      const newExpandedState = !isExpanded;
      setIsExpanded(newExpandedState);
      onExpandChange?.(newExpandedState);
      // Nur expandieren/kollabieren, nicht navigieren
    } else if (item.route) {
      onSelect(item.route);
      if (!item.isSubItem) {
        setIsExpanded(false);
        onExpandChange?.(false);
      }
    }
  };

  const isActive = (item) => {
    if (item.subRoutes) {
      return item.subRoutes.includes(view);
    }
    return view === item.route;
  };

  return (
    <aside
      className={`sidebar-slim ${isExpanded ? 'expanded' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <nav className="sidebar-nav">
        <div className="sidebar-main-items">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                className="sidebar-item"
                onClick={() => handleItemClick(item)}
                title={item.label}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="sidebar-icon"
                  style={{ width: item.iconSize, height: item.iconSize }}
                />
                <span className="sidebar-label">{item.label}</span>
              </button>
              {item.id === 'verwaltung' && isExpanded && (
                <div className="sidebar-subitems">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      className="sidebar-subitem"
                      onClick={() => {
                        onSelect(subItem.route);
                      }}
                    >
                      <span className="sidebar-subitem-label">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="sidebar-bottom-items">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              className="sidebar-item"
              onClick={() => {
                // Handle support and settings clicks here
                console.log(`${item.label} clicked`);
              }}
              title={item.label}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="sidebar-icon"
                style={{ width: item.iconSize, height: item.iconSize }}
              />
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}