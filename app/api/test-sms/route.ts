import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

// Protected debug endpoint — only callable with secret token
// Usage: GET /api/test-sms?token=your_secret
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const secret = process.env.DEBUG_SECRET;

  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ownerNumber = process.env.YOUR_PHONE_NUMBER;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  try {
    if (!ownerNumber) return NextResponse.json({ error: 'YOUR_PHONE_NUMBER not set' });
    if (!accountSid) return NextResponse.json({ error: 'TWILIO_ACCOUNT_SID not set' });
    if (!authToken) return NextResponse.json({ error: 'TWILIO_AUTH_TOKEN not set' });
    if (!fromNumber) return NextResponse.json({ error: 'TWILIO_PHONE_NUMBER not set' });

    await sendSMS(ownerNumber, 'Test SMS from Garage App');
    return NextResponse.json({ success: true, to: ownerNumber, from: fromNumber });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
