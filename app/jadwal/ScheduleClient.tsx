'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleItem {
  title: string;
  url: string;
  slug?: string;
}

interface ScheduleClientProps {
  schedule: Record<string, ScheduleItem[]>;
}

export default function ScheduleClient({ schedule }: ScheduleClientProps) {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Random'];
  
  // Find a default day with items, or default to first day in schedule
  const availableDays = Object.keys(schedule);
  const initialDay = days.find(d => availableDays.includes(d)) || availableDays[0] || 'Senin';
  
  const [activeDay, setActiveDay] = useState(initialDay);

  const activeItems = schedule[activeDay] || [];

  return (
    <div className="space-y-8">
      {/* Day Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 overflow-x-auto scrollbar-none border-b border-neutral-900">
        {days.map((day) => {
          const hasItems = !!schedule[day]?.length;
          if (!hasItems && day !== 'Random') return null; // Only show days that actually have anime
          
          const isActive = activeDay === day;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap active:scale-95 flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-500 border-amber-500 text-neutral-950 shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{day}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                isActive ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-950 text-neutral-500'
              }`}>
                {schedule[day]?.length || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Items List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {activeItems.length > 0 ? (
            activeItems.map((item, idx) => (
              <Link
                key={`${item.slug}-${idx}`}
                href={`/anime/${item.slug}`}
                className="group relative flex items-center justify-between p-5 rounded-2xl bg-neutral-900/30 border border-neutral-850 hover:border-amber-500/30 hover:bg-neutral-900/60 transition-all duration-300 shadow-md shadow-black/5"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/5 group-hover:bg-amber-500/10 flex items-center justify-center border border-amber-500/10 group-hover:border-amber-500/25 shrink-0 transition-all duration-300">
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-neutral-100 group-hover:text-amber-500 transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Rilis setiap hari {activeDay} di Maounime
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300 shrink-0 ml-4">
                  <span className="text-xs font-semibold hidden sm:inline">Detail</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-16 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
              <p className="text-neutral-500 text-sm">Tidak ada jadwal rilis untuk hari {activeDay}.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
