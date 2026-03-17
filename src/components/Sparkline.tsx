interface SparklineProps {
  prices: number[];
  width?: number;
  height?: number;
}

export default function Sparkline({ prices, width = 80, height = 32 }: SparklineProps) {
  if (!prices || prices.length < 2) {
    return <span className="text-xs text-zinc-600">—</span>;
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? '#34d399' : '#f87171'; // emerald-400 / red-400

  // Build a closed fill path: line + bottom-right + bottom-left
  const firstX = 0;
  const lastX = width;
  const fillPath = `M ${points[0]} L ${points.slice(1).join(' L ')} L ${lastX},${height} L ${firstX},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      {/* Gradient fill under the line */}
      <defs>
        <linearGradient id={`sg-${isUp ? 'up' : 'dn'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${isUp ? 'up' : 'dn'})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
