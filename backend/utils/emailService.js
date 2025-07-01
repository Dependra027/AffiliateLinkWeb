const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (username) => ({
    subject: 'Welcome to Link Manager!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">Welcome to Link Manager!</h2>
        <p>Hi ${username},</p>
        <p>Thank you for registering with Link Manager. You can now start organizing and managing your favorite links!</p>
        <p>Here are some things you can do:</p>
        <ul>
          <li>Add new links with titles and descriptions</li>
          <li>Organize links with tags</li>
          <li>Search and filter your saved links</li>
          <li>Edit or delete links as needed</li>
        </ul>
        <p>Happy organizing!</p>
        <p>Best regards,<br>The Link Manager Team</p>
      </div>
    `
  }),

  passwordReset: (username, resetToken) => ({
    subject: 'Password Reset Request - Link Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Password Reset Request</h2>
        <p>Hi ${username},</p>
        <p>We received a request to reset your password for your Link Manager account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" 
             style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The Link Manager Team</p>
      </div>
    `
  }),

  emailVerification: (username, verificationToken) => ({
    subject: 'Verify Your Email - Link Manager',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Verify Your Email Address</h2>
        <p>Hi ${username},</p>
        <p>Thank you for registering with Link Manager. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/verify-email?token=${verificationToken}" 
             style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The Link Manager Team</p>
      </div>
    `
  }),

  linkShared: (username, linkTitle, sharedBy) => ({
    subject: `${sharedBy} shared a link with you - Link Manager`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">Link Shared with You</h2>
        <p>Hi ${username},</p>
        <p>${sharedBy} has shared a link with you:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${linkTitle}</h3>
          <p style="margin: 0; color: #666;">Check out this interesting link!</p>
        </div>
        <p>Best regards,<br>The Link Manager Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = emailTemplates[template](data.username, data.token);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions
const sendWelcomeEmail = async (email, username) => {
  return await sendEmail(email, 'welcome', { username });
};

const sendPasswordResetEmail = async (email, username, resetToken) => {
  return await sendEmail(email, 'passwordReset', { username, token: resetToken });
};

const sendEmailVerification = async (email, username, verificationToken) => {
  return await sendEmail(email, 'emailVerification', { username, token: verificationToken });
};

const sendLinkSharedEmail = async (email, username, linkTitle, sharedBy) => {
  return await sendEmail(email, 'linkShared', { username, linkTitle, sharedBy });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendLinkSharedEmail
}; 