require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log("=== STEP 4 — CHECK .ENV LOADING ===");
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST ? 'configured' : 'missing'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT ? 'configured' : 'missing'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER ? 'configured' : 'missing'}`);
  console.log(`SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '[CONFIGURED]' : 'missing'}`);
  console.log(`SMTP_FROM: ${process.env.SMTP_FROM ? 'configured' : 'missing'} (${process.env.SMTP_FROM})`);
  
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error("Missing SMTP credentials.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  console.log("\n=== STEP 1 — TEST BREVO SMTP CONNECTION ===");
  try {
    const verifyResult = await transporter.verify();
    console.log("transporter.verify() SUCCEEDED:", verifyResult);
  } catch (error) {
    console.error("transporter.verify() FAILED!");
    console.error("Diagnostic Info:");
    console.error(`- error code: ${error.code}`);
    console.error(`- response code: ${error.responseCode}`);
    console.error(`- command: ${error.command}`);
    console.error(`- message: ${error.message}`);
    console.error(`- hostname: ${process.env.SMTP_HOST}`);
    console.error(`- port: ${process.env.SMTP_PORT || 587}`);
    return;
  }

  console.log("\n=== STEP 6 — SEND A DIRECT TEST EMAIL ===");
  const testEmail = "abdulwaheed.test@gmail.com"; // Placeholder, but we can see the response
  
  const mailOptions = {
    from: `"Citizen Complaint Portal Test" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: testEmail,
    subject: "Brevo SMTP Test",
    text: "This is a direct test from the Node.js backend using Brevo SMTP."
  };
  
  console.log(`Sending from: ${mailOptions.from}`);
  console.log(`Sending to: ${mailOptions.to}`);
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("sendMail() SUCCEEDED!");
    console.log("Diagnostic Info:");
    console.log(`- messageId: ${info.messageId}`);
    console.log(`- accepted: ${JSON.stringify(info.accepted)}`);
    console.log(`- rejected: ${JSON.stringify(info.rejected)}`);
    console.log(`- response: ${info.response}`);
  } catch (error) {
    console.error("sendMail() FAILED!");
    console.error("Diagnostic Info:");
    console.error(`- error code: ${error.code}`);
    console.error(`- response code: ${error.responseCode}`);
    console.error(`- command: ${error.command}`);
    console.error(`- message: ${error.message}`);
  }
}

testSMTP();
