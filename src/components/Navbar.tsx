'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

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
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <TrendingUp className="h-5 w-5 text-violet-400" />
          <span className="text-sm font-bold tracking-tight text-white">Trade Potion</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Markets</Link>
          <Link href="/category/defi" className="hover:text-white transition-colors">DeFi</Link>
          <Link href="/category/layer-2" className="hover:text-white transition-colors">Layer 2</Link>
          <Link href="/category/meme-token" className="hover:text-white transition-colors">Meme</Link>
          <Link href="/top/gainers" className="hover:text-white transition-colors text-emerald-400/80">Gainers</Link>
          <Link href="/top/losers" className="hover:text-white transition-colors text-red-400/80">Losers</Link>
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
              className="w-full rounded-lg bg-zinc-900 pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
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
        <div className="md:hidden border-t border-zinc-800 px-4 py-3 flex flex-col gap-3 text-sm text-zinc-400">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-white">Markets</Link>
          <Link href="/category/defi" onClick={() => setMenuOpen(false)} className="hover:text-white">DeFi</Link>
          <Link href="/category/layer-2" onClick={() => setMenuOpen(false)} className="hover:text-white">Layer 2</Link>
          <Link href="/category/meme-token" onClick={() => setMenuOpen(false)} className="hover:text-white">Meme</Link>
          <Link href="/top/gainers" onClick={() => setMenuOpen(false)} className="hover:text-white text-emerald-400/80">Gainers</Link>
          <Link href="/top/losers" onClick={() => setMenuOpen(false)} className="hover:text-white text-red-400/80">Losers</Link>
        </div>
      )}
    </nav>
  );
}
