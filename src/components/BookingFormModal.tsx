import React, { useState } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { BookingEngine, type AvailableSlot } from '../lib/booking-store';
import { useTenant } from '../context/TenantContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ShieldCheck } from '@phosphor-icons/react';
import { z } from 'zod';
import type { Service, ServiceOption, Master } from '../../scripts/schema';

const ClientBookingInputSchema = z.object({
  name: z.string().trim().min(2, 'Имя должно содержать минимум 2 буквы'),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{10,20}$/, 'Пожалуйста, введите корректный номер телефона'),
  notes: z.string().max(500).optional(),
});

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
  const [phone, setPhone] = useState('+7 ');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({});
  const [error, setError] = useState<string | null>(null);

  if (!service || !slot || !dateStr || !tenant) return null;

  const totalOptionsPrice = options.reduce((sum, o) => sum + o.price, 0);
  const totalOptionsDuration = options.reduce((sum, o) => sum + o.durationMin, 0);
  const totalPrice = service.price + totalOptionsPrice;
  const totalDuration = service.durationMin + totalOptionsDuration;

  // Format date readable in Russian
  const dateObj = new Date(`${dateStr}T${slot.time}:00`);
  const formattedDate = dateObj.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handlePhoneChange = (val: string) => {
    if (!val.startsWith('+7')) {
      setPhone('+7 ');
      return;
    }
    setPhone(val);
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

    // Validate using Zod
    const validationResult = ClientBookingInputSchema.safeParse({
      name,
      phone,
      notes: notes || undefined,
    });

    if (!validationResult.success) {
      const errMap: { name?: string; phone?: string } = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path[0] === 'name') errMap.name = issue.message;
        if (issue.path[0] === 'phone') errMap.phone = issue.message;
      }
      setFieldErrors(errMap);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      // Deterministic idempotency key to prevent double bookings
      const idempotencyKey = `${tenant.slug}-${service.id}-${slot.datetime}-${phone.replace(/\D/g, '')}`;

      const res = await BookingEngine.createBooking({
        tenantSlug: tenant.slug,
        serviceId: service.id,
        optionIds: options.map((o) => o.id),
        masterId: master ? master.id : null,
        startAt: slot.datetime,
        clientName: name.trim(),
        clientPhone: phone.trim(),
        notes: notes.trim() || undefined,
        idempotencyKey,
      });

      // Save token for "Моя запись" in bottom navigation
      localStorage.setItem(`beauty_last_booking_token_${tenant.slug}`, res.accessToken);

      onOpenChange(false);
      // Navigate to direct booking status screen with crypto access token
      navigate(`/s/${tenant.slug}/b/${res.accessToken}`);
    } catch (err) {
      setError((err as Error).message || 'Не удалось создать запись. Пожалуйста, попробуйте снова.');
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Подтверждение записи"
      description="Проверьте детали визита и укажите ваши данные"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Appointment Summary Card */}
        <div className="p-3.5 rounded-2xl border border-white/10 bg-[#0D0D11] backdrop-blur-md space-y-2.5 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm text-white">{service.name}</h4>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                {master ? `Мастер: ${master.name}` : 'Любой свободный мастер'}
              </p>
            </div>
            <div className="text-right">
              <span className="font-bold text-sm text-white">
                {totalPrice.toLocaleString('ru-RU')} ₽
              </span>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">{totalDuration} мин</p>
            </div>
          </div>

          {options.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <span className="text-[11px] text-[#8E8E93] font-medium">Дополнительно:</span>
              {options.map((opt) => (
                <div key={opt.id} className="flex justify-between text-xs text-neutral-300">
                  <span>+ {opt.name}</span>
                  <span>+{opt.price} ₽</span>
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
              Ваше имя <span className="text-red-400">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Как к вам обращаться"
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
              Номер телефона <span className="text-red-400">*</span>
            </label>
            <Input
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+7 (___) ___-__-__"
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
              Без паролей и спама. На этот номер придет ссылка на управление записью.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Пожелания или комментарий к записи
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Например: желаемый дизайн, аллергия, снятие"
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
            {isSubmitting ? 'Бронирование...' : `Подтвердить запись за ${totalPrice.toLocaleString('ru-RU')} ₽`}
          </Button>

          <p className="text-[10px] text-neutral-400 text-center mt-2.5 flex items-center justify-center gap-1">
            <ShieldCheck size={14} className="text-white" />
            <span>Атомарная фиксация слота · Без двойных бронирований</span>
          </p>
        </div>
      </form>
    </BottomSheet>
  );
};
