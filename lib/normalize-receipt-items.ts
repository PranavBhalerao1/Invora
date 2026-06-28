export interface NormalizedItem {
  name: string;
  quantity: string | number;
}

// OCR abbreviation substitutions applied in order
const ABBR_SUBS: [RegExp, string][] = [
  [/\bPNUT\s+BUTTR?\b/gi, 'Peanut Butter'],
  [/\bPNT\s+BUTTR?\b/gi, 'Peanut Butter'],
  [/\bCHNK\s+CHK[NC]\b/gi, 'Chunk Chicken'],
  [/\bNITRIL\b/gi, 'Nitrile'],
  [/\bGLVS?\b/gi, 'Gloves'],
  [/\bORG\b/gi, 'Organic'],
  [/\bBNNA\b/gi, 'Banana'],
  [/\bPARM\b/gi, 'Parmesan'],
  [/\bWHL\b/gi, 'Whole'],
  [/\bWHT\b/gi, 'White'],
  [/\bMLK\b/gi, 'Milk'],
  [/\bBRD\b/gi, 'Bread'],
  [/\bBTR\b/gi, 'Butter'],
  [/\bCHZ\b/gi, 'Cheese'],
  [/\bCHKN\b/gi, 'Chicken'],
  [/\bSTRWBRY\b/gi, 'Strawberry'],
];

// Single trailing tax/category code to strip (single letter F/N/O/X/T preceded by whitespace)
const TRAILING_CODE_RE = /\s+[FNOXTE]$/i;
// UPC-like digit sequences (5+ digits)
const UPC_RE = /\b\d{5,}\b\s*/g;

// Embedded size/count token: "16OZ", "16 OZ", "12 CT", "24 PK", "2 LB", "1 GAL", "32 FL OZ", etc.
const EMBEDDED_QTY_RE =
  /\b(\d+(?:\.\d+)?)\s*(FL\s*OZ|OZ|CT|PK|LB|GAL|QT|ML|KG|PCS?|COUNT)\b/i;

// Purchase count prefix: "2 QTY ...", "2 @ ...", "2X ..."
const PURCHASE_COUNT_RE = /^(\d+)\s*(?:QTY|@|X)\s+(.+)$/i;

function normalizeUnit(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, '');
}

export function cleanName(raw: string): string {
  let s = raw.trim();
  s = s.replace(UPC_RE, '').trim();
  s = s.replace(TRAILING_CODE_RE, '').trim();
  for (const [re, replacement] of ABBR_SUBS) {
    s = s.replace(re, replacement);
  }
  // Title-case
  s = s
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

function parseQuantityFromName(rawName: string): { name: string; quantity: string | number } {
  // 1. Purchase count prefix: "2 QTY FIBER ONE" → count=2, rest="FIBER ONE"
  const purchaseMatch = rawName.match(PURCHASE_COUNT_RE);
  if (purchaseMatch) {
    const count = parseInt(purchaseMatch[1], 10);
    const rest = purchaseMatch[2].trim();
    const sizeMatch = rest.match(EMBEDDED_QTY_RE);
    if (sizeMatch) {
      const nameWithoutSize = rest.replace(sizeMatch[0], '').replace(/\s+/g, ' ').trim();
      const size = `${sizeMatch[1]} ${normalizeUnit(sizeMatch[2])}`;
      return { name: nameWithoutSize, quantity: count === 1 ? size : `${count} x ${size}` };
    }
    return { name: rest, quantity: count };
  }

  // 2. Embedded size token: "GV PARM 16OZ" → name="GV PARM", qty="16 oz"
  const sizeMatch = rawName.match(EMBEDDED_QTY_RE);
  if (sizeMatch) {
    const nameWithoutSize = rawName.replace(sizeMatch[0], '').replace(/\s+/g, ' ').trim();
    const size = `${sizeMatch[1]} ${normalizeUnit(sizeMatch[2])}`;
    return { name: nameWithoutSize, quantity: size };
  }

  return { name: rawName, quantity: 1 };
}

function canonicalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function mergeQuantity(q1: string | number, q2: string | number): string | number {
  // Both numeric: sum
  if (typeof q1 === 'number' && typeof q2 === 'number') return q1 + q2;

  const s1 = String(q1);
  const s2 = String(q2);

  // "N x size" + same-size → "(N+1) x size"
  const nxMatch = s1.match(/^(\d+)\s*x\s*(.+)$/i);
  if (nxMatch && nxMatch[2].trim().toLowerCase() === s2.toLowerCase()) {
    return `${parseInt(nxMatch[1], 10) + 1} x ${nxMatch[2].trim()}`;
  }

  // Same string → "2 x ..."
  if (s1.toLowerCase() === s2.toLowerCase()) return `2 x ${s1}`;

  return `${s1} + ${s2}`;
}

function processGroqItem(groqItem: {
  name: string;
  quantity: string | number;
}): NormalizedItem {
  const { name: extractedName, quantity: extractedQty } = parseQuantityFromName(groqItem.name);
  const cleanedName = cleanName(extractedName);
  const isDefaultQty = groqItem.quantity === 1 || groqItem.quantity === '1';

  if (isDefaultQty) {
    return { name: cleanedName, quantity: extractedQty };
  }

  // Groq supplied a non-trivial count AND the name had an embedded size — combine them
  if (
    typeof groqItem.quantity === 'number' &&
    groqItem.quantity > 1 &&
    typeof extractedQty === 'string'
  ) {
    return { name: cleanedName, quantity: `${groqItem.quantity} x ${extractedQty}` };
  }

  return { name: cleanedName, quantity: groqItem.quantity };
}

export function normalizeReceiptItems(
  groqItems: { name: string; quantity: string | number }[],
): NormalizedItem[] {
  const processed = groqItems.map(processGroqItem);

  const map = new Map<string, NormalizedItem>();
  for (const item of processed) {
    const key = canonicalizeName(item.name);
    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.quantity = mergeQuantity(existing.quantity, item.quantity);
    } else {
      map.set(key, { ...item });
    }
  }

  return Array.from(map.values());
}

// Dev test — simulates a Groq response with repeated lines and embedded qty tokens
export function runDevTest(): { input: object; output: NormalizedItem[] } {
  const groqItems: { name: string; quantity: string | number }[] = [
    { name: 'GV WHL WHEAT BRD', quantity: 1 },
    { name: 'GV WHL WHEAT BRD', quantity: 1 },
    { name: 'GV PNT BUTTR 16OZ', quantity: 1 },
    { name: 'GV PNT BUTTR 16OZ', quantity: 1 },
    { name: 'GV PNT BUTTR 16OZ', quantity: 1 },
    { name: '12 CT NITRIL GLVS', quantity: 1 },
    { name: 'GV PARM 8OZ', quantity: 2 }, // Groq already extracted purchase count=2
    { name: '2 QTY FIBER ONE BAR', quantity: 1 }, // post-process should extract count
  ];

  const output = normalizeReceiptItems(groqItems);
  return { input: groqItems, output };
}
