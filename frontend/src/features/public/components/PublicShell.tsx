import { Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home, Package, Sparkles, MessageSquareQuote, MapPin, Menu, X } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { BottomNav, type BottomNavItem } from '../../../components/shared/BottomNav';
import { useScrollSpy, isNavItemActive } from '../../../components/shared/useScrollSpy';

const brand = {
  name: 'Samira Travel',
  tagline: 'Umroh dulu bayar lunas nanti.',
};

const NAV: readonly BottomNavItem[] = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/daftar', label: 'Paket', icon: Package },
  { to: '/#layanan', label: 'Layanan', icon: Sparkles },
  { to: '/#testimoni', label: 'Testimoni', icon: MessageSquareQuote },
  { to: '/#lokasi', label: 'Lokasi', icon: MapPin },
];

export function PublicShell() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { activeKey } = useScrollSpy(NAV);

  const solid = pathname !== '/' || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header
        className={cn(
          'sticky top-0 z-40 h-[4.5rem] border-b transition-all duration-500',
          solid ? 'border-surface-muted bg-surface/95 backdrop-blur' : 'border-transparent bg-transparent',
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 -bottom-16 bg-gradient-to-b from-black/40 via-black/15 to-transparent transition-opacity duration-500',
            solid ? 'opacity-0' : 'opacity-100',
          )}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <span
              className={cn(
                'font-heading text-xl font-bold transition-colors duration-500',
                solid ? 'text-ink' : 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]',
              )}
            >
              {brand.name}
            </span>
            <span
              className={cn(
                'text-xs transition-colors duration-500',
                solid ? 'text-ink-muted' : 'text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]',
              )}
            >
              {brand.tagline}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={menuOpen}
            className={cn(
              'hidden cursor-pointer items-center justify-center rounded-md p-2 transition-colors md:inline-flex',
              solid ? 'text-ink hover:bg-surface-muted' : 'text-white hover:bg-white/10',
            )}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen ? (
          <nav
            aria-label="Navigasi utama"
            className="absolute inset-x-0 top-full hidden border-t border-surface-muted bg-surface shadow-md md:block"
          >
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <ul className="flex flex-col gap-1">
                {NAV.map((item) => {
                  const active = isNavItemActive(item, activeKey, pathname);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-muted',
                          active && 'bg-primary/10 font-semibold text-primary',
                        )}
                      >
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-surface-muted bg-surface-muted/60">
        <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="font-heading text-lg font-bold text-ink">{brand.name}</p>
              <p className="mt-1 text-sm text-ink-muted">
                Travel haji & umroh yang amanah dan terpercaya. Umroh dulu bayar lunas nanti.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Navigasi</p>
              <div className="mt-2 flex flex-col gap-1 text-sm text-ink-muted">
                <span>Beranda</span>
                <span>Paket</span>
                <span>Layanan</span>
                <span>Testimoni</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Kontak</p>
              <p className="mt-1 text-sm text-ink-muted">Email: info@samiratravel.id</p>
              <p className="mt-1 text-sm text-ink-muted">WhatsApp: +62 812-3456-7890</p>
              <p className="mt-1 text-sm text-ink-muted">Grinting, Bulakamba, Brebes, Jawa Tengah</p>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-ink-muted">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
        </div>
      </footer>

      <BottomNav items={NAV} className="md:hidden" />
    </div>
  );
}
