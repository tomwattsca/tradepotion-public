'use client';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export default function TableSkeleton({ rows = 10, cols = 7 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse">
      {/* Header row */}
      <div className="grid gap-4 px-4 py-2 border-b border-zinc-800 mb-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-zinc-800 rounded w-3/4 mx-auto" />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 px-4 py-3 border-b border-zinc-800/50"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className={`h-4 bg-zinc-800 rounded ${j === 0 ? 'w-6' : j === 1 ? 'w-full' : 'w-4/5 ml-auto'}`}
              style={{ opacity: 1 - i * 0.04 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
