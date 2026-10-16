import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { Header } from '../components/Header';
import { InfoCards } from '../components/InfoCards';
import { WorksGallery } from '../components/WorksGallery';
import { CategoryFilter } from '../components/CategoryFilter';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceOptionsModal } from '../components/ServiceOptionsModal';
import { SlotPickerModal } from '../components/SlotPickerModal';
import { BookingFormModal } from '../components/BookingFormModal';
import { StickyBookingBar } from '../components/StickyBookingBar';
import { BottomNavigation } from '../components/BottomNavigation';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CalendarPlus, ShieldCheck, Heart, Coffee, WifiHigh, LockKey } from '@phosphor-icons/react';
import { useNavigate, Link } from 'react-router-dom';
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
  const selectedMasterId: string | null = null;

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

  // Group services by category in displayOrder
  const categoriesToDisplay = [...tenant.categories]
    .filter((cat) => cat.isActive && (!selectedCategoryId || cat.id === selectedCategoryId))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const groupedServices = categoriesToDisplay
    .map((cat) => ({
      category: cat,
      services: tenant.services
        .filter((s) => s.categoryId === cat.id && s.isActive)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
    }))
    .filter((group) => group.services.length > 0);

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

      setLookupError('Активных записей по указанному номеру не найдено. Проверьте правильность номера или оформите новую запись.');
    } catch {
      setLookupError('Ошибка при поиске записи. Попробуйте еще раз.');
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
        {/* 4. Booking Section with prominent title "Запись в студию" */}
        <section id="booking-section" className="reveal-section space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border border-white/20 bg-white/5 text-neutral-200 mb-1.5">
                <CalendarPlus size={14} weight="bold" className="text-white" />
                <span>Онлайн-бронирование</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
                Запись в студию
              </h2>
            </div>
            <span className="text-xs text-[#8E8E93]">
              {filteredServices.length} {filteredServices.length === 1 ? 'услуга' : 'услуг'}
            </span>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />

          {/* Services List grouped by category */}
          <div id="services-section" className="space-y-6">
            {groupedServices.map(({ category, services }) => (
              <div key={category.id} className="space-y-3">
                {/* Category group badge header */}
                <div className="flex items-center gap-2 pt-2 pb-0.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white shadow-sm backdrop-blur-md">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--tenant-accent, #8E283E)' }}
                    />
                    <span className="text-xs font-bold tracking-wider uppercase text-white">
                      {category.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      ({services.length})
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/15 to-transparent" />
                </div>

                {/* Services belonging to this group */}
                <div className="space-y-3">
                  {services.map((service) => {
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
              </div>
            ))}
          </div>
        </section>

        {/* Studio Amenities & Atmosphere */}
        <section className="reveal-section p-4 rounded-2xl border border-white/10 bg-[#0D0D11] backdrop-blur-md space-y-3 shadow-lg">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            О сервисе и комфорте студии
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-neutral-200">
            <div className="flex items-center gap-2">
              <Coffee size={16} weight="duotone" className="text-white" />
              <span>Specialty кофе и чай</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} weight="duotone" className="text-white" />
              <span>Стерилизация СанПиН</span>
            </div>
            <div className="flex items-center gap-2">
              <WifiHigh size={16} weight="duotone" className="text-white" />
              <span>Быстрый Wi-Fi и зарядки</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} weight="duotone" className="text-white" />
              <span>Гарантия на покрытие 7 дней</span>
            </div>
          </div>
        </section>

        {/* Studio Footer */}
        <footer className="mt-14 mb-24 px-4 py-8 border-t border-white/10 text-center space-y-2.5">
          <p className="text-xs text-neutral-400 font-medium">
            © {new Date().getFullYear()} {tenant.name}. Все права защищены.
          </p>
          <p className="text-[11px] text-neutral-500">
            {tenant.address} · {tenant.phone}
          </p>
          <div className="pt-2">
            <Link
              to={`/s/${tenant.slug}/owner/login`}
              className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors py-1.5 px-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
              title="Панель администратора студии"
            >
              <LockKey size={13} />
              <span>Вход для сотрудников</span>
            </Link>
          </div>
        </footer>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0D11] border border-white/15 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-white">Моя запись</h3>
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
                      <span className="text-[11px] font-semibold text-neutral-300">Сохраненная запись</span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Найдена</span>
                    </div>
                    <div className="text-xs text-white font-medium">
                      {saved.serviceName || 'Услуга'} · {saved.clientName}
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
                        Открыть запись →
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
                        title="Удалить запись"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })()}

            <p className="text-xs text-[#8E8E93]">
              Или введите ваш номер телефона для поиска актуального бронирования:
            </p>

            <form onSubmit={handleLookupBooking} className="space-y-3">
              <input
                type="tel"
                value={lookupPhone}
                onChange={(e) => handleLookupPhoneChange(e.target.value)}
                placeholder="+7 (999) 000-00-00"
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
                {isSearchingBooking ? 'Поиск...' : 'Найти запись'}
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
