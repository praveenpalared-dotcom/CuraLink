import React, { useState } from 'react';
import { Activity, Clock, TrendingUp, AlertCircle, Sparkles, Users } from 'lucide-react';

export function PeakHoursChart() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Peak hours data (X: Time, Y: Patients, Label: Details)
  const data = [
    { time: '6 AM', patients: 15, temp: 'Low flow' },
    { time: '9 AM', patients: 38, temp: 'Moderate' },
    { time: '12 PM', patients: 68, temp: 'Peak Flow (AI Predicted)' },
    { time: '3 PM', patients: 42, temp: 'Normalizing' },
    { time: '6 PM', patients: 45, temp: 'Evening Surge' },
    { time: '9 PM', patients: 20, temp: 'Closing down' }
  ];

  // SVG Chart boundaries
  const width = 500;
  const height = 180;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 80;

  // Convert data points to SVG coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.patients / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Generate cubic bezier curve for SVG path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + 2 * (next.x - curr.x) / 3;
      const cpY2 = next.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
  }

  // Path for gradient fill (close path to bottom)
  const fillD = pathD ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z` : '';

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[280px]">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">AI Operation Insights</span>
          <h4 className="text-sm font-bold text-brand-text font-display flex items-center gap-1.5 mt-0.5">
            <TrendingUp className="w-4 h-4 text-brand-accent" />
            AI Predicted Peak Hours
          </h4>
        </div>
        <div className="text-[10px] bg-brand-accent/10 border border-brand-accent/20 px-2 py-0.5 rounded text-brand-accent font-semibold font-mono">
          11 AM - 1 PM Peak
        </div>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 20, 40, 60, 80].map((val) => {
            const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
            return (
              <g key={val}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--brand-border)" strokeWidth="0.75" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 3} textAnchor="end" className="fill-brand-muted text-[9px] font-mono font-medium">{val}</text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={fillD} fill="url(#areaGrad)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="var(--brand-accent)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Horizontal X Axis Labels */}
          {points.map((pt, i) => (
            <text key={i} x={pt.x} y={height - 5} textAnchor="middle" className="fill-brand-muted text-[9px] font-semibold">{pt.time}</text>
          ))}

          {/* Interactive Dots */}
          {points.map((pt, i) => (
            <g key={i}
               onMouseEnter={() => setHoveredIndex(i)}
               onMouseLeave={() => setHoveredIndex(null)}
               className="cursor-pointer"
            >
              {/* Invisible touch target */}
              <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
              {/* Actual point dot */}
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r={hoveredIndex === i ? "6" : "4"} 
                fill={hoveredIndex === i ? "var(--brand-teal)" : "var(--brand-accent)"} 
                stroke="var(--brand-card)" 
                strokeWidth="1.5"
                className="transition-all duration-150"
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-brand-card border border-brand-border p-2.5 rounded-xl shadow-xl text-[10px] pointer-events-none transition-all duration-150 space-y-0.5 z-30"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 75 - 15}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-bold text-brand-text">{points[hoveredIndex].time}</div>
            <div className="text-brand-accent font-extrabold">{points[hoveredIndex].patients} Patients Expected</div>
            <div className="text-brand-muted italic font-medium">{points[hoveredIndex].temp}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function QueueOverviewChart({ queueCount = 23 }) {
  // Hardcoded values to match target Operations mockup
  const checkedIn = 10;
  const waiting = 7;
  const inConsult = 4;
  const completed = 2;
  const total = checkedIn + waiting + inConsult + completed;

  // Donut geometry variables
  const radius = 35;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentages and offsets
  const segments = [
    { label: 'Checked In', count: checkedIn, color: 'var(--brand-accent)' },
    { label: 'Waiting', count: waiting, color: '#f59e0b' },
    { label: 'In Consultation', count: inConsult, color: 'var(--brand-teal)' },
    { label: 'Completed', count: completed, color: '#10b981' }
  ];

  let accumulatedPercent = 0;

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[280px]">
      <div>
        <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Live Intake</span>
        <h4 className="text-sm font-bold text-brand-text font-display flex items-center gap-1.5 mt-0.5">
          <Activity className="w-4 h-4 text-brand-teal" />
          Live Queue Overview
        </h4>
      </div>

      <div className="flex items-center gap-6 my-2">
        {/* SVG Donut */}
        <div className="relative w-[110px] h-[110px] shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--brand-border)" strokeWidth={strokeWidth} />
            {segments.map((seg, i) => {
              const percentage = (seg.count / total) * 100;
              const strokeLength = (percentage / 100) * circumference;
              const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
              accumulatedPercent += percentage;

              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Center text overlay */}
          <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none text-center">
            <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold">Total</span>
            <span className="text-xl font-extrabold text-brand-text leading-none">{queueCount}</span>
            <span className="text-[8px] text-brand-muted font-medium">Patients</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 text-xs">
          {segments.map((seg, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-brand-muted font-medium">{seg.label}</span>
              </div>
              <span className="font-bold text-brand-text font-mono">{seg.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-brand-border/60 pt-3 flex justify-between items-center text-[10px] text-brand-muted font-medium">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-brand-teal" />
          Est. max wait: 20 mins
        </span>
        <span className="text-brand-teal font-semibold">Running Optimal</span>
      </div>
    </div>
  );
}

export function CapacityUtilization({ rate = 82 }) {
  let color = 'bg-brand-teal';
  let textColor = 'text-brand-teal';
  if (rate > 90) {
    color = 'bg-red-500';
    textColor = 'text-red-500';
  } else if (rate > 75) {
    color = 'bg-brand-accent';
    textColor = 'text-brand-accent';
  }

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[120px] lg:h-[135px]">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Real-time Load</span>
          <h4 className="text-sm font-bold text-brand-text font-display mt-0.5">Capacity Utilization</h4>
        </div>
        <span className={`text-xl font-black ${textColor} font-mono`}>{rate}%</span>
      </div>

      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-brand-border rounded-full overflow-hidden relative">
          {/* Target bar */}
          <div className="absolute top-0 bottom-0 left-0 bg-slate-300 dark:bg-slate-700" style={{ width: '75%' }} />
          {/* Active fill */}
          <div className={`absolute top-0 bottom-0 left-0 ${color} rounded-full transition-all duration-500`} style={{ width: `${rate}%` }} />
        </div>
        <div className="flex justify-between text-[8px] text-brand-muted font-mono font-bold uppercase tracking-wider">
          <span>0% Under</span>
          <span>75% Optimal</span>
          <span>100% Limit</span>
        </div>
      </div>
    </div>
  );
}

export function PatientFlowTrendChart() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const data = [
    { day: 'Mon', actual: 180, expected: 170 },
    { day: 'Tue', actual: 210, expected: 190 },
    { day: 'Wed', actual: 195, expected: 200 },
    { day: 'Thu', actual: 246, expected: 230 },
    { day: 'Fri', actual: 220, expected: 240 },
    { day: 'Sat', actual: 140, expected: 150 },
    { day: 'Sun', actual: 95, expected: 100 }
  ];

  const width = 500;
  const height = 180;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxVal = 300;

  const actualPoints = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.actual / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  const expectedPoints = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.expected / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  let actualPath = '';
  let expectedPath = '';
  if (actualPoints.length > 0) {
    actualPath = `M ${actualPoints[0].x} ${actualPoints[0].y}`;
    expectedPath = `M ${expectedPoints[0].x} ${expectedPoints[0].y}`;
    for (let i = 0; i < data.length - 1; i++) {
      const currA = actualPoints[i];
      const nextA = actualPoints[i+1];
      const cpXA1 = currA.x + (nextA.x - currA.x) / 3;
      const cpYA1 = currA.y;
      const cpXA2 = currA.x + 2 * (nextA.x - currA.x) / 3;
      const cpYA2 = nextA.y;
      actualPath += ` C ${cpXA1} ${cpYA1}, ${cpXA2} ${cpYA2}, ${nextA.x} ${nextA.y}`;

      const currE = expectedPoints[i];
      const nextE = expectedPoints[i+1];
      const cpXE1 = currE.x + (nextE.x - currE.x) / 3;
      const cpYE1 = currE.y;
      const cpXE2 = currE.x + 2 * (nextE.x - currE.x) / 3;
      const cpYE2 = nextE.y;
      expectedPath += ` C ${cpXE1} ${cpYE1}, ${cpXE2} ${cpYE2}, ${nextE.x} ${nextE.y}`;
    }
  }

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[280px]">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Flow Metrics</span>
          <h4 className="text-sm font-bold text-brand-text font-display flex items-center gap-1.5 mt-0.5">
            <Activity className="w-4 h-4 text-brand-accent" />
            7-Day Patient Flow Volume
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-bold">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-brand-accent inline-block" />
            <span className="text-brand-text">Actual</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-brand-muted/70 inline-block stroke-dasharray" />
            <span className="text-brand-muted">Expected</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 100, 200, 300].map((val) => {
            const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
            return (
              <g key={val}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--brand-border)" strokeWidth="0.75" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 3} textAnchor="end" className="fill-brand-muted text-[9px] font-mono font-medium">{val}</text>
              </g>
            );
          })}

          {/* Expected Line (Dashed) */}
          <path d={expectedPath} fill="none" stroke="var(--brand-muted)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

          {/* Actual Line */}
          <path d={actualPath} fill="none" stroke="var(--brand-accent)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Horizontal X Axis Labels */}
          {actualPoints.map((pt, i) => (
            <text key={i} x={pt.x} y={height - 5} textAnchor="middle" className="fill-brand-muted text-[9px] font-semibold">{pt.day}</text>
          ))}

          {/* Interactive Dots */}
          {actualPoints.map((pt, i) => (
            <g key={i}
               onMouseEnter={() => setHoveredIndex(i)}
               onMouseLeave={() => setHoveredIndex(null)}
               className="cursor-pointer"
            >
              <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r={hoveredIndex === i ? "6" : "4"} 
                fill={hoveredIndex === i ? "var(--brand-teal)" : "var(--brand-accent)"} 
                stroke="var(--brand-card)" 
                strokeWidth="1.5"
                className="transition-all duration-150"
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-brand-card border border-brand-border p-2.5 rounded-xl shadow-xl text-[10px] pointer-events-none transition-all duration-150 space-y-0.5 z-30"
            style={{
              left: `${(actualPoints[hoveredIndex].x / width) * 100}%`,
              top: `${(actualPoints[hoveredIndex].y / height) * 75 - 15}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-bold text-brand-text">{actualPoints[hoveredIndex].day} Intake</div>
            <div className="text-brand-accent font-extrabold">Actual: {actualPoints[hoveredIndex].actual} patients</div>
            <div className="text-brand-muted font-semibold">Forecast: {actualPoints[hoveredIndex].expected}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function NoShowHeatmap() {
  const [hoveredCell, setHoveredCell] = useState(null);
  
  // Weekday Columns, Time Rows
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const times = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'];

  // Matrix: rate (%)
  const data = [
    [5,  12, 8,  14, 25], // 09:00 AM (Mon - Fri)
    [8,  6,  10, 18, 30], // 11:00 AM
    [12, 15, 7,  22, 42], // 01:00 PM
    [15, 20, 18, 35, 55]  // 03:00 PM
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[280px]">
      <div>
        <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Risk Analysis</span>
        <h4 className="text-sm font-bold text-brand-text font-display flex items-center gap-1.5 mt-0.5">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          No-Show Probability Heatmap
        </h4>
      </div>

      <div className="relative flex-1 mt-3 grid grid-cols-6 gap-2 text-[10px] font-semibold select-none">
        {/* Empty top corner */}
        <div />
        {/* Day headers */}
        {days.map(d => (
          <div key={d} className="text-center font-bold text-brand-muted py-1">{d}</div>
        ))}

        {/* Rows of times and rates */}
        {times.map((t, rowIdx) => (
          <React.Fragment key={t}>
            <div className="flex items-center text-[9px] text-brand-muted font-mono whitespace-nowrap pr-1">{t}</div>
            {days.map((d, colIdx) => {
              const rate = data[rowIdx][colIdx];
              let color = 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
              if (rate > 35) {
                color = 'bg-red-500/20 text-red-500 border border-red-500/30';
              } else if (rate > 15) {
                color = 'bg-amber-500/20 text-amber-600 border border-amber-500/30';
              }

              const isHovered = hoveredCell && hoveredCell.row === rowIdx && hoveredCell.col === colIdx;

              return (
                <div
                  key={d}
                  onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx, rate, day: d, time: t })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`rounded-xl flex items-center justify-center p-2 cursor-pointer transition-all ${color} ${
                    isHovered ? 'scale-108 font-black shadow-md border-brand-accent/50 z-10' : ''
                  }`}
                >
                  {rate}%
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Dynamic tooltip showing under heatmap */}
      <div className="h-7 border-t border-brand-border/60 pt-2 flex items-center justify-between text-[10px] text-brand-muted font-semibold">
        {hoveredCell ? (
          <span className="text-brand-text">
            {hoveredCell.day} {hoveredCell.time} no-show rate: <span className="font-bold text-brand-accent">{hoveredCell.rate}%</span>
          </span>
        ) : (
          <span>Hover over cells to see details</span>
        )}
        <span className="text-[9px] text-brand-teal font-extrabold uppercase bg-brand-teal/10 px-1.5 py-0.5 rounded">
          AI Auto-triage active
        </span>
      </div>
    </div>
  );
}

export function DepartmentEfficiencyChart() {
  const depts = [
    { name: 'General Medicine', avg: 14, target: 15, pct: 93 },
    { name: 'Cardiology', avg: 18, target: 15, pct: 120 },
    { name: 'Orthopedics', avg: 24, target: 20, pct: 120 },
    { name: 'Ophthalmology', avg: 9, target: 15, pct: 60 },
    { name: 'Dermatology', avg: 12, target: 15, pct: 80 }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[280px]">
      <div>
        <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Operational SLA</span>
        <h4 className="text-sm font-bold text-brand-text font-display flex items-center gap-1.5 mt-0.5">
          <Clock className="w-4 h-4 text-brand-teal" />
          Wait Time vs. SLA Targets
        </h4>
      </div>

      <div className="space-y-3 my-2.5 text-[11px] font-semibold">
        {depts.map((d) => {
          const overSla = d.avg > d.target;
          const barColor = overSla ? 'bg-red-500' : 'bg-brand-teal';
          const badgeColor = overSla ? 'text-red-500 bg-red-500/10' : 'text-brand-teal bg-brand-teal/10';

          return (
            <div key={d.name} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-text font-bold">{d.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-brand-muted">Avg Wait: <b className="text-brand-text font-mono">{d.avg}m</b></span>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${badgeColor}`}>
                    Target {d.target}m
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-brand-border rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                  style={{ width: `${Math.min((d.avg / 30) * 100, 100)}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WorkloadDistributionChart() {
  const data = [
    { name: 'General Medicine', allocated: 32, ideal: 36, load: 88, status: 'Optimal' },
    { name: 'Cardiology', allocated: 16, ideal: 16, load: 100, status: 'Optimal' },
    { name: 'Pediatrics', allocated: 8, ideal: 12, load: 66, status: 'Understaffed' },
    { name: 'Orthopedics', allocated: 20, ideal: 16, load: 125, status: 'Overworked' }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-[280px]">
      <div>
        <span className="text-[10px] text-brand-muted font-bold uppercase tracking-wider block">Staff Allocation</span>
        <h4 className="text-sm font-bold text-brand-text font-display flex items-center gap-1.5 mt-0.5">
          <Users className="w-4 h-4 text-brand-accent" />
          Shift Hours Workload Distribution
        </h4>
      </div>

      <div className="space-y-3.5 my-2 text-xs">
        {data.map((d) => {
          let statusColor = 'text-brand-teal bg-brand-teal/10';
          let barColor = 'bg-brand-teal';
          if (d.status === 'Overworked') {
            statusColor = 'text-red-500 bg-red-500/10';
            barColor = 'bg-red-500';
          } else if (d.status === 'Understaffed') {
            statusColor = 'text-amber-500 bg-amber-500/10';
            barColor = 'bg-amber-500';
          }

          return (
            <div key={d.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-brand-text font-bold block">{d.name}</span>
                  <span className="text-[10px] text-brand-muted font-semibold">Allocated: {d.allocated} hrs (Ideal: {d.ideal} hrs)</span>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${statusColor}`}>
                  {d.load}% Load ({d.status})
                </span>
              </div>
              <div className="w-full h-2.5 bg-brand-border rounded-full overflow-hidden relative">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                  style={{ width: `${Math.min(d.load, 100)}%` }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
