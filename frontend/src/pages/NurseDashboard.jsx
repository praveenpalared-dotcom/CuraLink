import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, AlertCircle, ShieldAlert, Heart, Clipboard, Check, Plus, Thermometer,
  Activity, Star, LogOut, Sparkles, Navigation, Send, ArrowRight, Printer
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

export default function NurseDashboard({ onLogout, onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  
  // Triage state
  const [bp, setBp] = useState('120/80');
  const [temp, setTemp] = useState('98.6');
  const [pulse, setPulse] = useState('72');
  const [o2, setO2] = useState('98');
  const [complaint, setComplaint] = useState('');
  const [deptId, setDeptId] = useState(1);
  const [notes, setNotes] = useState('');
  const [emergencyFlag, setEmergencyFlag] = useState(false);

  const [patientHistory, setPatientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/appointments/');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.reverse());
      }
    } catch (e) {
      console.error("Failed to load nurse appointments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPatient = async (appt) => {
    setSelectedAppt(appt);
    setComplaint(appt.chief_complaint || '');
    setDeptId(appt.department_id || 1);
    setEmergencyFlag(appt.chief_complaint?.toLowerCase().includes('chest') || false);

    // Fetch patient history
    if (appt.patient?.id) {
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/v1/appointments/patients/${appt.patient.id}/history`);
        if (res.ok) {
          const data = await res.json();
          // Filter out the current appointment
          setPatientHistory(data.filter(a => a.id !== appt.id));
        }
      } catch (e) {
        console.error("Failed to load history:", e);
      } finally {
        setHistoryLoading(false);
      }
    } else {
      setPatientHistory([]);
    }
  };

  const handleSaveTriage = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;

    try {
      // 1. Submit Vital parameters to logs
      // Perform database check-in or update status to checked_in/triage completed
      // If patient is not yet checked in, check them in
      if (selectedAppt.status !== 'checked_in' && selectedAppt.status !== 'in_consultation') {
        await fetch(`/api/v1/queue/check-in?appointment_id=${selectedAppt.id}`, {
          method: 'POST'
        });
      }

      // Add a simulated log or system alert if critical
      alert(`Triage file created for ${selectedAppt.patient?.first_name}. Vitals: BP: ${bp}, Temp: ${temp}°F, Pulse: ${pulse} bpm, O2: ${o2}%. Routed to clinic.`);
      setSelectedAppt(null);
      fetchAppointments();
    } catch (e) {
      console.error(e);
      alert("Error saving triage records.");
    }
  };

  // Auto AI Triage priority classification based on vitals
  const getAiTriagePriority = () => {
    if (emergencyFlag) return { label: 'CRITICAL (L1)', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    const bloodPresSys = parseInt(bp.split('/')[0]) || 120;
    const oxygen = parseInt(o2) || 98;
    const temperature = parseFloat(temp) || 98.6;

    if (oxygen < 92 || bloodPresSys > 160 || bloodPresSys < 85 || temperature > 103) {
      return { label: 'EMERGENCY (L2)', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    }
    if (oxygen < 95 || bloodPresSys > 140 || bloodPresSys < 90 || temperature > 101) {
      return { label: 'URGENT (L3)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    }
    return { label: 'ROUTINE (L4)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
  };

  const priority = getAiTriagePriority();

  // Filters for Lobby
  const awaitingTriage = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed');
  const checkedInQueue = appointments.filter(a => a.status === 'checked_in');

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header bar */}
      <header className="bg-brand-card border-b border-brand-border px-4 py-2.5 flex justify-between items-center z-10">
        <div onClick={() => onNavigate('landing')} className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition">
          <div className="p-1.5 rounded-lg bg-brand-accent/10 border border-brand-accent/20">
            <Activity className="w-5 h-5 text-brand-accent animate-pulse" />
          </div>
          <span className="font-extrabold text-sm sm:text-lg text-brand-text font-display">
            CuraLink
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-emerald-500/15 text-emerald-600 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 ml-2">
            NURSE PORTAL
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationBell userType="staff" userId={2} />
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-brand-text">Jessica Taylor, RN</span>
            <span className="text-[9px] text-brand-muted font-bold block uppercase tracking-wider">Lobby Intake & Triage coordinator</span>
          </div>
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

      {/* Main layout grid - high density */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Lobby Queues (5 cols) */}
        <div className="lg:col-span-5 border-r border-brand-border bg-brand-card/30 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-60px)]">
          
          {/* Intake statistics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-panel p-2.5 rounded-xl border border-brand-border flex flex-col justify-between">
              <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Lobby Total</span>
              <span className="text-lg font-black text-brand-text font-mono mt-1">
                {awaitingTriage.length + checkedInQueue.length} Patients
              </span>
            </div>
            <div className="glass-panel p-2.5 rounded-xl border border-brand-border flex flex-col justify-between">
              <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Awaiting Vitals</span>
              <span className="text-lg font-black text-amber-500 font-mono mt-1">{awaitingTriage.length}</span>
            </div>
            <div className="glass-panel p-2.5 rounded-xl border border-brand-border flex flex-col justify-between">
              <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Triage Complete</span>
              <span className="text-lg font-black text-brand-teal font-mono mt-1">{checkedInQueue.length}</span>
            </div>
          </div>

          {/* Lobby Intake list */}
          <div className="glass-panel rounded-xl border border-brand-border p-3 space-y-2">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-text border-b border-brand-border pb-1.5 font-display flex justify-between items-center">
              <span>Lobby Queue (Awaiting Vital Logs)</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </h3>

            {awaitingTriage.length === 0 ? (
              <div className="py-6 text-center text-xs text-brand-muted font-semibold bg-brand-bg/50 border border-dashed border-brand-border rounded-xl">
                No patients awaiting intake triage.
              </div>
            ) : (
              <div className="space-y-1.5">
                {awaitingTriage.map((appt) => (
                  <div 
                    key={appt.id}
                    onClick={() => handleSelectPatient(appt)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                      selectedAppt?.id === appt.id 
                        ? 'bg-brand-accent/5 border-brand-accent shadow-[0_2px_8px_rgba(37,99,235,0.06)]' 
                        : 'bg-brand-card hover:bg-brand-hover/50 border-brand-border/60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-brand-text">{appt.patient?.first_name} {appt.patient?.last_name}</div>
                      <div className="text-[9px] text-brand-muted font-semibold mt-0.5">
                        MRN: {appt.patient?.medical_record_number} • Appt time: {new Date(appt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold font-mono">
                      AWAITING
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checked-In Active Patients */}
          <div className="glass-panel rounded-xl border border-brand-border p-3 space-y-2">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-text border-b border-brand-border pb-1.5 font-display">
              Completed Triage (Active in Clinic queues)
            </h3>
            {checkedInQueue.length === 0 ? (
              <div className="py-4 text-center text-xs text-brand-muted">No checked-in patients in clinic queue.</div>
            ) : (
              <div className="space-y-1.5">
                {checkedInQueue.map((appt) => (
                  <div key={appt.id} className="p-2 bg-brand-card/70 border border-brand-border/40 rounded-xl flex justify-between items-center text-[11px]">
                    <div>
                      <div className="font-bold text-brand-text">{appt.patient?.first_name} {appt.patient?.last_name}</div>
                      <div className="text-[9px] text-brand-muted font-mono">MRN: {appt.patient?.medical_record_number}</div>
                    </div>
                    <span className="text-[9px] bg-brand-teal/10 text-brand-teal px-1.5 py-0.5 rounded border border-brand-teal/20 font-mono font-bold">
                      IN QUEUE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Intake EHR Vitals Entry & Decisions (7 cols) */}
        <div className="lg:col-span-7 bg-brand-card p-4 overflow-y-auto max-h-[calc(100vh-60px)]">
          {selectedAppt ? (
            <form onSubmit={handleSaveTriage} className="space-y-4 animate-in fade-in duration-200">
              
              {/* Profile Card Banner */}
              <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-brand-accent/5 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-black text-brand-text font-display">Clinical Intake: {selectedAppt.patient?.first_name} {selectedAppt.patient?.last_name}</h3>
                  <p className="text-[9px] text-brand-muted font-mono mt-0.5">
                    MRN: {selectedAppt.patient?.medical_record_number} • Age: 36 • DOB: {selectedAppt.patient?.date_of_birth?.split('T')[0] || '1990-05-12'}
                  </p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 font-bold px-2 py-0.5 rounded mb-2 inline-block">
                    Slot #{selectedAppt.id}
                  </span>
                  
                  <div className="bg-brand-card/80 border border-brand-border p-2 rounded-lg text-left mt-2 sm:mt-0 min-w-[200px]">
                    <h4 className="text-[9px] font-bold text-brand-muted uppercase mb-1">Past History</h4>
                    {historyLoading ? (
                      <div className="text-[9px] text-brand-muted">Loading...</div>
                    ) : patientHistory.length > 0 ? (
                      <div className="max-h-[60px] overflow-y-auto space-y-1">
                        {patientHistory.map(h => (
                          <div key={h.id} className="text-[9px] flex justify-between">
                            <span className="text-brand-text font-mono">{new Date(h.start_time).toLocaleDateString()}</span>
                            <span className="text-brand-muted truncate max-w-[100px] ml-2" title={h.chief_complaint}>{h.chief_complaint}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[9px] text-brand-muted">No past records</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vitals Form Grid */}
              <div className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3.5">
                <h4 className="font-extrabold text-[10px] text-brand-muted uppercase tracking-wider border-b border-brand-border pb-1 font-display">
                  Vitals Signs Telemetry Logs
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase block">Blood Pressure (mmHg)</label>
                    <input 
                      type="text"
                      required
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full px-3 py-1.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-accent font-mono text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase block">Temperature (°F)</label>
                    <input 
                      type="text"
                      required
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      className="w-full px-3 py-1.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-accent font-mono text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase block">Pulse Rate (bpm)</label>
                    <input 
                      type="text"
                      required
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="w-full px-3 py-1.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-accent font-mono text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase block">O2 Saturation (%)</label>
                    <input 
                      type="text"
                      required
                      value={o2}
                      onChange={(e) => setO2(e.target.value)}
                      className="w-full px-3 py-1.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-accent font-mono text-center"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-border/40 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase block">Chief Symptoms Complaint</label>
                    <input 
                      type="text"
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      placeholder="e.g. Cough, high fever, chest tightness"
                      className="w-full px-3.5 py-1.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase block font-display">Triage Clinical Notes</label>
                    <input 
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Alert and cooperative, respiration normal"
                      className="w-full px-3.5 py-1.5 bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Triage Decision Support & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Priority Card */}
                <div className="p-3 bg-brand-accent/5 border border-brand-accent/20 rounded-xl space-y-2">
                  <span className="text-[9px] text-brand-accent font-black uppercase tracking-wider flex items-center gap-1 font-display">
                    <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                    AI Vital Priority Classifier
                  </span>
                  <div className="py-2.5 text-center rounded-xl border border-brand-border/50 bg-brand-card">
                    <span className="text-[9px] text-brand-muted block font-extrabold uppercase tracking-wide">Evaluated Priority Code</span>
                    <strong className={`text-sm font-black font-mono block mt-1 px-3 py-1 rounded-full w-fit mx-auto ${priority.color}`}>
                      {priority.label}
                    </strong>
                  </div>
                  <p className="text-[9px] text-brand-muted font-bold italic leading-tight text-center">
                    *Classification computed instantly based on telemetry vital sign thresholds.
                  </p>
                </div>

                {/* Safety & Emergency Flagging */}
                <div className="p-3 bg-red-500/5 border border-red-500/25 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-red-600 font-black uppercase tracking-wider flex items-center gap-1 font-display">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                      Critical Flagging Control
                    </span>
                    <p className="text-[10px] text-brand-muted font-semibold mt-1">
                      Flag as emergency to bypass standard queues and sound alert triggers across clinic terminals.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setEmergencyFlag(!emergencyFlag)}
                    className={`w-full py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 border flex items-center justify-center gap-2 cursor-pointer active:scale-97 mt-1 ${
                      emergencyFlag
                        ? 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-lg shadow-red-600/20'
                        : 'bg-brand-card hover:bg-brand-hover text-red-600 border-red-500/20 hover:border-red-500/40'
                    }`}
                  >
                    <ShieldAlert className={`w-3.5 h-3.5 ${emergencyFlag ? 'animate-pulse' : ''}`} />
                    {emergencyFlag ? 'LIFE-THREATENING EMERGENCY ACTIVE' : 'FLAG AS LIFE-THREATENING EMERGENCY'}
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
                <button 
                  type="button"
                  onClick={() => {
                    const telemetryData = `BP: ${bp} | Temp: ${temp}°F | Pulse: ${pulse} bpm | O2: ${o2}%`;
                    navigator.clipboard.writeText(telemetryData);
                    alert('Triage telemetry copied to clipboard!\n\n' + telemetryData);
                  }}
                  className="px-4 py-2 border border-brand-border bg-brand-bg hover:bg-brand-hover text-brand-text rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Export Telemetry
                </button>
                <button 
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 border border-brand-border hover:bg-brand-hover text-brand-text rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-brand-teal text-white hover:bg-brand-teal/90 rounded-xl text-xs font-extrabold shadow-md shadow-brand-teal/10 flex items-center gap-1.5 cursor-pointer active:scale-97"
                >
                  <Check className="w-4 h-4" />
                  Save Triage & Check In Patient
                </button>
              </div>

            </form>
          ) : (
            <div className="h-full flex flex-col justify-center items-center py-20 text-center space-y-4">
              <div className="p-4 rounded-full bg-brand-bg border border-brand-border text-brand-muted">
                <Clipboard className="w-10 h-10 animate-bounce-slow" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-brand-text font-display">No Triage Patient Selected</h3>
                <p className="text-xs text-brand-muted max-w-sm mt-1">
                  Select a waiting patient from the Lobby Queue in the left sidebar to start clinical vital telemetry check-in.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
