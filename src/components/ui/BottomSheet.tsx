import React from 'react';
import { Drawer } from 'vaul';

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onOpenChange, title, description, children }: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity" />
        <Drawer.Content
          style={{
            backgroundColor: 'var(--tenant-bg, #0D0D11)',
            borderColor: 'var(--tenant-card-border, rgba(212, 175, 55, 0.15))',
          }}
          className="border-t fixed bottom-0 left-0 right-0 max-h-[90vh] rounded-t-[28px] z-50 flex flex-col focus:outline-none shadow-2xl"
        >
          <div className="p-4 pb-0 flex-1 overflow-y-auto max-w-lg mx-auto w-full">
            {/* Grab handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-neutral-700/60 mb-4" />

            {title && (
              <Drawer.Title
                className="text-lg font-semibold font-heading mb-1 text-center"
                style={{ color: 'var(--tenant-text, #FAF8F5)' }}
              >
                {title}
              </Drawer.Title>
            )}
            {description && (
              <Drawer.Description
                className="text-xs text-center mb-4"
                style={{ color: 'var(--tenant-muted, #8E8E93)' }}
              >
                {description}
              </Drawer.Description>
            )}

            <div className="mt-2 pb-6 safe-bottom">
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
