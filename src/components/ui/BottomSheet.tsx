import React from 'react';
import { Drawer } from 'vaul';
import { X } from '@phosphor-icons/react';

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onOpenChange, title, description, children }: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity" />
        <Drawer.Content
          style={{
            backgroundColor: '#0D0D11',
            borderColor: 'rgba(255, 255, 255, 0.12)',
          }}
          className="border-t fixed bottom-0 left-0 right-0 max-h-[92vh] rounded-t-[28px] z-50 flex flex-col focus:outline-none shadow-[0_-12px_40px_rgba(0,0,0,0.85)]"
        >
          {/* Header */}
          <div className="relative pt-3 pb-2 px-4 flex-shrink-0">
            <div className="mx-auto w-10 h-1.5 rounded-full bg-neutral-700/80 mb-2.5" />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={15} weight="bold" />
            </button>
            {title && (
              <Drawer.Title
                className="text-lg font-bold font-serif text-center text-white pt-1"
              >
                {title}
              </Drawer.Title>
            )}
            {description && (
              <Drawer.Description
                className="text-xs text-center text-[#8E8E93] mt-0.5"
              >
                {description}
              </Drawer.Description>
            )}
          </div>

          {/* Scrollable content with data-vaul-no-drag to prevent input touch from closing sheet */}
          <div
            data-vaul-no-drag
            className="p-4 pt-1 pb-6 flex-1 overflow-y-auto max-w-lg mx-auto w-full safe-bottom"
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
