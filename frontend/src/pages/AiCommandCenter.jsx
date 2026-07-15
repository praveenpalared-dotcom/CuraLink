import React, { useState } from 'react';
import { 
  Sparkles, TrendingUp, AlertTriangle, ShieldAlert, Cpu, Activity, Clock, Users,
  CheckCircle, ArrowRight, Play, Server, Layers, HelpCircle
} from 'lucide-react';

export default function AiCommandCenter({ onLogout, onNavigate }) {
  // Recommendation state
  const [allocationDone, setAllocationDone] = useState(false);
  const [allocationDone2, setAllocationDone2] = useState(false);

  // SVG Heatmap coordinates representation
  const heatmapData = [
    { id: 'GM', name: 'General Medicine', floor: 'Floor 1, Block A', load: '85%', patients: 24, status: 'red' },
    { id: 'OP', name: 'Ophthalmology', floor: 'Floor 2, Block B', load: '30%', patients: 4, status: 'green' },
    { id: 'PD', name: 'Pediatrics', floor: 'Floor 1, Block C', load: '72%', patients: 14, status: 'amber' },
    { id: 'OR', name: 'Orthopedics', floor: 'Floor 3, Block A', load: '40%', patients: 8, status: 'green' },
    { id: 'CD', name: 'Cardiology', floor: 'Floor 4, Block D', load: '90%', patients: 19, status: 'red' },
    { id: 'DM', name: 'Dermatology', floor: 'Floor 2, Block C', load: '20%', patients: 2, status: 'green' }
  ];

  // SVG boundaries for line chart
  const data = [
    { time: '08:00 AM', patients: 12, predicted: 14 },
    { time: '10:00 AM', patients: 28, predicted: 30 },
    { time: '12:00 PM', patients: 65, predicted: 68 }, // Peak surge
    { time: '02:00 PM', patients: 38, predicted: 42 },
    { time: '04:00 PM', patients: 42, predicted: 45 },
    { time: '06:00 PM', patients: 18, predicted: 20 }
  ];

  const width = 500;
  const height = 150;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxVal = 80;

  // Coordinate mapper
  const pointsActual = data.map((d, i) => ({
    x: paddingLeft + (i / (data.length - 1)) * chartWidth,
    y: paddingTop + chartHeight - (d.patients / maxVal) * chartHeight
  }));

  const pointsPredicted = data.map((d, i) => ({
    x: paddingLeft + (i / (data.length - 1)) * chartWidth,
    y: paddingTop + chartHeight - (d.predicted / maxVal) * chartHeight
  }));

  // Cubic bezier parser
  const getCurvePath = (pts) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const actualPath = getCurvePath(pointsActual);
  const predictedPath = getCurvePath(pointsPredicted);

  return (
    <div className="min-h-screen bg-[#070A13] text-[#F1F5F9] flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* Background neon visual grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 80%)' }} />

      {/* Header bar */}
      <header className="border-b border-[#141F3B] bg-[#0A0F1D]/80 backdrop-blur px-4 py-3 flex justify-between items-center z-10">
        <div onClick={onLogout} className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition">
          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 animate-pulse">
            <Cpu className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-extrabold text-sm sm:text-lg text-white font-display tracking-tight">
            CuraLink
          </span>
          <span className="hidden sm:inline-block text-[9px] bg-red-500/20 text-red-400 font-extrabold px-2 py-0.5 rounded-full border border-red-500/30 ml-2 tracking-widest uppercase">
            Operations Command Center
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block text-right">
            <span className="text-xs font-black block text-[#F1F5F9]">AI System Administrator</span>
            <span className="text-[8px] text-brand-teal font-mono tracking-widest block uppercase">Telemetry Sync Status: Live</span>
          </div>
          <button 
            onClick={() => onNavigate('landing')}
            className="px-2.5 py-1.5 bg-[#121A30] hover:bg-[#1C2849] border border-[#1E2E5A] text-[#F1F5F9] rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Exit <span className="hidden sm:inline">Control Room</span>
          </button>
          <button 
            onClick={onLogout}
            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Grid Dashboard Workspace */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto max-h-[calc(100vh-65px)] z-10">
        
        {/* Row 1: KPI stats stream across top (12 cols) */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#0B1123] border border-[#14234C] p-3 rounded-2xl flex justify-between items-center shadow-lg">
            <div>
              <span className="text-[8px] text-brand-teal uppercase tracking-widest block font-bold font-mono">Predicted Peak Hours</span>
              <strong className="text-lg font-black block mt-1 font-mono">11:30 AM - 01:00 PM</strong>
              <span className="text-[8px] text-slate-400 block mt-0.5">Surge load: 68 patients expected</span>
            </div>
            <div className="p-2 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal font-mono text-xs font-bold">Peak Risk</div>
          </div>

          <div className="bg-[#0B1123] border border-[#14234C] p-3 rounded-2xl flex justify-between items-center shadow-lg">
            <div>
              <span className="text-[8px] text-red-400 uppercase tracking-widest block font-bold font-mono">Active Bottlenecks</span>
              <strong className="text-lg font-black block mt-1 text-red-400 font-mono">
                {allocationDone && allocationDone2 ? '0 CLINICS' : '2 CLINICS'}
              </strong>
              <span className="text-[8px] text-slate-400 block mt-0.5">Cardiology & General Medicine</span>
            </div>
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs font-bold">Alert Red</div>
          </div>

          <div className="bg-[#0B1123] border border-[#14234C] p-3 rounded-2xl flex justify-between items-center shadow-lg">
            <div>
              <span className="text-[8px] text-amber-400 uppercase tracking-widest block font-bold font-mono">Doctor Delay Risk</span>
              <strong className="text-lg font-black block mt-1 text-amber-400 font-mono">HIGH (Dr. Patel)</strong>
              <span className="text-[8px] text-slate-400 block mt-0.5">Slippage forecast: +28 minutes</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold">Delay Advisory</div>
          </div>

          <div className="bg-[#0B1123] border border-[#14234C] p-3 rounded-2xl flex justify-between items-center shadow-lg">
            <div>
              <span className="text-[8px] text-brand-teal uppercase tracking-widest block font-bold font-mono">Staff Strain Index</span>
              <strong className="text-lg font-black block mt-1 font-mono">
                {allocationDone && allocationDone2 ? '54% Optimal' : '82% High Strain'}
              </strong>
              <span className="text-[8px] text-slate-400 block mt-0.5">Float Nurse Pool Exhausted</span>
            </div>
            <div className="p-2 rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-brand-accent font-mono text-xs font-bold">Telemetry</div>
          </div>
        </div>

        {/* Column Left (2/3 width) - Charts & Heatmaps (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* SVG line chart: Surge prediction */}
          <div className="bg-[#0B1123] border border-[#14234C] p-4 rounded-2xl shadow-xl space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-[#141F3B]">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-white font-display flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                Surge Prediction & Flow Telemetry (SVG Actual vs AI Predicted)
              </h3>
              <div className="flex gap-4 text-[9px] font-mono">
                <div className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-brand-accent block" /> Actual Intake</div>
                <div className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-brand-teal block" style={{strokeDasharray: '2 2'}} /> AI Forecast</div>
              </div>
            </div>

            <div className="w-full h-[180px] flex items-center justify-center pt-2">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <g opacity="0.3">
                  {[0, 20, 40, 60, 80].map((val) => {
                    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
                    return (
                      <g key={val}>
                        <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1A2952" strokeWidth="0.5" strokeDasharray="3 3" />
                        <text x={paddingLeft - 6} y={y + 3} textAnchor="end" className="fill-slate-400 text-[8px] font-mono">{val}</text>
                      </g>
                    );
                  })}
                </g>

                {/* Actual path line */}
                <path d={actualPath} fill="none" stroke="var(--brand-accent)" strokeWidth="2" />
                {pointsActual.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="3" className="fill-brand-accent border border-white" />
                ))}

                {/* Predicted path line */}
                <path d={predictedPath} fill="none" stroke="var(--brand-teal)" strokeWidth="1.5" strokeDasharray="3 3" />
                {pointsPredicted.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="2.5" className="fill-brand-teal" />
                ))}

                {/* X labels */}
                {data.map((pt, i) => {
                  const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
                  return (
                    <text key={i} x={x} y={height - 2} textAnchor="middle" className="fill-slate-400 text-[8px] font-mono font-bold">{pt.time.split(' ')[0]}</text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Department Wing Heatmap matrix */}
          <div className="bg-[#0B1123] border border-[#14234C] p-4 rounded-2xl shadow-xl space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-white font-display border-b border-[#141F3B] pb-2">
              Clinical Wings & Heatmap Capacity Loader
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {heatmapData.map((item, i) => {
                // If allocation is complete, resolve the overload status
                let stateColor = item.status;
                let textLoad = item.load;
                let patientsWaiting = item.patients;
                
                if (allocationDone && item.id === 'CD') {
                  stateColor = 'green';
                  textLoad = '40%';
                  patientsWaiting = 8;
                }
                if (allocationDone2 && item.id === 'GM') {
                  stateColor = 'green';
                  textLoad = '35%';
                  patientsWaiting = 10;
                }

                return (
                  <div 
                    key={i} 
                    className={`p-3 rounded-xl border flex flex-col justify-between h-[95px] relative ${
                      stateColor === 'red' ? 'bg-red-500/10 border-red-500/25 text-red-400' :
                      stateColor === 'amber' ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' :
                      'bg-[#10172A] border-[#1E2E5A] text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-[8px] text-slate-400 block font-mono font-bold">{item.floor}</span>
                      <strong className="text-xs block text-white mt-0.5 font-bold font-display">{item.name}</strong>
                    </div>
                    <div className="flex justify-between items-baseline mt-2">
                      <span className="text-xs font-mono font-black">{patientsWaiting} patients waiting</span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                        stateColor === 'red' ? 'bg-red-500 text-white' :
                        stateColor === 'amber' ? 'bg-amber-500 text-white' :
                        'bg-brand-teal/20 text-brand-teal'
                      }`}>
                        {textLoad} Load
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Column Right (1/3 width) - AI Dispatch Recommendations & Risk (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* AI Advisor Dispatch Panel */}
          <div className="bg-[#0B1123] border border-[#14234C] p-4 rounded-2xl shadow-xl space-y-3.5 text-xs">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-white font-display border-b border-[#141F3B] pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              AI Operations Dispatcher
            </h3>

            <div className="space-y-3">
              {/* Recommendation 1 */}
              <div className="p-3 bg-[#111A35] border border-[#1C2B59] rounded-xl space-y-2">
                <span className="text-[8px] text-[#10B981] font-black uppercase tracking-wider block font-mono">Cardiology Wing Overload</span>
                <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                  Cardiology Wing wait times exceeded 35 mins. AI recommends shifting float nurse Jessica Taylor to cardiology.
                </p>
                {allocationDone ? (
                  <div className="text-[10px] text-[#10B981] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Dispatch complete. Telemetry updated.
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setAllocationDone(true);
                      alert("AI Command: Float Nurse Jessica Taylor reassigned to Cardiology. Live wait prediction adjusted from 35m -> 15m.");
                    }}
                    className="w-full py-1.5 bg-[#10B981] text-white font-bold rounded-lg text-[10px] transition hover:bg-[#10B981]/90 cursor-pointer"
                  >
                    Execute Dispatch Command
                  </button>
                )}
              </div>

              {/* Recommendation 2 */}
              <div className="p-3 bg-[#111A35] border border-[#1C2B59] rounded-xl space-y-2">
                <span className="text-[8px] text-[#10B981] font-black uppercase tracking-wider block font-mono">General Medicine backlog</span>
                <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
                  General Medicine wait times exceeded 45 mins. AI recommends shifting float nurse Robert Chen to Gen-Med Room 3.
                </p>
                {allocationDone2 ? (
                  <div className="text-[10px] text-[#10B981] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Dispatch complete. Telemetry updated.
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setAllocationDone2(true);
                      alert("AI Command: Float Nurse Robert Chen reassigned to General Medicine Wing. Backlog mitigated.");
                    }}
                    className="w-full py-1.5 bg-[#10B981] text-white font-bold rounded-lg text-[10px] transition hover:bg-[#10B981]/90 cursor-pointer"
                  >
                    Execute Dispatch Command
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AI Clinical Delay Forecast warnings */}
          <div className="bg-[#0B1123] border border-[#14234C] p-4 rounded-2xl shadow-xl space-y-3.5 text-xs">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-white font-display border-b border-[#141F3B] pb-2">
              Clinician Delay Risk Forecasts
            </h3>

            <div className="space-y-2 font-semibold text-[11px]">
              <div className="p-2.5 bg-[#10172A] border border-[#1E2E5A] rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white block font-bold">Dr. Richard Patel</span>
                  <span className="text-[9px] text-slate-400 block font-mono uppercase">General Medicine</span>
                </div>
                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-black font-mono">
                  HIGH RISK (32m backlog)
                </span>
              </div>

              <div className="p-2.5 bg-[#10172A] border border-[#1E2E5A] rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white block font-bold">Dr. Angela Yu</span>
                  <span className="text-[9px] text-slate-400 block font-mono uppercase">Ophthalmology</span>
                </div>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold font-mono">
                  NOMINAL RISK (0m)
                </span>
              </div>

              <div className="p-2.5 bg-[#10172A] border border-[#1E2E5A] rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-white block font-bold">Dr. Sarah Jenkins</span>
                  <span className="text-[9px] text-slate-400 block font-mono uppercase">Pediatrics</span>
                </div>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold font-mono">
                  NOMINAL RISK (0m)
                </span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
