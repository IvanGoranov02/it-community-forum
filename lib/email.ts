import nodemailer from 'nodemailer';

// Create a transporter with SMTP configuration
// Using the configuration from the provided Supabase SMTP settings
let transporter: nodemailer.Transporter;

// Initialize the email transporter
export function initializeEmailTransporter() {
  // SMTP configuration from the Supabase settings
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER || 'i.goranov02@gmail.com';
  const pass = process.env.SMTP_PASS || 'scmvaqkqjkrqasbu'; // App password from Gmail
  
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
  
  return transporter;
}

// Get the transporter, initializing it if necessary
export function getTransporter() {
  if (!transporter) {
    initializeEmailTransporter();
  }
  return transporter;
}

// Send an email notification to admins about a new content report
export async function sendReportNotification({
  contentType,
  contentId,
  reason,
  details,
  reporterUsername,
  contentAuthor,
  contentTitle,
  contentExcerpt,
}: {
  contentType: 'post' | 'comment';
  contentId: string;
  reason: string;
  details?: string;
  reporterUsername: string;
  contentAuthor: string;
  contentTitle?: string;
  contentExcerpt: string;
}) {
  try {
    // Get admin email addresses from environment variable or use default
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['i.goranov02@gmail.com'];
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for report notifications');
      return { success: false, error: 'No admin emails configured' };
    }
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const reportUrl = `${siteUrl}/admin/moderation`;
    
    // Format the content type for display
    const formattedContentType = contentType === 'post' ? 'Post' : 'Comment';
    
    // Format the message
    const subject = `[IT Community Forum] New content report: ${reason}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Content Report</h2>
        <p>A user has reported content on IT Community Forum.</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <p><strong>Report Details:</strong></p>
          <ul>
            <li><strong>Content Type:</strong> ${formattedContentType}</li>
            <li><strong>Reason:</strong> ${reason}</li>
            <li><strong>Reported by:</strong> ${reporterUsername}</li>
            ${details ? `<li><strong>Additional Details:</strong> ${details}</li>` : ''}
          </ul>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Reported Content:</strong></p>
          <p><strong>Author:</strong> ${contentAuthor}</p>
          ${contentTitle ? `<p><strong>Title:</strong> ${contentTitle}</p>` : ''}
          <p><strong>Content:</strong> ${contentExcerpt}</p>
        </div>
        
        <p>Please review this report by visiting the <a href="${reportUrl}" style="color: #2563eb;">content moderation dashboard</a>.</p>
        
        <p style="font-size: 0.8em; color: #666; margin-top: 30px;">
          This is an automated message from IT Community Forum.
        </p>
      </div>
    `;
    
    // Send the email
    const mailOptions = {
      from: {
        name: 'Ivan Goranov from IT Forum',
        address: 'i.goranov02@gmail.com'
      },
      to: adminEmails.join(','),
      subject,
      html,
    };
    
    const info = await getTransporter().sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending report notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
} 