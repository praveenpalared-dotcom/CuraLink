import React, { useState, useEffect } from 'react';
import AgentChat from '../components/AgentChat';
import { 
  Calendar, User, Clock, ChevronLeft, RefreshCw, AlertCircle, CheckCircle, 
  Activity, Star, DollarSign, ArrowRight, ShieldAlert, Award, FileText,
  UserCheck, Download, Printer, CalendarRange, MapPin, Compass, Bot, LogOut,
  Pill, Sparkles, Send, Stethoscope, Heart, Eye, Siren, Volume2, Video, Settings, Upload, Save, Moon, Sun, History
} from 'lucide-react';

export default function PatientDashboard({ onNavigate, userRole, setUserRole, sessionType, patientData, onLogout }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'booking', 'directory', 'queue_status', 'medical_records', 'prescriptions', 'reports', 'teleconsultation', 'emergency'
  const [appointments, setAppointments] = useState([]);
  const [activeQueueItem, setActiveQueueItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Doctors & Departments dynamic state
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // Booking Flow States
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Patient details
  const [patientName, setPatientName] = useState(patientData ? `${patientData.first_name} ${patientData.last_name}` : 'John Doe');
  const [patientMrn, setPatientMrn] = useState(patientData ? patientData.medical_record_number : 'MRN-848202');
  const [patientPhone, setPatientPhone] = useState(patientData ? patientData.phone_number : '+1 555-0199');
  const [patientEmail, setPatientEmail] = useState(patientData ? patientData.email : 'john.doe@gmail.com');
  const [patientDob, setPatientDob] = useState(patientData ? patientData.date_of_birth : '1990-05-12');

  // AI tools state
  const [medicalText, setMedicalText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [dietCondition, setDietCondition] = useState('');
  const [dietSuggestion, setDietSuggestion] = useState('');
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [symptomTriageMsg, setSymptomTriageMsg] = useState('');
  const [triageOutput, setTriageOutput] = useState(null);
  const [loadingTriage, setLoadingTriage] = useState(false);

  // Emergency request state
  const [ambulanceType, setAmbulanceType] = useState('Cardiac ICU');
  const [dispatchAddress, setDispatchAddress] = useState('123 Cyber Way, Cyberabad');
  const [emergencySymptoms, setEmergencySymptoms] = useState('');
  const [emergencyDispatched, setEmergencyDispatched] = useState(false);

  // Settings & History State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileInput, setFileInput] = useState('');
  
  const [pastHistory] = useState([
    { id: 1, date: '2025-11-15', doc: 'Dr. Marcus Vance', diagnosis: 'Acute Bronchitis', type: 'Outpatient' },
    { id: 2, date: '2024-03-22', doc: 'Dr. Sarah Chen', diagnosis: 'Annual Wellness Exam', type: 'Preventive' },
    { id: 3, date: '2022-09-10', doc: 'Dr. Robert King', diagnosis: 'Ankle Sprain (Grade 2)', type: 'Emergency' }
  ]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Doctor list filters
  const [docSearch, setDocSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const timeSlots = [
    { time: "09:00 AM", status: "available" },
    { time: "09:30 AM", status: "available" },
    { time: "10:00 AM", status: "booked" },
    { time: "10:30 AM", status: "available" },
    { time: "11:00 AM", status: "limited" },
    { time: "11:30 AM", status: "available" },
    { time: "01:00 PM", status: "available" },
    { time: "01:30 PM", status: "booked" },
    { time: "02:00 PM", status: "available" },
    { time: "02:30 PM", status: "limited" },
    { time: "03:00 PM", status: "available" },
    { time: "03:30 PM", status: "available" }
  ];

  // Prescriptions mock data
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, drug: 'Lisinopril 10mg', frequency: '1-0-0', dosage: '1 tablet', duration: '30 days', active: true, doctor: 'Dr. Richard Patel' },
    { id: 2, drug: 'Atorvastatin 20mg', frequency: '0-0-1', dosage: '1 tablet', duration: '90 days', active: true, doctor: 'Dr. Marcus Vance' },
    { id: 3, drug: 'Amoxicillin 500mg', frequency: '1-1-1', dosage: '1 capsule', duration: '7 days', active: false, doctor: 'Dr. Richard Patel' }
  ]);

  // Lab reports mock data
  const [labReports, setLabReports] = useState([
    { id: 1, testName: 'Complete Blood Count (CBC)', date: 'June 25, 2026', status: 'Ready', value: 'WBC: 6.8 K/uL, RBC: 4.5 M/uL', notes: 'All hematological parameters within standard physiological range.' },
    { id: 2, testName: 'Lipid Panel', date: 'June 18, 2026', status: 'Ready', value: 'Cholesterol: 195 mg/dL, HDL: 48 mg/dL', notes: 'Borderline elevated total cholesterol. Recommend diet review.' },
    { id: 3, testName: 'Thyroid Panel (TSH, Free T4)', date: 'July 02, 2026', status: 'Pending', value: 'Awaiting lab diagnostics telemetry', notes: 'Expected completion by tomorrow morning.' }
  ]);

  const fetchMetadata = async () => {
    setLoadingMetadata(true);
    try {
      const deptRes = await fetch('/api/v1/appointments/departments');
      const docRes = await fetch('/api/v1/appointments/doctors');
      
      if (deptRes.ok && docRes.ok) {
        const deptData = await deptRes.json();
        const docData = await docRes.json();
 
        const docImages = {
          1: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150&h=150",
          2: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150&h=150",
          3: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150",
          4: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150",
          5: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150&h=150",
          6: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150&h=150"
        };
        const docMetaData = {
          1: { rating: 4.8, exp: 12, fee: 600, gender: 'Male', languages: 'English, Hindi, Gujarati' },
          2: { rating: 4.9, exp: 9, fee: 700, gender: 'Female', languages: 'English, Mandarin' },
          3: { rating: 4.7, exp: 8, fee: 500, gender: 'Female', languages: 'English, Spanish' },
          4: { rating: 4.8, exp: 15, fee: 800, gender: 'Male', languages: 'English, German' },
          5: { rating: 4.9, exp: 18, fee: 950, gender: 'Male', languages: 'English, Spanish' },
          6: { rating: 4.8, exp: 10, fee: 650, gender: 'Female', languages: 'English, Japanese' }
        };
 
        const enrichedDoctors = docData.map(doc => ({
          ...doc,
          photo: docImages[doc.id] || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150&h=150",
          rating: docMetaData[doc.id]?.rating || 4.7,
          exp: docMetaData[doc.id]?.exp || 5,
          fee: docMetaData[doc.id]?.fee || 500,
          gender: docMetaData[doc.id]?.gender || 'Male',
          languages: docMetaData[doc.id]?.languages || 'English'
        }));
 
        setDepartments(deptData);
        setDoctors(enrichedDoctors);
      }
    } catch (e) {
      console.error("Could not fetch departments or doctors lists:", e);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const fetchPatientData = async () => {
    try {
      const apptResponse = await fetch('/api/v1/appointments/');
      if (apptResponse.ok) {
        const apptData = await apptResponse.json();
        const patientId = patientData?.id || 1;
        const patientAppts = apptData.filter(a => a.patient_id === patientId);
        setAppointments(patientAppts.reverse());
      }

      const queueResponse = await fetch('/api/v1/queue/');
      if (queueResponse.ok) {
        const queueData = await queueResponse.json();
        const patientId = patientData?.id || 1;
        const activeUserQueue = queueData.find(q => q.appointment?.patient_id === patientId && !q.completed_time);
        setActiveQueueItem(activeUserQueue || null);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to health database.');
    }
  };

  useEffect(() => {
    fetchMetadata();
    fetchPatientData();
    const interval = setInterval(fetchPatientData, 8000);
    return () => clearInterval(interval);
  }, [patientData]);

  const handleCancelAppointment = async (apptId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`/api/v1/appointments/${apptId}/status?status_str=cancelled`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert("Appointment successfully cancelled.");
        fetchPatientData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinalBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot) {
      alert("Please complete all scheduling steps.");
      return;
    }
    
    setLoading(true);
    try {
      const [time, modifier] = selectedTimeSlot.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
      const startDateTimeStr = `${selectedDate}T${formattedTime}`;
      
      // Calculate end time (30 mins after start)
      let endHours = hours;
      let endMinutes = parseInt(minutes) + 30;
      if (endMinutes >= 60) {
        endMinutes -= 60;
        endHours += 1;
      }
      const formattedEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
      const endDateTimeStr = `${selectedDate}T${formattedEndTime}`;

      const res = await fetch('/api/v1/appointments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientData?.id || 1,
          doctor_id: selectedDoctor.id,
          department_id: selectedDept.id,
          start_time: startDateTimeStr,
          end_time: endDateTimeStr,
          status: 'scheduled',
          chief_complaint: chiefComplaint || 'Routine Checkup'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBookingSuccessData(data);
        setBookingStep(5);
        fetchPatientData();
      } else {
        alert("Appointment time conflict or server rejection. Please choose another slot.");
      }
    } catch (e) {
      console.error(e);
      alert("Database link failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (apptId) => {
    try {
      const res = await fetch(`/api/v1/queue/check-in?appointment_id=${apptId}`, {
        method: 'POST'
      });
      if (res.ok) {
        alert("Check-in successful! Welcome to the clinic lobby. Your real-time position is now logged in queue.");
        fetchPatientData();
        setActiveTab('queue_status');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI explanations
  const handleExplainText = async () => {
    if (!medicalText.trim()) return;
    setLoadingExplain(true);
    try {
      const res = await fetch('/api/v1/appointments/explain-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: medicalText })
      });
      if (res.ok) {
        const data = await res.json();
        setExplanation(data.explanation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleGetDiet = async () => {
    if (!dietCondition.trim()) return;
    setLoadingDiet(true);
    try {
      const res = await fetch('/api/v1/appointments/diet-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition: dietCondition })
      });
      if (res.ok) {
        const data = await res.json();
        setDietSuggestion(data.suggestion);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDiet(false);
    }
  };

  const handleSymptomTriage = async () => {
    if (!symptomTriageMsg.trim()) return;
    setLoadingTriage(true);
    try {
      const res = await fetch('/api/v1/appointments/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: symptomTriageMsg })
      });
      if (res.ok) {
        const data = await res.json();
        setTriageOutput(data);
        // Pre-fill department selection if target match is found
        const match = departments.find(d => d.name.toLowerCase().includes(data.target_department.toLowerCase()));
        if (match) {
          setSelectedDept(match);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTriage(false);
    }
  };

  const handleEmergencyDispatch = (e) => {
    e.preventDefault();
    setEmergencyDispatched(true);
    alert(`CRITICAL EMERGENCY SENT! Dispatching ${ambulanceType} ambulance to ${dispatchAddress} immediately.`);
  };

  // 8 quick actions configurations
  const quickActions = [
    { id: 'booking', label: 'Book Appointment', desc: 'Schedule a physical or virtual slot', icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'directory', label: 'Find Doctor', desc: 'Search specialist directory & reviews', icon: Stethoscope, color: 'text-brand-teal bg-brand-teal/10' },
    { id: 'queue_status', label: 'Check Queue Status', desc: 'Live token telemetry & wait times', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'medical_records', label: 'View Medical Records', desc: 'EHR records & clinical explainer', icon: FileText, color: 'text-purple-500 bg-purple-500/10' },
    { id: 'prescriptions', label: 'View Prescriptions', desc: 'Manage active medications & refills', icon: Pill, color: 'text-indigo-500 bg-indigo-500/10' },
    { id: 'reports', label: 'Download Reports', desc: 'Access diagnostic lab diagnostics', icon: Download, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'teleconsultation', label: 'Teleconsultation', desc: 'Join mock virtual video consult room', icon: Video, color: 'text-cyan-500 bg-cyan-500/10' },
    { id: 'emergency', label: 'Emergency Request', desc: 'Immediate cardiac/trauma ambulance dispatch', icon: Siren, color: 'text-red-500 bg-red-500/10 border-red-500/20' }
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-brand-card border-r border-brand-border flex flex-col shrink-0 z-20 h-screen">
        <div className="p-4 border-b border-brand-border flex items-center gap-2">
          <div className="p-1.5 bg-brand-accent/10 border border-brand-accent/20 rounded-xl">
            <Activity className="w-5 h-5 text-brand-accent animate-pulse" />
          </div>
          <span className="font-extrabold text-lg text-brand-text font-display">
            CuraLink
          </span>
          <span className="text-[9px] bg-brand-accent/10 border border-brand-accent/25 text-brand-accent px-1.5 py-0.5 rounded-full font-bold ml-1">
            PATIENT
          </span>
        </div>
        
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'home' ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' : 'text-brand-muted hover:bg-brand-hover hover:text-brand-text border border-transparent'}`}
          >
            <Compass className="w-4 h-4" /> Dashboard Home
          </button>
          
          {quickActions.map(action => {
            if (action.id === 'home') return null;
            const isEmergency = action.id === 'emergency';
            return (
              <button
                key={action.id}
                onClick={() => {
                  setActiveTab(action.id);
                  if (action.id === 'booking') {
                    setBookingStep(1);
                    setBookingSuccessData(null);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === action.id ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' : 'text-brand-muted hover:bg-brand-hover hover:text-brand-text border border-transparent'} ${isEmergency ? 'text-red-500 hover:text-red-600' : ''}`}
              >
                <action.icon className={`w-4 h-4 ${activeTab === action.id ? (isEmergency ? 'text-red-500' : 'text-brand-accent') : ''} ${isEmergency ? 'animate-pulse' : ''}`} />
                {action.label}
              </button>
            )
          })}
          
          <div className="pt-3 mt-3 border-t border-brand-border">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'settings' ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' : 'text-brand-muted hover:bg-brand-hover hover:text-brand-text border border-transparent'}`}
            >
              <User className="w-4 h-4" /> Settings & History
            </button>
          </div>
        </nav>
        
        <div className="p-4 border-t border-brand-border bg-brand-card">
          <div className="mb-3">
             <span className="text-xs font-black block text-brand-text">{patientName}</span>
             <span className="text-[9px] text-brand-muted font-mono block">MRN: {patientMrn}</span>
          </div>
          {sessionType === 'hospital' ? (
            <button onClick={() => onNavigate('landing')} className="w-full px-2 py-1.5 border border-brand-border text-brand-text hover:bg-brand-hover rounded-xl text-[11px] font-bold transition cursor-pointer">Exit Portal</button>
          ) : (
            <button onClick={onLogout} className="w-full px-2 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-50 hover:text-white rounded-xl text-[11px] font-bold transition cursor-pointer flex justify-center items-center gap-2"><LogOut className="w-3.5 h-3.5" /> Log Out</button>
          )}
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="bg-brand-bg/80 backdrop-blur-md border-b border-brand-border px-4 md:px-6 py-3 flex justify-between items-center shrink-0 z-10 sticky top-0">
          <h2 className="text-lg font-black text-brand-text font-display capitalize flex items-center gap-2">
            {activeTab.replace('_', ' ')}
          </h2>
          <button 
             onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
             className="px-3 py-1.5 bg-brand-teal text-white hover:bg-brand-teal/90 rounded-xl text-[10px] font-extrabold shadow-md shadow-brand-teal/10 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
          >
             <Bot className="w-3.5 h-3.5" /> <span className="hidden sm:inline">AI Copilot</span>
          </button>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5">
          
          {/* Active Queue Banner if patient is checked in */}
          {activeQueueItem && (
            <div className="p-3.5 bg-gradient-to-r from-brand-teal/10 to-brand-accent/5 border border-brand-teal/20 text-brand-text rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs shadow-sm gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-teal/20 rounded-full">
                  <Clock className="w-4 h-4 text-brand-teal animate-spin" />
                </div>
                <div>
                  <span className="block font-bold">You are currently checked in for consultation.</span>
                  <span className="text-[10px] text-brand-muted mt-0.5 block font-mono">
                    Position: <strong className="text-brand-teal font-black">#{activeQueueItem.current_position}</strong> • Est wait: <strong className="text-brand-teal font-black">{activeQueueItem.estimated_wait_minutes} mins</strong>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('queue_status')}
                className="px-3.5 py-1.5 bg-brand-teal text-white rounded-xl hover:bg-brand-teal/95 font-bold text-[10px] cursor-pointer shadow-sm w-full sm:w-auto"
              >
                Track Live Map
              </button>
            </div>
          )}

          {/* Tab: HOME (Modern Premium Dashboard Grid) */}
          {activeTab === 'home' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Hero welcome banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-accent/10 via-brand-teal/5 to-brand-bg border border-brand-accent/15 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl"></div>
                <div className="absolute right-20 -bottom-10 w-32 h-32 bg-brand-teal/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <h1 className="text-2xl md:text-3xl font-black text-brand-text font-display tracking-tight">Good morning, {patientData?.first_name || 'John'}.</h1>
                  <p className="text-xs text-brand-muted mt-1.5 max-w-lg font-semibold leading-relaxed">
                    Your health snapshot is looking good. You have {appointments.filter(a => a.status === 'scheduled').length} upcoming appointments this week.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => { setActiveTab('booking'); setBookingStep(1); }} className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-extrabold cursor-pointer transition shadow-md shadow-brand-accent/10 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Book Appointment</button>
                    <button onClick={() => setActiveTab('medical_records')} className="px-4 py-2 bg-brand-card hover:bg-brand-hover text-brand-text border border-brand-border rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-brand-muted" /> View Records</button>
                  </div>
                </div>
              </div>

              {/* Grid Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Upcoming Appointments Widget (col-span-8) */}
                <div className="md:col-span-8 glass-panel p-5 rounded-2xl border border-brand-border/80 flex flex-col shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text font-display flex items-center gap-1.5">
                      <CalendarRange className="w-4 h-4 text-brand-accent" /> Upcoming Schedule
                    </h3>
                    <button onClick={() => setActiveTab('booking')} className="text-[10px] text-brand-accent font-bold hover:underline cursor-pointer">View All</button>
                  </div>
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
                    {appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').map((appt) => (
                      <div key={appt.id} className="p-3 bg-brand-bg/50 rounded-xl border border-brand-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 group hover:border-brand-accent/40 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent flex flex-col items-center justify-center border border-brand-accent/20 shrink-0">
                            <span className="text-[9px] font-black uppercase">{new Date(appt.start_time).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-sm font-black leading-none mt-0.5">{new Date(appt.start_time).getDate()}</span>
                          </div>
                          <div>
                            <span className="font-bold text-brand-text text-xs flex items-center gap-1.5">
                              Consultation w/ Dr. {appt.doctor?.last_name || 'Unassigned'}
                            </span>
                            <span className="text-[10px] text-brand-muted font-mono mt-0.5 block flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {new Date(appt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <span className="text-[9px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-extrabold border border-amber-500/20 uppercase tracking-wide">
                            {appt.status}
                          </span>
                          <button onClick={() => handleCancelAppointment(appt.id)} className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Cancel">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-brand-muted py-6 border border-dashed border-brand-border rounded-xl bg-brand-bg/30">
                        <Calendar className="w-6 h-6 mb-2 opacity-50" />
                        <span className="text-[11px] font-bold">No upcoming appointments</span>
                        <span className="text-[9px] mt-1">Book one from the navigation menu.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Widgets (col-span-4) */}
                <div className="md:col-span-4 flex flex-col gap-5">
                  {/* Active Prescriptions Mini-Widget */}
                  <div className="glass-panel p-4 rounded-2xl border border-brand-border/80 shadow-sm flex-1">
                    <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-brand-muted font-display flex items-center gap-1.5 mb-3 border-b border-brand-border pb-2">
                      <Pill className="w-3.5 h-3.5" /> Active Medications
                    </h3>
                    <div className="space-y-2">
                      {prescriptions.filter(p => p.active).slice(0, 2).map(p => (
                        <div key={p.id} className="p-2.5 bg-brand-bg rounded-xl border border-brand-border/50">
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-black text-brand-text">{p.drug}</span>
                            <span className="text-[8px] bg-brand-teal/10 text-brand-teal font-extrabold px-1.5 py-0.5 rounded border border-brand-teal/20">{p.frequency}</span>
                          </div>
                          <span className="text-[9px] text-brand-muted font-medium mt-1 block">Take {p.dosage} for {p.duration}</span>
                        </div>
                      ))}
                      <button onClick={() => setActiveTab('prescriptions')} className="w-full mt-1 text-[9px] font-bold text-brand-accent hover:underline py-1">View all medications →</button>
                    </div>
                  </div>

                  {/* AI Diet Recovery Mini-Widget */}
                  <div className="glass-panel p-4 rounded-2xl border border-brand-accent/20 bg-gradient-to-b from-brand-accent/5 to-transparent shadow-sm flex-1 flex flex-col">
                    <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-brand-accent font-display flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5" /> Post-Visit Diet Advisor
                    </h3>
                    <p className="text-[9px] text-brand-muted font-semibold leading-relaxed mb-3">
                      Get AI-curated nutrition advice for fast recovery based on your condition.
                    </p>
                    <div className="flex flex-col gap-2 mt-auto">
                      <input 
                        type="text"
                        placeholder="e.g. Flu, Hypertension..."
                        value={dietCondition}
                        onChange={(e) => setDietCondition(e.target.value)}
                        className="w-full p-2 bg-brand-card border border-brand-border rounded-xl text-[10px] font-semibold focus:outline-none focus:border-brand-accent transition shadow-sm"
                      />
                      <button 
                        onClick={handleGetDiet}
                        disabled={loadingDiet}
                        className="w-full py-1.5 bg-brand-text text-brand-bg hover:bg-brand-muted font-bold rounded-xl text-[10px] cursor-pointer transition active:scale-[0.98] disabled:opacity-50"
                      >
                        {loadingDiet ? 'Generating...' : 'Get Diet Suggestions'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Diet Suggestion Modal/Inline view if active */}
              {dietSuggestion && (
                <div className="p-4 bg-brand-card border border-brand-accent/20 rounded-2xl text-xs font-mono leading-relaxed text-brand-text whitespace-pre-line shadow-lg shadow-brand-accent/5 animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-2 border-b border-brand-border pb-2">
                    <span className="font-bold text-brand-accent flex items-center gap-1.5"><Sparkles className="w-4 h-4"/> AI Diet Suggestion for {dietCondition}</span>
                    <button onClick={() => setDietSuggestion('')} className="p-1 text-brand-muted hover:text-brand-text"><X className="w-4 h-4"/></button>
                  </div>
                  {dietSuggestion}
                </div>
              )}
            </div>
          )}

          {/* Tab: BOOKING (5-Step Manual Booking Form) */}
          {activeTab === 'booking' && (
            <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4 max-w-xl mx-auto text-xs animate-in fade-in duration-200">
              <div className="flex justify-between items-center border-b border-brand-border pb-2">
                <button 
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <span className="text-[10px] text-brand-muted font-black tracking-widest uppercase">Manual Booking Grid</span>
              </div>

              {/* Progress bar steps */}
              <div className="flex items-center justify-between text-[9px] font-black uppercase text-brand-muted pb-1">
                <span className={bookingStep >= 1 ? 'text-brand-accent' : ''}>1. Clinic Triage</span>
                <span className={bookingStep >= 2 ? 'text-brand-accent' : ''}>2. Specialty Select</span>
                <span className={bookingStep >= 3 ? 'text-brand-accent' : ''}>3. Doctor</span>
                <span className={bookingStep >= 4 ? 'text-brand-accent' : ''}>4. Slots</span>
                <span className={bookingStep >= 5 ? 'text-brand-accent' : ''}>5. Done</span>
              </div>

              {/* STEP 1: AI Symptom Triage Analysis (Optional / Fast-track department recommendation) */}
              {bookingStep === 1 && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-brand-accent/5 border border-brand-accent/15 rounded-xl space-y-1">
                    <span className="text-[9px] text-brand-accent font-black uppercase tracking-wider flex items-center gap-1 font-display">
                      <Sparkles className="w-3.5 h-3.5" />
                      Optional AI Triage Fast-Track
                    </span>
                    <p className="text-[10px] text-brand-muted">
                      Type your symptoms below, and our AI will pre-classify the department specialty routing. Or click "Skip to Department Selection" to select manually.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-brand-muted">Describe Symptoms</label>
                    <textarea 
                      rows={3}
                      placeholder="e.g. Chest pain radiating to left arm, shortness of breath..."
                      value={symptomTriageMsg}
                      onChange={(e) => setSymptomTriageMsg(e.target.value)}
                      className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-xs font-semibold leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-between gap-2.5">
                    <button 
                      onClick={() => setBookingStep(2)}
                      type="button"
                      className="px-4 py-2 border border-brand-border text-brand-text rounded-xl font-bold cursor-pointer"
                    >
                      Skip to Department Selection Manual
                    </button>
                    <button 
                      onClick={handleSymptomTriage}
                      type="button"
                      disabled={loadingTriage}
                      className="px-5 py-2 bg-brand-accent text-white hover:bg-brand-accent/90 rounded-xl font-extrabold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      {loadingTriage ? 'Analyzing...' : 'Analyze Symptoms ✨'}
                    </button>
                  </div>

                  {triageOutput && (
                    <div className="p-3 bg-brand-bg rounded-xl border border-brand-border space-y-2 mt-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-brand-text">AI Diagnosis Analysis:</span>
                        <span className={`px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                          triageOutput.triage_category === 'emergency' ? 'bg-red-100 text-red-600' :
                          triageOutput.triage_category === 'urgent' ? 'bg-amber-100 text-amber-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {triageOutput.triage_category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">{triageOutput.pre_visit_instructions}</p>
                      
                      <div className="flex justify-end pt-1 border-t border-brand-border/30">
                        <button 
                          onClick={() => setBookingStep(3)}
                          className="px-3.5 py-1.5 bg-brand-teal text-white text-[10px] font-black rounded-lg hover:bg-brand-teal/90 flex items-center gap-1 cursor-pointer"
                        >
                          Confirm & Route to {triageOutput.target_department} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Department Selection */}
              {bookingStep === 2 && (
                <div className="space-y-3.5">
                  <h3 className="font-bold text-xs text-brand-text font-display">Select Hospital Department Specialty</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {departments.map((dept) => (
                      <div 
                        key={dept.id}
                        onClick={() => {
                          setSelectedDept(dept);
                          setBookingStep(3);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                          selectedDept?.id === dept.id ? 'bg-brand-accent/5 border-brand-accent' : 'bg-brand-card hover:bg-brand-hover border-brand-border/60'
                        }`}
                      >
                        <strong className="block text-brand-text text-xs">{dept.name}</strong>
                        <span className="text-[9px] text-brand-muted font-mono block mt-0.5">{dept.building_floor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Doctor Selection */}
              {bookingStep === 3 && (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xs text-brand-text font-display">Available Clinicians in {selectedDept?.name}</h3>
                    <button onClick={() => setBookingStep(2)} className="text-brand-accent text-[10px] hover:underline cursor-pointer">Change Clinic</button>
                  </div>
                  <div className="space-y-2">
                    {doctors.filter(d => d.department_id === selectedDept?.id).map((doc) => (
                      <div 
                        key={doc.id}
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setBookingStep(4);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                          selectedDoctor?.id === doc.id ? 'bg-brand-accent/5 border-brand-accent' : 'bg-brand-card hover:bg-brand-hover border-brand-border/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={doc.photo} className="w-9 h-9 rounded-full object-cover border" alt="Doctor" />
                          <div>
                            <strong className="text-xs text-brand-text block">Dr. {doc.first_name} {doc.last_name}</strong>
                            <span className="text-[9px] text-brand-muted block font-semibold">{doc.specialty} • {doc.exp} yrs experience</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-amber-500 font-mono block">★ {doc.rating}</span>
                          <span className="text-[9px] text-brand-muted font-mono block">Fee: ${doc.fee}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Date & Time slot Confirm */}
              {bookingStep === 4 && (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center border-b border-brand-border/30 pb-1">
                    <div>
                      <strong className="text-xs text-brand-text block">Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}</strong>
                      <span className="text-[9px] text-brand-muted block">{selectedDept?.name} Specialty</span>
                    </div>
                    <button onClick={() => setBookingStep(3)} className="text-brand-accent text-[10px] hover:underline cursor-pointer">Change Doctor</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-brand-muted block">Select Consultation Date</label>
                      <input 
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl text-center text-xs focus:outline-none font-semibold text-brand-text"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-brand-muted block">Select Consultation Time Slot</label>
                      <select 
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="w-full p-2.5 bg-brand-bg border border-brand-border rounded-xl focus:outline-none text-xs font-semibold text-brand-text"
                      >
                        <option value="">Choose slot...</option>
                        {timeSlots.map((slot, i) => (
                          <option key={i} value={slot.time} disabled={slot.status === 'booked'}>
                            {slot.time} ({slot.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-brand-muted block">Intake Symptoms / Notes</label>
                    <input 
                      type="text"
                      placeholder="Chief complaint details..."
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none text-xs"
                    />
                  </div>

                  <button 
                    onClick={handleFinalBooking}
                    disabled={loading || !selectedDate || !selectedTimeSlot}
                    className="w-full py-2 bg-brand-accent hover:bg-brand-accent/90 text-white font-extrabold rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 active:scale-97 flex items-center justify-center gap-1"
                  >
                    {loading ? 'Processing Schedule...' : 'Confirm Appointment Slot'}
                  </button>
                </div>
              )}

              {/* STEP 5: Success screen */}
              {bookingStep === 5 && bookingSuccessData && (
                <div className="py-6 text-center space-y-4 animate-in zoom-in duration-300">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-full w-fit mx-auto text-emerald-600">
                    <CheckCircle className="w-10 h-10 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-brand-text font-display">Appointment Booking Confirmed!</h3>
                    <p className="text-[10px] text-brand-muted mt-1 leading-relaxed max-w-sm mx-auto">
                      Your consultation with <strong className="text-brand-text">Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}</strong> is scheduled for <strong className="text-brand-text font-mono">{bookingSuccessData.start_time?.replace('T', ' ')}</strong>.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2">
                    <button 
                      onClick={() => setActiveTab('home')}
                      className="px-4 py-2 bg-brand-bg hover:bg-brand-hover border border-brand-border text-brand-text rounded-xl font-bold cursor-pointer"
                    >
                      Return Home
                    </button>
                    <button 
                      onClick={() => handleCheckIn(bookingSuccessData.id)}
                      className="px-4 py-2 bg-brand-teal text-white rounded-xl hover:bg-brand-teal/90 font-black cursor-pointer shadow-md"
                    >
                      Check-in Lobby Queue Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: DIRECTORY (Find Doctor search) */}
          {activeTab === 'directory' && (
            <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4 max-w-2xl mx-auto text-xs animate-in fade-in duration-200">
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold cursor-pointer mb-2">
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-muted" />
                  <input 
                    type="text" 
                    placeholder="Search doctor names or clinical specialties..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-xs font-semibold"
                  />
                </div>
                <select 
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="px-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none font-semibold text-brand-text"
                >
                  <option value="all">All Specialties</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>

              <div className="space-y-3 pt-2 max-h-[380px] overflow-y-auto pr-1">
                {doctors.filter(d => {
                  const matchesSearch = `${d.first_name} ${d.last_name}`.toLowerCase().includes(docSearch.toLowerCase()) || d.specialty.toLowerCase().includes(docSearch.toLowerCase());
                  const matchesSpec = specialtyFilter === 'all' || d.specialty === specialtyFilter;
                  return matchesSearch && matchesSpec;
                }).map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-brand-bg rounded-xl border border-brand-border/60 flex justify-between items-center font-semibold text-xs hover:border-brand-accent transition">
                    <div className="flex items-center gap-3">
                      <img src={doc.photo} className="w-10 h-10 rounded-full object-cover border" alt="Doctor" />
                      <div>
                        <strong className="text-xs text-brand-text block">Dr. {doc.first_name} {doc.last_name}</strong>
                        <span className="text-[10px] text-brand-muted block font-bold">{doc.specialty} • {doc.exp} yrs exp</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Languages: {doc.languages}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <span className="text-amber-500 font-bold font-mono text-[11px] block">★ {doc.rating}</span>
                        <span className="text-[10px] text-brand-muted font-mono block">Fee: ${doc.fee}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedDoctor(doc);
                          const deptMatch = departments.find(d => d.id === doc.department_id);
                          if (deptMatch) setSelectedDept(deptMatch);
                          setBookingStep(4);
                          setActiveTab('booking');
                        }}
                        className="px-3 py-1 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 font-bold text-[10px] cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: QUEUE STATUS (Lobby Queue Tracking) */}
          {activeTab === 'queue_status' && (
            <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4 max-w-md mx-auto text-xs animate-in fade-in duration-200">
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold cursor-pointer mb-2">
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <div className="text-center space-y-4">
                <h3 className="font-extrabold text-sm text-brand-text font-display">Live Queue Telemetry Tracker</h3>
                <p className="text-[10px] text-brand-muted max-w-xs mx-auto leading-relaxed">
                  Below is your real-time waiting slot coordinates. As physicians finalize charts, queue metrics shift down automatically.
                </p>

                {activeQueueItem ? (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <span className="text-[8px] text-blue-700 font-bold block uppercase">Your Token</span>
                      <strong className="text-2xl font-black text-brand-text font-mono mt-1 block">TK-{activeQueueItem.appointment_id}</strong>
                    </div>
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <span className="text-[8px] text-amber-700 font-bold block uppercase">Pos in Line</span>
                      <strong className="text-2xl font-black text-amber-500 font-mono mt-1 block">#{activeQueueItem.current_position}</strong>
                    </div>
                    <div className="p-3 bg-brand-teal/10 border border-brand-teal/20 rounded-xl">
                      <span className="text-[8px] text-brand-teal font-bold block uppercase">Estimated Wait</span>
                      <strong className="text-2xl font-black text-brand-teal font-mono mt-1 block">{activeQueueItem.estimated_wait_minutes}m</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-brand-bg rounded-xl border border-dashed border-brand-border text-brand-muted font-bold text-center">
                    You have no active check-in tokens. To start live queue tracking, select a scheduled appointment and click "Check In Lobby".
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: MEDICAL RECORDS & AI EXPLAINER */}
          {activeTab === 'medical_records' && (
            <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4 max-w-xl mx-auto text-xs animate-in fade-in duration-200">
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold cursor-pointer mb-2">
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* EHR Patient details */}
                <div className="space-y-3.5">
                  <h3 className="font-bold text-xs text-brand-text font-display">Personal Medical Registry</h3>
                  <div className="p-3 bg-brand-bg rounded-xl border space-y-2 text-[11px] font-semibold">
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Allergies:</span>
                      <span className="text-red-500 font-bold">Penicillin (Severe)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Blood Group:</span>
                      <span className="text-brand-text">O Positive</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">MRN:</span>
                      <span className="text-brand-text font-mono font-bold">{patientMrn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">DOB:</span>
                      <span className="text-brand-text">{patientDob}</span>
                    </div>
                  </div>
                </div>

                {/* AI report explainer */}
                <div className="space-y-2.5">
                  <h3 className="font-bold text-xs text-brand-text font-display flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
                    AI Clinical Report Explainer
                  </h3>
                  <p className="text-[10px] text-brand-muted">
                    Paste complex medical terms or confusing report phrases below to translate them into plain English.
                  </p>
                  
                  <textarea 
                    rows={2}
                    placeholder="e.g. idiopathic hypersomnia with elevated ESR levels..."
                    value={medicalText}
                    onChange={(e) => setMedicalText(e.target.value)}
                    className="w-full p-2 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent font-semibold"
                  />
                  <button 
                    onClick={handleExplainText}
                    disabled={loadingExplain || !medicalText.trim()}
                    className="w-full py-1.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {loadingExplain ? 'Explaining...' : 'Explain in Plain English'}
                  </button>

                  {explanation && (
                    <div className="p-2.5 bg-brand-bg rounded-xl border border-brand-border/60 text-[10px] font-medium leading-relaxed font-mono">
                      {explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4 max-w-xl mx-auto text-xs animate-in fade-in duration-200">
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold cursor-pointer mb-2">
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <h3 className="font-bold text-xs text-brand-text font-display border-b border-brand-border pb-1.5">
                Active Medication Refills Registry
              </h3>

              <div className="space-y-2">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="p-3 bg-brand-bg rounded-xl border border-brand-border/60 flex justify-between items-center font-semibold">
                    <div>
                      <strong className="text-xs text-brand-text block">{rx.drug}</strong>
                      <span className="text-[10px] text-brand-muted block">Dosage: {rx.dosage} • Freq: {rx.frequency}</span>
                      <span className="text-[9px] text-slate-400 block font-mono">Issued by: {rx.doctor}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        rx.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {rx.active ? 'Active' : 'Expired'}
                      </span>
                      <span className="text-[8px] text-brand-muted font-mono block mt-1">Duration: {rx.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: REPORTS */}
          {activeTab === 'reports' && (
            <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4 max-w-xl mx-auto text-xs animate-in fade-in duration-200">
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold cursor-pointer mb-2">
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <h3 className="font-bold text-xs text-brand-text font-display border-b border-brand-border pb-1.5">
                Diagnostic Lab Diagnostics Reports
              </h3>

              <div className="space-y-2">
                {labReports.map((rep) => (
                  <div key={rep.id} className="p-3 bg-brand-bg rounded-xl border border-brand-border/60 flex justify-between items-start font-semibold">
                    <div className="space-y-1">
                      <strong className="text-xs text-brand-text block">{rep.testName}</strong>
                      <span className="text-[9px] text-brand-muted block font-mono">Date: {rep.date}</span>
                      <p className="text-[10px] text-slate-300 font-bold font-mono">Values: {rep.value}</p>
                      <p className="text-[9.5px] text-slate-400 font-medium italic">Doc Notes: {rep.notes}</p>
                    </div>

                    <div className="text-right flex flex-col gap-2 shrink-0">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ml-auto w-fit font-mono ${
                        rep.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rep.status}
                      </span>
                      {rep.status === 'Ready' && (
                        <button 
                          onClick={() => alert(`Simulating print command for report document: ${rep.testName}`)}
                          className="px-2 py-1 bg-brand-card hover:bg-brand-hover border border-brand-border rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer shadow-sm ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: TELECONSULTATION */}
          {activeTab === 'teleconsultation' && (
            <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4 max-w-2xl mx-auto text-xs animate-in fade-in duration-200">
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-1 text-brand-muted hover:text-brand-text font-bold cursor-pointer mb-2">
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Video feed container */}
                <div className="md:col-span-8 bg-[#090D1A] rounded-2xl border border-[#1E2E5A] h-[250px] relative overflow-hidden flex flex-col justify-center items-center">
                  <div className="absolute top-3 left-3 bg-red-600/80 px-2 py-0.5 rounded text-[8px] font-black uppercase text-white animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE TELECONSULT
                  </div>

                  <Video className="w-12 h-12 text-[#1E2E5A]" />
                  <span className="text-[10px] text-slate-500 font-bold block mt-2">Connecting with Physician Video Stream...</span>

                  {/* HUD Diagnostics overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between bg-black/40 p-2 rounded-xl border border-white/10 text-[9px] font-mono text-white">
                    <span>Pulse: 72 bpm (Normal)</span>
                    <span>Respiration: 16 rpm</span>
                    <span>Uplink Quality: 98%</span>
                  </div>
                </div>

                {/* Consultation checklist */}
                <div className="md:col-span-4 space-y-3.5">
                  <h4 className="font-extrabold text-xs text-brand-text font-display">Virtual Clinic details</h4>
                  <div className="p-3 bg-brand-bg rounded-xl border border-brand-border/60 space-y-1.5 leading-relaxed font-semibold">
                    <span className="text-brand-muted text-[10px] block">Assigned Doctor:</span>
                    <strong className="text-brand-text block text-xs">Dr. Richard Patel</strong>
                    <span className="text-[9.5px] text-slate-400 font-mono block">Specialty: General Medicine</span>
                    <span className="text-[9px] text-[#10B981] font-bold block mt-1">Status: Doctor Online</span>
                  </div>

                  <button 
                    onClick={() => alert("Simulating launch virtual telehealth camera...")}
                    className="w-full py-2 bg-brand-teal text-white hover:bg-brand-teal/90 rounded-xl font-extrabold shadow-md shadow-brand-teal/10 active:scale-97 cursor-pointer text-center"
                  >
                    Start Telehealth Camera
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: EMERGENCY */}
          {activeTab === 'emergency' && (
            <div className="glass-panel p-5 rounded-2xl border border-red-500/25 bg-red-500/5 space-y-4 max-w-md mx-auto text-xs animate-in fade-in duration-200">
              <button 
                onClick={() => setActiveTab('home')} 
                className="flex items-center gap-1 text-red-700 hover:text-red-800 font-bold cursor-pointer mb-2"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-red-500/15">
                <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse animate-bounce" />
                <h3 className="font-black text-sm text-red-700 font-display uppercase tracking-wider">Trauma & Ambulance EOC Dispatch</h3>
              </div>

              {emergencyDispatched ? (
                <div className="py-6 text-center space-y-4 animate-in zoom-in duration-300">
                  <div className="p-3.5 bg-red-500 text-white rounded-full w-fit mx-auto animate-pulse">
                    <Siren className="w-10 h-10 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-red-600 uppercase">Ambulance Dispatched!</h4>
                    <p className="text-[10px] text-brand-muted mt-1.5 leading-relaxed max-w-xs mx-auto">
                      A **{ambulanceType}** vehicle is en route to **{dispatchAddress}**. ETA is currently **6 minutes**. Emergency response coordinates logged in hospital EOC room.
                    </p>
                  </div>
                  <button 
                    onClick={() => setEmergencyDispatched(false)}
                    className="px-4 py-1.5 border border-red-500/30 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition font-bold"
                  >
                    Cancel Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmergencyDispatch} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="font-black text-red-700 block uppercase">Select Emergency Vehicle Type</label>
                    <select 
                      value={ambulanceType}
                      onChange={(e) => setAmbulanceType(e.target.value)}
                      className="w-full p-2 bg-brand-card border border-red-500/25 rounded-xl font-bold focus:outline-none text-brand-text"
                    >
                      <option value="Basic Life Support (BLS)">Basic Life Support (BLS) - Non-ICU</option>
                      <option value="Advanced Life Support (ALS)">Advanced Life Support (ALS) - ICU Paramedic</option>
                      <option value="Cardiac ICU Unit">Cardiac ICU Care Ambulance</option>
                      <option value="Neonatal ICU Unit">Neonatal NICU Care Ambulance</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-red-700 block uppercase">Dispatch GPS/Street Address</label>
                    <input 
                      type="text"
                      required
                      value={dispatchAddress}
                      onChange={(e) => setDispatchAddress(e.target.value)}
                      className="w-full p-2 bg-brand-card border border-red-500/25 rounded-xl focus:outline-none font-bold text-brand-text font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-red-700 block uppercase">Presenting Critical Symptoms</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Sudden chest constriction, loss of consciousness..."
                      value={emergencySymptoms}
                      onChange={(e) => setEmergencySymptoms(e.target.value)}
                      className="w-full p-2 bg-brand-card border border-red-500/25 rounded-xl focus:outline-none font-semibold text-brand-text"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg shadow-red-500/20 transition active:scale-97 text-center uppercase tracking-wider cursor-pointer"
                  >
                    DISPATCH AMBULANCE IMMEDIATELY
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab: SETTINGS & HISTORY */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-10">
              <div className="flex items-center gap-3 pb-3 border-b border-brand-border">
                <div className="p-2 bg-brand-accent/10 rounded-xl text-brand-accent">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-brand-text font-display">Settings & History</h1>
                  <p className="text-[11px] text-brand-muted font-medium mt-0.5">Manage preferences, view past medical history, and upload documents.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Preferences */}
                <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text font-display flex items-center gap-1.5 border-b border-brand-border pb-2">
                    <Compass className="w-4 h-4 text-brand-accent" /> Preferences
                  </h3>
                  
                  <div className="flex justify-between items-center p-3 bg-brand-bg rounded-xl border border-brand-border/50">
                    <div>
                      <span className="font-bold text-brand-text block text-xs">App Theme</span>
                      <span className="text-[10px] text-brand-muted">Switch between light and dark mode.</span>
                    </div>
                    <button 
                      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                      className="px-3 py-1.5 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/20 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                    >
                      {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                  </div>
                </div>

                {/* File Uploads */}
                <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text font-display flex items-center gap-1.5 border-b border-brand-border pb-2">
                    <Upload className="w-4 h-4 text-brand-accent" /> Upload Documents
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="File name (e.g. Previous MRI Scan)"
                        value={fileInput}
                        onChange={(e) => setFileInput(e.target.value)}
                        className="flex-1 p-2 bg-brand-bg border border-brand-border rounded-xl text-xs focus:outline-none"
                      />
                      <button 
                        onClick={() => {
                          if(fileInput.trim()) {
                            setUploadedFiles([...uploadedFiles, { id: Date.now(), name: fileInput, date: new Date().toISOString().split('T')[0] }]);
                            setFileInput('');
                          }
                        }}
                        className="px-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-xl text-xs cursor-pointer active:scale-97 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>

                    {uploadedFiles.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        {uploadedFiles.map(f => (
                          <div key={f.id} className="flex justify-between items-center p-2.5 bg-brand-bg/50 border border-brand-border/40 rounded-xl text-[10px]">
                            <span className="font-bold text-brand-text flex items-center gap-1.5"><FileText className="w-3 h-3 text-brand-muted" /> {f.name}</span>
                            <span className="text-brand-muted font-mono">{f.date}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-brand-muted italic py-2 text-center bg-brand-bg/30 rounded-xl border border-dashed border-brand-border/50">
                        No files uploaded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Past History */}
                <div className="md:col-span-2 glass-panel p-5 rounded-2xl border border-brand-border/60 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-brand-text font-display flex items-center gap-1.5 border-b border-brand-border pb-2">
                    <History className="w-4 h-4 text-brand-accent" /> Past Medical History
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-border/80 text-[10px] text-brand-muted font-black uppercase tracking-wider">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Diagnosis</th>
                          <th className="py-2.5 px-3">Physician</th>
                          <th className="py-2.5 px-3">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastHistory.map(record => (
                          <tr key={record.id} className="border-b border-brand-border/40 hover:bg-brand-bg/50 transition">
                            <td className="py-2.5 px-3 text-xs font-mono text-brand-muted">{record.date}</td>
                            <td className="py-2.5 px-3 text-xs font-bold text-brand-text">{record.diagnosis}</td>
                            <td className="py-2.5 px-3 text-[11px] font-semibold text-brand-text">{record.doc}</td>
                            <td className="py-2.5 px-3 text-[10px]"><span className="px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal font-extrabold border border-brand-teal/20">{record.type}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Optional Floating/Sliding AI Chat Concierge Sidebar */}
        {isAiPanelOpen && (
          <div className="w-full sm:w-[380px] bg-brand-card border-l border-brand-border h-full sm:h-[calc(100vh-60px)] shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-300 fixed sm:relative right-0 top-0 sm:top-auto">
            <AgentChat 
              onClose={() => setIsAiPanelOpen(false)}
              patientId={patientData?.id || 1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
