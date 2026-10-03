import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { isLiveSupabaseConfigured, supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LockKey, ArrowLeft, ShieldCheck } from '@phosphor-icons/react';

export function OwnerLoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // If live Supabase is configured, authenticate via Supabase Auth
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;

        // Verify tenant membership
        const { data: membership, error: memError } = await supabase
          .from('tenant_memberships')
          .select('role')
          .eq('tenant_id', tenant?.id)
          .eq('user_id', data.user.id)
          .single();

        if (memError || !membership) {
          await supabase.auth.signOut();
          throw new Error('У вас нет прав доступа к этой студии.');
        }

        localStorage.setItem(`owner_session_${slug}`, JSON.stringify({ email, role: membership.role }));
        navigate(`/s/${slug}/owner/`);
      } catch (err) {
        setError((err as Error).message || 'Ошибка авторизации');
        setIsLoading(false);
      }
      return;
    }

    // Demo / Local development mode fallback:
    setTimeout(() => {
      if (email.includes('@') && password.length >= 4) {
        localStorage.setItem(`owner_session_${slug}`, JSON.stringify({ email, role: 'owner' }));
        navigate(`/s/${slug}/owner/`);
      } else {
        setError('Введите корректный email и пароль (минимум 4 символа).');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-4 py-12 safe-top safe-bottom">
      <div className="max-w-md mx-auto w-full space-y-6">
        <Link
          to={`/s/${slug}/`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Вернуться на витрину студии</span>
        </Link>

        <div className="text-center space-y-2">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xl"
            style={{
              backgroundColor: 'var(--tenant-card, #121216)',
              borderColor: 'var(--tenant-accent, #4690FF)',
            }}
          >
            <LockKey size={28} weight="duotone" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
          </div>

          <h1 className="text-2xl font-bold text-white">
            Вход для владельца
          </h1>
          <p className="text-xs text-neutral-400">
            {tenant?.name || 'Кабинет управления студией'}
          </p>
        </div>

        <Card className="space-y-4 p-6 border border-white/10 bg-neutral-900/60 backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Электронная почта
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@beauty-studio.ru"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Пароль
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold rounded-xl text-white cursor-pointer"
              style={{ backgroundColor: 'var(--tenant-accent, #4690FF)' }}
            >
              {isLoading ? 'Проверка прав...' : 'Войти в кабинет'}
            </Button>
          </form>

          <div className="pt-2 border-t border-white/10 text-center">
            <p className="text-[11px] text-neutral-500 flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Доступ защищен Supabase RLS · Закрытая регистрация</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
