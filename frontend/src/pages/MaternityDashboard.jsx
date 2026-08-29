import React, { useState } from 'react';
import { Heart, Activity, Calendar, Clock, CheckCircle2, UserCircle2, AlertCircle } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

export default function MaternityDashboard({ user, onLogout, onNavigate }) {
  const [patients, setPatients] = useState([
    { id: 'MAT-201', name: 'Emily Clark', weeks: '38w 2d', status: 'Active Labor', edd: '2026-09-10', room: 'Labor Room 1', fhr: '142 bpm' },
    { id: 'MAT-202', name: 'Sophia Turner', weeks: '12w 5d', status: 'Routine Scan', edd: '2027-03-05', room: 'Scan Room A', fhr: 'N/A' },
    { id: 'MAT-203', name: 'Rachel Green', weeks: '40w 1d', status: 'Post-Op Recovery', edd: '2026-08-25', room: 'Ward 4B', fhr: 'Delivered' }
  ]);

  const getStatusStyle = (status) => {
    if (status === 'Active Labor') return 'bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse';
    if (status === 'Post-Op Recovery') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    return 'bg-brand-bg text-brand-muted border-brand-border';
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="bg-brand-card border-b border-brand-border px-4 py-2.5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Heart className="w-5 h-5 text-purple-400" />
          </div>
          <span className="font-extrabold text-lg text-brand-text font-display tracking-wide">
            MATERNITY & OBSTETRICS
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell userType="staff" userId={1} />
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-brand-text">{user?.name || "Dr. Olivia"}</span>
            <span className="text-[9px] text-purple-400 font-bold block uppercase tracking-wider">Head Obstetrician</span>
          </div>
          <button 
            onClick={onLogout}
            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Patient List */}
        <div className="md:col-span-8 space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-brand-border">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text flex items-center gap-2 border-b border-brand-border pb-3 mb-4">
              <Activity className="w-4 h-4 text-purple-400" />
              Ward Occupancy & Monitor
            </h3>
            
            <div className="space-y-3">
              {patients.map(p => (
                <div key={p.id} className="p-4 bg-brand-bg rounded-xl border border-brand-border hover:border-purple-500/40 transition cursor-pointer flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-card border border-brand-border flex items-center justify-center">
                      <UserCircle2 className="w-6 h-6 text-brand-muted" />
                    </div>
                    <div>
                      <div className="font-black text-brand-text text-sm">{p.name} <span className="text-brand-muted font-normal ml-2 text-xs">({p.weeks})</span></div>
                      <div className="text-[10px] text-brand-muted font-bold mt-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> EDD: {p.edd}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[9px] text-brand-muted uppercase">FHR</div>
                      <div className={`font-mono font-black ${p.fhr === '142 bpm' ? 'text-emerald-500' : 'text-brand-text'}`}>{p.fhr}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${getStatusStyle(p.status)}`}>
                        {p.status}
                      </span>
                      <div className="text-xs text-brand-text font-mono font-bold mt-2 flex items-center justify-end gap-1">
                        <AlertCircle className="w-3 h-3 text-brand-muted"/> {p.room}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Stats */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/20">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-purple-400 flex items-center gap-2 border-b border-purple-500/20 pb-2 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              Today's Deliveries
            </h3>
            <div className="text-center py-4">
              <div className="text-4xl font-black text-purple-400 font-display">3</div>
              <div className="text-xs text-brand-text font-bold mt-1">Successful Deliveries</div>
              <div className="text-[10px] text-brand-muted mt-0.5">2 Vaginal • 1 C-Section</div>
            </div>
          </div>
          
          <div className="glass-panel p-4 rounded-xl border border-brand-border">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text flex items-center gap-2 border-b border-brand-border pb-2 mb-3">
              <Clock className="w-4 h-4 text-emerald-500" />
              On-Call Midwives
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-text font-bold"><span>Sarah Collins</span> <span className="text-emerald-500 text-xs">Active</span></div>
              <div className="flex justify-between text-brand-text font-bold"><span>Jane Doe</span> <span className="text-emerald-500 text-xs">Active</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
