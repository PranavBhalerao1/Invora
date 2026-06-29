'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Camera, Check, Plus, ScanLine, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { submitReceipt, uploadReceiptImage } from '@/lib/supabase/receipts';
import { syncReceiptItemsToInventory } from '@/lib/supabase/receipt-inventory-sync';
import { GeminiReceiptResult, Receipt } from '@/types';
import { toast } from 'sonner';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Stepper } from '@/components/ui/stepper';
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
    if (!yourName.trim()) {
      toast.error('Your name is required');
      return;
    }
    const totalNum = parseFloat(total);
    if (!totalNum || totalNum <= 0) {
      toast.error('Total must be greater than 0');
      return;
    }

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
    <Modal open onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Submit receipt"
          description={
            step === 'upload'
              ? 'Upload a photo and let AI extract the details.'
              : 'Confirm the parsed details before saving.'
          }
          onClose={onClose}
          icon={<ScanLine className="size-5 text-accent" />}
        />

        <ModalBody className="max-h-[62vh] overflow-y-auto pt-2">
          <Stepper steps={['Upload', 'Review']} current={step === 'upload' ? 0 : 1} className="mb-5" />

          <AnimatePresence mode="wait">
            {step === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                {/* Drop zone */}
                <div
                  className={cn(
                    'relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed py-12 transition-colors',
                    dragging
                      ? 'border-accent bg-accent-soft'
                      : 'border-line-strong bg-surface hover:border-accent/40 hover:bg-subtle'
                  )}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
                  }}
                  onDrop={handleDrop}
                >
                  {!preview && <div className="absolute inset-0 bg-grid opacity-40 mask-fade-b" />}
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
                    <div className="relative flex flex-col items-center text-center">
                      <div className="flex size-16 items-center justify-center rounded-2xl border border-line bg-elevated shadow-card">
                        <Camera className="size-7 text-accent" />
                      </div>
                      <p className="mt-5 text-sm font-medium text-ink">
                        {dragging ? 'Drop to upload' : 'Take a photo or upload a receipt'}
                      </p>
                      <p className="mt-1 text-xs text-muted">Tap, drag &amp; drop, or choose a file</p>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="flex items-center gap-2 rounded-lg border border-line bg-subtle px-3 py-2">
                    <Upload className="size-4 shrink-0 text-muted" />
                    <span className="flex-1 truncate text-sm text-ink">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setStep('review')}
                  className="block w-full text-center text-xs text-muted transition-colors hover:text-ink"
                >
                  Skip — enter details manually
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                {preview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Receipt"
                    className="max-h-32 w-full rounded-xl border border-line bg-subtle object-contain"
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Vendor" htmlFor="receipt-vendor">
                    <Input
                      id="receipt-vendor"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="e.g. Costco"
                    />
                  </Field>
                  <Field label="Date" htmlFor="receipt-date">
                    <Input
                      id="receipt-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </Field>
                </div>

                {/* Line items */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-ink-soft">Items</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => setLineItems((li) => [...li, { name: '', quantity: '1' }])}
                      className="text-accent hover:text-accent-hover"
                    >
                      <Plus className="size-3" />
                      Add item
                    </Button>
                  </div>
                  {lineItems.length > 0 && (
                    <div className="space-y-2">
                      <div className="grid gap-2 px-1" style={{ gridTemplateColumns: '1fr 72px 28px' }}>
                        <span className="text-xs text-faint">Name</span>
                        <span className="text-xs text-faint">Qty</span>
                        <span />
                      </div>
                      {lineItems.map((item, idx) => (
                        <div key={idx} className="grid gap-2" style={{ gridTemplateColumns: '1fr 72px 28px' }}>
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const li = [...lineItems];
                              li[idx].name = e.target.value;
                              setLineItems(li);
                            }}
                            placeholder="Item name"
                          />
                          <Input
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
                            className="text-danger hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Total *" htmlFor="receipt-total">
                    <Input
                      id="receipt-total"
                      type="number"
                      step="0.01"
                      min="0"
                      value={total}
                      onChange={(e) => setTotal(e.target.value)}
                      placeholder="0.00"
                    />
                  </Field>
                  <Field label="Your name *" htmlFor="receipt-name">
                    <Input
                      id="receipt-name"
                      value={yourName}
                      onChange={(e) => setYourName(e.target.value)}
                      placeholder="e.g. Pranav B."
                      required
                    />
                  </Field>
                </div>

                <Field label="Notes" htmlFor="receipt-notes">
                  <Textarea
                    id="receipt-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Optional notes…"
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalBody>

        <ModalFooter>
          {step === 'review' && (
            <Button type="button" variant="outline" onClick={() => setStep('upload')} className="mr-auto">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step === 'upload' ? (
            <Button type="button" onClick={handleScan} disabled={!file} loading={scanning}>
              {!scanning && <Sparkles className="size-4" />}
              {scanning ? 'Scanning…' : 'Scan with AI'}
            </Button>
          ) : (
            <Button type="submit" loading={submitting}>
              <Check className="size-4" />
              Submit receipt
            </Button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  );
}
