'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Plus, Trash2, Loader2 } from 'lucide-react';
import { submitReceipt, uploadReceiptImage } from '@/lib/supabase/receipts';
import { GeminiReceiptResult, Receipt } from '@/types';
import { toast } from 'sonner';

interface SubmitReceiptModalProps {
  roomId: string;
  onClose: () => void;
  onSubmitted: (receipt: Receipt) => void;
}

type Step = 'upload' | 'review';

export default function SubmitReceiptModal({ roomId, onClose, onSubmitted }: SubmitReceiptModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState('');
  const [lineItems, setLineItems] = useState<{ name: string; price: string }[]>([]);
  const [subtotal, setSubtotal] = useState('');
  const [tax, setTax] = useState('');
  const [total, setTotal] = useState('');
  const [yourName, setYourName] = useState('');
  const [notes, setNotes] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleScan() {
    if (!file) return;
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/scan-receipt', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to scan receipt');
      const parsed: GeminiReceiptResult = await res.json();

      setVendor(parsed.vendor ?? '');
      setDate(parsed.date ?? '');
      setLineItems((parsed.items ?? []).map(i => ({ name: i.name, price: String(i.price) })));
      setSubtotal(String(parsed.subtotal ?? ''));
      setTax(String(parsed.tax ?? ''));
      setTotal(String(parsed.total ?? ''));
      setStep('review');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  }

  function recalcTotal() {
    const itemsSum = lineItems.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
    const taxNum = parseFloat(tax) || 0;
    setSubtotal(itemsSum.toFixed(2));
    setTotal((itemsSum + taxNum).toFixed(2));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!yourName.trim()) { toast.error('Your name is required'); return; }
    const totalNum = parseFloat(total);
    if (!totalNum || totalNum <= 0) { toast.error('Total must be greater than 0'); return; }

    setSubmitting(true);
    try {
      const receiptData = {
        submitted_by_name: yourName.trim(),
        vendor: vendor.trim() || null,
        receipt_date: date || null,
        subtotal: parseFloat(subtotal) || null,
        tax: parseFloat(tax) || null,
        total: totalNum,
        notes: notes.trim() || null,
        image_url: null as string | null,
      };

      const parsedItems = lineItems
        .filter(i => i.name.trim())
        .map(i => ({ name: i.name.trim(), price: parseFloat(i.price) || 0 }));

      const receipt = await submitReceipt(roomId, receiptData, parsedItems);

      if (file) {
        try {
          const imageUrl = await uploadReceiptImage(file, receipt.id);
          // Update receipt with image URL (fire and forget for UX; image shown on refresh)
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          await supabase.from('receipts').update({ image_url: imageUrl }).eq('id', receipt.id);
          receipt.image_url = imageUrl;
        } catch {
          // Image upload failure is non-fatal
        }
      }

      toast.success('Receipt submitted!');
      onSubmitted({ ...receipt, items: parsedItems.map((i, idx) => ({ id: String(idx), receipt_id: receipt.id, ...i })) });
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative glass w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 z-10" style={{ background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem 1rem 0 0' }}>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>Submit Receipt</h2>
              <p className="text-xs mt-0.5" style={{ color: '#8b95aa' }}>{step === 'upload' ? 'Step 1 of 2 — Upload' : 'Step 2 of 2 — Review & Confirm'}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" style={{ color: '#8b95aa' }} />
            </button>
          </div>

          {step === 'upload' ? (
            <div className="p-6 flex flex-col gap-5">
              {/* Upload area */}
              <div
                className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 cursor-pointer transition-colors hover:bg-white/5"
                style={{ borderColor: 'rgba(255,117,24,0.3)' }}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                {preview ? (
                  <img src={preview} alt="Receipt preview" className="max-h-48 rounded-lg object-contain" />
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,117,24,0.1)', border: '1px solid rgba(255,117,24,0.2)' }}>
                      <Camera className="w-7 h-7" style={{ color: '#FF7518' }} />
                    </div>
                    <p className="font-medium" style={{ color: '#f0f4ff' }}>Take a photo or upload receipt</p>
                    <p className="text-sm mt-1" style={{ color: '#8b95aa' }}>Tap to open camera or choose a file</p>
                  </>
                )}
              </div>

              {file && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#1a2235' }}>
                  <Upload className="w-4 h-4" style={{ color: '#8b95aa' }} />
                  <span className="text-sm truncate flex-1" style={{ color: '#f0f4ff' }}>{file.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="p-1 rounded hover:bg-white/10">
                    <X className="w-3.5 h-3.5" style={{ color: '#8b95aa' }} />
                  </button>
                </div>
              )}

              <button
                onClick={handleScan}
                disabled={!file || scanning}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: '#FF7518', color: '#fff' }}
              >
                {scanning ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</> : 'Scan Receipt with AI'}
              </button>

              <button
                onClick={() => { setStep('review'); }}
                className="text-center text-sm hover:underline"
                style={{ color: '#8b95aa' }}
              >
                Skip — enter details manually
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {preview && (
                <img src={preview} alt="Receipt" className="w-full max-h-32 object-contain rounded-xl" style={{ background: '#1a2235' }} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#8b95aa' }}>Vendor</label>
                  <input type="text" value={vendor} onChange={e => setVendor(e.target.value)} placeholder="e.g. Costco"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#8b95aa' }}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff', colorScheme: 'dark' }} />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: '#8b95aa' }}>Line Items</label>
                  <button type="button" onClick={() => setLineItems(li => [...li, { name: '', price: '' }])}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: '#FF7518', border: '1px solid rgba(255,117,24,0.3)' }}>
                    <Plus className="w-3 h-3" /> Add item
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="text" value={item.name}
                        onChange={e => { const li = [...lineItems]; li[idx].name = e.target.value; setLineItems(li); }}
                        placeholder="Item name" className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }} />
                      <input type="number" step="0.01" min="0" value={item.price}
                        onChange={e => { const li = [...lineItems]; li[idx].price = e.target.value; setLineItems(li); recalcTotal(); }}
                        placeholder="0.00" className="w-20 px-3 py-2 rounded-lg text-sm outline-none"
                        style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }} />
                      <button type="button" onClick={() => { setLineItems(li => li.filter((_, i) => i !== idx)); recalcTotal(); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Subtotal', value: subtotal, set: setSubtotal },
                  { label: 'Tax', value: tax, set: setTax },
                  { label: 'Total *', value: total, set: setTotal },
                ].map(({ label, value, set }) => (
                  <div key={label}>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#8b95aa' }}>{label}</label>
                    <input type="number" step="0.01" min="0" value={value} onChange={e => set(e.target.value)}
                      placeholder="0.00" className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: '#1a2235', border: `1px solid ${label.includes('*') ? 'rgba(255,117,24,0.3)' : 'rgba(255,255,255,0.08)'}`, color: '#f0f4ff' }} />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8b95aa' }}>Your Name *</label>
                <input type="text" value={yourName} onChange={e => setYourName(e.target.value)} required placeholder="e.g. Pranav B."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#8b95aa' }}>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..."
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep('upload')}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                  style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Back
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ background: '#FF7518', color: '#fff' }}>
                  {submitting ? 'Submitting...' : 'Submit Receipt'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
