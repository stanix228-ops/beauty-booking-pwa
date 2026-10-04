import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { Header } from '../components/Header';
import { InfoCards } from '../components/InfoCards';
import { WorksGallery } from '../components/WorksGallery';
import { CategoryFilter } from '../components/CategoryFilter';
import { ServiceCard } from '../components/ServiceCard';
import { MasterPicker } from '../components/MasterPicker';
import { ServiceOptionsModal } from '../components/ServiceOptionsModal';
import { SlotPickerModal } from '../components/SlotPickerModal';
import { BookingFormModal } from '../components/BookingFormModal';
import { StickyBookingBar } from '../components/StickyBookingBar';
import { BottomNavigation } from '../components/BottomNavigation';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CalendarPlus, ShieldCheck, Heart, Coffee, WifiHigh } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import type { Service, ServiceOption } from '../../scripts/schema';
import { BookingEngine, type AvailableSlot } from '../lib/booking-store';
import { handlePhoneInput } from '../lib/phone';
import { InstallPromptModal } from '../components/InstallPromptModal';

export function ClientBookingPage() {
  const { tenant, isLoading, error } = useTenant();
  const navigate = useNavigate();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<ServiceOption[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);

  // Modals state
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [isSearchingBooking, setIsSearchingBooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [, setLookupRefreshTick] = useState(0);

  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Hook for accessible scroll reveal
  useScrollReveal();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-neutral-700 border-t-blue-500 animate-spin mb-4" />
        <p className="text-xs text-neutral-400 font-medium">Loading studio...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-red-950/40 border border-red-800 mb-3 text-red-400">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Studio Not Found</h2>
        <p className="text-xs text-neutral-400 max-w-xs mb-4">
          {error || 'Please check the URL in your browser address bar.'}
        </p>
      </div>
    );
  }

  // Filter services by category
  const filteredServices = selectedCategoryId
    ? tenant.services.filter((s) => s.categoryId === selectedCategoryId && s.isActive)
    : tenant.services.filter((s) => s.isActive);

  // Available options for current service
  const availableOptionsForCurrentService = tenant.options.filter(
    (opt) => opt.isActive && (!opt.serviceId || (selectedService && opt.serviceId === selectedService.id))
  );

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedOptions((prev) =>
      prev.filter((opt) => !opt.serviceId || opt.serviceId === service.id)
    );
  };

  const handleToggleOption = (option: ServiceOption) => {
    setSelectedOptions((prev) => {
      const exists = prev.some((o) => o.id === option.id);
      if (exists) {
        return prev.filter((o) => o.id !== option.id);
      }
      return [...prev, option];
    });
  };

  const handleSlotPicked = (slot: AvailableSlot, dateStr: string) => {
    setSelectedSlot(slot);
    setSelectedDateStr(dateStr);
    setIsBookingFormOpen(true);
  };

  const handleLookupPhoneChange = (val: string) => {
    setLookupPhone(handlePhoneInput(val, lookupPhone));
    if (lookupError) setLookupError(null);
  };

  const handleLookupBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim() || !tenant) return;
    setIsSearchingBooking(true);
    setLookupError(null);

    try {
      const found = await BookingEngine.findBookingsByPhone(tenant.slug, lookupPhone);
      if (found.length > 0) {
        const latest = found[found.length - 1];
        setIsLookupModalOpen(false);
        navigate(`/s/${tenant.slug}/b/${latest.token_hash || latest.id}`);
        return;
      }

      // Check last token
      const lastToken = localStorage.getItem(`beauty_last_booking_token_${tenant.slug}`);
      if (lastToken) {
        setIsLookupModalOpen(false);
        navigate(`/s/${tenant.slug}/b/${lastToken}`);
        return;
      }

      setLookupError('No active appointments found for this phone number. Please verify the number or book a new appointment.');
    } catch {
      setLookupError('Error finding your appointment. Please try again.');
    } finally {
      setIsSearchingBooking(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--tenant-bg, #000000)',
        color: 'var(--tenant-text, #FFFFFF)',
      }}
      className="min-h-screen flex flex-col pb-24"
    >
      {/* 1. Header with large photo, title, contacts, and moving glass button */}
      <Header
        onBookClick={() => {
          const el = document.getElementById('booking-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onInstallClick={() => setIsInstallModalOpen(true)}
      />

      {/* 2. 3 Dynamic Info Cards (configured per studio, not hardcoded) */}
      <InfoCards />

      {/* 3. Portfolio Works Gallery */}
      <WorksGallery />

      <main className="max-w-lg mx-auto w-full px-4 pt-2 space-y-8 flex-1">
        {/* 4. Booking Section with prominent title "Book Appointment" */}
        <section id="booking-section" className="reveal-section space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border border-white/20 bg-white/5 text-neutral-200 mb-1.5">
                <CalendarPlus size={14} weight="bold" className="text-white" />
                <span>Online Booking</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
                Book Appointment
              </h2>
            </div>
            <span className="text-xs text-[#8E8E93]">
              {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
            </span>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />

          {/* Services List */}
          <div id="services-section" className="space-y-3">
            {filteredServices.map((service) => {
              const isSelected = selectedService?.id === service.id;
              const hasOptions = availableOptionsForCurrentService.length > 0;

              return (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={isSelected}
                  selectedOptions={isSelected ? selectedOptions : []}
                  onSelectService={handleSelectService}
                  onOpenOptions={(s) => {
                    setSelectedService(s);
                    setIsOptionsOpen(true);
                  }}
                  hasOptions={hasOptions}
                />
              );
            })}
          </div>
        </section>

        {/* 5. Master Stylists Section */}
        <section className="reveal-section pt-4 border-t border-white/10">
          <MasterPicker
            masters={tenant.masters}
            selectedService={selectedService}
            selectedMasterId={selectedMasterId}
            onSelectMaster={setSelectedMasterId}
          />
        </section>

        {/* 6. Studio Amenities & Atmosphere */}
        <section className="reveal-section p-4 rounded-2xl border border-white/10 bg-[#0D0D11] backdrop-blur-md space-y-3 shadow-lg">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Studio Amenities & Atmosphere
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-neutral-200">
            <div className="flex items-center gap-2">
              <Coffee size={16} weight="duotone" className="text-white" />
              <span>Specialty Coffee & Matcha Bar</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} weight="duotone" className="text-white" />
              <span>Autoclave Sterilization</span>
            </div>
            <div className="flex items-center gap-2">
              <WifiHigh size={16} weight="duotone" className="text-white" />
              <span>Fast Wi-Fi & Charging</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} weight="duotone" className="text-white" />
              <span>7-Day Perfection Guarantee</span>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Booking Bar (when a service is selected) */}
      <StickyBookingBar
        selectedService={selectedService}
        selectedOptions={selectedOptions}
        onOpenSlotPicker={() => setIsSlotPickerOpen(true)}
      />

      {/* Glass Bottom Navigation: Home · Services · My Booking */}
      {!selectedService && (
        <BottomNavigation
          onOpenMyBooking={() => setIsLookupModalOpen(true)}
        />
      )}

      {/* Modals */}
      <ServiceOptionsModal
        open={isOptionsOpen}
        onOpenChange={setIsOptionsOpen}
        service={selectedService}
        availableOptions={availableOptionsForCurrentService}
        selectedOptions={selectedOptions}
        onToggleOption={handleToggleOption}
        onConfirm={() => {
          setIsOptionsOpen(false);
          setIsSlotPickerOpen(true);
        }}
      />

      <SlotPickerModal
        open={isSlotPickerOpen}
        onOpenChange={setIsSlotPickerOpen}
        service={selectedService}
        options={selectedOptions}
        masterId={selectedMasterId}
        onSelectSlot={handleSlotPicked}
      />

      <BookingFormModal
        open={isBookingFormOpen}
        onOpenChange={setIsBookingFormOpen}
        service={selectedService}
        options={selectedOptions}
        master={tenant.masters.find((m) => m.id === selectedMasterId) || null}
        slot={selectedSlot}
        dateStr={selectedDateStr}
      />

      {/* "My Appointment" Quick Lookup Modal */}
      {isLookupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0D11] border border-white/15 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-white">My Appointment</h3>
              <button
                type="button"
                onClick={() => {
                  setIsLookupModalOpen(false);
                  setLookupError(null);
                }}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick saved booking banner if present */}
            {(() => {
              try {
                const savedRaw = localStorage.getItem(`beauty_active_booking_${tenant.slug}`);
                if (!savedRaw) return null;
                const saved = JSON.parse(savedRaw);
                return (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-neutral-300">Saved Booking</span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Active</span>
                    </div>
                    <div className="text-xs text-white font-medium">
                      {saved.serviceName || 'Service'} · {saved.clientName}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsLookupModalOpen(false);
                          navigate(`/s/${tenant.slug}/b/${saved.token || saved.bookingId}`);
                        }}
                        className="flex-1 h-9 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center cursor-pointer shadow-md"
                      >
                        View Booking →
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (saved.bookingId) {
                            await BookingEngine.deleteBooking(saved.bookingId, tenant.slug);
                          }
                          setLookupRefreshTick((t) => t + 1);
                        }}
                        className="px-3 h-9 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-950/40 text-xs font-medium transition-colors flex items-center justify-center cursor-pointer"
                        title="Delete booking"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })()}

            <p className="text-xs text-[#8E8E93]">
              Or enter your phone number to find your active reservation:
            </p>

            <form onSubmit={handleLookupBooking} className="space-y-3">
              <input
                type="tel"
                value={lookupPhone}
                onChange={(e) => handleLookupPhoneChange(e.target.value)}
                placeholder="+1 (310) 555-0199"
                className="w-full h-11 px-3.5 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-white transition-colors"
                required
              />

              {lookupError && (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800 text-[11px] text-red-300">
                  {lookupError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSearchingBooking}
                className="w-full h-11 rounded-xl bg-white text-black font-bold text-sm cursor-pointer hover:bg-neutral-100 shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2"
              >
                {isSearchingBooking ? 'Searching...' : 'Find Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PWA Home Screen Icon Modal */}
      <InstallPromptModal
        open={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
