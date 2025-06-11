// A simple script to test the SMTP configuration
// To run: node scripts/test-email.js

const nodemailer = require('nodemailer');

// SMTP configuration from the Supabase settings
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'i.goranov02@gmail.com',
    pass: 'scmvaqkqjkrqasbu', // App password from Gmail
  },
};

// Create a transporter with the configuration
const transporter = nodemailer.createTransport(smtpConfig);

// Test the connection
async function testConnection() {
  try {
    // Verify the connection
    const connectionTest = await transporter.verify();
    console.log('SMTP connection test:', connectionTest ? 'Successful' : 'Failed');
    
    // If connection successful, send a test email
    if (connectionTest) {
      await sendTestEmail();
    }
  } catch (error) {
    console.error('SMTP connection error:', error);
  }
}

// Send a test email
async function sendTestEmail() {
  try {
    const mailOptions = {
      from: {
        name: 'Ivan Goranov from IT Forum',
        address: 'i.goranov02@gmail.com'
      },
      to: 'i.goranov02@gmail.com', // Send to yourself for testing
      subject: 'IT Community Forum - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Configuration Test</h2>
          <p>This is a test email to verify that the SMTP configuration is working correctly.</p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <p><strong>SMTP Configuration:</strong></p>
            <ul>
              <li><strong>Host:</strong> ${smtpConfig.host}</li>
              <li><strong>Port:</strong> ${smtpConfig.port}</li>
              <li><strong>User:</strong> ${smtpConfig.auth.user}</li>
              <li><strong>Secure:</strong> ${smtpConfig.secure}</li>
            </ul>
          </div>
          
          <p>If you received this email, it means your SMTP configuration is working correctly.</p>
          
          <p style="font-size: 0.8em; color: #666; margin-top: 30px;">
            This is an automated test message from IT Community Forum.
          </p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

// Run the test
testConnection(); 