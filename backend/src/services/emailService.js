const nodemailer = require('nodemailer');

const createTransporter = async () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP credentials are not configured in the server environment (.env). Email delivery is disabled.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

const sendVerificationEmail = async (email, code) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"Citizen Complaint Portal" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your Citizen Complaint Portal account',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #333;">
          <h2 style="color: #ffffff; letter-spacing: 0.1em; text-align: center; margin-bottom: 30px; text-transform: uppercase;">Citizen Complaint Portal</h2>
          <div style="background-color: #111; padding: 30px; border-radius: 8px; border: 1px solid #222;">
            <p style="color: #cccccc; font-size: 16px; margin-top: 0;">Verify your email address</p>
            <p style="color: #a0a0a0; font-size: 14px; margin-bottom: 20px;">Use the verification code below to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background: linear-gradient(135deg, #222, #111); border: 1px solid #444; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 0.2em; border-radius: 8px; color: #ffffff;">
                ${code}
              </span>
            </div>
            <p style="color: #a0a0a0; font-size: 13px; text-align: center;">This code expires in 10 minutes.</p>
          </div>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">If you did not create this account, you can safely ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error; // Rethrow to let the controller handle the specific message
  }
};

module.exports = { sendVerificationEmail };
