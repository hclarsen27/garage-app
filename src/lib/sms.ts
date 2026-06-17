interface SMSProvider {
  send(to: string, body: string): Promise<void>;
}

class TwilioProvider implements SMSProvider {
  async send(to: string, body: string): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_PHONE_NUMBER!;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'SMS send failed');
    }
  }
}

// Swap this line to change providers
const smsProvider: SMSProvider = new TwilioProvider();

export async function sendSMS(to: string, body: string): Promise<void> {
  await smsProvider.send(to, body);
}

// Pre-built notification templates
export const SMS = {
  newLead: (dimensions: string) =>
    `New garage lead! Space: ${dimensions}. Check admin dashboard for details.`,

  appointmentConfirmed: (date: string, timeSlot: string) =>
    `Your measurement visit is confirmed for ${date} (${timeSlot}). We'll see you then! - Garage Transform`,

  quoteReady: (total: number) =>
    `Your garage quote is ready — starting at $${total}. Log in to view packages and book your visit.`,
};
