import { OtakudesuScraper } from '@/lib/scraper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSlider from '@/components/HeroSlider';
import AnimeGrid from '@/components/AnimeGrid';
import { Flame, Film, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Disable layout caching for real-time scraped content updates
export const revalidate = 300; // Cache for 5 minutes

export default async function HomePage() {
  const scraper = new OtakudesuScraper();
  
  let latestEpisodes: any[] = [];
  let ongoingAnime: any[] = [];
  let completeAnime: any[] = [];
  let errorMsg = '';

  try {
    // Fetch home data (latest ongoing episodes), ongoing list, and completed list
    const [homeRes, ongoingRes, completeRes] = await Promise.all([
      scraper.home().catch(() => ({ data: { items: [] } })),
      scraper.ongoing(1).catch(() => ({ data: { items: [] } })),
      scraper.complete(1).catch(() => ({ data: { items: [] } }))
    ]);

    latestEpisodes = homeRes?.data?.items || [];
    ongoingAnime = ongoingRes?.data?.items || [];
    completeAnime = completeRes?.data?.items || [];
  } catch (err: any) {
    console.error('Error loading home data:', err);
    errorMsg = 'Gagal memuat konten dari server. Silakan coba beberapa saat lagi.';
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        {errorMsg ? (
          <div className="text-center py-20 border border-neutral-800 rounded-3xl bg-neutral-900/10">
            <p className="text-neutral-400 font-medium">{errorMsg}</p>
          </div>
        ) : (
          <>
            {/* Hero Slider Area */}
            {ongoingAnime.length > 0 && (
              <section className="w-full">
                <HeroSlider items={ongoingAnime} />
              </section>
            )}

            {/* Latest Episodes Section (Filtered Ongoing from Scraper) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Rilis Terbaru
                </h2>
                <Link
                  href="/ongoing"
                  className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10 hover:border-amber-500/30"
                >
                  Lihat Semua
                </Link>
              </div>
              <AnimeGrid items={latestEpisodes} />
            </section>

            {/* Two Column Section for Lists */}
            <div className="grid grid-cols-1 gap-12">
              {/* Ongoing Anime List */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                    <Flame className="w-5 h-5 text-emerald-500" />
                    Anime Ongoing (Sedang Tayang)
                  </h2>
                  <Link
                    href="/ongoing"
                    className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10 hover:border-amber-500/30"
                  >
                    Selengkapnya
                  </Link>
                </div>
                <AnimeGrid items={ongoingAnime} limit={12} />
              </section>

              {/* Complete Anime List */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                    <Film className="w-5 h-5 text-blue-500" />
                    Anime Complete (Tamat)
                  </h2>
                  <Link
                    href="/complete"
                    className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10 hover:border-amber-500/30"
                  >
                    Selengkapnya
                  </Link>
                </div>
                <AnimeGrid items={completeAnime} limit={12} />
              </section>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
