import React from 'react';
import { Sparkles } from 'lucide-react';

interface FragranceBadgeListProps {
  fragrances: string[];
  color?: string;
  className?: string;
}

export const FragranceBadgeList: React.FC<FragranceBadgeListProps> = ({
  fragrances,
  color = '#2D4A3E',
  className = '',
}) => {
  if (!fragrances || fragrances.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 mr-1 flex items-center gap-1">
        <Sparkles className="w-3 h-3" style={{ color }} />
        Aromas:
      </span>
      {fragrances.map((fragrance, idx) => (
        <span
          key={idx}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all"
          style={{
            backgroundColor: `${color}10`,
            color: color,
            border: `1px solid ${color}25`,
          }}
        >
          {fragrance}
        </span>
      ))}
    </div>
  );
};
