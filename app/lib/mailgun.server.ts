/**
 * Mailgun Email Service
 * 
 * Handles sending emails via Mailgun API for contact forms and notifications
 */

interface MailgunEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

export class MailgunService {
  private apiKey: string;
  private domain: string;
  private fromEmail: string;

  constructor(apiKey: string, domain: string, fromEmail?: string) {
    this.apiKey = apiKey;
    this.domain = domain;
    this.fromEmail = fromEmail || `noreply@${domain}`;
  }

  /**
   * Send email via Mailgun API
   */
  async sendEmail(options: MailgunEmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      //console.log('Sending email via Mailgun...');
      //console.log('Domain:', this.domain);
      //console.log('API Key (first 10 chars):', this.apiKey.substring(0, 10) + '...');
      
      const formData = new FormData();
      formData.append('from', options.from || this.fromEmail);
      formData.append('to', options.to);
      formData.append('subject', options.subject);
      formData.append('text', options.text);
      
      if (options.html) {
        formData.append('html', options.html);
      }

      // For Mailgun HTTP API, use 'api' as username and API key as password
      const auth = btoa(`api:${this.apiKey}`);
      //console.log('Authorization header created');

      const response = await fetch(`https://api.mailgun.net/v3/${this.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
        body: formData,
      });

      //console.log('Mailgun response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        //console.error('Mailgun API error response:', errorText);
        //console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        return { success: false, error: `Mailgun API error: ${response.status} - ${errorText}` };
      }

      const result = await response.json() as { id?: string; message?: string };
      //console.log('Email sent successfully:', result.id || result.message);
      return { success: true };

    } catch (error) {
      //console.error('Failed to send email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send contact form notification to admin
   */
  async sendContactFormNotification(
    adminEmail: string, 
    formData: ContactFormData,
    formType: string = 'Contact Form'
  ): Promise<{ success: boolean; error?: string }> {
    const subject = `New ${formType} Submission - ${formData.fullName}`;
    
    const textContent = `
New ${formType} Submission

Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}

Message:
${formData.message}

Submitted: ${new Date().toLocaleString('en-US', { 
  timeZone: 'Asia/Kolkata',
  dateStyle: 'full',
  timeStyle: 'short'
})}
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New ${formType} Submission</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #5A4A3A; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #5A4A3A; }
    .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #5A4A3A; }
    .message { background: white; padding: 15px; border: 1px solid #ddd; white-space: pre-wrap; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New ${formType} Submission</h1>
      <p>Haniesta Bespoke Inquiry</p>
    </div>
    
    <div class="content">
      <div class="field">
        <div class="label">Full Name:</div>
        <div class="value">${formData.fullName}</div>
      </div>
      
      <div class="field">
        <div class="label">Email Address:</div>
        <div class="value"><a href="mailto:${formData.email}">${formData.email}</a></div>
      </div>
      
      <div class="field">
        <div class="label">Phone Number:</div>
        <div class="value"><a href="tel:${formData.phone}">${formData.phone}</a></div>
      </div>
      
      <div class="field">
        <div class="label">Message:</div>
        <div class="message">${formData.message}</div>
      </div>
    </div>
    
    <div class="footer">
      <p>Submitted on ${new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'short'
      })}</p>
      <p>This email was sent from the Haniesta website contact form.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: adminEmail,
      subject,
      text: textContent,
      html: htmlContent,
      from: `Haniesta Website <${this.fromEmail}>`,
    });
  }
}

/**
 * Create Mailgun service instance from environment variables
 */
export function createMailgunService(env: any): MailgunService | null {
  const apiKey = env.MAILGUN_API_KEY;
  const domain = env.MAILGUN_DOMAIN;
  const fromEmail = env.MAILGUN_FROM_EMAIL;

  if (!apiKey || !domain) {
    console.error('Missing Mailgun configuration. Please set MAILGUN_API_KEY and MAILGUN_DOMAIN in your environment variables.');
    return null;
  }

  return new MailgunService(apiKey, domain, fromEmail);
}
