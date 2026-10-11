import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { isLiveSupabaseConfigured, supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LockKey, ArrowLeft, ShieldCheck } from '@phosphor-icons/react';

import { getOwnerCredentials, verifyOwnerLogin } from '../lib/owner-auth';

export function OwnerLoginPage() {
  const { slug } = useParams<{ slug: string }>();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const creds = getOwnerCredentials(slug || 'ayza-beauty-space');
  const [email, setEmail] = useState(() => creds.email);
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

    // Owner credentials verification (local / demo / offline / GitHub Pages mode)
    setTimeout(() => {
      const isValid = verifyOwnerLogin(slug || 'ayza-beauty-space', email, password);
      if (isValid) {
        localStorage.setItem(`owner_session_${slug}`, JSON.stringify({ email: email.trim(), role: 'owner' }));
        navigate(`/s/${slug}/owner/`);
      } else {
        setError('Неверный логин или пароль. Проверьте правильность введенных данных.');
        setIsLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col justify-center px-4 py-12 safe-top safe-bottom">
      <div className="max-w-md mx-auto w-full space-y-6">
        <Link
          to={`/s/${slug}/`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Вернуться на витрину студии</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border border-white/20 bg-white/10 shadow-2xl">
            <LockKey size={28} weight="duotone" className="text-white" />
          </div>

          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Кабинет студии
          </h1>
          <p className="text-xs text-[#8E8E93]">
            {tenant?.name || 'Управление записями и расписанием'}
          </p>
        </div>

        <Card className="space-y-4 p-6 border border-white/12 bg-[#0D0D11] backdrop-blur-md shadow-2xl rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Электронная почта
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@beauty-studio.ru"
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
              className="w-full h-11 text-sm font-bold rounded-xl bg-white text-black hover:bg-neutral-200 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition-all"
            >
              {isLoading ? 'Проверка прав...' : 'Войти по паролю'}
            </Button>
          </form>

          <div className="pt-2 border-t border-white/10 text-center">
            <p className="text-[11px] text-[#8E8E93] flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-white" />
              <span>Мультитенантная изоляция · Закрытый доступ</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
