import { OtakudesuScraper } from '@/lib/scraper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Download, ShieldAlert, ArrowLeft, Archive, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 300; // Cache details for 5 minutes

interface BatchPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BatchPage({ params }: BatchPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const scraper = new OtakudesuScraper();

  let batchData: any = null;
  let errorMsg = '';

  try {
    const res = await scraper.batch(slug);
    batchData = res?.data || null;
  } catch (err: any) {
    console.error('Error loading batch data:', err);
    errorMsg = 'Gagal memuat data batch. Tautan mungkin kadaluarsa atau tidak valid.';
  }

  if (errorMsg || !batchData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
          <div className="text-center p-10 border border-neutral-850 rounded-3xl bg-neutral-900/10 max-w-md w-full">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-neutral-300 font-semibold">{errorMsg || 'Batch download tidak ditemukan.'}</p>
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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        
        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Title Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/20 border border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-amber-500 font-bold tracking-wider uppercase">
              <Archive className="w-4 h-4" />
              <span>Satu Paket (Batch Download)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
              {batchData.title}
            </h1>
          </div>
        </div>

        {/* Downloads Accordion Area */}
        {batchData.downloads && batchData.downloads.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-500" />
              Tautan Unduhan Batch (Download Links)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batchData.downloads.map((group: any, groupIdx: number) => (
                <div
                  key={`${group.group}-${groupIdx}`}
                  className="p-5 rounded-3xl bg-neutral-900/10 border border-neutral-900/60 flex flex-col gap-4 shadow-md"
                >
                  <h3 className="text-sm font-bold text-neutral-300 border-b border-neutral-900 pb-2 flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-amber-500 rounded-full inline-block" />
                    {group.group}
                  </h3>

                  <div className="space-y-3">
                    {group.items.map((item: any, itemIdx: number) => (
                      <div
                        key={itemIdx}
                        className="flex flex-col gap-2.5 p-3 rounded-2xl bg-neutral-900/30 border border-neutral-850"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-amber-500 uppercase tracking-wider">
                            Resolusi: {item.resolution || 'MP4'}
                          </span>
                          {item.size && <span className="text-neutral-500 font-medium">Ukuran: {item.size}</span>}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {item.links.map((link: any, linkIdx: number) => (
                            <a
                              key={linkIdx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-amber-500 hover:text-neutral-950 hover:font-bold border border-neutral-800 text-[11px] text-neutral-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{link.host}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-40 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-10 border border-neutral-900 bg-neutral-900/10 rounded-3xl text-center space-y-2">
            <Archive className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-neutral-400 font-semibold text-sm">Tidak ada tautan unduhan batch yang ditemukan.</p>
            <p className="text-neutral-600 text-xs">Tautan mungkin belum dimasukkan oleh kontributor anime.</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
