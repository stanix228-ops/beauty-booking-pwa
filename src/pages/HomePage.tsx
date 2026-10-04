import { TENANTS_REGISTRY } from '../data/tenants';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Phone } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export function HomePage() {
  const tenants = Object.values(TENANTS_REGISTRY);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 sm:p-8 safe-top safe-bottom">
      <div className="max-w-2xl mx-auto w-full space-y-8 pt-4">
        {/* Hero title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Tenant PWA Online Booking</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-neutral-100 tracking-tight">
            Haute Nail Ateliers & Salons
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
            Unified luxury platform with independent branded spaces. Each studio operates under its own route, custom branding, artists, and live schedule.
          </p>
        </div>

        {/* Studio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((t) => (
            <Card
              key={t.slug}
              className="p-5 flex flex-col justify-between relative overflow-hidden group hover:border-neutral-700 transition-all border border-neutral-800/90"
              style={{
                borderColor: t.theme.accentColor + '40',
              }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-neutral-950 shadow-md flex-shrink-0"
                      style={{ backgroundColor: t.theme.accentColor }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <h2 className="text-base font-bold font-heading text-neutral-100">
                        {t.name}
                      </h2>
                      <div className="text-xs text-neutral-400 font-mono">
                        /s/{t.slug}/
                      </div>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px]">
                    {t.city}
                  </Badge>
                </div>

                {t.tagline && (
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {t.tagline}
                  </p>
                )}

                <div className="space-y-1 text-xs text-neutral-400 pt-2 border-t border-neutral-800/60">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{t.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{t.phone}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center gap-2 text-[11px] text-neutral-400">
                  <span className="font-semibold text-neutral-200">{t.services.length} services</span>
                  <span>•</span>
                  <span className="font-semibold text-neutral-200">{t.masters.length} artists</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-4 border-t border-neutral-800/80 flex items-center gap-2">
                <Link
                  to={`/s/${t.slug}/`}
                  style={{
                    backgroundColor: t.theme.accentColor,
                    color: '#0D0D11',
                  }}
                  className="flex-1 h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 transition-all cursor-pointer"
                >
                  <span>Book Appointment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to={`/s/${t.slug}/owner/`}
                  className="h-10 px-3.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Owner Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Owner</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pt-8 text-xs text-neutral-400">
        Multi-Tenant Architecture • PostgreSQL EXCLUDE Constraints • React 19 • Astryx • Cloudflare Pages
      </footer>
    </div>
  );
}
