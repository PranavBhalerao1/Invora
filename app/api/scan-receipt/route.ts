import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Free-tier Flash models in preference order. No Pro models, no retired 2.0 names.
const PREFERRED_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

interface GeminiModelInfo {
  name: string; // e.g. "models/gemini-2.0-flash"
  supportedGenerationMethods?: string[];
}

/** Fetches all models available to this API key that support generateContent. */
async function listGenerateContentModels(apiKey: string): Promise<string[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`,
  );
  if (!res.ok) {
    const body = await res.text();
    console.warn('[scan-receipt] models.list failed:', res.status, body.slice(0, 200));
    return [];
  }
  const data = (await res.json()) as { models?: GeminiModelInfo[] };
  const names = (data.models ?? [])
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => m.name.replace(/^models\//, ''));
  console.log('[scan-receipt] available generateContent models:', names);
  return names;
}

/** Filters to free-tier-safe Flash models (no pro). */
function filterFlashModels(available: string[]): string[] {
  return available.filter(n => n.includes('flash') && !n.includes('pro'));
}

/**
 * Returns [primary, fallback] models to try, both free-tier Flash only.
 * primary: first PREFERRED_MODELS entry found in available list
 * fallback: second PREFERRED_MODELS entry, or first flash-lite, or first flash
 */
function pickModels(available: string[]): [string | null, string | null] {
  const flash = filterFlashModels(available);
  console.log('[scan-receipt] free-tier flash models available:', flash);

  const preferred = PREFERRED_MODELS.filter(m => flash.includes(m));
  const primary = preferred[0] ?? flash.find(n => n.includes('flash-lite')) ?? flash[0] ?? null;
  const fallback = preferred[1]
    ?? (primary ? flash.find(n => n !== primary && n.includes('flash-lite')) : null)
    ?? (primary ? flash.find(n => n !== primary) : null)
    ?? null;
  return [primary, fallback];
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('[scan-receipt] GEMINI_API_KEY present:', !!apiKey);

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key is not configured on the server' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log('[scan-receipt] file:', image.name, 'type:', image.type, 'size:', image.size);

    const mimeType = image.type || 'image/jpeg';
    if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file type "${mimeType}". Please upload a JPEG, PNG, or WebP image. iPhone HEIC photos must be converted first.` },
        { status: 400 },
      );
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Discover which models are actually available to this key
    const availableModels = await listGenerateContentModels(apiKey);
    const [primaryModel, fallbackModel] = pickModels(availableModels);

    if (!primaryModel) {
      return NextResponse.json(
        { error: 'No free-tier Flash model found for this API key. Ensure your key has access to gemini-2.5-flash-lite or gemini-2.5-flash.' },
        { status: 502 },
      );
    }

    const genAI = getGeminiClient();
    const prompt = `You are a receipt parser. Extract all line items, vendor name, date, subtotal, tax, and total from this receipt image. Return ONLY valid JSON matching this exact schema: { "vendor": string, "date": "YYYY-MM-DD", "items": [{"name": string, "price": number}], "subtotal": number, "tax": number, "total": number }. If a field is unclear, make your best guess. Never return null for total. Do not include any markdown, code blocks, or explanation — just the raw JSON object.`;
    const imagePart = { inlineData: { mimeType, data: base64 } };

    let result;
    console.log('[scan-receipt] using model:', primaryModel);
    try {
      result = await genAI.getGenerativeModel({ model: primaryModel }).generateContent([prompt, imagePart]);
    } catch (primaryErr: unknown) {
      const primaryMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      console.error('[scan-receipt] primary model failed:', primaryModel, '—', primaryMsg);

      if (!fallbackModel) {
        return NextResponse.json({ error: `Gemini API error (model: ${primaryModel}): ${primaryMsg}` }, { status: 502 });
      }

      console.log('[scan-receipt] retrying with fallback model:', fallbackModel);
      try {
        result = await genAI.getGenerativeModel({ model: fallbackModel }).generateContent([prompt, imagePart]);
        console.log('[scan-receipt] fallback model succeeded:', fallbackModel);
      } catch (fallbackErr: unknown) {
        const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        console.error('[scan-receipt] fallback model also failed:', fallbackModel, '—', fallbackMsg);
        return NextResponse.json(
          { error: `Gemini API error — primary (${primaryModel}): ${primaryMsg} | fallback (${fallbackModel}): ${fallbackMsg}` },
          { status: 502 },
        );
      }
    }

    const text = result.response.text().trim();
    const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('[scan-receipt] unexpected error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Scan failed' }, { status: 500 });
  }
}
