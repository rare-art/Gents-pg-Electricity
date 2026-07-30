import React from 'react';
import { MapPin, Zap, Users, Home, ShieldCheck, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HeroBanner = ({ onOpenNewBill, onOpenWhatsApp }) => {
  const { isOwner } = useAuth();

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-3xl shadow-xl text-white mb-8 border border-slate-800">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
        <img
          src="/pg-building.jpg"
          alt="GentsPG Building - Bhubaneswar"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-700 hover:scale-100"
        />
      </div>

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-950/95 via-slate-900/90 to-amber-950/80"></div>

      {/* Decorative Accent Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-lime-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side Info */}
        <div className="space-y-4 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Jagmohan Nagar, Khandagiri, Bhubaneswar, Odisha</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            GentsPG <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-yellow-300 to-amber-400">Electricity Manager</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
            Transparent, accurate, and automated electricity bill management & per-head cost splitting for PG residents across 4 rooms.
          </p>

          {/* PG Building Highlights */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-300 pt-2">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Home className="w-4 h-4 text-amber-400" /> 2-Storey Building (4 Rooms)
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Users className="w-4 h-4 text-lime-400" /> 4 Rooms Capacity
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Zap className="w-4 h-4 text-emerald-400" /> 4 Separate Sub-Meters
            </span>
          </div>
        </div>

        {/* Right Side Thumbnail Card & Action */}
        <div className="flex flex-col items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full max-w-[260px] aspect-[4/3] rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl shadow-black/50">
            <img
              src="/pg-building.jpg"
              alt="GentsPG House Odisha"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-2 left-2 right-2 text-center bg-slate-900/80 backdrop-blur-md py-1 px-2 rounded-lg border border-slate-700">
              <p className="text-[11px] font-bold text-amber-300">Gents PG House</p>
              <p className="text-[9px] text-slate-300">Green & Yellow Building</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full max-w-[260px]">
            {isOwner && (
              <button
                onClick={onOpenNewBill}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm transition-all transform hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 fill-slate-950" /> Add Bill
              </button>
            )}
            <button
              onClick={onOpenWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm transition-all border border-emerald-400/30"
            >
              <Share2 className="w-4 h-4" /> Share Summary
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
