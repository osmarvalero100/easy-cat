import React from 'react';
import { CandleColor } from '../../types/catalog';

interface ColorSwatchListProps {
  colors: CandleColor[];
  className?: string;
  showLabel?: boolean;
}

export const ColorSwatchList: React.FC<ColorSwatchListProps> = ({
  colors,
  className = '',
  showLabel = true,
}) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500">
          Colores:
        </span>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {colors.map((c, idx) => (
          <div
            key={idx}
            className="group relative flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-slate-200 bg-white/80 shadow-2xs hover:border-slate-400 transition-all cursor-default"
            title={`${c.name} (${c.hex})`}
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs flex-shrink-0"
              style={{ backgroundColor: c.hex }}
            />
            <span className="text-[11px] text-slate-700 font-medium whitespace-nowrap">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
