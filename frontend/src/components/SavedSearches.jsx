import React, { useState } from 'react';
import { Bookmark, Bell, Plus, Trash2 } from 'lucide-react';

const SavedSearches = ({ searches, onAddSearch, onDeleteSearch }) => {
  const [newQuery, setNewQuery] = useState('');
  const [newCategory, setNewCategory] = useState('Clinical Trials');

  const handleAdd = () => {
    if (newQuery.trim()) {
      onAddSearch({ query: newQuery, category: newCategory, notify_on_new: true });
      setNewQuery('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-bold text-lg mb-4 flex items-center">
        <Bookmark className="mr-2 h-5 w-5 text-brand-primary" />
        Saved Searches & Watchlist
      </h3>

      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          className="flex-1 border rounded px-3 py-1 text-sm" 
          placeholder="E.g. Breast Cancer Trials"
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
        />
        <select 
          className="border rounded px-3 py-1 text-sm bg-gray-50"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        >
          <option>Clinical Trials</option>
          <option>Research Papers</option>
          <option>Researchers</option>
        </select>
        <button 
          className="bg-brand-primary text-white p-2 rounded hover:bg-opacity-90"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {searches.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No saved searches yet.</p>
        ) : (
          searches.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded bg-gray-50 hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-sm text-gray-800">{s.query}</p>
                <p className="text-xs text-gray-500 flex items-center">
                  {s.category} <span className="mx-2">•</span> 
                  <Bell className="h-3 w-3 mr-1 inline" /> Auto-alert enabled
                </p>
              </div>
              <button 
                onClick={() => onDeleteSearch(s.id)}
                className="text-gray-400 hover:text-red-500"
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
