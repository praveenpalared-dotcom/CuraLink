import React, { useState, useEffect } from 'react';
import { Droplet, Activity, AlertCircle, CheckCircle, Search, RefreshCw } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

export default function BloodBankDashboard({ user, onLogout, onNavigate }) {
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);

  const fetchData = async () => {
    try {
      const invRes = await fetch('http://localhost:8000/api/v1/blood-bank/inventory');
      const reqRes = await fetch('http://localhost:8000/api/v1/blood-bank/requests');
      if (invRes.ok) setInventory(await invRes.json());
      if (reqRes.ok) {
        const reqs = await reqRes.json();
        setRequests(reqs.filter(r => r.status === 'requested'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatch = async (req) => {
    try {
      const invItem = inventory.find(i => i.blood_group === req.blood_group);
      if (invItem) {
        await fetch(`http://localhost:8000/api/v1/blood-bank/inventory/${invItem.id}/dispatch?units=${req.units_required}`, { method: 'PUT' });
      }
      await fetch(`http://localhost:8000/api/v1/blood-bank/requests/${req.id}/status?status=dispatched`, { method: 'PUT' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Critical') return 'text-red-500 bg-red-500/20 border-red-500/30';
    if (status === 'Low') return 'text-amber-500 bg-amber-500/20 border-amber-500/30';
    return 'text-emerald-500 bg-emerald-500/20 border-emerald-500/30';
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="bg-brand-card border-b border-brand-border px-4 py-2.5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center">
            <Droplet className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-extrabold text-lg text-brand-text font-display tracking-wide">
            BLOOD BANK HUB
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell userType="staff" userId={1} />
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-brand-text">{user?.name || "Dr. Admin"}</span>
            <span className="text-[9px] text-red-400 font-bold block uppercase tracking-wider">Blood Bank Manager</span>
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
        
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-brand-border space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text flex items-center justify-between border-b border-brand-border pb-2">
              <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-brand-accent" /> Live Blood Inventory</div>
              <button onClick={fetchData} className="flex items-center gap-1 text-[9px] text-brand-muted hover:text-brand-text transition cursor-pointer"><RefreshCw className="w-3 h-3"/> Refresh</button>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {inventory.map((item, i) => (
                <div key={i} className="p-3 bg-brand-bg rounded-xl border border-brand-border flex flex-col justify-between items-center text-center">
                  <span className="text-3xl font-black text-red-500 font-display">{item.blood_group}</span>
                  <div className="mt-2 space-y-1 w-full">
                    <span className="block text-lg font-mono font-bold text-brand-text">{item.units_available} <span className="text-[10px] text-brand-muted uppercase">units</span></span>
                    <span className={`block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel h-full p-4 rounded-xl border border-brand-border flex flex-col">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text flex items-center justify-between border-b border-brand-border pb-2 mb-3">
              <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" /> Urgent Requests</div>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {requests.map(req => (
                <div key={req.id} className="p-3 bg-brand-bg rounded-xl border border-brand-border/60 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-brand-text text-sm">{req.id}</span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${req.urgency.includes('Code Red') ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' : 'bg-amber-500/20 text-amber-500 border-amber-500/30'}`}>
                      {req.urgency}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] text-brand-muted space-y-0.5">
                      <div>Dept: <span className="text-brand-text font-bold">General</span></div>
                      <div>Patient: <span className="text-brand-text font-bold">{req.patient_name}</span></div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-brand-muted uppercase block">Required</span>
                      <span className="font-mono font-black text-red-500 text-base">{req.units_required}x <span className="text-white">{req.blood_group}</span></span>
                    </div>
                  </div>
                  
                  <button onClick={() => handleDispatch(req)} className="w-full mt-1 py-1.5 bg-brand-card hover:bg-brand-hover border border-brand-border rounded-lg text-[10px] font-bold text-brand-text transition flex items-center justify-center gap-1 cursor-pointer">
                    <CheckCircle className="w-3 h-3"/> Dispatch Units
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
