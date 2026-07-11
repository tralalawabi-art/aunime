'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimeItem } from './AnimeGrid';
import { getAnimeSlug } from '@/lib/utils';

interface HeroSliderProps {
  items: AnimeItem[];
}

export default function HeroSlider({ items }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // We only show the first 5 ongoing anime in the slider
  const sliderItems = items.slice(0, 5);

  useEffect(() => {
    if (sliderItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sliderItems.length);
    }, 6000); // Rotate every 6s
    return () => clearInterval(interval);
  }, [sliderItems.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % sliderItems.length);
  };

  if (!sliderItems || sliderItems.length === 0) return null;

  const currentItem = sliderItems[activeIndex];
  const animeSlug = getAnimeSlug(currentItem.slug);
  const href = `/anime/${animeSlug}`;

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[550px] overflow-hidden rounded-3xl bg-neutral-950 border border-neutral-900 shadow-2xl">
      {/* Background Poster Blur Cover */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 select-none pointer-events-none"
        >
          {currentItem.poster && (
            <div className="relative w-full h-full scale-105 filter blur-[3px] sm:blur-md md:blur-3xl opacity-50 sm:opacity-40 md:opacity-25 transition-all">
              <Image
                src={currentItem.poster}
                alt="Backdrop Blur"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/40 to-transparent z-10 hidden sm:block" />

      {/* Slider Content */}
      <div className="absolute inset-0 z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex items-center h-full">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center w-full">
          {/* Text Information */}
          <div className="col-span-1 sm:col-span-7 flex flex-col items-start gap-4 text-left">
            {/* Status / Tag */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className="px-3 py-1 text-xs font-bold bg-amber-500 text-neutral-950 rounded-full shadow-lg shadow-amber-500/10 uppercase tracking-wider">
                Featured Ongoing
              </span>
              {currentItem.day && (
                <span className="flex items-center gap-1 text-xs text-neutral-400 bg-neutral-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-800">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  Rilis {currentItem.day}
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              key={`title-${activeIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight line-clamp-2"
              title={currentItem.title}
            >
              {currentItem.title}
            </motion.h1>

            {/* Meta Items */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-4 text-sm text-neutral-400"
            >
              {currentItem.episode && (
                <span className="text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg text-xs">
                  {currentItem.episode}
                </span>
              )}
              {currentItem.rating && currentItem.rating !== 'N/A' && (
                <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {currentItem.rating}
                </span>
              )}
              {currentItem.date && <span className="text-neutral-500">{currentItem.date}</span>}
            </motion.div>

            {/* Descriptive / CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-2"
            >
              <Link
                href={href}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-neutral-950 font-bold hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all duration-300"
              >
                <Play className="w-5 h-5 fill-neutral-950 text-neutral-950" />
                <span>Tonton Sekarang</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Poster Showcase - Desktop & Tablet */}
          <div className="hidden sm:block sm:col-span-5 relative justify-self-center w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotate: 2 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                {currentItem.poster && (
                  <Image
                    src={currentItem.poster}
                    alt={currentItem.title}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                    priority
                  />
                )}
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 mix-blend-overlay" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slider Nav Controls */}
      {sliderItems.length > 1 && (
        <>
          {/* Arrow Left */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-neutral-900/60 border border-neutral-800/40 text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-amber-500/40 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Arrow Right */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-neutral-900/60 border border-neutral-800/40 text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-amber-500/40 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {sliderItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-300 rounded-full h-1.5 ${
                  idx === activeIndex ? 'bg-amber-500 w-6' : 'bg-neutral-700 hover:bg-neutral-500 w-1.5'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
