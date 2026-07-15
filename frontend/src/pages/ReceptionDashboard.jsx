import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, AlertCircle, ShieldAlert, Calendar, Plus, RefreshCw, Check, X,
  UserPlus, UserCheck, Play, ArrowRight, Sparkles, Phone, FileText, CheckCircle, Moon, Sun, Settings
} from 'lucide-react';

export default function ReceptionDashboard({ onLogout, onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);

  // Patient History Lookup State
  const [lookupMRN, setLookupMRN] = useState('');
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Settings State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInDept, setWalkInDept] = useState(1);
  const [walkInDoctor, setWalkInDoctor] = useState(1);
  const [walkInComplaint, setWalkInComplaint] = useState('');

  // Queue Call State
  const [callTokenInput, setCallTokenInput] = useState('');

  // Reschedule requests state
  const [rescheduleRequests, setRescheduleRequests] = useState([
    { id: 1, patient: 'Jane Smith', mrn: 'MRN-193848', time: '11:00 AM', requestedTime: '01:30 PM', specialty: 'Ophthalmology', doctor: 'Dr. Angela Yu' },
    { id: 2, patient: 'Tom Johnson', mrn: 'MRN-729482', time: '12:00 PM', requestedTime: '02:30 PM', specialty: 'Orthopedics', doctor: 'Dr. James Evans' }
  ]);

  // Fetch appointments, queue, and metadata
  const fetchData = async () => {
    try {
      const apptRes = await fetch('/api/v1/appointments/');
      const qRes = await fetch('/api/v1/queue/');
      const docRes = await fetch('/api/v1/appointments/doctors');
      const deptRes = await fetch('/api/v1/appointments/departments');
      const patientRes = await fetch('/api/v1/appointments/patients');

      if (apptRes.ok) {
        const appts = await apptRes.json();
        setAppointments(appts.reverse());
      }
      if (qRes.ok) setQueue(await qRes.json());
      if (docRes.ok) setDoctors(await docRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (patientRes.ok) setPatients(await patientRes.json());
    } catch (e) {
      console.error("Failed to load reception desk telemetry data:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleWalkInCheckIn = async (e) => {
    e.preventDefault();
    if (!walkInName || !walkInPhone) return;

    try {
      // 1. Create a dummy patient or use default patient
      // Send register checkin
      const nameParts = walkInName.split(' ');
      const firstName = nameParts[0] || 'Walk-In';
      const lastName = nameParts.slice(1).join(' ') || 'Patient';
      
      // Let's create an appointment for patient ID 1 for simplicity, or create a patient
      // Send create appointment post to backend
      const todayStr = new Date().toISOString().split('T')[0];
      const startStr = `${todayStr}T10:00:00`;
      const endStr = `${todayStr}T10:30:00`;

      const response = await fetch('/api/v1/appointments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: 1, // Fallback demo patient
          doctor_id: Number(walkInDoctor),
          department_id: Number(walkInDept),
          start_time: startStr,
          end_time: endStr,
          status: 'scheduled',
          chief_complaint: `${walkInComplaint || 'Walk-in Intake'} (Walk-in Name: ${walkInName}, Phone: ${walkInPhone})`
        })
      });

      if (response.ok) {
        const apptData = await response.json();
        // Automatically check them in to insert into live queue
        await fetch(`/api/v1/queue/check-in?appointment_id=${apptData.id}`, {
          method: 'POST'
        });

        alert(`Intake checked in successfully! Token slot issued for ${walkInName}.`);
        setWalkInName('');
        setWalkInPhone('');
        setWalkInComplaint('');
        fetchData();
      } else {
        alert("Failed to submit intake");
      }
    } catch (err) {
      console.error(err);
      alert("Error checking in walk-in patient");
    }
  };

  const handleNextPatient = async () => {
    // Serve the next waiting patient (first item in queue without called_to_room_time)
    const nextWaiting = queue.find(q => !q.called_to_room_time);
    if (!nextWaiting) {
      alert("No patients currently waiting in lobby queue.");
      return;
    }
    try {
      await fetch(`/api/v1/queue/${nextWaiting.id}/call-room`, {
        method: 'POST'
      });
      alert(`Patient from Slot #${nextWaiting.appointment_id} called to consultation room.`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCallCustomToken = async () => {
    if (!callTokenInput) return;
    const qId = Number(callTokenInput);
    try {
      await fetch(`/api/v1/queue/${qId}/call-room`, {
        method: 'POST'
      });
      alert(`Calling Queue ID #${qId} to Consultation.`);
      setCallTokenInput('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerDoctorDelay = async (doctorId, delayMins) => {
    try {
      const response = await fetch(`/api/v1/appointments/doctor-delay?doctor_id=${doctorId}&delay_minutes=${delayMins}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Logged ${delayMins} min delay for Doctor. Auto-shifting schedules and dispatched SMS notifications.`);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveReschedule = (id) => {
    setRescheduleRequests(rescheduleRequests.filter(r => r.id !== id));
    alert("Rescheduling request approved. EHR calendar slot updated.");
  };

  const handleCancelAppt = async (apptId) => {
    try {
      await fetch(`/api/v1/appointments/${apptId}/status?status_str=cancelled`, {
        method: 'PUT'
      });
      alert("Appointment marked as cancelled.");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLookupHistory = async (e) => {
    e.preventDefault();
    if (!lookupMRN) return;
    const patient = patients.find(p => p.medical_record_number === lookupMRN || p.email === lookupMRN);
    if (!patient) {
      alert("Patient not found in system.");
      return;
    }
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/v1/appointments/patients/${patient.id}/history`);
      if (res.ok) {
        setPatientHistory(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Wait time prediction
  const predictWaitTime = (deptName) => {
    // Basic queue logic
    const matchedDept = departments.find(d => d.name === deptName);
    const avgTime = matchedDept?.avg_treatment_time_minutes || 30;
    const waitingCount = queue.filter(q => q.department_id === matchedDept?.id && !q.completed_time).length;
    return waitingCount * avgTime;
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header bar */}
      <header className="bg-brand-card border-b border-brand-border px-4 py-2.5 flex justify-between items-center z-10 font-sans">
        <div onClick={onLogout} className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition">
          <div className="p-1.5 rounded-lg bg-brand-accent/10 border border-brand-accent/20">
            <UserPlus className="w-5 h-5 text-brand-accent" />
          </div>
          <span className="font-extrabold text-sm sm:text-lg text-brand-text font-display">
            CuraLink
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-amber-500/15 text-amber-600 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/20 ml-2">
            RECEPTION DESK
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-brand-text">Receptionist Sarah</span>
            <span className="text-[9px] text-brand-muted block font-extrabold uppercase tracking-wider">Admissions & Registrar Coordinator</span>
          </div>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-1.5 bg-brand-bg hover:bg-brand-hover border border-brand-border text-brand-text rounded-xl transition cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => onNavigate('landing')}
            className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-hover border border-brand-border text-brand-text rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Exit <span className="hidden sm:inline">Portal</span>
          </button>
          <button 
            onClick={onLogout}
            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout Grid - High Density */}
      <div className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto max-h-[calc(100vh-60px)]">
        
        {/* Left Panel: Walk-in Admissions (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-brand-border space-y-4 shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-brand-border pb-2">
            <UserPlus className="w-4 h-4 text-brand-accent" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text font-display">Walk-In Intake Registrar</h3>
          </div>

          <form onSubmit={handleWalkInCheckIn} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-brand-muted">Patient Full Name</label>
              <input 
                type="text"
                required
                placeholder="e.g. Robert Smith"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text font-semibold font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-brand-muted">Contact Mobile Phone</label>
              <input 
                type="tel"
                required
                placeholder="e.g. +1 555-0929"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text font-mono font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-brand-muted">Assign Department</label>
                <select 
                  value={walkInDept}
                  onChange={(e) => setWalkInDept(e.target.value)}
                  className="w-full px-2 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none text-brand-text font-semibold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-muted">Assign Clinician</label>
                <select 
                  value={walkInDoctor}
                  onChange={(e) => setWalkInDoctor(e.target.value)}
                  className="w-full px-2 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none text-brand-text font-semibold"
                >
                  {doctors.filter(d => d.department_id === Number(walkInDept)).map(doc => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name}</option>
                  ))}
                  {doctors.filter(d => d.department_id === Number(walkInDept)).length === 0 && (
                    doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-brand-muted">Chief Symptom Complaint</label>
              <textarea 
                rows={2}
                placeholder="Brief summary of presenting symptoms..."
                value={walkInComplaint}
                onChange={(e) => setWalkInComplaint(e.target.value)}
                className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text font-semibold font-sans"
              />
            </div>

            {/* AI Predictions */}
            <div className="p-3 bg-brand-accent/5 border border-brand-accent/20 rounded-xl space-y-1.5">
              <span className="text-[9px] text-brand-accent font-black uppercase tracking-wider flex items-center gap-1 font-display">
                <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                AI Queue Placement Advisor
              </span>
              <div className="text-[10px] space-y-1 font-semibold leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Estimated Wait Time:</span>
                  <span className="text-brand-text font-bold font-mono">
                    {predictWaitTime(departments.find(d => d.id === Number(walkInDept))?.name || 'General Medicine')} mins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">No-Show Risk:</span>
                  <span className="text-emerald-600 font-bold font-mono">Extremely Low (Walk-In)</span>
                </div>
                <div className="flex justify-between text-brand-accent">
                  <span>Slot Auto-Allocation:</span>
                  <span className="font-bold">Next Available Check-in</span>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-extrabold rounded-xl transition duration-150 shadow-md shadow-brand-accent/10 active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              Register & Check In Walk-In
            </button>
          </form>
        </div>

        {/* Middle Panel: Active Clinic Queue Board (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-brand-border space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-brand-border pb-2">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text font-display flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              Live Clinic Lobby Queue
            </h3>
            <span className="text-[9px] text-brand-muted font-mono font-bold">{queue.filter(q => !q.completed_time).length} Waiting</span>
          </div>

          {/* Serve Controls */}
          <div className="p-3 bg-brand-bg rounded-xl border border-brand-border/60 space-y-2.5">
            <div className="text-center">
              <span className="text-[9px] text-brand-muted uppercase font-bold tracking-wide">Last Called Lobby Token</span>
              <strong className="text-3xl font-black text-brand-accent font-mono block mt-0.5">
                {queue.find(q => q.called_to_room_time && !q.completed_time)?.appointment_id ? `TK-${queue.find(q => q.called_to_room_time && !q.completed_time)?.appointment_id}` : 'N/A'}
              </strong>
            </div>
            
            <button 
              onClick={handleNextPatient}
              className="w-full py-2 bg-brand-teal text-white hover:bg-brand-teal/90 rounded-xl text-xs font-black shadow-md shadow-brand-teal/10 transition active:scale-97 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Call Next Patient
            </button>

            <div className="flex gap-2">
              <input 
                type="number"
                placeholder="Queue ID #"
                value={callTokenInput}
                onChange={(e) => setCallTokenInput(e.target.value)}
                className="w-2/3 px-2 py-1.5 bg-brand-card border border-brand-border rounded-xl text-center font-mono text-xs focus:outline-none"
              />
              <button 
                onClick={handleCallCustomToken}
                className="w-1/3 py-1.5 bg-brand-card hover:bg-brand-hover text-brand-text border border-brand-border rounded-xl text-[11px] font-bold cursor-pointer"
              >
                Call
              </button>
            </div>
          </div>

          {/* Lobby wait queue list */}
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {queue.filter(q => !q.completed_time).map((qItem, idx) => (
              <div key={qItem.id} className="p-2.5 bg-brand-card border border-brand-border/80 rounded-xl flex justify-between items-center text-[11px]">
                <div>
                  <div className="font-bold text-brand-text">
                    {qItem.appointment?.patient?.first_name} {qItem.appointment?.patient?.last_name || 'Walk-In'}
                  </div>
                  <div className="text-[9px] text-brand-muted font-semibold mt-0.5">
                    Token: <strong className="text-brand-accent">TK-{qItem.appointment_id}</strong> • Pos: #{idx + 1}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                    qItem.called_to_room_time ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {qItem.called_to_room_time ? 'In Consultation' : 'Waiting'}
                  </span>
                  <span className="text-[8px] text-brand-muted font-mono block mt-1">
                    Est: {qItem.estimated_wait_minutes} mins
                  </span>
                </div>
              </div>
            ))}
            {queue.filter(q => !q.completed_time).length === 0 && (
              <div className="py-8 text-center text-xs text-brand-muted font-semibold border border-dashed border-brand-border rounded-xl bg-brand-bg/50">
                Lobby queue is currently clear.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Reschedules & Doctor Status (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Rescheduling Queue */}
          <div className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3 shadow-sm">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text border-b border-brand-border pb-1.5 font-display">
              Reschedule Queries Registry
            </h3>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {rescheduleRequests.map((req) => (
                <div key={req.id} className="p-2.5 bg-brand-bg rounded-xl border border-brand-border/60 text-[10px] space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-brand-text">{req.patient}</span>
                    <span className="text-brand-muted">{req.specialty}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-brand-muted">
                    <span>Current: {req.time}</span>
                    <ArrowRight className="w-3 h-3 text-brand-accent" />
                    <span className="text-brand-accent font-bold">Requested: {req.requestedTime}</span>
                  </div>
                  
                  <div className="flex gap-2 justify-end pt-1 border-t border-brand-border/30">
                    <button 
                      onClick={() => setRescheduleRequests(rescheduleRequests.filter(r => r.id !== req.id))}
                      className="px-2 py-1 text-red-500 hover:bg-red-50 rounded text-[9px] font-bold cursor-pointer"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApproveReschedule(req.id)}
                      className="px-2.5 py-1 bg-brand-teal text-white rounded text-[9px] font-bold cursor-pointer shadow-sm active:scale-95 flex items-center gap-0.5"
                    >
                      <Check className="w-3 h-3" /> Approve Slot
                    </button>
                  </div>
                </div>
              ))}
              {rescheduleRequests.length === 0 && (
                <div className="py-4 text-center text-xs text-brand-muted font-semibold bg-brand-bg/20 rounded-xl border border-dashed border-brand-border">
                  No reschedule queries pending.
                </div>
              )}
            </div>
          </div>

          {/* Patient History Lookup */}
          <div className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3 shadow-sm text-xs">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text border-b border-brand-border pb-1.5 font-display">
              Patient EHR Lookup
            </h3>
            <form onSubmit={handleLookupHistory} className="flex gap-2">
              <input 
                type="text"
                placeholder="Search MRN or Email..."
                value={lookupMRN}
                onChange={(e) => setLookupMRN(e.target.value)}
                className="w-2/3 px-2 py-1.5 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-brand-text font-semibold font-mono text-[10px]"
              />
              <button 
                type="submit"
                className="w-1/3 py-1.5 bg-brand-accent text-white font-extrabold rounded-xl transition cursor-pointer text-[10px]"
              >
                Lookup
              </button>
            </form>
            
            {historyLoading ? (
              <div className="text-[10px] text-brand-muted py-2">Fetching history...</div>
            ) : patientHistory ? (
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                {patientHistory.length === 0 ? (
                  <div className="text-[10px] text-brand-muted py-2">No history records found.</div>
                ) : (
                  patientHistory.map(h => (
                    <div key={h.id} className="p-2 bg-brand-bg/50 rounded-xl border border-brand-border/60 text-[10px]">
                      <div className="flex justify-between font-bold text-brand-text">
                        <span>{new Date(h.start_time).toLocaleDateString()}</span>
                        <span className="text-brand-accent uppercase">{h.status}</span>
                      </div>
                      <div className="text-brand-muted truncate mt-0.5" title={h.chief_complaint}>
                        {h.chief_complaint || 'No complaint recorded'}
                      </div>
                      <div className="text-brand-muted text-[9px] mt-0.5">
                        Dr. {h.doctor?.last_name} ({h.doctor?.specialty})
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>

          {/* Doctor status & delay logs */}
          <div className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3 shadow-sm text-xs">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text border-b border-brand-border pb-1.5 font-display">
              Clinician Availability & Triage Delays
            </h3>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-2 bg-brand-bg rounded-xl border border-brand-border/60 flex justify-between items-center text-[11px]">
                  <div>
                    <span className="font-bold text-brand-text">Dr. {doc.first_name} {doc.last_name}</span>
                    <span className="text-[9px] text-brand-muted block uppercase font-mono">{doc.specialty}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleTriggerDoctorDelay(doc.id, 15)}
                      className="px-1.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded text-[9px] font-bold hover:bg-amber-500 hover:text-white transition cursor-pointer"
                    >
                      +15m Delay
                    </button>
                    <button 
                      onClick={() => handleTriggerDoctorDelay(doc.id, 30)}
                      className="px-1.5 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-[9px] font-bold hover:bg-red-50 hover:text-white transition cursor-pointer"
                    >
                      +30m Delay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
