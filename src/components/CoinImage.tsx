'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  src: string;
  alt: string;
  name?: string;
  symbol?: string;
  width: number;
  height: number;
  className?: string;
}

// Deterministic colour from coin symbol
function symbolColor(symbol: string): string {
  const colors = [
    'bg-violet-600', 'bg-blue-600', 'bg-emerald-600', 'bg-orange-600',
    'bg-pink-600', 'bg-cyan-600', 'bg-yellow-600', 'bg-red-600',
    'bg-indigo-600', 'bg-teal-600',
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function CoinImage({ src, alt, name, symbol, width, height, className }: Props) {
  const [errored, setErrored] = useState(false);
  const initials = symbol?.slice(0, 2).toUpperCase() ?? name?.slice(0, 2).toUpperCase() ?? '??';
  const color = symbolColor(symbol ?? name ?? '');

  if (errored || !src) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full text-white font-bold shrink-0 ${color} ${className ?? ''}`}
        style={{ width, height, fontSize: Math.max(8, Math.floor(width * 0.38)) }}
        title={alt}
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-full shrink-0 ${className ?? ''}`}
      onError={() => setErrored(true)}
      unoptimized
    />
  );
}
