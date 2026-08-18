import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export function FloatingCta() {
  return (
    <Link
      to="/daftar"
      aria-label="Konsultasi gratis"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-gold-cta px-6 shadow-lg shadow-gold-dark/30 transition-all duration-200 hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <MessageCircle className="h-5 w-5 text-[#361f12]" aria-hidden="true" />
      <span className="font-bold text-[#361f12]">Konsultasi Gratis</span>
    </Link>
  );
}
