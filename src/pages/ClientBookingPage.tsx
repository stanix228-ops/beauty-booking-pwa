import { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { Header } from '../components/Header';
import { CategoryFilter } from '../components/CategoryFilter';
import { ServiceCard } from '../components/ServiceCard';
import { MasterPicker } from '../components/MasterPicker';
import { ServiceOptionsModal } from '../components/ServiceOptionsModal';
import { SlotPickerModal } from '../components/SlotPickerModal';
import { BookingFormModal } from '../components/BookingFormModal';
import { StickyBookingBar } from '../components/StickyBookingBar';
import { AIAssistantWidget } from '../components/AIAssistantWidget';
import { Sparkles, Shield, Coffee, Wifi, Heart } from 'lucide-react';
import type { Service, ServiceOption } from '../../scripts/schema';
import type { AvailableSlot } from '../lib/booking-store';

export function ClientBookingPage() {
  const { tenant, isLoading, error } = useTenant();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<ServiceOption[]>([]);
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);

  // Modals state
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-neutral-700 border-t-amber-400 animate-spin mb-4" />
        <p className="text-xs text-neutral-400 font-medium">Загрузка студии...</p>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-red-950/40 border border-red-800 mb-3 text-red-400">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-neutral-100 mb-1">Студия не найдена</h2>
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
    if (selectedService?.id === service.id) {
      // Toggle
      return;
    }
    setSelectedService(service);
    // Reset options that are not applicable to the new service
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col pb-28">
      {/* Header */}
      <Header />

      {/* Categories Bar */}
      <CategoryFilter
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      <main className="max-w-lg mx-auto w-full px-4 pt-5 space-y-7 flex-1">
        {/* Services Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-neutral-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--tenant-accent)' }} />
              <span>Услуги ногтевого сервиса</span>
            </h2>
            <span className="text-xs text-neutral-400">
              {filteredServices.length} {filteredServices.length === 1 ? 'услуга' : 'услуг'}
            </span>
          </div>

          <div className="space-y-3">
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

        {/* Master Stylist Selection */}
        <section className="pt-2 border-t border-neutral-900">
          <MasterPicker
            masters={tenant.masters}
            selectedService={selectedService}
            selectedMasterId={selectedMasterId}
            onSelectMaster={setSelectedMasterId}
          />
        </section>

        {/* Gallery Preview */}
        {tenant.assets.gallery && tenant.assets.gallery.length > 0 && (
          <section className="pt-2 border-t border-neutral-900 space-y-3">
            <h3 className="text-sm font-semibold text-neutral-200">
              Галерея работ студии
            </h3>
            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
              {tenant.assets.gallery.slice(0, 3).map((imgUrl, idx) => (
                <div key={idx} className="aspect-square bg-neutral-900 overflow-hidden relative group">
                  <img
                    src={imgUrl}
                    alt={`Пример работы ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Studio Amenities */}
        <section className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            О сервисе и комфорте в студии
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Specialty кофе и матча</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Стерилизация по СанПиН</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-sky-400" />
              <span>Быстрый Wi-Fi и зарядки</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span>Одноразовые пилочки</span>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Booking Bar */}
      <StickyBookingBar
        selectedService={selectedService}
        selectedOptions={selectedOptions}
        onOpenSlotPicker={() => setIsSlotPickerOpen(true)}
      />

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
    </div>
  );
}
