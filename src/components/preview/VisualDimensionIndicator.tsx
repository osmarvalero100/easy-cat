import React from 'react';

interface VisualDimensionIndicatorProps {
  heightCm: number;
  widthCm: number;
  color?: string;
  textColor?: string;
  className?: string;
  compact?: boolean;
}

export const VisualDimensionIndicator: React.FC<VisualDimensionIndicatorProps> = ({
  heightCm,
  widthCm,
  color = '#2D4A3E',
  textColor = '#333333',
  className = '',
  compact = false,
}) => {
  // Calculate relative aspect ratio for candle silhouette preview
  // Normalizing between 35px and 70px
  const safeHeight = Math.max(heightCm || 10, 2);
  const safeWidth = Math.max(widthCm || 6, 1);
  const ratio = safeHeight / safeWidth;

  const maxCanvasHeight = compact ? 52 : 72;
  const maxCanvasWidth = compact ? 42 : 54;

  let candleH = maxCanvasHeight - 14; // leave room for flame
  let candleW = candleH / ratio;

  if (candleW > maxCanvasWidth - 8) {
    candleW = maxCanvasWidth - 8;
    candleH = candleW * ratio;
  }
  // Clamp boundaries
  candleW = Math.max(12, Math.min(candleW, maxCanvasWidth - 6));
  candleH = Math.max(18, Math.min(candleH, maxCanvasHeight - 12));

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono bg-white/70 backdrop-blur-sm shadow-xs ${className}`}>
        <div className="flex items-center gap-1 font-semibold text-slate-700">
          <span className="text-[10px] text-slate-400">↕</span>
          <span>{heightCm} cm</span>
        </div>
        <span className="text-slate-300">×</span>
        <div className="flex items-center gap-1 font-semibold text-slate-700">
          <span className="text-[10px] text-slate-400">↔</span>
          <span>{widthCm} cm</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center w-fit max-w-full p-2 rounded-lg border transition-all ${className}`}
      style={{
        borderColor: `${color}25`,
        backgroundColor: `${color}06`,
      }}
    >
      {/* Visual Graphical Candle Silhouette with Dimension Guides */}
      <div className="relative flex items-center justify-center pr-2.5 sm:pr-3 border-r border-dashed shrink-0" style={{ borderColor: `${color}30` }}>
        <svg
          width="74"
          height="82"
          viewBox="0 0 74 82"
          className="overflow-visible"
        >
          {/* Flame & Wick */}
          <path
            d="M 37 18 Q 38 12 37 9 Q 35.5 13 37 18 Z"
            fill="#E69526"
            className="animate-pulse print:animate-none"
          />
          <line
            x1="37"
            y1="18"
            x2="37"
            y2="22"
            stroke="#4A4A4A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Candle Body */}
          <rect
            x={37 - candleW / 2}
            y={22}
            width={candleW}
            height={candleH}
            rx="3"
            fill="currentColor"
            style={{ color: color }}
            fillOpacity="0.16"
            stroke={color}
            strokeWidth="1.4"
          />

          {/* Candle Wax Rim Top */}
          <ellipse
            cx="37"
            cy="22"
            rx={candleW / 2}
            ry="2.5"
            fill={color}
            fillOpacity="0.25"
            stroke={color}
            strokeWidth="1"
          />

          {/* Height Dimension Line (Vertical Guide) */}
          <g transform="translate(64, 0)">
            <line
              x1="0"
              y1="22"
              x2="0"
              y2={22 + candleH}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* Top tick arrow */}
            <path d="M -3 24 L 0 21 L 3 24" stroke={color} strokeWidth="1" fill="none" />
            {/* Bottom tick arrow */}
            <path d={`M -3 ${20 + candleH} L 0 ${23 + candleH} L 3 ${20 + candleH}`} stroke={color} strokeWidth="1" fill="none" />
          </g>

          {/* Width Dimension Line (Horizontal Guide) */}
          <g transform={`translate(0, ${27 + candleH})`}>
            <line
              x1={37 - candleW / 2}
              y1="0"
              x2={37 + candleW / 2}
              y2="0"
              stroke={color}
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* Left tick arrow */}
            <path d={`M ${39 - candleW / 2} -3 L ${36 - candleW / 2} 0 L ${39 - candleW / 2} 3`} stroke={color} strokeWidth="1" fill="none" />
            {/* Right tick arrow */}
            <path d={`M ${35 + candleW / 2} -3 L ${38 + candleW / 2} 0 L ${35 + candleW / 2} 3`} stroke={color} strokeWidth="1" fill="none" />
          </g>
        </svg>
      </div>

      {/* Numerical Dimension Callout Labels */}
      <div className="pl-3 flex flex-col justify-center gap-1.5 min-w-[100px]">
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white shadow-xs"
            style={{ backgroundColor: color }}
          >
            ↕
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Alto</span>
            <span className="font-bold text-xs" style={{ color: textColor }}>{heightCm} cm</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white shadow-xs"
            style={{ backgroundColor: color }}
          >
            ↔
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Ancho / Ø</span>
            <span className="font-bold text-xs" style={{ color: textColor }}>{widthCm} cm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
