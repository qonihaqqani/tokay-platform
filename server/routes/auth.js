const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');
const { sendSMS, sendEmail } = require('../utils/notifications');

const router = express.Router();

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user with phone number
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber, fullName, email, preferredLanguage = 'ms' } = req.body;

    // Validation
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.'
      });
    }

    // Check if phone number already exists
    const existingUser = await db('users').where({ phone_number: phoneNumber }).first();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered.'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create new user
    const [user] = await db('users').insert({
      phone_number: phoneNumber,
      email: email || null,
      full_name: fullName || null,
      verification_code: verificationCode,
      preferred_language: preferredLanguage,
      is_phone_verified: false,
      is_active: true
    }).returning('*');

    // Send verification SMS
    try {
      await sendSMS(phoneNumber, `Your Tokay verification code is: ${verificationCode}. Valid for 10 minutes.`);
    } catch (smsError) {
      logger.error('Failed to send verification SMS:', smsError);
      // Continue with registration even if SMS fails
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your phone number.',
      data: {
        userId: user.id,
        phoneNumber: user.phone_number,
        isPhoneVerified: user.is_phone_verified
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
});

// Verify phone number
router.post('/verify-phone', async (req, res) => {
  try {
    const { phoneNumber, verificationCode } = req.body;

    if (!phoneNumber || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and verification code are required.'
      });
    }

    // Find user by phone number
    const user = await db('users').where({ phone_number: phoneNumber }).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Check verification code
    if (user.verification_code !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code.'
      });
    }

    // Update user as verified
    await db('users').where({ id: user.id }).update({
      is_phone_verified: true,
      verification_code: null,
      last_login_at: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phone_number },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Phone number verified successfully.',
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          fullName: user.full_name,
          preferredLanguage: user.preferred_language,
          isPhoneVerified: true,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification.'
    });
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.'
      });
    }

    const user = await db('users').where({ phone_number: phoneNumber }).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.is_phone_verified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already verified.'
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    await db('users').where({ id: user.id }).update({
      verification_code: verificationCode
    });

    // Send verification SMS
    try {
      await sendSMS(phoneNumber, `Your Tokay verification code is: ${verificationCode}. Valid for 10 minutes.`);
    } catch (smsError) {
      logger.error('Failed to send verification SMS:', smsError);
    }

    res.json({
      success: true,
      message: 'Verification code sent successfully.'
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// Login with phone number and password (if password is set)
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.'
      });
    }

    const user = await db('users').where({ phone_number: phoneNumber, is_active: true }).first();
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // If password is provided, verify it
    if (password && user.password_hash) {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials.'
        });
      }
    } else if (!user.is_phone_verified) {
      // If no password and phone not verified, require phone verification
      return res.status(401).json({
        success: false,
        message: 'Please verify your phone number first.',
        requiresPhoneVerification: true
      });
    }

    // Update last login
    await db('users').where({ id: user.id }).update({
      last_login_at: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phone_number },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          fullName: user.full_name,
          preferredLanguage: user.preferred_language,
          isPhoneVerified: user.is_phone_verified,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
});

// Set password for additional security
router.post('/set-password', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db('users').where({ id: req.user.id }).update({
      password_hash: hashedPassword
    });

    res.json({
      success: true,
      message: 'Password set successfully.'
    });
  } catch (error) {
    logger.error('Set password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.user.id }).first();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        phoneNumber: user.phone_number,
        email: user.email,
        fullName: user.full_name,
        preferredLanguage: user.preferred_language,
        isPhoneVerified: user.is_phone_verified,
        isEmailVerified: user.is_email_verified,
        role: user.role,
        profileSettings: user.profile_settings,
        lastLoginAt: user.last_login_at
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;