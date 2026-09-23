import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Plus, Check, Sparkles, AlertCircle } from 'lucide-react';

const PRESET_SESSIONS = [
  { id: 'NOV2026', label: 'Session: Nov 2026', startDate: '2026-11-01', endDate: '2027-03-31' },
  { id: 'MAR2027', label: 'Session: Mar 2027', startDate: '2027-03-01', endDate: '2027-07-31' },
  { id: 'SEP2027', label: 'Session: Sept 2027', startDate: '2027-09-01', endDate: '2028-01-31' }
];

export const AddSessionModal = ({ isOpen, onClose }) => {
  const { sessions, addSession } = useApp();
  const [sessionCode, setSessionCode] = useState('');
  const [sessionLabel, setSessionLabel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setSessionCode(preset.id);
    setSessionLabel(preset.label);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanCode = sessionCode.trim().toUpperCase();
    const cleanLabel = sessionLabel.trim();

    if (!cleanCode) {
      setError('Session Code is required (e.g., NOV2026).');
      return;
    }
    if (!cleanLabel) {
      setError('Session Display Label is required (e.g., Session: Nov 2026).');
      return;
    }

    if (sessions?.some(s => s.id.toUpperCase() === cleanCode)) {
      setError(`A session with code "${cleanCode}" already exists.`);
      return;
    }

    const success = addSession({
      id: cleanCode,
      label: cleanLabel,
      startDate,
      endDate
    });

    if (success) {
      // Reset form
      setSessionCode('');
      setSessionLabel('');
      setStartDate('');
      setEndDate('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-[#003DA5] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <h3 className="font-bold text-base">Add New Internship Session</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Sparkles size={12} className="text-[#003DA5]" /> Quick Presets
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SESSIONS.map((preset) => {
                const isExisting = sessions?.some(s => s.id === preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={isExisting}
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition border ${
                      isExisting 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-blue-50 text-[#003DA5] hover:bg-blue-100 border-blue-200'
                    }`}
                  >
                    {preset.id} {isExisting ? '(Exists)' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Session Code */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Session Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
              placeholder="e.g. NOV2026 or MAR2027"
              className="w-full p-2 text-sm bg-white border border-slate-300 rounded font-mono uppercase focus:outline-none focus:border-[#003DA5] text-slate-800"
            />
            <p className="text-xs text-slate-500 mt-0.5">Unique identifier (no spaces, e.g. NOV2026)</p>
          </div>

          {/* Display Label */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Display Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sessionLabel}
              onChange={(e) => setSessionLabel(e.target.value)}
              placeholder="e.g. Session: Nov 2026 or November 2026 Intake"
              className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#003DA5] text-slate-800"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#003DA5] hover:bg-[#002d7a] text-white text-sm font-semibold rounded flex items-center gap-1.5 transition"
            >
              <Plus size={16} />
              <span>Create & Activate Session</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
