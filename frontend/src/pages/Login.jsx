import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sparkles, 
  ArrowRight, 
  HeartPulse, 
  Stethoscope, 
  User, 
  Lock, 
  UserPlus, 
  UserCheck, 
  Shield, 
  Calendar, 
  Phone, 
  Mail, 
  Sun, 
  Moon, 
  CheckCircle,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Login({ onLogin }) {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'hospital'
  
  // Patient Sign In fields
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('password123'); // Default mock password
  const [showPatientPassword, setShowPatientPassword] = useState(false);

  // Hospital Sign In fields
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalRole, setHospitalRole] = useState('admin'); // 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist'
  const [hospitalPassword, setHospitalPassword] = useState('password123');
  const [showHospitalPassword, setShowHospitalPassword] = useState(false);

  // Patient & Hospital Sign Up fields
  const [signupType, setSignupType] = useState('patient'); // 'patient' | 'hospital'
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupDob, setSignupDob] = useState('');
  const [signupGender, setSignupGender] = useState('Male');
  const [signupStaffRole, setSignupStaffRole] = useState('doctor');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load and apply theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Fetch profiles from backend
  useEffect(() => {
    async function loadAuthMetadata() {
      try {
        const patientsRes = await fetch('/api/v1/appointments/patients');
        if (patientsRes.ok) {
          const data = await patientsRes.json();
          setPatients(data);
        }
      } catch (e) {
        console.error("Could not fetch patients for login list:", e);
      }

      try {
        const doctorsRes = await fetch('/api/v1/appointments/doctors');
        if (doctorsRes.ok) {
          const data = await doctorsRes.json();
          setDoctors(data);
        }
      } catch (e) {
        console.error("Could not fetch doctors for login list:", e);
      }
    }
    loadAuthMetadata();
  }, []);

  // Demo accounts data
  const demoPatients = [
    { name: 'John Doe', email: 'john.doe@gmail.com', mrn: 'MRN-848202', phone: '+1 555-0199', dob: '1990-05-12' },
    { name: 'Jane Smith', email: 'jane.smith@gmail.com', mrn: 'MRN-193848', phone: '+1 555-0299', dob: '1995-09-23' },
    { name: 'Tom Johnson', email: 'tom.j@gmail.com', mrn: 'MRN-729482', phone: '+1 555-0399', dob: '1982-12-01' }
  ];

  const demoStaff = [
    { name: 'Dr. Richard', email: 'richard@gmail.com', role: 'doctor' },
    { name: 'Nurse Emily', email: 'emily@gmail.com', role: 'nurse' },
    { name: 'Receptionist Michael', email: 'michael@gmail.com', role: 'receptionist' },
    { name: 'Pharmacist Michael Scott', email: 'scott@gmail.com', role: 'pharmacist' },
    { name: 'Operations Admin Angela', email: 'angela@gmail.com', role: 'admin' },
    { name: 'Dr. Jessica Davis (Head of Hospital)', email: 'jessica@gmail.com', role: 'command_center' }
  ];

  const staffAccounts = {
    'richard@gmail.com': { name: 'Dr. Richard', email: 'richard@gmail.com', role: 'doctor', password: '123' },
    'emily@gmail.com': { name: 'Nurse Emily', email: 'emily@gmail.com', role: 'nurse', password: '123' },
    'scott@gmail.com': { name: 'Pharmacist Michael Scott', email: 'scott@gmail.com', role: 'pharmacist', password: '123' },
    'michael@gmail.com': { name: 'Receptionist Michael', email: 'michael@gmail.com', role: 'receptionist', password: '123' },
    'angela@gmail.com': { name: 'Operations Admin Angela', email: 'angela@gmail.com', role: 'admin', password: '123' },
    'jessica@gmail.com': { name: 'Dr. Jessica Davis (Head of Hospital)', email: 'jessica@gmail.com', role: 'command_center', password: '123' }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (!patientEmail.trim()) {
      alert("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: patientEmail,
          password: patientPassword,
          session_type: 'patient',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('curalink_token', data.access_token);
        setLoading(false);
        onLogin({
          sessionType: 'patient',
          role: 'patient',
          user: data.user,
        });
      } else {
        setLoading(false);
        alert("Invalid email or password.");
      }
    } catch (err) {
      console.error("Patient login request failed:", err);
      setLoading(false);
      alert("Unable to reach the authentication service. Please try again.");
    }
  };

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = hospitalEmail.trim().toLowerCase();
    if (!cleanEmail) {
      alert("Please enter your staff ID or email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: hospitalPassword,
          session_type: 'hospital',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('curalink_token', data.access_token);
        setLoading(false);
        onLogin({
          sessionType: 'hospital',
          role: data.role,
          user: data.user,
        });
        return;
      }
    } catch (err) {
      console.error("Hospital login request failed:", err);
    }

    // Evaluate against valid staff accounts map
    const account = staffAccounts[cleanEmail];
    if (account && account.password === hospitalPassword) {
      setLoading(false);
      onLogin({
        sessionType: 'hospital',
        role: account.role,
        user: { email: account.email, name: account.name },
      });
    } else {
      setLoading(false);
      alert("Invalid staff email, role, or password. Access is restricted to authorized hospital staff accounts.");
    }
  };

  const handlePatientSignUp = async (e) => {
    e.preventDefault();
    if (!signupFirstName.trim() || !signupLastName.trim() || !signupEmail.trim() || !signupPhone.trim() || !signupDob || !signupPassword.trim()) {
      alert("Please fill out all required fields including password.");
      return;
    }
    if (signupPassword.length < 4) {
      alert("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/appointments/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: signupFirstName,
          last_name: signupLastName,
          email: signupEmail,
          phone_number: signupPhone,
          date_of_birth: signupDob,
          gender: signupGender,
          password: signupPassword,
        }),
      });

      if (response.ok) {
        const newPatient = await response.json();
        setPatientEmail(signupEmail);
        setPatientPassword(signupPassword);
        setTimeout(() => {
          setLoading(false);
          onLogin({
            sessionType: 'patient',
            role: 'patient',
            user: newPatient
          });
        }, 1200);
      } else {
        const errorData = await response.json();
        setLoading(false);
        alert(errorData.detail || "Account registration failed. A patient with this email may already exist.");
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      // Fallback for demo environments if backend isn't connected yet
      const fallbackPatient = {
        id: 100 + Math.floor(Math.random() * 900),
        first_name: signupFirstName,
        last_name: signupLastName,
        email: signupEmail,
        phone_number: signupPhone,
        date_of_birth: signupDob,
        gender: signupGender,
        medical_record_number: 'MRN-' + Math.floor(100000 + Math.random() * 900000)
      };
      setTimeout(() => {
        setLoading(false);
        onLogin({
          sessionType: 'patient',
          role: 'patient',
          user: fallbackPatient
        });
      }, 1200);
    }
  };
  const handleHospitalSignUp = async (e) => {
    e.preventDefault();
    if (!signupFirstName.trim() || !signupLastName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      alert("Please fill out all required fields.");
      return;
    }
    if (signupPassword.length < 4) {
      alert("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/register-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: signupFirstName,
          last_name: signupLastName,
          email: signupEmail,
          role: signupStaffRole,
          password: signupPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('curalink_token', data.access_token);
        setHospitalEmail(signupEmail);
        setHospitalPassword(signupPassword);
        setLoading(false);
        onLogin({
          sessionType: 'hospital',
          role: data.role,
          user: data.user,
        });
      } else {
        const errorData = await response.json();
        setLoading(false);
        alert(errorData.detail || "Staff registration failed.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      onLogin({
        sessionType: 'hospital',
        role: signupStaffRole,
        user: { email: signupEmail, name: `${signupFirstName} ${signupLastName}` }
      });
    }
  };

  const handleQuickPatientLogin = async (e, p) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: p.email,
          password: 'password123',
          session_type: 'patient',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('curalink_token', data.access_token);
        setLoading(false);
        onLogin({
          sessionType: 'patient',
          role: 'patient',
          user: data.user,
        });
      } else {
        setLoading(false);
        alert("Demo account authentication failed.");
      }
    } catch (err) {
      console.error("Quick patient login failed:", err);
      setLoading(false);
      alert("Unable to reach the authentication service.");
    }
  };

  const handleQuickStaffLogin = async (staff) => {
    if (staff.role === 'pharmacist' || staff.role === 'command_center') {
      onLogin({
        sessionType: 'hospital',
        role: staff.role,
        user: {
          email: staff.email,
          name: staff.name
        }
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staff.email,
          password: 'password123',
          session_type: 'hospital',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('curalink_token', data.access_token);
        setLoading(false);
        onLogin({
          sessionType: 'hospital',
          role: data.role,
          user: data.user,
        });
      } else {
        setLoading(false);
        alert("Demo staff authentication failed.");
      }
    } catch (err) {
      console.error("Quick staff login failed:", err);
      setLoading(false);
      alert("Unable to reach the authentication service.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex transition-colors duration-300 relative select-none overflow-hidden font-sans">
      {/* Background Decorative Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-brand-teal/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Left panel: Futuristic clinical visual panel */}
      <div className="hidden md:flex md:w-1/2 bg-[#080E1E] text-white flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-[#070A13] via-[#0D1426] to-[#16223F] border-r border-[#14234C]">
        {/* Background mesh element */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-900/40 to-slate-900 pointer-events-none" />
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="p-2.5 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 shadow-[0_4px_16px_rgba(20,184,166,0.15)]">
            <Activity className="w-6 h-6 text-brand-teal animate-pulse" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white font-display">
            CuraLink
          </span>
        </div>

        {/* Dynamic Glassmorphic Core Message Card */}
        <div className="my-auto z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-teal/10 border border-brand-teal/25 rounded-full text-brand-teal text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Neural Intake Intelligence
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black font-display tracking-tight leading-[1.15] text-white">
              Connecting <br />
              <span className="bg-gradient-to-r from-brand-accent to-brand-teal bg-clip-text text-transparent">Medicine & Intelligence</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              CuraLink streamlines clinic check-ins, automates patient prioritization via medical-expert AI models, and tracks real-time department surge metrics on a unified dashboard.
            </p>
          </div>

          {/* Testimonial snippet */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
            <p className="text-xs text-slate-400 font-semibold italic">
              "We have reduced clinical backlog by over 34% since routing intake operations through CuraLink's neural queue booking engines."
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-[10px] text-brand-accent font-bold">JD</div>
              <span className="text-[10px] text-slate-300 font-bold">Dr. Jessica Davis, Chief Medical Officer</span>
            </div>
          </div>
        </div>

        {/* Infrastructure telemetry data footer */}
        <div className="z-10 pt-6 border-t border-[#1E2E5A] flex justify-between items-center text-slate-500 font-mono text-[10px]">
          <span className="flex items-center gap-1.5 font-bold"><Database className="w-3.5 h-3.5 text-brand-teal" /> CURALINK-DB: OPERATIONAL</span>
          <span className="font-bold">v1.2.0-STABLE</span>
        </div>
      </div>

      {/* Right panel: Authentication and Registration Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-12 relative overflow-y-auto">
        
        {/* Toggle Theme & Back Navigation Header */}
        <header className="w-full flex justify-between items-center z-10 mb-6">
          {/* Logo visible only on mobile */}
          <div className="flex md:hidden items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-teal/10 border border-brand-teal/20">
              <Activity className="w-5 h-5 text-brand-teal animate-pulse" />
            </div>
            <span className="font-bold text-lg text-brand-text font-display">CuraLink</span>
          </div>

          <div className="flex items-center gap-3.5 ml-auto">
            {/* Theme Toggle Button */}
            <button 
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-brand-border/80 bg-brand-card hover:bg-brand-hover text-brand-muted hover:text-brand-text transition-all cursor-pointer shadow-sm"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <span className="hidden sm:inline-flex text-[9px] tracking-widest text-brand-teal font-mono bg-brand-teal/10 px-3.5 py-1.5 rounded-full border border-brand-teal/20 shadow-sm font-bold">
              CLINICAL PORTAL
            </span>
          </div>
        </header>

        {/* Form Container */}
        <main className="w-full max-w-md mx-auto my-auto py-4 z-10 relative">
          <div className="glass-panel p-8 rounded-3xl border border-brand-border/80 shadow-[0_8px_32px_0_rgba(15,23,42,0.03)] bg-brand-card transition-all duration-300">
            
            {/* Tab selector between Sign In / Create Account */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                type="button"
                onClick={() => { if (!loading) setAuthMode('signin'); }}
                disabled={loading}
                className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  authMode === 'signin'
                    ? 'border-brand-accent text-brand-accent'
                    : 'border-transparent text-brand-muted hover:text-brand-text'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { if (!loading) setAuthMode('signup'); }}
                disabled={loading}
                className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  authMode === 'signup'
                    ? 'border-brand-teal text-brand-teal'
                    : 'border-transparent text-brand-muted hover:text-brand-text'
                }`}
              >
                Create Account
              </button>
            </div>

            {loading ? (
              /* Loading Handshake Telemetry */
              <div className="py-14 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-accent/10 border-t-brand-accent animate-spin" />
                  <Activity className="w-6 h-6 text-brand-accent animate-pulse absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-brand-text block font-mono">Securing CuraLink...</span>
                  <span className="text-[10px] text-brand-muted block font-mono">Verifying telemetry handshake</span>
                </div>
              </div>
            ) : (
              <>
                {/* 1. SIGN IN FLOW */}
                {authMode === 'signin' && (
                  <>
                    {/* Header telemetry icon */}
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/25 flex items-center justify-center text-brand-accent mb-3 shadow-sm">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-extrabold text-brand-text font-display">Portal Gateway</h2>
                      <p className="text-[11px] text-brand-muted mt-1 leading-relaxed font-semibold">
                        Enter your credentials or select a simulation profile.
                      </p>
                    </div>

                    {/* Patient Portal vs Hospital Staff Tabs */}
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-brand-bg border border-brand-border rounded-xl mb-6">
                      <button
                        type="button"
                        onClick={() => setActiveTab('patient')}
                        className={`py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          activeTab === 'patient'
                            ? 'bg-brand-card text-brand-text shadow-sm border border-brand-border/40'
                            : 'text-brand-muted hover:text-brand-text'
                        }`}
                      >
                        <HeartPulse className={`w-3.5 h-3.5 ${activeTab === 'patient' ? 'text-brand-teal' : 'text-brand-muted'}`} />
                        Patient Portal
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('hospital')}
                        className={`py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          activeTab === 'hospital'
                            ? 'bg-brand-card text-brand-text shadow-sm border border-brand-border/40'
                            : 'text-brand-muted hover:text-brand-text'
                        }`}
                      >
                        <Stethoscope className={`w-3.5 h-3.5 ${activeTab === 'hospital' ? 'text-brand-accent' : 'text-brand-muted'}`} />
                        Hospital Staff
                      </button>
                    </div>

                    {/* Tab 1: Patient Sign In */}
                    {activeTab === 'patient' && (
                      <form onSubmit={handlePatientSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Registered Email Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={patientEmail}
                              onChange={(e) => setPatientEmail(e.target.value)}
                              placeholder="john.doe@gmail.com"
                              className="w-full pl-9 pr-4 py-2.5 bg-brand-bg/50 border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 rounded-xl text-xs focus:outline-none text-brand-text placeholder-brand-muted/70 font-semibold transition-all"
                            />
                            <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3.5" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Access Key / Password</label>
                          <div className="relative">
                            <input
                              type={showPatientPassword ? "text" : "password"}
                              required
                              value={patientPassword}
                              onChange={(e) => setPatientPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full pl-9 pr-10 py-2.5 bg-brand-bg/50 border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 rounded-xl text-xs focus:outline-none text-brand-text placeholder-brand-muted/70 font-semibold transition-all"
                            />
                            <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3.5" />
                            <button
                              type="button"
                              onClick={() => setShowPatientPassword(!showPatientPassword)}
                              className="absolute right-3 top-3.5 text-brand-muted hover:text-brand-text cursor-pointer"
                            >
                              {showPatientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-brand-teal hover:bg-brand-teal/95 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-teal/10 hover:shadow-brand-teal/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 mt-3"
                        >
                          Authenticate Patient Portal
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Quick Demo Patients Grid */}
                        <div className="pt-4 border-t border-brand-border/60 mt-4 space-y-2">
                          <span className="text-[9px] text-brand-muted font-bold uppercase tracking-widest block">Quick Demo Patients</span>
                          <div className="grid grid-cols-3 gap-2">
                            {demoPatients.map((p) => (
                              <button
                                key={p.email}
                                type="button"
                                onClick={(e) => handleQuickPatientLogin(e, p)}
                                className="p-2 bg-brand-bg hover:bg-brand-teal/5 border border-brand-border hover:border-brand-teal/30 rounded-xl text-left cursor-pointer transition-all active:scale-95 flex flex-col justify-between min-h-[50px] group"
                              >
                                <span className="text-[10px] font-extrabold text-brand-text truncate block group-hover:text-brand-teal transition-colors">{p.name}</span>
                                <span className="text-[8px] text-brand-muted truncate block">{p.email}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Tab 2: Hospital Staff Sign In */}
                    {activeTab === 'hospital' && (
                      <form onSubmit={handleHospitalSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Staff Email or ID</label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={hospitalEmail}
                              onChange={(e) => setHospitalEmail(e.target.value)}
                              placeholder="richard.patel@mediflow.com"
                              className="w-full pl-9 pr-4 py-2.5 bg-brand-bg/50 border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 rounded-xl text-xs focus:outline-none text-brand-text placeholder-brand-muted/70 font-semibold transition-all"
                            />
                            <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3.5" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4.5">
                          <div className="space-y-1">
                            <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Access Role</label>
                            <select
                              value={hospitalRole}
                              onChange={(e) => setHospitalRole(e.target.value)}
                              className="w-full px-3 py-2.5 bg-brand-bg border border-brand-border focus:border-brand-accent rounded-xl text-xs focus:outline-none text-brand-text font-semibold cursor-pointer"
                            >
                              <option value="admin">Operations Admin</option>
                              <option value="doctor">Doctor Portal</option>
                              <option value="nurse">Nurse Portal</option>
                              <option value="receptionist">Receptionist</option>
                              <option value="pharmacist">Pharmacist</option>
                              <option value="command_center">Head of Hospital (AI Command Center)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Security Code</label>
                            <div className="relative">
                              <input
                                type={showHospitalPassword ? "text" : "password"}
                                required
                                value={hospitalPassword}
                                onChange={(e) => setHospitalPassword(e.target.value)}
                                placeholder="••••••"
                                className="w-full pl-9 pr-10 py-2.5 bg-brand-bg/50 border border-brand-border focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 rounded-xl text-xs focus:outline-none text-brand-text placeholder-brand-muted/70 font-semibold transition-all"
                              />
                              <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3.5" />
                              <button
                                type="button"
                                onClick={() => setShowHospitalPassword(!showHospitalPassword)}
                                className="absolute right-3 top-3.5 text-brand-muted hover:text-brand-text cursor-pointer"
                              >
                                {showHospitalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-brand-accent hover:bg-brand-accent/95 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-accent/10 hover:shadow-brand-accent/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 mt-3"
                        >
                          Authenticate Hospital Staff
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Quick Demo Staff Grid */}
                        <div className="pt-4 border-t border-brand-border/60 mt-4 space-y-2">
                          <span className="text-[9px] text-brand-muted font-bold uppercase tracking-widest block">Quick Demo Staff Accounts</span>
                          <div className="grid grid-cols-2 gap-2">
                            {demoStaff.map((staff) => (
                              <button
                                key={staff.email}
                                type="button"
                                onClick={() => handleQuickStaffLogin(staff)}
                                className="p-2 bg-brand-bg hover:bg-brand-accent/5 border border-brand-border hover:border-brand-accent/30 rounded-xl text-left cursor-pointer transition-all active:scale-95 flex flex-col justify-between group min-h-[48px]"
                              >
                                <span className="text-[10px] font-extrabold text-brand-text truncate block group-hover:text-brand-accent transition-colors">{staff.name}</span>
                                <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{
                                  color: staff.role === 'admin' ? '#A855F7' : staff.role === 'doctor' ? '#3B82F6' : staff.role === 'nurse' ? '#10B981' : staff.role === 'pharmacist' ? '#F43F5E' : '#F59E0B'
                                }}>{staff.role}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* HIPAA & Role Isolation Security Notice */}
                        <div className="pt-4 border-t border-brand-border/60 mt-4 text-center">
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed flex items-center justify-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            HIPAA & RBAC Active: Staff credentials strictly grant access to your designated clinical domain.
                          </p>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* 2. CREATE ACCOUNT FLOW */}
                {authMode === 'signup' && (
                  <>
                    {/* Header telemetry icon */}
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 border border-brand-teal/25 flex items-center justify-center text-brand-teal mb-2 shadow-sm">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-extrabold text-brand-text font-display">Create CuraLink Profile</h2>
                      <p className="text-[11px] text-brand-muted mt-0.5 leading-relaxed font-semibold">
                        Register a new patient profile in CuraLink.
                      </p>
                    </div>

                    <form onSubmit={handlePatientSignUp} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">First Name</label>
                          <input
                            type="text"
                            required
                            value={signupFirstName}
                            onChange={(e) => setSignupFirstName(e.target.value)}
                            placeholder="John"
                            className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 rounded-xl text-xs focus:outline-none text-brand-text placeholder-brand-muted/70 font-semibold transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Last Name</label>
                          <input
                            type="text"
                            required
                            value={signupLastName}
                            onChange={(e) => setSignupLastName(e.target.value)}
                            placeholder="Doe"
                            className="w-full px-3 py-2 bg-brand-bg/50 border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 rounded-xl text-xs focus:outline-none text-brand-text placeholder-brand-muted/70 font-semibold transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            placeholder="john.doe@gmail.com"
                            className="w-full pl-9 pr-4 py-2 bg-brand-bg/50 border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 rounded-xl text-xs focus:outline-none text-brand-text placeholder-brand-muted/70 font-semibold transition-all"
                          />
                          <Mail className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Phone Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            placeholder="+1 555-0199"
                            className="w-full pl-9 pr-4 py-2 bg-brand-bg/50 border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 rounded-xl text-xs focus:outline-none text-brand-text placeholder-brand-muted/70 font-semibold transition-all"
                          />
                          <Phone className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Date of Birth</label>
                          <div className="relative">
                            <input
                              type="date"
                              required
                              value={signupDob}
                              onChange={(e) => setSignupDob(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-brand-bg/50 border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 rounded-xl text-xs focus:outline-none text-brand-text font-semibold transition-all"
                            />
                            <Calendar className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-2.5 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-brand-muted font-bold uppercase tracking-wider block">Security Password</label>
                          <div className="relative">
                            <input
                              type={showSignupPassword ? "text" : "password"}
                              required
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              placeholder="Create a password (min 4 chars)"
                              className="w-full pl-9 pr-10 py-2 bg-brand-bg/50 border border-brand-border focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20 rounded-xl text-xs focus:outline-none text-brand-text placeholder-brand-muted/70 font-semibold transition-all"
                            />
                            <Lock className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 top-2.5 text-brand-muted hover:text-brand-text cursor-pointer"
                            >
                              {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-teal hover:bg-brand-teal/95 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-teal/10 hover:shadow-brand-teal/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 mt-4"
                      >
                        Register & Access Patient Portal
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>

                    <div className="text-center pt-2">
                      <span className="text-[10px] text-brand-muted">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('signin')}
                          className="text-brand-teal font-extrabold hover:underline cursor-pointer"
                        >
                          Sign In
                        </button>
                      </span>
                    </div>
                  </>
                )}
              </>
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className="w-full text-center text-[10px] text-brand-muted py-4 font-semibold">
          Secure CuraLink Intake Session • Authorized Access Only
        </footer>
      </div>
    </div>
  );
}
