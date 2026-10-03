import { supabase, isLiveSupabaseConfigured } from './supabase';
import { getTenantBySlug } from '../data/tenants';
import { hashTokenSha256 } from './crypto';

export interface BookingDetails {
  id: string;
  booking_number: string;
  tenant_id: string;
  status: 'CREATED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  start_at: string;
  end_at: string;
  total_price: number;
  token_hash: string;
  notes?: string;
  cancellation_reason?: string;
  client: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  master: {
    id: string;
    name: string;
    title: string;
    avatar_url?: string;
  };
  workplace?: {
    id: string;
    name: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration_min: number;
  }>;
  options: Array<{
    id: string;
    name: string;
    price: number;
    duration_min: number;
  }>;
  studio: {
    name: string;
    address: string;
    phone: string;
    instructions?: string;
  };
}

export interface ResourceOccupancy {
  id: string;
  tenant_id: string;
  resource_type: 'MASTER' | 'WORKPLACE';
  resource_id: string;
  booking_id?: string;
  reason: 'BOOKING' | 'BREAK' | 'VACATION' | 'MAINTENANCE';
  start_at: string;
  end_at: string;
}

export interface AvailableSlot {
  time: string;
  datetime: string;
  available_master_ids: string[];
}

// In-Memory Database Store (Faithful PostgreSQL implementation mirror)
class MemoryBookingStore {
  public bookings: BookingDetails[] = [];
  public occupancies: ResourceOccupancy[] = [];

  constructor() {
    this.loadFromStorage();
  }

