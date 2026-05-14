import React, { useState } from 'react';
import { ScheduleItem, DAYS, PRIORITIES, CATEGORIES, DayOfWeek, Priority } from '../types';
import { X, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  onSave: (item: ScheduleItem) => void;
  onCancel: () => void;
  initialItem?: ScheduleItem;
}

export default function ScheduleItemForm({ onSave, onCancel, initialItem }: Props) {
  const [title, setTitle] = useState(initialItem?.title || '');
  const [startTime, setStartTime] = useState(initialItem?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialItem?.endTime || '10:00');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(initialItem?.days || []);
  const [priority, setPriority] = useState<Priority>(initialItem?.priority || 'medium');
  const [category, setCategory] = useState(initialItem?.category || CATEGORIES[0]);
  const [isRecurring, setIsRecurring] = useState(initialItem?.isRecurring ?? true);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || selectedDays.length === 0) return;

    onSave({
      id: initialItem?.id || Math.random().toString(36).substr(2, 9),
      title,
      startTime,
      endTime,
      days: selectedDays,
      priority,
      category,
      isRecurring,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="backdrop-blur-2xl bg-white/10 rounded-2xl p-6 shadow-2xl border border-white/20 text-white"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold tracking-tight">
          {initialItem ? 'Update Block' : 'Quick Add Block'}
        </h3>
        <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">Activity Name</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Advanced UX Research"
            className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm placeholder:text-white/20"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">Start Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">End Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">Days</label>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border",
                  selectedDays.includes(day)
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
                )}
              >
                {day.substring(0, 3).toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">Priority</label>
            <div className="flex gap-1.5 p-1 bg-black/20 border border-white/10 rounded-xl">
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 py-1 rounded-lg text-[9px] font-black uppercase transition-all",
                    priority === p 
                      ? p === 'high' ? "bg-red-500 text-white" : p === 'medium' ? "bg-indigo-500 text-white" : "bg-emerald-500 text-white"
                      : "text-white/30 hover:text-white/60"
                  )}
                >
                  {p.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-[9px] bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none text-[11px] font-bold appearance-none cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="recurring"
            checked={isRecurring}
            onChange={e => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded border-white/10 bg-white/5 accent-indigo-500 focus:ring-0"
          />
          <label htmlFor="recurring" className="text-xs text-white/60 select-none">Recurring Weekly</label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white/5 text-white/60 font-bold text-xs rounded-xl hover:bg-white/10 border border-white/10 transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all uppercase tracking-widest"
          >
            {initialItem ? 'Update Block' : 'Add to Queue'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
