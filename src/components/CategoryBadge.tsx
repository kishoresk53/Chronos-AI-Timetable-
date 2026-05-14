import React from 'react';
import { CATEGORY_COLORS } from '../types';
import { cn } from '../lib/utils';

export const CategoryBadge = ({ category, className }: { category: string, className?: string }) => {
  const color = CATEGORY_COLORS[category] || '#94a3b8';

  return (
    <span 
      className={cn("px-2 py-0.5 rounded text-[10px] font-medium text-white inline-block", className)}
      style={{ backgroundColor: color }}
    >
      {category}
    </span>
  );
};
