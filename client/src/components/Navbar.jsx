import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, ShieldCheck, Eye, LogIn, LogOut, Users, Gauge, FileText, PieChart, Menu, X, MapPin } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { isOwner, user, logout, openLoginModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Zap },
    { id: 'bills', label: 'Monthly Bills', icon: FileText },
    { id: 'payments', label: 'Payment Tracker', icon: PieChart },
    { id: 'residents', label: 'Residents (8)', icon: Users },
    { id: 'meters', label: 'Meters (4)', icon: Gauge },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Banner Mode Indicator */}
      <div className={`py-1.5 px-4 text-xs font-medium text-center transition-colors flex items-center justify-center gap-2 ${
        isOwner 
          ? 'bg-amber-500 text-slate-950 font-semibold' 
          : 'bg-emerald-800 text-emerald-100'
      }`}>
        {isOwner ? (
          <>
            <ShieldCheck className="w-4 h-4 text-slate-950 animate-pulse" />
            <span><strong>OWNER MODE ACTIVE</strong> — Full access enabled (Add/Edit Bills, Meters & Residents)</span>
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 text-emerald-300" />
            <span><strong>PUBLIC VIEW MODE</strong> — Read-Only for Residents. Owner can log in to manage bills.</span>
          </>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-lime-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">GentsPG</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  Odisha
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" /> Bhubaneswar PG Bill Splitter
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Auth Action */}
          <div className="hidden md:flex items-center gap-3">
            {isOwner ? (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">{user.name || 'Owner'}</p>
                  <p className="text-[10px] text-amber-700 font-medium">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-red-200 transition-colors"
                  title="Logout Owner"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                Owner Login
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {!isOwner && (
              <button
                onClick={openLoginModal}
                className="bg-emerald-600 text-white p-2 rounded-lg text-xs font-semibold"
              >
                Login
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}

          {isOwner && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Logged as Owner</span>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
