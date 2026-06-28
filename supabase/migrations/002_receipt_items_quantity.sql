-- Migration 002: receipt_items now stores quantity (text) instead of price
-- receipt-level total remains the only money field; subtotal/tax are removed

-- 1. Add quantity column with default so existing rows get '1'
alter table receipt_items
  add column quantity text not null default '1';

-- 2. Drop the legacy price column
--    Existing rows had price set; that data is intentionally discarded
--    because per-item pricing is no longer part of the data model.
alter table receipt_items
  drop column price;

-- 3. Remove unused subtotal and tax from receipts
--    total is the only money field going forward.
alter table receipts
  drop column subtotal;

alter table receipts
  drop column tax;
