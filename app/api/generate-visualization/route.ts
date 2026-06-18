import { NextRequest, NextResponse } from 'next/server';
import { generateVisualization } from '@/lib/visualization';
import { supabase } from '@/lib/supabase';

// Allow up to 60s — FLUX Dev takes ~10s on FAL.ai
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, options, projectId, shareWithCustomer } = await request.json();

    if (!imageUrl || !options) {
      return NextResponse.json({ error: 'imageUrl and options are required' }, { status: 400 });
    }

    const url = await generateVisualization(imageUrl, options);

    // Admin sharing: save the URL to the project record
    if (projectId && shareWithCustomer) {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ admin_visualization_url: url })
        .eq('id', projectId);

      if (updateError) {
        console.error('[Visualization] Failed to save to project:', updateError.message);
      }
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('[Visualization] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Visualization failed' },
      { status: 500 }
    );
  }
}
