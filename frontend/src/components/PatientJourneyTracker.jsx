import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, Clock, ArrowRight, Play, AlertCircle } from 'lucide-react';

export default function PatientJourneyTracker({ patientId, isDemoMode = false }) {
  const [journey, setJourney] = useState(null);
  const [events, setEvents] = useState([]);
  const [demoRunning, setDemoRunning] = useState(false);

  const fetchJourney = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/orchestration/patient-journey/${patientId}`);
      if (res.ok) setJourney(await res.json());
      
      const evtRes = await fetch(`http://localhost:8000/api/v1/orchestration/events/${patientId}`);
      if (evtRes.ok) setEvents(await evtRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJourney();
    let interval = null;
    if (demoRunning) {
      interval = setInterval(fetchJourney, 2000);
    }
    return () => clearInterval(interval);
  }, [patientId, demoRunning]);

  const runDemo = async () => {
    setDemoRunning(true);
    const steps = [
      { type: 'PATIENT_REGISTERED', details: 'Patient John Doe registered at Reception.' },
      { type: 'TRIAGE_COMPLETED', details: 'Vitals logged. Priority assigned: HIGH.' },
      { type: 'ROUTED_TO_DEPARTMENT', details: 'Routed to Cardiology. Queue Position #4.', dept_id: 5 },
      { type: 'CONSULTATION_STARTED', details: 'Consultation with Dr. Marcus Vance.' },
      { type: 'DIAGNOSTIC_REQUESTED', details: 'STAT CBC & ECG requested.' },
      { type: 'DIAGNOSTIC_RESULT_AVAILABLE', details: 'CBC results normal, ECG shows minor arrhythmia.' },
      { type: 'PRESCRIPTION_CREATED', details: 'Beta-blockers prescribed.' },
      { type: 'DISCHARGED', details: 'Patient discharged with follow-up in 2 weeks.' }
    ];

    for (let step of steps) {
      try {
        await fetch(`http://localhost:8000/api/v1/orchestration/events/emit?event_type=${step.type}&patient_id=${patientId}&department_id=${step.dept_id || ''}&details=${encodeURIComponent(step.details)}`, {
          method: 'POST'
        });
      } catch (e) {
        console.error(e);
      }
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds between steps
    }
    setDemoRunning(false);
  };

  const STAGES = [
    { key: 'registered', label: 'Registered' },
    { key: 'triage', label: 'Triage Completed' },
    { key: 'waiting', label: 'Queue / Assigned' },
    { key: 'in_consultation', label: 'Consultation' },
    { key: 'diagnostics', label: 'Diagnostics' },
    { key: 'pharmacy', label: 'Pharmacy' },
    { key: 'discharged', label: 'Discharged' }
  ];

  const getCurrentStageIndex = () => {
    if (!journey) return 0;
    const idx = STAGES.findIndex(s => s.key === journey.status);
    return idx === -1 ? 0 : idx;
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6 relative overflow-hidden">
      {isDemoMode && (
        <div className="absolute top-0 left-0 w-full bg-blue-600 text-white text-xs text-center py-1 font-semibold flex items-center justify-center gap-2">
          <AlertCircle size={14} /> DEMO MODE: SIMULATED HOSPITAL ORCHESTRATION DATA
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6 mt-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="text-blue-600" /> Unified Patient Journey (Orchestrated)
        </h3>
        <button 
          onClick={runDemo} 
          disabled={demoRunning}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all font-medium shadow"
        >
          {demoRunning ? <Clock size={16} className="animate-spin" /> : <Play size={16} />}
          {demoRunning ? 'Running AI Orchestration...' : 'Run Patient Journey Demo'}
        </button>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full hidden md:block z-0"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full hidden md:block z-0 transition-all duration-1000" 
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        ></div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            
            return (
              <div key={stage.key} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-md transition-all duration-500
                  ${isCompleted ? 'bg-green-500 text-white scale-100' : 
                    isCurrent ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-100 animate-pulse' : 
                    'bg-white text-gray-400 border-2 border-gray-200'}`}
                >
                  {isCompleted ? <CheckCircle size={20} /> : 
                   isCurrent ? <Activity size={20} /> : 
                   <Clock size={20} />}
                </div>
                <div className={`text-xs font-semibold text-center 
                  ${isCompleted ? 'text-green-600' : 
                    isCurrent ? 'text-blue-700' : 
                    'text-gray-400'}`}
                >
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {events.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">AI Activity Feed</h4>
          <div className="bg-gray-50 rounded border border-gray-100 p-4 max-h-60 overflow-y-auto">
            {events.map(evt => (
              <div key={evt.id} className="flex items-start gap-3 mb-4 last:mb-0">
                <div className="min-w-fit mt-1 text-blue-500">
                  <Activity size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{evt.event_type.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-gray-500">{new Date(evt.timestamp + (evt.timestamp.endsWith('Z') ? '' : 'Z')).toLocaleTimeString()} {evt.details && `- ${evt.details}`}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
