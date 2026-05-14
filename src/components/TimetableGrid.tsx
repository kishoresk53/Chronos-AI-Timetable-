import React from 'react';
import { ScheduleItem, DAYS, DayOfWeek, CATEGORY_COLORS } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { Trash2, Edit2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  items: ScheduleItem[];
  onDelete: (id: string) => void;
  onEdit: (item: ScheduleItem) => void;
}

export default function TimetableGrid({ items, onDelete, onEdit }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-[1px] bg-white/10 border border-white/20 rounded-2xl overflow-hidden backdrop-blur-3xl shadow-2xl">
      {DAYS.map((day, dayIndex) => {
        const dayItems = items
          .filter(item => item.days.includes(day))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <div key={day} className="flex flex-col min-h-[500px] border-r border-white/5 last:border-r-0 bg-white/[0.02]">
            <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col items-center gap-1">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                Day {(dayIndex + 1).toString().padStart(2, '0')}
              </span>
              <h4 className="font-bold text-white tracking-tight">{day.substring(0, 3).toUpperCase()}</h4>
            </div>
            
            <div className="flex flex-col gap-2 p-3">
              {dayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 border border-dashed border-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Free</span>
                </div>
              ) : (
                dayItems.map((item, idx) => (
                  <motion.div
                    key={`${day}-${item.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative backdrop-blur-md bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                       <CategoryBadge category={item.category} className="text-[8px] pl-0" />
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => onEdit(item)}
                           className="p-1 px-1.5 bg-white/5 hover:bg-indigo-500/30 text-white/40 hover:text-white rounded border border-white/10 transition-colors"
                         >
                           <Edit2 size={10} />
                         </button>
                         <button 
                           onClick={() => onDelete(item.id)}
                           className="p-1 px-1.5 bg-white/5 hover:bg-red-500/30 text-white/40 hover:text-white rounded border border-white/10 transition-colors"
                         >
                           <Trash2 size={10} />
                         </button>
                       </div>
                    </div>

                    <h5 className="font-bold text-white text-xs mb-3 leading-tight font-sans tracking-tight">{item.title}</h5>
                    
                    <div className="flex items-center gap-1.5 text-white/40 mb-3">
                      <Clock size={10} />
                      <span className="text-[9px] font-bold tracking-widest uppercase">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5">
                      <PriorityBadge priority={item.priority} className="text-[8px] border-none" />
                      {item.isRecurring && (
                        <div className="w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" title="Recurring" />
                      )}
                    </div>

                    {/* Left Accent Bar */}
                    <div 
                      className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#ccc' }}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
