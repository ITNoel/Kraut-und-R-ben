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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentDept, setCurrentDept] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [view, setView] = useState('department-overview');

  const handleLogin = async (deptList, empList) => {
    setDepartments(deptList);
    setEmployees(empList);
    setIsAuthenticated(true);
    setView('department-overview');
  };

  const enrichedDepartments = departments.map(dept => {
    const linked = employees.filter(emp => emp.department === dept.id);
    return {
      ...dept,
      employees: linked
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
      services: []
    });
    setCurrentIndex(null);
    setView('department');
  };

  const handleEdit = (dept, idx, generalEmployees) => {
    setCurrentDept(dept);
    setCurrentIndex(idx);
    setView('department');
  };

  const handleSaveAndClose = (deptData, idx) => {
    const updated = idx == null
      ? [...departments, deptData]
      : departments.map((d, i) => i === idx ? deptData : d);

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

    const updated = idx == null
      ? [...departments, deptData]
      : departments.map((d, i) => i === idx ? deptData : d);

    setDepartments(updated);
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
          />
        )}

        {view === 'department' && (
          <Department
            initialData={currentDept}
            generalEmployees={employees}
            index={currentIndex}
            onSave={handleSaveAndClose}
            onUpdate={handleUpdate}
            onCancel={() => setView('department-overview')}
            navigateToStaff={() => setView('staff')}
          />
        )}

        {view === 'staff' && <Staff onSelect={setView} />}
        {view === 'services-overview' && <ServicesOverview onSelect={setView} />}
        {view === 'services' && <Services onSelect={setView} />}
      </main>
    </div>
  );
}
