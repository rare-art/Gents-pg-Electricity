import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Filter, Trash2, CheckCircle2, AlertCircle, Share2, Users, IndianRupee, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api';

export const Bills = ({
  bills = [],
  meters = [],
  payments = [],
  onRefresh,
  onOpenNewBill,
  onOpenWhatsApp,
  onUpdatePaymentStatus
}) => {
  const { isOwner } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedMeter, setSelectedMeter] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [expandedBillId, setExpandedBillId] = useState(null);

  const monthsList = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const filteredBills = bills.filter(b => {
    const matchMonth = selectedMonth === 'All' || b.month === selectedMonth;
    const matchMeter = selectedMeter === 'All' || (b.meter && b.meter._id === selectedMeter);
    const matchYear = selectedYear === 'All' || b.year === Number(selectedYear);
    return matchMonth && matchMeter && matchYear;
  });

  const handleDeleteBill = async (id) => {
    if (!isOwner) return;
    if (!window.confirm('Are you sure you want to delete this bill and all associated payment entries?')) return;

    try {
      await api.deleteBill(id);
      onRefresh();
    } catch (err) {
      alert('Failed to delete bill');
    }
  };

  const toggleExpand = (id) => {
    setExpandedBillId(expandedBillId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Monthly Bills & Cost Splitting</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete month-wise archive with automated per-head division and resident payment status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all"
          >
            <Share2 className="w-4 h-4" /> Share Summary
          </button>
          {isOwner && (
            <button
              onClick={onOpenNewBill}
              className="flex items-center gap-2 bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Add Bill
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-600 uppercase">
          <Filter className="w-4 h-4 text-emerald-600" /> Filters:
        </div>

        {/* Month Filter */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
        >
          {monthsList.map(m => (
            <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>
          ))}
        </select>

        {/* Meter Filter */}
        <select
          value={selectedMeter}
          onChange={(e) => setSelectedMeter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
        >
          <option value="All">All Meters</option>
          {meters.map(m => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>

        {/* Reset */}
        {(selectedMonth !== 'All' || selectedMeter !== 'All' || selectedYear !== 'All') && (
          <button
            onClick={() => { setSelectedMonth('All'); setSelectedMeter('All'); setSelectedYear('All'); }}
            className="text-xs font-bold text-red-600 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Bills Cards List */}
      <div className="space-y-4">
        {filteredBills.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center border border-slate-200 text-slate-500 italic">
            No bills match the selected filters.
          </div>
        ) : (
          filteredBills.map((bill) => {
            const isExpanded = expandedBillId === bill._id;
            const billPayments = payments.filter(p => p.bill && (p.bill._id === bill._id || p.bill === bill._id));
            const paidCount = billPayments.filter(p => p.status === 'Paid').length;

            return (
              <div
                key={bill._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Main Bill Bar */}
                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900">{bill.month} {bill.year}</span>
                      <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md">
                        {bill.meter?.name || 'Meter'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Units: <strong>{bill.unitsConsumed} kWh</strong> ({bill.previousReading} &rarr; {bill.currentReading})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600" /> Shared by: <strong>{bill.residents?.length || 0} residents</strong>
                      </span>
                    </div>
                  </div>

                  {/* Amounts & Expand Toggle */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-bold">Total Bill</p>
                      <span className="text-xl font-extrabold text-slate-900">₹{bill.totalAmount}</span>
                      <p className="text-xs font-bold text-emerald-700">₹{bill.perHeadAmount} / head</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(bill._id)}
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Shares' : 'Resident Shares'}</span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">
                          {paidCount}/{billPayments.length} Paid
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isOwner && (
                        <button
                          onClick={() => handleDeleteBill(bill._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Expanded Resident Payment Table */}
                {isExpanded && (
                  <div className="bg-slate-50 p-6 border-t border-slate-200 animate-fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                      <span>Resident Payment Status & Shares</span>
                      <span className="text-[11px] font-normal text-slate-500">Owner can click status to toggle Paid/Pending</span>
                    </h4>

                    {billPayments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No payment details linked to this bill.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {billPayments.map((pay) => (
                          <div
                            key={pay._id}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                              pay.status === 'Paid'
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                : 'bg-amber-50/80 border-amber-200 text-amber-900'
                            }`}
                          >
                            <div>
                              <p className="font-bold text-sm text-slate-900">{pay.resident?.name || 'Resident'}</p>
                              <p className="text-[11px] text-slate-500 font-medium">Room {pay.resident?.roomNumber}</p>
                              <p className="text-xs font-extrabold text-slate-900 mt-1">₹{pay.amount}</p>
                            </div>

                            <div className="text-right">
                              {isOwner ? (
                                <button
                                  onClick={() => onUpdatePaymentStatus(pay._id, pay.status === 'Paid' ? 'Pending' : 'Paid')}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold border shadow-sm transition-all ${
                                    pay.status === 'Paid'
                                      ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                      : 'bg-amber-500 text-slate-950 border-amber-500 hover:bg-amber-600'
                                  }`}
                                >
                                  {pay.status === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                                </button>
                              ) : (
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  pay.status === 'Paid' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                                }`}>
                                  {pay.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
