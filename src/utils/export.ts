import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { ScheduleItem, DAYS } from '../types';

export function exportToCSV(items: ScheduleItem[]) {
  const data = items.map(item => ({
    Title: item.title,
    'Start Time': item.startTime,
    'End Time': item.endTime,
    Days: item.days.join(', '),
    Priority: item.priority,
    Category: item.category,
    Recurring: item.isRecurring ? 'Yes' : 'No'
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `timetable_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(items: ScheduleItem[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Your ChronosAI Timetable', 14, 20);
  
  const tableData = DAYS.map(day => {
    const dayItems = items
      .filter(item => item.days.includes(day))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    return [
      day,
      dayItems.map(item => `${item.startTime}-${item.endTime}: ${item.title} (${item.priority})`).join('\n')
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [['Day', 'Activities']],
    body: tableData,
    styles: { cellPadding: 5, fontSize: 10, overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 'auto' } }
  });

  doc.save(`timetable_${new Date().toISOString().split('T')[0]}.pdf`);
}
