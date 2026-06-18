import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, SMS } from '@/lib/sms';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type SupportedMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

function parseImage(dataUrl: string): { data: string; mediaType: SupportedMediaType } {
  const data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const prefix = dataUrl.split(';')[0].split(':')[1] || '';
  const supported: SupportedMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const mediaType: SupportedMediaType = supported.includes(prefix as SupportedMediaType)
    ? (prefix as SupportedMediaType)
    : 'image/jpeg';
  return { data, mediaType };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Accept either multi-image (imagesBase64[]) or legacy single image (imageBase64)
    const rawImages: string[] = body.imagesBase64
      ? body.imagesBase64
      : body.imageBase64
      ? [body.imageBase64]
      : [];

    if (rawImages.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
    }

    const imageBlocks = rawImages.map((img) => {
      const { data, mediaType } = parseImage(img);
      return {
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: mediaType, data },
      };
    });

    const photoLabel = rawImages.length > 1
      ? `these ${rawImages.length} garage photos (different walls/angles)`
      : 'this garage photo';

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            ...imageBlocks,
            {
              type: 'text',
              text: `Analyze ${photoLabel} and provide the following in JSON format:
{
  "roomWidth": <estimated width in feet as a number>,
  "roomDepth": <estimated depth in feet as a number>,
  "roomHeight": <estimated ceiling height in feet as a number>,
  "summary": "<brief description of the space, any obstacles, windows, doors, etc>",
  "hasExistingStorage": <boolean>,
  "estimatedSquareFootage": <number>
}

${rawImages.length > 1 ? 'Use all photos together to give the most accurate combined estimate of the full space.' : ''}
Be conservative with estimates. If you cannot determine a measurement, use a typical garage dimension (e.g., 20ft width).`,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse analysis response');

    const analysis = JSON.parse(jsonMatch[0]);

    const ownerNumber = process.env.YOUR_PHONE_NUMBER;
    if (ownerNumber) {
      const dimensions = `${analysis.roomWidth}ft × ${analysis.roomDepth}ft × ${analysis.roomHeight}ft`;
      sendSMS(ownerNumber, SMS.newLead(dimensions))
        .then(() => console.log('[SMS] New lead alert sent to owner'))
        .catch((err) => console.error('[SMS] Failed to send lead alert:', err.message));
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze photo' }, { status: 500 });
  }
}
