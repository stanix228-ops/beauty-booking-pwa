import React, { useState } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { BookingEngine, type AvailableSlot } from '../lib/booking-store';
import { handlePhoneInput } from '../lib/phone';
import { useTenant } from '../context/TenantContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ShieldCheck } from '@phosphor-icons/react';
import type { Service, ServiceOption, Master } from '../../scripts/schema';

interface BookingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  options: ServiceOption[];
  master: Master | null;
  slot: AvailableSlot | null;
  dateStr: string | null;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  open,
  onOpenChange,
  service,
  options,
  master,
  slot,
  dateStr,
}) => {
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({});
  const [error, setError] = useState<string | null>(null);

  if (!service || !slot || !dateStr || !tenant) return null;

  const totalOptionsPrice = options.reduce((sum, o) => sum + o.price, 0);
  const totalOptionsDuration = options.reduce((sum, o) => sum + o.durationMin, 0);
  const totalPrice = service.price + totalOptionsPrice;
  const totalDuration = service.durationMin + totalOptionsDuration;

  // Format date readable in US English
  const dateObj = new Date(`${dateStr}T${slot.time}:00`);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const handlePhoneChange = (val: string) => {
    const formatted = handlePhoneInput(val, phone);
    setPhone(formatted);
    if (fieldErrors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (fieldErrors.name) {
      setFieldErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    const cleanDigits = phone.replace(/\D/g, '');
    const errMap: { name?: string; phone?: string } = {};

    if (!trimmedName || trimmedName.length < 2) {
      errMap.name = 'Please enter your name (at least 2 letters)';
    }

    if (!cleanDigits || cleanDigits.length < 10) {
      errMap.phone = 'Please enter a valid 10-digit phone number';
    }

    if (Object.keys(errMap).length > 0) {
      setFieldErrors(errMap);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      // Deterministic idempotency key to prevent double bookings
      const idempotencyKey = `${tenant.slug}-${service.id}-${slot.datetime}-${cleanDigits}`;

      const res = await BookingEngine.createBooking({
        tenantSlug: tenant.slug,
        serviceId: service.id,
        optionIds: options.map((o) => o.id),
        masterId: master ? master.id : null,
        startAt: slot.datetime,
        clientName: trimmedName,
        clientPhone: phone.trim(),
        notes: notes.trim() || undefined,
        idempotencyKey,
      });

      const accessToken = res.accessToken || (res as any).token;

      // 1. Save token for "My Booking" in bottom navigation
      localStorage.setItem(`beauty_last_booking_token_${tenant.slug}`, accessToken);
      localStorage.setItem(`beauty_last_booking_phone_${tenant.slug}`, phone.trim());

      // 2. Save active booking data in localStorage for guaranteed retrieval
      const activeBookingData = {
        bookingId: res.bookingId,
        bookingNumber: res.bookingNumber,
        token: accessToken,
        tenantSlug: tenant.slug,
        serviceName: service.name,
        price: totalPrice,
        startAt: slot.datetime,
        clientName: trimmedName,
        clientPhone: phone.trim(),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`beauty_active_booking_${tenant.slug}`, JSON.stringify(activeBookingData));

      // 3. Keep in recent bookings list
      try {
        const recent = JSON.parse(localStorage.getItem('beauty_my_bookings') || '[]');
        recent.unshift(activeBookingData);
        localStorage.setItem('beauty_my_bookings', JSON.stringify(recent.slice(0, 10)));
      } catch {}

      onOpenChange(false);
      // Navigate to direct booking status screen with crypto access token
      navigate(`/s/${tenant.slug}/b/${accessToken}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to create appointment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Appointment"
      description="Review your visit details and enter contact information"
    >
      <form onSubmit={handleSubmit} data-vaul-no-drag className="space-y-4">
        {/* Appointment Summary Card */}
        <div className="p-3.5 rounded-2xl border border-white/10 bg-[#0D0D11] backdrop-blur-md space-y-2.5 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm text-white">{service.name}</h4>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                {master ? `Artist: ${master.name}` : 'Any Available Artist'}
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold text-sm text-white">
                ${totalPrice}
              </span>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">{totalDuration} min</p>
            </div>
          </div>

          {options.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <span className="text-[11px] text-[#8E8E93] font-medium">Add-ons:</span>
              {options.map((opt) => (
                <div key={opt.id} className="flex justify-between text-xs text-neutral-300">
                  <span>+ {opt.name}</span>
                  <span>+${opt.price}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} weight="bold" className="text-white" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} weight="bold" className="text-white" />
              <span className="font-semibold">{slot.time}</span>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              required
              autoComplete="name"
              autoCapitalize="words"
              className={fieldErrors.name ? 'border-red-500' : ''}
            />
            {fieldErrors.name && (
              <p className="text-[11px] text-red-400 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <Input
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+1 (310) 555-0199"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={fieldErrors.phone ? 'border-red-500' : ''}
            />
            {fieldErrors.phone && (
              <p className="text-[11px] text-red-400 mt-1">{fieldErrors.phone}</p>
            )}
            <p className="text-[11px] text-neutral-500 mt-1">
              No passwords required. Your private link to manage your booking will be sent here.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Special Requests or Notes (optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. custom art, gel removal, allergies"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-sm font-bold rounded-xl cursor-pointer active:scale-98 transition-all bg-white text-black hover:bg-neutral-100 shadow-[0_4px_25px_rgba(255,255,255,0.25)]"
          >
            {isSubmitting ? 'Securing slot...' : `Confirm Booking ($${totalPrice})`}
          </Button>

          <p className="text-[10px] text-neutral-400 text-center mt-2.5 flex items-center justify-center gap-1">
            <ShieldCheck size={14} className="text-white" />
            <span>Guaranteed atomic slot lock · No double bookings</span>
          </p>
        </div>
      </form>
    </BottomSheet>
  );
};
