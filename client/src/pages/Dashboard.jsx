import React from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { SummaryCards } from '../components/SummaryCards';
import { Zap, Gauge, Users, FileText, CheckCircle2, AlertCircle, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({
  stats,
  loading,
  meters = [],
  residents = [],
  bills = [],
  payments = [],
  onNavigate,
  onOpenNewBill,
  onOpenWhatsApp,
  onUpdatePaymentStatus
}) => {
  const { isOwner } = useAuth();

  const pendingPayments = payments.filter(p => p.status === 'Pending');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <HeroBanner onOpenNewBill={onOpenNewBill} onOpenWhatsApp={onOpenWhatsApp} />

      {/* Summary Stat Cards */}
      <SummaryCards stats={stats} loading={loading} />

      {/* Quick Action & Split Highlight Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-lime-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-lime-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 text-xs font-bold border border-lime-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Instant Bill Splitting Algorithm
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Automatic Per-Head Bill Division
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Bills are auto-divided equally among linked residents per meter. Owners can easily track and mark payment status as Paid or Pending.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('bills')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
            >
              View All Bills <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenWhatsApp}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-emerald-400" /> WhatsApp Summary
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Meters Overview & Pending Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Meters & Recent Bills */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sub-Meters Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-lime-100 text-lime-800">
                  <Gauge className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">PG Sub-Meters Overview</h3>
              </div>
              <button
                onClick={() => onNavigate('meters')}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                Manage Meters &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {meters.map((meter) => (
                <div key={meter._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-800">{meter.name}</span>
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Rooms {meter.linkedRooms?.join(', ') || 'All'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-slate-600">
                    <span>Current Reading:</span>
                    <span className="text-base font-extrabold text-slate-900">{meter.lastReading || 0} <span className="text-xs font-semibold text-slate-500">kWh</span></span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 italic">{meter.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bills Log */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Recent Monthly Bills</h3>
              </div>
              <button
                onClick={() => onNavigate('bills')}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                View History &rarr;
              </button>
            </div>

            {bills.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">No bills generated yet.</p>
            ) : (
              <div className="space-y-3">
                {bills.slice(0, 4).map((bill) => (
                  <div key={bill._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{bill.month} {bill.year}</span>
                        <span className="text-xs text-slate-500">({bill.meter?.name || 'Meter'})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Reading: {bill.previousReading} &rarr; {bill.currentReading} ({bill.unitsConsumed} units consumed)
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900">Total: ₹{bill.totalAmount}</span>
                        <p className="text-xs font-bold text-emerald-700">₹{bill.perHeadAmount} / head</p>
                      </div>
                      <span className="text-[11px] font-bold bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg">
                        {bill.residents?.length || 0} residents
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Pending Payments Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pending Payments</h3>
                  <p className="text-[11px] text-slate-500">{pendingPayments.length} pending entries</p>
                </div>
              </div>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="p-6 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">All Payments Cleared!</p>
                <p className="text-xs opacity-80">No outstanding dues for any resident.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {pendingPayments.map((payment) => (
                  <div key={payment._id} className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{payment.resident?.name}</p>
                      <p className="text-xs text-slate-500">
                        Room {payment.resident?.roomNumber} • {payment.bill?.month} {payment.bill?.year}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className="font-extrabold text-sm text-amber-900">₹{payment.amount}</span>
                        <p className="text-[10px] text-amber-700 font-bold">Pending</p>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => onUpdatePaymentStatus(payment._id, 'Paid')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm"
                          title="Mark as Paid"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Room Occupancy Summary */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" /> Room Occupancy (2 per room)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[1, 2, 3, 4].map(room => {
                const roomRes = residents.filter(r => r.roomNumber === room && r.status === 'Active');
                return (
                  <div key={room} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-slate-800">Room {room}</p>
                    <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                      {roomRes.length} / 2 residents
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
