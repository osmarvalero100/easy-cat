import React from 'react';
import { PackageCheck } from 'lucide-react';

interface IncludesBadgeListProps {
  includes: string[];
  color?: string;
  className?: string;
}

export const IncludesBadgeList: React.FC<IncludesBadgeListProps> = ({
  includes,
  color = '#2D4A3E',
  className = '',
}) => {
  if (!includes || includes.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 mr-1 flex items-center gap-1">
        <PackageCheck className="w-3.5 h-3.5" style={{ color }} />
        Incluye:
      </span>
      {includes.map((item, idx) => (
        <span
          key={idx}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all"
          style={{
            backgroundColor: `${color}0D`,
            color: color,
            border: `1px solid ${color}30`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
};
