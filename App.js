// src/App.jsx

import React, { useState } from 'react';
import './global.css';
import './App.css';

import Log_InApp from './Components-Log_In/Log_In-App';
import Sidebar from './Components-Website/Sidebar';
import Header from './Components-Website/Header';
import DepartmentOverview from './Components-Website/Department-Overview';
import Department from './Components-Website/Department';
import Staff from './Components-Website/Staff';
import ServicesOverview from './Components-Website/Services-Overview';
import Services from './Components-Website/Services';
import { api } from './Functions/apiClient';
import StaffOverview from './Components-Website/Staff-Overview'; // NEW

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]); // already present
  const [currentDept, setCurrentDept] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [view, setView] = useState('department-overview');
  const [currentService, setCurrentService] = useState(null);      // NEW
  const [currentServiceIndex, setCurrentServiceIndex] = useState(null); // NEW
  const [currentStaff, setCurrentStaff] = useState(null);          // NEW
  const [currentStaffIndex, setCurrentStaffIndex] = useState(null); // NEW

  const handleLogin = (deptList, empList, servicesList = []) => {
    setDepartments(deptList);
    setEmployees(empList);
    setServices(Array.isArray(servicesList) ? servicesList : []);
    setIsAuthenticated(true);
    setView('department-overview');
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
    setView('department');
  };

  const handleEdit = (dept, idx, generalEmployees) => {
    // currentDept mit kompletter Personenliste anreichern
    setCurrentDept({ ...dept, allEmployees: employees });
    setCurrentIndex(idx);
    setView('department');
  };

  const handleSaveAndClose = (deptData, idx) => {
    // Falls deptData eine id hat und bereits vorhanden ist -> ersetzen.
    const findById = deptData?.id != null
      ? departments.findIndex(d => d.id === deptData.id)
      : -1;
    const findByName = findById === -1
      ? departments.findIndex(d => d.name === deptData.name)
      : -1;

    let updated;
    if (idx != null) {
      updated = departments.map((d, i) => i === idx ? deptData : d);
    } else if (findById !== -1) {
      updated = departments.map((d, i) => i === findById ? deptData : d);
    } else if (findByName !== -1) {
      updated = departments.map((d, i) => i === findByName ? deptData : d);
    } else {
      updated = [...departments, deptData];
    }

    setDepartments(updated);
    setView('department-overview');
  };

  const handleUpdate = (deptData, idx) => {
    if (deptData === null && idx != null) {
      // Abteilung wurde gelöscht → aus Liste entfernen
      const updated = departments.filter((_, i) => i !== idx);
      setDepartments(updated);
      return;
    }

    // Wie bei handleSaveAndClose: falls id/name bereits existiert → ersetzen
    const findById = deptData?.id != null
      ? departments.findIndex(d => d.id === deptData.id)
      : -1;
    const findByName = findById === -1
      ? departments.findIndex(d => d.name === deptData.name)
      : -1;

    let updated;
    if (idx != null) {
      updated = departments.map((d, i) => i === idx ? deptData : d);
    } else if (findById !== -1) {
      updated = departments.map((d, i) => i === findById ? deptData : d);
    } else if (findByName !== -1) {
      updated = departments.map((d, i) => i === findByName ? deptData : d);
    } else {
      updated = [...departments, deptData];
    }

    setDepartments(updated);
  };

  // Entfernt mehrere Abteilungen aus dem globalen Zustand (IDs array)
  const handleDeleteDepartments = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    setDepartments(prev => prev.filter(d => !ids.includes(d.id)));
  };

  // Speichern (und anschließend zur Übersicht) — vermeidet Duplikate (id oder name)
  const handleSaveServiceAndClose = (svcData, idx) => {
    const findById = svcData?.id != null ? services.findIndex(s => s.id === svcData.id) : -1;
    const findByName = findById === -1 ? services.findIndex(s => s.name === svcData.name) : -1;

    let updated;
    if (idx != null) {
      updated = services.map((s, i) => i === idx ? svcData : s);
    } else if (findById !== -1) {
      updated = services.map((s, i) => i === findById ? svcData : s);
    } else if (findByName !== -1) {
      updated = services.map((s, i) => i === findByName ? svcData : s);
    } else {
      updated = [...services, svcData];
    }

    setServices(updated);
    setView('services-overview');
  };

  // Update (in-place) oder Anfügen, analog zu Departments
  const handleUpdateService = (svcData, idx) => {
    if (svcData === null && idx != null) {
      const updated = services.filter((_, i) => i !== idx);
      setServices(updated);
      return;
    }
    const findById = svcData?.id != null ? services.findIndex(s => s.id === svcData.id) : -1;
    const findByName = findById === -1 ? services.findIndex(s => s.name === svcData.name) : -1;

    let updated;
    if (idx != null) {
      updated = services.map((s, i) => i === idx ? svcData : s);
    } else if (findById !== -1) {
      updated = services.map((s, i) => i === findById ? svcData : s);
    } else if (findByName !== -1) {
      updated = services.map((s, i) => i === findByName ? svcData : s);
    } else {
      updated = [...services, svcData];
    }
    setServices(updated);
  };

  // Entfernt Services per id-Liste
  const handleDeleteServices = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    setServices(prev => prev.filter(s => !ids.includes(s.id)));
  };

  // Entfernt mehrere Mitarbeiter aus dem globalen Zustand (IDs array)
  const handleDeleteEmployees = (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    setEmployees(prev => prev.filter(emp => !ids.includes(emp.id)));
  };

  // Save staff and close — vermeidet Duplikate (id oder name)
  const handleSaveStaffAndClose = (staffData, idx) => {
    const findById = staffData?.id != null ? employees.findIndex(s => s.id === staffData.id) : -1;
    const findByName = findById === -1 ? employees.findIndex(s => `${s.first_name} ${s.last_name}` === `${staffData.first_name} ${staffData.last_name}`) : -1;

    let updated;
    if (idx != null) {
      updated = employees.map((s, i) => i === idx ? staffData : s);
    } else if (findById !== -1) {
      updated = employees.map((s, i) => i === findById ? staffData : s);
    } else if (findByName !== -1) {
      updated = employees.map((s, i) => i === findByName ? staffData : s);
    } else {
      updated = [...employees, staffData];
    }
    setEmployees(updated);
    setView('staff-overview');
  };

  const handleUpdateStaff = (staffData, idx) => {
    if (staffData === null && idx != null) {
      setEmployees(prev => prev.filter((_, i) => i !== idx));
      return;
    }
    const findById = staffData?.id != null ? employees.findIndex(s => s.id === staffData.id) : -1;
    const findByName = findById === -1 ? employees.findIndex(s => `${s.first_name} ${s.last_name}` === `${staffData.first_name} ${staffData.last_name}`) : -1;

    let updated;
    if (idx != null) {
      updated = employees.map((s, i) => i === idx ? staffData : s);
    } else if (findById !== -1) {
      updated = employees.map((s, i) => i === findById ? staffData : s);
    } else if (findByName !== -1) {
      updated = employees.map((s, i) => i === findByName ? staffData : s);
    } else {
      updated = [...employees, staffData];
    }
    setEmployees(updated);
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
    setView('staff');
  };

  if (!isAuthenticated) {
    return <Log_InApp onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar view={view} onSelect={setView} />
      <main className="main-content">
        <Header />

        {view === 'department-overview' && (
          <DepartmentOverview
            departments={enrichedDepartments}
            generalEmployees={employees}
            onNew={handleNew}
            onEdit={handleEdit}
            onDeleteSelected={handleDeleteDepartments}
          />
        )}

        {view === 'staff-overview' && (
          <StaffOverview
            employees={employees}
            onSelect={setView}
            onEditEmployee={(emp, idx) => {
              setCurrentStaff(emp);
              setCurrentStaffIndex(idx);
              setView('staff');
            }}
            onDeleteEmployees={handleDeleteEmployees}
            onNewStaff={handleNewStaff}
          />
        )}

        {view === 'department' && (
          <Department
            initialData={currentDept}
            generalEmployees={employees}
            generalServices={services}
            index={currentIndex}
            onSave={handleSaveAndClose}
            onUpdate={handleUpdate}
            onCancel={() => setView('department-overview')}
            navigateToStaff={() => setView('staff')}
            navigateToServices={() => setView('services')}
          />
        )}

        {view === 'services-overview' && (
          <ServicesOverview
            services={services}
            onSelect={setView}
            onEditService={(svc, idx) => {
              setCurrentService(svc);
              setCurrentServiceIndex(idx);
              setView('services');
            }}
            onDeleteServices={handleDeleteServices}
          />
        )}

        {view === 'services' && (
          <Services
            initialData={currentService}
            index={currentServiceIndex}
            generalServices={services}
            onSaveService={handleSaveServiceAndClose}
            onUpdateService={handleUpdateService}
            onCancel={() => setView('services-overview')}
          />
        )}

        {view === 'staff' && (
          <Staff
            initialData={currentStaff}
            index={currentStaffIndex}
            generalDepartments={departments}
            onSave={handleSaveStaffAndClose}
            onUpdate={handleUpdateStaff}
            onCancel={() => setView('staff-overview')}
            onSelect={setView}
          />
        )}
      </main>
    </div>
  );
}
