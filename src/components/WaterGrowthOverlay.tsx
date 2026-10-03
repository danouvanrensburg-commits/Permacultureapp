import React from 'react';
import { Sprout, Sparkles } from 'lucide-react';

interface WaterGrowthOverlayProps {
  active: boolean;
  amount?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const WaterGrowthOverlay: React.FC<WaterGrowthOverlayProps> = ({
  active,
  amount,
  label,
  size = 'sm'
}) => {
  if (!active) return null;

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const defaultText = amount
    ? `+${amount} 💧 Sprouting!`
    : 'Planted 🌱';

  const displayText = label || defaultText;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-visible z-30 flex items-center justify-center"
    >
      {/* 1. Subtle green/lime shimmer sweep across the button surface */}
      <div className="absolute inset-0 rounded-[inherit] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/40 via-lime-300/30 to-transparent animate-growth-sweep w-[200%]" />
      </div>

      {/* 2. Expanding organic growth ring pulse around the button border */}
      <div className="absolute inset-0 rounded-[inherit] animate-growth-ring border-2 border-emerald-400/70 shadow-lg shadow-emerald-500/30" />

      {/* 3. Floating rising botanical sprout with rewarding glow badge */}
      <div
        className={`absolute left-1/2 pointer-events-none animate-growth-sprout flex items-center space-x-1 whitespace-nowrap ${
          isLarge ? '-top-6' : isSmall ? '-top-3' : '-top-4'
        }`}
      >
        <div
          className={`flex items-center space-x-1 rounded-full bg-emerald-500 text-stone-950 font-black shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-300/80 font-mono tracking-tight ${
            isLarge
              ? 'px-3 py-1 text-xs'
              : isSmall
              ? 'px-2 py-0.5 text-[10px]'
              : 'px-2.5 py-0.5 text-[11px]'
          }`}
        >
          <Sprout
            className={`fill-current text-stone-950 shrink-0 ${
              isLarge ? 'h-4 w-4' : 'h-3 w-3'
            }`}
          />
          <span>{displayText}</span>
          <Sparkles
            className={`text-amber-200 fill-amber-200 shrink-0 ${
              isLarge ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
