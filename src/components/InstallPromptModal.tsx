import React, { useState, useEffect } from 'react';
import { DeviceMobile, Share, PlusSquare, CheckCircle, X } from '@phosphor-icons/react';
import { useTenant } from '../context/TenantContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPromptModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const { tenant } = useTenant();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0D0D11] border border-white/15 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={15} weight="bold" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white flex-shrink-0">
            <DeviceMobile size={26} weight="bold" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-white">Add to Home Screen</h3>
            <p className="text-xs text-[#8E8E93]">Instant 1-tap booking from your phone</p>
          </div>
        </div>

        {isStandalone ? (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
            <CheckCircle size={32} weight="fill" className="text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-white">App is already installed on your device!</p>
            <p className="text-[11px] text-[#8E8E93]">Launch directly from your home screen without browser bars.</p>
          </div>
        ) : isIOS ? (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-neutral-300 leading-relaxed">
              Install on iPhone or iPad in 2 simple steps:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <Share size={18} weight="bold" className="text-white flex-shrink-0 mt-0.5" />
                <span className="text-neutral-200">1. Tap the <strong>Share</strong> button in the Safari bottom toolbar</span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <PlusSquare size={18} weight="bold" className="text-white flex-shrink-0 mt-0.5" />
                <span className="text-neutral-200">2. Select <strong>«Add to Home Screen»</strong> and tap Add</span>
              </div>
            </div>
            <p className="text-[11px] text-[#8E8E93] text-center pt-1">
              {tenant?.name || 'Lumi'} app icon will appear directly on your home screen.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-neutral-300">
              Install the studio PWA: lightning-fast launch, offline support, and 1-tap home screen access.
            </p>
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full h-12 rounded-xl bg-white text-black font-bold text-sm cursor-pointer hover:bg-neutral-100 shadow-[0_4px_25px_rgba(255,255,255,0.25)] transition-all flex items-center justify-center gap-2"
            >
              <DeviceMobile size={18} weight="bold" />
              <span>Add to Home Screen</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer text-center"
        >
          Close
        </button>
      </div>
    </div>
  );
};
