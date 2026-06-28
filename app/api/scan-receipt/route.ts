import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = image.type || 'image/jpeg';

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a receipt parser. Extract all line items, vendor name, date, subtotal, tax, and total from this receipt image. Return ONLY valid JSON matching this exact schema: { "vendor": string, "date": "YYYY-MM-DD", "items": [{"name": string, "price": number}], "subtotal": number, "tax": number, "total": number }. If a field is unclear, make your best guess. Never return null for total. Do not include any markdown, code blocks, or explanation — just the raw JSON object.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: base64 } },
    ]);

    const text = result.response.text().trim();
    const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('scan-receipt error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Scan failed' }, { status: 500 });
  }
}
