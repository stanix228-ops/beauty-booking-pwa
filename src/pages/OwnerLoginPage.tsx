import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { isLiveSupabaseConfigured, supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

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

        navigate(`/s/${slug}/owner/`);
      } catch (err) {
        setError((err as Error).message || 'Ошибка авторизации');
        setIsLoading(false);
      }
      return;
    }

    // Demo / Local development mode fallback:
    // If no live Supabase credentials configured, authorize with demo credentials
    setTimeout(() => {
      if (email.includes('@') && password.length >= 4) {
        localStorage.setItem(`owner_session_${slug}`, JSON.stringify({ email, role: 'owner' }));
        navigate(`/s/${slug}/owner/`);
      } else {
        setError('Введите корректный email и пароль (минимум 4 символа).');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center px-4 py-12 safe-top safe-bottom">
      <div className="max-w-md mx-auto w-full space-y-6">
        <Link
          to={`/s/${slug}/`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться на сайт студии</span>
        </Link>

        <div className="text-center space-y-2">
          <div
            className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xl"
            style={{
              backgroundColor: 'var(--tenant-card)',
              borderColor: 'var(--tenant-accent)',
            }}
          >
            <Lock className="w-6 h-6" style={{ color: 'var(--tenant-accent)' }} />
          </div>

          <h1 className="text-2xl font-bold font-heading text-neutral-100">
            Вход для владельца
          </h1>
          <p className="text-xs text-neutral-400">
            {tenant?.name || 'Кабинет управления студией'}
          </p>
        </div>

        <Card className="space-y-4 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email администратора"
              type="email"
              placeholder="owner@studionails.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-base font-bold shadow-lg cursor-pointer"
            >
              Войти в кабинет
            </Button>
          </form>

          <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Доступ только для верифицированных сотрудников студии</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
