import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookingEngine, type BookingDetails, type AvailableSlot } from '../lib/booking-store';
import { useTenant } from '../context/TenantContext';
import { downloadIcsFile } from '../lib/ics';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { SlotPickerModal } from '../components/SlotPickerModal';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  RefreshCw,
  Scissors,
} from 'lucide-react';

export function BookingStatusPage() {
  const { slug, token } = useParams<{ slug: string; token: string }>();
  const { tenant } = useTenant();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Reschedule state
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!slug || !token) return;

    BookingEngine.lookupBooking(slug, token)
      .then((res) => {
        if (!res) {
          setError('Запись не найдена или срок действия ссылки истек.');
        } else {
          setBooking(res);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message);
        setIsLoading(false);
      });
  }, [slug, token]);

  const handleDownloadIcs = () => {
    if (!booking || !tenant) return;

    const primaryService = booking.services[0]?.name || 'Услуга маникюра';
    downloadIcsFile(`booking-${booking.booking_number}`, {
      title: `${primaryService} — ${tenant.name}`,
      description: `Мастер: ${booking.master.name}\nТелефон: ${booking.client.phone}\n${tenant.instructions || ''}`,
      location: tenant.address,
      startAt: booking.start_at,
      endAt: booking.end_at,
    });
  };

  const handleCancelBooking = async () => {
    if (!booking || !token) return;
    if (!window.confirm('Вы действительно хотите отменить вашу запись?')) return;

    setIsCancelling(true);
    setActionMessage(null);
    try {
      await BookingEngine.cancelBooking(booking.id, token, 'Отменено клиентом');
      setBooking((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      setActionMessage('Запись успешно отменена.');
    } catch (err) {
      alert((err as Error).message || 'Ошибка отмены записи');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRescheduleSlot = async (slot: AvailableSlot) => {
    if (!booking || !token) return;

    try {
      const res = await BookingEngine.rescheduleBooking(booking.id, token, slot.datetime);
      setBooking((prev) =>
        prev
          ? {
              ...prev,
              start_at: res.newStartAt,
              end_at: res.newEndAt,
              status: 'CONFIRMED',
            }
          : null
      );
      setActionMessage('Время записи успешно перенесено!');
    } catch (err) {
      alert((err as Error).message || 'Не удалось перенести запись');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-2 border-neutral-700 border-t-amber-400 animate-spin mb-3" />
        <p className="text-xs text-neutral-400">Поиск вашей записи...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-red-950/40 border border-red-800 mb-4 text-red-400">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-bold text-neutral-100 mb-1">Запись не найдена</h2>
        <p className="text-xs text-neutral-400 max-w-sm mb-6">
          {error || 'Проверьте ссылку или обратитесь напрямую к администратору студии.'}
        </p>
        <Link to={`/s/${slug}/`}>
          <Button variant="secondary" size="md">
            Вернуться на главную
          </Button>
        </Link>
      </div>
    );
  }

  const startDate = new Date(booking.start_at);
  const formattedDate = startDate.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const formattedTime = startDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isCancelled = booking.status === 'CANCELLED';
  const isCompleted = booking.status === 'COMPLETED';
  const canModify = !isCancelled && !isCompleted;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-16">
      {/* Top Bar */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-10 px-4 py-3 safe-top">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            to={`/s/${slug}/`}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>В студию</span>
          </Link>
          <div className="text-xs font-semibold text-neutral-300">
            {booking.booking_number}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {/* Status Hero Card */}
        <div className="text-center py-4">
          <div className="inline-flex p-3 rounded-full mb-3 shadow-xl">
            {isCancelled ? (
              <XCircle className="w-12 h-12 text-red-400" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            ) : (
              <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--tenant-accent)' }} />
            )}
          </div>

          <h1 className="text-xl font-bold font-heading text-neutral-100 mb-1">
            {isCancelled ? 'Запись отменена' : isCompleted ? 'Процедура завершена' : 'Вы записаны!'}
          </h1>

          <div className="flex justify-center mt-2">
            <Badge
              variant={
                isCancelled ? 'destructive' : isCompleted ? 'success' : 'accent'
              }
            >
              {booking.status === 'CONFIRMED' && 'Подтверждено студией'}
              {booking.status === 'CREATED' && 'Новая бронь'}
              {booking.status === 'COMPLETED' && 'Завершено'}
              {booking.status === 'CANCELLED' && 'Отменено'}
              {booking.status === 'NO_SHOW' && 'Неявка'}
            </Badge>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 text-center">
            {actionMessage}
          </div>
        )}

        {/* Appointment Details Box */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-100">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Master */}
          <div className="flex items-center gap-3 py-1">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/60 flex-shrink-0">
              {booking.master.avatar_url ? (
                <img
                  src={booking.master.avatar_url}
                  alt={booking.master.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-neutral-300">
                  {booking.master.name[0]}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-neutral-400">Мастер ногтевого сервиса</div>
              <div className="text-sm font-semibold text-neutral-100">{booking.master.name}</div>
              <div className="text-[11px] text-neutral-500">{booking.master.title}</div>
            </div>
          </div>

          {/* Services & Options */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <div className="text-xs font-semibold text-neutral-400">Перечень услуг:</div>
            {booking.services.map((s) => (
              <div key={s.id} className="flex justify-between text-xs text-neutral-200 font-medium">
                <span className="flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-neutral-500" />
                  {s.name}
                </span>
                <span>{s.price.toLocaleString('ru-RU')} ₽</span>
              </div>
            ))}

            {booking.options.map((opt) => (
              <div key={opt.id} className="flex justify-between text-xs text-neutral-400 pl-5">
                <span>+ {opt.name}</span>
                <span>+{opt.price} ₽</span>
              </div>
            ))}

            <div className="pt-2 border-t border-neutral-800 flex justify-between items-baseline font-bold text-base text-neutral-100">
              <span>Итого к оплате:</span>
              <span style={{ color: 'var(--tenant-accent)' }}>
                {booking.total_price.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        </Card>

        {/* Studio Location & Instructions */}
        <Card className="space-y-3 text-xs text-neutral-300">
          <div className="font-semibold text-neutral-200">Адрес и инструкции:</div>
          <div className="flex items-start gap-2 text-neutral-400">
            <MapPin className="w-4 h-4 flex-shrink-0 text-neutral-500 mt-0.5" />
            <span>{booking.studio.address}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <Phone className="w-4 h-4 flex-shrink-0 text-neutral-500" />
            <a href={`tel:${booking.studio.phone}`} className="hover:text-white">
              {booking.studio.phone}
            </a>
          </div>
          {booking.studio.instructions && (
            <p className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-[11px] text-neutral-400 leading-relaxed">
              {booking.studio.instructions}
            </p>
          )}
        </Card>

        {/* Actions (ICS, Reschedule, Cancel) */}
        <div className="space-y-2.5 pt-2">
          {!isCancelled && (
            <Button
              variant="outline"
              size="md"
              className="w-full flex items-center justify-center gap-2 cursor-pointer"
              onClick={handleDownloadIcs}
            >
              <Download className="w-4 h-4" />
              <span>Добавить в календарь (.ics)</span>
            </Button>
          )}

          {canModify && (
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                size="md"
                className="flex items-center justify-center gap-1.5 cursor-pointer"
                onClick={() => setIsRescheduleOpen(true)}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Перенести</span>
              </Button>

              <Button
                variant="destructive"
                size="md"
                isLoading={isCancelling}
                className="cursor-pointer"
                onClick={handleCancelBooking}
              >
                <span>Отменить</span>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Reschedule Modal */}
      {booking.services[0] && tenant && (
        <SlotPickerModal
          open={isRescheduleOpen}
          onOpenChange={setIsRescheduleOpen}
          service={tenant.services.find((s) => s.id === booking.services[0].id) || null}
          options={[]}
          masterId={booking.master.id}
          onSelectSlot={handleRescheduleSlot}
        />
      )}
    </div>
  );
}
