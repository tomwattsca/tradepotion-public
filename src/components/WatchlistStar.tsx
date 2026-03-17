'use client';

import { useWatchlist } from '@/hooks/useWatchlist';
import { Star } from 'lucide-react';

interface Props {
  coinId: string;
  coinName: string;
}

export default function WatchlistStar({ coinId, coinName }: Props) {
  const { toggle, isWatched, hydrated } = useWatchlist();
  const watched = isWatched(coinId);

  if (!hydrated) return <span className="w-4 h-4" />;

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(coinId); }}
      className={`transition-colors ${watched ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
      title={watched ? `Remove ${coinName} from watchlist` : `Add ${coinName} to watchlist`}
      aria-label={watched ? `Remove ${coinName} from watchlist` : `Add ${coinName} to watchlist`}
    >
      <Star className={`h-3.5 w-3.5 ${watched ? 'fill-amber-400' : ''}`} />
    </button>
  );
}
