import React, { useState, useEffect } from 'react';
import { Pill, Search, Clock, CheckCircle2, ArrowRight, Truck, MapPin, Package, LogOut, Info } from 'lucide-react';

function PharmacistDashboard({ onNavigate, onLogout }) {
  // Mock Data for Deliveries
  const [deliveries, setDeliveries] = useState([
    {
      id: 1,
      patientName: 'Hannah Lewis',
      mrn: 'MRN-123456',
      medications: [
        { name: 'Amoxicillin 500mg', instructions: '1 capsule, 3 times daily' },
        { name: 'Ibuprofen 400mg', instructions: 'As needed for pain' }
      ],
      location: 'Ward 3B, Bed 12 (Inpatient)',
      status: 'pending',
      priority: 'high',
      timeRequested: '10:15 AM'
    },
    {
      id: 2,
      patientName: 'John Doe',
      mrn: 'MRN-848202',
      medications: [
        { name: 'Lisinopril 10mg', instructions: '1 tablet daily' }
      ],
      location: '123 Main St, Springfield (Outpatient Delivery)',
      status: 'packing',
      priority: 'normal',
      timeRequested: '09:30 AM'
    },
    {
      id: 3,
      patientName: 'Sarah Smith',
      mrn: 'MRN-998822',
      medications: [
        { name: 'Metformin 500mg', instructions: '1 tablet twice daily with meals' }
      ],
      location: 'Ward 1A, Bed 4 (Inpatient)',
      status: 'dispatched',
      priority: 'normal',
      timeRequested: '08:45 AM'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [draggedOrder, setDraggedOrder] = useState(null);

  const updateDeliveryStatus = (id, newStatus) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedOrder) {
      updateDeliveryStatus(draggedOrder, newStatus);
      setDraggedOrder(null);
    }
  };

  const filteredDeliveries = deliveries.filter(d => 
    d.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.medications.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'packing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'dispatched': return 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const renderDeliveryCard = (order) => (
    <div 
      key={order.id} 
      draggable
      onDragStart={() => setDraggedOrder(order.id)}
      className="p-4 bg-brand-bg/50 rounded-2xl border border-brand-border/60 hover:border-brand-teal/40 transition-all shadow-sm cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-brand-text font-black text-sm flex items-center gap-1.5">
            {order.patientName}
            {order.priority === 'high' && (
              <span className="text-[8px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Urgent</span>
            )}
          </h4>
          <span className="text-[10px] text-brand-muted font-mono">{order.mrn}</span>
        </div>
        <span className="text-[10px] flex items-center gap-1 text-brand-muted font-medium">
          <Clock className="w-3 h-3" /> {order.timeRequested}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="bg-brand-card rounded-xl p-3 border border-brand-border/40">
          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center gap-1">
            <Package className="w-3 h-3" /> What to Deliver
          </span>
          <div className="space-y-2">
            {order.medications.map((med, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-xs font-bold text-brand-teal">{med.name}</span>
                <span className="text-[10px] text-brand-muted">{med.instructions}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-card rounded-xl p-3 border border-brand-border/40">
          <span className="text-[9px] font-bold uppercase tracking-wider text-brand-muted mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Where to Deliver
          </span>
          <span className="text-[11px] font-semibold text-brand-text leading-tight block">
            {order.location}
          </span>
        </div>
      </div>

      {/* Action Buttons Removed in favor of Drag & Drop */}
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="bg-brand-card border-b border-brand-border px-4 py-2.5 flex justify-between items-center z-10 sticky top-0">
        <div onClick={() => onNavigate('landing')} className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition">
          <div className="p-1.5 rounded-lg bg-brand-teal/10 border border-brand-teal/20">
            <Pill className="w-5 h-5 text-brand-teal" />
          </div>
          <span className="font-extrabold text-sm sm:text-lg text-brand-text font-display">
            CuraLink <span className="text-brand-teal font-light">Pharmacy</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-brand-bg px-3 py-1.5 rounded-xl border border-brand-border text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-bold text-brand-text">Active Shift</span>
          </div>
          <button onClick={onLogout} className="p-2 text-brand-muted hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20 cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black font-display tracking-tight text-brand-text">Fulfillment & Delivery</h1>
            <p className="text-xs text-brand-muted font-medium mt-1">Manage inpatient medication distribution and outpatient dispatch.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="text" 
              placeholder="Search patients or meds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-card border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-brand-text focus:outline-none focus:border-brand-teal/50 transition-colors"
            />
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
          
          {/* Pending Column */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'pending')}
            className="glass-panel p-4 rounded-3xl border border-brand-border/60 flex flex-col gap-4 min-h-[500px]"
          >
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h2 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 text-amber-500">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                New Orders
              </h2>
              <span className="text-[10px] font-black bg-brand-bg px-2 py-0.5 rounded-md border border-brand-border">
                {filteredDeliveries.filter(d => d.status === 'pending').length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {filteredDeliveries.filter(d => d.status === 'pending').map(renderDeliveryCard)}
              {filteredDeliveries.filter(d => d.status === 'pending').length === 0 && (
                <div className="text-center py-10 text-brand-muted text-xs font-bold border border-dashed border-brand-border/60 rounded-2xl">
                  No pending orders.
                </div>
              )}
            </div>
          </div>

          {/* Packing Column */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'packing')}
            className="glass-panel p-4 rounded-3xl border border-brand-border/60 flex flex-col gap-4 min-h-[500px]"
          >
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h2 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 text-blue-500">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Packing
              </h2>
              <span className="text-[10px] font-black bg-brand-bg px-2 py-0.5 rounded-md border border-brand-border">
                {filteredDeliveries.filter(d => d.status === 'packing').length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {filteredDeliveries.filter(d => d.status === 'packing').map(renderDeliveryCard)}
              {filteredDeliveries.filter(d => d.status === 'packing').length === 0 && (
                <div className="text-center py-10 text-brand-muted text-xs font-bold border border-dashed border-brand-border/60 rounded-2xl">
                  No orders currently packing.
                </div>
              )}
            </div>
          </div>

          {/* Dispatched Column */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, 'dispatched')}
            className="glass-panel p-4 rounded-3xl border border-brand-border/60 flex flex-col gap-4 min-h-[500px]"
          >
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <h2 className="font-black text-sm uppercase tracking-wider flex items-center gap-2 text-emerald-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Dispatched
              </h2>
              <span className="text-[10px] font-black bg-brand-bg px-2 py-0.5 rounded-md border border-brand-border">
                {filteredDeliveries.filter(d => d.status === 'dispatched').length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {filteredDeliveries.filter(d => d.status === 'dispatched').map(renderDeliveryCard)}
              {filteredDeliveries.filter(d => d.status === 'dispatched').length === 0 && (
                <div className="text-center py-10 text-brand-muted text-xs font-bold border border-dashed border-brand-border/60 rounded-2xl">
                  No active dispatches.
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PharmacistDashboard;
