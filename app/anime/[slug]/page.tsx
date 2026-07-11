import { OtakudesuScraper } from '@/lib/scraper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimeGrid, { AnimeItem } from '@/components/AnimeGrid';
import { Play, Star, Calendar, Tv, ShieldAlert, Award, Clock, ArrowRight, Heart, Download } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 300; // Cache details for 5 minutes

interface AnimeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const scraper = new OtakudesuScraper();

  let details: any = null;
  let errorMsg = '';

  try {
    const res = await scraper.detail(slug);
    details = res?.data || null;
  } catch (err: any) {
    console.error('Error loading anime details:', err);
    errorMsg = 'Gagal memuat detail anime. Silakan coba beberapa saat lagi.';
  }

  if (errorMsg || !details) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4">
          <div className="text-center p-10 border border-neutral-850 rounded-3xl bg-neutral-900/10 max-w-md w-full">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-neutral-300 font-semibold">{errorMsg || 'Anime tidak ditemukan.'}</p>
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

  // Map info keys to beautiful local Indonesian labels
  const infoLabels: Record<string, string> = {
    japanese: 'Judul Jepang',
    skor: 'Skor / Rating',
    status: 'Status',
    produser: 'Produser',
    tipe: 'Tipe',
    total_episode: 'Total Episode',
    durasi: 'Durasi',
    tanggal_rilis: 'Rilis Perdana',
    studio: 'Studio',
    genre: 'Genre',
  };

  // Convert recommendation formats to AnimeGrid compatible formats
  const recommendationsGrid: AnimeItem[] = (details.recommendations || []).map((rec: any) => ({
    title: rec.title,
    slug: rec.slug,
    type: 'anime',
    poster: rec.poster,
  }));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
      <Navbar />

      {/* Backdrop Ambient Cover Banner */}
      <div className="relative w-full h-[250px] sm:h-[350px] overflow-hidden select-none pointer-events-none">
        {details.poster && (
          <Image
            src={details.poster}
            alt="Anime Banner"
            fill
            className="object-cover scale-105 filter blur-2xl opacity-20"
            referrerPolicy="no-referrer"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
      </div>

      {/* Main Container */}
      <main className="flex-1 -mt-32 sm:-mt-48 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Poster & Meta Details */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 group">
              {details.poster ? (
                <Image
                  src={details.poster}
                  alt={details.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-12 h-12 text-neutral-800" />
                </div>
              )}
              {/* Glossy sheen */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 mix-blend-overlay" />
            </div>

            {/* Quick Stats Widget */}
            <div className="p-5 rounded-2xl bg-neutral-900/30 border border-neutral-850 space-y-4">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Informasi Detil</h3>
              <div className="space-y-3 text-xs">
                {Object.entries(details.info || {}).map(([key, val]) => {
                  if (!val || key === 'genre') return null; // Handle genre separately
                  const label = infoLabels[key] || key.replace('_', ' ');
                  return (
                    <div key={key} className="flex flex-col gap-1 border-b border-neutral-900 pb-2 last:border-none last:pb-0">
                      <span className="text-neutral-500 font-medium">{label}</span>
                      <span className="text-neutral-200 font-semibold">{val as string}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Main Info, Synopsis, Episode List */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-10">
            {/* Title Block */}
            <div className="space-y-4">
              {/* Breadcrumb */}
              <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-neutral-400 truncate max-w-[200px]">{details.title}</span>
              </div>

              {/* Title heading */}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {details.title}
              </h1>

              {/* Quick Info Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {details.info?.skor && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold rounded-lg">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span>{details.info.skor}</span>
                  </span>
                )}
                {details.info?.tipe && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 font-semibold rounded-lg">
                    <Tv className="w-3.5 h-3.5" />
                    <span>Tipe: {details.info.tipe}</span>
                  </span>
                )}
                {details.info?.status && (
                  <span className={`px-3 py-1 font-bold rounded-lg uppercase tracking-wider text-[10px] ${
                    details.info.status.toLowerCase().includes('ongoing')
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {details.info.status}
                  </span>
                )}
                {details.info?.studio && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 font-semibold rounded-lg">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Studio: {details.info.studio}</span>
                  </span>
                )}
              </div>

              {/* Genre Links */}
              {details.info?.genre && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {(details.info.genre as string).split(',').map((genreName) => {
                    const cleanName = genreName.trim();
                    const cleanSlug = cleanName.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <Link
                        key={cleanSlug}
                        href={`/genre/${cleanSlug}`}
                        className="px-3 py-1.5 rounded-xl bg-neutral-900/60 hover:bg-amber-500 hover:text-neutral-950 hover:font-semibold border border-neutral-850 hover:border-amber-500 text-xs text-neutral-400 hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        {cleanName}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Synopsis Area */}
            {details.sinopsis && (
              <section className="p-6 rounded-3xl bg-neutral-900/10 border border-neutral-900 space-y-3 leading-relaxed">
                <h2 className="text-lg font-bold text-white tracking-wide">Sinopsis</h2>
                <p className="text-neutral-400 font-normal text-sm sm:text-base whitespace-pre-line leading-relaxed">
                  {details.sinopsis}
                </p>
              </section>
            )}

            {/* Episode List Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <Play className="w-5 h-5 text-amber-500" />
                Daftar Episode
              </h2>

              <div className="bg-neutral-900/20 border border-neutral-900 rounded-3xl overflow-hidden shadow-xl max-h-[450px] overflow-y-auto scrollbar-thin">
                {details.episodes && details.episodes.length > 0 ? (
                  <div className="divide-y divide-neutral-900">
                    {details.episodes.map((ep: any, idx: number) => {
                      const isBatch = ep.type === 'batch';
                      const href = isBatch ? `/batch/${ep.slug}` : `/episode/${ep.slug}`;
                      return (
                        <Link
                          key={`${ep.slug}-${idx}`}
                          href={href}
                          className="group flex items-center justify-between p-4 sm:p-5 hover:bg-neutral-900/50 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/5 group-hover:bg-amber-500/10 flex items-center justify-center border border-amber-500/10 group-hover:border-amber-500/20 shrink-0 transition-all duration-300">
                              {isBatch ? (
                                <Download className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
                              ) : (
                                <Play className="w-5 h-5 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform duration-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm sm:text-base font-bold text-neutral-200 group-hover:text-amber-500 transition-colors line-clamp-2">
                                {ep.title}
                              </h3>
                              {ep.releaseDate && (
                                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                                  {ep.releaseDate}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-neutral-600 group-hover:text-amber-500 transition-colors shrink-0 ml-4">
                            <span className="text-xs font-semibold hidden sm:inline group-hover:mr-1 transition-all">
                              {isBatch ? 'Batch' : 'Tonton'}
                            </span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500 text-sm">
                    Belum ada episode yang tersedia.
                  </div>
                )}
              </div>
            </section>

            {/* Recommendations Section */}
            {recommendationsGrid.length > 0 && (
              <section className="space-y-4">
                <AnimeGrid items={recommendationsGrid} title="Rekomendasi Anime Serupa" limit={6} />
              </section>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
