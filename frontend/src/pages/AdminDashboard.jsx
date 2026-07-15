import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, AlertCircle, ShieldAlert, BarChart3, Calendar, Plus, RefreshCw, Check,
  DollarSign, Activity, ActivitySquare, LayoutDashboard, Smile, ThumbsUp, Trash2
} from 'lucide-react';

export default function AdminDashboard({ onLogout, onNavigate }) {
  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Bed Management State
  const [beds, setBeds] = useState([
    { type: 'ICU Beds', occupied: 18, total: 20 },
    { type: 'General Ward Beds', occupied: 142, total: 150 },
    { type: 'Cardiac Care Beds', occupied: 8, total: 12 },
    { type: 'Isolation Units', occupied: 3, total: 10 }
  ]);
  const [showBedModal, setShowBedModal] = useState(false);
  const [selectedBedType, setSelectedBedType] = useState('ICU Beds');
  const [bedChangeAmount, setBedChangeAmount] = useState(1);

  // Workforce State
  const [staffShifts, setStaffShifts] = useState([
    { id: 1, name: 'Dr. Richard Patel', role: 'Doctor', specialty: 'General Medicine', shift: '08:00 AM - 04:00 PM', onCall: false },
    { id: 2, name: 'Dr. Angela Yu', role: 'Doctor', specialty: 'Ophthalmology', shift: '09:00 AM - 05:00 PM', onCall: true },
    { id: 3, name: 'Dr. Sarah Jenkins', role: 'Doctor', specialty: 'Pediatrics', shift: '08:00 AM - 04:00 PM', onCall: false },
    { id: 4, name: 'Dr. James Evans', role: 'Doctor', specialty: 'Orthopedics', shift: '10:00 AM - 06:00 PM', onCall: true },
    { id: 5, name: 'Dr. Marcus Vance', role: 'Doctor', specialty: 'Cardiology', shift: '09:00 AM - 05:00 PM', onCall: false },
    { id: 6, name: 'Jessica Taylor, RN', role: 'Nurse', specialty: 'General Medicine', shift: '07:00 AM - 03:00 PM', onCall: false },
    { id: 7, name: 'Robert Chen, RN', role: 'Nurse', specialty: 'Pediatrics', shift: '03:00 PM - 11:00 PM', onCall: false }
  ]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Nurse');
  const [newStaffSpecialty, setNewStaffSpecialty] = useState('General Medicine');
  const [newStaffShift, setNewStaffShift] = useState('09:00 AM - 05:00 PM');
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);

  // Fetch appointments & queue data
  const fetchData = async () => {
    try {
      const apptRes = await fetch('/api/v1/appointments/');
      const qRes = await fetch('/api/v1/queue/');
      const deptRes = await fetch('/api/v1/appointments/departments');

      if (apptRes.ok) setAppointments(await apptRes.json());
      if (qRes.ok) setQueue(await qRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (e) {
      console.error("Failed to load operations admin data:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateBeds = (e) => {
    e.preventDefault();
    setBeds(beds.map(bed => {
      if (bed.type === selectedBedType) {
        const newOccupied = Math.min(bed.total, Math.max(0, bed.occupied + Number(bedChangeAmount)));
        return { ...bed, occupied: newOccupied };
      }
      return bed;
    }));
    setShowBedModal(false);
    alert(`Updated bed census registries for ${selectedBedType}.`);
  };

  const handleAddShift = (e) => {
    e.preventDefault();
    if (!newStaffName) return;
    const shift = {
      id: staffShifts.length + 1,
      name: newStaffName,
      role: newStaffRole,
      specialty: newStaffSpecialty,
      shift: newStaffShift,
      onCall: false
    };
    setStaffShifts([...staffShifts, shift]);
    setNewStaffName('');
    setShowAddShiftModal(false);
    alert(`Workforce registry updated. Allocated ${newStaffName} to ${newStaffSpecialty} shift.`);
  };

  const handleDeleteShift = (id) => {
    setStaffShifts(staffShifts.filter(s => s.id !== id));
  };

  // Calculations
  const waitingCount = queue.filter(q => !q.completed_time).length;
  const avgWait = waitingCount > 0 ? Math.max(...queue.map(q => q.estimated_wait_minutes)) : 14;
  const totalBeds = beds.reduce((sum, b) => sum + b.total, 0);
  const occupiedBeds = beds.reduce((sum, b) => sum + b.occupied, 0);
  const bedPercent = Math.round((occupiedBeds / totalBeds) * 100);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header bar */}
      <header className="bg-brand-card border-b border-brand-border px-4 py-2.5 flex justify-between items-center z-10 font-sans">
        <div onClick={() => onNavigate('landing')} className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition">
          <div className="p-1.5 rounded-lg bg-brand-accent/10 border border-brand-accent/20">
            <LayoutDashboard className="w-5 h-5 text-brand-accent" />
          </div>
          <span className="font-extrabold text-sm sm:text-lg text-brand-text font-display">
            CuraLink
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-purple-500/15 text-purple-600 font-extrabold px-2 py-0.5 rounded-full border border-purple-500/20 ml-2">
            OPERATIONS ADMIN
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-brand-text">Admin Supervisor</span>
            <span className="text-[9px] text-brand-muted block font-extrabold uppercase tracking-wider">High-Bandwidth Clinical Command</span>
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

      {/* Admin Panel Workspace */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-60px)]">
        
        {/* Row 1: KPI Grid (8 Cards) - Compact design */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <div className="glass-panel p-2.5 rounded-xl border border-brand-border">
            <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Avg Wait Time</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-brand-text font-mono">{avgWait}m</span>
              <span className="text-[8px] text-emerald-600 font-extrabold bg-emerald-500/10 px-1 rounded">-18%</span>
            </div>
            <span className="text-[8px] text-brand-muted block mt-0.5">vs yesterday (18m)</span>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border border-brand-border">
            <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Today's Visits</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-brand-text font-mono">{appointments.length}</span>
              <span className="text-[8px] text-brand-accent font-extrabold bg-brand-accent/10 px-1 rounded">+12%</span>
            </div>
            <span className="text-[8px] text-brand-muted block mt-0.5">vs yesterday (220)</span>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border border-brand-border">
            <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">No-shows Prevented</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-brand-text font-mono">14 cases</span>
              <span className="text-[8px] text-emerald-600 font-extrabold bg-emerald-500/10 px-1 rounded">Saved</span>
            </div>
            <span className="text-[8px] text-brand-muted block mt-0.5">via WhatsApp pre-check</span>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border border-brand-border">
            <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Active Doctors</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-brand-text font-mono">18 duty</span>
              <span className="text-[8px] text-brand-muted">/ 22</span>
            </div>
            <span className="text-[8px] text-emerald-600 font-extrabold block mt-0.5">86% Active</span>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border border-brand-border">
            <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Lobby Capacity</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-brand-text font-mono">{82}%</span>
              <span className="text-[8px] text-brand-accent font-extrabold bg-brand-accent/10 px-1 rounded">Optimal</span>
            </div>
            <span className="text-[8px] text-brand-muted block mt-0.5">Intake margin safe</span>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border border-brand-border">
            <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Bed Occupancy</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-brand-text font-mono">{bedPercent}%</span>
              <span className="text-[8px] text-red-500 font-bold bg-red-100 px-1 rounded">High</span>
            </div>
            <span className="text-[8px] text-brand-muted block mt-0.5">{occupiedBeds}/{totalBeds} Occupied</span>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border border-brand-border">
            <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">Revenue impact</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-brand-text font-mono">$18,450</span>
              <span className="text-[8px] text-emerald-600 font-bold bg-emerald-100 px-1 rounded">Recovered</span>
            </div>
            <span className="text-[8px] text-brand-muted block mt-0.5">via auto rescheduling</span>
          </div>

          <div className="glass-panel p-2.5 rounded-xl border border-brand-border">
            <span className="text-[8px] text-brand-muted font-bold uppercase tracking-wider block">NPS Score</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-base font-black text-brand-text font-mono">78</span>
              <span className="text-[8px] text-brand-teal font-extrabold bg-brand-teal/10 px-1 rounded">Excellent</span>
            </div>
            <span className="text-[8px] text-brand-muted block mt-0.5">92% Positive Sentiment</span>
          </div>
        </div>

        {/* Row 2: Left, Middle, Right Column Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Column 1 (Left): Bed Management & Emergency Triage (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Bed management panel */}
            <div className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-brand-border pb-1.5">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text font-display">Bed Census Management</h3>
                <button 
                  onClick={() => setShowBedModal(true)}
                  className="px-2 py-1 bg-brand-accent text-white text-[9px] font-extrabold rounded-lg hover:bg-brand-accent/90 cursor-pointer shadow-sm"
                >
                  Edit Bed Levels
                </button>
              </div>

              <div className="space-y-2">
                {beds.map((bed, i) => {
                  const percent = Math.round((bed.occupied / bed.total) * 100);
                  return (
                    <div key={i} className="p-2 bg-brand-bg rounded-xl border border-brand-border/60 text-xs">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-brand-text">{bed.type}</span>
                        <span className="text-brand-muted">{bed.occupied} / {bed.total} Beds ({percent}%)</span>
                      </div>
                      <div className="w-full bg-brand-border rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            percent > 85 ? 'bg-red-500' : percent > 60 ? 'bg-amber-500' : 'bg-brand-teal'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emergency alerts */}
            <div className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3 shadow-sm text-xs">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text border-b border-brand-border pb-1.5 font-display flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                Emergency Operations Center
              </h3>
              
              <div className="space-y-2">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-red-600 text-[10px]">
                    <span>ICU RESUSCITATION ROOM 1</span>
                    <span>ACTIVE</span>
                  </div>
                  <p className="text-brand-text font-bold">Patient John Doe (MRN-848202)</p>
                  <p className="text-[10px] text-brand-muted">Cardiac telemetry alert triggered. Resuscitation team active.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 (Middle): Department Performance & SVG Analytics (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Department stats */}
            <div className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3 shadow-sm text-xs">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text border-b border-brand-border pb-1.5 font-display">
                Departmental Throughput
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] text-brand-muted uppercase font-black border-b border-brand-border">
                      <th className="pb-1">Department</th>
                      <th className="pb-1">Active Queue</th>
                      <th className="pb-1 text-right">Avg Wait</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40 font-semibold">
                    {departments.map((dept, i) => (
                      <tr key={i}>
                        <td className="py-1.5 text-brand-text">{dept.name}</td>
                        <td className="py-1.5 text-brand-muted">{queue.filter(q => q.department_id === dept.id && !q.completed_time).length} waiting</td>
                        <td className="py-1.5 text-right font-mono text-brand-accent">
                          {queue.filter(q => q.department_id === dept.id && !q.completed_time).length * 20} min
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-brand-muted">No clinic load records.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom patient experience sentiment widget */}
            <div className="glass-panel p-4 rounded-2xl border border-brand-border space-y-3 shadow-sm text-xs">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text border-b border-brand-border pb-1.5 font-display">
                Patient Experience & Sentiment Logs
              </h3>

              <div className="grid grid-cols-3 gap-2 text-center font-bold">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
                  <span className="text-[8px] text-emerald-700 block uppercase font-black">Positive</span>
                  <span className="text-sm font-mono block mt-0.5">92%</span>
                </div>
                <div className="p-2 bg-slate-100 text-slate-600 rounded-xl border border-slate-200">
                  <span className="text-[8px] text-slate-700 block uppercase font-black">Neutral</span>
                  <span className="text-sm font-mono block mt-0.5">6%</span>
                </div>
                <div className="p-2 bg-red-100 text-red-600 rounded-xl border border-red-200">
                  <span className="text-[8px] text-red-700 block uppercase font-black">Negative</span>
                  <span className="text-sm font-mono block mt-0.5">2%</span>
                </div>
              </div>

              <div className="p-2.5 bg-brand-bg rounded-xl border border-brand-border/60 text-[10px]">
                <strong className="text-brand-text block mb-0.5">Patient Feedback (Last Consult):</strong>
                <p className="text-brand-muted italic leading-relaxed">
                  "Checking my waiting position in real-time on CuraLink saved me from standing in the lobby for an hour. Fantastic care by Dr. Richard Patel."
                </p>
              </div>
            </div>
          </div>

          {/* Column 3 (Right): Staff Scheduling & utilization (4 cols) */}
          <div className="lg:col-span-4 glass-panel p-4 rounded-2xl border border-brand-border space-y-3 shadow-sm text-xs">
            <div className="flex justify-between items-center border-b border-brand-border pb-1.5">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text font-display">Workforce Scheduling</h3>
              <button 
                onClick={() => setShowAddShiftModal(true)}
                className="px-2 py-1 bg-brand-accent text-white text-[9px] font-extrabold rounded-lg hover:bg-brand-accent/90 cursor-pointer shadow-sm flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Allocate Staff
              </button>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {staffShifts.map((staff) => (
                <div key={staff.id} className="p-2 bg-brand-bg rounded-xl border border-brand-border/60 flex justify-between items-center">
                  <div>
                    <strong className="text-brand-text font-bold text-[11px] block">{staff.name}</strong>
                    <span className="text-[9px] text-brand-muted block font-semibold uppercase">{staff.role} • {staff.specialty}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] bg-brand-accent/10 border border-brand-accent/20 px-1.5 py-0.5 rounded text-brand-accent font-mono block font-bold">
                      {staff.shift}
                    </span>
                    <button 
                      onClick={() => handleDeleteShift(staff.id)}
                      className="text-red-500 hover:text-red-700 text-[8px] font-bold block mt-1 hover:underline text-right w-full cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Bed Census Modals */}
      {showBedModal && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h4 className="font-bold text-sm text-brand-text font-display border-b border-brand-border pb-1.5">Edit Bed Levels</h4>
            
            <form onSubmit={handleUpdateBeds} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-brand-muted block">Select Bed Type</label>
                <select 
                  value={selectedBedType}
                  onChange={(e) => setSelectedBedType(e.target.value)}
                  className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none font-semibold text-brand-text"
                >
                  {beds.map((b, i) => (
                    <option key={i} value={b.type}>{b.type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-muted block">Census Delta (+ / -)</label>
                <input 
                  type="number" 
                  value={bedChangeAmount}
                  onChange={(e) => setBedChangeAmount(e.target.value)}
                  className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl text-center focus:outline-none font-bold text-brand-text"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowBedModal(false)}
                  className="px-3.5 py-1.5 border border-brand-border text-brand-text rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-brand-accent text-white hover:bg-brand-accent/95 rounded-xl font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Staff Modal */}
      {showAddShiftModal && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h4 className="font-bold text-sm text-brand-text font-display border-b border-brand-border pb-1.5">Allocate Staff Shift</h4>
            
            <form onSubmit={handleAddShift} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-brand-muted block">Staff Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Miller, RN"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none font-semibold text-brand-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-brand-muted block">Role</label>
                  <select 
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none font-semibold text-brand-text"
                  >
                    <option value="Nurse">Nurse</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-brand-muted block">Clinic</label>
                  <select 
                    value={newStaffSpecialty}
                    onChange={(e) => setNewStaffSpecialty(e.target.value)}
                    className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none font-semibold text-brand-text"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-brand-muted block">Shift Slot</label>
                <input 
                  type="text" 
                  value={newStaffShift}
                  onChange={(e) => setNewStaffShift(e.target.value)}
                  className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none font-semibold text-brand-text"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddShiftModal(false)}
                  className="px-3.5 py-1.5 border border-brand-border text-brand-text rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-brand-accent text-white hover:bg-brand-accent/95 rounded-xl font-bold cursor-pointer"
                >
                  Save Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
