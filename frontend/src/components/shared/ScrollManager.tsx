import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const HEADER_OFFSET = 80; // sticky header ±69px + gap
const MAX_RETRIES = 10;

/**
 * Sinkronkan scroll dengan navigasi:
 * - ganti halaman (pathname) → scroll ke atas (instan)
 * - ada hash (#layanan) → scroll smooth ke section, dengan offset header
 *   (retry karena LandingPage render section setelah data landing dimuat)
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = hash.slice(1);
    let tries = 0;
    const attempt = () => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } else if (tries < MAX_RETRIES) {
        tries += 1;
        setTimeout(attempt, 150);
      }
    };
    attempt();
  }, [pathname, hash]);

  return null;
}