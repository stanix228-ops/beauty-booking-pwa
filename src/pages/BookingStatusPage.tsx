import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookingEngine, type BookingDetails, type AvailableSlot } from '../lib/booking-store';
import { useTenant } from '../context/TenantContext';
import { formatPrice } from '../lib/currency';
import { getAssetUrl } from '../lib/assets';
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
  CheckCircle,
  XCircle,
  WarningCircle,
  CalendarPlus,
  ArrowLeft,
  ArrowClockwise,
  Bell,
  Scissors,
  DeviceMobile,
  PaperPlaneTilt,
  ChatCircleDots,
  Trash,
} from '@phosphor-icons/react';
import { InstallPromptModal } from '../components/InstallPromptModal';

export function BookingStatusPage() {
  const { slug, token } = useParams<{ slug: string; token: string }>();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Install modal state
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  // Reschedule state
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Detect push support
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setPushSupported(true);
      if (Notification.permission === 'granted') {
        setPushSubscribed(true);
      }
    }
  }, []);

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
      description: `Мастер: ${booking.master.name}\nТелефон студии: ${tenant.phone}\n${tenant.instructions || ''}`,
      location: tenant.address,
      startAt: booking.start_at,
      endAt: booking.end_at,
    });
  };

  const handleEnablePushReminder = async () => {
    if (!pushSupported) {
      handleDownloadIcs();
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushSubscribed(true);
        setActionMessage('Напоминание включено! Мы отправили вам подтверждающее уведомление.');

        // Instant notification test
        try {
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification(`Запись подтверждена! 🎉`, {
              body: `${booking?.services[0]?.name || 'Услуга'} — ${formattedDate} в ${formattedTime}. Ждем вас!`,
              icon: tenant?.assets.logo || undefined,
            });
          } else {
            new Notification(`Запись подтверждена! 🎉`, {
              body: `${booking?.services[0]?.name || 'Услуга'} — ${formattedDate} в ${formattedTime}. Ждем вас!`,
            });
          }
        } catch (e) {
          console.log('Notification trigger note:', e);
        }
      } else {
        alert('Уведомления не разрешены в браузере. Вы можете добавить запись в календарь телефона одним нажатием.');
      }
    } catch {
      alert('Не удалось включить push-уведомления.');
    }
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

  const handleDeleteBooking = async () => {
    if (!booking) return;
    if (!window.confirm('Вы уверены, что хотите удалить эту запись навсегда из базы?')) return;

    setIsDeleting(true);
    try {
      await BookingEngine.deleteBooking(booking.id, slug);
      alert('Запись успешно удалена.');
      navigate(`/s/${slug}/`);
    } catch (err) {
      alert((err as Error).message || 'Ошибка при удалении записи');
      setIsDeleting(false);
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-2 border-neutral-700 border-t-blue-500 animate-spin mb-3" />
        <p className="text-xs text-neutral-400">Поиск вашей записи...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-full bg-red-950/40 border border-red-800 mb-4 text-red-400">
          <WarningCircle size={40} />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Запись не найдена</h2>
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

  const durationMin = Math.round(
    (new Date(booking.end_at).getTime() - startDate.getTime()) / (60 * 1000)
  );

  const isCancelled = booking.status === 'CANCELLED';
  const isCompleted = booking.status === 'COMPLETED';
  const canModify = !isCancelled && !isCompleted;

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      {/* Top Bar */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-10 px-4 py-3 safe-top">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            to={`/s/${slug}/`}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
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
              <XCircle size={48} weight="fill" className="text-red-400" />
            ) : isCompleted ? (
              <CheckCircle size={48} weight="fill" className="text-emerald-400" />
            ) : (
              <CheckCircle size={48} weight="fill" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
            )}
          </div>

          <h1 className="text-xl font-bold text-white mb-1">
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
        <Card className="space-y-4 border border-white/10 bg-neutral-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <Calendar size={16} weight="duotone" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-white">
              <Clock size={16} weight="duotone" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
              <span>{formattedTime}</span>
              <span className="text-xs text-neutral-400 font-normal">({durationMin} мин)</span>
            </div>
          </div>

          {/* Master */}
          <div className="flex items-center gap-3 py-1">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 border border-white/10 flex-shrink-0">
              {booking.master.avatar_url ? (
                <img
                  src={getAssetUrl(booking.master.avatar_url)}
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
              <div className="text-xs text-neutral-400">Мастер</div>
              <div className="text-sm font-semibold text-white">{booking.master.name}</div>
              <div className="text-[11px] text-neutral-500">{booking.master.title}</div>
            </div>
          </div>

          {/* Services & Options */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="text-xs font-semibold text-neutral-400">Перечень услуг:</div>
            {booking.services.map((s) => (
              <div key={s.id} className="flex justify-between text-xs text-neutral-200 font-medium">
                <span className="flex items-center gap-1.5">
                  <Scissors size={14} className="text-neutral-400" />
                  {s.name}
                </span>
                <span>{formatPrice(s.price, tenant?.currency)}</span>
              </div>
            ))}

            {booking.options.map((opt) => (
              <div key={opt.id} className="flex justify-between text-xs text-neutral-400 pl-5">
                <span>+ {opt.name}</span>
                <span>+{formatPrice(opt.price, tenant?.currency)}</span>
              </div>
            ))}

            <div className="pt-2 border-t border-white/10 flex justify-between items-baseline font-bold text-base text-white">
              <span>Итого к оплате:</span>
              <span style={{ color: 'var(--tenant-accent, #4690FF)' }}>
                {formatPrice(booking.total_price, tenant?.currency)}
              </span>
            </div>
          </div>
        </Card>

        {/* Mobile Home Screen App Card (PWA) */}
        <div className="p-4 rounded-2xl border border-white/10 bg-[#0D0D11] backdrop-blur-md space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <DeviceMobile size={18} weight="duotone" className="text-white" />
              <span>Иконка на экран телефона</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
              PWA
            </span>
          </div>

          <p className="text-xs text-[#8E8E93] leading-relaxed">
            Добавьте иконку студии на рабочий стол смартфона — ваша запись, адрес и телефон всегда будут под рукой в один клик.
          </p>

          <Button
            variant="primary"
            size="md"
            className="w-full flex items-center justify-center gap-2 cursor-pointer bg-white text-black font-semibold hover:bg-neutral-200 shadow-[0_2px_15px_rgba(255,255,255,0.2)]"
            onClick={() => setIsInstallModalOpen(true)}
          >
            <DeviceMobile size={16} weight="bold" />
            <span>Добавить иконку на рабочий стол</span>
          </Button>
        </div>

        {/* 24h Reminder Section */}
        {!isCancelled && !isCompleted && (
          <div className="p-4 rounded-2xl border border-white/10 bg-[#0D0D11] backdrop-blur-md space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Bell size={18} weight="duotone" className="text-white" />
              <span>Напоминание о визите</span>
            </div>

            {pushSupported ? (
              <div className="space-y-2.5">
                <p className="text-xs text-[#8E8E93]">
                  Включите уведомление, и мы напомним вам о процедуре за 24 часа.
                </p>
                <Button
                  variant={pushSubscribed ? 'secondary' : 'primary'}
                  size="md"
                  className="w-full flex items-center justify-center gap-2 cursor-pointer bg-white text-black font-semibold hover:bg-neutral-200 shadow-[0_2px_15px_rgba(255,255,255,0.2)]"
                  onClick={handleEnablePushReminder}
                  disabled={pushSubscribed}
                >
                  <Bell size={16} weight="bold" />
                  <span>{pushSubscribed ? 'Напоминание включено' : 'Включить напоминание за сутки'}</span>
                </Button>
              </div>
            ) : (
              <p className="text-xs text-[#8E8E93]">
                Ваше устройство не поддерживает системные push-уведомления. Добавьте событие в календарь, чтобы сработал встроенный будильник телефона.
              </p>
            )}

            <Button
              variant="outline"
              size="md"
              className="w-full flex items-center justify-center gap-2 cursor-pointer border-white/15 hover:bg-white/5 text-white"
              onClick={handleDownloadIcs}
            >
              <CalendarPlus size={16} />
              <span>Добавить в календарь (.ics)</span>
            </Button>

            {/* Quick messengers share */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(
                  `Моя запись в ${tenant?.name || 'студию'}: ${booking.services[0]?.name} на ${formattedDate} в ${formattedTime}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <PaperPlaneTilt size={16} weight="bold" className="text-[#2AABEE]" />
                <span>В Telegram</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Моя запись в ${tenant?.name || 'студию'}: ${booking.services[0]?.name} на ${formattedDate} в ${formattedTime}. Ссылка: ${window.location.href}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <ChatCircleDots size={16} weight="bold" className="text-[#25D366]" />
                <span>В WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Studio Location & Address */}
        <Card className="space-y-3 text-xs text-neutral-300 border border-white/10 bg-neutral-900/40">
          <div className="font-semibold text-white">Студия: {booking.studio.name}</div>
          <div className="flex items-start gap-2 text-neutral-300">
            <MapPin size={16} className="flex-shrink-0 text-neutral-400 mt-0.5" />
            <span>{booking.studio.address}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300">
            <Phone size={16} className="flex-shrink-0 text-neutral-400" />
            <a href={`tel:${booking.studio.phone}`} className="hover:text-white underline-offset-2 hover:underline">
              {booking.studio.phone}
            </a>
          </div>
          {booking.studio.instructions && (
            <p className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] text-neutral-400 leading-relaxed">
              {booking.studio.instructions}
            </p>
          )}
        </Card>

        {/* Actions (Reschedule, Cancel, Delete) */}
        {canModify && (
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                size="md"
                className="flex items-center justify-center gap-1.5 cursor-pointer"
                onClick={() => setIsRescheduleOpen(true)}
              >
                <ArrowClockwise size={16} />
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

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteBooking}
              className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-950/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash size={14} />
              <span>{isDeleting ? 'Удаление...' : 'Удалить запись'}</span>
            </button>
          </div>
        )}

        {isCancelled && (
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteBooking}
              className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash size={14} />
              <span>{isDeleting ? 'Удаление...' : 'Удалить эту отмененную запись'}</span>
            </button>
            <Link
              to={`/s/${slug}/`}
              className="w-full h-11 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center hover:bg-neutral-200 transition-colors shadow-md"
            >
              Записаться заново
            </Link>
          </div>
        )}
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

      {/* PWA Home Screen Icon Modal */}
      <InstallPromptModal
        open={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
