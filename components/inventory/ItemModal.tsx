'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { InventoryItem, Category, CATEGORIES, deriveStatus, deriveTotalAmount } from '@/types/inventory';

interface ItemModalProps {
  item?: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}

const UNIT_SUGGESTIONS = ['lbs', 'gallon', '4-pack', 'box of 48', 'case', 'bag', 'bottle', 'pack of 100', 'set', 'disc', 'kit', 'sheet', 'notebook'];

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
  const [form, setForm] = useState(item ? {
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    needed: item.needed,
    arrived: item.arrived,
    assignedTo: item.assignedTo ?? '',
    notes: item.notes ?? '',
  } : defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const preview = deriveTotalAmount(form.quantity, form.unit || 'unit');

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.unit.trim()) e.unit = 'Unit is required';
    if (form.quantity < 1) e.quantity = 'Quantity must be at least 1';
    if (form.needed < 1) e.needed = 'Needed must be at least 1';
    if (form.arrived < 0) e.arrived = 'Arrived cannot be negative';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

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

  const filteredSuggestions = UNIT_SUGGESTIONS.filter(s =>
    form.unit && s.toLowerCase().includes(form.unit.toLowerCase()) && s !== form.unit
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative glass w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)', borderRadius: '1rem 1rem 0 0' }}>
            <h2 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>{item ? 'Edit Item' : 'Add New Item'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" style={{ color: '#8b95aa' }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {form.unit && (
              <div className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(255,117,24,0.1)', border: '1px solid rgba(255,117,24,0.2)', color: '#FF7518' }}>
                Preview: {preview}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Name *</label>
              <input
                type="text" value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                placeholder="e.g. Basmati Rice"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#1a2235', border: `1px solid ${errors.name ? '#f87171' : 'rgba(255,255,255,0.08)'}`, color: '#f0f4ff' }}
              />
              {errors.name && <p className="text-xs mt-1 text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Quantity (Needed) *</label>
                <input type="number" min={1} value={form.quantity}
                  onChange={e => { setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1, needed: parseInt(e.target.value) || 1 })); setErrors(er => ({ ...er, quantity: '', needed: '' })); }}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#1a2235', border: `1px solid ${errors.quantity ? '#f87171' : 'rgba(255,255,255,0.08)'}`, color: '#f0f4ff' }}
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Unit *</label>
                <input type="text" value={form.unit}
                  onChange={e => { setForm(f => ({ ...f, unit: e.target.value })); setShowSuggestions(true); setErrors(er => ({ ...er, unit: '' })); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="e.g. 20 lb bag"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: '#1a2235', border: `1px solid ${errors.unit ? '#f87171' : 'rgba(255,255,255,0.08)'}`, color: '#f0f4ff' }}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 left-0 right-0 rounded-lg overflow-hidden shadow-xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {filteredSuggestions.slice(0, 5).map(s => (
                      <button key={s} type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                        style={{ color: '#f0f4ff' }}
                        onMouseDown={() => { setForm(f => ({ ...f, unit: s })); setShowSuggestions(false); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {errors.unit && <p className="text-xs mt-1 text-red-400">{errors.unit}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Arrived So Far</label>
              <input type="number" min={0} max={form.needed} value={form.arrived}
                onChange={e => { setForm(f => ({ ...f, arrived: parseInt(e.target.value) || 0 })); setErrors(er => ({ ...er, arrived: '' })); }}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Assigned To</label>
              <input type="text" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                placeholder="Optional name"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes..." rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors" style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button type="submit" className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: '#FF7518', color: '#fff' }}>
                {item ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
