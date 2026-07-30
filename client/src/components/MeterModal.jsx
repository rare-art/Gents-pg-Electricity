import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { X, Gauge, Check, AlertCircle } from 'lucide-react';

export const MeterModal = ({ isOpen, onClose, onSuccess, meter = null }) => {
  const [name, setName] = useState('');
  const [linkedRooms, setLinkedRooms] = useState([1, 2]);
  const [lastReading, setLastReading] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (meter) {
      setName(meter.name || '');
      setLinkedRooms(meter.linkedRooms || [1, 2]);
      setLastReading(meter.lastReading || 0);
      setNotes(meter.notes || '');
    } else {
      setName('');
      setLinkedRooms([1, 2]);
      setLastReading(0);
      setNotes('');
    }
  }, [meter, isOpen]);

  if (!isOpen) return null;

  const handleRoomToggle = (roomNum) => {
    setLinkedRooms(prev =>
      prev.includes(roomNum) ? prev.filter(r => r !== roomNum) : [...prev, roomNum]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Meter name is required');
      return;
    }

    setLoading(true);

    try {
      if (meter) {
        await api.updateMeter(meter._id, { name, linkedRooms, lastReading: Number(lastReading), notes });
      } else {
        await api.addMeter({ name, linkedRooms, lastReading: Number(lastReading), notes });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save meter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        
        <div className="bg-gradient-to-r from-emerald-800 to-lime-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                {meter ? 'Edit Sub-Meter' : 'Add New Meter'}
              </h2>
              <p className="text-xs text-emerald-100">Electricity Sub-Meter Configuration</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Meter Name / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Meter 1 (Rooms 1 & 2)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Linked Rooms</label>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4].map(room => {
                const isSelected = linkedRooms.includes(room);
                return (
                  <button
                    key={room}
                    type="button"
                    onClick={() => handleRoomToggle(room)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Room {room}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Current Reading (kWh)</label>
            <input
              type="number"
              step="any"
              required
              value={lastReading}
              onChange={(e) => setLastReading(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notes / Coverage</label>
            <input
              type="text"
              placeholder="e.g. Main meter for ground floor front rooms"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Meter
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
