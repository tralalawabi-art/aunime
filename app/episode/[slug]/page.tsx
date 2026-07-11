import { OtakudesuScraper } from '@/lib/scraper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EpisodeClient from './EpisodeClient';
import { Film, ShieldAlert, ArrowLeft } from 'lucide-react';
import { getAnimeSlug } from '@/lib/utils';
import Link from 'next/link';

export const revalidate = 300; // Cache details for 5 minutes

interface EpisodePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const scraper = new OtakudesuScraper();

  let episodeData: any = null;
  let errorMsg = '';

  try {
    const res = await scraper.episode(slug);
    episodeData = res?.data || null;
  } catch (err: any) {
    console.error('Error loading episode details:', err);
    errorMsg = 'Gagal memuat detail episode. Silakan coba beberapa saat lagi.';
  }

  if (errorMsg || !episodeData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
          <div className="text-center p-10 border border-neutral-850 rounded-3xl bg-neutral-900/10 max-w-md w-full">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-neutral-300 font-semibold">{errorMsg || 'Episode tidak ditemukan.'}</p>
            <Link
              href="/"
              className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Create clean back to details link with robust fallback
  const mainAnimeSlug = episodeData.nav?.all || getAnimeSlug(slug);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Breadcrumbs & Title */}
        <div className="flex flex-col gap-3 border-b border-neutral-900 pb-5">
          <div className="text-xs text-neutral-500 flex flex-wrap items-center gap-1.5">
            <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
            <span>/</span>
            {mainAnimeSlug && (
              <>
                <Link href={`/anime/${mainAnimeSlug}`} className="hover:text-amber-500 transition-colors capitalize">
                  {mainAnimeSlug.replace(/-/g, ' ')}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-neutral-450 truncate max-w-[200px]">{episodeData.title}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight max-w-3xl flex items-center gap-2">
              <Film className="w-6 h-6 text-amber-500 shrink-0" />
              {episodeData.title}
            </h1>

            {mainAnimeSlug && (
              <Link
                href={`/anime/${mainAnimeSlug}`}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-amber-500 transition-colors shrink-0 bg-neutral-900/50 border border-neutral-850 px-3.5 py-1.5 rounded-xl hover:border-amber-500/20"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Info Anime</span>
              </Link>
            )}
          </div>
        </div>

        {/* Client-Side Interactive Streaming/Downloads */}
        <EpisodeClient
          title={episodeData.title}
          streams={episodeData.streams || {}}
          streamOptions={episodeData.streamOptions || []}
          downloads={episodeData.downloads || []}
          nav={{
            prev: episodeData.nav?.prev || null,
            all: episodeData.nav?.all || mainAnimeSlug || null,
            next: episodeData.nav?.next || null,
          }}
          otherEpisodes={episodeData.otherEpisodes || []}
        />
      </main>

      <Footer />
    </div>
  );
}
