// src/App.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './global.css';
import './App.css';
import './Components-Website/Overview-Common-Overrides.css';

import Log_InApp from './Components-Log_In/Log_In-App';
import Sidebar from './Components-Website/Sidebar';
import Header from './Components-Website/Header';
import DepartmentOverview from './Components-Website/Department-Overview';
import Department from './Components-Website/Department';
import Staff from './Components-Website/Staff';
import ServicesOverview from './Components-Website/Services-Overview';
import Services from './Components-Website/Services';
import { api } from './Functions/apiClient';
import { ROUTES } from './app/routes';
import { upsertByIdOrName, removeByIds } from './shared/utils/collection';
import StaffOverview from './Components-Website/Staff-Overview'; // NEW

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]); // already present
  const [currentDept, setCurrentDept] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [view, setView] = useState(ROUTES.DEPARTMENT_OVERVIEW);
  const [currentService, setCurrentService] = useState(null);      // NEW
  const [currentServiceIndex, setCurrentServiceIndex] = useState(null); // NEW
  const [currentStaff, setCurrentStaff] = useState(null);          // NEW
  const [currentStaffIndex, setCurrentStaffIndex] = useState(null); // NEW
  const [sidebarExpanded, setSidebarExpanded] = useState(false);   // NEW - Track sidebar state

  const handleLogin = (deptList, empList, servicesList = []) => {
    setDepartments(deptList);
    setEmployees(empList);
    setServices(Array.isArray(servicesList) ? servicesList : []);
    setIsAuthenticated(true);
    // Direkt Staff-Overview anzeigen, damit Mitarbeiterliste sofort sichtbar ist
    setView(ROUTES.STAFF_OVERVIEW);
    navigate('/staff-overview', { replace: true });
  };

  const handleLogout = () => {
    try { api.clearToken?.(); } catch {}
    setIsAuthenticated(false);
    setDepartments([]);
    setEmployees([]);
    setServices([]);
    setCurrentDept(null);
    setCurrentIndex(null);
    setCurrentService(null);
    setCurrentServiceIndex(null);
    setCurrentStaff(null);
    setCurrentStaffIndex(null);
    setView(ROUTES.DEPARTMENT_OVERVIEW);
    navigate('/', { replace: true });
  };

  // enrichedDepartments: zusätzlich alle Personen pro Dept anhängen
  const enrichedDepartments = departments.map(dept => {
    const linked = employees.filter(emp => emp.department === dept.id);
    return {
      ...dept,
      employees: linked,
      allEmployees: employees // komplette Liste für jede Abteilung verfügbar machen
    };
  });

  const handleNew = (generalEmployees) => {
    setCurrentDept({
      name: '',
      employees: [],
      status: 'active',
      email: '',
      phone: '',
      street: '',
      room: '',
      postalCode: '',
      city: '',
      services: [],
      allEmployees: employees // komplette Liste mitgeben
    });
    setCurrentIndex(null);
    setView(ROUTES.DEPARTMENT);
    navigate('/department');
  };

  const handleEdit = (dept, idx, generalEmployees) => {
    // currentDept mit kompletter Personenliste anreichern
    setCurrentDept({ ...dept, allEmployees: employees });
    setCurrentIndex(idx);
    setView(ROUTES.DEPARTMENT);
    navigate('/department');
  };

  const handleSaveAndClose = (deptData, idx) => {
    const updated = upsertByIdOrName(departments, deptData, {
      idKey: 'id',
      nameSelector: (d) => d?.name,
      index: idx ?? null,
    });
    setDepartments(updated);
    setView(ROUTES.DEPARTMENT_OVERVIEW);
    navigate('/department-overview');
  };

  const handleUpdate = (deptData, idx) => {
    if (deptData === null && idx != null) {
      // Abteilung wurde gelöscht → aus Liste entfernen
      const updated = departments.filter((_, i) => i !== idx);
      setDepartments(updated);
      return;
    }

    // Wie bei handleSaveAndClose: falls id/name bereits existiert → ersetzen
    

    const updated = upsertByIdOrName(departments, deptData, {
      idKey: 'id',
      nameSelector: (d) => d?.name,
      index: idx ?? null,
    });
    setDepartments(updated);
  };

  // Entfernt mehrere Abteilungen aus dem globalen Zustand (IDs array)
  const handleDeleteDepartments = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    setDepartments(prev => removeByIds(prev, ids, 'id'));
  };

  // Speichern (und anschließend zur Übersicht) — vermeidet Duplikate (id oder name)
  const handleSaveServiceAndClose = (svcData, idx) => {
    setServices(
      upsertByIdOrName(services, svcData, {
        idKey: 'id',
        nameSelector: (s) => s?.name,
        index: idx ?? null,
      })
    );
    setView(ROUTES.SERVICES_OVERVIEW);
    navigate('/services-overview');
  };

  // Update (in-place) oder Anfügen, analog zu Departments
  const handleUpdateService = (svcData, idx) => {
    if (svcData === null && idx != null) {
      const updated = services.filter((_, i) => i !== idx);
      setServices(updated);
      return;
    }
    setServices(
      upsertByIdOrName(services, svcData, {
        idKey: 'id',
        nameSelector: (s) => s?.name,
        index: idx ?? null,
      })
    );
  };

  // Entfernt Services per id-Liste
  const handleDeleteServices = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    setServices(prev => removeByIds(prev, ids, 'id'));
  };

  // Entfernt mehrere Mitarbeiter aus dem globalen Zustand (IDs array)
  const handleDeleteEmployees = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    setEmployees(prev => removeByIds(prev, ids, 'id'));
  };

  // Save staff and close — vermeidet Duplikate (id oder name)
  const handleSaveStaffAndClose = (staffData, idx) => {
    setEmployees(
      upsertByIdOrName(employees, staffData, {
        idKey: 'id',
        nameSelector: (s) => `${s?.first_name ?? ''} ${s?.last_name ?? ''}`.trim(),
        index: idx ?? null,
      })
    );
    setView(ROUTES.STAFF_OVERVIEW);
    navigate('/staff-overview');
  };

  const handleUpdateStaff = (staffData, idx) => {
    if (staffData === null && idx != null) {
      setEmployees(prev => prev.filter((_, i) => i !== idx));
      return;
    }
    setEmployees(
      upsertByIdOrName(employees, staffData, {
        idKey: 'id',
        nameSelector: (s) => `${s?.first_name ?? ''} ${s?.last_name ?? ''}`.trim(),
        index: idx ?? null,
      })
    );
  };

  // Neuer, kompletter leerer Sachbearbeiter anlegen und Editor öffnen
  const handleNewStaff = () => {
    setCurrentStaff({
      // Keine id → neu
      first_name: '',
      last_name: '',
      date_of_birth: null,
      telephone: '',
      position: '',
      group: '',
      permissions: '',
      user: null,
      department: null
    });
    setCurrentStaffIndex(null);
    setView(ROUTES.STAFF);
    navigate('/staff/edit');
  };

  // Mappe Pfad -> View-State (damit Sidebar weiterhin korrekt funktioniert)
  useEffect(() => {
    const p = location.pathname || '';
    if (p.startsWith('/services-overview')) {
      setView(ROUTES.SERVICES_OVERVIEW);
    } else if (p.startsWith('/services')) {
      setView(ROUTES.SERVICES);
    } else if (p.startsWith('/staff-overview')) {
      setView(ROUTES.STAFF_OVERVIEW);
    } else if (p.startsWith('/staff')) {
      setView(ROUTES.STAFF);
    } else if (p.startsWith('/department-overview')) {
      setView(ROUTES.DEPARTMENT_OVERVIEW);
    } else if (p.startsWith('/department')) {
      setView(ROUTES.DEPARTMENT);
    }
  }, [location.pathname]);

  // Weitergabe einer kompatiblen onSelect-API an Kinder, leitet auf Router um
  const selectView = (v) => {
    // Set view immediately for responsive UI, then sync URL
    setView(v);
    switch (v) {
      case ROUTES.DEPARTMENT_OVERVIEW: return navigate('/department-overview');
      case ROUTES.DEPARTMENT: return navigate('/department');
      case ROUTES.SERVICES_OVERVIEW: return navigate('/services-overview');
      case ROUTES.SERVICES: return navigate('/services');
      case ROUTES.STAFF_OVERVIEW: return navigate('/staff-overview');
      case ROUTES.STAFF: return navigate('/staff/edit');
      default: return navigate('/department-overview');
    }
  };

  // Ensure after login or unknown path we land on Department Overview
  useEffect(() => {
    if (!isAuthenticated) return;
    const p = location.pathname || '';
    const known = [
      '/department-overview',
      '/department',
      '/services-overview',
      '/services',
      '/staff-overview',
      '/staff',
      '/staff/edit'
    ];
    if (p === '/' || !known.some(k => p.startsWith(k))) {
      setView(ROUTES.DEPARTMENT_OVERVIEW);
      navigate('/department-overview', { replace: true });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Log_InApp onLogin={handleLogin} />;
  }

  return (
    <div
      className={`app-container ${sidebarExpanded ? 'sidebar-expanded' : ''}`}
      onClick={() => {
        if (sidebarExpanded) {
          setSidebarExpanded(false);
        }
      }}
    >
      <Sidebar
        view={view}
        onSelect={selectView}
        expanded={sidebarExpanded}
        onExpandChange={setSidebarExpanded}
      />
      <Header onLogout={handleLogout} />
      <main className="main-content">

        {view === ROUTES.DEPARTMENT_OVERVIEW && (
          <DepartmentOverview
            departments={enrichedDepartments}
            generalEmployees={employees}
            onNew={handleNew}
            onEdit={handleEdit}
            onDeleteSelected={handleDeleteDepartments}
          />
        )}

        {view === ROUTES.STAFF_OVERVIEW && (
          <StaffOverview
            employees={employees}
            departments={departments}
            onSelect={selectView}
            onEditEmployee={(emp, idx) => {
              setCurrentStaff(emp);
              setCurrentStaffIndex(idx);
              selectView(ROUTES.STAFF);
            }}
            onDeleteEmployees={handleDeleteEmployees}
            onNewStaff={handleNewStaff}
          />
        )}

        {view === ROUTES.DEPARTMENT && (
          <Department
            initialData={currentDept}
            generalEmployees={employees}
            generalServices={services}
            index={currentIndex}
            onSave={handleSaveAndClose}
            onUpdate={handleUpdate}
            onCancel={() => selectView(ROUTES.DEPARTMENT_OVERVIEW)}
            navigateToStaff={() => selectView(ROUTES.STAFF)}
            navigateToServices={() => selectView(ROUTES.SERVICES)}
          />
        )}

        {view === ROUTES.SERVICES_OVERVIEW && (
          <ServicesOverview
            services={services}
            departments={departments}
            onSelect={selectView}
            onEditService={(svc, idx) => {
              setCurrentService(svc);
              setCurrentServiceIndex(idx);
              selectView(ROUTES.SERVICES);
            }}
            onDeleteServices={handleDeleteServices}
          />
        )}

        {view === ROUTES.SERVICES && (
          <Services
            initialData={currentService}
            index={currentServiceIndex}
            generalServices={services}
            generalDepartments={departments} // <-- Liste aller Abteilungen übergeben
            onSaveService={handleSaveServiceAndClose}
            onUpdateService={handleUpdateService}
            onCancel={() => selectView(ROUTES.SERVICES_OVERVIEW)}
          />
        )}

        {view === ROUTES.STAFF && (
          <Staff
            initialData={currentStaff}
            index={currentStaffIndex}
            generalDepartments={departments}
            onSave={handleSaveStaffAndClose}
            onUpdate={handleUpdateStaff}
            onCancel={() => selectView(ROUTES.STAFF_OVERVIEW)}
            onSelect={selectView}
          />
        )}
      </main>
    </div>
  );
}
