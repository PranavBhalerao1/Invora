import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';
import { getGroqClient } from '@/lib/groq';

const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const PREFERRED_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

// Stage-1 output schema
interface Stage1Result {
  vendor: string;
  date: string;
  total: number;
  raw_lines: string[];
}

// Stage-2 output schema
interface Stage2Result {
  items: { name: string; quantity: number }[];
  total: number;
}

interface GeminiModelInfo {
  name: string;
  supportedGenerationMethods?: string[];
}

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

function filterFlashModels(available: string[]): string[] {
  return available.filter(n => n.includes('flash') && !n.includes('pro'));
}

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

/** Pass 1: Gemini vision → vendor, date, total, raw_lines */
async function runGeminiPass(
  mimeType: string,
  base64: string,
  primaryModel: string,
  fallbackModel: string | null,
): Promise<Stage1Result> {
  const genAI = getGeminiClient();
  const prompt = `You are a receipt OCR extractor. Given a receipt image, return ONLY valid JSON with this exact schema:
{
  "vendor": "<store name>",
  "date": "<YYYY-MM-DD>",
  "total": <final total as number>,
  "raw_lines": ["<each line of the receipt exactly as printed, one string per line>"]
}
Include every line of text from the receipt in raw_lines — product lines, prices, headers, footers, subtotal, tax, savings — everything. Do not interpret or filter. Return raw JSON only, no markdown.`;
  const imagePart = { inlineData: { mimeType, data: base64 } };

  let result;
  console.log('[scan-receipt][pass1] using model:', primaryModel);
  try {
    result = await genAI.getGenerativeModel({ model: primaryModel }).generateContent([prompt, imagePart]);
  } catch (primaryErr: unknown) {
    const msg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
    console.error('[scan-receipt][pass1] primary model failed:', primaryModel, '—', msg);
    if (!fallbackModel) throw new Error(`Gemini error (${primaryModel}): ${msg}`);
    console.log('[scan-receipt][pass1] retrying with fallback:', fallbackModel);
    result = await genAI.getGenerativeModel({ model: fallbackModel }).generateContent([prompt, imagePart]);
    console.log('[scan-receipt][pass1] fallback succeeded:', fallbackModel);
  }

  const text = result.response.text().trim();
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(jsonText) as Stage1Result;
  console.log('[scan-receipt][pass1] raw_lines:', parsed.raw_lines);
  return parsed;
}

/** Pass 2: Groq text normalization → items + total */
async function runGroqPass(stage1: Stage1Result): Promise<Stage2Result> {
  const groq = getGroqClient();

  const systemPrompt = `You are a receipt line-item normalizer. You receive raw OCR lines from a grocery/store receipt and must extract only the actual purchased items.

Rules:
- Include only real purchased product lines.
- Exclude: headers, store name, address, phone, date/time, cashier info, barcode/PLU lines, "Regular Price", "Card Savings", "WT" weight lines, subtotal, tax, total, payment method, thank-you messages, survey URLs.
- Parse quantity from patterns like "2 QTY ...", "2 @ ...", "2x ..." — default to 1 if not present.
- Clean up OCR noise into readable item names (e.g. "ORG BNNA" → "Organic Banana").
- Return ONLY valid JSON matching exactly: { "items": [{ "name": string, "quantity": number }], "total": number }
- Use the total from the raw lines if clearly present, otherwise use the provided fallback total.`;

  const userContent = `Receipt total (fallback): ${stage1.total}

Raw lines:
${stage1.raw_lines.join('\n')}`;

  console.log('[scan-receipt][pass2] sending raw_lines to Groq');

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.1,
  });

  const content = response.choices[0].message.content ?? '{}';
  const parsed = JSON.parse(content) as Stage2Result;
  console.log('[scan-receipt][pass2] normalized output:', parsed);
  return parsed;
}

export async function POST(request: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  console.log('[scan-receipt] GEMINI_API_KEY present:', !!geminiKey);
  console.log('[scan-receipt] GROQ_API_KEY present:', !!groqKey);

  if (!geminiKey) {
    return NextResponse.json({ error: 'Gemini API key is not configured on the server' }, { status: 500 });
  }
  if (!groqKey) {
    return NextResponse.json({ error: 'Groq API key is not configured on the server' }, { status: 500 });
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

    const availableModels = await listGenerateContentModels(geminiKey);
    const [primaryModel, fallbackModel] = pickModels(availableModels);

    if (!primaryModel) {
      return NextResponse.json(
        { error: 'No free-tier Flash model found for this API key. Ensure your key has access to gemini-2.5-flash-lite or gemini-2.5-flash.' },
        { status: 502 },
      );
    }

    // Pass 1: Gemini vision extraction
    let stage1: Stage1Result;
    try {
      stage1 = await runGeminiPass(mimeType, base64, primaryModel, fallbackModel);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[scan-receipt] pass1 failed:', msg);
      return NextResponse.json({ error: `Gemini pass failed: ${msg}` }, { status: 502 });
    }

    // Pass 2: Groq normalization
    let stage2: Stage2Result;
    try {
      stage2 = await runGroqPass(stage1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[scan-receipt] pass2 failed:', msg);
      return NextResponse.json({ error: `Groq pass failed: ${msg}` }, { status: 502 });
    }

    return NextResponse.json({
      vendor: stage1.vendor,
      date: stage1.date,
      items: stage2.items,
      total: stage2.total,
    });
  } catch (err: unknown) {
    console.error('[scan-receipt] unexpected error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Scan failed' }, { status: 500 });
  }
}
