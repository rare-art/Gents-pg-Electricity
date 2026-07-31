import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, ShieldAlert, ArrowLeft, KeyRound, ShieldCheck, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export const LoginModal = () => {
  const { showLoginModal, closeLoginModal, sendOtp, verifyOtpAndLogin } = useAuth();

  // Modal Views: 'identifier' | 'otp'
  const [view, setView] = useState('identifier');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [sentToEmail, setSentToEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  // 60-second Resend Cooldown Timer
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Reset state on modal open/close
  useEffect(() => {
    if (!showLoginModal) {
      setTimeout(() => {
        setView('identifier');
        setError('');
        setLoading(false);
        setIdentifier('');
        setSentToEmail('');
        setOtp(['', '', '', '', '', '']);
        setOtpTimer(0);
        setCanResend(false);
      }, 300);
    }
  }, [showLoginModal]);

  if (!showLoginModal) return null;

  // ─── Handlers ────────────────────────────

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email address or username.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(identifier);
      setSentToEmail(res.email || identifier);
      setOtpTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setView('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend && otpTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(identifier);
      setSentToEmail(res.email || identifier);
      setOtp(['', '', '', '', '', '']);
      setOtpTimer(60);
      setCanResend(false);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyOtpAndLogin(identifier, otpString);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-lime-700 p-6 text-white relative">
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold mb-3 shadow-lg shadow-amber-400/20">
            {view === 'identifier' ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {view === 'identifier' ? 'Owner Portal Login' : 'Verify OTP Code'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            {view === 'identifier'
              ? 'Enter your registered email or username to receive a 6-digit OTP code.'
              : `A 6-digit code has been sent to ${sentToEmail}`}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ═══════════ STEP 1: EMAIL / USERNAME INPUT ═══════════ */}
          {view === 'identifier' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 font-medium leading-relaxed">
                🔐 Passwordless Authentication: We will send a 6-digit One-Time Password (OTP) to your registered owner email via Resend.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="gorisjohn0@gmail.com or owner"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="w-1/3 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !identifier.trim()}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send OTP
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═══════════ STEP 2: OTP VERIFICATION ═══════════ */}
          {view === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* OTP Digits */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        digit
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 bg-white text-slate-800'
                      }`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              {/* 5-minute Expiry Notice & 60s Resend Cooldown */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center space-y-1">
                <p className="text-xs text-amber-900 font-semibold">
                  ⏱ OTP code expires in <span className="font-extrabold text-amber-900">5 minutes</span>
                </p>
                <div className="text-xs text-slate-500 font-medium">
                  {otpTimer > 0 ? (
                    <span>Resend available in <strong className="text-emerald-700">{formatTime(otpTimer)}</strong></span>
                  ) : (
                    <span>Didn't get the code?</span>
                  )}
                </div>
                {canResend && (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="mt-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors inline-flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend OTP Code
                  </button>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setView('identifier');
                    setError('');
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="w-1/3 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Verify & Log In
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
