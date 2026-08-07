import React, { useState } from 'react';
import { Bookmark, Bell, Plus, Trash2, Search, ArrowUpRight } from 'lucide-react';

const SavedSearches = ({ searches = [], onAddSearch, onDeleteSearch, onSelectSearch }) => {
  const [newQuery, setNewQuery] = useState('');
  const [newCategory, setNewCategory] = useState('Clinical Trials');

  const handleAdd = () => {
    if (newQuery.trim()) {
      onAddSearch({ query: newQuery.trim(), category: newCategory, notify_on_new: true });
      setNewQuery('');
    }
  };

  return (
    <div className="bg-white dark:bg-brand-card rounded-2xl shadow-xl border border-gray-200 dark:border-brand-border p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-brand-border pb-4">
        <h3 className="font-extrabold text-lg flex items-center gap-2 text-brand-text">
          <Bookmark className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Saved Searches & Research Watchlist
        </h3>
        <span className="text-xs font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full font-bold">
          {searches.length} Active Watchlists
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          className="flex-1 border border-gray-200 dark:border-brand-border rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-brand-bg text-brand-text focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          placeholder="E.g. Breast Cancer Immunotherapy, Diabetes Wearables..."
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <select 
          className="border border-gray-200 dark:border-brand-border rounded-xl px-3 py-2.5 text-xs bg-gray-50 dark:bg-brand-bg text-brand-text font-bold focus:outline-none"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        >
          <option value="Clinical Trials">Clinical Trials</option>
          <option value="Research Papers">Research Papers</option>
          <option value="Researchers">Researchers</option>
        </select>
        <button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" /> Add to Watchlist
        </button>
      </div>

      <div className="space-y-3">
        {searches.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-brand-border rounded-xl">
            <Bookmark className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No saved searches yet.</p>
            <p className="text-xs text-gray-400 mt-1">Add topics above to get automated AI notifications when matching clinical trials or papers are published.</p>
          </div>
        ) : (
          searches.map((s, idx) => (
            <div 
              key={s.id || idx} 
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-brand-border rounded-xl bg-gray-50/60 dark:bg-brand-bg/60 hover:bg-white dark:hover:bg-brand-card hover:shadow-md transition-all group"
            >
              <div className="flex-1 cursor-pointer" onClick={() => onSelectSearch && onSelectSearch(s)}>
                <p className="font-extrabold text-sm text-brand-text group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  {s.query}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center mt-1 font-medium">
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold mr-2">
                    {s.category}
                  </span>
                  <Bell className="h-3 w-3 mr-1 text-emerald-500 inline" /> Auto AI-alert active
                </p>
              </div>
              <button 
                onClick={() => onDeleteSearch(s.id)}
                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                title="Remove from Watchlist"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
