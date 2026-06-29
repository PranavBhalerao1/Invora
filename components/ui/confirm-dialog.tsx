"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "./modal";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalBody className="px-6 pt-6">
        <div className="flex gap-4">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              destructive ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"
            }`}
          >
            <AlertTriangle className="size-5" />
          </div>
          <div className="flex-1 pt-0.5">
            <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "danger" : "primary"}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
