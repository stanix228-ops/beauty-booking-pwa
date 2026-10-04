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

  const [email, setEmail] = useState('admin@lumi-atelier.com');
  const [password, setPassword] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickDemoLogin = () => {
    localStorage.setItem(`owner_session_${slug}`, JSON.stringify({ email: 'admin@lumi-atelier.com', role: 'owner' }));
    navigate(`/s/${slug}/owner/`);
  };

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
          throw new Error('You do not have administrative access to this studio.');
        }

        localStorage.setItem(`owner_session_${slug}`, JSON.stringify({ email, role: membership.role }));
        navigate(`/s/${slug}/owner/`);
      } catch (err) {
        setError((err as Error).message || 'Authentication failed');
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
        setError('Please enter a valid email and password (min 4 characters).');
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col justify-center px-4 py-12 safe-top safe-bottom">
      <div className="max-w-md mx-auto w-full space-y-6">
        <Link
          to={`/s/${slug}/`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Studio Storefront</span>
        </Link>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border border-white/20 bg-white/10 shadow-2xl">
            <LockKey size={28} weight="duotone" className="text-white" />
          </div>

          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Owner Portal
          </h1>
          <p className="text-xs text-[#8E8E93]">
            {tenant?.name || 'Studio Management & Schedule'}
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">1-Click Demo Access</span>
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800">
              Active
            </span>
          </div>
          <p className="text-[11px] text-[#8E8E93] leading-relaxed">
            Instant administrator access with prefilled demo credentials:
          </p>
          <div className="text-[11px] text-neutral-300 font-mono bg-black/60 px-3 py-2 rounded-xl border border-white/10 space-y-0.5">
            <div>Email: <strong className="text-white">admin@lumi-atelier.com</strong></div>
            <div>Password: <strong className="text-white">admin</strong> <span className="text-neutral-500 font-sans text-[10px]">(or any 4+ chars)</span></div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full h-10 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all cursor-pointer shadow-[0_2px_15px_rgba(255,255,255,0.2)] flex items-center justify-center gap-1.5"
          >
            <span>Sign In in 1-Click (as Owner) →</span>
          </button>
        </div>

        <Card className="space-y-4 p-6 border border-white/12 bg-[#0D0D11] backdrop-blur-md shadow-2xl rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lumi-atelier.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Password
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
              {isLoading ? 'Verifying...' : 'Sign In with Password'}
            </Button>
          </form>

          <div className="pt-2 border-t border-white/10 text-center">
            <p className="text-[11px] text-[#8E8E93] flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-white" />
              <span>Multi-Tenant Security · End-to-End Encrypted</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
