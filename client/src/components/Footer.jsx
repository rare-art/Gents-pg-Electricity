import React from 'react';
import { Zap, Heart, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Footer = ({ onOpenLogin }) => {
  const { isOwner } = useAuth();

  return (
    <footer className="mt-16 bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-500 text-white flex items-center justify-center font-bold shadow-md">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base tracking-tight">GentsPG Electricity Manager</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> Jagmohan Nagar, Khandagiri, Bhubaneswar, Odisha
              </p>
            </div>
          </div>

          {/* Center Text */}
          <div className="text-center">
            <p className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5">
              GentsPG Electricity • Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> for our PG family
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              8 Residents • 4 Rooms • 4 Sub-Meters • Transparent Cost Sharing
            </p>
          </div>

          {/* Right Mode / Admin Action */}
          <div>
            {isOwner ? (
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3 py-1.5 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Owner Mode Active
              </span>
            ) : (
              <button
                onClick={onOpenLogin}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                Owner Portal Access &rarr;
              </button>
            )}
          </div>

        </div>
      </div>
    </footer>
  );
};
