import React from 'react';
import { IndianRupee, Zap, AlertCircle, Users, CheckCircle2 } from 'lucide-react';

export const SummaryCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-32 bg-slate-200/60 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: `Total Bills (${stats?.currentMonth || 'Current'})`,
      value: `₹${stats?.totalBillAmount?.toLocaleString('en-IN') || 0}`,
      subtitle: `${stats?.recentBills?.length || 0} bills logged`,
      icon: IndianRupee,
      bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
    },
    {
      title: 'Total Units Consumed',
      value: `${stats?.totalUnitsConsumed || 0} kWh`,
      subtitle: 'Across all 4 meters',
      icon: Zap,
      bgColor: 'bg-lime-50 text-lime-800 border-lime-200',
      iconBg: 'bg-lime-600 text-white',
    },
    {
      title: 'Pending Amount',
      value: `₹${stats?.totalPendingAmount?.toLocaleString('en-IN') || 0}`,
      subtitle: stats?.totalPendingAmount > 0 ? 'Payment collection required' : 'All clear!',
      icon: AlertCircle,
      bgColor: stats?.totalPendingAmount > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200',
      iconBg: stats?.totalPendingAmount > 0 ? 'bg-amber-500 text-white' : 'bg-slate-400 text-white',
    },
    {
      title: 'Active Residents',
      value: `${stats?.activeResidentsCount ?? 0} Active`,
      subtitle: 'Living in 4 rooms',
      icon: Users,
      bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      iconBg: 'bg-emerald-700 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl border ${card.bgColor} shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">{card.title}</span>
              <div className={`p-2 rounded-xl ${card.iconBg} shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">{card.value}</h3>
              <p className="text-xs opacity-75 font-medium flex items-center gap-1">
                {card.title === 'Pending Amount' && stats?.totalPendingAmount === 0 && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
