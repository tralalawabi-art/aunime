import { OtakudesuScraper } from '@/lib/scraper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeGrid from '@/components/AnimeGrid';
import { Search } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60; // Cache search results briefly for performance

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || '';
  const scraper = new OtakudesuScraper();

  let items: any[] = [];
  let errorMsg = '';

  try {
    if (q.trim()) {
      const res = await scraper.search(q);
      items = res?.data?.items || [];
    }
  } catch (err: any) {
    console.error('Error loading search data:', err);
    errorMsg = `Gagal melakukan pencarian untuk "${q}". Silakan coba lagi.`;
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
            <span className="text-neutral-400">Search</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Search className="w-7 h-7 text-amber-500" />
            Pencarian: &quot;<span className="text-amber-500">{q}</span>&quot;
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
            Menampilkan hasil pencarian anime dengan kata kunci &quot;<span className="text-neutral-300 font-semibold">{q}</span>&quot;. Ditemukan {items.length} judul anime.
          </p>
        </div>

        {errorMsg ? (
          <div className="text-center py-20 border border-neutral-800 rounded-3xl bg-neutral-900/10">
            <p className="text-neutral-400 font-medium">{errorMsg}</p>
          </div>
        ) : q.trim() === '' ? (
          <div className="text-center py-24 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
            <Search className="w-12 h-12 text-neutral-700 mx-auto mb-4 animate-pulse" />
            <p className="text-neutral-400 font-medium text-base">Silakan ketik kata kunci di kolom pencarian.</p>
            <p className="text-neutral-600 text-xs mt-2">Contoh: &quot;One Piece&quot;, &quot;Boruto&quot;, &quot;Jujutsu Kaisen&quot;</p>
          </div>
        ) : items.length > 0 ? (
          <AnimeGrid items={items} />
        ) : (
          <div className="text-center py-24 border border-neutral-850 rounded-2xl bg-neutral-900/20">
            <Search className="w-12 h-12 text-neutral-800 mx-auto mb-4" />
            <p className="text-neutral-400 font-medium text-base">Maaf, anime &quot;{q}&quot; tidak ditemukan.</p>
            <p className="text-neutral-500 text-xs mt-2 max-w-md mx-auto leading-relaxed">
              Pastikan ejaan judul sudah benar atau coba gunakan kata kunci yang lebih umum (misalnya: gunakan nama global, romaji, atau potongan kata).
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
