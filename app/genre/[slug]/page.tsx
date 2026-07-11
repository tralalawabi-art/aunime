import { OtakudesuScraper } from '@/lib/scraper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeGrid from '@/components/AnimeGrid';
import { Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 300; // Cache for 5 minutes

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const page = parseInt(resolvedSearchParams.page || '1');
  const scraper = new OtakudesuScraper();

  let items: any[] = [];
  let pagination: any = { current: 1, hasNext: false, total: null };
  let errorMsg = '';

  // Format genre slug to readable text
  const genreTitle = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  try {
    const res = await scraper.genre(slug, page);
    items = res?.data?.items || [];
    pagination = res?.data?.pagination || { current: page, hasNext: false, total: null };
  } catch (err: any) {
    console.error('Error loading genre data:', err);
    errorMsg = `Gagal memuat daftar anime untuk genre ${genreTitle}. Silakan coba lagi.`;
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
            <Link href="/genres" className="hover:text-amber-500 transition-colors">Genres</Link>
            <span>/</span>
            <span className="text-neutral-400 capitalize">{slug}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Tag className="w-7 h-7 text-amber-500" />
            Genre: {genreTitle}
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
            Menampilkan koleksi serial anime bergenre <span className="text-amber-500 font-semibold">{genreTitle}</span>, lengkap dengan rating, jumlah episode, dan subtitle Indonesia.
          </p>
        </div>

        {errorMsg ? (
          <div className="text-center py-20 border border-neutral-800 rounded-3xl bg-neutral-900/10">
            <p className="text-neutral-400 font-medium">{errorMsg}</p>
          </div>
        ) : (
          <>
            {/* Anime Grid */}
            <AnimeGrid items={items} />

            {/* Pagination Controls */}
            {items.length > 0 && (
              <div className="flex items-center justify-center gap-4 pt-10 border-t border-neutral-900">
                {page > 1 ? (
                  <Link
                    href={`/genre/${slug}?page=${page - 1}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm font-semibold text-neutral-300 hover:text-white hover:border-amber-500/50 hover:bg-neutral-900/80 active:scale-95 transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900/20 border border-neutral-900 text-sm font-semibold text-neutral-600 cursor-not-allowed select-none">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </div>
                )}

                <span className="text-sm font-medium text-neutral-400">
                  Halaman <span className="text-white font-semibold">{pagination.current}</span>
                  {pagination.total && (
                    <>
                      {' '}
                      dari <span className="text-neutral-500 font-semibold">{pagination.total}</span>
                    </>
                  )}
                </span>

                {pagination.hasNext ? (
                  <Link
                    href={`/genre/${slug}?page=${page + 1}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-sm font-semibold text-neutral-300 hover:text-white hover:border-amber-500/50 hover:bg-neutral-900/80 active:scale-95 transition-all duration-200"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900/20 border border-neutral-900 text-sm font-semibold text-neutral-600 cursor-not-allowed select-none">
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
