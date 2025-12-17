const twilio = require('twilio');
const nodemailer = require('nodemailer');
const logger = require('./logger');

// Initialize Twilio client for SMS (only if credentials are available)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (error) {
    logger.warn('Failed to initialize Twilio client:', error.message);
  }
} else {
  logger.warn('Twilio credentials not provided. SMS functionality will be disabled.');
}

// Initialize email transporter (only if credentials are available)
let emailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    emailTransporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } catch (error) {
    logger.warn('Failed to initialize email transporter:', error.message);
  }
} else {
  logger.warn('Email credentials not provided. Email functionality will be disabled.');
}

/**
 * Send SMS notification
 * @param {string} phoneNumber - Recipient phone number (with country code)
 * @param {string} message - SMS message content
 * @param {string} language - Language code (ms, en, zh, ta)
 */
const sendSMS = async (phoneNumber, message, language = 'ms') => {
  try {
    // Check if Twilio client is initialized
    if (!twilioClient) {
      logger.warn('SMS service not available. Twilio client not initialized.');
      // For demo purposes, return a mock success response
      return {
        success: true,
        sid: 'demo_sms_' + Date.now(),
        demo: true,
        message: 'SMS service simulated for demo'
      };
    }

    // Format phone number for Malaysia if needed
    let formattedNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('01')) {
        formattedNumber = '+60' + phoneNumber;
      } else {
        formattedNumber = '+' + phoneNumber;
      }
    }

    const messageOptions = {
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    };

    const result = await twilioClient.messages.create(messageOptions);
    
    logger.info(`SMS sent successfully to ${formattedNumber}`, {
      sid: result.sid,
      status: result.status
    });
    
    return { success: true, sid: result.sid };
  } catch (error) {
    logger.error('Failed to send SMS:', error);
    throw new Error(`SMS delivery failed: ${error.message}`);
  }
};

/**
 * Send email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @param {string} text - Email text content (fallback)
 */
const sendEmail = async (to, subject, html, text) => {
  try {
    // Check if email transporter is initialized
    if (!emailTransporter) {
      logger.warn('Email service not available. Email transporter not initialized.');
      // For demo purposes, return a mock success response
      return {
        success: true,
        messageId: 'demo_email_' + Date.now(),
        demo: true,
        message: 'Email service simulated for demo'
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Tokay Platform" <noreply@tokay.com>',
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const result = await emailTransporter.sendMail(mailOptions);
    
    logger.info(`Email sent successfully to ${to}`, {
      messageId: result.messageId,
      response: result.response
    });
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

/**
 * Send multi-language alert message
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} email - Recipient email (optional)
 * @param {object} alertData - Alert data object
 * @param {string} language - User's preferred language
 */
const sendAlert = async (phoneNumber, email, alertData, language = 'ms') => {
  const messages = {
    ms: {
      flood_warning: `⚠️ AMARAN BANJIR: ${alertData.message}. Sila ambil langkah berjaga-jaga segera.`,
      weather_alert: `🌤️ AMARAN CUACA: ${alertData.message}.`,
      emergency: `🚨 KECEMASAN: ${alertData.message}. Sila bertindak segera!`,
      general: `📢 MAKLUMAT TOKAY: ${alertData.message}.`
    },
    en: {
      flood_warning: `⚠️ FLOOD WARNING: ${alertData.message}. Please take precautions immediately.`,
      weather_alert: `🌤️ WEATHER ALERT: ${alertData.message}.`,
      emergency: `🚨 EMERGENCY: ${alertData.message}. Please act immediately!`,
      general: `📢 TOKAY NOTICE: ${alertData.message}.`
    },
    zh: {
      flood_warning: `⚠️ 洪水警告: ${alertData.message}. 请立即采取预防措施。`,
      weather_alert: `🌤️ 天气警报: ${alertData.message}.`,
      emergency: `🚨 紧急情况: ${alertData.message}. 请立即行动！`,
      general: `📢 TOKAY通知: ${alertData.message}.`
    },
    ta: {
      flood_warning: `⚠️ வெள்ளப் பெருக்கு எச்சரிக்கை: ${alertData.message}. உடனடியாக முன்னெச்சரிக்கை எடுக்கவும்.`,
      weather_alert: `🌤️ வானிலை எச்சரிக்கை: ${alertData.message}.`,
      emergency: `🚨 அவசரநிலை: ${alertData.message}. உடனடியாக செயல்படவும்!`,
      general: `📢 TOKAY அறிவிப்பு: ${alertData.message}.`
    }
  };

  const alertType = alertData.type || 'general';
  const message = messages[language]?.[alertType] || messages[language]?.general || messages.en.general;

  const results = {};

  // Send SMS
  try {
    results.sms = await sendSMS(phoneNumber, message, language);
  } catch (error) {
    results.sms = { success: false, error: error.message };
    logger.error(`SMS failed for ${phoneNumber}:`, error);
  }

  // Send email if provided
  if (email) {
    try {
      const emailSubject = `Tokay Alert: ${alertData.title || 'Important Notice'}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc3545; margin-bottom: 10px;">🚨 Tokay Alert</h2>
            <h3 style="color: #495057; margin-bottom: 15px;">${alertData.title || 'Important Notice'}</h3>
            <p style="color: #212529; line-height: 1.6; font-size: 16px;">${message}</p>
            ${alertData.recommendations ? `
              <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <h4 style="color: #495057; margin-bottom: 10px;">Recommended Actions:</h4>
                <ul style="color: #212529; line-height: 1.6;">
                  ${alertData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 12px;">
                This is an automated alert from Tokay Resilience Platform.<br>
                For assistance, contact our support team.
              </p>
            </div>
          </div>
        </div>
      `;
      
      results.email = await sendEmail(email, emailSubject, emailHtml, message);
    } catch (error) {
      results.email = { success: false, error: error.message };
      logger.error(`Email failed for ${email}:`, error);
    }
  }

  return results;
};

/**
 * Send verification code via SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} code - Verification code
 * @param {string} language - User's preferred language
 */
const sendVerificationCode = async (phoneNumber, code, language = 'ms') => {
  const messages = {
    ms: `Kod pengesahan Tokay anda: ${code}. Sah selama 10 minit.`,
    en: `Your Tokay verification code: ${code}. Valid for 10 minutes.`,
    zh: `您的Tokay验证码: ${code}. 有效期10分钟。`,
    ta: `உங்கள் Tokay சரிபார்ப்பு குறியீடு: ${code}. 10 நிமிடங்கள் செல்லுபடியாகும்.`
  };

  const message = messages[language] || messages.en;
  return await sendSMS(phoneNumber, message, language);
};

module.exports = {
  sendSMS,
  sendEmail,
  sendAlert,
  sendVerificationCode
};