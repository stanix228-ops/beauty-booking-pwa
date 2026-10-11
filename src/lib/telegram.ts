/**
 * Telegram Bot notification integration for beauty salon owners.
 * Sends instant messages when clients create appointments.
 */

import { formatPrice } from './currency';
import { getTenantBySlug } from '../data/tenants';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

const memoryTelegramConfig = new Map<string, string>();

export function getTelegramConfig(tenantSlug: string): TelegramConfig {
  // 1. Check browser localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`beauty_tg_config_${tenantSlug}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.botToken && parsed.chatId) {
          return {
            botToken: parsed.botToken.trim(),
            chatId: parsed.chatId.trim(),
            enabled: parsed.enabled !== false,
          };
        }
      }
    } catch {}
  } else {
    const raw = memoryTelegramConfig.get(`beauty_tg_config_${tenantSlug}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.botToken && parsed.chatId) {
        return {
          botToken: parsed.botToken.trim(),
          chatId: parsed.chatId.trim(),
          enabled: parsed.enabled !== false,
        };
      }
    }
  }

  // 2. Check tenant business configuration
  const tenant = getTenantBySlug(tenantSlug);
  if (tenant && (tenant as any).telegram) {
    const tg = (tenant as any).telegram;
    if (tg.botToken && tg.chatId) {
      return {
        botToken: String(tg.botToken).trim(),
        chatId: String(tg.chatId).trim(),
        enabled: tg.enabled !== false,
      };
    }
  }

  return { botToken: '', chatId: '', enabled: false };
}

export function saveTelegramConfig(tenantSlug: string, config: TelegramConfig): void {
  const cleanConfig: TelegramConfig = {
    botToken: config.botToken.trim().replace(/^bot(?=\d)/i, ''),
    chatId: config.chatId.trim(),
    enabled: config.enabled,
  };
  const serialized = JSON.stringify(cleanConfig);
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
  const cleanToken = botToken.trim().replace(/^bot(?=\d)/i, '');
  const cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    return { success: false, error: 'Укажите токен бота и Chat ID' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      const desc = data.description || '';
      if (desc.includes("can't initiate conversation") || desc.includes('blocked by the user')) {
        return {
          success: false,
          error: 'Бот не может написать вам первым. Откройте диалог с вашим ботом в Telegram и отправьте команду /start.',
        };
      }
      if (desc.includes('chat not found')) {
        return {
          success: false,
          error: 'Чат не найден. Проверьте ваш числовой Chat ID (узнать его можно у @userinfobot) и убедитесь, что нажали /start в боте.',
        };
      }
      if (desc.includes('Unauthorized')) {
        return {
          success: false,
          error: 'Неверный токен бота. Проверьте токен, полученный от @BotFather.',
        };
      }
      return { success: false, error: desc || 'Не удалось отправить сообщение в Telegram' };
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
    currency?: string;
    notes?: string;
  }
): Promise<void> {
  const config = getTelegramConfig(tenantSlug);
  if (!config.enabled || !config.botToken || !config.chatId) {
    console.log('[Telegram Notification] Not configured or disabled for', tenantSlug);
    return;
  }

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
    `💰 <b>Стоимость:</b> ${formatPrice(booking.price, booking.currency)}\n` +
    (booking.notes ? `💬 <b>Пожелания:</b> <i>${booking.notes}</i>\n` : '');

  try {
    console.log(`[Telegram] Sending new booking notification #${booking.bookingNumber} to chat ${config.chatId}...`);
    const result = await sendTelegramMessage(config.botToken, config.chatId, text);
    if (result.success) {
      console.log('[Telegram] Notification successfully delivered!');
    } else {
      console.warn('[Telegram] Could not deliver notification:', result.error);
    }
  } catch (err) {
    console.warn('[Telegram] Notification error:', err);
  }
}

