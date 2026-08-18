import { NavLink, Outlet } from 'react-router-dom';
import { Home, FolderOpen, Wallet, UserRound } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/cn';
import { BottomNav, type BottomNavItem } from '../components/shared/BottomNav';

const NAV: readonly BottomNavItem[] = [
  { to: '/jamaah/dashboard', label: 'Dashboard', icon: Home },
  { to: '/jamaah/dokumen', label: 'Dokumen', icon: FolderOpen },
  { to: '/jamaah/pembayaran', label: 'Pembayaran', icon: Wallet },
  { to: '/jamaah/profil', label: 'Profil', icon: UserRound },
];

export function JamaahLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-surface-muted bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-heading text-base font-bold text-primary">HajiUmroh</span>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-muted hover:text-ink',
                    isActive && 'bg-primary/10 font-semibold text-primary',
                  )
                }
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden text-ink-muted sm:inline">{user?.name}</span>
            <button type="button" onClick={logout} className="cursor-pointer text-danger">
              Keluar
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6">
        <Outlet />
      </main>
      <BottomNav items={NAV} className="md:hidden" />
    </div>
  );
}