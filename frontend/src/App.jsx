import React, { useState } from 'react';
import Landing from './pages/Landing';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AiCommandCenter from './pages/AiCommandCenter';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionType, setSessionType] = useState(null); // 'patient' | 'hospital'
  const [patientData, setPatientData] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [userRole, setUserRole] = useState('admin'); // 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient' | 'command_center'

  // Handle switching page when role changes
  const handleRoleChange = (role) => {
    setUserRole(role);
    if (role === 'patient') {
      setCurrentPage('patient');
    } else if (role === 'doctor') {
      setCurrentPage('doctor');
    } else if (role === 'nurse') {
      setCurrentPage('nurse');
    } else if (role === 'receptionist') {
      setCurrentPage('receptionist');
    } else if (role === 'admin') {
      setCurrentPage('admin');
    } else if (role === 'command_center') {
      setCurrentPage('command_center');
    } else {
      setCurrentPage('landing');
    }
  };

  const navigate = (page) => {
    setCurrentPage(page);
    if (page === 'patient') {
      setUserRole('patient');
    } else if (page === 'landing') {
      // Keep existing role
    }
  };

  const handleLogin = ({ sessionType, role, user }) => {
    setSessionType(sessionType);
    setUserRole(role);
    setIsLoggedIn(true);
    if (sessionType === 'patient') {
      setPatientData(user);
      setCurrentPage('patient');
    } else {
      setPatientData(null);
      if (role === 'doctor') {
        setCurrentPage('doctor');
      } else if (role === 'nurse') {
        setCurrentPage('nurse');
      } else if (role === 'receptionist') {
        setCurrentPage('receptionist');
      } else if (role === 'admin') {
        setCurrentPage('admin');
      } else if (role === 'command_center') {
        setCurrentPage('command_center');
      } else {
        setCurrentPage('landing');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSessionType(null);
    setPatientData(null);
    setUserRole('admin');
    setCurrentPage('landing');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-brand-bg text-brand-text">
        {currentPage === 'landing' && (
          <Landing 
            onNavigate={navigate} 
            onSelectRole={handleRoleChange} 
            sessionType={sessionType}
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'patient' && (
          <PatientDashboard 
            onNavigate={navigate} 
            userRole={userRole} 
            setUserRole={handleRoleChange} 
            sessionType={sessionType}
            patientData={patientData}
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'doctor' && (
          <DoctorDashboard 
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'nurse' && (
          <NurseDashboard 
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'receptionist' && (
          <ReceptionDashboard 
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'admin' && (
          <AdminDashboard 
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'command_center' && (
          <AiCommandCenter 
            onNavigate={navigate} 
            onLogout={handleLogout}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
