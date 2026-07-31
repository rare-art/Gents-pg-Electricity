const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'gentspg_secret_jwt_key_2026_bhubaneswar_odisha';

// @route   POST /api/auth/send-otp
// @desc    Send 6-digit OTP to owner email for login (5 min expiry, 60s resend cooldown)
router.post('/send-otp', async (req, res) => {
  try {
    const rawIdentifier = req.body.identifier || req.body.email || req.body.username;
    if (!rawIdentifier) {
      return res.status(400).json({ message: 'Please enter your email address or username.' });
    }

    const cleanIdentifier = String(rawIdentifier).trim().toLowerCase();
    console.log(`🔑 [OTP LOG] Incoming OTP request for identifier: "${cleanIdentifier}"`);

    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { username: cleanIdentifier }
      ],
      role: 'owner'
    });

    if (!user) {
      console.log(`❌ [OTP LOG] No owner found matching "${cleanIdentifier}"`);
      return res.status(400).json({ message: 'No owner account found matching that email or username.' });
    }

    // Check 60-second resend cooldown
    if (user.lastOtpSentAt) {
      const msSinceLastSend = Date.now() - new Date(user.lastOtpSentAt).getTime();
      if (msSinceLastSend < 60000) {
        const remainingSec = Math.ceil((60000 - msSinceLastSend) / 1000);
        console.log(`⏱ [OTP LOG] Cooldown active for "${user.email}". ${remainingSec}s remaining.`);
        return res.status(429).json({
          message: `Please wait ${remainingSec} seconds before requesting a new OTP.`
        });
      }
    }

    // Generate 6-digit OTP (100000 to 999999 inclusive)
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash the OTP before storing in DB
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Save OTP, expiry (5 mins), and lastOtpSentAt
    user.loginOtp = hashedOtp;
    user.loginOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.lastOtpSentAt = new Date();
    await user.save();

    // Send OTP via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'no-reply@roamflux.site';

    let resendResult = null;
    let messageId = null;

    if (!resendApiKey || resendApiKey === 'your_key_here') {
      console.error('❌ [OTP LOG] RESEND_API_KEY not configured.');
    } else {
      const { Resend } = require('resend');
      const resend = new Resend(resendApiKey);

      resendResult = await resend.emails.send({
        from: `GentsPG Electricity Manager <${fromEmail}>`,
        to: [user.email],
        subject: '🔑 Your Owner Login OTP — GentsPG Electricity Manager',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #065f46, #4d7c0f); padding: 32px 28px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                ⚡ GentsPG Electricity Manager
              </h1>
              <p style="color: #d1fae5; margin: 6px 0 0; font-size: 13px;">Owner Portal Secure Login</p>
            </div>
            <div style="padding: 32px 28px;">
              <p style="color: #334155; font-size: 15px; margin: 0 0 12px; line-height: 1.6;">
                Hello <strong>${user.name || 'Owner'}</strong>,
              </p>
              <p style="color: #475569; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
                Your 6-digit verification code to log in to the GentsPG Owner Portal is below:
              </p>
              <div style="background: #ffffff; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
                <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px; font-weight: 700;">One-Time Password (OTP)</p>
                <p style="color: #065f46; font-size: 36px; font-weight: 900; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                  ${otp}
                </p>
              </div>
              <div style="background: #fef3c7; border-radius: 10px; padding: 14px 16px; margin: 0 0 24px;">
                <p style="color: #92400e; font-size: 12px; margin: 0; font-weight: 600;">
                  ⏱ This code expires in <strong>5 minutes</strong>. Do not share this OTP with anyone.
                </p>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;">
                If you did not request this login code, please ignore this email.
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

      if (resendResult && resendResult.data) {
        messageId = resendResult.data.id;
      }
      if (resendResult && resendResult.error) {
        console.error('❌ [RESEND API ERROR]:', resendResult.error);
      }
    }

    console.log(`🔑 [OTP LOG] OTP Code: ${otp}`);
    console.log(`📧 [OTP LOG] Owner Email: ${user.email}`);
    console.log(`📬 [OTP LOG] Message ID: ${messageId}`);

    res.json({
      message: `OTP sent to ${user.email}`,
      email: user.email,
      username: user.username,
      _devOtp: (process.env.NODE_ENV === 'development' || !resendResult || resendResult.error) ? otp : undefined
    });
  } catch (err) {
    console.error('❌ [OTP LOG] Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP, invalidate OTP upon success, issue JWT and log Owner in
router.post('/verify-otp', async (req, res) => {
  try {
    const rawIdentifier = req.body.identifier || req.body.email || req.body.username;
    const { otp } = req.body;

    if (!rawIdentifier || !otp) {
      return res.status(400).json({ message: 'Email/Username and 6-digit OTP are required.' });
    }

    const cleanIdentifier = String(rawIdentifier).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    console.log(`🔍 [AUTH LOG] Verifying OTP for identifier: "${cleanIdentifier}"`);

    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { username: cleanIdentifier }
      ],
      role: 'owner'
    });

    if (!user || !user.loginOtp || !user.loginOtpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Enforce 5-minute expiry
    if (new Date() > new Date(user.loginOtpExpiry)) {
      console.log(`⏰ [AUTH LOG] OTP expired for user "${user.email}"`);
      user.loginOtp = null;
      user.loginOtpExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Compare bcrypt hash
    const isValid = await bcrypt.compare(cleanOtp, user.loginOtp);
    if (!isValid) {
      console.log(`❌ [AUTH LOG] Invalid OTP provided for user "${user.email}"`);
      return res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
    }

    // Invalidate OTP after successful login
    user.loginOtp = null;
    user.loginOtpExpiry = null;
    await user.save();
    console.log(`✅ [AUTH LOG] OTP successfully verified and invalidated for "${user.email}".`);

    // Generate JWT
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('❌ [AUTH LOG] Verify OTP error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user details
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -loginOtp -loginOtpExpiry -resetOtp -resetOtpExpiry');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
