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
import { AIAssistantWidget } from '../components/AIAssistantWidget';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CalendarPlus, ShieldCheck, Heart, Coffee, WifiHigh } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import type { Service, ServiceOption } from '../../scripts/schema';
import type { AvailableSlot } from '../lib/booking-store';

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
  const [lookupPhone, setLookupPhone] = useState('');

  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Hook for accessible scroll reveal
  useScrollReveal();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-neutral-700 border-t-blue-500 animate-spin mb-4" />
        <p className="text-xs text-neutral-400 font-medium">Загрузка студии...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-red-950/40 border border-red-800 mb-3 text-red-400">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Студия не найдена</h2>
        <p className="text-xs text-neutral-400 max-w-xs mb-4">
          {error || 'Проверьте правильность адреса в строке браузера.'}
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

  const handleLookupBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;
    // Find booking from local session
    const lastToken = localStorage.getItem(`beauty_last_booking_token_${tenant.slug}`);
    if (lastToken) {
      setIsLookupModalOpen(false);
      navigate(`/s/${tenant.slug}/b/${lastToken}`);
    } else {
      alert('Активных записей по указанным данным не найдено. Вы можете оформить новую запись ниже.');
      setIsLookupModalOpen(false);
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
      />

      {/* 2. 3 Dynamic Info Cards (configured per studio, not hardcoded) */}
      <InfoCards />

      {/* 3. Portfolio Works Gallery */}
      <WorksGallery />

      <main className="max-w-lg mx-auto w-full px-4 pt-2 space-y-8 flex-1">
        {/* 4. Booking Section with prominent title "Запись в студию" */}
        <section id="booking-section" className="reveal-section space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--tenant-accent, #4690FF)' }}>
                <CalendarPlus size={16} weight="duotone" />
                <span>Онлайн-бронирование</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Запись в студию
              </h2>
            </div>
            <span className="text-xs text-neutral-400">
              {filteredServices.length} {filteredServices.length === 1 ? 'услуга' : 'услуг'}
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
        <section className="reveal-section p-4 rounded-2xl border border-white/10 bg-neutral-900/40 backdrop-blur-md space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            О сервисе и комфорте студии
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-neutral-200">
            <div className="flex items-center gap-2">
              <Coffee size={16} weight="duotone" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
              <span>Specialty кофе и чай</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} weight="duotone" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
              <span>Стерилизация СанПиН</span>
            </div>
            <div className="flex items-center gap-2">
              <WifiHigh size={16} weight="duotone" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
              <span>Быстрый Wi-Fi и зарядки</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} weight="duotone" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
              <span>Гарантия на покрытие 7 дней</span>
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

      {/* Glass Bottom Navigation: Главная · Услуги · Моя запись */}
      {!selectedService && (
        <BottomNavigation
          onOpenMyBooking={() => setIsLookupModalOpen(true)}
        />
      )}

      {/* AI Assistant Floating Widget */}
      <AIAssistantWidget />

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

      {/* "Моя запись" Quick Lookup Modal */}
      {isLookupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 p-5 rounded-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Моя запись</h3>
              <button
                type="button"
                onClick={() => setIsLookupModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Введите номер телефона, указанный при бронировании, чтобы открыть детали вашей записи:
            </p>
            <form onSubmit={handleLookupBooking} className="space-y-3">
              <input
                type="tel"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full h-11 px-3.5 rounded-xl bg-black border border-white/15 text-white text-sm focus:outline-none focus:border-blue-400"
                required
              />
              <button
                type="submit"
                className="w-full h-11 rounded-xl text-white font-semibold text-sm cursor-pointer"
                style={{ backgroundColor: 'var(--tenant-accent, #4690FF)' }}
              >
                Найти запись
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
