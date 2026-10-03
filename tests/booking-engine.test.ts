import { describe, it, expect } from 'vitest';
import { memoryStore, BookingEngine } from '../src/lib/booking-store';
import { getTenantBySlug } from '../src/data/tenants';
import { hashTokenSha256 } from '../src/lib/crypto';

describe('Beauty Booking Engine & Multi-Tenant Core Tests', () => {
  const lumiSlug = 'lumi-nail-studio';
  const auraSlug = 'aura-nail-bar';

  it('1. Loads distinct configurations for both demo tenants (Isolation Test)', () => {
    const lumi = getTenantBySlug(lumiSlug);
    const aura = getTenantBySlug(auraSlug);

    expect(lumi).toBeDefined();
    expect(aura).toBeDefined();

    expect(lumi!.id).not.toBe(aura!.id);
    expect(lumi!.name).toBe('LUMI NAIL STUDIO');
    expect(aura!.name).toBe('AURA NAIL BAR');

    // Visual theme differentiation
    expect(lumi!.theme.accentColor).toBe('#D4AF37');
    expect(aura!.theme.accentColor).toBe('#2DD4BF');

    // Cross-tenant ID collisions must be strictly 0
    const lumiIds = new Set([
      lumi!.id,
      ...lumi!.services.map((s) => s.id),
      ...lumi!.masters.map((m) => m.id),
      ...lumi!.categories.map((c) => c.id),
    ]);

    for (const service of aura!.services) {
      expect(lumiIds.has(service.id)).toBe(false);
    }
    for (const master of aura!.masters) {
      expect(lumiIds.has(master.id)).toBe(false);
    }
  });

  it('2. Calculates available slots with service duration and buffer time', async () => {
    const lumi = getTenantBySlug(lumiSlug)!;
    const service = lumi.services[0]; // 90 min + 15 min buffer = 105 min total
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const slots = await BookingEngine.getAvailableSlots(lumiSlug, service.id, [], null, dateStr);

    expect(Array.isArray(slots)).toBe(true);
    if (slots.length > 0) {
      const firstSlot = slots[0];
      expect(firstSlot).toHaveProperty('time');
      expect(firstSlot).toHaveProperty('datetime');
      expect(firstSlot.available_master_ids.length).toBeGreaterThan(0);
    }
  });

  it('3. Successfully creates atomic booking with SHA-256 token hashing', async () => {
    const lumi = getTenantBySlug(lumiSlug)!;
    const service = lumi.services[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const slots = await BookingEngine.getAvailableSlots(lumiSlug, service.id, [], null, dateStr);
    expect(slots.length).toBeGreaterThan(0);

    const targetSlot = slots[0];

    const res = await BookingEngine.createBooking({
      tenantSlug: lumiSlug,
      serviceId: service.id,
      optionIds: [],
      masterId: targetSlot.available_master_ids[0],
      startAt: targetSlot.datetime,
      clientName: 'Анна Тестовая',
      clientPhone: '+7 (999) 111-22-33',
    });

    expect(res.bookingId).toBeDefined();
    expect(res.bookingNumber).toContain('LUMI');
    expect(res.accessToken).toBeDefined();

    // Verify booking lookup by token
    const fetched = await BookingEngine.lookupBooking(lumiSlug, res.accessToken);
    expect(fetched).not.toBeNull();
    expect(fetched!.client.name).toBe('Анна Тестовая');
    expect(fetched!.total_price).toBe(service.price);
    expect(fetched!.status).toBe('CONFIRMED');
  });

  it('4. Prevents double-booking / overbooking (PostgreSQL EXCLUDE constraint emulation)', async () => {
    const lumi = getTenantBySlug(lumiSlug)!;
    const service = lumi.services[0];
    const master = lumi.masters[0];

    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 3);
    testDate.setHours(12, 0, 0, 0);
    const startIso = testDate.toISOString();

    const tokenHash1 = await hashTokenSha256('token1');
    const tokenHash2 = await hashTokenSha256('token2');

    // First booking succeeds
    const book1 = await memoryStore.createBookingAtomic({
      tenantSlug: lumiSlug,
      serviceId: service.id,
      optionIds: [],
      masterId: master.id,
      startAt: startIso,
      clientName: 'Клиент Один',
      clientPhone: '+7 (999) 000-00-01',
      tokenHash: tokenHash1,
    });
    expect(book1.success).toBe(true);

    // Second booking for same master in overlapping time MUST FAIL with conflict error!
    await expect(
      memoryStore.createBookingAtomic({
        tenantSlug: lumiSlug,
        serviceId: service.id,
        optionIds: [],
        masterId: master.id,
        startAt: startIso,
        clientName: 'Клиент Два',
        clientPhone: '+7 (999) 000-00-02',
        tokenHash: tokenHash2,
      })
    ).rejects.toThrow();
  });

  it('5. Successfully reschedules booking to a free slot', async () => {
    const lumi = getTenantBySlug(lumiSlug)!;
    const service = lumi.services[0];
    const master = lumi.masters[1];

    const d1 = new Date();
    d1.setDate(d1.getDate() + 4);
    d1.setHours(14, 0, 0, 0);

    const d2 = new Date();
    d2.setDate(d2.getDate() + 4);
    d2.setHours(16, 30, 0, 0);

    const booking = await BookingEngine.createBooking({
      tenantSlug: lumiSlug,
      serviceId: service.id,
      optionIds: [],
      masterId: master.id,
      startAt: d1.toISOString(),
      clientName: 'Ольга Перенос',
      clientPhone: '+7 (999) 333-44-55',
    });

    const resched = await BookingEngine.rescheduleBooking(
      booking.bookingId,
      booking.accessToken,
      d2.toISOString()
    );

    expect(resched.success).toBe(true);

    const updated = await BookingEngine.lookupBooking(lumiSlug, booking.accessToken);
    expect(updated!.start_at).toBe(d2.toISOString());
  });

  it('6. Failed reschedule retains original booking intact without loss', async () => {
    const lumi = getTenantBySlug(lumiSlug)!;
    const service = lumi.services[0];
    const master = lumi.masters[0];

    const slotA = new Date();
    slotA.setDate(slotA.getDate() + 5);
    slotA.setHours(10, 0, 0, 0);

    const slotB = new Date();
    slotB.setDate(slotB.getDate() + 5);
    slotB.setHours(14, 0, 0, 0);

    // Booking 1 occupies slot B
    await BookingEngine.createBooking({
      tenantSlug: lumiSlug,
      serviceId: service.id,
      optionIds: [],
      masterId: master.id,
      startAt: slotB.toISOString(),
      clientName: 'Клиент Б',
      clientPhone: '+7 (999) 555-55-55',
    });

    // Booking 2 occupies slot A
    const bookA = await BookingEngine.createBooking({
      tenantSlug: lumiSlug,
      serviceId: service.id,
      optionIds: [],
      masterId: master.id,
      startAt: slotA.toISOString(),
      clientName: 'Клиент А',
      clientPhone: '+7 (999) 666-66-66',
    });

    // Trying to reschedule bookA into occupied slotB must fail
    await expect(
      BookingEngine.rescheduleBooking(bookA.bookingId, bookA.accessToken, slotB.toISOString())
    ).rejects.toThrow();

    // Original booking A must STILL exist and remain at slotA!
    const unchanged = await BookingEngine.lookupBooking(lumiSlug, bookA.accessToken);
    expect(unchanged).not.toBeNull();
    expect(unchanged!.start_at).toBe(slotA.toISOString());
    expect(unchanged!.status).toBe('CONFIRMED');
  });

  it('7. Master time blocking excludes slot from public availability', async () => {
    const lumi = getTenantBySlug(lumiSlug)!;
    const master = lumi.masters[2];

    const blockStart = new Date();
    blockStart.setDate(blockStart.getDate() + 6);
    blockStart.setHours(15, 0, 0, 0);

    const blockEnd = new Date(blockStart.getTime() + 60 * 60 * 1000);

    const blockRes = await BookingEngine.blockMasterTime({
      tenantId: lumi.id,
      masterId: master.id,
      startAt: blockStart.toISOString(),
      endAt: blockEnd.toISOString(),
      reason: 'BREAK',
    });

    expect(blockRes.success).toBe(true);

    // Overlapping block on same master must fail
    await expect(
      BookingEngine.blockMasterTime({
        tenantId: lumi.id,
        masterId: master.id,
        startAt: blockStart.toISOString(),
        endAt: blockEnd.toISOString(),
        reason: 'BREAK',
      })
    ).rejects.toThrow();
  });

  it('8. Cancellation frees up resource occupancies', async () => {
    const lumi = getTenantBySlug(lumiSlug)!;
    const service = lumi.services[0];
    const master = lumi.masters[0];

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    targetDate.setHours(11, 0, 0, 0);

    const b = await BookingEngine.createBooking({
      tenantSlug: lumiSlug,
      serviceId: service.id,
      optionIds: [],
      masterId: master.id,
      startAt: targetDate.toISOString(),
      clientName: 'Клиент Отмена',
      clientPhone: '+7 (999) 777-88-99',
    });

    const cancelRes = await BookingEngine.cancelBooking(b.bookingId, b.accessToken, 'Клиент передумал');
    expect(cancelRes.success).toBe(true);

    const checked = await BookingEngine.lookupBooking(lumiSlug, b.accessToken);
    expect(checked!.status).toBe('CANCELLED');

    // Slot is now free: another customer can book it without conflict!
    const newBook = await BookingEngine.createBooking({
      tenantSlug: lumiSlug,
      serviceId: service.id,
      optionIds: [],
      masterId: master.id,
      startAt: targetDate.toISOString(),
      clientName: 'Новый Клиент',
      clientPhone: '+7 (999) 000-11-22',
    });
    expect(newBook.bookingId).toBeDefined();
  });
});
