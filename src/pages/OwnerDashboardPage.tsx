import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { BookingEngine, type BookingDetails } from '../lib/booking-store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { BottomSheet } from '../components/ui/BottomSheet';
import {
  SignOut,
  Prohibit,
  Plus,
  Trash,
  PaperPlaneTilt,
  Bell,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import type { GalleryItem } from '../../scripts/schema';
import { handlePhoneInput } from '../lib/phone';
import {
  getTelegramConfig,
  saveTelegramConfig,
  testTelegramNotification,
} from '../lib/telegram';

type Tab = 'today' | 'bookings' | 'calendar' | 'stats' | 'telegram' | 'gallery' | 'masters' | 'services' | 'settings';

export function OwnerDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  // Strict Auth Guard
  useEffect(() => {
    if (!slug) return;
    const session = localStorage.getItem(`owner_session_${slug}`);
    if (!session) {
      navigate(`/s/${slug}/owner/login`, { replace: true });
    }
  }, [slug, navigate]);

  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    created_count: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
    noshow_count: number;
    actual_revenue: number;
    projected_revenue: number;
  } | null>(null);

  // Filters & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);

  // Manual booking fields
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientPhone, setManualClientPhone] = useState('');
  const [manualServiceId, setManualServiceId] = useState('');
  const [manualMasterId, setManualMasterId] = useState('');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('12:00');

  // Block master fields
  const [blockMasterId, setBlockMasterId] = useState<string>('');
  const [blockStartTime, setBlockStartTime] = useState('14:00');
  const [blockEndTime, setBlockEndTime] = useState('15:00');
  const [blockReason, setBlockReason] = useState<'BREAK' | 'VACATION' | 'MAINTENANCE'>('BREAK');

  // Gallery management state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    return tenant?.assets?.galleryItems || [
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80', caption: 'French Couture Manicure', displayOrder: 1 },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=600&q=80', caption: 'Japanese Eco-Nail Restoration', displayOrder: 2 },
      { id: '3', imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80', caption: 'Signature Haute Nail Art', displayOrder: 3 },
    ];
  });
  const [newWorkUrl, setNewWorkUrl] = useState('');
  const [newWorkCaption, setNewWorkCaption] = useState('');

  // Telegram Bot settings state
  const [tgBotToken, setTgBotToken] = useState(() => (slug ? getTelegramConfig(slug).botToken : ''));
  const [tgChatId, setTgChatId] = useState(() => (slug ? getTelegramConfig(slug).chatId : ''));
  const [tgEnabled, setTgEnabled] = useState(() => (slug ? getTelegramConfig(slug).enabled : false));
  const [isTestingTg, setIsTestingTg] = useState(false);
  const [tgStatusMessage, setTgStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;
    saveTelegramConfig(slug, {
      botToken: tgBotToken.trim(),
      chatId: tgChatId.trim(),
      enabled: tgEnabled,
    });
    setTgStatusMessage({ text: 'Telegram bot settings saved successfully!' });
    setTimeout(() => setTgStatusMessage(null), 4000);
  };

  const handleTestTelegram = async () => {
    if (!tgBotToken.trim() || !tgChatId.trim()) {
      alert('Please enter both Bot Token and Chat ID first.');
      return;
    }
    setIsTestingTg(true);
    setTgStatusMessage(null);
    try {
      const res = await testTelegramNotification(tgBotToken, tgChatId, tenant?.name || 'Studio');
      if (res.success) {
        setTgStatusMessage({ text: '✅ Test notification sent successfully to your Telegram!' });
      } else {
        setTgStatusMessage({ text: `❌ Send error: ${res.error}`, isError: true });
      }
    } catch (err) {
      setTgStatusMessage({ text: `❌ Error: ${(err as Error).message}`, isError: true });
    } finally {
      setIsTestingTg(false);
    }
  };

  const loadData = async () => {
    if (!slug || !tenant) return;
    try {
      const list = await BookingEngine.getOwnerBookings(slug);
      setBookings(list);

      const st = await BookingEngine.getStudioStats(tenant.id);
      setStats(st);
    } catch (err) {
      console.error('Error loading owner data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug, tenant]);

  const handleStatusChange = async (bookingId: string, newStatus: BookingDetails['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    try {
      await BookingEngine.updateBookingStatus(bookingId, newStatus);
      loadData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment? It will be removed from the studio schedule.')) return;
    try {
      await BookingEngine.deleteBooking(bookingId, slug);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      loadData();
    } catch (err) {
      alert((err as Error).message || 'Failed to delete appointment');
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !blockMasterId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const startAt = `${today}T${blockStartTime}:00.000Z`;
      const endAt = `${today}T${blockEndTime}:00.000Z`;

      await BookingEngine.blockMasterTime({
        tenantId: tenant.id,
        masterId: blockMasterId,
        startAt,
        endAt,
        reason: blockReason,
      });

      alert('Artist schedule blocked successfully! These hours are removed from client booking.');
      setIsBlockModalOpen(false);
      loadData();
    } catch (err) {
      alert((err as Error).message || 'Failed to block time');
    }
  };

  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !manualServiceId) return;

    try {
      const startAt = `${manualDate}T${manualTime}:00.000Z`;
      await BookingEngine.createBooking({
        tenantSlug: tenant.slug,
        serviceId: manualServiceId,
        optionIds: [],
        masterId: manualMasterId || null,
        startAt,
        clientName: manualClientName.trim() || 'Walk-in Client',
        clientPhone: manualClientPhone.trim(),
        notes: 'Manually booked by administrator',
      });

      alert('Appointment created successfully!');
      setIsManualBookingOpen(false);
      loadData();
    } catch (err) {
      alert((err as Error).message || 'Failed to create appointment');
    }
  };

  const handleAddGalleryCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkUrl.trim() || !newWorkCaption.trim()) return;
    const newItem: GalleryItem = {
      id: `work-${Date.now()}`,
      imageUrl: newWorkUrl.trim(),
      caption: newWorkCaption.trim(),
      displayOrder: galleryItems.length + 1,
    };
    setGalleryItems((prev) => [...prev, newItem]);
    setNewWorkUrl('');
    setNewWorkCaption('');
    alert('New portfolio item added successfully!');
  };

  const handleUpdateGalleryCaption = (id: string, newCaption: string) => {
    setGalleryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption: newCaption } : item))
    );
  };

  const handleUpdateGalleryPhoto = (id: string, newUrl: string) => {
    setGalleryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, imageUrl: newUrl } : item))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem(`owner_session_${slug}`);
    navigate(`/s/${slug}/owner/login`);
  };

  if (!tenant) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-2 border-neutral-700 border-t-blue-500 animate-spin mb-3" />
        <p className="text-xs text-neutral-400">Loading studio dashboard...</p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.start_at.startsWith(todayStr));

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.client.phone.includes(searchQuery) ||
      b.booking_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalClientsCount = new Set(bookings.map((b) => b.client.phone)).size;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;
  const actualRevenue = stats?.actual_revenue ?? bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="min-h-screen bg-black text-white pb-20 safe-top safe-bottom">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/s/${slug}/`}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              ← Storefront
            </Link>
            <div className="h-4 w-px bg-white/15" />
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{tenant.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Dashboard
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <SignOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-white/10 bg-black/60 sticky top-14 z-10 px-4 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'bookings', label: 'All Bookings' },
              { id: 'stats', label: 'Analytics' },
              { id: 'telegram', label: 'Telegram Bot 🔔' },
              { id: 'gallery', label: 'Portfolio' },
              { id: 'masters', label: 'Artists' },
              { id: 'services', label: 'Services' },
              { id: 'settings', label: 'Settings' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                backgroundColor: activeTab === t.id ? 'var(--tenant-accent, #4690FF)' : undefined,
                color: activeTab === t.id ? '#FFFFFF' : undefined,
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'font-bold shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-5">
        {/* TAB 1: TODAY */}
        {activeTab === 'today' && (
          <div className="space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-3.5 space-y-1 border border-white/10 bg-neutral-900/60">
                <div className="text-[11px] text-neutral-400">Today's Bookings</div>
                <div className="text-xl font-bold text-white">{todayBookings.length}</div>
              </Card>

              <Card className="p-3.5 space-y-1 border border-white/10 bg-neutral-900/60">
                <div className="text-[11px] text-neutral-400">Completed</div>
                <div className="text-xl font-bold text-emerald-400">
                  {todayBookings.filter((b) => b.status === 'COMPLETED').length}
                </div>
              </Card>

              <Card className="p-3.5 space-y-1 border border-white/10 bg-neutral-900/60">
                <div className="text-[11px] text-neutral-400">Cancelled</div>
                <div className="text-xl font-bold text-red-400">
                  {todayBookings.filter((b) => b.status === 'CANCELLED').length}
                </div>
              </Card>

              <Card className="p-3.5 space-y-1 border border-white/10 bg-neutral-900/60">
                <div className="text-[11px] text-neutral-400">Today's Revenue</div>
                <div className="text-xl font-bold text-blue-400" style={{ color: 'var(--tenant-accent, #4690FF)' }}>
                  $
                  {todayBookings
                    .filter((b) => b.status === 'COMPLETED')
                    .reduce((sum, b) => sum + b.total_price, 0)
                    .toLocaleString('en-US')}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => setIsManualBookingOpen(true)}
              >
                <Plus size={15} />
                <span>New Manual Booking</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => setIsBlockModalOpen(true)}
              >
                <Prohibit size={15} />
                <span>Block Artist Schedule</span>
              </Button>
            </div>

            {/* Today Appointments List */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-neutral-300">
                Today's Schedule ({todayBookings.length})
              </h2>

              {todayBookings.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-white/10 text-neutral-500 text-xs">
                  No appointments scheduled for today. Click "New Manual Booking" or wait for client online bookings.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todayBookings.map((b) => (
                    <Card key={b.id} className="p-4 space-y-3 border border-white/10 bg-neutral-900/60">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{b.start_at.slice(11, 16)}</span>
                            <span className="text-xs text-neutral-400 font-mono">{b.booking_number}</span>
                          </div>
                          <div className="text-sm font-semibold text-white mt-1">{b.client.name}</div>
                          <div className="text-xs text-neutral-400">{b.client.phone}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-white" style={{ color: 'var(--tenant-accent, #4690FF)' }}>
                            ${b.total_price.toLocaleString('en-US')}
                          </div>
                          <Badge
                            variant={
                              b.status === 'COMPLETED' ? 'success' : b.status === 'CANCELLED' ? 'destructive' : 'default'
                            }
                            className="mt-1"
                          >
                            {b.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/10 text-xs">
                        <button
                          onClick={() => handleStatusChange(b.id, 'IN_PROGRESS')}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors cursor-pointer"
                        >
                          Arrived
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'NO_SHOW')}
                          className="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors cursor-pointer"
                        >
                          No-Show
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="ml-auto px-2.5 py-1 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/50 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Delete appointment"
                        >
                          <Trash size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ALL BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client name, phone or booking number..."
                  className="w-full h-10 px-3.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-neutral-900 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredBookings.map((b) => (
                <Card key={b.id} className="p-3.5 border border-white/10 bg-neutral-900/60 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">{b.client.name} · {b.client.phone}</div>
                      <div className="text-[11px] text-neutral-400">
                        {b.start_at.slice(0, 10)} at {b.start_at.slice(11, 16)} · Artist: {b.master.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">${b.total_price.toLocaleString('en-US')}</div>
                      <Badge
                        variant={
                          b.status === 'COMPLETED' ? 'success' : b.status === 'CANCELLED' ? 'destructive' : 'default'
                        }
                        className="mt-1 text-[10px]"
                      >
                        {b.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value as any)}
                      className="h-7 px-2 rounded-lg bg-black/60 border border-white/10 text-[11px] text-neutral-300 focus:outline-none cursor-pointer"
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="NO_SHOW">NO_SHOW</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <button
                      onClick={() => handleDeleteBooking(b.id)}
                      className="ml-auto px-2.5 py-1 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/50 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      title="Delete appointment"
                    >
                      <Trash size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-200">
              Studio Business Intelligence
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Card className="p-4 border border-white/10 bg-neutral-900/60 space-y-1">
                <div className="text-xs text-neutral-400">Total Unique Clients</div>
                <div className="text-2xl font-bold text-white">{totalClientsCount}</div>
              </Card>

              <Card className="p-4 border border-white/10 bg-neutral-900/60 space-y-1">
                <div className="text-xs text-neutral-400">Total Bookings</div>
                <div className="text-2xl font-bold text-white">{bookings.length}</div>
              </Card>

              <Card className="p-4 border border-white/10 bg-neutral-900/60 space-y-1">
                <div className="text-xs text-neutral-400">Completed Services</div>
                <div className="text-2xl font-bold text-emerald-400">{completedCount}</div>
              </Card>

              <Card className="p-4 border border-white/10 bg-neutral-900/60 space-y-1">
                <div className="text-xs text-neutral-400">Cancelled</div>
                <div className="text-2xl font-bold text-red-400">{cancelledCount}</div>
              </Card>

              <Card className="p-4 border border-white/10 bg-neutral-900/60 space-y-1 sm:col-span-2">
                <div className="text-xs text-neutral-400">Total Realized Revenue</div>
                <div className="text-2xl font-bold text-blue-400" style={{ color: 'var(--tenant-accent, #4690FF)' }}>
                  ${actualRevenue.toLocaleString('en-US')}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 4: TELEGRAM BOT SETTINGS */}
        {activeTab === 'telegram' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <PaperPlaneTilt size={18} weight="bold" className="text-[#2AABEE]" />
                <span>Telegram Instant Booking Notifications</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Connect the studio Telegram bot to receive real-time reservation alerts with full client details directly on your phone.
              </p>
            </div>

            {tgStatusMessage && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                tgStatusMessage.isError
                  ? 'bg-red-950/40 border-red-800 text-red-300'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              }`}>
                {tgStatusMessage.isError ? <WarningCircle size={16} /> : <CheckCircle size={16} />}
                <span>{tgStatusMessage.text}</span>
              </div>
            )}

            <Card className="p-4 sm:p-5 border border-white/10 bg-neutral-900/60 space-y-4">
              <form onSubmit={handleSaveTelegram} className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-black border border-white/10">
                  <div>
                    <div className="font-semibold text-white">Enable Telegram Notifications</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Send message alerts every time a client confirms an appointment
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tgEnabled}
                      onChange={(e) => setTgEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="text-neutral-300 font-medium mb-1 block">
                    Bot HTTP API Token (from @BotFather) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="password"
                    value={tgBotToken}
                    onChange={(e) => setTgBotToken(e.target.value)}
                    placeholder="e.g. 1234567890:AAH_XxXxXxXxXxXxXxXxXxXxXxXx"
                    required={tgEnabled}
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Free and takes 1 minute to create in Telegram via @BotFather
                  </p>
                </div>

                <div>
                  <label className="text-neutral-300 font-medium mb-1 block">
                    Your Chat ID (where alerts are sent) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={tgChatId}
                    onChange={(e) => setTgChatId(e.target.value)}
                    placeholder="e.g. 987654321"
                    required={tgEnabled}
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Check your Chat ID instantly by messaging @userinfobot in Telegram
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="cursor-pointer font-bold bg-white text-black hover:bg-neutral-200"
                  >
                    Save Settings
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    isLoading={isTestingTg}
                    onClick={handleTestTelegram}
                    className="cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Bell size={15} />
                    <span>Send Test Notification</span>
                  </Button>
                </div>
              </form>
            </Card>

            {/* Step-by-Step Instructions */}
            <Card className="p-4 sm:p-5 border border-white/10 bg-neutral-900/40 space-y-3 text-xs">
              <h3 className="font-bold text-white text-sm">
                2-Minute Quick Setup Guide:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-neutral-300 leading-relaxed">
                <li>
                  Open Telegram and search for <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-400 underline underline-offset-2">@BotFather</a>.
                </li>
                <li>
                  Send the command <code className="bg-black px-1.5 py-0.5 rounded border border-white/10 text-white font-mono">/newbot</code>, then specify a name and username for your studio bot (e.g., <code className="text-white font-mono">lumi_booking_bot</code>).
                </li>
                <li>
                  Copy the provided <b>API Token</b> and paste it into the field above.
                </li>
                <li>
                  Open your newly created bot in Telegram and press <b>/start</b> to enable messaging.
                </li>
                <li>
                  Open <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-blue-400 underline underline-offset-2">@userinfobot</a> in Telegram — it will reply with your numeric <b>Id</b>. Paste it into the Chat ID field.
                </li>
                <li>
                  Click <b>"Save Settings"</b> and verify with <b>"Send Test Notification"</b>!
                </li>
              </ol>
            </Card>
          </div>
        )}

        {/* TAB 5: GALLERY MANAGEMENT */}
        {activeTab === 'gallery' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-200">
                Portfolio Showcase ({galleryItems.length})
              </h2>
            </div>

            {/* 1. Add new card */}
            <Card className="p-4 border border-white/10 bg-neutral-900/60 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                1. Add New Portfolio Item
              </h3>
              <form onSubmit={handleAddGalleryCard} className="space-y-3">
                <Input
                  value={newWorkUrl}
                  onChange={(e) => setNewWorkUrl(e.target.value)}
                  placeholder="Photo URL (Supabase Storage / Unsplash)"
                  required
                />
                <Input
                  value={newWorkCaption}
                  onChange={(e) => setNewWorkCaption(e.target.value)}
                  placeholder="Photo Caption (e.g. Ombré Gel Sculpture)"
                  required
                />
                <Button type="submit" variant="primary" size="sm" className="cursor-pointer">
                  Add Portfolio Item
                </Button>
              </form>
            </Card>

            {/* 2 & 3. Change photo or caption */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {galleryItems.map((item) => (
                <Card key={item.id} className="p-3.5 border border-white/10 bg-neutral-900/60 space-y-2.5">
                  <div className="h-36 rounded-xl overflow-hidden bg-neutral-950">
                    <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-neutral-400">Edit Caption:</label>
                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => handleUpdateGalleryCaption(item.id, e.target.value)}
                        className="w-full h-8 px-2 rounded-lg bg-black border border-white/10 text-xs text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">Replace Photo (URL):</label>
                      <input
                        type="text"
                        value={item.imageUrl}
                        onChange={(e) => handleUpdateGalleryPhoto(item.id, e.target.value)}
                        className="w-full h-8 px-2 rounded-lg bg-black border border-white/10 text-xs text-white mt-1 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MASTERS */}
        {activeTab === 'masters' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-200">
              Artist Team ({tenant.masters.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tenant.masters.map((m) => (
                <Card key={m.id} className="p-4 border border-white/10 bg-neutral-900/60 space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={m.avatarUrl} alt={m.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{m.name}</h4>
                      <p className="text-xs text-neutral-400">{m.title}</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{m.bio}</p>
                  <div className="text-[11px] text-neutral-400 pt-2 border-t border-white/10 flex justify-between">
                    <span>Rating: {m.rating} ★</span>
                    <span>Reviews: {m.reviewsCount}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-200">
              Services & Pricing ({tenant.services.length})
            </h2>
            <div className="space-y-2.5">
              {tenant.services.map((s) => (
                <Card key={s.id} className="p-3.5 border border-white/10 bg-neutral-900/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{s.name}</h4>
                    <p className="text-[11px] text-neutral-400">{s.durationMin} min · Buffer {s.bufferAfterMin} min</p>
                  </div>
                  <div className="text-sm font-bold text-white" style={{ color: 'var(--tenant-accent, #4690FF)' }}>
                    ${s.price}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-neutral-200">
              Studio Parameters & Branding
            </h2>

            <Card className="p-4 space-y-3 text-xs text-neutral-300 border border-white/10 bg-neutral-900/60">
              <div>
                <div className="text-neutral-500">Studio Name:</div>
                <div className="font-semibold text-white text-sm">{tenant.name}</div>
              </div>
              <div>
                <div className="text-neutral-500">Address & Phone:</div>
                <div>{tenant.address} • {tenant.phone}</div>
              </div>
              <div>
                <div className="text-neutral-500">Brand Accent Color:</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: tenant.theme.accentColor }} />
                  <span className="font-mono">{tenant.theme.accentColor}</span>
                </div>
              </div>
            </Card>

            {/* Info Cards Settings */}
            <Card className="p-4 space-y-3 border border-white/10 bg-neutral-900/60">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Storefront Highlights & Info Cards
              </h3>
              <div className="space-y-2.5">
                {(tenant.infoCards || []).map((c, i) => (
                  <div key={c.id || i} className="p-3 rounded-xl bg-black border border-white/10 text-xs space-y-1">
                    <div className="font-semibold text-white">Highlight {i + 1}: {c.title}</div>
                    <div className="text-neutral-400">{c.description}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Manual Booking Modal */}
      <BottomSheet
        open={isManualBookingOpen}
        onOpenChange={setIsManualBookingOpen}
        title="New Manual Booking"
        description="Add a walk-in client or an appointment scheduled via phone"
      >
        <form onSubmit={handleManualBookingSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-neutral-400 mb-1 block">Client Full Name</label>
            <Input value={manualClientName} onChange={(e) => setManualClientName(e.target.value)} placeholder="e.g. Sarah Jenkins" required />
          </div>
          <div>
            <label className="text-neutral-400 mb-1 block">Phone Number</label>
            <Input
              value={manualClientPhone}
              onChange={(e) => setManualClientPhone(handlePhoneInput(e.target.value, manualClientPhone))}
              placeholder="+1 (310) 555-0199"
              required
            />
          </div>
          <div>
            <label className="text-neutral-400 mb-1 block">Service</label>
            <select
              value={manualServiceId}
              onChange={(e) => setManualServiceId(e.target.value)}
              className="w-full h-11 px-3 bg-neutral-900 border border-white/15 rounded-xl text-white"
              required
            >
              <option value="">-- Select Service --</option>
              {tenant.services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-neutral-400 mb-1 block">Artist</label>
            <select
              value={manualMasterId}
              onChange={(e) => setManualMasterId(e.target.value)}
              className="w-full h-11 px-3 bg-neutral-900 border border-white/15 rounded-xl text-white"
            >
              <option value="">Any Available Artist</option>
              {tenant.masters.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-neutral-400 mb-1 block">Date</label>
              <Input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} required />
            </div>
            <div>
              <label className="text-neutral-400 mb-1 block">Time</label>
              <Input type="time" value={manualTime} onChange={(e) => setManualTime(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full cursor-pointer mt-2">
            Confirm Appointment
          </Button>
        </form>
      </BottomSheet>

      {/* Block Master Time Modal */}
      <BottomSheet
        open={isBlockModalOpen}
        onOpenChange={setIsBlockModalOpen}
        title="Block Artist Schedule"
        description="Reserve time intervals to prevent online client bookings"
      >
        <form onSubmit={handleCreateBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Select Artist
            </label>
            <select
              value={blockMasterId}
              onChange={(e) => setBlockMasterId(e.target.value)}
              className="w-full h-11 px-3 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none"
              required
            >
              <option value="">-- Select Artist --</option>
              {tenant.masters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.title})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={blockStartTime}
              onChange={(e) => setBlockStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={blockEndTime}
              onChange={(e) => setBlockEndTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Block Reason
            </label>
            <select
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value as any)}
              className="w-full h-11 px-3 bg-neutral-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="BREAK">Meal Break / Personal</option>
              <option value="VACATION">Vacation / Day Off</option>
              <option value="MAINTENANCE">Training / Masterclass / Admin</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full cursor-pointer">
            Block Time Interval
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
