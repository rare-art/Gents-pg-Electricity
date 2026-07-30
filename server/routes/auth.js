const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'gentspg_secret_jwt_key_2026_bhubaneswar_odisha';

// @route   POST /api/auth/login
// @desc    Owner Login
router.post('/login', async (req, res) => {
  try {
    const rawIdentifier = req.body.email || req.body.username || req.body.identifier;
    const password = req.body.password;

    console.log(`🔑 [AUTH LOG] Incoming login attempt - Identifier: "${rawIdentifier}"`);

    if (!rawIdentifier || !password) {
      console.log('⚠️ [AUTH LOG] Login failed: Missing email/username or password in request body.');
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const cleanIdentifier = String(rawIdentifier).trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { username: cleanIdentifier }
      ]
    });

    if (!user) {
      console.log(`❌ [AUTH LOG] Login failed: No user found with email/username "${cleanIdentifier}".`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`👤 [AUTH LOG] User retrieved from DB: ${user.email} (Username: ${user.username}, Role: ${user.role})`);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`🔐 [AUTH LOG] bcrypt.compare result: ${isMatch}`);

    if (!isMatch) {
      console.log(`❌ [AUTH LOG] Login failed: Password mismatch for user "${cleanIdentifier}".`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ [AUTH LOG] Login successful for "${user.email}". JWT issued.`);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ [AUTH LOG] Login error exception:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user details
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetOtp -resetOtpExpiry');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send 6-digit OTP to owner email for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please enter your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'owner' });

    // Always return success to avoid revealing whether the email exists
    if (!user) {
      return res.json({ message: 'If an account with that email exists, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash the OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Store hashed OTP and set expiry to 15 minutes from now
    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send OTP via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    if (!resendApiKey || resendApiKey === 'your_key_here') {
      console.error('❌ RESEND_API_KEY not configured. OTP generated:', otp);
      return res.json({
        message: 'If an account with that email exists, an OTP has been sent.',
        _devOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    }

    const { Resend } = require('resend');
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: `GentsPG Electricity <${fromEmail}>`,
      to: [user.email],
      subject: '🔐 Password Reset OTP — GentsPG Electricity Manager',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #065f46, #4d7c0f); padding: 32px 28px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
              ⚡ GentsPG Electricity Manager
            </h1>
            <p style="color: #d1fae5; margin: 6px 0 0; font-size: 13px;">Password Reset Request</p>
          </div>
          <div style="padding: 32px 28px;">
            <p style="color: #334155; font-size: 15px; margin: 0 0 12px; line-height: 1.6;">
              Hello <strong>${user.name || 'Owner'}</strong>,
            </p>
            <p style="color: #475569; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
              We received a request to reset your password. Use the OTP below to verify your identity:
            </p>
            <div style="background: #ffffff; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
              <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px; font-weight: 700;">Your OTP Code</p>
              <p style="color: #065f46; font-size: 36px; font-weight: 900; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                ${otp}
              </p>
            </div>
            <div style="background: #fef3c7; border-radius: 10px; padding: 14px 16px; margin: 0 0 24px;">
              <p style="color: #92400e; font-size: 12px; margin: 0; font-weight: 600;">
                ⏱ This OTP expires in <strong>15 minutes</strong>. Do not share this code with anyone.
              </p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;">
              If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          <div style="background: #f1f5f9; padding: 16px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} GentsPG Electricity Manager — Bhubaneswar, Odisha
            </p>
          </div>
        </div>
      `
    });

    console.log(`📧 Password reset OTP sent to ${user.email}`);
    res.json({ message: 'If an account with that email exists, an OTP has been sent.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process request. Please try again.' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return a short-lived reset token
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: 'owner' });

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > user.resetOtpExpiry) {
      // Clear expired OTP
      user.resetOtp = null;
      user.resetOtpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // Generate a short-lived reset token (10 minutes)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Clear the OTP after successful verification
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ resetToken, message: 'OTP verified successfully.' });

  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using verified reset token
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (tokenErr) {
      return res.status(400).json({ message: 'Reset session has expired. Please start over.' });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    console.log(`🔑 Password reset successful for ${user.email}`);
    res.json({ message: 'Password has been reset successfully. You can now log in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
