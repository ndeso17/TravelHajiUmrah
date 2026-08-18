import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SPY_OFFSET = 100;

export type NavTarget = {
  readonly to: string;
};

/**
 * Scroll-spy bersama untuk navigasi hash (#section) dan exact pathname.
 * - activeKey di-reset saat pathname berubah (hindari stale state antar halaman)
 * - saat scroll, section pertama yang melewati garis SPY_OFFSET menjadi aktif
 */
export function useScrollSpy(items: readonly NavTarget[]) {
  const { pathname } = useLocation();
  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    const hashItems = items.filter((item) => item.to.includes('#'));
    setActiveKey('');
    if (hashItems.length === 0) return;

    const handleScroll = () => {
      for (const item of hashItems) {
        const id = item.to.split('#')[1];
        if (!id) continue;
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= SPY_OFFSET && rect.bottom > 0) {
            setActiveKey(item.to);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [items, pathname]);

  return { activeKey, pathname };
}

export function isNavItemActive(
  item: NavTarget,
  activeKey: string,
  pathname: string,
): boolean {
  if (item.to.includes('#')) return activeKey === item.to;
  if (item.to === '/') return !activeKey.includes('#') && pathname === '/';
  return pathname === item.to;
}