'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { InventoryItem, Category, CATEGORIES, deriveStatus, deriveTotalAmount } from '@/types/inventory';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ItemModalProps {
  item?: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}

const UNIT_SUGGESTIONS = [
  'lbs',
  'gallon',
  '4-pack',
  'box of 48',
  'case',
  'bag',
  'bottle',
  'pack of 100',
  'set',
  'disc',
  'kit',
  'sheet',
  'notebook',
];

const defaultForm = {
  name: '',
  category: 'Food & Grains' as Category,
  quantity: 1,
  unit: '',
  needed: 1,
  arrived: 0,
  assignedTo: '',
  notes: '',
};

export default function ItemModal({ item, onSave, onClose }: ItemModalProps) {
  const [form, setForm] = useState(
    item
      ? {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          needed: item.needed,
          arrived: item.arrived,
          assignedTo: item.assignedTo ?? '',
          notes: item.notes ?? '',
        }
      : defaultForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const preview = deriveTotalAmount(form.quantity, form.unit || 'unit');

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.unit.trim()) e.unit = 'Unit is required';
    if (form.quantity < 1) e.quantity = 'Must be at least 1';
    if (form.needed < 1) e.needed = 'Must be at least 1';
    if (form.arrived < 0) e.arrived = 'Cannot be negative';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const now = new Date().toISOString();
    const saved: InventoryItem = {
      id: item?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      category: form.category,
      quantity: form.quantity,
      unit: form.unit.trim(),
      totalAmount: deriveTotalAmount(form.quantity, form.unit.trim()),
      needed: form.needed,
      arrived: Math.min(form.arrived, form.needed),
      status: deriveStatus(Math.min(form.arrived, form.needed), form.needed),
      assignedTo: form.assignedTo.trim() || undefined,
      notes: form.notes.trim() || undefined,
      createdAt: item?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(saved);
  }

  const filteredSuggestions = UNIT_SUGGESTIONS.filter(
    (s) => form.unit && s.toLowerCase().includes(form.unit.toLowerCase()) && s !== form.unit
  );

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
            <h2 className="text-base font-semibold text-foreground">
              {item ? 'Edit Item' : 'Add Item'}
            </h2>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            {/* Preview */}
            {form.unit && (
              <div className="px-3 py-2 rounded-lg text-xs font-medium bg-accent text-accent-foreground">
                Preview: {preview}
              </div>
            )}

            {/* ── Identity ── */}
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    setErrors((er) => ({ ...er, name: '' }));
                  }}
                  placeholder="e.g. Basmati Rice"
                  aria-invalid={!!errors.name}
                  autoFocus
                />
                {errors.name && (
                  <p className="text-xs mt-1 text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Category
                </label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
                >
                  <SelectTrigger className="bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* ── Quantity ── */}
            <div className="flex flex-col gap-4">
              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Quantity <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 1;
                      setForm((f) => ({ ...f, quantity: v, needed: v }));
                      setErrors((er) => ({ ...er, quantity: '', needed: '' }));
                    }}
                    aria-invalid={!!errors.quantity}
                  />
                  {errors.quantity && (
                    <p className="text-xs mt-1 text-destructive">{errors.quantity}</p>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Unit <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    value={form.unit}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, unit: e.target.value }));
                      setShowSuggestions(true);
                      setErrors((er) => ({ ...er, unit: '' }));
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="e.g. 20 lb bag"
                    aria-invalid={!!errors.unit}
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg overflow-hidden shadow-lg">
                      {filteredSuggestions.slice(0, 5).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          onMouseDown={() => {
                            setForm((f) => ({ ...f, unit: s }));
                            setShowSuggestions(false);
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.unit && (
                    <p className="text-xs mt-1 text-destructive">{errors.unit}</p>
                  )}
                </div>
              </div>

              {/* Needed + Arrived */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Needed
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={form.needed}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, needed: parseInt(e.target.value) || 1 }));
                      setErrors((er) => ({ ...er, needed: '' }));
                    }}
                    aria-invalid={!!errors.needed}
                  />
                  {errors.needed && (
                    <p className="text-xs mt-1 text-destructive">{errors.needed}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Arrived So Far
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={form.needed}
                    value={form.arrived}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, arrived: parseInt(e.target.value) || 0 }));
                      setErrors((er) => ({ ...er, arrived: '' }));
                    }}
                    aria-invalid={!!errors.arrived}
                  />
                  {errors.arrived && (
                    <p className="text-xs mt-1 text-destructive">{errors.arrived}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* ── Meta ── */}
            <div className="flex flex-col gap-4">
              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Assigned To
                </label>
                <Input
                  type="text"
                  value={form.assignedTo}
                  onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                  placeholder="Optional name"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional notes…"
                  rows={2}
                  className="textarea-field"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {item ? 'Save Changes' : 'Add Item'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
