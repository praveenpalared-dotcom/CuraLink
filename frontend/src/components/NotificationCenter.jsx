import React, { useState } from 'react';
import { Bell, Check, Search } from 'lucide-react';

const NotificationCenter = ({ notifications, onMarkAsRead, onClearAll }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredNotifications = notifications.filter(n => {
    if (filter !== 'all' && n.category !== filter) return false;
    if (search && !n.message_body.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[600px] w-full max-w-md">
      <div className="p-4 border-b border-gray-200 bg-brand-primary text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center"><Bell className="mr-2 h-5 w-5" /> Smart Notifications</h3>
        <button onClick={onClearAll} className="text-xs bg-white text-brand-primary px-2 py-1 rounded hover:bg-gray-100">Clear All</button>
      </div>
      
      <div className="p-3 border-b border-gray-100 bg-gray-50 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-8 pr-2 py-1 text-sm border rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="text-sm border rounded px-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="clinical_trial">Trials</option>
          <option value="research_update">Research</option>
          <option value="ai_suggestion">AI Suggestions</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No new notifications.</div>
        ) : (
          filteredNotifications.map((notif, idx) => (
            <div key={idx} className={`p-3 rounded border ${notif.is_read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-brand-primary uppercase">{notif.category?.replace('_', ' ') || 'SYSTEM'}</span>
                <span className="text-xs text-gray-400">{new Date(notif.sent_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-800 mb-2">{notif.message_body}</p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2">
                  {notif.action_text && (
                    <button className="bg-brand-secondary text-white text-xs px-3 py-1 rounded hover:bg-opacity-90">
                      {notif.action_text}
                    </button>
                  )}
                  {notif.category === 'clinical_trial' && (
                    <button className="border border-brand-primary text-brand-primary text-xs px-3 py-1 rounded hover:bg-gray-50">
                      View Details
                    </button>
                  )}
                </div>
                {!notif.is_read && (
                  <button onClick={() => onMarkAsRead(notif.id)} className="text-gray-400 hover:text-green-500" title="Mark as Read">
                    <Check className="h-4 w-4" />
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
