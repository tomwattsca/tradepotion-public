export default function HomeLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-7 bg-zinc-800 rounded w-48 mb-2" />
        <div className="h-4 bg-zinc-800 rounded w-80" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden animate-pulse">
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="h-4 bg-zinc-800 rounded w-32" />
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800/50"
            style={{ opacity: 1 - i * 0.04 }}
          >
            <div className="h-4 w-5 bg-zinc-800 rounded" />
            <div className="flex items-center gap-2 flex-1">
              <div className="h-7 w-7 bg-zinc-800 rounded-full" />
              <div className="h-4 bg-zinc-800 rounded w-24" />
            </div>
            <div className="h-4 bg-zinc-800 rounded w-20 ml-auto" />
            <div className="h-4 bg-zinc-800 rounded w-14" />
            <div className="h-4 bg-zinc-800 rounded w-14" />
            <div className="h-4 bg-zinc-800 rounded w-20" />
            <div className="h-4 bg-zinc-800 rounded w-20" />
          </div>
        ))}
      </div>
    </main>
  );
}
