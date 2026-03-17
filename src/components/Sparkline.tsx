interface SparklineProps {
  prices: number[];
  width?: number;
  height?: number;
  className?: string;
}

export default function Sparkline({ prices, width = 80, height = 32, className = '' }: SparklineProps) {
  if (!prices || prices.length < 2) return <div style={{ width, height }} />;

  const pts = prices.slice(-48); // cap at 48 points — enough resolution, avoids noise from sparse data
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;

  const pad = 1; // 1px padding so line isn't clipped at edge
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = pts.map((p, i) => {
    const x = pad + (i / (pts.length - 1)) * w;
    const y = pad + h - ((p - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = points.join(' ');
  const first = pts[0];
  const last = pts[pts.length - 1];
  const isUp = last >= first;
  const stroke = isUp ? '#34d399' : '#f87171'; // emerald-400 / red-400

  // Build fill path: polyline + close down to baseline
  const firstPoint = points[0].split(',');
  const lastPoint = points[points.length - 1].split(',');
  const fillPath = `M ${firstPoint[0]},${firstPoint[1]} L ${points.join(' L ')} L ${lastPoint[0]},${pad + h} L ${firstPoint[0]},${pad + h} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      {/* Gradient fill under line */}
      <defs>
        <linearGradient id={`sg-${isUp ? 'up' : 'dn'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${isUp ? 'up' : 'dn'})`} />
      <polyline
        points={polyline}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
