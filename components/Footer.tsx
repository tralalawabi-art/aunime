import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import logoImg from './maounime_logo.jpg';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 pt-16 pb-8 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden relative flex items-center justify-center border border-neutral-800">
                <Image
                  src={logoImg}
                  alt="Maounime Logo"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-lg font-bold tracking-wider text-white">
                MAOU<span className="text-amber-500">NIME</span>
              </span>
            </Link>
            <p className="text-sm max-w-sm leading-relaxed text-neutral-500">
              Maounime adalah platform streaming anime subtitle Indonesia gratis yang menyajikan update episode anime ongoing terbaru maupun anime complete terpopuler dengan tampilan modern dan tanpa iklan pop-up yang mengganggu.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Menu Utama</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/ongoing" className="hover:text-amber-500 transition-colors">Ongoing Anime</Link>
              </li>
              <li>
                <Link href="/complete" className="hover:text-amber-500 transition-colors">Completed Anime</Link>
              </li>
              <li>
                <Link href="/jadwal" className="hover:text-amber-500 transition-colors">Jadwal Rilis</Link>
              </li>
              <li>
                <Link href="/genres" className="hover:text-amber-500 transition-colors">Genre List</Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">Disclaimer</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Maounime tidak menyimpan file video apa pun di server kami. Semua video yang ditampilkan di web ini bersumber dari pihak ketiga yang tersebar di internet. Kami hanya membagikan tautan/link tersebut untuk memudahkan para penggemar anime.
            </p>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p>© {currentYear} Maounime. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by tralalawabi
          </p>
        </div>
      </div>
    </footer>
  );
}