  public saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('beauty_bookings', JSON.stringify(this.bookings));
        localStorage.setItem('beauty_occupancies', JSON.stringify(this.occupancies));
      } catch {
        // Ignore quota errors
      }
    }
  }

  public loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedB = localStorage.getItem('beauty_bookings');
        const savedO = localStorage.getItem('beauty_occupancies');
        if (savedB) {
          this.bookings = JSON.parse(savedB);
          if (savedO) this.occupancies = JSON.parse(savedO);
          return;
        }
      } catch {
        // Fallback to seed
      }
    }
    this.seedInitialDemoBookings();
    this.saveToStorage();
  }

  private seedInitialDemoBookings() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Seed sample completed & confirmed bookings for LUMI NAIL STUDIO
    const lumi = getTenantBySlug('lumi-nail-studio');
    if (lumi) {
      const master = lumi.masters[0];
      const service = lumi.services[0];
      const start1 = `${dateStr}T11:00:00.000Z`;
      const end1 = `${dateStr}T12:45:00.000Z`;

      this.bookings.push({
        id: 'seed-b-1',
        booking_number: 'LUMI-0310-4102',
        tenant_id: lumi.id,
        status: 'COMPLETED',
        start_at: start1,
        end_at: end1,
        total_price: service.price,
        token_hash: 'seed_hash_1',
        client: {
          id: 'c-1',
          name: 'Елена Васильева',
          phone: '+7 (916) 123-45-67',
        },
        master: {
          id: master.id,
          name: master.name,
          title: master.title,
          avatar_url: master.avatarUrl,
        },
        workplace: {
          id: lumi.workplaces[0].id,
          name: lumi.workplaces[0].name,
        },
        services: [{
          id: service.id,
          name: service.name,
          price: service.price,
          duration_min: service.durationMin,
        }],
        options: [],
        studio: {
          name: lumi.name,
          address: lumi.address,
          phone: lumi.phone,
          instructions: lumi.instructions,
        },
      });

      this.occupancies.push({
        id: 'occ-1',
        tenant_id: lumi.id,
        resource_type: 'MASTER',
        resource_id: master.id,
        booking_id: 'seed-b-1',
        reason: 'BOOKING',
        start_at: start1,
        end_at: end1,
      });
    }
  }

  // Check overlap (mirrors PostgreSQL EXCLUDE)
  private hasOverlap(tenantId: string, resourceId: string, startIso: string, endIso: string): boolean {
    const candidateStart = new Date(startIso).getTime();
    const candidateEnd = new Date(endIso).getTime();

    return this.occupancies.some((occ) => {
      if (occ.tenant_id !== tenantId || occ.resource_id !== resourceId) return false;
      const occStart = new Date(occ.start_at).getTime();
      const occEnd = new Date(occ.end_at).getTime();
      // [start, end) interval overlap
      return candidateStart < occEnd && candidateEnd > occStart;
    });
  }

  public async getAvailableSlots(
    tenantSlug: string,
    serviceId: string,
    optionIds: string[],
    masterId: string | null,
    dateString: string
  ): Promise<AvailableSlot[]> {
    const tenant = getTenantBySlug(tenantSlug);
    if (!tenant) throw new Error(`Tenant ${tenantSlug} not found`);

    const service = tenant.services.find((s) => s.id === serviceId);
    if (!service) throw new Error(`Service ${serviceId} not found`);

    let totalDurationMin = service.durationMin + service.bufferAfterMin;
    for (const optId of optionIds) {
      const opt = tenant.options.find((o) => o.id === optId);
      if (opt) {
        totalDurationMin += opt.durationMin + opt.bufferAfterMin;
      }
    }

    const targetDate = new Date(`${dateString}T00:00:00`);
    const dayOfWeek = targetDate.getDay();

    const studioHours = tenant.businessHours.find((bh) => bh.dayOfWeek === dayOfWeek);
    if (!studioHours || studioHours.isClosed) {
      return [];
    }

    // Candidate masters
    let candidateMasters = tenant.masters.filter((m) => m.isActive && m.serviceIds.includes(service.id));
    if (masterId) {
      candidateMasters = candidateMasters.filter((m) => m.id === masterId);
    }
    if (candidateMasters.length === 0) return [];

    const [openH, openM] = studioHours.openTime.split(':').map(Number);
    const [closeH, closeM] = studioHours.closeTime.split(':').map(Number);

    const studioOpenTime = new Date(`${dateString}T${String(openH).padStart(2, '0')}:${String(openM).padStart(2, '0')}:00`);
    const studioCloseTime = new Date(`${dateString}T${String(closeH).padStart(2, '0')}:${String(closeM).padStart(2, '0')}:00`);

    const slots: AvailableSlot[] = [];
    const slotStepMinutes = 30;
    const nowWithNotice = new Date(Date.now() + tenant.minBookingNoticeMin * 60 * 1000);

    let current = new Date(studioOpenTime);

    while (current.getTime() + totalDurationMin * 60 * 1000 <= studioCloseTime.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(slotStart.getTime() + totalDurationMin * 60 * 1000);

      if (slotStart.getTime() >= nowWithNotice.getTime()) {
        const availableMasterIds: string[] = [];

        for (const m of candidateMasters) {
          const mSched = m.schedule.find((s) => s.dayOfWeek === dayOfWeek);
          if (!mSched || mSched.isDayOff) continue;

          const [mStartH, mStartM] = mSched.startTime.split(':').map(Number);
          const [mEndH, mEndM] = mSched.endTime.split(':').map(Number);
          const masterStart = new Date(`${dateString}T${String(mStartH).padStart(2, '0')}:${String(mStartM).padStart(2, '0')}:00`);
          const masterEnd = new Date(`${dateString}T${String(mEndH).padStart(2, '0')}:${String(mEndM).padStart(2, '0')}:00`);

          if (slotStart >= masterStart && slotEnd <= masterEnd) {
            // Check EXCLUDE occupancy
            if (!this.hasOverlap(tenant.id, m.id, slotStart.toISOString(), slotEnd.toISOString())) {
              availableMasterIds.push(m.id);
            }
          }
        }

        // Check if at least one workplace of required type is free
        const availableWorkplace = tenant.workplaces.find((w) => {
          if (!w.isActive) return false;
          if (w.type !== service.requiredWorkplaceType && w.type !== 'UNIVERSAL') return false;
          return !this.hasOverlap(tenant.id, w.id, slotStart.toISOString(), slotEnd.toISOString());
        });

        if (availableMasterIds.length > 0 && availableWorkplace) {
          const hh = String(slotStart.getHours()).padStart(2, '0');
          const mm = String(slotStart.getMinutes()).padStart(2, '0');
          slots.push({
            time: `${hh}:${mm}`,
            datetime: slotStart.toISOString(),
            available_master_ids: availableMasterIds,
          });
        }
      }

      current = new Date(current.getTime() + slotStepMinutes * 60 * 1000);
    }

    return slots;
  }

  public async createBookingAtomic(params: {
    tenantSlug: string;
    serviceId: string;
    optionIds: string[];
    masterId: string | null;
    startAt: string;
    clientName: string;
    clientPhone: string;
    tokenHash: string;
    notes?: string;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; bookingId: string; bookingNumber: string; token: string }> {
    const tenant = getTenantBySlug(params.tenantSlug);
    if (!tenant) throw new Error(`Tenant "${params.tenantSlug}" not found`);

    const service = tenant.services.find((s) => s.id === params.serviceId);
    if (!service) throw new Error('Service not found');

    let totalDurationMin = service.durationMin + service.bufferAfterMin;
    let totalPrice = service.price;

    const chosenOptions = [];
    for (const optId of params.optionIds) {
      const opt = tenant.options.find((o) => o.id === optId);
      if (opt) {
        totalDurationMin += opt.durationMin + opt.bufferAfterMin;
        totalPrice += opt.price;
        chosenOptions.push(opt);
      }
    }

    const startAtDate = new Date(params.startAt);
    const endAtDate = new Date(startAtDate.getTime() + totalDurationMin * 60 * 1000);

    // Pick master
    let master = params.masterId ? tenant.masters.find((m) => m.id === params.masterId) : null;
    if (!master) {
      // Auto-pick first available
      master = tenant.masters.find((m) => {
        if (!m.isActive || !m.serviceIds.includes(service.id)) return false;
        return !this.hasOverlap(tenant.id, m.id, startAtDate.toISOString(), endAtDate.toISOString());
      });
    }

    if (!master) {
      throw new Error('Мастер не доступен на выбранное время (Overlapping occupancy error)');
    }

    // Verify master conflict (PostgreSQL EXCLUDE constraint emulation)
    if (this.hasOverlap(tenant.id, master.id, startAtDate.toISOString(), endAtDate.toISOString())) {
      throw new Error(`Master ${master.name} is already booked for this interval (EXCLUDE violation)`);
    }

    // Pick workplace
    const workplace = tenant.workplaces.find((w) => {
      if (!w.isActive) return false;
      if (w.type !== service.requiredWorkplaceType && w.type !== 'UNIVERSAL') return false;
      return !this.hasOverlap(tenant.id, w.id, startAtDate.toISOString(), endAtDate.toISOString());
    });

    const bookingId = `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const randCode = Math.floor(Math.random() * 8999 + 1000);
    const bookingNumber = `${tenant.slug.slice(0, 4).toUpperCase()}-${randCode}`;

    // Insert master occupancy
    this.occupancies.push({
      id: `occ-m-${Date.now()}`,
      tenant_id: tenant.id,
      resource_type: 'MASTER',
      resource_id: master.id,
      booking_id: bookingId,
      reason: 'BOOKING',
      start_at: startAtDate.toISOString(),
      end_at: endAtDate.toISOString(),
    });

    // Insert workplace occupancy if available
    if (workplace) {
      this.occupancies.push({
        id: `occ-w-${Date.now()}`,
        tenant_id: tenant.id,
        resource_type: 'WORKPLACE',
        resource_id: workplace.id,
        booking_id: bookingId,
        reason: 'BOOKING',
        start_at: startAtDate.toISOString(),
        end_at: endAtDate.toISOString(),
      });
    }

    const newBooking: BookingDetails = {
      id: bookingId,
      booking_number: bookingNumber,
      tenant_id: tenant.id,
      status: 'CONFIRMED',
      start_at: startAtDate.toISOString(),
      end_at: endAtDate.toISOString(),
      total_price: totalPrice,
      token_hash: params.tokenHash,
      notes: params.notes,
      client: {
        id: `client-${Date.now()}`,
        name: params.clientName,
        phone: params.clientPhone,
      },
      master: {
        id: master.id,
        name: master.name,
        title: master.title,
        avatar_url: master.avatarUrl,
      },
      workplace: workplace ? { id: workplace.id, name: workplace.name } : undefined,
      services: [{
        id: service.id,
        name: service.name,
        price: service.price,
        duration_min: service.durationMin,
      }],
      options: chosenOptions.map((o) => ({
        id: o.id,
        name: o.name,
        price: o.price,
        duration_min: o.durationMin,
      })),
      studio: {
        name: tenant.name,
        address: tenant.address,
        phone: tenant.phone,
        instructions: tenant.instructions,
      },
    };

    this.bookings.push(newBooking);
    this.saveToStorage();

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`beauty_active_booking_full_${tenant.slug}`, JSON.stringify(newBooking));
        localStorage.setItem('beauty_last_booking_full', JSON.stringify(newBooking));
      } catch {}
    }

    return {
      success: true,
      bookingId,
      bookingNumber,
      token: params.tokenHash,
    };
  }

  public async lookupBookingByToken(tenantSlug: string, tokenHash: string): Promise<BookingDetails | null> {
    this.loadFromStorage();
    const tenant = getTenantBySlug(tenantSlug);
    if (!tenant) return null;

    let booking = this.bookings.find(
      (b) => b.tenant_id === tenant.id && (b.token_hash === tokenHash || b.id === tokenHash)
    );
    if (booking) return booking;

    // Check localStorage backups
    if (typeof localStorage !== 'undefined') {
      try {
        const fullRaw = localStorage.getItem(`beauty_active_booking_full_${tenantSlug}`) || localStorage.getItem('beauty_last_booking_full');
        if (fullRaw) {
          const parsed: BookingDetails = JSON.parse(fullRaw);
          if (parsed && (parsed.token_hash === tokenHash || parsed.id === tokenHash)) {
            this.bookings.push(parsed);
            return parsed;
          }
        }
      } catch {}
    }
    return null;
  }

  public async findBookingsByPhone(tenantSlug: string, phoneQuery: string): Promise<BookingDetails[]> {
    this.loadFromStorage();
    const tenant = getTenantBySlug(tenantSlug);
    if (!tenant) return [];

    const cleanQuery = phoneQuery.replace(/\D/g, '');
    const searchTenDigits = cleanQuery.slice(-10);

    const candidates = [...this.bookings];
    if (typeof localStorage !== 'undefined') {
      try {
        const fullRaw = localStorage.getItem(`beauty_active_booking_full_${tenantSlug}`);
        if (fullRaw) candidates.push(JSON.parse(fullRaw));
        const lastRaw = localStorage.getItem('beauty_last_booking_full');
        if (lastRaw) candidates.push(JSON.parse(lastRaw));
      } catch {}
    }

    const matches = candidates.filter((b) => {
      if (b.tenant_id !== tenant.id) return false;
      const bDigits = (b.client?.phone || '').replace(/\D/g, '');
      if (searchTenDigits.length >= 7) {
        return bDigits.endsWith(searchTenDigits) || searchTenDigits.endsWith(bDigits.slice(-10));
      }
      return bDigits.includes(cleanQuery);
    });

    const seen = new Set<string>();
    return matches.filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }

  public async rescheduleBooking(params: {
    bookingId: string;
    tokenHash: string;
    newStartAt: string;
  }): Promise<{ success: boolean; newStartAt: string; newEndAt: string }> {
    const booking = this.bookings.find((b) => b.id === params.bookingId && b.token_hash === params.tokenHash);
    if (!booking) throw new Error('Запись не найдена или неверный токен');

    const durationMs = new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime();
    const newStart = new Date(params.newStartAt);
    const newEnd = new Date(newStart.getTime() + durationMs);

    // Filter out old occupancies temporarily to test new interval
    const backupOccupancies = [...this.occupancies];
    this.occupancies = this.occupancies.filter((o) => o.booking_id !== booking.id);

    // Test master overlap
    if (this.hasOverlap(booking.tenant_id, booking.master.id, newStart.toISOString(), newEnd.toISOString())) {
      this.occupancies = backupOccupancies; // rollback
      throw new Error('Выбранное новое время уже занято у этого мастера');
    }

    // Lock new master occupancy
    this.occupancies.push({
      id: `occ-resched-${Date.now()}`,
      tenant_id: booking.tenant_id,
      resource_type: 'MASTER',
      resource_id: booking.master.id,
      booking_id: booking.id,
      reason: 'BOOKING',
      start_at: newStart.toISOString(),
      end_at: newEnd.toISOString(),
    });

    booking.start_at = newStart.toISOString();
    booking.end_at = newEnd.toISOString();
    booking.status = 'CONFIRMED';
    this.saveToStorage();

    return {
      success: true,
      newStartAt: booking.start_at,
      newEndAt: booking.end_at,
    };
  }

  public async cancelBooking(params: {
    bookingId: string;
    tokenHash: string;
    reason?: string;
  }): Promise<{ success: boolean; status: string }> {
    const booking = this.bookings.find((b) => b.id === params.bookingId && b.token_hash === params.tokenHash);
    if (!booking) throw new Error('Запись не найдена или неверный токен');

    // Free resources
    this.occupancies = this.occupancies.filter((o) => o.booking_id !== booking.id);
    booking.status = 'CANCELLED';
    booking.cancellation_reason = params.reason || 'Отменено клиентом';
    this.saveToStorage();

    return { success: true, status: 'CANCELLED' };
  }

  public async getOwnerBookings(tenantSlug: string): Promise<BookingDetails[]> {
    this.loadFromStorage();
    const tenant = getTenantBySlug(tenantSlug);
    if (!tenant) return [];
    return this.bookings.filter((b) => b.tenant_id === tenant.id);
  }

  public async blockMasterTime(params: {
    tenantId: string;
    masterId: string;
    startAt: string;
    endAt: string;
    reason?: 'BREAK' | 'VACATION' | 'MAINTENANCE';
  }): Promise<{ success: boolean; occupancyId: string }> {
    if (this.hasOverlap(params.tenantId, params.masterId, params.startAt, params.endAt)) {
      throw new Error('Невозможно заблокировать время: в этом интервале уже есть запись');
    }

    const occId = `block-${Date.now()}`;
    this.occupancies.push({
      id: occId,
      tenant_id: params.tenantId,
      resource_type: 'MASTER',
      resource_id: params.masterId,
      reason: params.reason || 'BREAK',
      start_at: params.startAt,
      end_at: params.endAt,
    });
    this.saveToStorage();

    return { success: true, occupancyId: occId };
  }

  public async getStudioStats(tenantId: string): Promise<{
    created_count: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
    noshow_count: number;
    actual_revenue: number;
    projected_revenue: number;
  }> {
    const tenantBookings = this.bookings.filter((b) => b.tenant_id === tenantId);

    const created_count = tenantBookings.filter((b) => b.status === 'CREATED').length;
    const confirmed_count = tenantBookings.filter((b) => b.status === 'CONFIRMED').length;
    const completed_count = tenantBookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelled_count = tenantBookings.filter((b) => b.status === 'CANCELLED').length;
    const noshow_count = tenantBookings.filter((b) => b.status === 'NO_SHOW').length;

    const actual_revenue = tenantBookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.total_price, 0);

    const projected_revenue = tenantBookings
      .filter((b) => ['CREATED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status))
      .reduce((sum, b) => sum + b.total_price, 0);

    return {
      created_count,
      confirmed_count,
      completed_count,
      cancelled_count,
      noshow_count,
      actual_revenue,
      projected_revenue,
    };
  }
}

export const memoryStore = new MemoryBookingStore();

// Universal API wrapper (Supabase RPC with In-Memory fallback)
export const BookingEngine = {
  async getAvailableSlots(
    tenantSlug: string,
    serviceId: string,
    optionIds: string[],
    masterId: string | null,
    dateString: string
  ): Promise<AvailableSlot[]> {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_tenant_slug: tenantSlug,
        p_service_id: serviceId,
        p_option_ids: optionIds,
        p_master_id: masterId,
        p_date: dateString,
      });
      if (error) throw error;
      return (data as AvailableSlot[]) || [];
    }
    return memoryStore.getAvailableSlots(tenantSlug, serviceId, optionIds, masterId, dateString);
  },

  async createBooking(params: {
    tenantSlug: string;
    serviceId: string;
    optionIds: string[];
    masterId: string | null;
    startAt: string;
    clientName: string;
    clientPhone: string;
    notes?: string;
    idempotencyKey?: string;
  }): Promise<{ bookingId: string; bookingNumber: string; accessToken: string }> {
    const rawToken = 'b_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    const tokenHash = await hashTokenSha256(rawToken);

    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('create_booking_atomic', {
        p_tenant_slug: params.tenantSlug,
        p_service_id: params.serviceId,
        p_option_ids: params.optionIds,
        p_master_id: params.masterId,
        p_start_at: params.startAt,
        p_client_name: params.clientName,
        p_client_phone: params.clientPhone,
        p_token_hash: tokenHash,
        p_notes: params.notes || null,
      });
      if (error) throw error;
      return {
        bookingId: data.booking_id,
        bookingNumber: data.booking_number,
        accessToken: rawToken,
      };
    }

    const res = await memoryStore.createBookingAtomic({
      ...params,
      tokenHash,
    });
    return {
      bookingId: res.bookingId,
      bookingNumber: res.bookingNumber,
      accessToken: rawToken,
    };
  },

  async lookupBooking(tenantSlug: string, accessToken: string): Promise<BookingDetails | null> {
    const tokenHash = await hashTokenSha256(accessToken);
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('lookup_booking_by_token', {
        p_tenant_slug: tenantSlug,
        p_token_hash: tokenHash,
      });
      if (!error && data && !data.error) return data as BookingDetails;
    }

    // Try by hashed token
    let res = await memoryStore.lookupBookingByToken(tenantSlug, tokenHash);
    if (res) return res;

    // Fallback: try by raw accessToken
    res = await memoryStore.lookupBookingByToken(tenantSlug, accessToken);
    if (res) return res;

    // Fallback: look in memory store bookings list directly
    memoryStore.loadFromStorage();
    const fallback = memoryStore.bookings.find(
      (b) => b.token_hash === tokenHash || b.token_hash === accessToken || b.id === accessToken || b.booking_number === accessToken
    );
    return fallback || null;
  },

  async findBookingsByPhone(tenantSlug: string, phone: string): Promise<BookingDetails[]> {
    return memoryStore.findBookingsByPhone(tenantSlug, phone);
  },

  async rescheduleBooking(
    bookingId: string,
    accessToken: string,
    newStartAt: string
  ): Promise<{ success: boolean; newStartAt: string; newEndAt: string }> {
    const tokenHash = await hashTokenSha256(accessToken);
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('reschedule_booking_atomic', {
        p_booking_id: bookingId,
        p_token_hash: tokenHash,
        p_new_start_at: newStartAt,
      });
      if (error) throw error;
      return data;
    }
    return memoryStore.rescheduleBooking({
      bookingId,
      tokenHash,
      newStartAt,
    });
  },

  async cancelBooking(bookingId: string, accessToken: string, reason?: string): Promise<{ success: boolean }> {
    const tokenHash = await hashTokenSha256(accessToken);
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('cancel_booking_atomic', {
        p_booking_id: bookingId,
        p_token_hash: tokenHash,
        p_reason: reason || 'Cancelled by client',
      });
      if (error) throw error;
      return data;
    }
    return memoryStore.cancelBooking({
      bookingId,
      tokenHash,
      reason,
    });
  },

  async getOwnerBookings(tenantSlug: string): Promise<BookingDetails[]> {
    return memoryStore.getOwnerBookings(tenantSlug);
  },

  async blockMasterTime(params: {
    tenantId: string;
    masterId: string;
    startAt: string;
    endAt: string;
    reason?: 'BREAK' | 'VACATION' | 'MAINTENANCE';
  }) {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('block_master_time_atomic', {
        p_tenant_id: params.tenantId,
        p_master_id: params.masterId,
        p_start_at: params.startAt,
        p_end_at: params.endAt,
        p_reason: params.reason || 'BREAK',
      });
      if (error) throw error;
      return data;
    }
    return memoryStore.blockMasterTime(params);
  },

  async getStudioStats(tenantId: string) {
    if (isLiveSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('get_studio_stats', {
        p_tenant_id: tenantId,
        p_start_date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        p_end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      });
      if (error) throw error;
      return data;
    }
    return memoryStore.getStudioStats(tenantId);
  },
};
