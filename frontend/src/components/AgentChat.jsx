import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Calendar, Clock, CheckCircle, HelpCircle, X, Terminal, ArrowRight } from 'lucide-react';

export default function AgentChat({ onClose, patientId }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your CuraLink Clinical Assistant. How can I assist you with your schedule or queue operations today?',
      isSystem: true
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickChips = [
    "Find the earliest cardiologist available.",
    "Reschedule my appointment.",
    "Is Dr. Patel available tomorrow?",
    "Show available dermatologists.",
    "Check my current queue status.",
    "Explain symptoms of chest tightness."
  ];

  const handleChipClick = (chipText) => {
    setInput(chipText);
  };

  const handleSend = async (e, textToSend = null) => {
    if (e) e.preventDefault();
    const finalInput = textToSend || input;
    if (!finalInput.trim()) return;

    const userText = finalInput;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/appointments/book-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId || 1,
          message: userText
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: data.message,
          appointment: data.doctor_name ? {
            doctor: data.doctor_name,
            specialty: data.specialty,
            time: new Date(data.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
          } : null
        }]);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: data.detail || 'I encountered an issue processing that. Could you try specifying the department or doctor name?' 
        }]);
      }
    } catch (error) {
      setLoading(false);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'The scheduling mesh connection failed. Please ensure the FastAPI backend is running.' 
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-brand-card text-brand-text">
      {/* Panel Header */}
      <div className="chat-drag-handle p-4 border-b border-brand-border flex items-center justify-between bg-brand-bg/10 cursor-move">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-accent/10 border border-brand-accent/20">
            <Sparkles className="w-5 h-5 text-brand-accent animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-brand-text font-display flex items-center gap-2">
              CuraLink Concierge
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
            </h4>
            <span className="text-[10px] text-brand-muted font-mono uppercase tracking-wider block">Agent Grid Sync</span>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-brand-border/40 rounded-lg text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20 shrink-0">
                <Bot className="w-4 h-4 text-brand-accent" />
              </div>
            )}
            
            <div className="max-w-[85%] flex flex-col gap-2">
              <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                msg.sender === 'user' 
                  ? 'bg-brand-accent text-white border-brand-accent font-medium rounded-tr-none' 
                  : 'bg-brand-bg/50 text-brand-text border-brand-border rounded-tl-none'
              }`}>
                {msg.text}
              </div>

              {/* High-Fidelity Booking Confirmation Card */}
              {msg.appointment && (
                <div className="p-4 bg-brand-teal/5 border border-brand-teal/25 rounded-2xl flex flex-col gap-3 shadow-[0_4px_15px_rgba(13,148,136,0.03)] animate-pulse-slow">
                  <div className="flex items-center gap-1.5 text-brand-teal font-extrabold text-[10px] uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" />
                    Confirmed Reservation
                  </div>
                  <div className="text-xs space-y-2 text-brand-text">
                    <div className="flex items-center gap-2 font-bold">
                      <User className="w-4 h-4 text-brand-muted" />
                      {msg.appointment.doctor}
                    </div>
                    <div className="flex items-center gap-2 font-medium text-brand-muted">
                      <Calendar className="w-4 h-4 text-brand-muted" />
                      {msg.appointment.time}
                    </div>
                    <span className="inline-block px-2.5 py-0.5 bg-brand-teal/15 text-brand-teal text-[9px] font-bold uppercase tracking-wider rounded border border-brand-teal/10">
                      {msg.appointment.specialty} Department
                    </span>
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center shrink-0 border border-brand-accent/30 shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-brand-accent animate-spin" />
            </div>
            <div className="p-3 bg-brand-bg/50 text-brand-muted rounded-2xl rounded-tl-none text-xs border border-brand-border flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-ping" />
              Agent is analyzing schedule database...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Chips */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-brand-border/40 bg-brand-bg/10 space-y-1.5">
          <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-brand-accent" />
            Suggested Quick Inquiries
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip)}
                className="px-2.5 py-1 bg-brand-card hover:bg-brand-accent hover:text-white border border-brand-border rounded-xl text-[10px] font-medium text-brand-muted hover:border-brand-accent transition-all cursor-pointer flex items-center gap-0.5 active:scale-95"
              >
                {chip}
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={(e) => handleSend(e)} className="p-4 border-t border-brand-border bg-brand-card/50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or select a question..."
          className="flex-1 px-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:border-brand-accent text-xs text-brand-text placeholder-brand-muted shadow-inner"
          disabled={loading}
        />
        <button
          type="submit"
          className="p-3 bg-brand-accent text-white rounded-xl hover:bg-brand-accent/80 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center shadow-md active:scale-95"
          disabled={loading || !input.trim()}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
