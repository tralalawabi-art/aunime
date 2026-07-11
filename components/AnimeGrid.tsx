'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Play, Calendar, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { getAnimeSlug } from '@/lib/utils';

export interface AnimeItem {
  title: string;
  url?: string;
  slug?: string;
  type?: 'anime' | 'episode' | string;
  poster: string | null;
  episode?: string | null;
  day?: string | null;
  date?: string | null;
  studio?: string | null;
  episodes?: string | null;
  rating?: string | null;
  genres?: string[];
  status?: string | null;
}

interface AnimeGridProps {
  items: AnimeItem[];
  title?: string;
  limit?: number;
}

export default function AnimeGrid({ items, title, limit }: AnimeGridProps) {
  const displayItems = limit ? items.slice(0, limit) : items;

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="text-center py-12 border border-neutral-800 rounded-2xl bg-neutral-900/20">
        <p className="text-neutral-500 text-sm">Tidak ada anime yang ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block" />
            {title}
          </h2>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {displayItems.map((item, idx) => {
          // Resolve the parent anime details slug from the item slug
          const animeSlug = getAnimeSlug(item.slug);
          const href = `/anime/${animeSlug}`;

          return (
            <motion.div
              key={`${item.slug}-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
              className="group relative flex flex-col bg-neutral-900/30 border border-neutral-800/50 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 shadow-md shadow-black/10"
            >
              {/* Image Container */}
              <Link href={href} className="relative aspect-[3/4] w-full overflow-hidden block bg-neutral-950">
                {item.poster ? (
                  <Image
                    src={item.poster}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-500"
                    referrerPolicy="no-referrer"
                    priority={idx < 6}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
                    <Play className="w-10 h-10 text-neutral-800" />
                  </div>
                )}

                {/* Cover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Rating Badge */}
                {item.rating && item.rating !== 'N/A' && (
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-neutral-950/80 backdrop-blur-md rounded-lg text-amber-500 shadow-sm border border-neutral-800/40">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{item.rating}</span>
                  </div>
                )}

                {/* Episode Badge */}
                {item.episode && (
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 text-[11px] font-extrabold bg-amber-500 text-neutral-950 rounded-lg shadow-md uppercase tracking-wider">
                    {item.episode.includes('Episode') ? item.episode.replace('Episode', 'EP') : item.episode}
                  </div>
                )}

                {/* Type Badge */}
                {item.status && (
                  <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 text-[9px] font-bold uppercase rounded-lg border backdrop-blur-md shadow-sm ${
                    item.status.toLowerCase().includes('ongoing')
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {item.status}
                  </div>
                )}

                {/* Interactive Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-amber-500/30">
                    <Play className="w-6 h-6 fill-neutral-950 ml-0.5" />
                  </div>
                </div>
              </Link>

              {/* Info Area */}
              <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 bg-neutral-950/40">
                {/* Title */}
                <Link
                  href={href}
                  className="font-semibold text-sm text-neutral-100 hover:text-amber-500 transition-colors line-clamp-2 leading-snug"
                  title={item.title}
                >
                  {item.title}
                </Link>

                {/* Bottom Metadata */}
                <div className="mt-auto flex items-center justify-between text-[11px] text-neutral-500">
                  {item.day ? (
                    <span className="flex items-center gap-1 font-medium text-neutral-400">
                      <Calendar className="w-3 h-3 text-amber-500/80" />
                      {item.day}
                    </span>
                  ) : item.date ? (
                    <span className="truncate">{item.date}</span>
                  ) : item.studio ? (
                    <span className="truncate max-w-[80px]">{item.studio}</span>
                  ) : (
                    <span>Streaming</span>
                  )}

                  {item.episodes && (
                    <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded-md">
                      {item.episodes}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
