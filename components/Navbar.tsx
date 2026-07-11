'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Menu, X, Play, Film, Calendar, List, Home, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from './maounime_logo.jpg';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll to add backdrop-blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Ongoing', href: '/ongoing', icon: Flame },
    { name: 'Complete', href: '/complete', icon: Film },
    { name: 'Jadwal', href: '/jadwal', icon: Calendar },
    { name: 'Genre', href: '/genres', icon: List },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/50 py-3 shadow-lg'
            : 'bg-gradient-to-b from-neutral-950/80 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden relative flex items-center justify-center border border-neutral-800 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={logoImg}
                  alt="Maounime Logo"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  priority
                />
              </div>
              <span className="text-xl font-bold tracking-wider text-white hidden min-[380px]:inline-block">
                MAOU<span className="text-amber-500">NIME</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-amber-500 text-neutral-950 font-semibold shadow-lg shadow-amber-500/10'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center max-w-xs w-full">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Cari anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 pl-10 pr-4 py-2 rounded-2xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-300 placeholder-neutral-500"
                />
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* Mobile Actions (Search Bar + Sidebar Menu Button) */}
            <div className="flex items-center gap-2 md:hidden flex-1 justify-end">
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[140px] sm:max-w-[220px]">
                <input
                  type="text"
                  placeholder="Cari anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-300 placeholder-neutral-500"
                />
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </form>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:text-amber-500 transition-colors shrink-0"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col gap-6 md:hidden"
            >
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative flex items-center justify-center border border-neutral-800">
                    <Image
                      src={logoImg}
                      alt="Maounime Logo"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-lg font-bold tracking-wider text-white">MAOUNIME</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search inside sidebar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Cari anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-neutral-500"
                />
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>

              {/* Nav links */}
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-amber-500 text-neutral-950 font-semibold'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Decorative credit mimicking Kuzen style */}
              <div className="mt-auto pt-6 border-t border-neutral-900 text-center text-xs text-neutral-600">
                <p>Nonton Anime Subtitle Indonesia</p>
                <p className="mt-1">Maounime Clone</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-900/80 px-6 py-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { name: 'Home', href: '/', icon: Home },
            { name: 'Ongoing', href: '/ongoing', icon: Flame },
            { name: 'Complete', href: '/complete', icon: Film },
          ].map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-300 relative ${
                  isActive ? 'text-amber-500 font-medium' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-amber-500' : ''}`} />
                <span className="text-[10px] tracking-wide font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeBottomTabIndicator"
                    className="absolute -bottom-1 w-5 h-0.5 bg-amber-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
