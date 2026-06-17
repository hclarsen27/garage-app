import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, SMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const { customerPhone, date, timeSlot } = await request.json();

    if (!customerPhone || !date || !timeSlot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sendSMS(customerPhone, SMS.appointmentConfirmed(date, timeSlot));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Appointment notification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send SMS' }, { status: 500 });
  }
}
