import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, SMS } from '@/lib/sms';
import { sendEmail, Email } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { customerPhone, customerEmail, date, timeSlot } = await request.json();

    if (!date || !timeSlot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const results: string[] = [];

    if (customerPhone) {
      await sendSMS(customerPhone, SMS.appointmentConfirmed(date, timeSlot))
        .then(() => results.push('sms'))
        .catch((err) => console.error('[SMS] Appointment confirmation failed:', err.message));
    }

    if (customerEmail && process.env.RESEND_API_KEY) {
      const { subject, html } = Email.appointmentConfirmed(date, timeSlot);
      await sendEmail(customerEmail, subject, html)
        .then(() => results.push('email'))
        .catch((err) => console.error('[Email] Appointment confirmation failed:', err.message));
    }

    return NextResponse.json({ success: true, sent: results });
  } catch (error: any) {
    console.error('Appointment notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send notification' }, { status: 500 });
  }
}
