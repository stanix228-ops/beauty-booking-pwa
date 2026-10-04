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
    return { success: false, error: 'Please specify Bot Token and Chat ID' };
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
      return { success: false, error: data.description || 'Failed to send message' };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message || 'Network error connecting to Telegram API',
    };
  }
}

export async function testTelegramNotification(
  botToken: string,
  chatId: string,
  studioName: string
): Promise<{ success: boolean; error?: string }> {
  const text =
    `🎉 <b>Test Notification from ${studioName}!</b>\n\n` +
    `Your Telegram bot is successfully connected to the Online Booking CRM.\n` +
    `Whenever a client books an appointment, you will receive an instant notification with their visit time, phone number, and selected service.`;
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
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const text =
    `🔔 <b>New Appointment at ${studioName}!</b>\n` +
    `🔖 Confirmation #: <code>#${booking.bookingNumber}</code>\n\n` +
    `👤 <b>Client:</b> ${booking.clientName}\n` +
    `📞 <b>Phone:</b> ${booking.clientPhone}\n` +
    `💅 <b>Service:</b> ${booking.serviceName}\n` +
    `👩‍🎨 <b>Artist:</b> ${booking.masterName || 'Any Available'}\n` +
    `📅 <b>Date & Time:</b> ${formattedDate} at ${formattedTime}\n` +
    `💰 <b>Total Price:</b> $${booking.price}\n` +
    (booking.notes ? `💬 <b>Notes:</b> <i>${booking.notes}</i>\n` : '');

  try {
    await sendTelegramMessage(config.botToken, config.chatId, text);
  } catch (err) {
    console.warn('Telegram notification note:', err);
  }
}
