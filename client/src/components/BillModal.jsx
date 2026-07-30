import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { X, Zap, IndianRupee, Users, Calendar, Calculator, Check, AlertCircle } from 'lucide-react';

export const BillModal = ({ isOpen, onClose, onSuccess, meters = [], residents = [] }) => {
  const [meterId, setMeterId] = useState('');
  const [previousReading, setPreviousReading] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [unitPrice, setUnitPrice] = useState('6');
  const [totalAmount, setTotalAmount] = useState('');
  const [month, setMonth] = useState('July');
  const [year, setYear] = useState(2026);
  const [selectedResidentIds, setSelectedResidentIds] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const calculateTotal = (prev, curr, rate) => {
    const p = parseFloat(prev) || 0;
    const c = parseFloat(curr) || 0;
    const u = Math.max(0, c - p);
    const r = parseFloat(rate) || 0;
    const tot = Math.round(u * r * 100) / 100;
    return tot > 0 ? tot.toString() : '0';
  };

  const handlePreviousReadingChange = (val) => {
    setPreviousReading(val);
    setTotalAmount(calculateTotal(val, currentReading, unitPrice));
  };

  const handleCurrentReadingChange = (val) => {
    setCurrentReading(val);
    setTotalAmount(calculateTotal(previousReading, val, unitPrice));
  };

  const handleUnitPriceChange = (val) => {
    setUnitPrice(val);
    setTotalAmount(calculateTotal(previousReading, currentReading, val));
  };

  // When meter changes, auto populate last reading and pre-select linked room residents
  useEffect(() => {
    if (meterId && meters.length) {
      const selectedMeter = meters.find(m => m._id === meterId);
      if (selectedMeter) {
        const lastRead = selectedMeter.lastReading || 0;
        setPreviousReading(lastRead);
        setCurrentReading(lastRead);
        setTotalAmount(calculateTotal(lastRead, lastRead, unitPrice));

        // Preselect residents matching linked rooms
        if (selectedMeter.linkedRooms && selectedMeter.linkedRooms.length > 0) {
          const matchingResidents = residents
            .filter(r => r.status === 'Active' && selectedMeter.linkedRooms.includes(r.roomNumber))
            .map(r => r._id);
          setSelectedResidentIds(matchingResidents);
        } else {
          // Default to all active residents if meter is common
          setSelectedResidentIds(residents.filter(r => r.status === 'Active').map(r => r._id));
        }
      }
    }
  }, [meterId, meters, residents]);

  // Set default initial meter if available
  useEffect(() => {
    if (isOpen && meters.length > 0 && !meterId) {
      setMeterId(meters[0]._id);
    }
  }, [isOpen, meters, meterId]);

  if (!isOpen) return null;

  // Auto-calculated values
  const prevNum = parseFloat(previousReading) || 0;
  const currNum = parseFloat(currentReading) || 0;
  const unitsConsumed = Math.max(0, currNum - prevNum);
  const totalAmtNum = parseFloat(totalAmount) || 0;
  const selectedCount = selectedResidentIds.length;
  const perHeadAmount = selectedCount > 0 ? (totalAmtNum / selectedCount).toFixed(2) : '0.00';

  const handleToggleResident = (id) => {
    setSelectedResidentIds(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedResidentIds(residents.filter(r => r.status === 'Active').map(r => r._id));
  };

  const handleSelectNone = () => {
    setSelectedResidentIds([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!meterId) {
      setError('Please select a meter');
      return;
    }
    if (currNum < prevNum) {
      setError('Current reading cannot be less than previous reading');
      return;
    }
    if (totalAmtNum <= 0) {
      setError('Total Bill Amount must be greater than ₹0');
      return;
    }
    if (selectedCount === 0) {
      setError('Please select at least one resident to share this bill');
      return;
    }

    setLoading(true);

    try {
      await api.createBill({
        meterId,
        previousReading: prevNum,
        currentReading: currNum,
        totalAmount: totalAmtNum,
        month,
        year,
        residentIds: selectedResidentIds,
        notes
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full my-8 overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-lime-700 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Generate Monthly Bill & Split</h2>
              <p className="text-xs text-emerald-100">Calculates units, total cost & individual resident share</p>
            </div>
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Meter Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Meter</label>
            <select
              value={meterId}
              onChange={(e) => setMeterId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white"
            >
              {meters.map(m => (
                <option key={m._id} value={m._id}>
                  {m.name} (Linked Rooms: {m.linkedRooms?.join(', ') || 'All'})
                </option>
              ))}
            </select>
          </div>

          {/* Readings & Unit Price Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase">Prev Reading</label>
              <input
                type="number"
                step="any"
                required
                value={previousReading}
                onChange={(e) => handlePreviousReadingChange(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase">Curr Reading</label>
              <input
                type="number"
                step="any"
                required
                value={currentReading}
                onChange={(e) => handleCurrentReadingChange(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-emerald-800 uppercase">Units Consumed</label>
              <div className="mt-1 px-3 py-2 bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-sm rounded-lg flex items-center justify-between">
                <span>{unitsConsumed}</span>
                <span className="text-[10px] text-emerald-700">kWh</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase">Unit Price (₹/unit)</label>
              <input
                type="number"
                step="any"
                required
                min="0"
                value={unitPrice}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold bg-white text-emerald-800"
              />
            </div>
          </div>

          {/* Bill Amount & Month/Year Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Amount (₹)</label>
              <div className="relative mt-1">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 1440"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-extrabold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white"
              >
                {monthsList.map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Year</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white"
              />
            </div>
          </div>

          {/* Resident Multi-Select Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" /> Share Bill Among ({selectedCount} Selected)
              </label>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <button type="button" onClick={handleSelectAll} className="text-emerald-700 hover:underline">Select All</button>
                <span className="text-slate-300">|</span>
                <button type="button" onClick={handleSelectNone} className="text-slate-500 hover:underline">Clear</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {residents.map((r) => {
                const isSelected = selectedResidentIds.includes(r._id);
                return (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => handleToggleResident(r._id)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] opacity-80 font-bold">Room {r.roomNumber}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-bold truncate mt-1">{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Result Summary Box */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-lime-500/10 rounded-2xl border border-amber-300/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1">
                <Calculator className="w-4 h-4 text-amber-600" /> Calculated Per Head Share
              </p>
              <p className="text-[11px] text-slate-600">₹{totalAmtNum} ÷ {selectedCount} residents</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-800">₹{perHeadAmount}</span>
              <p className="text-[10px] text-slate-500 font-bold">per resident</p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. AC unit included, July TPCODL reading"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          {/* Submit Action */}
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
              className="w-2/3 py-2.5 bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" /> Create & Split Bill
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
