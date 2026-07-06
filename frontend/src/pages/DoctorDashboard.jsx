import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, AlertCircle, ShieldAlert, Star, LogOut, ChevronRight, 
  Search, FileText, Pill, Clipboard, Sparkles, BookOpen, Calendar, 
  CheckCircle, Plus, Check
} from 'lucide-react';

export default function DoctorDashboard({ onLogout, onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [notes, setNotes] = useState('');
  
  // Prescription State
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, drug: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Three times daily', duration: '7 days' },
    { id: 2, drug: 'Lisinopril 10mg', dosage: '1 tablet', frequency: 'Once daily (morning)', duration: '30 days' }
  ]);
  const [newDrug, setNewDrug] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFreq, setNewFreq] = useState('');
  const [newDuration, setNewDuration] = useState('');

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/appointments/');
      if (res.ok) {
        const data = await res.json();
        // Sort appointments by date
        setAppointments(data.reverse());
      }
    } catch (e) {
      console.error("Failed to load doctor appointments:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPatient = (appt) => {
    setSelectedAppt(appt);
    setNotes(appt.chief_complaint ? `Patient presenting with: ${appt.chief_complaint}. \nClinical Exam findings:\n- Lungs: Clear bilaterally\n- CVS: S1 S2 heard, no murmurs\n- Plan: Support care.` : '');
  };

  const handleCompleteConsult = async () => {
    if (!selectedAppt) return;
    try {
      // Find the queue item for this appointment to mark it complete
      const queueRes = await fetch('http://127.0.0.1:8000/api/v1/queue/');
      if (queueRes.ok) {
        const queueData = await queueRes.json();
        const activeQueueItem = queueData.find(q => q.appointment_id === selectedAppt.id);
        if (activeQueueItem) {
          await fetch(`http://127.0.0.1:8000/api/v1/queue/${activeQueueItem.id}/complete`, {
            method: 'POST'
          });
        }
      }
      
      // Update appointment status to completed
      await fetch(`http://127.0.0.1:8000/api/v1/appointments/${selectedAppt.id}/status?status_str=completed`, {
        method: 'PUT'
      });
      
      alert("Consultation finalized. EHR updated and prescriptions uploaded to cloud registry.");
      setSelectedAppt(null);
      fetchAppointments();
    } catch (e) {
      console.error(e);
      alert("Error finalizing consultation");
    }
  };

  const handleAddPrescription = (e) => {
    e.preventDefault();
    if (!newDrug || !newDosage) return;
    const newRx = {
      id: prescriptions.length + 1,
      drug: newDrug,
      dosage: newDosage,
      frequency: newFreq || 'Once daily',
      duration: newDuration || '7 days'
    };
    setPrescriptions([...prescriptions, newRx]);
    setNewDrug('');
    setNewDosage('');
    setNewFreq('');
    setNewDuration('');
  };

  // Filter lists for Doctor Richard Patel
  // Let's filter general medicine or cardiology appointments depending on database
  const activeQueue = appointments.filter(a => a.status === 'checked_in' || a.status === 'in_consultation');
  const upcomingSchedule = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed');
  const completedToday = appointments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header bar */}
      <header className="bg-brand-card border-b border-brand-border px-4 py-2.5 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-accent/10 border border-brand-accent/20">
            <Users className="w-5 h-5 text-brand-accent" />
          </div>
          <span className="font-extrabold text-sm sm:text-lg text-brand-text font-display">
            CuraLink
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-brand-teal/15 text-brand-teal font-extrabold px-2 py-0.5 rounded-full border border-brand-teal/20 ml-2">
            CLINICIAN PORTAL
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-brand-text">Dr. Richard Patel</span>
            <span className="text-[9px] text-brand-muted font-bold block uppercase tracking-wider">Department of General Medicine</span>
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
        {/* Left column: schedule lists (5 cols) */}
        <div className="lg:col-span-5 border-r border-brand-border bg-brand-card/30 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-60px)]">
          {/* Metrics summary widgets */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-panel p-2.5 rounded-xl border border-brand-border flex flex-col justify-between">
              <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Today Seen</span>
              <span className="text-lg font-black text-brand-text font-mono mt-1">{completedToday.length} / 12</span>
            </div>
            <div className="glass-panel p-2.5 rounded-xl border border-brand-border flex flex-col justify-between">
              <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Waiting Lobby</span>
              <span className="text-lg font-black text-amber-500 font-mono mt-1">{activeQueue.length}</span>
            </div>
            <div className="glass-panel p-2.5 rounded-xl border border-brand-border flex flex-col justify-between">
              <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Avg Duration</span>
              <span className="text-lg font-black text-brand-teal font-mono mt-1">18.5m</span>
            </div>
          </div>

          {/* Active Consultation Queue */}
          <div className="glass-panel rounded-xl border border-brand-border p-3 space-y-2">
            <div className="flex justify-between items-center border-b border-brand-border pb-1.5">
              <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-text flex items-center gap-1.5 font-display">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                Active Consultation Queue
              </h3>
              <span className="text-[9px] text-brand-muted font-mono">{activeQueue.length} Checked-In</span>
            </div>

            {loading && appointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-brand-muted">Retrieving patient queue...</div>
            ) : activeQueue.length === 0 ? (
              <div className="py-6 text-center text-[11px] text-brand-muted font-semibold bg-brand-bg/50 border border-dashed border-brand-border rounded-xl">
                No active patients waiting in lobby.
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeQueue.map((appt) => (
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
                        MRN: {appt.patient?.medical_record_number} • Complaint: <span className="text-brand-text font-bold">{appt.chief_complaint || 'General Checkup'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {appt.status}
                      </span>
                      <span className="text-[8px] text-brand-muted font-mono block mt-1">
                        Checked-in: {new Date(appt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Scheduled Appointments */}
          <div className="glass-panel rounded-xl border border-brand-border p-3 space-y-2">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-brand-text border-b border-brand-border pb-1.5 font-display">
              Today's Upcoming Schedule
            </h3>
            {upcomingSchedule.length === 0 ? (
              <div className="py-4 text-center text-xs text-brand-muted font-semibold">No further appointments scheduled for today.</div>
            ) : (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {upcomingSchedule.map((appt) => (
                  <div 
                    key={appt.id}
                    onClick={() => handleSelectPatient(appt)}
                    className={`p-2 rounded-xl border border-brand-border/40 hover:bg-brand-hover/50 cursor-pointer flex justify-between items-center text-[11px] ${
                      selectedAppt?.id === appt.id ? 'bg-brand-accent/5 border-brand-accent/60' : 'bg-brand-card/60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-brand-text">{appt.patient?.first_name} {appt.patient?.last_name}</div>
                      <div className="text-[9px] text-brand-muted">MRN: {appt.patient?.medical_record_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-accent font-mono">{new Date(appt.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                      <span className="text-[9px] bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded font-mono">
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Emergency Cases Alerts */}
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
            <div className="flex justify-between items-center border-b border-red-500/20 pb-1">
              <h4 className="font-black text-[10px] text-red-600 flex items-center gap-1.5 uppercase font-display">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                Active Emergency Cases
              </h4>
              <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded font-black">1 EXPECTED</span>
            </div>
            <div className="p-2 bg-brand-card/90 rounded-lg text-[10px] space-y-1 border border-red-500/25">
              <div className="flex justify-between font-bold text-red-600">
                <span>CARDIAC DISCOMFORT</span>
                <span className="bg-red-100 px-1 py-0.2 rounded font-black">ETA 4 mins</span>
              </div>
              <p className="text-brand-text font-bold">Patient: Tom Johnson (MRN-729482)</p>
              <p className="text-brand-muted">Log details: Shortness of breath, chest constriction. Ambulance dispatched.</p>
            </div>
          </div>
        </div>

        {/* Right column: Active Consultation Chart & EHR drawer (7 cols) */}
        <div className="lg:col-span-7 bg-brand-card p-4 overflow-y-auto max-h-[calc(100vh-60px)] space-y-4">
          {selectedAppt ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* EHR Banner */}
              <div className="p-3.5 bg-gradient-to-r from-brand-accent/10 to-brand-teal/5 border border-brand-accent/20 rounded-2xl flex justify-between items-start">
                <div>
                  <h2 className="text-base font-black text-brand-text font-display">Active Consultation: {selectedAppt.patient?.first_name} {selectedAppt.patient?.last_name}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-brand-muted font-bold mt-1">
                    <span>MRN: <strong className="text-brand-text font-mono font-black">{selectedAppt.patient?.medical_record_number}</strong></span>
                    <span>DOB: <strong className="text-brand-text font-mono font-semibold">{selectedAppt.patient?.date_of_birth?.split('T')[0] || '1990-05-12'}</strong></span>
                    <span>Gender: <strong className="text-brand-text font-semibold">{selectedAppt.patient?.gender || 'Male'}</strong></span>
                    <span>Phone: <strong className="text-brand-text font-mono font-semibold">{selectedAppt.patient?.phone_number}</strong></span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-brand-accent/20 text-brand-accent border border-brand-accent/30 font-black px-2.5 py-1 rounded-full uppercase">
                    Slot #{selectedAppt.id}
                  </span>
                </div>
              </div>

              {/* Consultation detail sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Clinical Notes & Vitals */}
                <div className="space-y-3">
                  {/* Vitals logs card */}
                  <div className="glass-panel p-3 rounded-xl border border-brand-border space-y-2">
                    <h3 className="font-extrabold text-[10px] text-brand-muted uppercase tracking-wider border-b border-brand-border pb-1 font-display">
                      Patient Vital Sign Logs (Logged by Triage)
                    </h3>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="p-1.5 bg-brand-bg rounded-lg">
                        <span className="text-[8px] text-brand-muted font-bold block uppercase">Blood Pres.</span>
                        <strong className="text-xs text-brand-text font-mono block mt-0.5">120/80</strong>
                        <span className="text-[8px] text-emerald-600 font-extrabold block">Normal</span>
                      </div>
                      <div className="p-1.5 bg-brand-bg rounded-lg">
                        <span className="text-[8px] text-brand-muted font-bold block uppercase">Heart Rate</span>
                        <strong className="text-xs text-brand-text font-mono block mt-0.5">74 bpm</strong>
                        <span className="text-[8px] text-emerald-600 font-extrabold block">Normal</span>
                      </div>
                      <div className="p-1.5 bg-brand-bg rounded-lg">
                        <span className="text-[8px] text-brand-muted font-bold block uppercase">Temp</span>
                        <strong className="text-xs text-brand-text font-mono block mt-0.5">98.6°F</strong>
                        <span className="text-[8px] text-emerald-600 font-extrabold block">Healthy</span>
                      </div>
                      <div className="p-1.5 bg-brand-bg rounded-lg">
                        <span className="text-[8px] text-brand-muted font-bold block uppercase">O2 Sat</span>
                        <strong className="text-xs text-brand-text font-mono block mt-0.5">99%</strong>
                        <span className="text-[8px] text-emerald-600 font-extrabold block">Optimal</span>
                      </div>
                    </div>
                  </div>

                  {/* EHR History File */}
                  <div className="glass-panel p-3 rounded-xl border border-brand-border space-y-1.5">
                    <h3 className="font-extrabold text-[10px] text-brand-muted uppercase tracking-wider border-b border-brand-border pb-1 font-display">
                      EHR Patient History File
                    </h3>
                    <div className="text-[10px] space-y-1 font-semibold leading-relaxed">
                      <div className="flex justify-between border-b border-brand-border/30 pb-0.5">
                        <span className="text-brand-muted">Allergies:</span>
                        <span className="text-red-500 font-bold">Penicillin (Severe)</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-border/30 pb-0.5">
                        <span className="text-brand-muted">Chronic Illnesses:</span>
                        <span className="text-brand-text">Hypertension (Diagnosed 2023)</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-border/30 pb-0.5">
                        <span className="text-brand-muted">Recent Surgery:</span>
                        <span className="text-brand-text">None</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-muted">Blood Group:</span>
                        <span className="text-brand-text">O positive</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Editor */}
                  <div className="glass-panel p-3 rounded-xl border border-brand-border space-y-1.5">
                    <label className="font-extrabold text-[10px] text-brand-muted uppercase tracking-wider block font-display">
                      Consultation Examination Notes
                    </label>
                    <textarea 
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter clinical examination notes, plan, diagnostics ordered..."
                      className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-xs font-medium leading-relaxed font-mono"
                    />
                  </div>
                </div>

                {/* AI clinical suggestions, prescriptions and report explanations */}
                <div className="space-y-3">
                  {/* AI Diagnostics & Alerts Panel */}
                  <div className="p-3 bg-brand-accent/5 border border-brand-accent/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-center border-b border-brand-accent/25 pb-1">
                      <span className="text-[9px] text-brand-accent font-black uppercase tracking-wider flex items-center gap-1 font-display">
                        <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                        AI Clinical Decision Support
                      </span>
                      <span className="text-[8px] bg-brand-accent/20 text-brand-accent px-1.5 py-0.2 rounded font-bold">Active</span>
                    </div>
                    <div className="space-y-1.5 text-[10px] font-semibold">
                      {/* Risk alerts */}
                      <div className="flex gap-2 items-start text-red-600 bg-red-500/5 p-1.5 rounded border border-red-500/10">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] font-bold font-display">Contraindication Warning</strong>
                          Avoid prescribing penicillin derivatives due to patient allergy MRN register.
                        </div>
                      </div>
                      {/* Insights */}
                      <div className="flex gap-2 items-start text-brand-accent bg-brand-accent/5 p-1.5 rounded border border-brand-accent/10">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-brand-accent" />
                        <div>
                          <strong className="block text-[11px] font-bold font-display">Clinical Advisory Insight</strong>
                          Patient last check showed borderline high blood pressure. Review adherence to Lisinopril medication.
                        </div>
                      </div>
                      {/* Follow-up suggestions */}
                      <div className="flex gap-2 items-start text-brand-teal bg-brand-teal/5 p-1.5 rounded border border-brand-teal/10">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand-teal" />
                        <div>
                          <strong className="block text-[11px] font-bold font-display">Follow-Up Suggestion</strong>
                          Schedule renal panel lab test in 2 weeks to evaluate hypertension medication effectiveness.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prescription Panel */}
                  <div className="glass-panel p-3 rounded-xl border border-brand-border space-y-2">
                    <h3 className="font-extrabold text-[10px] text-brand-muted uppercase tracking-wider border-b border-brand-border pb-1 font-display">
                      Prescription Manager
                    </h3>

                    {/* Prescription list */}
                    <div className="space-y-1 max-h-[120px] overflow-y-auto">
                      {prescriptions.map((rx) => (
                        <div key={rx.id} className="p-1.5 bg-brand-bg rounded-lg flex justify-between items-center text-[10px] border border-brand-border/30">
                          <div>
                            <span className="font-bold text-brand-text">{rx.drug}</span>
                            <span className="text-[9px] text-brand-muted block">{rx.dosage} • {rx.frequency}</span>
                          </div>
                          <span className="text-[8px] bg-brand-accent/10 text-brand-accent px-1 rounded font-mono">{rx.duration}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Prescription */}
                    <form onSubmit={handleAddPrescription} className="pt-2 border-t border-brand-border/40 space-y-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="text"
                          placeholder="Drug Name"
                          value={newDrug}
                          onChange={(e) => setNewDrug(e.target.value)}
                          className="p-1.5 bg-brand-bg border border-brand-border rounded-lg text-[10px] focus:outline-none font-semibold"
                        />
                        <input 
                          type="text"
                          placeholder="Dosage"
                          value={newDosage}
                          onChange={(e) => setNewDosage(e.target.value)}
                          className="p-1.5 bg-brand-bg border border-brand-border rounded-lg text-[10px] focus:outline-none font-semibold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input 
                          type="text"
                          placeholder="Frequency"
                          value={newFreq}
                          onChange={(e) => setNewFreq(e.target.value)}
                          className="p-1.5 bg-brand-bg border border-brand-border rounded-lg text-[10px] focus:outline-none font-semibold"
                        />
                        <input 
                          type="text"
                          placeholder="Duration"
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                          className="p-1.5 bg-brand-bg border border-brand-border rounded-lg text-[10px] focus:outline-none font-semibold"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full py-1 bg-brand-accent text-white hover:bg-brand-accent/90 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Prescription
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Action Buttons footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
                <button 
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 border border-brand-border hover:bg-brand-hover text-brand-text rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCompleteConsult}
                  className="px-5 py-2 bg-brand-teal text-white hover:bg-brand-teal/90 rounded-xl text-xs font-extrabold shadow-md shadow-brand-teal/10 flex items-center gap-1.5 cursor-pointer active:scale-97"
                >
                  <Check className="w-4 h-4" />
                  Sign EHR & Finalize Consult
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center py-20 text-center space-y-4">
              <div className="p-4 rounded-full bg-brand-bg border border-brand-border text-brand-muted">
                <BookOpen className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-brand-text font-display">No Patient File Opened</h3>
                <p className="text-xs text-brand-muted max-w-sm mt-1">
                  Select a patient from the waiting queue or daily list in the left sidebar to start clinical intake.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
