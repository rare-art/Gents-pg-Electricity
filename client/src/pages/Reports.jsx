import React, { useState } from 'react';
import { PieChart, Search, CheckCircle2, AlertCircle, IndianRupee, Users, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Reports = ({ payments = [], residents = [], bills = [], onUpdatePaymentStatus }) => {
  const { isOwner } = useAuth();
  const [selectedResidentId, setSelectedResidentId] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPayments = payments.filter(p => {
    const matchResident = selectedResidentId === 'All' || (p.resident && p.resident._id === selectedResidentId);
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchResident && matchStatus;
  });

  // Calculate stats
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <PieChart className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Payment Tracker & Resident Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Check individual resident payment history, paid amounts, and active pending dues
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Total Collected (Paid)</p>
            <h3 className="text-3xl font-black mt-1">₹{totalPaid.toLocaleString('en-IN')}</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-600 text-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">Total Pending Dues</p>
            <h3 className="text-3xl font-black mt-1">₹{totalPending.toLocaleString('en-IN')}</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-500 text-slate-950">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-600 uppercase">Resident:</span>
          <select
            value={selectedResidentId}
            onChange={(e) => setSelectedResidentId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="All">All Residents ({residents.length})</option>
            {residents.map(r => (
              <option key={r._id} value={r._id}>
                {r.name} (Room {r.roomNumber})
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-slate-600 uppercase ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filteredPayments.length} records
        </span>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="p-4">Resident</th>
                <th className="p-4">Room</th>
                <th className="p-4">Bill Month</th>
                <th className="p-4">Meter</th>
                <th className="p-4">Per Head Share</th>
                <th className="p-4">Status</th>
                {isOwner && <th className="p-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No payment records matching selected filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{p.resident?.name || 'Resident'}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                        Room {p.resident?.roomNumber}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {p.bill?.month} {p.bill?.year}
                    </td>
                    <td className="p-4 text-slate-600">{p.bill?.meter?.name || 'Meter'}</td>
                    <td className="p-4 font-extrabold text-slate-900">₹{p.amount}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        p.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onUpdatePaymentStatus(p._id, p.status === 'Paid' ? 'Pending' : 'Paid')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            p.status === 'Paid'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          {p.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
