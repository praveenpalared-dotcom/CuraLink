import React, { useEffect, useState } from 'react';
import { Users, Clock, LogIn, CheckSquare, RefreshCw, AlertCircle, Play, Search, CheckCircle2, ChevronRight, UserCheck } from 'lucide-react';

export default function QueueBoard() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptStats, setDeptStats] = useState({
    waiting: 0,
    called: 0,
    avgWait: 15
  });

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const qRes = await fetch('/api/v1/queue/');
      if (!qRes.ok) throw new Error('Failed to fetch queue logs');
      const qData = await qRes.json();
      setQueue(qData);

      // Recalculate stats based on queue list
      const waiting = qData.filter(q => !q.called_to_room_time).length;
      const called = qData.filter(q => q.called_to_room_time).length;
      const avgWait = qData.length > 0 
        ? Math.max(...qData.map(q => q.estimated_wait_minutes))
        : 0;

      setDeptStats({ waiting, called, avgWait });
      setError('');
    } catch (err) {
      setError('Connection to operations DB failed. Verify FastAPI backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCallRoom = async (id) => {
    try {
      const res = await fetch(`/api/v1/queue/${id}/call-room`, { method: 'POST' });
      if (res.ok) fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await fetch(`/api/v1/queue/${id}/complete`, { method: 'POST' });
      if (res.ok) fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckInSimulate = async () => {
    try {
      const apptRes = await fetch('/api/v1/appointments/');
      if (apptRes.ok) {
        const appts = await apptRes.json();
        // Find appointments that are scheduled but not checked in (status !== checked_in and status !== completed)
        const scheduled = appts.find(a => a.status === 'scheduled' || a.status === 'confirmed');
        if (scheduled) {
          const res = await fetch(`/api/v1/queue/check-in?appointment_id=${scheduled.id}`, { method: 'POST' });
          if (res.ok) fetchQueue();
        } else {
          alert("All scheduled/confirmed appointments are already checked in. Use the AI chatbot or Patient Portal to book a new appointment first!");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter & Search Logic
  const filteredQueue = queue.filter(item => {
    // Department Filter
    const matchesDept = selectedDept === 'all' || item.department_id === Number(selectedDept);
    
    // Search Query (Patient Name or Doctor Name)
    const patientName = item.appointment?.patient 
      ? `${item.appointment.patient.first_name} ${item.appointment.patient.last_name}`.toLowerCase()
      : 'walk-in patient';
    const doctorName = item.appointment?.doctor
      ? `dr. ${item.appointment.doctor.first_name} ${item.appointment.doctor.last_name}`.toLowerCase()
      : 'unassigned';
    const matchesSearch = patientName.includes(searchQuery.toLowerCase()) || 
                          doctorName.includes(searchQuery.toLowerCase()) ||
                          `app-${item.appointment_id}`.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesSearch;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Controls & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1: Waiting */}
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-brand-border">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Lobby Waiting</span>
            <span className="text-2xl font-extrabold text-brand-text font-mono block mt-0.5">{deptStats.waiting}</span>
          </div>
        </div>

        {/* Metric 2: Called */}
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-brand-border">
          <div className="p-2.5 rounded-xl bg-brand-teal/10 border border-brand-teal/20">
            <UserCheck className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">In Treatment</span>
            <span className="text-2xl font-extrabold text-brand-text font-mono block mt-0.5">{deptStats.called}</span>
          </div>
        </div>

        {/* Metric 3: Max Wait */}
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-brand-border">
          <div className="p-2.5 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
            <Clock className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Max Wait Time</span>
            <span className="text-2xl font-extrabold text-brand-text font-mono block mt-0.5">{deptStats.avgWait} <span className="text-xs font-sans font-bold text-brand-muted">mins</span></span>
          </div>
        </div>

        {/* Action Call */}
        <div className="flex flex-col justify-center">
          <button 
            onClick={handleCheckInSimulate}
            className="w-full py-3.5 px-4 bg-linear-to-r from-brand-accent to-brand-teal text-white hover:scale-[1.02] active:scale-[0.98] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <LogIn className="w-4 h-4" />
            Check-In Next Patient
          </button>
        </div>
      </div>

      {/* Main Board Container */}
      <div className="glass-panel rounded-2xl border border-brand-border overflow-hidden shadow-lg">
        {/* Table Header Filter & Search */}
        <div className="p-4 bg-brand-card/50 border-b border-brand-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <h3 className="font-bold text-brand-text flex items-center gap-2 text-sm font-display shrink-0">
              Live Intake Queue
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
              </span>
            </h3>
            
            {/* Department Selector */}
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="ml-3 px-3 py-1.5 bg-brand-bg border border-brand-border rounded-xl text-brand-text focus:outline-none focus:border-brand-accent text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value={1}>General Medicine</option>
              <option value={2}>Ophthalmology</option>
              <option value={3}>Pediatrics</option>
              <option value={4}>Orthopedics</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-80 relative">
            <Search className="w-4 h-4 text-brand-muted absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, doctor or ID..."
              className="w-full pl-9 pr-8 py-1.5 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent"
            />
            {loading && (
              <RefreshCw className="w-3.5 h-3.5 text-brand-muted animate-spin absolute right-3" />
            )}
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5 text-red-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-brand-text">
            <thead className="bg-brand-bg/50 text-brand-muted border-b border-brand-border text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4 pl-5">Position</th>
                <th className="p-4">Patient Name</th>
                <th className="p-4">Department / Doctor</th>
                <th className="p-4">Check-In</th>
                <th className="p-4">Est. Wait</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-brand-muted text-xs">
                    {searchQuery ? "No matching patients found in current queue." : "No patients are checked in right now."}
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => {
                  const patient = item.appointment?.patient;
                  const patientName = patient 
                    ? `${patient.first_name} ${patient.last_name}`
                    : 'Walk-in Patient';
                  const mrn = patient?.medical_record_number || 'No MRN';

                  const doctor = item.appointment?.doctor;
                  const doctorName = doctor 
                    ? `Dr. ${doctor.first_name} ${doctor.last_name}`
                    : 'Unassigned';
                  const specialty = doctor?.specialty || 'General Practice';

                  const isCalled = !!item.called_to_room_time;

                  return (
                    <tr key={item.id} className="hover:bg-brand-hover/40 transition-colors">
                      {/* Position */}
                      <td className="p-4 pl-5 font-bold text-brand-accent text-sm font-mono">
                        #{item.current_position}
                      </td>

                      {/* Patient Name */}
                      <td className="p-4">
                        <div className="font-bold text-brand-text text-sm">{patientName}</div>
                        <div className="text-[10px] text-brand-muted font-semibold mt-0.5">MRN: <span className="font-mono text-brand-text">{mrn}</span></div>
                      </td>

                      {/* Department / Doctor */}
                      <td className="p-4">
                        <div className="font-semibold text-brand-text">{specialty}</div>
                        <div className="text-[10px] text-brand-muted mt-0.5">{doctorName}</div>
                      </td>

                      {/* Check-In */}
                      <td className="p-4 text-brand-muted font-medium">
                        {new Date(item.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Est. Wait */}
                      <td className="p-4 font-bold">
                        {isCalled ? (
                          <span className="text-brand-teal">0 min</span>
                        ) : (
                          <span className={item.estimated_wait_minutes > 30 ? 'text-amber-500' : 'text-brand-text'}>
                            {item.estimated_wait_minutes} mins
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isCalled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-teal/10 text-brand-teal border border-brand-teal/20 animate-pulse">
                            In Exam Room
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            In Lobby
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-5 text-right">
                        <div className="flex justify-end gap-2">
                          {!isCalled ? (
                            <button
                              onClick={() => handleCallRoom(item.id)}
                              className="px-3.5 py-1.5 bg-brand-teal hover:bg-brand-teal/80 text-white font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-[0.97]"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Call Room
                            </button>
                          ) : (
                            <button
                              onClick={() => handleComplete(item.id)}
                              className="px-3.5 py-1.5 bg-brand-card hover:bg-brand-hover text-brand-text border border-brand-border font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-[0.97]"
                            >
                              <CheckSquare className="w-3.5 h-3.5 text-brand-teal" />
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
