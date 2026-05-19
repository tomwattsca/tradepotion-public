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
      className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 ${watched ? 'text-amber-400' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}
      title={watched ? `Remove ${coinName} from watchlist` : `Add ${coinName} to watchlist`}
      aria-label={watched ? `Remove ${coinName} from watchlist` : `Add ${coinName} to watchlist`}
    >
      <Star className={`h-4 w-4 ${watched ? 'fill-amber-400' : ''}`} />
    </button>
  );
}
