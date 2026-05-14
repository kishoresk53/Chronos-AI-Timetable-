import React from 'react';
import { Priority } from '../types';
import { cn } from '../lib/utils';

export const PriorityBadge = ({ priority, className }: { priority: Priority, className?: string }) => {
  const colors = {
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    medium: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    high: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider backdrop-blur-sm",
      colors[priority],
      className
    )}>
      {priority}
    </span>
  );
};
