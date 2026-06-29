'use client';

import * as React from 'react';
import { PackagePlus, Pencil } from 'lucide-react';
import { InventoryItem, Category, CATEGORIES, deriveStatus, deriveTotalAmount } from '@/types/inventory';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface ItemModalProps {
  open: boolean;
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

const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }));

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

type Form = typeof defaultForm;

export default function ItemModal({ open, item, onSave, onClose }: ItemModalProps) {
  const [form, setForm] = React.useState<Form>(defaultForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Re-seed the form whenever the modal opens (for add or for editing a specific item).
  React.useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setForm(
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
      setErrors({});
      setShowSuggestions(false);
    });
  }, [open, item]);

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
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title={item ? 'Edit item' : 'Add inventory item'}
          description={
            item ? 'Update the details for this item.' : 'Track something new and set its target.'
          }
          onClose={onClose}
          icon={
            item ? (
              <Pencil className="size-5 text-accent" />
            ) : (
              <PackagePlus className="size-5 text-accent" />
            )
          }
        />

        <ModalBody className="max-h-[60vh] space-y-4 overflow-y-auto pt-2">
          {/* Name */}
          <Field label="Item name" htmlFor="item-name">
            <Input
              id="item-name"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((er) => ({ ...er, name: '' }));
              }}
              placeholder="e.g. Basmati Rice"
              aria-invalid={!!errors.name}
              autoFocus
            />
            {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
                options={categoryOptions}
                className="w-full"
              />
            </Field>
            <Field label="Assigned to" htmlFor="item-assignee">
              <Input
                id="item-assignee"
                value={form.assignedTo}
                onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                placeholder="Optional name"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity" htmlFor="item-qty">
              <Input
                id="item-qty"
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
              {errors.quantity && <p className="text-xs text-danger">{errors.quantity}</p>}
            </Field>

            <Field label="Unit" htmlFor="item-unit" className="relative">
              <Input
                id="item-unit"
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
                <div className="absolute top-full right-0 left-0 z-10 mt-1.5 overflow-hidden rounded-xl border border-line bg-elevated p-1 shadow-pop">
                  {filteredSuggestions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] text-ink-soft transition-colors hover:bg-subtle"
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
              {errors.unit && <p className="text-xs text-danger">{errors.unit}</p>}
            </Field>
          </div>

          {/* Preview */}
          {form.unit && (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-accent-soft px-2.5 py-1.5 text-[13px] font-medium text-accent">
              Preview: {preview}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Needed" htmlFor="item-needed">
              <Input
                id="item-needed"
                type="number"
                min={1}
                value={form.needed}
                onChange={(e) => {
                  setForm((f) => ({ ...f, needed: parseInt(e.target.value) || 1 }));
                  setErrors((er) => ({ ...er, needed: '' }));
                }}
                aria-invalid={!!errors.needed}
              />
              {errors.needed && <p className="text-xs text-danger">{errors.needed}</p>}
            </Field>

            <Field label="Arrived so far" htmlFor="item-arrived">
              <Input
                id="item-arrived"
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
              {errors.arrived && <p className="text-xs text-danger">{errors.arrived}</p>}
            </Field>
          </div>

          <Field label="Notes" htmlFor="item-notes">
            <Textarea
              id="item-notes"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes…"
              rows={2}
            />
          </Field>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!form.name.trim()}>
            {item ? 'Save changes' : 'Add item'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
