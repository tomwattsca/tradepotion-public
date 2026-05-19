'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, TrendingUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Markets', location: 'markets', match: (path: string) => path === '/' },
    { href: '/category/decentralized-finance-defi', label: 'DeFi', location: 'defi', match: (path: string) => path === '/category/decentralized-finance-defi' },
    { href: '/category/layer-2', label: 'Layer 2', location: 'layer_2', match: (path: string) => path === '/category/layer-2' },
    { href: '/category/meme-token', label: 'Meme', location: 'meme', match: (path: string) => path === '/category/meme-token' },
    { href: '/top/gainers', label: 'Gainers', location: 'gainers', tone: 'text-emerald-300', match: (path: string) => path === '/top/gainers' },
    { href: '/top/losers', label: 'Losers', location: 'losers', tone: 'text-red-300', match: (path: string) => path === '/top/losers' },
    { href: '/top/trending', label: 'Trending', location: 'trending', tone: 'text-orange-300', match: (path: string) => path === '/top/trending' },
    { href: '/top/vol-spikes', label: 'Vol Spikes', location: 'vol_spikes', tone: 'text-yellow-300', match: (path: string) => path === '/top/vol-spikes' },
    { href: '/watchlist', label: 'Watchlist', location: 'watchlist', tone: 'text-amber-300', match: (path: string) => path === '/watchlist' },
  ];

  const navLinkClass = (active: boolean, tone?: string) => [
    'rounded-full px-3 py-1.5 transition-colors',
    active
      ? 'border border-violet-400/40 bg-violet-500/15 text-white shadow-sm shadow-violet-950/40'
      : `${tone ?? 'text-zinc-400'} hover:bg-zinc-900 hover:text-white`,
  ].join(' ');

  const mobileNavLinkClass = (active: boolean, tone?: string) => [
    'rounded-lg px-3 py-2 transition-colors',
    active
      ? 'border border-violet-400/40 bg-violet-500/15 text-white'
      : `${tone ?? 'text-zinc-400'} hover:bg-zinc-900 hover:text-white`,
  ].join(' ');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" data-event="internal_link_click" data-cta-location="global_nav_logo" className="flex items-center gap-2 shrink-0">
          <TrendingUp className="h-5 w-5 text-violet-400" />
          <span className="text-sm font-bold tracking-tight text-white">Trade Potion</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 text-sm" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const active = link.match(pathname || '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                data-event="internal_link_click"
                data-cta-location={`global_nav_${link.location}`}
                aria-current={active ? 'page' : undefined}
                className={navLinkClass(active, link.tone)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="ml-auto flex items-center gap-2 w-full max-w-xs">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search coins…"
              aria-label="Search coins"
              className="w-full rounded-lg bg-zinc-900 pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            data-event="internal_link_click"
            data-cta-location="global_search_submit"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-violet-500 hover:text-white"
            aria-label="Search markets"
          >
            Search
          </button>
        </form>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-zinc-800 px-4 py-3 flex flex-col gap-2 text-sm" aria-label="Mobile navigation">
          {navLinks.map((link) => {
            const active = link.match(pathname || '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                data-event="internal_link_click"
                data-cta-location={`mobile_nav_${link.location}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                className={mobileNavLinkClass(active, link.tone)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
