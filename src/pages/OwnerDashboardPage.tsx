import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { BookingEngine, type BookingDetails } from '../lib/booking-store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { BottomSheet } from '../components/ui/BottomSheet';
import {
  Clock,
  LogOut,
  Ban,
  Search,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

type Tab = 'today' | 'bookings' | 'calendar' | 'stats' | 'masters' | 'services' | 'settings';

export function OwnerDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tenant } = useTenant();
  const navigate = useNavigate();

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
  const [blockMasterId, setBlockMasterId] = useState<string>('');
  const [blockStartTime, setBlockStartTime] = useState('14:00');
  const [blockEndTime, setBlockEndTime] = useState('15:00');
  const [blockReason, setBlockReason] = useState<'BREAK' | 'VACATION' | 'MAINTENANCE'>('BREAK');

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

  const handleStatusChange = (bookingId: string, newStatus: BookingDetails['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
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

      alert('Блокировка времени мастера успешно создана! Эти часы исключены из публичной записи.');
      setIsBlockModalOpen(false);
      loadData();
    } catch (err) {
      alert((err as Error).message || 'Ошибка блокировки времени');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`owner_session_${slug}`);
    navigate(`/s/${slug}/owner/login`);
  };

  if (!tenant) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-2 border-neutral-700 border-t-amber-400 animate-spin mb-3" />
        <p className="text-xs text-neutral-400">Загрузка панели управления...</p>
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20 safe-top safe-bottom">
      {/* Top Navigation */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-20 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/s/${slug}/`}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              Сайт
            </Link>
            <div>
              <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <span>{tenant.name}</span>
                <span
                  style={{ backgroundColor: 'var(--tenant-accent)' }}
                  className="w-2 h-2 rounded-full inline-block"
                />
              </div>
              <div className="text-[11px] text-neutral-400">Кабинет управления студией</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Tabs Navigation */}
      <div className="border-b border-neutral-800/80 bg-neutral-950/60 sticky top-14 z-10 px-4 py-2 overflow-x-auto no-scrollbar">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {(
            [
              { id: 'today', label: 'Сегодня' },
              { id: 'bookings', label: 'Записи' },
              { id: 'calendar', label: 'Календарь' },
              { id: 'stats', label: 'Статистика' },
              { id: 'masters', label: 'Мастера' },
              { id: 'services', label: 'Услуги' },
              { id: 'settings', label: 'Настройки' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                backgroundColor: activeTab === t.id ? 'var(--tenant-accent)' : undefined,
                color: activeTab === t.id ? '#0D0D11' : undefined,
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'font-bold shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
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
              <Card className="p-3.5 space-y-1">
                <div className="text-[11px] text-neutral-400">Записей сегодня</div>
                <div className="text-xl font-bold text-neutral-100">{todayBookings.length}</div>
              </Card>

              <Card className="p-3.5 space-y-1">
                <div className="text-[11px] text-neutral-400">Выполнено</div>
                <div className="text-xl font-bold text-emerald-400">
                  {todayBookings.filter((b) => b.status === 'COMPLETED').length}
                </div>
              </Card>

              <Card className="p-3.5 space-y-1">
                <div className="text-[11px] text-neutral-400">Отменено</div>
                <div className="text-xl font-bold text-red-400">
                  {todayBookings.filter((b) => b.status === 'CANCELLED').length}
                </div>
              </Card>

              <Card className="p-3.5 space-y-1">
                <div className="text-[11px] text-neutral-400">Выручка сегодня</div>
                <div className="text-xl font-bold text-amber-400">
                  {todayBookings
                    .filter((b) => b.status === 'COMPLETED')
                    .reduce((sum, b) => sum + b.total_price, 0)
                    .toLocaleString('ru-RU')}{' '}
                  ₽
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => setIsBlockModalOpen(true)}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Заблокировать время мастера</span>
              </Button>
            </div>

            {/* Today Appointments List */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-neutral-300">
                Расписание на сегодня ({todayBookings.length})
              </h2>

              {todayBookings.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-500 text-xs">
                  На сегодня записей нет.
                </div>
              ) : (
                <div className="space-y-3">
                  {todayBookings.map((b) => (
                    <Card key={b.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm font-bold text-neutral-100">
                            {new Date(b.start_at).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">
                            {b.booking_number}
                          </span>
                        </div>
                        <Badge
                          variant={
                            b.status === 'COMPLETED'
                              ? 'success'
                              : b.status === 'CANCELLED'
                              ? 'destructive'
                              : 'accent'
                          }
                        >
                          {b.status}
                        </Badge>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-neutral-200">
                            {b.client.name}
                          </div>
                          <div className="text-xs text-neutral-400">{b.client.phone}</div>
                          <div className="text-xs text-neutral-400 mt-1">
                            {b.services.map((s) => s.name).join(', ')}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-neutral-100">
                            {b.total_price.toLocaleString('ru-RU')} ₽
                          </div>
                          <div className="text-xs text-neutral-400">
                            Мастер: {b.master.name}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-neutral-800 flex items-center gap-2 flex-wrap">
                        {b.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900 transition-colors cursor-pointer"
                          >
                            Завершить
                          </button>
                        )}
                        {b.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'CANCELLED')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-950 text-red-300 border border-red-800/60 hover:bg-red-900 transition-colors cursor-pointer"
                          >
                            Отменить
                          </button>
                        )}
                        {b.status !== 'NO_SHOW' && (
                          <button
                            onClick={() => handleStatusChange(b.id, 'NO_SHOW')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Неявка
                          </button>
                        )}
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
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Поиск по имени, телефону или номеру записи..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/80"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      statusFilter === st
                        ? 'bg-neutral-800 text-white border border-neutral-700 font-semibold'
                        : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {st === 'ALL' ? 'Все' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-3">
              {filteredBookings.map((b) => (
                <Card key={b.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-200">
                      {new Date(b.start_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <Badge
                      variant={
                        b.status === 'COMPLETED'
                          ? 'success'
                          : b.status === 'CANCELLED'
                          ? 'destructive'
                          : 'accent'
                      }
                    >
                      {b.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-neutral-100">{b.client.name}</span>
                      <span className="text-neutral-400 ml-2">{b.client.phone}</span>
                    </div>
                    <span className="font-bold text-neutral-100">
                      {b.total_price.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400">
                    Мастер: {b.master.name} • {b.services.map((s) => s.name).join(', ')}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-200">
                Сетка расписания мастеров
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsBlockModalOpen(true)}
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                <span>Блок времени</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenant.masters.map((m) => {
                const masterBookings = bookings.filter((b) => b.master.id === m.id);

                return (
                  <Card key={m.id} className="p-4 space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold">
                            {m.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-neutral-100">{m.name}</div>
                        <div className="text-xs text-neutral-400">{m.title}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-neutral-400 font-medium">
                        Активные записи мастера ({masterBookings.length}):
                      </div>
                      {masterBookings.length === 0 ? (
                        <div className="text-xs text-neutral-500 italic py-2">
                          Свободен на весь период
                        </div>
                      ) : (
                        masterBookings.map((b) => (
                          <div
                            key={b.id}
                            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-neutral-200">
                                {new Date(b.start_at).toLocaleTimeString('ru-RU', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className="text-neutral-400 ml-2">{b.client.name}</span>
                            </div>
                            <Badge variant="accent">{b.status}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SQL STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>SQL Аналитика показателей студии</span>
            </h2>

            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 space-y-2">
                  <div className="text-xs text-neutral-400">Фактическая выручка (COMPLETED)</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {stats.actual_revenue.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Только реально оказанные и оплаченные услуги
                  </div>
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="text-xs text-neutral-400">Прогнозируемая стоимость броней</div>
                  <div className="text-2xl font-bold text-neutral-100">
                    {stats.projected_revenue.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Включая подтвержденные и созданные записи
                  </div>
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="text-xs text-neutral-400">Статусы записей</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Подтверждено:</span>
                      <span className="font-semibold">{stats.confirmed_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Завершено:</span>
                      <span className="font-semibold text-emerald-400">{stats.completed_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Отменено:</span>
                      <span className="font-semibold text-red-400">{stats.cancelled_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Неявки:</span>
                      <span className="font-semibold text-amber-400">{stats.noshow_count}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="text-xs text-neutral-400">Изоляция тенанта</div>
                  <div className="text-xs text-neutral-300">
                    UUID студии: <span className="font-mono text-[11px] text-neutral-400">{tenant.id}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-2">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>RLS и EXCLUDE constraints активны</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MASTERS */}
        {activeTab === 'masters' && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-neutral-200">
              Мастера студии ({tenant.masters.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tenant.masters.map((m) => (
                <Card key={m.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                      {m.avatarUrl && <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-neutral-100">{m.name}</div>
                      <div className="text-xs text-neutral-400">{m.title}</div>
                      <div className="text-[11px] text-amber-400">Рейтинг: {m.rating} ★</div>
                    </div>
                  </div>
                  {m.bio && <p className="text-xs text-neutral-400 pt-1 leading-relaxed">{m.bio}</p>}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-neutral-200">
              Каталог услуг ({tenant.services.length})
            </h2>
            <div className="space-y-2">
              {tenant.services.map((s) => (
                <Card key={s.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-neutral-200">{s.name}</div>
                    <div className="text-xs text-neutral-400">{s.durationMin} мин</div>
                  </div>
                  <div className="text-sm font-bold text-neutral-100">
                    {s.price.toLocaleString('ru-RU')} ₽
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-neutral-200">
              Параметры и брендинг студии
            </h2>

            <Card className="p-4 space-y-3 text-xs text-neutral-300">
              <div>
                <div className="text-neutral-500">Название:</div>
                <div className="font-semibold text-neutral-100 text-sm">{tenant.name}</div>
              </div>
              <div>
                <div className="text-neutral-500">Slug в URL:</div>
                <div className="font-mono text-neutral-200">/s/{tenant.slug}/</div>
              </div>
              <div>
                <div className="text-neutral-500">Адрес и телефон:</div>
                <div>{tenant.address} • {tenant.phone}</div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: tenant.theme.accentColor }}
                  />
                  <span>Акцент: {tenant.theme.accentColor}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: tenant.theme.bgColor }}
                  />
                  <span>Фон: {tenant.theme.bgColor}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Block Master Time Modal */}
      <BottomSheet
        open={isBlockModalOpen}
        onOpenChange={setIsBlockModalOpen}
        title="Блокировка времени мастера"
        description="Исключите временной интервал из публичной онлайн-записи"
      >
        <form onSubmit={handleCreateBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Выберите мастера
            </label>
            <select
              value={blockMasterId}
              onChange={(e) => setBlockMasterId(e.target.value)}
              className="w-full h-11 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none"
              required
            >
              <option value="">-- Выберите мастера --</option>
              {tenant.masters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.title})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Время начала"
              type="time"
              value={blockStartTime}
              onChange={(e) => setBlockStartTime(e.target.value)}
              required
            />
            <Input
              label="Время окончания"
              type="time"
              value={blockEndTime}
              onChange={(e) => setBlockEndTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Причина блокировки
            </label>
            <select
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value as any)}
              className="w-full h-11 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none"
            >
              <option value="BREAK">Обеденный перерыв</option>
              <option value="VACATION">Отпуск / Отгул</option>
              <option value="MAINTENANCE">Техническое обслуживание / Обучение</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full cursor-pointer">
            Создать блокировку
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
