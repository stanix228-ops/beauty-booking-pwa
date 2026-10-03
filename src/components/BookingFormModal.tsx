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
        <div
          style={{
            backgroundColor: 'var(--tenant-card)',
            borderColor: 'var(--tenant-card-border)',
          }}
          className="p-4 rounded-2xl border space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs" style={{ color: 'var(--tenant-muted)' }}>Услуга</div>
              <div className="text-sm font-semibold" style={{ color: 'var(--tenant-text)' }}>{service.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color: 'var(--tenant-text)' }}>{totalPrice.toLocaleString('ru-RU')} ₽</div>
              <div className="text-xs" style={{ color: 'var(--tenant-muted)' }}>{totalDuration} мин</div>
            </div>
          </div>

          {options.length > 0 && (
            <div className="pt-2 border-t" style={{ borderColor: 'var(--tenant-card-border)' }}>
              <div className="text-[11px] mb-1" style={{ color: 'var(--tenant-muted)' }}>Выбранные опции:</div>
              <div className="space-y-0.5">
                {options.map((opt) => (
                  <div key={opt.id} className="flex justify-between text-xs" style={{ color: 'var(--tenant-text)' }}>
                    <span>+ {opt.name}</span>
                    <span style={{ color: 'var(--tenant-accent-secondary, #F5EBE0)' }}>+{opt.price} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--tenant-card-border)' }}>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--tenant-muted)' }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--tenant-accent)' }} />
              <span className="capitalize" style={{ color: 'var(--tenant-text)' }}>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--tenant-text)' }}>
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--tenant-accent)' }} />
              <span>{slot.time}</span>
            </div>
          </div>

          <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--tenant-card-border)' }}>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--tenant-muted)' }}>
              <User className="w-3.5 h-3.5" style={{ color: 'var(--tenant-accent)' }} />
              <span>Специалист:</span>
            </div>
            <span className="font-medium" style={{ color: 'var(--tenant-text)' }}>
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
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'var(--tenant-card-border)',
          }}
          className="flex items-center gap-2 p-2.5 rounded-xl border text-[11px]"
        >
          <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--tenant-accent)' }} />
          <span style={{ color: 'var(--tenant-muted)' }}>Без регистрации. Защищенный доступ по персональной ссылке.</span>
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
            style={{
              backgroundColor: 'var(--tenant-accent)',
              color: '#0D0D11',
            }}
            className="w-full text-base font-bold shadow-xl shadow-amber-500/20 cursor-pointer"
          >
            Подтвердить запись
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
