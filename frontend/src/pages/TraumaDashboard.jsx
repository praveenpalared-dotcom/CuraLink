import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Ambulance, Clock, HeartPulse, Stethoscope, Droplet, UserMinus, ShieldAlert, LogOut, ChevronRight, ActivitySquare, AlertCircle, Syringe, Plus } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

export default function TraumaDashboard({ user, onLogout, onNavigate }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const incomingAmbulances = [
    { id: 'AMB-104', eta: '2 mins', priority: 'Critical', issue: 'Multiple Trauma - RTA', hr: 142, bp: '80/50', o2: '88%' },
    { id: 'AMB-209', eta: '8 mins', priority: 'High', issue: 'Suspected Myocardial Infarction', hr: 110, bp: '160/95', o2: '94%' }
  ];

  const activeResus = [
    { bed: 'Resus Bay 1', patient: 'Unknown Male (~40s)', status: 'Active CPR', teamLead: 'Dr. Sarah Jenkins', timeInBay: '14 mins' },
    { bed: 'Resus Bay 2', patient: 'Maria Garcia', status: 'Stabilizing', teamLead: 'Dr. Marcus Vance', timeInBay: '42 mins' }
  ];

  const traumaQueue = [
    { id: 1, name: 'James Wilson', triage: 'Red (Immediate)', complaint: 'Severe Chest Pain', waitTime: '4 mins' },
    { id: 2, name: 'Lisa Ray', triage: 'Yellow (Urgent)', complaint: 'Deep Laceration Arm', waitTime: '12 mins' },
    { id: 3, name: 'David Kim', triage: 'Yellow (Urgent)', complaint: 'Closed Fracture Leg', waitTime: '25 mins' }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="bg-[#1A1A1A] border-b border-red-500/30 px-4 py-2.5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-red-600 border border-red-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-lg text-white font-display tracking-wide">
            TRAUMA & EMERGENCY
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-red-500/20 text-red-500 font-extrabold px-2 py-0.5 rounded-full border border-red-500/30 ml-2 animate-pulse">
            CODE RED ACTIVE
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right mr-2 hidden md:block">
             <div className="text-xl font-mono font-black text-red-500">{currentTime.toLocaleTimeString()}</div>
          </div>
          <NotificationBell userType="staff" userId={1} />
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-white">{user?.name || "Dr. Sarah"}</span>
            <span className="text-[9px] text-red-400 font-bold block uppercase tracking-wider">Trauma Director</span>
          </div>
          <button 
            onClick={onLogout}
            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto max-h-[calc(100vh-60px)]">
        
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#1A1A1A] p-3 rounded-xl border border-red-500/20 flex flex-col justify-between">
              <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1"><Ambulance className="w-3 h-3"/> En Route</span>
              <span className="text-2xl font-black text-white font-mono mt-1">2</span>
            </div>
            <div className="bg-[#1A1A1A] p-3 rounded-xl border border-amber-500/20 flex flex-col justify-between">
              <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1"><ActivitySquare className="w-3 h-3"/> Triage Queue</span>
              <span className="text-2xl font-black text-white font-mono mt-1">14</span>
            </div>
            <div className="bg-[#1A1A1A] p-3 rounded-xl border border-emerald-500/20 flex flex-col justify-between">
              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1"><Stethoscope className="w-3 h-3"/> Free Beds</span>
              <span className="text-2xl font-black text-white font-mono mt-1">4 <span className="text-sm text-brand-muted">/ 20</span></span>
            </div>
            <div className="bg-[#1A1A1A] p-3 rounded-xl border border-blue-500/20 flex flex-col justify-between">
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1"><Droplet className="w-3 h-3"/> O- Blood</span>
              <span className="text-2xl font-black text-white font-mono mt-1">12 <span className="text-sm text-brand-muted">units</span></span>
            </div>
          </div>

          <div className="bg-red-950/20 p-4 rounded-xl border border-red-500/30 space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-red-500 flex items-center gap-2 border-b border-red-500/20 pb-2">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
              Incoming Ambulances
            </h3>
            <div className="space-y-2">
              {incomingAmbulances.map(amb => (
                <div key={amb.id} className="p-3 bg-[#1A1A1A] rounded-xl border border-red-500/40 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-white text-sm">{amb.id}</span>
                      <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black uppercase">{amb.priority}</span>
                    </div>
                    <div className="text-xs text-red-300 font-semibold">{amb.issue}</div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="text-center">
                      <span className="block text-[8px] text-brand-muted uppercase">Vitals</span>
                      <span className="text-[10px] text-white font-mono block">HR: {amb.hr}</span>
                      <span className="text-[10px] text-white font-mono block">BP: {amb.bp}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-brand-muted uppercase">ETA</span>
                      <span className="text-lg font-black text-red-500 font-mono">{amb.eta}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-4 rounded-xl border border-brand-border space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-2 border-b border-brand-border pb-2">
              <HeartPulse className="w-4 h-4 text-red-500" />
              Active Resuscitation Bays
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {activeResus.map((bay, i) => (
                <div key={i} className="p-3 bg-brand-bg rounded-xl border border-brand-border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-black text-white text-sm">{bay.bed}</span>
                    <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-bold animate-pulse">{bay.status}</span>
                  </div>
                  <div className="space-y-1 mt-3">
                    <div className="text-[10px] flex justify-between"><span className="text-brand-muted">Patient:</span> <span className="text-white font-bold">{bay.patient}</span></div>
                    <div className="text-[10px] flex justify-between"><span className="text-brand-muted">Lead:</span> <span className="text-brand-teal font-bold">{bay.teamLead}</span></div>
                    <div className="text-[10px] flex justify-between"><span className="text-brand-muted">Time:</span> <span className="text-amber-500 font-mono font-bold">{bay.timeInBay}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1A1A1A] h-full p-4 rounded-xl border border-brand-border flex flex-col">
            <div className="flex justify-between items-center border-b border-brand-border pb-2 mb-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                <ActivitySquare className="w-4 h-4 text-amber-500" />
                Emergency Triage Queue
              </h3>
              <span className="text-[10px] text-brand-muted font-mono">Total: 14</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {traumaQueue.map(patient => (
                <div key={patient.id} className="p-3 bg-brand-bg rounded-xl border border-brand-border/60 hover:border-brand-border transition-colors cursor-pointer flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-sm">{patient.name}</div>
                    <div className="text-[10px] text-brand-muted font-semibold mt-0.5">{patient.complaint}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${patient.triage.includes('Red') ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'}`}>
                      {patient.triage}
                    </span>
                    <span className="block text-[10px] text-brand-muted font-mono mt-1">{patient.waitTime}</span>
                  </div>
                </div>
              ))}
              
              <div className="p-3 bg-brand-bg/50 border border-dashed border-brand-border rounded-xl text-center cursor-pointer hover:bg-brand-bg transition-colors">
                <span className="text-[10px] text-brand-muted font-bold flex items-center justify-center gap-1"><Plus className="w-3 h-3"/> 11 more waiting...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
