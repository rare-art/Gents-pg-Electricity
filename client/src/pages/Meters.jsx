import React from 'react';
import { Gauge, Plus, Edit, Trash2, Home, Zap, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export const Meters = ({ meters = [], onRefresh, onOpenAddMeter, onEditMeter }) => {
  const { isOwner } = useAuth();

  const handleDeleteMeter = async (id) => {
    if (!isOwner) return;
    if (!window.confirm('Are you sure you want to delete this meter?')) return;
    try {
      await api.deleteMeter(id);
      onRefresh();
    } catch (err) {
      alert('Failed to delete meter');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime-100 text-lime-800">
              <Gauge className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">PG Electricity Meters ({meters.length} Sub-Meters)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage sub-meters and room mappings for Bhubaneswar PG
          </p>
        </div>

        {isOwner && (
          <button
            onClick={onOpenAddMeter}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Sub-Meter
          </button>
        )}
      </div>

      {/* Grid of Meters */}
      {meters.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl text-center border border-slate-200 text-slate-500 space-y-3 shadow-sm">
          <div className="w-14 h-14 bg-lime-50 text-lime-700 rounded-2xl flex items-center justify-center mx-auto border border-lime-200">
            <Gauge className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">No Sub-Meters Configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Owner can click <strong className="text-emerald-700 font-bold">"Add New Sub-Meter"</strong> above to create sub-meters and assign room mappings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meters.map((meter, index) => (
            <div
              key={meter._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-lime-200/40 to-transparent rounded-bl-full pointer-events-none"></div>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                      Sub-Meter #{index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{meter.name}</h3>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => onEditMeter(meter)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white"
                        title="Edit Meter"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeter(meter._id)}
                        className="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-white"
                        title="Delete Meter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Linked Rooms Badge */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Home className="w-4 h-4 text-emerald-600" />
                  <span>Linked Rooms:</span>
                  <div className="flex items-center gap-1">
                    {meter.linkedRooms?.length > 0 ? (
                      meter.linkedRooms.map(r => (
                        <span key={r} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-900">
                          Room {r}
                        </span>
                      ))
                    ) : (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        Common Area (All Rooms)
                      </span>
                    )}
                  </div>
                </div>

                {/* Reading Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-600">Last Recorded Reading:</span>
                  </div>
                  <span className="text-xl font-black text-slate-900">
                    {meter.lastReading || 0} <span className="text-xs font-semibold text-slate-500">kWh</span>
                  </span>
                </div>

                {meter.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    📝 {meter.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
