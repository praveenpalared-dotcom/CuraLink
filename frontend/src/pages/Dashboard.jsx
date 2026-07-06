import React, { useState, useEffect } from 'react';
import QueueBoard from '../components/QueueBoard';
import { PeakHoursChart, QueueOverviewChart, CapacityUtilization, PatientFlowTrendChart, NoShowHeatmap, DepartmentEfficiencyChart, WorkloadDistributionChart } from '../components/DashboardCharts';
import { 
  LayoutDashboard, Users, Calendar, Activity, Bot, Sparkles, 
  AlertCircle, Clock, DollarSign, UserCheck, CalendarDays, BarChart3,
  Moon, Sun, HelpCircle, UserPlus, ShieldAlert, Plus, Layers, ArrowUpRight,
  RefreshCw, Star, Compass, LogOut
} from 'lucide-react';

export default function Dashboard({ onNavigate, userRole, setUserRole, sessionType, onLogout }) {
  const [activeTab, setActiveTab] = useState('operations');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState(18);
  const [avgWaitTime, setAvgWaitTime] = useState(14); // Optimized default wait
  const [recommendationApplied, setRecommendationApplied] = useState(false);

  // Form states for Receptionist Walk-in
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInDept, setWalkInDept] = useState('General Medicine');
  const [walkInDoctor, setWalkInDoctor] = useState(1);
  const [walkInComplaint, setWalkInComplaint] = useState('');

  // Vitals sign state for Nurse
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [nurseBp, setNurseBp] = useState('120/80');
  const [nurseTemp, setNurseTemp] = useState('98.6');
  const [nursePulse, setNursePulse] = useState('72');
  const [nurseO2, setNurseO2] = useState('98');
  const [nurseNotes, setNurseNotes] = useState('');

  // Reschedule requests state for Receptionist
  const [rescheduleRequests, setRescheduleRequests] = useState([
    { id: 1, patient: 'Jane Smith', mrn: 'MRN-193848', time: '11:00 AM', requestedTime: '01:30 PM', specialty: 'Ophthalmology', doctor: 'Dr. Angela Yu' },
    { id: 2, patient: 'Tom Johnson', mrn: 'MRN-729482', time: '12:00 PM', requestedTime: '02:30 PM', specialty: 'Orthopedics', doctor: 'Dr. James Evans' }
  ]);

  // Leave / Time-Off requests state
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, name: 'Jessica Taylor, RN', role: 'Nurse', dept: 'General Medicine', date: 'July 5th, 2026', type: 'Medical Leave', status: 'pending' },
    { id: 2, name: 'Dr. Chloe Bennett', role: 'Doctor', dept: 'Dermatology', date: 'July 10th, 2026', type: 'Annual Leave', status: 'pending' },
    { id: 3, name: 'Robert Chen, RN', role: 'Nurse', dept: 'Pediatrics', date: 'July 12th, 2026', type: 'Personal Leave', status: 'approved' }
  ]);

  // Doctor duty list (dynamic check for Receptionist)
  const [doctorDutyList, setDoctorDutyList] = useState([
    { id: 1, name: 'Dr. Richard Patel', specialty: 'General Medicine', active: true },
    { id: 2, name: 'Dr. Angela Yu', specialty: 'Ophthalmology', active: true },
    { id: 3, name: 'Dr. Sarah Jenkins', specialty: 'Pediatrics', active: true },
    { id: 4, name: 'Dr. James Evans', specialty: 'Orthopedics', active: true },
    { id: 5, name: 'Dr. Marcus Vance', specialty: 'Cardiology', active: true },
    { id: 6, name: 'Dr. Chloe Bennett', specialty: 'Dermatology', active: true }
  ]);

  // Stats Metrics State
  const [metrics, setMetrics] = useState({
    avgWait: 14,
    todayAppts: 246,
    noShowsPrevented: 12,
    capacity: 82,
    revenueRecovered: 18450
  });

  // Simulated Alert Stream
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'delay', text: 'Dr. Patel running late (+30m)', urgency: 'high' },
    { id: 2, type: 'capacity', text: 'Queue in General Medicine above threshold (25m wait)', urgency: 'high' },
    { id: 3, type: 'appt', text: 'Cardiac triage case expected in Room 4', urgency: 'high' },
    { id: 4, type: 'staff', text: 'Staff shortage: cardiology nurse called in sick', urgency: 'medium' }
  ]);

  // Simulated Agent Logs
  const [agentLogs, setAgentLogs] = useState([
    { time: '10:14 AM', agent: 'Appointment Agent', text: 'Auto-booked Patient MRN-848202 for General Medicine.' },
    { time: '10:08 AM', agent: 'Reminder Agent', text: 'WhatsApp precheck notification sent to Patient Jane Smith.' },
    { time: '09:45 AM', agent: 'Rescheduling Agent', text: 'Doctor delay flagged. Dynamic slots recalculated; 2 appointments shifted.' }
  ]);

  // Appointment Database state (fetched from backend)
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [queue, setQueue] = useState([]);

  // Shift workforce list
  const [staffShifts, setStaffShifts] = useState([
    { id: 1, name: 'Dr. Richard Patel', role: 'Doctor', specialty: 'General Medicine', shift: '08:00 AM - 04:00 PM', onCall: false },
    { id: 2, name: 'Dr. Angela Yu', role: 'Doctor', specialty: 'Ophthalmology', shift: '09:00 AM - 05:00 PM', onCall: true },
    { id: 3, name: 'Dr. Sarah Jenkins', role: 'Doctor', specialty: 'Pediatrics', shift: '08:00 AM - 04:00 PM', onCall: false },
    { id: 4, name: 'Dr. James Evans', role: 'Doctor', specialty: 'Orthopedics', shift: '10:00 AM - 06:00 PM', onCall: true },
    { id: 5, name: 'Dr. Marcus Vance', role: 'Doctor', specialty: 'Cardiology', shift: '09:00 AM - 05:00 PM', onCall: false },
    { id: 6, name: 'Dr. Chloe Bennett', role: 'Doctor', specialty: 'Dermatology', shift: '08:00 AM - 04:00 PM', onCall: false },
    { id: 7, name: 'Jessica Taylor, RN', role: 'Nurse', specialty: 'General Medicine', shift: '07:00 AM - 03:00 PM', onCall: false },
    { id: 8, name: 'Robert Chen, RN', role: 'Nurse', specialty: 'Pediatrics', shift: '03:00 PM - 11:00 PM', onCall: false }
  ]);

  // Form states for adding shifts
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Nurse');
  const [newStaffSpecialty, setNewStaffSpecialty] = useState('General Medicine');
  const [newStaffShift, setNewStaffShift] = useState('09:00 AM - 05:00 PM');
  const [newStaffOnCall, setNewStaffOnCall] = useState(false);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);

  // Fetch appointments from backend
  const fetchAppointments = async () => {
    setLoadingAppts(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/appointments/');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.reverse());
      }
    } catch (e) {
      console.error("Failed to load appointments:", e);
    } finally {
      setLoadingAppts(false);
    }
  };

  // Fetch queue from backend
  const fetchQueue = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/queue/');
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (e) {
      console.error("Failed to load queue:", e);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchQueue();
    const interval = setInterval(() => {
      fetchAppointments();
      fetchQueue();
    }, 8000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Toggle Theme Function
  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  // Add Simulated Log
  const addSimulatedAgentLog = () => {
    const agents = ['Queue Agent', 'Reminder Agent', 'Workforce Agent', 'Rescheduling Agent'];
    const texts = [
      'Recalculated queue priorities for Pediatrics department.',
      'Dispatched SMS alert to upcoming patient MRN-729482.',
      'Shift optimization updated: allocated 2 float nurses to Floor 1.',
      'Patient check-in completed; updated room assignments.'
    ];
    const randAgent = agents[Math.floor(Math.random() * agents.length)];
    const randText = texts[Math.floor(Math.random() * texts.length)];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setAgentLogs(prev => [{ time, agent: randAgent, text: randText }, ...prev.slice(0, 4)]);
  };

  // Trigger Doctor Delay Rescheduling
  const handleTriggerDelay = async (doctorId, mins) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/appointments/doctor-delay?doctor_id=${doctorId}&delay_minutes=${mins}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const newLogs = data.rescheduled_appointments.map(appt => ({
          time,
          agent: 'Rescheduling Agent',
          text: `Rescheduled ${appt.patient_name} by ${mins}m. SMS: "${appt.sms_sent}"`
        }));
        
        if (newLogs.length === 0) {
          setAgentLogs(prev => [
            { time, agent: 'Rescheduling Agent', text: `Dr. Patel delay logged. No upcoming slots affected.` },
            ...prev
          ]);
        } else {
          setAgentLogs(prev => [...newLogs, ...prev]);
        }

        // Add to critical alerts list
        const docName = doctorId === 1 ? 'Dr. Patel' : 'Dr. Yu';
        const newAlert = {
          id: Date.now(),
          type: 'delay',
          text: `${docName} delay logged (+${mins}m). Patients notified.`,
          urgency: 'high'
        };
        setAlerts(prev => [newAlert, ...prev]);

        alert(`Rescheduling Agent executed! Adjusted ${data.rescheduled_appointments.length} appointments.`);
      } else {
        alert("Failed to execute Rescheduling Agent.");
      }
    } catch (e) {
      alert("Error contacting Rescheduling Agent API.");
    }
  };

  // Apply AI Recommendation
  const handleApplyRecommendation = () => {
    setDoctorsOnDuty(19);
    setAvgWaitTime(10);
    setRecommendationApplied(true);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentLogs(prev => [
      { time, agent: 'Workforce Agent', text: 'Recommendation applied: Shift nurse Jessica Taylor re-allocated to active General Medicine check-in.' },
      ...prev
    ]);

    // Clear the critical capacity alert
    setAlerts(prev => prev.filter(a => a.type !== 'capacity'));
  };

  // Add workforce shift
  const handleAddShift = (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const newShift = {
      id: staffShifts.length + 1,
      name: newStaffName,
      role: newStaffRole,
      specialty: newStaffSpecialty,
      shift: newStaffShift,
      onCall: newStaffOnCall
    };

    setStaffShifts(prev => [...prev, newShift]);
    setNewStaffName('');
    setShowAddShiftModal(false);

    // Add log
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentLogs(prev => [
      { time, agent: 'Workforce Agent', text: `Allocated shift for ${newStaffName} (${newStaffSpecialty} ${newStaffRole}).` },
      ...prev
    ]);
  };

  // Submit walk-in check-in (simulated)
  const handleWalkInCheckIn = async (e) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    try {
      // Simulate booking first then checking in
      const time = new Date();
      const bodyData = {
        patient_id: 1, // simulated Patient John Doe or walk-in
        doctor_id: Number(walkInDoctor),
        department_id: walkInDept === 'General Medicine' ? 1 : walkInDept === 'Ophthalmology' ? 2 : walkInDept === 'Pediatrics' ? 3 : 4,
        start_time: time.toISOString(),
        end_time: new Date(time.getTime() + 20 * 60 * 1000).toISOString(),
        status: 'scheduled',
        chief_complaint: walkInComplaint
      };

      const res = await fetch('http://127.0.0.1:8000/api/v1/appointments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        const appt = await res.json();
        // Check in
        const checkInRes = await fetch(`http://127.0.0.1:8000/api/v1/queue/check-in?appointment_id=${appt.id}`, { method: 'POST' });
        if (checkInRes.ok) {
          alert(`Success! Checked in walk-in patient ${walkInName}. Queue token issued.`);
          setWalkInName('');
          setWalkInPhone('');
          setWalkInComplaint('');
          fetchAppointments();
        }
      } else {
        alert("Failed to submit check-in booking.");
      }
    } catch (e) {
      alert("Error contacting booking and queue servers.");
    }
  };

  // Nurse vital logging (simulated)
  const handleSaveVitals = (e) => {
    e.preventDefault();
    if (!selectedQueueId) {
      alert("Please select a waiting patient first.");
      return;
    }
    const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentLogs(prev => [
      { time: logTime, agent: 'Triage Agent', text: `Recorded Vitals for Queue Item #${selectedQueueId}: BP ${nurseBp}, Temp ${nurseTemp}°F, Pulse ${nursePulse} bpm, O2 ${nurseO2}%. Notes: ${nurseNotes || "None"}.` },
      ...prev
    ]);
    alert("Vitals saved and updated in patient check-in file.");
    setSelectedQueueId(null);
    setNurseNotes('');
  };

  // Toggle Doctor availability (Receptionist)
  const toggleDoctorDuty = (docId) => {
    setDoctorDutyList(prev => 
      prev.map(doc => doc.id === docId ? { ...doc, active: !doc.active } : doc)
    );
  };

  // Approve Reschedule (Receptionist)
  const handleApproveReschedule = (reqId) => {
    const req = rescheduleRequests.find(r => r.id === reqId);
    setRescheduleRequests(prev => prev.filter(r => r.id !== reqId));
    const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentLogs(prev => [
      { time: logTime, agent: 'Rescheduling Agent', text: `Approved reschedule for ${req.patient} to ${req.requestedTime}. Notification dispatched.` },
      ...prev
    ]);
    alert(`Successfully rescheduled ${req.patient} to ${req.requestedTime}.`);
  };

  const handleApproveLeave = (reqId) => {
    setLeaveRequests(prev => 
      prev.map(req => req.id === reqId ? { ...req, status: 'approved' } : req)
    );
    const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const req = leaveRequests.find(r => r.id === reqId);
    setAgentLogs(prev => [
      { time: logTime, agent: 'Workforce Agent', text: `Approved time-off request for ${req.name} (${req.date}).` },
      ...prev
    ]);
  };

  const handleDeclineLeave = (reqId) => {
    setLeaveRequests(prev => 
      prev.map(req => req.id === reqId ? { ...req, status: 'declined' } : req)
    );
    const logTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const req = leaveRequests.find(r => r.id === reqId);
    setAgentLogs(prev => [
      { time: logTime, agent: 'Workforce Agent', text: `Declined time-off request for ${req.name} (${req.date}).` },
      ...prev
    ]);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex text-brand-text transition-colors duration-250 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-brand-card border-r border-brand-border flex flex-col justify-between p-5 shrink-0 sticky top-0 h-screen z-10">
        <div className="space-y-5">
          <div className="flex items-center gap-2.5 px-2 cursor-pointer hover:opacity-85 transition-opacity" onClick={() => onNavigate('landing')}>
            <div className="p-2 bg-brand-accent/15 border border-brand-accent/25 rounded-xl">
              <Activity className="w-5 h-5 text-brand-accent animate-pulse" />
            </div>
            <span className="font-extrabold text-lg text-brand-text font-display">Neuralink <span className="text-brand-accent">Care</span></span>
          </div>

          {/* Role selector dropdown */}
          <div className="px-2 space-y-1">
            <span className="text-[9px] text-brand-muted font-bold uppercase tracking-widest block">Active Operations Role</span>
            <select
              value={userRole || 'admin'}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full px-2.5 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer"
            >
              <option value="admin">Operations Admin</option>
              <option value="doctor">Doctor Portal</option>
              <option value="nurse">Nurse Triage</option>
              <option value="receptionist">Receptionist Desk</option>
              {sessionType !== 'hospital' && <option value="patient">Patient Portal</option>}
            </select>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => onNavigate('landing')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold border border-transparent text-brand-muted hover:text-brand-text hover:bg-brand-hover cursor-pointer transition-all mb-1"
            >
              <Compass className="w-4.5 h-4.5" />
              Home Lobby
            </button>
            
            <button 
              onClick={() => setActiveTab('operations')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                activeTab === 'operations' 
                  ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent shadow-[0_2px_8px_rgba(2,132,199,0.05)]' 
                  : 'border-transparent text-brand-muted hover:text-brand-text hover:bg-brand-hover'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              {userRole === 'admin' && "Operations Dashboard"}
              {userRole === 'doctor' && "Clinician Dashboard"}
              {userRole === 'nurse' && "Triage Dashboard"}
              {userRole === 'receptionist' && "Admissions Desk"}
            </button>
            
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                activeTab === 'appointments' 
                  ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent shadow-[0_2px_8px_rgba(2,132,199,0.05)]' 
                  : 'border-transparent text-brand-muted hover:text-brand-text hover:bg-brand-hover'
              }`}
            >
              <Calendar className="w-4.5 h-4.5" />
              Appointments
            </button>

            <button 
              onClick={() => setActiveTab('scheduling')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                activeTab === 'scheduling' 
                  ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent shadow-[0_2px_8px_rgba(2,132,199,0.05)]' 
                  : 'border-transparent text-brand-muted hover:text-brand-text hover:bg-brand-hover'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              Staff Scheduling
            </button>

            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                activeTab === 'analytics' 
                  ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent shadow-[0_2px_8px_rgba(2,132,199,0.05)]' 
                  : 'border-transparent text-brand-muted hover:text-brand-text hover:bg-brand-hover'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" />
              Analytics & Reports
            </button>

            <button 
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                isAiPanelOpen
                  ? 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal' 
                  : 'border-transparent text-brand-muted hover:text-brand-text hover:bg-brand-hover'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4.5 h-4.5" />
                AI Assistant
              </div>
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-brand-bg/60 border border-brand-border rounded-2xl space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text">Active Mesh Engine</span>
            </div>
            <p className="text-[9px] text-brand-muted leading-relaxed font-semibold">Orchestrator sync active: 6 micro-agents listening...</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 border-t border-brand-border pt-4">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120&h=120" 
                alt="Sarah Johnson" 
                className="w-9 h-9 rounded-full object-cover border border-brand-border"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-teal border-2 border-brand-card" />
            </div>
            <div>
              <div className="font-bold text-xs text-brand-text">Dr. Sarah Jenkins</div>
              <div className="text-[9px] text-brand-muted font-bold uppercase tracking-wider">Clinician Administrator</div>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-97"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 border-b border-brand-border px-6 flex justify-between items-center sticky top-0 bg-brand-bg/85 backdrop-blur-md z-15">
          <div className="flex items-center gap-3">
            <h2 className="font-extrabold text-base text-brand-text font-display flex items-center gap-2">
              Operations Control Room
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-teal/15 text-brand-teal border border-brand-teal/10 animate-pulse">
                Live Engine
              </span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-brand-border/40 rounded-xl text-brand-muted hover:text-brand-text transition-colors cursor-pointer border border-brand-border"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-brand-muted" />}
            </button>

            <button 
              onClick={() => onNavigate('landing')}
              className="text-[10px] text-brand-muted font-bold uppercase tracking-widest border border-brand-border hover:bg-brand-border/30 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Exit Portal
            </button>
          </div>
        </header>

        {/* Tab Contents */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'operations' && (
            <>
              {/* ADMIN DASHBOARD PORTAL */}
              {userRole === 'admin' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* 8 AI-Powered KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-3.5">
                    {/* KPI 1 */}
                    <div className="glass-panel p-3.5 rounded-2xl flex flex-col justify-between border border-brand-border">
                      <span className="text-[8px] text-brand-muted font-extrabold uppercase tracking-widest">Avg Wait Time</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl font-black text-brand-text font-mono">{avgWaitTime}m</span>
                        <span className="text-[8px] text-brand-teal font-extrabold bg-brand-teal/10 px-1 py-0.5 rounded">-18%</span>
                      </div>
                      <span className="text-[8px] text-brand-muted mt-1">vs yesterday (18m)</span>
                    </div>

                    {/* KPI 2 */}
                    <div className="glass-panel p-3.5 rounded-2xl flex flex-col justify-between border border-brand-border">
                      <span className="text-[8px] text-brand-muted font-extrabold uppercase tracking-widest">Today's Visits</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl font-black text-brand-text font-mono">{metrics.todayAppts}</span>
                        <span className="text-[8px] text-brand-accent font-extrabold bg-brand-accent/10 px-1 py-0.5 rounded">+12%</span>
                      </div>
                      <span className="text-[8px] text-brand-muted mt-1">vs yesterday (220)</span>
                    </div>

                    {/* KPI 3 */}
                    <div className="glass-panel p-3.5 rounded-2xl flex flex-col justify-between border border-brand-border">
                      <span className="text-[8px] text-brand-muted font-extrabold uppercase tracking-widest">No-Shows Blocked</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl font-black text-brand-text font-mono">{metrics.noShowsPrevented}</span>
                        <span className="text-[8px] text-brand-teal font-extrabold bg-brand-teal/10 px-1 py-0.5 rounded">Saved</span>
                      </div>
                      <span className="text-[8px] text-brand-muted mt-1">via WhatsApp pre-check</span>
                    </div>

                    {/* KPI 4 */}
                    <div className="glass-panel p-3.5 rounded-2xl flex flex-col justify-between border border-brand-border">
                      <span className="text-[8px] text-brand-muted font-extrabold uppercase tracking-widest">Doctors On Duty</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl font-black text-brand-text font-mono">{doctorsOnDuty}</span>
                        <span className="text-[8px] text-brand-muted">/ 22</span>
                      </div>
                      <span className="text-[8px] text-brand-teal font-extrabold mt-1 uppercase">86% Active</span>
                    </div>

                    {/* KPI 5 */}
                    <div className="glass-panel p-3.5 rounded-2xl flex flex-col justify-between border border-brand-border">
                      <span className="text-[8px] text-brand-muted font-extrabold uppercase tracking-widest">Capacity load</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl font-black text-brand-text font-mono">{metrics.capacity}%</span>
                        <span className="text-[8px] text-brand-accent font-extrabold bg-brand-accent/10 px-1 py-0.5 rounded">Optimal</span>
                      </div>
                      <span className="text-[8px] text-brand-muted mt-1">Lobby intake margin</span>
                    </div>

                    {/* KPI 6 */}
                    <div className="glass-panel p-3.5 rounded-2xl flex flex-col justify-between border border-brand-border">
                      <span className="text-[8px] text-brand-muted font-extrabold uppercase tracking-widest">Predicted Peak</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-sm font-black text-brand-text">11 AM - 1 PM</span>
                      </div>
                      <span className="text-[8px] text-amber-500 font-extrabold mt-1">Surge Expected</span>
                    </div>

                    {/* KPI 7 */}
                    <div className="glass-panel p-3.5 rounded-2xl flex flex-col justify-between border border-brand-border">
                      <span className="text-[8px] text-brand-muted font-extrabold uppercase tracking-widest">Revenue Saved</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl font-black text-brand-text font-mono">₹18.4k</span>
                        <span className="text-[8px] text-brand-teal font-extrabold bg-brand-teal/10 px-1 py-0.5 rounded">Auto-fill</span>
                      </div>
                      <span className="text-[8px] text-brand-muted mt-1">Recovered no-shows</span>
                    </div>

                    {/* KPI 8 */}
                    <div className="glass-panel p-3.5 rounded-2xl flex flex-col justify-between border border-brand-border">
                      <span className="text-[8px] text-brand-muted font-extrabold uppercase tracking-widest">Critical Alerts</span>
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xl font-black text-red-500 font-mono">{alerts.length}</span>
                        <span className="text-[8px] text-red-500 font-extrabold bg-red-500/10 px-1 py-0.5 rounded">Action</span>
                      </div>
                      <span className="text-[8px] text-brand-muted mt-1">Needs attention</span>
                    </div>
                  </div>

                  {/* Predicted Peak Surge Card (Replaces HIPAA architecture card) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 bg-gradient-to-r from-brand-accent/10 to-brand-teal/10 border border-brand-accent/25 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[0_4px_20px_rgba(37,99,235,0.03)] animate-pulse-slow">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-brand-accent/15 text-brand-accent border border-brand-accent/20">
                          <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                          AI Workforce Prediction Engine
                        </span>
                        <h4 className="text-base font-extrabold text-brand-text font-display">AI Predicted Peak Surge Hours</h4>
                        <div className="grid grid-cols-3 gap-4 pt-1 pb-1">
                          <div>
                            <span className="text-[9px] text-brand-muted font-bold uppercase">Peak Surge Window</span>
                            <div className="text-sm font-black text-brand-text mt-0.5">11:00 AM – 01:00 PM</div>
                          </div>
                          <div>
                            <span className="text-[9px] text-brand-muted font-bold uppercase">Expected Patients</span>
                            <div className="text-sm font-black text-brand-accent mt-0.5">47 Patients Intake</div>
                          </div>
                          <div>
                            <span className="text-[9px] text-brand-muted font-bold uppercase">Suggested Action</span>
                            <div className="text-sm font-black text-brand-teal mt-0.5">Deploy 2 Float Nurses</div>
                          </div>
                        </div>
                        <p className="text-[10px] text-brand-muted leading-relaxed font-semibold">
                          General Medicine and Orthopedics are expecting a 35% load rise. Pre-allocating clinical staff reduces average wait time from 25m to under 10m.
                        </p>
                      </div>
                      <button 
                        onClick={handleApplyRecommendation}
                        disabled={recommendationApplied}
                        className={`px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md ${
                          recommendationApplied 
                            ? 'bg-brand-border text-brand-muted border border-brand-border cursor-not-allowed'
                            : 'bg-brand-accent text-white hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        {recommendationApplied ? 'Nurses Deployed' : 'Deploy Float Nurses'}
                      </button>
                    </div>

                    {/* Critical Alerts */}
                    <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 flex flex-col justify-between shadow-sm">
                      <div className="pb-2 border-b border-brand-border/60">
                        <h4 className="text-xs text-brand-muted font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                          Critical Operations Alerts
                        </h4>
                      </div>
                      <div className="space-y-2.5 mt-3 flex-1 overflow-y-auto max-h-[140px] pr-1">
                        {alerts.map(alert => (
                          <div key={alert.id} className="text-[11px] p-2 bg-brand-bg/60 border border-brand-border rounded-xl flex items-start gap-2">
                            <AlertCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${alert.urgency === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                            <span className="text-brand-text leading-tight font-semibold">{alert.text}</span>
                          </div>
                        ))}
                        {alerts.length === 0 && (
                          <div className="text-xs text-brand-muted text-center py-6 font-medium">All clinical parameters nominal. No alerts.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Donut Charts & Queue Load */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <PeakHoursChart />
                    <QueueOverviewChart queueCount={filteredQueueCount(queue)} />
                    
                    {/* Doctor Availability Panel */}
                    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex justify-between items-center pb-2.5 border-b border-brand-border/60">
                          <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Clinician Allocation Status</span>
                          <span className="text-[9px] font-extrabold text-brand-teal uppercase bg-brand-teal/10 px-2 py-0.5 rounded-full">Real-time</span>
                        </div>
                        <div className="space-y-3 mt-3 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-brand-muted font-semibold">General Medicine</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-text">6 / 8 available</span>
                              <span className="text-[10px] text-brand-teal font-bold bg-brand-teal/10 px-1.5 py-0.5 rounded">75%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-brand-muted font-semibold">Ophthalmology</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-text">2 / 2 available</span>
                              <span className="text-[10px] text-brand-teal font-bold bg-brand-teal/10 px-1.5 py-0.5 rounded">100%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-brand-muted font-semibold">Orthopedics</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-text">4 / 5 available</span>
                              <span className="text-[10px] text-brand-teal font-bold bg-brand-teal/10 px-1.5 py-0.5 rounded">80%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-brand-muted font-semibold">Cardiology</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-text">3 / 4 available</span>
                              <span className="text-[10px] text-brand-teal font-bold bg-brand-teal/10 px-1.5 py-0.5 rounded">75%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-brand-muted font-semibold">Dermatology</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-text">2 / 3 available</span>
                              <span className="text-[10px] text-brand-teal font-bold bg-brand-teal/10 px-1.5 py-0.5 rounded">66%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setActiveTab('scheduling')}
                        className="w-full text-center mt-4 text-[10px] text-brand-accent hover:underline font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Adjust Staff Rosters <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* AI Insights & Live Queue Board */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live queue board */}
                    <div className="lg:col-span-2">
                      <QueueBoard />
                    </div>

                    {/* AI Insights panel */}
                    <div className="space-y-6">
                      <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 flex flex-col justify-between shadow-sm min-h-[220px]">
                        <div>
                          <div className="flex justify-between items-center pb-2.5 border-b border-brand-border/60">
                            <h4 className="font-extrabold text-sm text-brand-text font-display flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-brand-teal animate-pulse" />
                              Neuralink Operations Insights
                            </h4>
                          </div>
                          <div className="mt-3.5 space-y-3.5 text-xs">
                            <div className="flex gap-2.5 items-start">
                              <div className="w-2.5 h-2.5 rounded-full bg-brand-teal shrink-0 mt-1" />
                              <p className="text-brand-text font-semibold">"Patient inflow expected between 11 AM and 1 PM in General Med."</p>
                            </div>
                            <div className="flex gap-2.5 items-start">
                              <div className="w-2.5 h-2.5 rounded-full bg-brand-accent shrink-0 mt-1" />
                              <p className="text-brand-text font-semibold">"Suggest adding one more nurse in Room 3 triage station."</p>
                            </div>
                            <div className="flex gap-2.5 items-start">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                              <p className="text-brand-text font-semibold">"Predicted wait time may exceed 25 minutes for Orthopedics clinics due to surgery overload."</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clinician Delay simulator */}
                      <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 space-y-3 shadow-sm">
                        <h3 className="font-bold text-brand-text flex items-center gap-2 text-sm font-display">
                          <AlertCircle className="w-4.5 h-4.5 text-brand-accent" />
                          Clinician Delay Simulator
                        </h3>
                        <p className="text-[10px] text-brand-muted leading-relaxed font-semibold">
                          Trigger an operational delay (e.g. emergency surgery) to invoke the Rescheduling Agent, optimize queues, and notify affected patients dynamically.
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button 
                            onClick={() => handleTriggerDelay(1, 30)}
                            className="py-2.5 bg-brand-accent text-white hover:scale-[1.02] active:scale-[0.98] text-[10px] font-extrabold rounded-xl transition-all cursor-pointer text-center shadow-sm"
                          >
                            Delay Dr. Patel (30m)
                          </button>
                          <button 
                            onClick={() => handleTriggerDelay(2, 45)}
                            className="py-2.5 bg-brand-teal text-white hover:scale-[1.02] active:scale-[0.98] text-[10px] font-extrabold rounded-xl transition-all cursor-pointer text-center shadow-sm"
                          >
                            Delay Dr. Yu (45m)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCTOR DASHBOARD PORTAL */}
              {userRole === 'doctor' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Doctor stats metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
                        <Users className="w-5 h-5 text-brand-accent" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Consultations Today</span>
                        <span className="text-xl font-black text-brand-text font-mono block mt-0.5">
                          {appointments.filter(a => a.status === 'completed').length + 3} / 12 Seen
                        </span>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-brand-teal/10 border border-brand-teal/20">
                        <Clock className="w-5 h-5 text-brand-teal" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Avg Treatment Time</span>
                        <span className="text-xl font-black text-brand-text font-mono block mt-0.5">22 mins</span>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Patients Waiting</span>
                        <span className="text-xl font-black text-brand-text font-mono block mt-0.5">
                          {appointments.filter(a => a.status === 'checked_in' || a.status === 'scheduled').length} Patients
                        </span>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Emergency Triage Alerts</span>
                        <span className="text-xl font-black text-red-500 font-mono block mt-0.5">1 Case Expected</span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor schedule & Queue board */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live Patient Queue for this doctor */}
                    <div className="lg:col-span-2 glass-panel rounded-2xl border border-brand-border p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-brand-border">
                        <div>
                          <h3 className="font-extrabold text-sm text-brand-text font-display">My Live Patient Queue</h3>
                          <p className="text-[10px] text-brand-muted">Active clinical workflow slots. Call or complete consultations.</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs text-brand-text">
                          <thead className="bg-brand-bg/50 text-brand-muted border-b border-brand-border text-[9px] uppercase font-bold tracking-wider">
                            <tr>
                              <th className="p-3">Patient Details</th>
                              <th className="p-3">Complaint</th>
                              <th className="p-3">Timing</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/30">
                            {appointments.slice(0, 5).map((appt) => (
                              <tr key={appt.id} className="hover:bg-brand-hover/40 transition-colors">
                                <td className="p-3 font-semibold">
                                  <div className="font-bold text-brand-text">{appt.patient?.first_name} {appt.patient?.last_name}</div>
                                  <div className="text-[9px] text-brand-muted">MRN: {appt.patient?.medical_record_number}</div>
                                </td>
                                <td className="p-3 text-brand-muted font-medium truncate max-w-xs">{appt.chief_complaint || 'Routine consultation'}</td>
                                <td className="p-3 font-semibold">{new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    appt.status === 'completed' ? 'bg-slate-200 text-slate-700' :
                                    appt.status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                    'bg-brand-accent/15 text-brand-accent border border-brand-accent/20'
                                  }`}>
                                    {appt.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  {appt.status === 'checked_in' && (
                                    <button 
                                      onClick={() => alert(`Starting exam consult with patient App ID: APP-${appt.id}`)}
                                      className="px-2.5 py-1.5 bg-brand-teal text-white hover:bg-brand-teal/80 text-[10px] font-bold rounded-xl cursor-pointer shadow-sm active:scale-95"
                                    >
                                      Begin Exam
                                    </button>
                                  )}
                                  {appt.status === 'scheduled' && (
                                    <span className="text-[10px] text-brand-muted font-bold uppercase">Awaiting Check-in</span>
                                  )}
                                  {appt.status === 'completed' && (
                                    <span className="text-[10px] text-brand-teal font-extrabold uppercase">Done</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Emergency Cases Panel */}
                    <div className="space-y-6">
                      <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 flex flex-col justify-between shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-2.5 border-b border-brand-border/60">
                          <h4 className="font-extrabold text-xs text-brand-text font-display flex items-center gap-1.5 uppercase">
                            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse animate-bounce" />
                            Active Emergency Cases
                          </h4>
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        </div>
                        <div className="space-y-3.5">
                          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-2xl text-xs space-y-1">
                            <div className="flex justify-between items-center font-black text-red-600">
                              <span>CARDIAC TRIAGE</span>
                              <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded font-bold animate-pulse">ROOM 4</span>
                            </div>
                            <p className="text-brand-text font-bold leading-tight">Patient: Tom Johnson</p>
                            <p className="text-[10px] text-brand-muted font-semibold">Symptoms: Severe chest discomfort and shortness of breath. Triage classification level: 1 (Urgent).</p>
                          </div>
                        </div>
                      </div>

                      {/* Doctor performance metrics */}
                      <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 space-y-3 shadow-sm text-xs">
                        <h4 className="font-extrabold text-sm text-brand-text font-display pb-2.5 border-b border-brand-border">My Performance Registry</h4>
                        <div className="flex justify-between font-semibold">
                          <span className="text-brand-muted">Clinical Quality Rating</span>
                          <span className="font-bold text-amber-500 flex items-center gap-0.5"><Star className="w-3.5 h-3.5 fill-current" />4.9 / 5.0</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-brand-muted">Avg Consult Duration</span>
                          <span className="font-bold text-brand-text">18.5 mins</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-brand-muted">Visits Completed (Month)</span>
                          <span className="font-bold text-brand-teal">142 consultations</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NURSE DASHBOARD PORTAL */}
              {userRole === 'nurse' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Nurse layout stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Users className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Lobby Checked In</span>
                        <span className="text-xl font-black text-brand-text font-mono block mt-0.5">8 Patients Waiting</span>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
                        <Clock className="w-5 h-5 text-brand-accent" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Triage Queue Max Wait</span>
                        <span className="text-xl font-black text-brand-text font-mono block mt-0.5">14 minutes</span>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-brand-teal/10 border border-brand-teal/20">
                        <UserCheck className="w-5 h-5 text-brand-teal" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Vitals Completed (Today)</span>
                        <span className="text-xl font-black text-brand-text font-mono block mt-0.5">18 Logged</span>
                      </div>
                    </div>
                  </div>

                  {/* Triage Queue & Vitals Logger */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Triage Lobby list */}
                    <div className="lg:col-span-2 glass-panel rounded-2xl border border-brand-border p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-brand-border">
                        <div>
                          <h3 className="font-extrabold text-sm text-brand-text font-display">Triage Lobby Intake Queue</h3>
                          <p className="text-[10px] text-brand-muted">Select patient to record vital parameters and assign clinical rooms.</p>
                        </div>
                        <span className="text-[9px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-red-500 font-extrabold uppercase animate-pulse">Triage Active</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs text-brand-text">
                          <thead className="bg-brand-bg/50 text-brand-muted border-b border-brand-border text-[9px] uppercase font-bold tracking-wider">
                            <tr>
                              <th className="p-3">Pos</th>
                              <th className="p-3">Patient Name / MRN</th>
                              <th className="p-3">Department</th>
                              <th className="p-3">Triage Priority</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border/30">
                            {appointments.slice(0, 4).map((appt, idx) => (
                              <tr 
                                key={appt.id} 
                                onClick={() => setSelectedQueueId(appt.id)}
                                className={`hover:bg-brand-hover/40 transition-colors cursor-pointer ${selectedQueueId === appt.id ? 'bg-brand-accent/5 border-l-2 border-brand-accent' : ''}`}
                              >
                                <td className="p-3 font-mono font-bold text-brand-accent">#{idx + 1}</td>
                                <td className="p-3">
                                  <div className="font-bold text-brand-text">{appt.patient?.first_name} {appt.patient?.last_name}</div>
                                  <div className="text-[9px] text-brand-muted font-mono">MRN: {appt.patient?.medical_record_number}</div>
                                </td>
                                <td className="p-3 font-semibold text-brand-text">{appt.doctor?.specialty || appt.chief_complaint || "General Medicine"}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                    idx === 0 ? 'bg-red-500/15 text-red-600 border border-red-500/20' :
                                    idx === 1 ? 'bg-amber-500/15 text-amber-600 border border-amber-500/20' :
                                    'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
                                  }`}>
                                    {idx === 0 ? 'High (Urgent)' : idx === 1 ? 'Medium' : 'Routine'}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedQueueId(appt.id); }}
                                    className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-accent hover:text-white border border-brand-border hover:border-brand-accent text-[9px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                                  >
                                    Log Vitals
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Vitals Form Logger */}
                    <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 flex flex-col justify-between shadow-sm text-xs space-y-4">
                      <div>
                        <div className="flex justify-between items-center pb-2.5 border-b border-brand-border">
                          <h4 className="font-extrabold text-sm text-brand-text font-display flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-brand-teal" />
                            Vital Signs Logger
                          </h4>
                        </div>
                        {selectedQueueId ? (
                          <form onSubmit={handleSaveVitals} className="space-y-3 pt-2">
                            <div className="text-[10px] text-brand-accent font-bold bg-brand-accent/10 p-2 border border-brand-accent/20 rounded-xl">
                              Logging vital stats for Patient App ID: APP-{selectedQueueId}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="font-bold text-brand-muted">BP (e.g. 120/80)</label>
                                <input 
                                  type="text" 
                                  required
                                  value={nurseBp}
                                  onChange={(e) => setNurseBp(e.target.value)}
                                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-brand-muted">Temp (°F)</label>
                                <input 
                                  type="text" 
                                  required
                                  value={nurseTemp}
                                  onChange={(e) => setNurseTemp(e.target.value)}
                                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="font-bold text-brand-muted">Pulse (bpm)</label>
                                <input 
                                  type="text" 
                                  required
                                  value={nursePulse}
                                  onChange={(e) => setNursePulse(e.target.value)}
                                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-brand-muted">O2 Sat (%)</label>
                                <input 
                                  type="text" 
                                  required
                                  value={nurseO2}
                                  onChange={(e) => setNurseO2(e.target.value)}
                                  className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-brand-muted">Nurse Observations</label>
                              <textarea 
                                value={nurseNotes}
                                onChange={(e) => setNurseNotes(e.target.value)}
                                placeholder="Enter patient triage notes..."
                                rows={2}
                                className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text text-xs resize-none"
                              />
                            </div>

                            <button 
                              type="submit"
                              className="w-full py-2.5 bg-brand-teal text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center text-xs shadow-md"
                            >
                              Log Vitals & Recalculate Triage
                            </button>
                          </form>
                        ) : (
                          <div className="text-center py-12 text-brand-muted font-medium">
                            Please select a patient in the triage queue table on the left to activate vital sign logging form.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Workload allocation & AI recommendations */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-brand-border/60 shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-brand-border">
                        <span className="text-xs text-brand-text font-extrabold font-display">Triage Nurse Workforce Distribution</span>
                        <span className="text-[9px] text-brand-teal font-extrabold bg-brand-teal/10 px-2.5 py-0.5 rounded-full">Active Allocations</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                        <div className="p-3 bg-brand-bg/50 border border-brand-border rounded-xl">
                          <span className="text-brand-muted block text-[10px]">General Med</span>
                          <span className="text-base font-black text-brand-text block mt-1">4 Nurses</span>
                        </div>
                        <div className="p-3 bg-brand-bg/50 border border-brand-border rounded-xl">
                          <span className="text-brand-muted block text-[10px]">Ophthalmology</span>
                          <span className="text-base font-black text-brand-text block mt-1">2 Nurses</span>
                        </div>
                        <div className="p-3 bg-brand-bg/50 border border-brand-border rounded-xl">
                          <span className="text-brand-muted block text-[10px]">Emergency Triage</span>
                          <span className="text-base font-black text-red-500 block mt-1">5 Nurses</span>
                        </div>
                        <div className="p-3 bg-brand-bg/50 border border-brand-border rounded-xl">
                          <span className="text-brand-muted block text-[10px]">Orthopedics</span>
                          <span className="text-base font-black text-brand-text block mt-1">3 Nurses</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-brand-accent/10 to-brand-teal/10 border border-brand-accent/25 rounded-2xl flex flex-col justify-between gap-4 shadow-sm">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-accent/15 text-brand-accent border border-brand-accent/20">
                          <Sparkles className="w-3 h-3 text-brand-accent" />
                          AI Workforce Suggestion
                        </span>
                        <h4 className="text-xs font-bold text-brand-text">Triage Nurse Surge reallocation</h4>
                        <p className="text-[11px] text-brand-muted leading-relaxed font-semibold">
                          General Medicine lobby queue is increasing due to surgeon delays. Recommend deploying 2 float nurses to speed check-in vitals.
                        </p>
                      </div>
                      <button 
                        onClick={handleApplyRecommendation}
                        disabled={recommendationApplied}
                        className={`py-2 px-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer text-center shadow-md ${
                          recommendationApplied 
                            ? 'bg-brand-border text-brand-muted cursor-not-allowed'
                            : 'bg-brand-accent text-white hover:scale-[1.02]'
                        }`}
                      >
                        {recommendationApplied ? 'Nurses Reallocated' : 'Reallocate Float Nurses'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* RECEPTIONIST DASHBOARD PORTAL */}
              {userRole === 'receptionist' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Reception stats grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
                        <Users className="w-5 h-5 text-brand-accent" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Walk-In Patient Registrations</span>
                        <span className="text-xl font-black text-brand-text font-mono block mt-0.5">6 Checked In today</span>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-brand-teal/10 border border-brand-teal/20">
                        <Calendar className="w-5 h-5 text-brand-teal" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Active Bookings Registry</span>
                        <span className="text-xl font-black text-brand-text font-mono block mt-0.5">{appointments.length} scheduled</span>
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border border-brand-border flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-brand-muted block">Reschedule Queries pending</span>
                        <span className="text-xl font-black text-brand-text font-mono block mt-0.5">{rescheduleRequests.length} pending approval</span>
                      </div>
                    </div>
                  </div>

                  {/* Walk-in Check-in form & Reschedule panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Walk-in Admissions Form */}
                    <div className="glass-panel p-5 rounded-2xl border border-brand-border shadow-sm text-xs space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-brand-border">
                        <h4 className="font-extrabold text-sm text-brand-text font-display flex items-center gap-1.5">
                          <UserPlus className="w-4 h-4 text-brand-accent" />
                          Walk-In Intake Admissions
                        </h4>
                      </div>
                      
                      <form onSubmit={handleWalkInCheckIn} className="space-y-3 pt-1">
                        <div className="space-y-1">
                          <label className="font-bold text-brand-muted">Patient Full Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Robert Smith"
                            value={walkInName}
                            onChange={(e) => setWalkInName(e.target.value)}
                            className="w-full px-3.5 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-brand-muted">Contact Phone Number</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="e.g. +1 555-0399"
                            value={walkInPhone}
                            onChange={(e) => setWalkInPhone(e.target.value)}
                            className="w-full px-3.5 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-bold text-brand-muted">Department</label>
                            <select 
                              value={walkInDept}
                              onChange={(e) => setWalkInDept(e.target.value)}
                              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none text-brand-text cursor-pointer font-bold"
                            >
                              <option value="General Medicine">General Med</option>
                              <option value="Ophthalmology">Ophthalmology</option>
                              <option value="Pediatrics">Pediatrics</option>
                              <option value="Orthopedics">Orthopedics</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-brand-muted">Doctor</label>
                            <select 
                              value={walkInDoctor}
                              onChange={(e) => setWalkInDoctor(e.target.value)}
                              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none text-brand-text cursor-pointer font-bold"
                            >
                              <option value={1}>Dr. Patel (Gen)</option>
                              <option value={2}>Dr. Yu (Ophth)</option>
                              <option value={3}>Dr. Jenkins (Peds)</option>
                              <option value={4}>Dr. Evans (Ortho)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-brand-muted">Chief Complaint / Notes</label>
                          <textarea 
                            value={walkInComplaint}
                            onChange={(e) => setWalkInComplaint(e.target.value)}
                            placeholder="Routine cold checkup, joint pain..."
                            rows={2}
                            className="w-full px-3.5 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none text-brand-text resize-none font-semibold"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-3 bg-brand-accent text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center text-xs shadow-md"
                        >
                          Check-In Patient Walk-In
                        </button>
                      </form>
                    </div>

                    {/* Rescheduling requests list */}
                    <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-brand-border">
                        <span className="text-xs text-brand-text font-extrabold font-display uppercase">Reschedule Requests Queue</span>
                        <span className="text-[9px] bg-brand-teal/15 text-brand-teal border border-brand-teal/20 px-2.5 py-0.5 rounded font-extrabold">EHR Sync</span>
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {rescheduleRequests.map((req) => (
                          <div key={req.id} className="p-4 bg-brand-bg/50 border border-brand-border rounded-2xl flex justify-between items-center gap-4 text-xs font-semibold">
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-brand-text text-sm">{req.patient}</h4>
                              <p className="text-brand-muted text-[10px]">MRN: {req.mrn} | Department: {req.specialty} | {req.doctor}</p>
                              <p className="text-[11px] text-brand-text font-bold">
                                Current Slot: <span className="text-red-500 font-mono font-black">{req.time}</span> → Requested Slot: <span className="text-brand-teal font-mono font-black">{req.requestedTime}</span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleApproveReschedule(req.id)}
                                className="px-3.5 py-2 bg-brand-teal hover:bg-brand-teal/80 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 text-[10px]"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => {
                                  setRescheduleRequests(prev => prev.filter(r => r.id !== req.id));
                                  alert(`Reschedule request for ${req.patient} declined.`);
                                }}
                                className="px-3.5 py-2 bg-brand-bg hover:bg-brand-hover border border-brand-border text-brand-muted font-bold rounded-xl transition-all cursor-pointer active:scale-95 text-[10px]"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                        {rescheduleRequests.length === 0 && (
                          <div className="text-center py-12 text-brand-muted font-semibold">No pending rescheduling requests.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Doctor duty status registry */}
                  <div className="glass-panel p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2.5 border-b border-brand-border">
                      <span className="text-xs text-brand-text font-extrabold font-display">Medical Practitioner Duty Status Registry</span>
                      <span className="text-[10px] text-brand-muted font-bold">Active shifts today</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      {doctorDutyList.map(doc => (
                        <div key={doc.id} className="p-3 bg-brand-bg/50 border border-brand-border rounded-2xl flex flex-col justify-between h-[120px] text-xs">
                          <div>
                            <h4 className="font-bold text-brand-text truncate">{doc.name}</h4>
                            <span className="text-[9px] text-brand-muted font-bold uppercase tracking-wider">{doc.specialty}</span>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-brand-border/40 mt-2">
                            <span className={`text-[10px] font-bold ${doc.active ? 'text-brand-teal' : 'text-red-500'}`}>
                              {doc.active ? 'On Duty' : 'Off Duty'}
                            </span>
                            
                            <button
                              onClick={() => toggleDoctorDuty(doc.id)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-all flex cursor-pointer ${doc.active ? 'bg-brand-teal justify-end' : 'bg-brand-muted/40 justify-start'}`}
                            >
                              <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'appointments' && (
            <div className="glass-panel rounded-2xl border border-brand-border overflow-hidden shadow-lg">
              <div className="p-5 bg-brand-card flex justify-between items-center border-b border-brand-border">
                <h3 className="font-bold text-brand-text text-sm font-display">All Recorded Appointments</h3>
                <button 
                  onClick={fetchAppointments}
                  className="p-2 hover:bg-brand-border/40 rounded-xl text-brand-muted hover:text-brand-text transition-colors cursor-pointer border border-brand-border"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {loadingAppts ? (
                <div className="p-12 text-center text-brand-muted text-xs font-semibold">Loading scheduling registry...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-brand-text">
                    <thead className="bg-brand-bg/50 text-brand-muted border-b border-brand-border text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-4 pl-5">Appt ID</th>
                        <th className="p-4">Patient Name / MRN</th>
                        <th className="p-4">Doctor Specialty</th>
                        <th className="p-4">Chief Complaint</th>
                        <th className="p-4">Scheduled Date / Time</th>
                        <th className="p-4">No-Show Risk (AI)</th>
                        <th className="p-4 pr-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/30">
                      {appointments.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-10 text-center text-brand-muted text-xs">No appointments found in database.</td>
                        </tr>
                      ) : (
                        appointments.map((appt) => (
                          <tr key={appt.id} className="hover:bg-brand-hover/40 transition-colors">
                            <td className="p-4 pl-5 font-mono font-bold text-brand-accent">APP-{appt.id}</td>
                            <td className="p-4">
                              <div className="font-bold text-brand-text">{appt.patient?.first_name} {appt.patient?.last_name}</div>
                              <div className="text-[10px] text-brand-muted mt-0.5">MRN: {appt.patient?.medical_record_number}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-brand-text">Dr. {appt.doctor?.first_name} {appt.doctor?.last_name}</div>
                              <div className="text-[10px] text-brand-muted mt-0.5">{appt.doctor?.specialty}</div>
                            </td>
                            <td className="p-4 text-brand-muted font-semibold max-w-xs truncate">{appt.chief_complaint || 'General Checkup'}</td>
                            <td className="p-4 font-semibold">
                              {new Date(appt.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <div className="w-16 h-2 bg-brand-border rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      appt.ai_no_show_probability > 0.6 ? 'bg-red-500' :
                                      appt.ai_no_show_probability > 0.3 ? 'bg-amber-500' : 'bg-brand-teal'
                                    }`}
                                    style={{ width: `${appt.ai_no_show_probability * 100}%` }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] font-bold">{(appt.ai_no_show_probability * 100).toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="p-4 pr-5 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                appt.status === 'completed' ? 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' :
                                appt.status === 'checked_in' ? 'bg-brand-teal/15 text-brand-teal border border-brand-teal/20' :
                                appt.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                'bg-brand-accent/15 text-brand-accent border border-brand-accent/20'
                              }`}>
                                {appt.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-brand-text font-display">Staff Shifts & Rotations</h3>
                  <p className="text-xs text-brand-muted">Configure active shifts, float reallocations, and on-call clinicians.</p>
                </div>
                <button 
                  onClick={() => setShowAddShiftModal(true)}
                  className="px-4 py-2.5 bg-brand-accent text-white hover:scale-[1.02] active:scale-[0.98] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Assign Shift
                </button>
              </div>

              {/* Main Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left side: Shifts List & Leave requests */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Shifts grid */}
                  <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4">
                    <h4 className="font-bold text-sm text-brand-text font-display pb-2.5 border-b border-brand-border flex justify-between items-center">
                      <span>Active Staffing Shift Board</span>
                      <span className="text-[10px] text-brand-teal uppercase bg-brand-teal/10 px-2 py-0.5 rounded-full font-mono font-bold">Roster Sync Active</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {staffShifts.map((staff) => (
                        <div key={staff.id} className="p-4 bg-brand-bg/50 border border-brand-border hover:border-brand-accent/20 rounded-2xl flex justify-between items-start transition-all">
                          <div className="space-y-1.5">
                            <span className={`inline-block px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded ${
                              staff.role === 'Doctor' ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' : 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20'
                            }`}>
                              {staff.role}
                            </span>
                            <h4 className="font-bold text-xs text-brand-text">{staff.name}</h4>
                            <div className="text-[9px] text-brand-muted font-bold uppercase tracking-wider">{staff.specialty} Specialty</div>
                            <div className="flex items-center gap-1.5 text-xs text-brand-text pt-1 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-brand-muted" />
                              {staff.shift}
                            </div>
                          </div>
                          {staff.onCall && (
                            <span className="px-2 py-0.5 bg-purple-500/15 text-purple-500 border border-purple-500/20 text-[8px] font-extrabold uppercase tracking-wider rounded animate-pulse">
                              On Call
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leave Requests & Time-Off Approvals */}
                  <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4">
                    <h4 className="font-bold text-sm text-brand-text font-display pb-2.5 border-b border-brand-border">
                      Leave Requests & Availability Exemptions
                    </h4>
                    <div className="space-y-3">
                      {leaveRequests.map((req) => (
                        <div key={req.id} className="p-4 bg-brand-bg/40 border border-brand-border rounded-xl flex justify-between items-center gap-4 text-xs font-semibold">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-brand-text text-sm">{req.name}</span>
                              <span className="text-[9px] text-brand-muted">({req.role} - {req.dept})</span>
                            </div>
                            <div className="text-brand-muted text-[10px]">
                              Requested Date: <b className="text-brand-text">{req.date}</b> | Type: <span className="text-amber-500 font-bold">{req.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApproveLeave(req.id)}
                                  className="px-3.5 py-1.5 bg-brand-teal hover:bg-brand-teal/80 text-white font-bold rounded-xl transition-all cursor-pointer text-[10px]"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDeclineLeave(req.id)}
                                  className="px-3.5 py-1.5 bg-brand-bg hover:bg-brand-hover border border-brand-border text-brand-muted font-bold rounded-xl transition-all cursor-pointer text-[10px]"
                                >
                                  Decline
                                </button>
                              </>
                            ) : (
                              <span className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                                req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}>
                                {req.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side: Workload Distribution & AI shift suggestions */}
                <div className="space-y-6">
                  {/* Workload distribution chart */}
                  <WorkloadDistributionChart />

                  {/* AI Shift Recommendations */}
                  <div className="p-5 bg-gradient-to-r from-brand-accent/10 to-brand-teal/10 border border-brand-accent/25 rounded-2xl flex flex-col justify-between gap-4 shadow-sm">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-brand-accent/15 text-brand-accent border border-brand-accent/20">
                        <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
                        AI Shift Suggestion Engine
                      </span>
                      <h4 className="text-sm font-extrabold text-brand-text font-display">Workforce Resource Optimization</h4>
                      <p className="text-xs text-brand-muted leading-relaxed font-semibold">
                        Based on predicted peak surge between 11:00 AM - 01:00 PM today, Orthopedics and General Medicine will face high congestion. 
                        Recommend adding 2 float nurses to speed check-in vitals.
                      </p>
                      
                      <div className="pt-2 text-xs space-y-2 font-semibold">
                        <div className="flex justify-between items-center text-brand-text bg-brand-bg/50 p-2.5 border border-brand-border/60 rounded-xl">
                          <span>SLA Wait Reduction</span>
                          <span className="text-brand-teal font-extrabold font-mono">-15 mins expected</span>
                        </div>
                        <div className="flex justify-between items-center text-brand-text bg-brand-bg/50 p-2.5 border border-brand-border/60 rounded-xl">
                          <span>Staff Fatigue Intercept</span>
                          <span className="text-brand-accent font-extrabold font-mono">92% Saved Rating</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleApplyRecommendation}
                      disabled={recommendationApplied}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center shadow-md ${
                        recommendationApplied 
                          ? 'bg-brand-border text-brand-muted cursor-not-allowed border border-brand-border'
                          : 'bg-brand-accent text-white hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {recommendationApplied ? 'Roster Suggestions Applied' : 'Auto-Allocate Roster Recommendations'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Assign Shift Modal */}
          {showAddShiftModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
              <div className="bg-brand-card border border-brand-border p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-brand-border">
                  <h4 className="font-extrabold text-sm text-brand-text font-display flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-brand-accent" />
                    Assign Workforce Shift
                  </h4>
                  <button onClick={() => setShowAddShiftModal(false)} className="text-brand-muted hover:text-brand-text text-sm">✕</button>
                </div>

                <form onSubmit={handleAddShift} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-brand-muted">Staff Name</label>
                    <input
                      type="text"
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="e.g. Jessica Taylor, RN"
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-muted">Role</label>
                      <select
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value)}
                        className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text cursor-pointer"
                      >
                        <option value="Doctor">Doctor</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Staff">Support Staff</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-brand-muted">Department</label>
                      <select
                        value={newStaffSpecialty}
                        onChange={(e) => setNewStaffSpecialty(e.target.value)}
                        className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text cursor-pointer"
                      >
                        <option value="General Medicine">General Med</option>
                        <option value="Ophthalmology">Ophthalmology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-brand-muted">Shift Rotation hours</label>
                    <input
                      type="text"
                      required
                      value={newStaffShift}
                      onChange={(e) => setNewStaffShift(e.target.value)}
                      placeholder="e.g. 08:00 AM - 04:00 PM"
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-1.5">
                    <input
                      type="checkbox"
                      id="onCall"
                      checked={newStaffOnCall}
                      onChange={(e) => setNewStaffOnCall(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent cursor-pointer"
                    />
                    <label htmlFor="onCall" className="font-bold text-brand-text cursor-pointer">Designate as On-Call</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-accent text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
                  >
                    Confirm Allocation
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-brand-text font-display">System Operations Performance</h3>
                <p className="text-xs text-brand-muted">Review efficiency, AI schedule optimization, and patient check-in analytics.</p>
              </div>

              {/* Graphical operational analytics charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PatientFlowTrendChart />
                <NoShowHeatmap />
                <DepartmentEfficiencyChart />
                
                {/* Detailed Capacity Dial & Operational summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CapacityUtilization rate={metrics.capacity} />
                  
                  {/* Summary performance stats */}
                  <div className="glass-panel p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Operational Summary</span>
                      <h4 className="font-bold text-brand-text mt-1 text-xs">Neuralink Optimizer Active</h4>
                      <p className="text-[11px] text-brand-muted leading-relaxed font-semibold mt-2">
                        Your hospital operations are currently running within SLA targets. AI scheduler auto-filling of canceled slots has recovered <b>₹18,450</b> in revenue leaks today, while WhatsApp pre-checks prevented <b>12</b> no-shows.
                      </p>
                    </div>
                    <div className="border-t border-brand-border/60 pt-3.5 flex justify-between items-center text-[10px] text-brand-teal font-extrabold uppercase font-mono tracking-wider">
                      <span>Engine Efficiency Score</span>
                      <span>98.6% Nominal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Floating AI Panel Drawer */}
      {isAiPanelOpen && (
        <div className="w-96 border-l border-brand-border h-screen bg-brand-card shadow-2xl sticky top-0 shrink-0 z-30 animate-in slide-in-from-right duration-250 flex flex-col">
          <AgentChat onClose={() => setIsAiPanelOpen(false)} />
        </div>
      )}

    </div>
  );
}

// Utility to filter total patients currently active in queue
function filteredQueueCount(queue) {
  if (!queue || !Array.isArray(queue)) return 0;
  return queue.filter(q => q.completed_time === null).length;
}
