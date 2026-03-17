'use client';
import { useEffect, useState } from 'react';

interface Props {
  fetchedAt: number; // Unix ms timestamp from server
}

export default function FreshnessBar({ fetchedAt }: Props) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const tick = () => setSecondsAgo(Math.round((Date.now() - fetchedAt) / 1000));
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [fetchedAt]);

  const label =
    secondsAgo < 10 ? 'just now' :
    secondsAgo < 60 ? `${secondsAgo}s ago` :
    `${Math.floor(secondsAgo / 60)}m ago`;

  const isStale = secondsAgo > 300;

  return (
    <span className={`text-xs ${isStale ? 'text-amber-400' : 'text-zinc-500'}`}>
      {isStale ? '⚠ Data from ' : 'Updated '}{label}
    </span>
  );
}
