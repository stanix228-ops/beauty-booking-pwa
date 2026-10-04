/**
 * Telegram Bot notification integration for beauty salon owners.
 * Sends instant messages when clients create appointments.
 */

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

const memoryTelegramConfig = new Map<string, string>();

export function getTelegramConfig(tenantSlug: string): TelegramConfig {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`beauty_tg_config_${tenantSlug}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
  } else {
    const raw = memoryTelegramConfig.get(`beauty_tg_config_${tenantSlug}`);
    if (raw) {
      return JSON.parse(raw);
    }
  }
  return { botToken: '', chatId: '', enabled: false };
}

export function saveTelegramConfig(tenantSlug: string, config: TelegramConfig): void {
  const serialized = JSON.stringify(config);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`beauty_tg_config_${tenantSlug}`, serialized);
    } catch {}
  } else {
    memoryTelegramConfig.set(`beauty_tg_config_${tenantSlug}`, serialized);
  }
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  if (!botToken.trim() || !chatId.trim()) {
    return { success: false, error: 'Укажите токен бота и Chat ID' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      return { success: false, error: data.description || 'Не удалось отправить сообщение' };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message || 'Сетевая ошибка при обращении к Telegram API',
    };
  }
}

export async function testTelegramNotification(
  botToken: string,
  chatId: string,
  studioName: string
): Promise<{ success: boolean; error?: string }> {
  const text =
    `🎉 <b>Тестовое уведомление из студии ${studioName}!</b>\n\n` +
    `Бот успешно подключен к CRM онлайн-записи.\n` +
    `Теперь при каждом новом бронировании клиентом вам мгновенно будет приходить детальное сообщение со временем, номером телефона и выбранной процедурой.`;
  return sendTelegramMessage(botToken, chatId, text);
}

export async function notifyNewBookingTelegram(
  tenantSlug: string,
  studioName: string,
  booking: {
    bookingNumber: string;
    clientName: string;
    clientPhone: string;
    serviceName: string;
    masterName?: string;
    startAt: string;
    price: number;
    notes?: string;
  }
): Promise<void> {
  const config = getTelegramConfig(tenantSlug);
  if (!config.enabled || !config.botToken || !config.chatId) return;

  const startDate = new Date(booking.startAt);
  const formattedDate = startDate.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  const formattedTime = startDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const text =
    `🔔 <b>Новая запись в ${studioName}!</b>\n` +
    `🔖 Номер брони: <code>#${booking.bookingNumber}</code>\n\n` +
    `👤 <b>Клиент:</b> ${booking.clientName}\n` +
    `📞 <b>Телефон:</b> ${booking.clientPhone}\n` +
    `💅 <b>Услуга:</b> ${booking.serviceName}\n` +
    `👩‍🎨 <b>Мастер:</b> ${booking.masterName || 'Любой свободный'}\n` +
    `📅 <b>Дата и время:</b> ${formattedDate} в ${formattedTime}\n` +
    `💰 <b>Стоимость:</b> ${booking.price.toLocaleString('ru-RU')} ₽\n` +
    (booking.notes ? `💬 <b>Пожелания:</b> <i>${booking.notes}</i>\n` : '');

  try {
    await sendTelegramMessage(config.botToken, config.chatId, text);
  } catch (err) {
    console.warn('Telegram notification note:', err);
  }
}
