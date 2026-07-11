'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Download, ChevronLeft, ChevronRight, List, Film, Share2, Star, MessageSquare, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DownloadItem {
  resolution: string | null;
  size: string | null;
  links: { host: string; url: string }[];
}

interface DownloadGroup {
  group: string;
  items: DownloadItem[];
}

interface StreamOption {
  key: string;
  quality: string;
  host: string;
  postId: number;
  i: number;
  q: string;
  nonce: string;
}

interface EpisodeClientProps {
  title: string;
  streams: Record<string, string>;
  streamOptions?: StreamOption[];
  downloads: DownloadGroup[];
  nav: {
    prev: string | null;
    all: string | null;
    next: string | null;
  };
  otherEpisodes?: { title: string; slug: string; releaseDate: string | null }[];
}

export default function EpisodeClient({
  title,
  streams,
  streamOptions = [],
  downloads,
  nav,
  otherEpisodes = [],
}: EpisodeClientProps) {
  // We keep a state of resolved stream URLs.
  const [resolvedStreams, setResolvedStreams] = useState<Record<string, string>>(streams || {});
  
  // Filter streamOptions just in case, and form unique play keys for mega, odstream, and ondesuhd
  const allowedHosts = ['mega', 'odstream', 'ondesuhd'];
  const filteredOptions = streamOptions.filter(opt => {
    const hostLower = opt.host.toLowerCase();
    return allowedHosts.some(allowed => hostLower.includes(allowed));
  });

  // All unique keys we can play: Default_Player (parsed instantly) + any from filteredOptions
  const allStreamKeys = Array.from(new Set([
    ...Object.keys(streams),
    ...filteredOptions.map(opt => opt.key)
  ]));

  // The active key is initially the Default Player (if available) or the first option
  const [activeKey, setActiveKey] = useState<string>(
    Object.keys(streams)[0] || (filteredOptions[0]?.key) || ''
  );

  // Loading state for mirrors being fetched on-demand
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});

  const activeStreamUrl = resolvedStreams[activeKey] || '';

  // Function to handle switching/fetching stream on demand
  const handleSelectKey = async (key: string) => {
    setActiveKey(key);

    // If the URL for this key is not resolved yet, fetch it!
    if (!resolvedStreams[key]) {
      const option = streamOptions.find(opt => opt.key === key);
      if (option) {
        setLoadingKeys(prev => ({ ...prev, [key]: true }));
        try {
          const res = await fetch(`/api/anime?action=stream&postId=${option.postId}&i=${option.i}&q=${option.q}&nonce=${option.nonce}`);
          const json = await res.json();
          if (json.url) {
            setResolvedStreams(prev => ({ ...prev, [key]: json.url }));
          }
        } catch (err) {
          console.error("Error fetching stream:", err);
        } finally {
          setLoadingKeys(prev => ({ ...prev, [key]: false }));
        }
      }
    }
  };

  // Copy current page URL share helper
  const [copiedShare, setCopiedShare] = useState(false);
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Video Player & Server Selection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Player */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-neutral-900 bg-neutral-950 shadow-2xl">
            {activeStreamUrl && !loadingKeys[activeKey] ? (
              <iframe
                src={activeStreamUrl}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                referrerPolicy="no-referrer"
                title={title}
              />
            ) : activeKey && loadingKeys[activeKey] ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                <p className="text-neutral-300 font-semibold text-sm">Menghubungkan ke server mirror...</p>
                <p className="text-neutral-500 text-[11px] mt-1">Mengambil tautan video aman, mohon tunggu sebentar</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Film className="w-16 h-16 text-neutral-800 mb-4 animate-pulse" />
                <p className="text-neutral-400 font-semibold text-base">Video stream tidak tersedia.</p>
                <p className="text-neutral-600 text-xs mt-2 max-w-sm">
                  Coba periksa tautan unduhan langsung di bagian bawah halaman untuk mengunduh episode ini.
                </p>
              </div>
            )}
          </div>

          {/* Episode Control Navigation Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900/30 border border-neutral-850">
            {/* Prev Button */}
            {nav.prev ? (
              <Link
                href={`/episode/${nav.prev}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white hover:border-amber-500/30 transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 text-amber-500" />
                <span>Episode Prev</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900/10 border border-neutral-900 text-xs sm:text-sm font-bold text-neutral-600 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
                <span>Episode Prev</span>
              </div>
            )}

            {/* See All / Details Page */}
            {nav.all ? (
              <Link
                href={`/anime/${nav.all}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/10 hover:scale-105 active:scale-95 transition-all"
              >
                <List className="w-4 h-4 shrink-0" />
                <span>Semua Episode</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white transition-all"
              >
                <List className="w-4 h-4 shrink-0" />
                <span>Beranda</span>
              </Link>
            )}

            {/* Next Button */}
            {nav.next ? (
              <Link
                href={`/episode/${nav.next}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm font-bold text-neutral-300 hover:text-white hover:border-amber-500/30 transition-all active:scale-95"
              >
                <span>Episode Next</span>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900/10 border border-neutral-900 text-xs sm:text-sm font-bold text-neutral-600 cursor-not-allowed">
                <span>Episode Next</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mirror Servers & Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mirror Server Selector widget */}
          <div className="p-5 rounded-3xl bg-neutral-900/20 border border-neutral-900 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block" />
              Pilih Server Mirror
            </h3>

            {allStreamKeys.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                {allStreamKeys.map((key) => {
                  const isActive = activeKey === key;
                  const isLoading = loadingKeys[key];
                  // Split 360p_StreamSB -> Quality and Host
                  const parts = key.split('_');
                  let quality = parts[0] || 'Unknown';
                  let host = parts.slice(1).join(' ') || 'Server';

                  if (key === 'Default_Player') {
                    host = 'Player Utama';
                    quality = 'HD';
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectKey(key)}
                      disabled={isLoading}
                      className={`w-full p-3 rounded-2xl text-left text-xs font-semibold transition-all duration-200 flex items-center justify-between border ${
                        isActive
                          ? 'bg-amber-500 border-amber-500 text-neutral-950 shadow-md font-bold'
                          : 'bg-neutral-900/40 border-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-900/80'
                      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        ) : (
                          <Play className={`w-3.5 h-3.5 ${isActive ? 'fill-neutral-950 text-neutral-950' : 'text-amber-500'}`} />
                        )}
                        <span className="capitalize">{host}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        isActive ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                      }`}>
                        {quality}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-neutral-500 text-xs">Mirror stream server tidak tersedia.</p>
            )}
          </div>

          {/* Quick Info & Share widget */}
          <div className="p-5 rounded-3xl bg-neutral-900/20 border border-neutral-900 space-y-4">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Bagikan Episode</h4>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-xs font-bold text-neutral-200 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-amber-500" />
                <span>{copiedShare ? 'Tersalin!' : 'Salin Tautan'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Download Links Accordion Section */}
      {downloads.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-500" />
            Tautan Unduhan (Download Links)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downloads.map((group, groupIdx) => (
              <div
                key={`${group.group}-${groupIdx}`}
                className="p-5 rounded-3xl bg-neutral-900/10 border border-neutral-900/60 flex flex-col gap-4 shadow-md"
              >
                <h3 className="text-sm font-bold text-neutral-300 border-b border-neutral-900 pb-2 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-amber-500 rounded-full inline-block" />
                  {group.group}
                </h3>

                <div className="space-y-3">
                  {group.items.map((item, itemIdx) => (
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
                        {item.links.map((link, linkIdx) => (
                          <a
                            key={linkIdx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-amber-500 hover:text-neutral-950 hover:font-bold border border-neutral-800 text-[11px] text-neutral-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{link.host}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other Episodes Section for Marathon */}
      {otherEpisodes.length > 1 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2 border-b border-neutral-900 pb-3">
            <Film className="w-5 h-5 text-amber-500" />
            Episode Lain dari Serial Ini
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
            {otherEpisodes.map((ep, idx) => {
              const isCurrent = ep.title.toLowerCase().trim() === title.toLowerCase().trim();
              
              return (
                <Link
                  key={`${ep.slug}-${idx}`}
                  href={isCurrent ? '#' : `/episode/${ep.slug}`}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between shadow-sm group ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 pointer-events-none'
                      : 'bg-neutral-900/20 border-neutral-850 hover:border-amber-500/20 hover:bg-neutral-900/50 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <h3 className={`text-xs sm:text-sm font-bold line-clamp-2 ${
                      isCurrent ? 'text-amber-500' : 'text-neutral-200 group-hover:text-amber-500 transition-colors'
                    }`}>
                      {ep.title}
                    </h3>
                    {ep.releaseDate && <p className="text-[10px] text-neutral-500 mt-1">{ep.releaseDate}</p>}
                  </div>
                  <Play className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-amber-500 fill-amber-500' : 'text-neutral-600 group-hover:text-amber-500 group-hover:scale-110 transition-all'}`} />
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
