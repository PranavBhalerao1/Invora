'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Plus, Trash2, Loader2 } from 'lucide-react';
import { submitReceipt, uploadReceiptImage } from '@/lib/supabase/receipts';
import { syncReceiptItemsToInventory } from '@/lib/supabase/receipt-inventory-sync';
import { GeminiReceiptResult, Receipt } from '@/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitReceiptModalProps {
  roomId: string;
  onClose: () => void;
  onSubmitted: (receipt: Receipt) => void;
}

type Step = 'upload' | 'review';

export default function SubmitReceiptModal({
  roomId,
  onClose,
  onSubmitted,
}: SubmitReceiptModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState('');
  const [lineItems, setLineItems] = useState<{ name: string; quantity: string }[]>([]);
  const [total, setTotal] = useState('');
  const [yourName, setYourName] = useState('');
  const [notes, setNotes] = useState('');

  function loadFile(f: File) {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  }

  async function handleScan() {
    if (!file) return;
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/scan-receipt', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to scan receipt');
      }
      const parsed: GeminiReceiptResult = await res.json();
      setVendor(parsed.vendor ?? '');
      setDate(parsed.date ?? '');
      setLineItems((parsed.items ?? []).map((i) => ({ name: i.name, quantity: String(i.quantity ?? 1) })));
      setTotal(String(parsed.total ?? ''));
      setStep('review');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
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
        total: totalNum,
        notes: notes.trim() || null,
        image_url: null as string | null,
      };

      const parsedItems = lineItems
        .filter((i) => i.name.trim())
        .map((i) => ({ name: i.name.trim(), quantity: i.quantity.trim() || '1' }));

      const receipt = await submitReceipt(roomId, receiptData, parsedItems);

      if (file) {
        try {
          const imageUrl = await uploadReceiptImage(file, receipt.id);
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          await supabase.from('receipts').update({ image_url: imageUrl }).eq('id', receipt.id);
          receipt.image_url = imageUrl;
        } catch {
          // Image upload failure is non-fatal
        }
      }

      const syncResult = await syncReceiptItemsToInventory(roomId, parsedItems);
      if (syncResult.failed === 0) {
        toast.success('Receipt saved and inventory updated');
      } else if (syncResult.succeeded > 0) {
        toast.warning('Receipt saved, but some inventory items could not be synced');
      } else {
        toast.warning('Receipt saved, but inventory sync failed');
      }

      onSubmitted({
        ...receipt,
        items: parsedItems.map((i, idx) => ({
          id: String(idx),
          receipt_id: receipt.id,
          name: i.name,
          quantity: i.quantity,
        })),
      });
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="relative bg-popover border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl shadow-black/40"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-popover border-b border-border rounded-t-xl">
            <div>
              <h2 className="text-base font-semibold text-foreground">Submit Receipt</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step === 'upload' ? 'Step 1 of 2 — Upload image' : 'Step 2 of 2 — Review & confirm'}
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-1 px-6 pt-4">
            {(['upload', 'review'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors',
                  step === s || (step === 'review' && i === 0) ? 'bg-primary' : 'bg-border'
                )}
              />
            ))}
          </div>

          {step === 'upload' ? (
            <div className="p-6 flex flex-col gap-4">
              {/* Drop zone */}
              <div
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 cursor-pointer transition-colors',
                  dragging
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                )}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
                onDrop={handleDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Receipt preview" className="max-h-48 rounded-lg object-contain" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-accent">
                      <Camera className="size-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {dragging ? 'Drop to upload' : 'Take a photo or upload receipt'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dragging ? '' : 'Tap, drag & drop, or choose a file'}
                    </p>
                  </>
                )}
              </div>

              {file && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <Upload className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}

              <Button onClick={handleScan} disabled={!file || scanning} className="w-full">
                {scanning ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Scanning…
                  </>
                ) : (
                  'Scan Receipt with AI'
                )}
              </Button>

              <button
                onClick={() => setStep('review')}
                className="text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip — enter details manually
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Receipt"
                  className="w-full max-h-32 object-contain rounded-xl bg-muted"
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Vendor
                  </label>
                  <Input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="e.g. Costco"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Items</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setLineItems((li) => [...li, { name: '', quantity: '1' }])}
                    className="text-primary hover:text-primary"
                  >
                    <Plus className="size-3" />
                    Add item
                  </Button>
                </div>
                {lineItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid gap-2 px-1" style={{ gridTemplateColumns: '1fr 72px 28px' }}>
                      <span className="text-xs text-muted-foreground/60">Name</span>
                      <span className="text-xs text-muted-foreground/60">Qty</span>
                      <span />
                    </div>
                    {lineItems.map((item, idx) => (
                      <div key={idx} className="grid gap-2" style={{ gridTemplateColumns: '1fr 72px 28px' }}>
                        <Input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const li = [...lineItems];
                            li[idx].name = e.target.value;
                            setLineItems(li);
                          }}
                          placeholder="Item name"
                        />
                        <Input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => {
                            const li = [...lineItems];
                            li[idx].quantity = e.target.value;
                            setLineItems(li);
                          }}
                          placeholder="1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setLineItems((li) => li.filter((_, i) => i !== idx))}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Total <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="0.00"
                  className="border-primary/30 focus-visible:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Your Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  placeholder="e.g. Pranav B."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional notes…"
                  className="textarea-field"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('upload')}>
                  Back
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Receipt'
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
