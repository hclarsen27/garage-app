import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sourceId, amount, projectId } = await request.json();

    if (!sourceId || !amount || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const response = await fetch('https://connect.squareupsandbox.com/v2/payments', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${process.env.SQUARE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_id: sourceId,
        idempotency_key: `dep-${projectId.slice(0, 8)}-${Date.now()}`,
        amount_money: {
          amount: Math.round(amount * 100),
          currency: 'USD',
        },
        location_id: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
        note: `Garage deposit`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.errors?.[0]?.detail || 'Payment failed';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    return NextResponse.json({ paymentId: data.payment?.id });
  } catch (error: any) {
    console.error('Square payment error:', error);
    return NextResponse.json({ error: error.message || 'Payment failed' }, { status: 500 });
  }
}
