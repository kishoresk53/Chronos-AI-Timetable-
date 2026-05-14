/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Plus, 
  Download, 
  Sparkles, 
  BrainCircuit, 
  Trash2, 
  LayoutGrid, 
  List,
  ChevronRight,
  Settings2,
  FileText,
  FileSpreadsheet,
  Bell,
  BellOff,
  Volume2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScheduleItem, DayOfWeek, DAYS } from './types';
import ScheduleItemForm from './components/ScheduleItemForm';
import TimetableGrid from './components/TimetableGrid';
import { generateScheduleFromAI } from './lib/gemini';
import { exportToCSV, exportToPDF } from './utils/export';
import { cn } from './lib/utils';

export default function App() {
  const [items, setItems] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('chronos_schedule');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<ScheduleItem | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const lastFiredTime = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('chronos_schedule', JSON.stringify(items));
  }, [items]);

  // Reminder Logic
  useEffect(() => {
    const checkReminders = () => {
      if (!notificationsEnabled) return;

      const now = new Date();
      const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1]; // Convert 0-6 (Sun-Sat) to Monday-Sunday
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      // Only fire once per minute
      if (lastFiredTime.current === currentTime) return;

      const itemsToFire = items.filter(item => 
        item.days.includes(currentDay) && item.startTime === currentTime
      );

      if (itemsToFire.length > 0) {
        const item = itemsToFire[0];
        setActiveAlarm(item);
        lastFiredTime.current = currentTime;
        
        try {
          if (!audioRef.current) {
            audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audioRef.current.loop = true;
          }
          audioRef.current.play();
        } catch (e) {
          console.error("Audio playback failed", e);
        }

        if (Notification.permission === "granted") {
          new Notification(`Reminder: ${item.title}`, {
            body: `Starting now (${item.startTime} - ${item.endTime})`,
            icon: '/favicon.ico'
          });
        }
      }
    };

    const interval = setInterval(checkReminders, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [items, notificationsEnabled]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission denied. You can still use in-app alarms.");
      }
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveAlarm(null);
  };

  const handleSaveItem = (item: ScheduleItem) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [...prev, item]);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleEditItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const newItems = await generateScheduleFromAI(aiPrompt, items);
      setItems(prev => [...prev, ...newItems]);
      setAiPrompt('');
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire timetable?')) {
      setItems([]);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Mesh Background Blobs */}
      <div className="mesh-gradient">
        <div className="blob w-[600px] h-[600px] bg-indigo-600/20 -top-48 -left-48 animate-pulse" />
        <div className="blob w-[800px] h-[800px] bg-fuchsia-600/10 -bottom-48 -right-48" style={{ animationDuration: '8s' }} />
        <div className="blob w-[400px] h-[400px] bg-blue-500/10 top-1/4 right-0" style={{ animationDuration: '6s' }} />
      </div>

      {/* Header */}
      <header className="relative z-40 h-16 border-b border-white/10 backdrop-blur-xl bg-white/5 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            C
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Chronos AI <span className="text-white/30 font-light ml-1">| Timetable</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              if (!notificationsEnabled) requestNotificationPermission();
            }}
            className={cn(
              "p-2 rounded-xl border transition-all",
              notificationsEnabled ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/10 text-white/20"
            )}
            title={notificationsEnabled ? "Disable Alarms" : "Enable Alarms"}
          >
            {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>

          <div className="group relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              <Download size={14} className="text-indigo-400" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/90 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
              <button 
                onClick={() => exportToPDF(items)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-[10px] uppercase font-bold tracking-widest text-white/70"
              >
                <FileText size={14} className="text-red-500/70" /> Output PDF
              </button>
              <button 
                onClick={() => exportToCSV(items)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-[10px] uppercase font-bold tracking-widest text-white/70"
              >
                <FileSpreadsheet size={14} className="text-emerald-500/70" /> Output CSV
              </button>
            </div>
          </div>

          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={14} />
            <span>Add Block</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col p-6 gap-8 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* AI Architect Section - Redesigned as compact side-by-side or top bar */}
        <section className="shrink-0 flex flex-col md:flex-row items-center gap-6 p-6 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
              <Sparkles className="text-indigo-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase leading-none">Architect</h2>
              <span className="text-[10px] font-bold text-indigo-400/60 tracking-widest uppercase">AI Optimizer</span>
            </div>
          </div>
          
          <div className="flex-1 w-full flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe your weekly goals... 'I need 2 deep work blocks daily'"
              className="flex-1 px-5 py-3.5 bg-black/30 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-xs font-medium"
            />
            <button 
              onClick={handleAiGenerate}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3"
            >
              {isAiLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={14} />
                </motion.div>
              ) : (
                <>
                  <span>Optimize Plan</span>
                  <ChevronRight size={14} className="text-indigo-400" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Timetable Controls & Grid */}
        <section className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-black text-white/50 uppercase tracking-[0.2em]">Active Layout</h3>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter">Your Week</h2>
            </div>
            
            {items.length > 0 && (
              <button 
                onClick={clearAll}
                className="flex items-center gap-2 text-white/20 hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-[0.15em] mb-1"
              >
                <Trash2 size={12} />
                Clear Space
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[600px]">
            {items.length === 0 ? (
              <div className="h-full backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-indigo-500/5 rounded-full flex items-center justify-center mb-8 border border-indigo-500/10">
                  <Calendar className="text-indigo-500/20" size={48} />
                </div>
                <h4 className="text-2xl font-black text-white mb-3 tracking-tight">Empty Canvas</h4>
                <p className="text-white/30 max-w-sm mb-10 text-sm font-medium leading-relaxed">
                  The schedule is currently optimized. Add your first work block manually or use the AI Architect.
                </p>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all active:scale-95"
                >
                  Initiate First Task
                </button>
              </div>
            ) : (
              <TimetableGrid 
                items={items} 
                onDelete={handleDeleteItem} 
                onEdit={handleEditItem}
              />
            )}
          </div>
        </section>
      </main>

      {/* Footer Info Area */}
      <footer className="relative z-40 h-12 bg-white/5 backdrop-blur-xl border-t border-white/10 px-8 flex items-center justify-between shrink-0">
        <div className="flex gap-6 text-[9px] tracking-[0.15em] uppercase text-white/30 font-black">
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> High Priority</div>
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span> Medium</div>
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Low Priority</div>
        </div>
        <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.2em]">
          © 2026 Chronos AI Laboratory • All Systems Optimized
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setIsFormOpen(false)}
            />
            <div className="relative w-full max-w-lg z-10">
              <ScheduleItemForm 
                onSave={handleSaveItem} 
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingItem(null);
                }}
                initialItem={editingItem || undefined}
              />
            </div>
          </div>
        )}

        {/* Alarm Overlay */}
        {activeAlarm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-950/80 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-sm bg-white/10 border border-white/20 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(99,102,241,0.3)]"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                  <Volume2 size={40} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Time for Action</h2>
              <p className="text-indigo-300 font-bold text-lg mb-8">{activeAlarm.title}</p>
              
              <div className="flex flex-col gap-3">
                 <button 
                  onClick={stopAlarm}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                >
                  I'm On It
                </button>
                <button 
                  onClick={stopAlarm}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/40 font-bold rounded-2xl border border-white/10 transition-all text-sm"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
