import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { X, User, Phone, Home, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResidentModal = ({ isOpen, onClose, onSuccess, resident = null }) => {
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState(1);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resident) {
      setName(resident.name || '');
      setRoomNumber(resident.roomNumber || 1);
      setPhone(resident.phone || '');
      setStatus(resident.status || 'Active');
    } else {
      setName('');
      setRoomNumber(1);
      setPhone('');
      setStatus('Active');
    }
  }, [resident, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Resident name is required');
      return;
    }

    setLoading(true);

    try {
      if (resident) {
        await api.updateResident(resident._id, { name, roomNumber: Number(roomNumber), phone, status });
      } else {
        await api.addResident({ name, roomNumber: Number(roomNumber), phone, status });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save resident');
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
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                {resident ? 'Edit Resident Details' : 'Add New Resident'}
              </h2>
              <p className="text-xs text-emerald-100">PG Resident Information & Room Mapping</p>
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
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Resident Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Room Number</label>
              <div className="relative">
                <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white"
                >
                  <option value={1}>Room 1 (GF)</option>
                  <option value={2}>Room 2 (GF)</option>
                  <option value={3}>Room 3 (GF)</option>
                  <option value={4}>Room 4 (GF)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white"
              >
                <option value="Active">Active</option>
                <option value="Left">Left PG</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. 9861012345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
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
                  <CheckCircle2 className="w-4 h-4" /> Save Resident
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
