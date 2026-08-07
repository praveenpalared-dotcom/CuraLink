import React, { useState } from 'react';
import Landing from './pages/Landing';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AiCommandCenter from './pages/AiCommandCenter';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('curalink_isLoggedIn') === 'true';
  });
  const [sessionType, setSessionType] = useState(() => {
    return localStorage.getItem('curalink_sessionType') || null;
  });
  const [patientData, setPatientData] = useState(() => {
    const saved = localStorage.getItem('curalink_patientData');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [staffData, setStaffData] = useState(() => {
    const saved = localStorage.getItem('curalink_staffData');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('curalink_userRole') || 'patient';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const savedRole = localStorage.getItem('curalink_userRole') || 'patient';
    return savedRole === 'patient' ? 'patient' : savedRole;
  });

  const canAccessPage = (role, page) => {
    if (role === 'patient') return page === 'patient';
    if (role === 'doctor') return page === 'doctor';
    if (role === 'nurse') return page === 'nurse';
    if (role === 'receptionist') return page === 'receptionist';
    if (role === 'pharmacist') return page === 'pharmacist';
    if (role === 'admin') return page === 'admin';
    if (role === 'command_center') return page === 'command_center';
    return false;
  };

  // Handle switching page when role changes
  const handleRoleChange = (role) => {
    setUserRole(role);
    localStorage.setItem('curalink_userRole', role);
    let targetPage = role === 'patient' ? 'patient' : role;
    setCurrentPage(targetPage);
    localStorage.setItem('curalink_currentPage', targetPage);
  };

  const navigate = (page) => {
    if (canAccessPage(userRole, page)) {
      setCurrentPage(page);
      localStorage.setItem('curalink_currentPage', page);
      if (page === 'patient') {
        setUserRole('patient');
        localStorage.setItem('curalink_userRole', 'patient');
      }
    } else {
      alert(`SECURITY WARNING: Access Denied to "${page}". Your role (${userRole?.toUpperCase()}) does not have permission to view other clinical portals.`);
    }
  };

  const handleLogin = ({ sessionType, role, user }) => {
    const finalRole = role || 'doctor';
    setSessionType(sessionType);
    setUserRole(finalRole);
    setIsLoggedIn(true);
    localStorage.setItem('curalink_isLoggedIn', 'true');
    localStorage.setItem('curalink_sessionType', sessionType || '');
    localStorage.setItem('curalink_userRole', finalRole);

    if (sessionType === 'patient') {
      setPatientData(user || null);
      if (user) {
        localStorage.setItem('curalink_patientData', JSON.stringify(user));
      }
      setCurrentPage('patient');
      localStorage.setItem('curalink_currentPage', 'patient');
    } else {
      setPatientData(null);
      setStaffData(user || null);
      if (user) {
        localStorage.setItem('curalink_staffData', JSON.stringify(user));
      }
      localStorage.removeItem('curalink_patientData');
      const targetPage = finalRole;
      setCurrentPage(targetPage);
      localStorage.setItem('curalink_currentPage', targetPage);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSessionType(null);
    setPatientData(null);
    setStaffData(null);
    setUserRole('patient');
    setCurrentPage('patient');
    localStorage.removeItem('curalink_isLoggedIn');
    localStorage.removeItem('curalink_sessionType');
    localStorage.removeItem('curalink_patientData');
    localStorage.removeItem('curalink_staffData');
    localStorage.removeItem('curalink_userRole');
    localStorage.removeItem('curalink_currentPage');
    localStorage.removeItem('curalink_patientActiveTab');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // Ensure current page is directly the authorized dashboard for user's role
  const activePage = userRole === 'patient' ? 'patient' : userRole;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-brand-bg text-brand-text">
        {activePage === 'patient' && (
          <PatientDashboard 
            onNavigate={navigate} 
            userRole={userRole} 
            setUserRole={handleRoleChange} 
            sessionType={sessionType}
            patientData={patientData}
            onLogout={handleLogout}
          />
        )}
        {activePage === 'doctor' && (
          <DoctorDashboard 
            user={staffData}
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
        {activePage === 'nurse' && (
          <NurseDashboard 
            user={staffData}
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
        {activePage === 'receptionist' && (
          <ReceptionDashboard 
            user={staffData}
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
        {activePage === 'pharmacist' && (
          <PharmacistDashboard 
            user={staffData}
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
        {activePage === 'admin' && (
          <AdminDashboard 
            user={staffData}
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
        {activePage === 'command_center' && (
          <AiCommandCenter 
            user={staffData}
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
