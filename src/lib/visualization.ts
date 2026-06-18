export interface DesignOptions {
  paintedWalls: boolean;
  epoxyFloor: boolean;
  heavyDutyShelfing: boolean;
  labeledBins: boolean;
  pegboard: boolean;
  ceilingStorage: boolean;
}

export interface VisualizationProvider {
  generate(imageUrl: string, options: DesignOptions): Promise<string>;
}

function buildPrompt(options: DesignOptions): string {
  const features: string[] = [];
  if (options.paintedWalls) features.push('clean freshly painted white walls');
  if (options.epoxyFloor) features.push('polished gray epoxy floor coating');
  if (options.heavyDutyShelfing) features.push('heavy-duty custom built wooden shelving units along the walls');
  if (options.labeledBins) features.push('neatly organized labeled storage bins and containers on shelves');
  if (options.pegboard) features.push('pegboard wall organizer with hanging tools and accessories');
  if (options.ceilingStorage) features.push('overhead ceiling storage platform with boxes stored above');

  const featureList = features.length > 0 ? features.join(', ') : 'clean organized storage';
  return `Professional garage organization and transformation, ${featureList}, bright well-lit interior, photorealistic, magazine-quality home improvement photography, modern organized garage, neat and tidy`;
}

class FluxProvider implements VisualizationProvider {
  async generate(imageUrl: string, options: DesignOptions): Promise<string> {
    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) throw new Error('FAL_API_KEY is not configured');

    const response = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: buildPrompt(options),
        strength: 0.75,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        image_size: 'landscape_4_3',
        sync_mode: true,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any).detail || (err as any).message || 'Visualization generation failed');
    }

    const data = await response.json();
    const url = data?.images?.[0]?.url;
    if (!url) throw new Error('No image returned from visualization service');
    return url;
  }
}

// Swap this line to change providers without touching any other code
const visualizationProvider: VisualizationProvider = new FluxProvider();

export async function generateVisualization(imageUrl: string, options: DesignOptions): Promise<string> {
  return visualizationProvider.generate(imageUrl, options);
}
