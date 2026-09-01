import React, { useState, useEffect } from 'react';
import { Baby, Activity, Syringe, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

export default function PediatricsDashboard({ user, onLogout, onNavigate }) {
  const [patients, setPatients] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/pediatrics/patients');
      if (res.ok) setPatients(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 5000);
    return () => clearInterval(timer);
  }, []);

  const getStatusStyle = (status) => {
    if (status === 'Checked In') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (status === 'Waiting') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-brand-bg text-brand-muted border-brand-border';
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="bg-brand-card border-b border-brand-border px-4 py-2.5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
            <Baby className="w-5 h-5 text-pink-400" />
          </div>
          <span className="font-extrabold text-lg text-brand-text font-display tracking-wide">
            PEDIATRICS WARD
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell userType="staff" userId={1} />
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-brand-text">{user?.name || "Dr. Emily"}</span>
            <span className="text-[9px] text-pink-400 font-bold block uppercase tracking-wider">Pediatrician</span>
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
        <div className="md:col-span-8 space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-brand-border">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text flex items-center gap-2 border-b border-brand-border pb-3 mb-4">
              <ClipboardList className="w-4 h-4 text-brand-accent" />
              Today's Pediatric Schedule
            </h3>
            
            <div className="space-y-3">
              {patients.map(p => (
                <div key={p.id} className="p-4 bg-brand-bg rounded-xl border border-brand-border hover:border-brand-accent/50 transition cursor-pointer flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-card border border-brand-border flex items-center justify-center">
                      <Baby className="w-6 h-6 text-brand-muted" />
                    </div>
                    <div>
                      <div className="font-black text-brand-text text-sm">{p.name} <span className="text-brand-muted font-normal ml-2">({p.age})</span></div>
                      <div className="text-[10px] text-brand-muted font-bold mt-1">Parent/Guardian: {p.parent}</div>
                      <div className="text-xs text-brand-accent font-semibold mt-0.5">{p.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${getStatusStyle(p.status)}`}>
                      {p.status}
                    </span>
                    <div className="text-xs text-brand-text font-mono font-bold mt-2 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-brand-muted"/> {p.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="glass-panel p-4 rounded-xl border border-brand-border">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text flex items-center gap-2 border-b border-brand-border pb-2 mb-3">
              <Syringe className="w-4 h-4 text-emerald-500" />
              Vaccine Reminders
            </h3>
            <div className="space-y-2 text-sm">
              <div className="p-2.5 bg-brand-bg border border-brand-border rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-bold text-xs text-brand-text">DTaP (Diphtheria)</div>
                  <div className="text-[9px] text-brand-muted">Lily Anderson (Due)</div>
                </div>
                <button className="p-1.5 bg-brand-card border border-brand-border rounded text-brand-muted hover:text-emerald-500"><CheckCircle className="w-4 h-4"/></button>
              </div>
              <div className="p-2.5 bg-brand-bg border border-brand-border rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-bold text-xs text-brand-text">Polio (IPV)</div>
                  <div className="text-[9px] text-brand-muted">Lily Anderson (Due)</div>
                </div>
                <button className="p-1.5 bg-brand-card border border-brand-border rounded text-brand-muted hover:text-emerald-500"><CheckCircle className="w-4 h-4"/></button>
              </div>
            </div>
          </div>
          
          <div className="bg-pink-500/5 p-4 rounded-xl border border-pink-500/20">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-pink-500 flex items-center gap-2 border-b border-pink-500/20 pb-2 mb-3">
              <Activity className="w-4 h-4" />
              Ward Stats
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-brand-text font-bold"><span>Total Patients</span> <span>18</span></div>
              <div className="flex justify-between text-brand-muted text-xs"><span>Newborns</span> <span>4</span></div>
              <div className="flex justify-between text-brand-muted text-xs"><span>Toddlers</span> <span>9</span></div>
              <div className="flex justify-between text-brand-muted text-xs"><span>Older</span> <span>5</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
