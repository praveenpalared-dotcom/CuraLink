import React, { useState } from 'react';
import { TestTube, FlaskConical, CheckCircle2, Clock, Search, Filter, AlertTriangle } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

export default function LabTechnicianDashboard({ user, onLogout, onNavigate }) {
  const [labTests, setLabTests] = useState([
    { id: 'LAB-1021', patient: 'Tom Johnson', test: 'Complete Blood Count (CBC)', urgency: 'STAT', status: 'Processing', time: '10 mins ago', dept: 'Trauma' },
    { id: 'LAB-1022', patient: 'Jane Smith', test: 'Lipid Panel', urgency: 'Routine', status: 'Pending', time: '2 hrs ago', dept: 'General Medicine' },
    { id: 'LAB-1023', patient: 'David Kim', test: 'Comprehensive Metabolic Panel', urgency: 'Urgent', status: 'Completed', time: '5 hrs ago', dept: 'Orthopedics' },
    { id: 'LAB-1024', patient: 'Sarah Jenkins', test: 'Urinalysis', urgency: 'STAT', status: 'Pending', time: '15 mins ago', dept: 'Maternity' }
  ]);

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Processing') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  };

  const getUrgencyColor = (urgency) => {
    if (urgency === 'STAT') return 'text-red-500 bg-red-500/10 border-red-500/20 font-black animate-pulse';
    if (urgency === 'Urgent') return 'text-amber-500 bg-amber-500/10 border-amber-500/20 font-bold';
    return 'text-brand-muted bg-brand-bg border-brand-border';
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="bg-brand-card border-b border-brand-border px-4 py-2.5 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-extrabold text-lg text-brand-text font-display tracking-wide">
            PATHOLOGY LAB
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell userType="staff" userId={1} />
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-brand-text">{user?.name || "Marcus Vance"}</span>
            <span className="text-[9px] text-indigo-400 font-bold block uppercase tracking-wider">Lead Technician</span>
          </div>
          <button 
            onClick={onLogout}
            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-brand-border flex items-center gap-4">
            <div className="p-3 rounded-full bg-brand-bg border border-brand-border">
              <TestTube className="w-6 h-6 text-brand-text" />
            </div>
            <div>
              <div className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Total Pending</div>
              <div className="text-2xl font-black text-brand-text font-mono">24</div>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-red-500/20 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider">STAT Requests</div>
              <div className="text-2xl font-black text-red-500 font-mono">2</div>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-blue-500/20 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Processing</div>
              <div className="text-2xl font-black text-blue-500 font-mono">8</div>
            </div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Completed Today</div>
              <div className="text-2xl font-black text-emerald-500 font-mono">142</div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-brand-border overflow-hidden">
          <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-card/50">
            <h2 className="font-black text-brand-text flex items-center gap-2"><TestTube className="w-5 h-5 text-indigo-400"/> Active Test Queue</h2>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg">
                <Search className="w-3.5 h-3.5 text-brand-muted" />
                <input type="text" placeholder="Search Patient or ID..." className="bg-transparent text-xs font-semibold focus:outline-none text-brand-text" />
              </div>
              <button className="px-3 py-1.5 bg-brand-bg border border-brand-border text-brand-text rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-brand-card transition">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/50">
                  <th className="p-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">Req ID</th>
                  <th className="p-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">Patient / Dept</th>
                  <th className="p-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">Test Name</th>
                  <th className="p-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">Urgency</th>
                  <th className="p-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">Time</th>
                  <th className="p-3 text-[10px] font-black uppercase text-brand-muted tracking-wider">Status</th>
                  <th className="p-3 text-[10px] font-black uppercase text-brand-muted tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {labTests.map(test => (
                  <tr key={test.id} className="border-b border-brand-border/40 hover:bg-brand-bg/50 transition-colors">
                    <td className="p-3 text-xs font-black text-brand-text font-mono">{test.id}</td>
                    <td className="p-3">
                      <div className="text-xs font-bold text-brand-text">{test.patient}</div>
                      <div className="text-[10px] text-brand-muted">{test.dept}</div>
                    </td>
                    <td className="p-3 text-xs font-semibold text-brand-text">{test.test}</td>
                    <td className="p-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded uppercase ${getUrgencyColor(test.urgency)}`}>
                        {test.urgency}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-mono text-brand-muted">{test.time}</td>
                    <td className="p-3">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {test.status === 'Completed' ? (
                        <button className="px-3 py-1 bg-brand-bg border border-brand-border text-brand-muted rounded-md text-[10px] font-bold">View</button>
                      ) : (
                        <button className="px-3 py-1 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 rounded-md text-[10px] font-bold transition">
                          {test.status === 'Pending' ? 'Start Processing' : 'Enter Results'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
