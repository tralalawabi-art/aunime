import { OtakudesuScraper } from '@/lib/scraper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScheduleClient from './ScheduleClient';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 300; // Cache for 5 minutes

export default async function JadwalPage() {
  const scraper = new OtakudesuScraper();

  let schedule: Record<string, any[]> = {};
  let errorMsg = '';

  try {
    const res = await scraper.jadwalRilis();
    schedule = res?.data?.schedule || {};
  } catch (err: any) {
    console.error('Error loading schedule data:', err);
    errorMsg = 'Gagal memuat jadwal rilis anime. Silakan coba lagi.';
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        {/* Header Breadcrumbs & Title */}
        <div className="flex flex-col gap-2 border-b border-neutral-900 pb-5">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-neutral-400">Jadwal Rilis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7 text-amber-500" />
            Jadwal Rilis Mingguan
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
            Pantau jadwal tayang anime kesayangan Anda setiap harinya. Jam rilis sewaktu-waktu dapat bergeser tergantung dari perilisan sub asli di Jepang.
          </p>
        </div>

        {errorMsg ? (
          <div className="text-center py-20 border border-neutral-800 rounded-3xl bg-neutral-900/10">
            <p className="text-neutral-400 font-medium">{errorMsg}</p>
          </div>
        ) : (
          <ScheduleClient schedule={schedule} />
        )}
      </main>

      <Footer />
    </div>
  );
}
