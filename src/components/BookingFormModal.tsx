import { useState } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { BookingEngine, type AvailableSlot } from '../lib/booking-store';
import { useTenant } from '../context/TenantContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ShieldCheck } from 'lucide-react';
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

export function BookingFormModal({
  open,
  onOpenChange,
  service,
  options,
  master,
  slot,
  dateStr,
}: BookingFormModalProps) {
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7 ');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    // Keep +7 prefix
    if (!val.startsWith('+7')) {
      setPhone('+7 ');
      return;
    }
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Пожалуйста, введите ваше имя');
      return;
    }
    if (phone.trim().length < 11) {
      setError('Пожалуйста, укажите полный номер телефона');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await BookingEngine.createBooking({
        tenantSlug: tenant.slug,
        serviceId: service.id,
        optionIds: options.map((o) => o.id),
        masterId: master ? master.id : null,
        startAt: slot.datetime,
        clientName: name.trim(),
        clientPhone: phone.trim(),
        notes: notes.trim() || undefined,
      });

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
      description="Проверьте детали визита и контактные данные"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Booking Summary Box */}
        <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-neutral-400">Услуга</div>
              <div className="text-sm font-semibold text-neutral-100">{service.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-neutral-100">{totalPrice.toLocaleString('ru-RU')} ₽</div>
              <div className="text-xs text-neutral-400">{totalDuration} мин</div>
            </div>
          </div>

          {options.length > 0 && (
            <div className="pt-2 border-t border-neutral-800/60">
              <div className="text-[11px] text-neutral-400 mb-1">Выбранные опции:</div>
              <div className="space-y-0.5">
                {options.map((opt) => (
                  <div key={opt.id} className="flex justify-between text-xs text-neutral-300">
                    <span>+ {opt.name}</span>
                    <span>+{opt.price} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-neutral-100">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{slot.time}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-300">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>Специалист:</span>
            </div>
            <span className="font-medium text-neutral-100">
              {master ? master.name : 'Любой свободный мастер'}
            </span>
          </div>
        </div>

        {/* Client Fields */}
        <div className="space-y-3 pt-1">
          <Input
            label="Ваше имя"
            placeholder="Как к вам обращаться"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Телефон для связи"
            placeholder="+7 (___) ___-__-__"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            required
          />

          <Input
            label="Пожелания или комментарии (необязательно)"
            placeholder="Например: тонкая кутикула, длина под ноль..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800 text-[11px] text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Без регистрации. Защищенный доступ по персональной ссылке.</span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Submit CTA */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full text-base font-bold shadow-xl cursor-pointer"
          >
            Подтвердить запись
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
