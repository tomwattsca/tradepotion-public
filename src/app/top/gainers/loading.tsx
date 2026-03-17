import TableSkeleton from '@/components/TableSkeleton';

export default function GainersLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 animate-pulse">
        <div className="h-7 bg-zinc-800 rounded w-56 mb-2" />
        <div className="h-4 bg-zinc-800 rounded w-72" />
      </div>
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <TableSkeleton rows={20} cols={6} />
      </div>
    </main>
  );
}
