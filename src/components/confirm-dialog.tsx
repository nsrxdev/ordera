'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Delete',
  confirmVariant = 'destructive',
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  confirmVariant?: 'destructive' | 'default';
  onConfirm: () => void | Promise<void>;
  children?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-md rounded-2xl border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-800">{title}</DialogTitle>
          <DialogDescription className="text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-lg text-slate-500 font-bold uppercase tracking-wider text-[10px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant === 'destructive' ? 'destructive' : 'default'}
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
            className="rounded-lg px-10 font-bold uppercase tracking-wider text-[10px]"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

