import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  Wallet,
  FileText,
  BarChart3,
  Bell,
  UserCog,
  Menu,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import type { Role } from '../api/types';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/cn';
import { BottomNav, type BottomNavItem } from '../components/shared/BottomNav';

const BOTTOM_NAV: readonly BottomNavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/paket', label: 'Paket', icon: Package },
  { to: '/admin/jamaah', label: 'Jamaah', icon: Users },
  { to: '/admin/pembayaran', label: 'Pembayaran', icon: Wallet },
];

type NavItem = {
  readonly to: string;
  readonly label: string;
  readonly icon: typeof LayoutDashboard;
  readonly roles?: readonly Role[];
};

const NAV: readonly NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/paket', label: 'Paket', icon: Package },
  { to: '/admin/jamaah', label: 'Jamaah', icon: Users },
  { to: '/admin/manifest', label: 'Manifest', icon: ClipboardList },
  { to: '/admin/pembayaran', label: 'Pembayaran', icon: Wallet },
  { to: '/admin/dokumen', label: 'Dokumen', icon: FileText },
  { to: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
  { to: '/admin/notifikasi', label: 'Notifikasi', icon: Bell },
  { to: '/admin/users', label: 'Users', icon: UserCog, roles: ['SUPER_ADMIN'] },
];

export function AdminLayout() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-60 bg-primary-dark text-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center px-5 font-heading text-lg font-bold">HajiUmroh</div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.filter((item) => !item.roles || (user !== null && item.roles.includes(user.role))).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-white/10',
                  isActive && 'bg-white/15 font-semibold',
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-4 text-xs">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-white/70">{user?.role}</p>
          <button type="button" onClick={logout} className="mt-2 flex cursor-pointer items-center gap-1 text-gold-cta">
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>
      </aside>
      {open ? (
        <button type="button" className="fixed inset-0 z-20 bg-black/40 lg:hidden" aria-label="Tutup menu" onClick={() => setOpen(false)} />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-surface-muted bg-surface px-4">
          <button type="button" className="cursor-pointer lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading text-sm font-semibold text-ink">Admin Travel</span>
        </header>
        <main className="flex-1 p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav items={BOTTOM_NAV} onMore={() => setOpen(true)} className="lg:hidden" />
    </div>
  );
}
