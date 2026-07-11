import { OtakudesuScraper } from '@/lib/scraper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { List, Tag } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 86400; // Cache genres list for 1 day

export default async function GenresPage() {
  const scraper = new OtakudesuScraper();

  let genres: any[] = [];
  let errorMsg = '';

  try {
    const res = await scraper.genreList();
    genres = res?.data?.genres || [];
  } catch (err: any) {
    console.error('Error loading genres data:', err);
    errorMsg = 'Gagal memuat daftar genre. Silakan coba lagi.';
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
            <span className="text-neutral-400">Genres</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <List className="w-7 h-7 text-amber-500" />
            Daftar Genre Anime
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
            Telusuri pustaka anime berdasarkan kategori genre kesukaan Anda. Dari pertarungan seru Shounen hingga romansa manis Slice of Life.
          </p>
        </div>

        {errorMsg ? (
          <div className="text-center py-20 border border-neutral-800 rounded-3xl bg-neutral-900/10">
            <p className="text-neutral-400 font-medium">{errorMsg}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {genres.map((genre, idx) => (
              <Link
                key={genre.slug}
                href={`/genre/${genre.slug}`}
                className="group relative flex items-center gap-3 p-4 rounded-2xl bg-neutral-900/30 border border-neutral-850 hover:border-amber-500/30 hover:bg-neutral-900/60 transition-all duration-300 shadow-sm hover:shadow-amber-500/5 hover:-translate-y-0.5"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/5 group-hover:bg-amber-500/10 border border-amber-500/10 group-hover:border-amber-500/25 flex items-center justify-center shrink-0 transition-colors duration-300">
                  <Tag className="w-4 h-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-neutral-200 group-hover:text-amber-500 transition-colors truncate">
                    {genre.name}
                  </h3>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Explore anime</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
