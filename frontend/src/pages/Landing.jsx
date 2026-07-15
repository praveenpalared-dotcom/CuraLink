import React from 'react';
import { Sparkles, Calendar, Activity, Shield, Users, ArrowRight, HeartPulse, UserCog, Stethoscope, UserCheck, LayoutDashboard, Cpu } from 'lucide-react';

export default function Landing({ onNavigate, onSelectRole, sessionType, onLogout }) {
  const roles = [

    {
      id: 'doctor',
      title: 'Doctor Portal',
      description: 'Review daily schedule, patient histories, EHR vital logs, write prescriptions and get AI advisories.',
      icon: Stethoscope,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      actionText: 'Enter Clinician Portal'
    },
    {
      id: 'nurse',
      title: 'Nurse Portal',
      description: 'Log patient intake vital parameters, evaluate telemetry, and assign priority triage codes.',
      icon: UserCheck,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      actionText: 'Enter Triage Portal'
    },
    {
      id: 'receptionist',
      title: 'Reception Desk',
      description: 'Quick-register walk-in intakes, query doctor availability, and triage reschedule requests.',
      icon: Users,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      actionText: 'Enter Admissions Desk'
    },
    {
      id: 'admin',
      title: 'Operations Admin',
      description: 'Monitor live queue volumes, manage bed occupancies (ICU/Ward), and audit NPS sentiments.',
      icon: UserCog,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      actionText: 'Enter Control Room'
    },
    {
      id: 'command_center',
      title: 'AI Command Center',
      description: 'Monitor predicted patient surge telemetry, wing overcrowding heatmaps, and doctor delay risks.',
      icon: Cpu,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      actionText: 'Enter Command Room'
    }
  ];

  // Since patient is removed from roles, all roles in Landing are hospital staff roles
  const visibleRoles = roles;

  return (
    <div className="min-h-screen bg-[#070A13] text-[#F1F5F9] relative overflow-hidden flex flex-col justify-between selection:bg-brand-teal selection:text-white">
      {/* Background Decorative Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-brand-teal/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Header navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div onClick={onLogout} className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition">
          <div className="p-2 rounded-xl bg-brand-teal/10 border border-brand-teal/20 animate-pulse">
            <Activity className="w-6 h-6 text-brand-teal" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white font-display">
            CuraLink
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-[10px] tracking-widest text-brand-teal font-mono bg-brand-teal/10 px-3.5 py-1.5 rounded-full border border-brand-teal/20 shadow-[0_2px_8px_rgba(13,148,136,0.05)]">
            Clinical Operations Platform
          </span>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 border border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-97"
            >
              Log Out
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-10 flex-1 flex flex-col justify-center items-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-teal/10 border border-brand-teal/25 rounded-full text-brand-teal text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-brand-teal animate-pulse" />
          CuraLink Clinical Operations
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white max-w-5xl leading-[1.15] font-display text-center">
          "Wherever the art of Medicine is loved, <br />
          <span className="text-gradient-cyan-mint">there is also a love of Humanity."</span>
        </h1>
        
        <div className="max-w-2xl mt-5 text-center space-y-2">
          <p className="text-brand-teal text-xs md:text-sm font-bold italic">
            — Hippocrates (460 BC – 370 BC)
          </p>
          <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed">
            Welcome to the CuraLink Hospital Operations Control Room. Synchronizing clinical scheduling, live wait queues, and nurse workforce allocations automatically.
          </p>
        </div>

        {/* Role Portal Selection Grid */}
        <div className={`grid grid-cols-1 ${sessionType === 'hospital' ? 'md:grid-cols-5 max-w-6xl' : 'md:grid-cols-6 w-full max-w-7xl'} gap-4 mt-12 px-4`}>
          {visibleRoles.map((role) => {
            const IconComponent = role.icon;
            return (
              <div 
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className="bg-[#0B1123] border border-[#14234C] p-5 rounded-2xl text-left hover:border-brand-teal hover:bg-[#111A35] group cursor-pointer flex flex-col justify-between h-[250px] shadow-lg transition duration-200"
              >
                <div>
                  <div className={`p-3 border rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform ${role.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-white font-display flex items-center justify-between">
                    {role.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-semibold">
                    {role.description}
                  </p>
                </div>
                
                <div className="text-[10px] text-brand-teal font-bold uppercase tracking-wider mt-4 flex items-center gap-1 group-hover:underline">
                  {role.actionText}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 text-center text-xs text-slate-500 border-t border-[#141F3B]/50 z-10 font-semibold">
        CuraLink Operational Dashboard — Hospital & Clinic Queue Engine.
      </footer>
    </div>
  );
}
