interface EmailProvider {
  send(to: string, subject: string, html: string): Promise<void>;
}

class ResendProvider implements EmailProvider {
  async send(to: string, subject: string, html: string): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Garage Transform <noreply@garagetransform.com>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Email send failed');
    }
  }
}

// Swap this line to change providers (e.g. SendGrid, Postmark, AWS SES)
const emailProvider: EmailProvider = new ResendProvider();

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await emailProvider.send(to, subject, html);
}

// Pre-built email templates
export const Email = {
  quoteReady: (total: number, projectUrl: string) => ({
    subject: 'Your Garage Transform Quote is Ready',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Your Quote is Ready</h1>
        <p>Great news — we've analyzed your garage and your quote is ready to view.</p>
        <p style="font-size: 24px; font-weight: bold;">Starting at $${total}</p>
        <a href="${projectUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
          View Your Quote
        </a>
        <p style="color: #6b7280; font-size: 14px;">Questions? Reply to this email or text us directly.</p>
      </div>
    `,
  }),

  appointmentConfirmed: (date: string, timeSlot: string) => ({
    subject: 'Measurement Visit Confirmed — Garage Transform',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Appointment Confirmed</h1>
        <p>Your measurement visit is scheduled for:</p>
        <p style="font-size: 20px; font-weight: bold;">${date} — ${timeSlot}</p>
        <p>We'll arrive ready to measure your space and confirm the final project details.</p>
        <p style="color: #6b7280; font-size: 14px;">Need to reschedule? Reply to this email.</p>
      </div>
    `,
  }),

  depositReceived: (amount: number) => ({
    subject: 'Deposit Received — Garage Transform',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Deposit Received</h1>
        <p>We've received your $${amount} deposit. You're all set!</p>
        <p>We'll be in touch to confirm your measurement visit and next steps.</p>
        <p style="color: #6b7280; font-size: 14px;">Questions? Reply to this email.</p>
      </div>
    `,
  }),
};
