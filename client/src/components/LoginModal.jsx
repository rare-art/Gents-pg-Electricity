import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, ShieldAlert, Check, ArrowLeft, KeyRound, ShieldCheck, RefreshCw, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

// Views: 'login' | 'forgot' | 'otp' | 'reset' | 'success'

export const LoginModal = () => {
  const { showLoginModal, closeLoginModal, login } = useAuth();

  // Shared state
  const [view, setView] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Reset password state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP countdown timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
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

  // Reset all state when modal opens/closes
  useEffect(() => {
    if (!showLoginModal) {
      setTimeout(() => {
        setView('login');
        setError('');
        setLoading(false);
        setEmail('');
        setPassword('');
        setForgotEmail('');
        setOtp(['', '', '', '', '', '']);
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
        setOtpTimer(0);
        setCanResend(false);
        setShowPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }, 300);
    }
  }, [showLoginModal]);

  if (!showLoginModal) return null;

  // ─── Handlers ────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(forgotEmail);
      setOtpTimer(60);
      setCanResend(false);
      setView('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
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
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.verifyOtp(forgotEmail, otpString);
      setResetToken(data.resetToken);
      setView('reset');
    } catch (err) {
      setError(err.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(forgotEmail);
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

  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#3b82f6' };
    if (score <= 4) return { level: 4, label: 'Strong', color: '#10b981' };
    return { level: 5, label: 'Very Strong', color: '#059669' };
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.resetPassword(resetToken, newPassword);
      setView('success');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // ─── View Configs ────────────────────────

  const viewConfig = {
    login: {
      icon: <Lock className="w-6 h-6" />,
      title: 'Owner Portal Login',
      subtitle: 'Access administrative controls to manage bills, sub-meters, and PG residents.'
    },
    forgot: {
      icon: <Mail className="w-6 h-6" />,
      title: 'Forgot Password',
      subtitle: 'Enter your registered email to receive a 6-digit verification code.'
    },
    otp: {
      icon: <KeyRound className="w-6 h-6" />,
      title: 'Verify OTP',
      subtitle: `A 6-digit code has been sent to ${forgotEmail}`
    },
    reset: {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Reset Password',
      subtitle: 'Create a strong new password for your owner account.'
    },
    success: {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: 'Password Reset!',
      subtitle: 'Your password has been changed successfully.'
    }
  };

  const currentView = viewConfig[view];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100" style={{ animation: 'slideUp 0.3s ease-out' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-lime-700 p-6 text-white relative">
          <button
            onClick={closeLoginModal}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold mb-3 shadow-lg shadow-amber-400/20">
            {currentView.icon}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">{currentView.title}</h2>
          <p className="text-xs text-emerald-100 mt-1">{currentView.subtitle}</p>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ═══════════ LOGIN VIEW ═══════════ */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email / Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setError(''); setForgotEmail(email); }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="w-1/3 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Check className="w-4 h-4" /> Log In as Owner</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═══════════ FORGOT PASSWORD VIEW ═══════════ */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 font-medium leading-relaxed">
                📧 Enter the email address linked to your Owner account. We'll send a 6-digit OTP to verify your identity.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); }}
                  className="w-1/3 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Mail className="w-4 h-4" /> Send OTP</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═══════════ OTP VERIFICATION VIEW ═══════════ */}
          {view === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* OTP Input Boxes */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3 text-center">Enter 6-Digit OTP</label>
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
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-800'
                      }`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Timer & Resend */}
              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-xs text-slate-500 font-medium">
                    ⏱ OTP expires in <span className="font-bold text-emerald-700">{formatTime(otpTimer)}</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">OTP has expired</p>
                )}
                {canResend && (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1 mx-auto hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setError(''); setOtp(['', '', '', '', '', '']); }}
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
                    <><ShieldCheck className="w-4 h-4" /> Verify OTP</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═══════════ RESET PASSWORD VIEW ═══════════ */}
          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: level <= passwordStrength.level ? passwordStrength.color : '#e2e8f0'
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold mt-1 tracking-wider uppercase" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password match indicator */}
                {confirmPassword && (
                  <p className={`text-[10px] font-bold mt-1 tracking-wider uppercase ${
                    newPassword === confirmPassword ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><KeyRound className="w-4 h-4" /> Reset Password</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═══════════ SUCCESS VIEW ═══════════ */}
          {view === 'success' && (
            <div className="text-center py-4 space-y-5">
              <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Password Changed!</h3>
                <p className="text-sm text-slate-500 mt-1">Your password has been reset successfully. You can now log in with your new password.</p>
              </div>
              <button
                onClick={() => { setView('login'); setError(''); setPassword(''); }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </div>
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
