import React, { useState } from 'react';
import { Bell, Check, Search, Plus, Sparkles } from 'lucide-react';

const NotificationCenter = ({ notifications = [], onMarkAsRead, onClearAll, onAction, onAddNotification, className = "max-w-md" }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredNotifications = notifications.filter(n => {
    if (filter !== 'all' && n.category !== filter) return false;
    if (search && !n.message_body?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={`bg-white dark:bg-brand-card rounded-2xl shadow-xl border border-brand-border border-brand-border overflow-hidden flex flex-col min-h-[550px] w-full ${className}`}>
      <div className="p-4 border-b border-brand-border border-brand-border bg-gradient-to-r from-indigo-600 to-brand-primary text-white flex justify-between items-center">
        <h3 className="font-extrabold text-base flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-200 animate-bounce" /> Smart AI Notifications
        </h3>
        <div className="flex gap-2">
          {onAddNotification && (
            <button 
              onClick={onAddNotification}
              className="text-xs bg-brand-accent/100/30 hover:bg-brand-accent/100/50 text-white font-bold px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> + Simulate Alert
            </button>
          )}
          <button 
            onClick={onClearAll} 
            className="text-xs bg-white/20 hover:bg-white/30 text-white font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="p-3 border-b border-gray-100 border-brand-border bg-gray-50 dark:bg-brand-bg flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search notification messages..." 
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-brand-card border border-brand-border border-brand-border rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="text-xs bg-white dark:bg-brand-card border border-brand-border border-brand-border rounded-xl px-3 py-1.5 text-brand-text font-semibold focus:outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="clinical_trial">Clinical Trials</option>
          <option value="research_update">Research Papers</option>
          <option value="ai_suggestion">AI Suggestions</option>
          <option value="system">System Alerts</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16 space-y-3">
            <Bell className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="font-bold text-sm">No notifications found.</p>
            <p className="text-xs text-gray-400">Select another filter or click "+ Simulate Alert" to generate a test notification.</p>
          </div>
        ) : (
          filteredNotifications.map((notif, idx) => (
            <div 
              key={notif.id || idx} 
              className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                notif.is_read 
                  ? 'bg-gray-50/50 dark:bg-brand-bg/50 border-gray-100 border-brand-border opacity-80' 
                  : 'bg-brand-accent/10/40 dark:bg-brand-accent/20/20 border-indigo-200 dark:border-brand-accent/50'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-black text-brand-accent dark:text-brand-accent uppercase tracking-wider bg-brand-accent/10 dark:bg-brand-accent/20 px-2 py-0.5 rounded">
                  {notif.category?.replace('_', ' ') || 'SYSTEM'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {notif.sent_at ? new Date(notif.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
              <p className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-3 leading-relaxed">
                {notif.message_body}
              </p>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 border-brand-border">
                <div className="flex gap-2">
                  {notif.action_text && (
                    <button 
                      onClick={() => onAction && onAction(notif.action_text, notif)}
                      className="bg-brand-accent hover:opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-sm active:scale-95"
                    >
                      {notif.action_text}
                    </button>
                  )}
                  {notif.category === 'clinical_trial' && !notif.action_text && (
                    <button 
                      onClick={() => onAction && onAction('View Details', notif)}
                      className="border border-brand-accent text-brand-accent dark:text-brand-accent text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-brand-accent/10 dark:hover:bg-brand-accent/20/20 transition cursor-pointer"
                    >
                      View Details
                    </button>
                  )}
                </div>
                {!notif.is_read && onMarkAsRead && (
                  <button 
                    onClick={() => onMarkAsRead(notif.id)} 
                    className="text-gray-400 hover:text-emerald-500 text-xs font-bold flex items-center gap-1 cursor-pointer bg-white dark:bg-brand-card px-2 py-1 rounded border border-brand-border border-brand-border" 
                    title="Mark as Read"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;



