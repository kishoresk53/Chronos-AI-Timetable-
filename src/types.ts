/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'low' | 'medium' | 'high';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  days: DayOfWeek[];
  priority: Priority;
  category: string;
  isRecurring: boolean;
  color?: string;
}

export const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export const CATEGORIES = [
  'Work',
  'Study',
  'Health',
  'Personal',
  'Leisure',
  'Social',
  'Errands'
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Work': '#3b82f6',     // blue-500
  'Study': '#8b5cf6',    // purple-500
  'Health': '#10b981',   // emerald-500
  'Personal': '#f59e0b', // amber-500
  'Leisure': '#ec4899',  // pink-500
  'Social': '#f43f5e',   // rose-500
  'Errands': '#64748b',  // slate-500
};
