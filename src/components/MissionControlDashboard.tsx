/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, LayoutGrid, Calendar, Users, Clock, FileText, Activity, 
  Layers, Plus, Trash, Trash2, Edit3, Check, CheckSquare, Sparkles, PlusCircle, ArrowUp, ArrowDown,
  RefreshCw, Play, Pause, RotateCcw, AlertTriangle, ShieldCheck, HeartPulse, Sliders, X,
  TrendingUp, Award, BarChart4
} from 'lucide-react';
import { Task, Doc, Workspace, Theme } from '../types';
import { localDB } from '../utils/db';
import { useAppStore } from '../store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface MissionControlDashboardProps {
  tasks: Task[];
  docs: Doc[];
  workspaces: Workspace[];
  activeWorkspaceId: string;
  createTask: (status: 'Todo' | 'Backlog' | 'InProgress' | 'Done') => void;
  accentColor: string;
  onChangeMenu: (menu: any) => void;
  addNotification: (title: string, body: string, type: any) => void;
  onEditTask?: (task: Task) => void;
  onSelectWorkspace?: (id: string) => void;
  theme?: Theme;
}

interface WidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  colSpan: 1 | 2;
  order: number;
  side?: 'left' | 'right' | 'full';
}

export default function MissionControlDashboard({
  tasks,
  docs,
  workspaces,
  activeWorkspaceId,
  createTask,
  accentColor,
  onChangeMenu,
  addNotification,
  onEditTask,
  onSelectWorkspace,
  theme
}: MissionControlDashboardProps) {
  
  // Customizable Widgets Registry
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const saved = localStorage.getItem('trecko_mission_widgets');
    let parsed: WidgetConfig[] = saved ? JSON.parse(saved) : [
      { id: 'focus_timer', title: 'Time Lapse', enabled: true, colSpan: 1, order: 1, side: 'right' },
      { id: 'due_today', title: 'Due Today Backlog', enabled: false, colSpan: 1, order: 2, side: 'left' },
      { id: 'project_health', title: 'Project Health Center', enabled: true, colSpan: 1, order: 3, side: 'left' },
      { id: 'active_projects', title: 'Active Projects Directories', enabled: true, colSpan: 1, order: 4, side: 'right' },
      { id: 'team_status', title: 'Active Team Cadence', enabled: true, colSpan: 1, order: 5, side: 'left' },
      { id: 'recent_notes', title: 'Sticky Notes Feed', enabled: true, colSpan: 1, order: 6, side: 'right' },
      { id: 'calendar_events', title: 'Interactive Calendar Milestones', enabled: true, colSpan: 2, order: 7, side: 'full' },
      { id: 'quick_actions', title: 'Quick Workspace Actions', enabled: true, colSpan: 2, order: 0, side: 'full' }
    ];
    
    // Ensure all parsed items have a valid side value
    parsed = parsed.map(w => {
      let side = w.side;
      if (!side) {
        if (w.colSpan === 2 || w.id === 'quick_actions' || w.id === 'calendar_events') {
          side = 'full';
        } else if (['due_today', 'project_health', 'team_status'].includes(w.id)) {
          side = 'left';
        } else {
          side = 'right';
        }
      }
      let title = w.title;
      if (w.id === 'focus_timer') {
        title = 'Time Lapse';
      }
      return {
        ...w,
        title,
        side,
        enabled: w.id === 'due_today' ? false : w.enabled
      };
    });
    return parsed;
  });

  const [customizeMode, setCustomizeMode] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'home' | 'insights'>('home');

  // Drag & drop rearrangement states
  const [dragEnabledWidgetId, setDragEnabledWidgetId] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Focus Timer States (embedded mini module)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [lapseTitle, setLapseTitle] = useState('');
  const [recordedLapses, setRecordedLapses] = useState<any[]>(() => {
    const saved = localStorage.getItem('trecko_focus_lapses');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p-1');
  const [lapsePresets, setLapsePresets] = useState<any[]>(() => {
    const saved = localStorage.getItem('trecko_focus_lapse_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If they are the old gimmicky values, override them or use default
        if (parsed.some((p: any) => p.title.includes('Technical Research') || p.title.includes('Sprint') || p.title.includes('Refactoring Cycle'))) {
          return [
            { id: 'p-1', title: 'Deep Focus', minutes: 25 },
            { id: 'p-2', title: 'Break', minutes: 15 },
            { id: 'p-3', title: 'Refactor', minutes: 45 }
          ];
        }
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: 'p-1', title: 'Deep Focus', minutes: 25 },
      { id: 'p-2', title: 'Break', minutes: 15 },
      { id: 'p-3', title: 'Refactor', minutes: 45 }
    ];
  });
  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [newPresetMinutes, setNewPresetMinutes] = useState(25);

  const [dueTodayHeight, setDueTodayHeight] = useState<number>(() => {
    const saved = localStorage.getItem('trecko_due_today_height');
    return saved ? parseInt(saved) : 180;
  });
  const [dueTodayLimit, setDueTodayLimit] = useState<number>(() => {
    const saved = localStorage.getItem('trecko_due_today_limit');
    return saved ? parseInt(saved) : 5;
  });

  useEffect(() => {
    localStorage.setItem('trecko_due_today_height', dueTodayHeight.toString());
  }, [dueTodayHeight]);

  useEffect(() => {
    localStorage.setItem('trecko_due_today_limit', dueTodayLimit.toString());
  }, [dueTodayLimit]);

  useEffect(() => {
    localStorage.setItem('trecko_focus_lapses', JSON.stringify(recordedLapses));
  }, [recordedLapses]);

  useEffect(() => {
    localStorage.setItem('trecko_focus_lapse_presets', JSON.stringify(lapsePresets));
  }, [lapsePresets]);

  // Quick notes state
  const [notesFeed, setNotesFeed] = useState<any[]>([]);
  const [quickNoteText, setQuickNoteText] = useState('');

  // States for active note edit modal
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState('');
  const [editingNoteText, setEditingNoteText] = useState('');

  const handleUpdateNote = () => {
    if (!editingNote) return;
    const updated = {
      ...editingNote,
      title: editingNoteTitle.trim() || 'Untitled Note',
      text: editingNoteText.trim()
    };
    
    const nextNotes = notesFeed.map(n => n.id === editingNote.id ? updated : n);
    setNotesFeed(nextNotes);
    localDB.put('notes', updated);
    setEditingNote(null);
    addNotification('Note Updated', 'Successfully saved changes to stickies registry.', 'success');
  };

  const handleDeleteNote = (id: string) => {
    const target = notesFeed.find(n => n.id === id);
    if (target) {
      useAppStore.getState().addToTrash({
        id: target.id,
        type: 'note',
        title: target.title || 'Quick Sticky Note',
        originalData: target
      });
    }
    const next = notesFeed.filter(n => n.id !== id);
    setNotesFeed(next);
    localDB.delete('notes', id);
    addNotification('Note Deleted', 'Moved to trash ledger.', 'info');
    if (editingNote && editingNote.id === id) {
      setEditingNote(null);
    }
  };

  useEffect(() => {
    localDB.getAll('notes').then(res => {
      setNotesFeed(res || []);
    });
  }, []);

  useEffect(() => {
    let timerInter: any = null;
    if (timerActive) {
      timerInter = setInterval(() => {
        setTimerSeconds(p => {
          if (p <= 1) {
            setTimerActive(false);
            addNotification('Timer Concluded', 'Focus interval finished.', 'habit');
            return 25 * 60;
          }
          return p - 1;
        });
      }, 1000);
    } else {
      if (timerInter) clearInterval(timerInter);
    }
    return () => clearInterval(timerInter);
  }, [timerActive]);

  const saveWidgetsConfig = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    localStorage.setItem('trecko_mission_widgets', JSON.stringify(newWidgets));
  };

  const handleToggleWidget = (id: string) => {
    const next = widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w);
    saveWidgetsConfig(next);
  };

  const handleSpanWidget = (id: string) => {
    const next = widgets.map(w => w.id === id ? { ...w, colSpan: w.colSpan === 1 ? 2 : 1 as any } : w);
    saveWidgetsConfig(next);
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const updated = [...widgets];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    
    // Swap Order Values
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    saveWidgetsConfig(updated);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    const index = widgets.findIndex(w => w.id === id);
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    const index = widgets.findIndex(w => w.id === id);
    if (draggingIndex !== null && draggingIndex !== index && dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
    setDragEnabledWidgetId(null);
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    const targetIdx = widgets.findIndex(w => w.id === id);
    if (draggingIndex !== null && draggingIndex !== targetIdx) {
      const updated = [...widgets];
      const draggedItem = { ...updated[draggingIndex] };
      const targetItem = updated[targetIdx];
      
      // Update its side and colSpan on drop matching the target's environment
      if (targetItem.side) {
        draggedItem.side = targetItem.side;
        if (targetItem.side === 'full') {
          draggedItem.colSpan = 2;
        } else if (draggedItem.colSpan === 2) {
          draggedItem.colSpan = 1;
        }
      }

      updated.splice(draggingIndex, 1);
      const newTargetIdx = updated.findIndex(w => w.id === id);
      updated.splice(newTargetIdx, 0, draggedItem);
      saveWidgetsConfig(updated);
      addNotification('Dashboard Rearranged', `Repositioned "${draggedItem.title}" to "${targetItem.title}" slot.`, 'info');
    }
    handleDragEnd();
  };

  const handleColumnDrop = (e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault();
    if (draggingIndex !== null) {
      const updated = [...widgets];
      const draggedItem = { ...updated[draggingIndex] };
      
      draggedItem.side = side;
      if (draggedItem.colSpan === 2) {
        draggedItem.colSpan = 1;
      }
      
      updated.splice(draggingIndex, 1);
      // Place it at the end of the stack
      updated.push(draggedItem);
      
      saveWidgetsConfig(updated);
      addNotification('Dashboard Rearranged', `Moved "${draggedItem.title}" to ${side} column.`, 'success');
    }
    handleDragEnd();
  };

  const handleAddQuickNote = () => {
    if (!quickNoteText.trim()) return;
    const item = {
      id: `st-${Date.now()}`,
      title: 'Quick Scratchpad',
      text: quickNoteText.trim(),
      label: 'Scribbles',
      color: 'zinc',
      isPinned: false,
      isArchived: false
    };
    setNotesFeed([item, ...notesFeed]);
    localDB.put('notes', item);
    setQuickNoteText('');
    addNotification('Note Created', 'Quick note saved securely.', 'info');
  };

  // Filter Tasks due today or near future
  const getDueTasks = () => {
    return tasks.filter(t => t.status !== 'Done').slice(0, dueTodayLimit);
  };

  // Mock Calendar Events
  const calendarEvents = [
    { title: 'API Gateway Endpoint Verification', date: 'TODAY', status: 'In-progress', lead: 'Elena Rostova' },
    { title: 'Interactive Topology Network Review', date: 'TOMORROW', status: 'Suggested', lead: 'Marcus Vance' },
    { title: 'Sovereign Release 1.0 Milestone', date: 'JUN 08', status: 'Pending', lead: 'Alex Chen' }
  ];

  // Analytical processing for task priorities per assignee
  const renderInsightsTab = () => {
    const dataMap: Record<string, { assignee: string; High: number; Medium: number; Low: number; total: number }> = {};
    
    tasks.forEach(task => {
      const rawAssignee = (task.assignee || 'Unassigned').trim();
      const assigneeName = rawAssignee === '' ? 'Unassigned' : rawAssignee;
      
      if (!dataMap[assigneeName]) {
        dataMap[assigneeName] = { assignee: assigneeName, High: 0, Medium: 0, Low: 0, total: 0 };
      }
      
      const priority = (task.priority || 'Medium').trim();
      if (priority === 'High') {
        dataMap[assigneeName].High += 1;
      } else if (priority === 'Low') {
        dataMap[assigneeName].Low += 1;
      } else {
        dataMap[assigneeName].Medium += 1;
      }
      dataMap[assigneeName].total += 1;
    });

    const chartData = Object.values(dataMap).sort((a, b) => b.total - a.total);
    const totalCount = tasks.length;
    const highCount = tasks.filter(t => t.priority === 'High').length;
    const medCount = tasks.filter(t => t.priority === 'Medium').length;
    const lowCount = tasks.filter(t => t.priority === 'Low').length;

    // Highest workload agent
    let busiestAgent = 'None';
    let maxTasks = 0;
    chartData.forEach(item => {
      if (item.assignee !== 'Unassigned' && item.total > maxTasks) {
        maxTasks = item.total;
        busiestAgent = item.assignee;
      }
    });

    return (
      <div className="space-y-6 text-left animate-fade-in" id="insights-tab-root">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#09090b]/80 border border-white/5 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Total Tasks Cataloged</span>
              <span className="text-2xl font-black text-white font-mono">{totalCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#09090b]/80 border border-white/5 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Critical Priority Actions</span>
              <span className="text-2xl font-black text-rose-500 font-mono">{highCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/10">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#09090b]/80 border border-white/5 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Primary Workforce Lead</span>
              <span className="text-sm font-black text-emerald-400 truncate max-w-[140px] block mt-1">{busiestAgent}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#09090b]/80 border border-white/5 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">Completed Milestones</span>
              <span className="text-2xl font-black text-sky-400 font-mono">{tasks.filter(t => t.status === 'Done').length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/15">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Priority workload distribution card with Recharts bar chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[#09090b]/80 border border-white/5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10.5px] font-extrabold font-mono text-indigo-400 uppercase tracking-widest">WORKLOAD PRIORITY MATRIX</span>
                <h3 className="text-xs font-bold text-zinc-400 uppercase">Priority distribution by active assignee</h3>
              </div>
              <div className="flex items-center space-x-3.5 text-[10px] font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> High</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Medium</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Low</span>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-center text-zinc-400 italic font-sans text-xs">
                No active task metrics catalogs available to plot. Add some task cards first!
              </div>
            ) : (
              <div className="h-[280px]" id="recharts-insights-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
                    <XAxis 
                      dataKey="assignee" 
                      stroke="#888888" 
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{
                        backgroundColor: '#09090b',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#ffffff',
                        textAlign: 'left'
                      }}
                    />
                    <Bar dataKey="High" stackId="priority-stack" fill="#ef4444" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Medium" stackId="priority-stack" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Low" stackId="priority-stack" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Side stats detail card */}
          <div className="p-5 rounded-2xl bg-[#09090b]/80 border border-white/5 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-0.5">
                <span className="text-[10.5px] font-extrabold font-mono text-emerald-400 uppercase tracking-widest">WORKFORCE REGISTRY</span>
                <h3 className="text-xs font-bold text-zinc-350 uppercase">Resource Task Allocations</h3>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {chartData.map((item, idx) => {
                  const percent = totalCount > 0 ? Math.round((item.total / totalCount) * 100) : 0;
                  return (
                    <div key={idx} className="p-2.5 bg-black/45 border border-white/5 rounded-xl hover:border-white/10 transition-all space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center leading-none">
                        <span className="font-bold text-white block truncate max-w-[120px]">{item.assignee}</span>
                        <span className="font-mono text-[10px] text-zinc-400 shrink-0 font-bold">{item.total} task{item.total === 1 ? '' : 's'} ({percent}%)</span>
                      </div>
                      
                      {/* Breakdown meters */}
                      <div className="flex h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div style={{ width: `${item.total > 0 ? (item.High / item.total) * 100 : 0}%` }} className="bg-rose-500 h-full" title="High Priority" />
                        <div style={{ width: `${item.total > 0 ? (item.Medium / item.total) * 100 : 0}%` }} className="bg-amber-500 h-full" title="Medium Priority" />
                        <div style={{ width: `${item.total > 0 ? (item.Low / item.total) * 100 : 0}%` }} className="bg-emerald-500 h-full" title="Low Priority" />
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 leading-none">
                        <span className="text-rose-400 font-semibold">High: {item.High}</span>
                        <span className="text-amber-400 font-semibold">Med: {item.Medium}</span>
                        <span className="text-emerald-400 font-semibold">Low: {item.Low}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 text-[9px] font-mono text-zinc-500 leading-snug">
              ℹ️ Stacked priority meters represent each developer's workload distribution. Hover nodes to view accurate coordinate values.
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left select-none">
      
      {/* Interactive Title Hub */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 uppercase">
            <Compass className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
            <span>Home dashboard</span>
          </h1>

          {/* Tab buttons */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5" id="dashboard-tabs">
            <button
              onClick={() => setActiveDashboardTab('home')}
              className={`px-3.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                activeDashboardTab === 'home'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveDashboardTab('insights')}
              className={`px-3.5 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                activeDashboardTab === 'insights'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              TASK INSIGHTS
            </button>
          </div>
        </div>

        {activeDashboardTab === 'home' ? (
          <button
            onClick={() => setCustomizeMode(!customizeMode)}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-2 border transition-all cursor-pointer ${
              customizeMode 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                : 'bg-zinc-900 border-white/5 text-zinc-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{customizeMode ? 'FINALIZE BOARD' : 'CUSTOMIZE LAYOUT'}</span>
          </button>
        ) : null}
      </div>

      {activeDashboardTab === 'insights' ? (
        renderInsightsTab()
      ) : (
        <>
          {/* Customize Panel Controls */}
          {customizeMode && (
        <div className="p-4 rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/[0.02] space-y-3.5">
          <span className="text-[10.5px] font-bold font-mono text-amber-400 uppercase tracking-widest block">🔧 MISSION CONTROL WIDGET ALIGNMENT SETTINGS</span>
          <div className="flex flex-wrap gap-2.5">
            {widgets.map((widget, index) => (
              <div key={widget.id} className="px-3 py-1.5 bg-black/60 border border-white/5 rounded-xl flex items-center space-x-2.5 text-[10.5px]">
                <button
                  type="button"
                  onClick={() => handleToggleWidget(widget.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    widget.enabled ? 'bg-amber-400 border-amber-400 text-black' : 'border-zinc-700'
                  }`}
                >
                  {widget.enabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
                <span className={`font-semibold ${widget.enabled ? 'text-white' : 'text-zinc-650 line-through'}`}>{widget.title}</span>
                
                {widget.enabled && (
                  <div className="flex items-center space-x-1 pl-2 border-l border-white/10 shrink-0">
                    <button 
                      onClick={() => handleSpanWidget(widget.id)} 
                      className="px-1.5 bg-white/5 text-zinc-400 hover:text-white rounded uppercase text-[8.5px] font-mono font-bold"
                    >
                      {widget.colSpan === 1 ? 'Expand Full' : 'Half View'}
                    </button>
                    <button onClick={() => moveWidget(index, 'up')} disabled={index === 0} className="p-0.5 hover:text-white text-zinc-500 disabled:opacity-20"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => moveWidget(index, 'down')} disabled={index === widgets.length - 1} className="p-0.5 hover:text-white text-zinc-500 disabled:opacity-20"><ArrowDown className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Layout partitioned into Full-Width parts + Left Column + Right Column */}
      {(() => {
        const renderSingleWidget = (widget: WidgetConfig) => {
          const widgetIdx = widgets.findIndex(w => w.id === widget.id);
          const isDragging = draggingIndex === widgetIdx;
          const isDragOver = dragOverIndex === widgetIdx;

          if (!widget.enabled) {
            return (
              <div 
                key={widget.id} 
                onDragOver={(e) => handleDragOver(e, widget.id)}
                onDragLeave={() => {
                  if (dragOverIndex === widgetIdx) setDragOverIndex(null);
                }}
                onDrop={(e) => handleDrop(e, widget.id)}
                className={`p-4 rounded-2xl border border-dashed text-center flex flex-col items-center justify-center min-h-[145px] transition-all duration-200 ${
                  isDragOver 
                    ? 'border-amber-500/40 bg-zinc-900/40 opacity-100 scale-[0.99]' 
                    : 'border-white/5 bg-transparent opacity-40 hover:opacity-90 hover:border-white/10 hover:bg-white/[0.01]'
                }`}
              >
                <div className="flex flex-col items-center space-y-1.5 pointer-events-none">
                  <LayoutGrid className="w-4 h-4 text-zinc-500" />
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider font-extrabold">Empty {widget.title} Slot</span>
                  <p className="text-[8px] text-zinc-500 font-mono leading-tight max-w-[200px]">Drag & drop any card here to place, or tap restore below</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleWidget(widget.id);
                    addNotification('Widget Restored', `"${widget.title}" is now active.`, 'success');
                  }}
                  className="mt-2 text-zinc-400 hover:text-white transition-all text-[8px] font-mono uppercase bg-white/5 hover:bg-white/10 border border-white/5 px-2 py-0.5 rounded cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <PlusCircle className="w-2.5 h-2.5" />
                  <span>Restore Card</span>
                </button>
              </div>
            );
          }

          return (
            <div 
              key={widget.id} 
              draggable={dragEnabledWidgetId === widget.id}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragLeave={() => {
                if (dragOverIndex === widgetIdx) setDragOverIndex(null);
              }}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, widget.id)}
              className={`p-4 relative overflow-hidden flex flex-col justify-start shadow-md hover:border-white/10 transition-all border ${
                theme?.cardClass ? theme.cardClass : 'rounded-2xl bg-[#09090b]/80'
              } ${
                isDragging 
                  ? 'opacity-30 border-dashed border-white/10 scale-[0.98]' 
                  : isDragOver
                  ? 'border-amber-500/40 bg-zinc-900/40 scale-[0.99]'
                  : theme?.borderClass ? theme.borderClass : 'border-white/5'
              }`}
            >
              {/* Header Indicator */}
              <div className={`flex justify-between items-center pb-2 border-b mb-3 ${theme?.borderClass ? theme.borderClass : 'border-white/5'}`}>
                <div className="flex items-center space-x-2 flex-grow min-w-0">
                  {/* Drag Handle 3 Dash Bar */}
                  <div 
                    onMouseDown={() => setDragEnabledWidgetId(widget.id)}
                    onMouseUp={() => setDragEnabledWidgetId(null)}
                    onMouseLeave={() => setDragEnabledWidgetId(null)}
                    className="flex flex-col gap-[3px] p-1.5 -ml-1 rounded hover:bg-white/5 active:cursor-grabbing cursor-grab transition-all shrink-0 group/drag"
                    title="Drag to rearrange panel"
                  >
                    <div className="w-3.5 h-[1.5px] bg-zinc-650 group-hover/drag:bg-zinc-300 transition-colors rounded-sm" style={{ backgroundColor: dragEnabledWidgetId === widget.id ? accentColor : undefined }} />
                    <div className="w-3.5 h-[1.5px] bg-zinc-650 group-hover/drag:bg-zinc-300 transition-colors rounded-sm" style={{ backgroundColor: dragEnabledWidgetId === widget.id ? accentColor : undefined }} />
                    <div className="w-3.5 h-[1.5px] bg-zinc-650 group-hover/drag:bg-zinc-330 transition-colors rounded-sm" style={{ backgroundColor: dragEnabledWidgetId === widget.id ? accentColor : undefined }} />
                  </div>
                  <h3 className="text-xs uppercase font-extrabold text-zinc-300 font-mono tracking-wider truncate">{widget.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleWidget(widget.id);
                    addNotification('Widget Removed', `"${widget.title}" has been hidden. Restorable via Customize Layout.`, 'info');
                  }}
                  className="p-1 hover:bg-white/5 text-zinc-500 hover:text-white rounded-lg transition-all cursor-pointer flex items-center justify-center opacity-40 hover:opacity-100"
                  title="Hide widget from dashboard"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Render specific widget inner logic */}
              <div className={`flex-grow ${draggingIndex !== null ? 'pointer-events-none' : ''}`}>
                {renderWidgetInner(widget, { 
                  tasks, docs, workspaces, activeWorkspaceId, createTask, 
                  accentColor, onChangeMenu, timerSeconds, setTimerSeconds, 
                  timerActive, setTimerActive, notesFeed, quickNoteText, 
                  setQuickNoteText, handleAddQuickNote, getDueTasks, calendarEvents, 
                  addNotification, onEditTask,
                  setEditingNote, setEditingNoteTitle, setEditingNoteText, handleDeleteNote,
                  lapseTitle, setLapseTitle,
                  recordedLapses, setRecordedLapses,
                  selectedPresetId, setSelectedPresetId,
                  lapsePresets, setLapsePresets,
                  newPresetTitle, setNewPresetTitle,
                  newPresetMinutes, setNewPresetMinutes,
                  dueTodayHeight, setDueTodayHeight,
                  dueTodayLimit, setDueTodayLimit,
                  onSelectWorkspace,
                  theme
                })}
              </div>
            </div>
          );
        };

        const leftWidgets = widgets.filter(w => w.side === 'left');
        const rightWidgets = widgets.filter(w => w.side === 'right');
        const fullWidgets = widgets.filter(w => w.side === 'full');

        // Partition full width ones that render first vs last
        const firstFull = fullWidgets.filter(w => widgets.indexOf(w) < widgets.findIndex(x => x.side !== 'full'));
        const lastFull = fullWidgets.filter(w => !firstFull.includes(w));

        return (
          <div className="space-y-4">
            {/* Top Full Row */}
            {firstFull.length > 0 && (
              <div className="space-y-4">
                {firstFull.map(w => renderSingleWidget(w))}
              </div>
            )}

            {/* Split Column Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-start">
              {/* Left Column Stack */}
              <div className="space-y-4 flex flex-col">
                {leftWidgets.map(w => renderSingleWidget(w))}

                {/* Left empty slot drop/add card area */}
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverIndex !== -101) setDragOverIndex(-101);
                  }}
                  onDragLeave={() => {
                    if (dragOverIndex === -101) setDragOverIndex(null);
                  }}
                  onDrop={(e) => handleColumnDrop(e, 'left')}
                  className={`p-4 rounded-2xl border border-dashed transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] text-center ${
                    dragOverIndex === -101
                      ? 'border-amber-500/50 bg-zinc-900/50 scale-[0.99] opacity-100'
                      : 'border-white/5 bg-transparent opacity-25 hover:opacity-100 hover:border-white/10 hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1.5 pointer-events-none mb-1">
                    <Plus className="w-4 h-4 text-zinc-500" />
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider font-extrabold">Place / Add Left Card</span>
                    <p className="text-[8px] text-zinc-500 font-mono leading-tight max-w-[200px]">Drag any card here to place in left column, or toggle layout below</p>
                  </div>
                  {!customizeMode && (
                    <button
                      type="button"
                      onClick={() => setCustomizeMode(true)}
                      className="text-zinc-500 hover:text-zinc-300 transition-all font-mono text-[8px] bg-white/5 hover:bg-white/10 border border-white/5 py-0.5 px-2 rounded cursor-pointer uppercase active:scale-95"
                    >
                      Toggle Layout Settings
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column Stack */}
              <div className="space-y-4 flex flex-col">
                {rightWidgets.map(w => renderSingleWidget(w))}

                {/* Right empty slot drop/add card area */}
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverIndex !== -102) setDragOverIndex(-102);
                  }}
                  onDragLeave={() => {
                    if (dragOverIndex === -102) setDragOverIndex(null);
                  }}
                  onDrop={(e) => handleColumnDrop(e, 'right')}
                  className={`p-4 rounded-2xl border border-dashed transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] text-center ${
                    dragOverIndex === -102
                      ? 'border-amber-500/50 bg-zinc-900/50 scale-[0.99] opacity-100'
                      : 'border-white/5 bg-transparent opacity-25 hover:opacity-100 hover:border-white/10 hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1.5 pointer-events-none mb-1">
                    <Plus className="w-4 h-4 text-zinc-500" />
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider font-extrabold">Place / Add Right Card</span>
                    <p className="text-[8px] text-zinc-500 font-mono leading-tight max-w-[200px]">Drag any card here to place in right column, or toggle layout below</p>
                  </div>
                  {!customizeMode && (
                    <button
                      type="button"
                      onClick={() => setCustomizeMode(true)}
                      className="text-zinc-500 hover:text-zinc-300 transition-all font-mono text-[8px] bg-white/5 hover:bg-white/10 border border-white/5 py-0.5 px-2 rounded cursor-pointer uppercase active:scale-95"
                    >
                      Toggle Layout Settings
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Full Row */}
            {lastFull.length > 0 && (
              <div className="space-y-4">
                {lastFull.map(w => renderSingleWidget(w))}
              </div>
            )}
          </div>
        );
      })()}
        </>
      )}

      {/* Edit Sticky Note Modal Popup */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" id="edit-note-popup">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-zinc-900/50">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-[#daff33]" />
                <h3 className="text-xs font-extrabold uppercase font-mono tracking-widest text-[#daff33]">Edit Sticky Note</h3>
              </div>
              <button
                onClick={() => setEditingNote(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-left">
              {/* Note Title Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Note Title</label>
                <input
                  type="text"
                  value={editingNoteTitle}
                  onChange={(e) => setEditingNoteTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#daff33] font-sans h-9"
                  placeholder="e.g. Brainstorm idea"
                />
              </div>

              {/* Note Text Area */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Content Specification</label>
                <textarea
                  value={editingNoteText}
                  onChange={(e) => setEditingNoteText(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#daff33] font-sans resize-none"
                  placeholder="Type note description / contents here..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5 bg-zinc-900/50 gap-3">
              {/* Delete button */}
              <button
                onClick={() => handleDeleteNote(editingNote.id)}
                className="px-4 py-2 bg-red-500/10 hover:bg-[#ef4444]/20 text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/25 rounded-xl text-[10.5px] font-mono tracking-wider font-extrabold transition-all uppercase flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center space-x-2.5">
                {/* Cancel Button */}
                <button
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white rounded-xl text-[10.5px] font-mono tracking-wider font-extrabold transition-all uppercase cursor-pointer"
                >
                  Cancel
                </button>

                {/* Save Button */}
                <button
                  onClick={handleUpdateNote}
                  className="px-4 py-2 bg-[#daff33] hover:bg-[#c2ef00] text-black rounded-xl text-[10.5px] font-mono tracking-wider font-extrabold shadow-md transition-all uppercase cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderWidgetInner(widget: WidgetConfig, context: any) {
  const { 
    tasks, docs, workspaces, activeWorkspaceId, createTask, 
    accentColor, onChangeMenu, timerSeconds, setTimerSeconds, 
    timerActive, setTimerActive, notesFeed, quickNoteText, 
    setQuickNoteText, handleAddQuickNote, getDueTasks, calendarEvents, 
    addNotification, onEditTask,
    setEditingNote, setEditingNoteTitle, setEditingNoteText, handleDeleteNote,
    lapseTitle, setLapseTitle,
    recordedLapses, setRecordedLapses,
    selectedPresetId, setSelectedPresetId,
    lapsePresets, setLapsePresets,
    newPresetTitle, setNewPresetTitle,
    newPresetMinutes, setNewPresetMinutes,
    dueTodayHeight, setDueTodayHeight,
    dueTodayLimit, setDueTodayLimit,
    onSelectWorkspace,
    theme
  } = context;

  switch (widget.id) {
    case 'quick_actions':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <button
            onClick={() => createTask('Todo')}
            className="p-3.5 rounded-2xl bg-black/45 border border-white/5 hover:border-[#daff33]/40 transition-all hover:-translate-y-0.5 cursor-pointer text-left space-y-1 block leading-none"
          >
            <span className="text-lg">🎯</span>
            <span className="block text-xs font-bold text-white mt-1.5 font-sans leading-none">Add Task Ticket</span>
            <p className="text-[9.5px] text-zinc-500 font-sans leading-snug">Sprint backlog slot</p>
          </button>

          <button
            onClick={() => onChangeMenu('wiki')}
            className="p-3.5 rounded-2xl bg-black/45 border border-white/5 hover:border-purple-550/40 transition-all hover:-translate-y-0.5 cursor-pointer text-left space-y-1 block leading-none"
          >
            <span className="text-lg">📝</span>
            <span className="block text-xs font-bold text-white mt-1.5 font-sans leading-none">Draft Wiki Note</span>
            <p className="text-[9.5px] text-zinc-500 font-sans leading-snug font-sans">Specifications doc</p>
          </button>

          <button
            onClick={() => onChangeMenu('personal')}
            className="p-3.5 rounded-2xl bg-black/45 border border-white/5 hover:border-orange-550/40 transition-all hover:-translate-y-0.5 cursor-pointer text-left space-y-1 block leading-none"
          >
            <span className="text-lg">⏱️</span>
            <span className="block text-xs font-bold text-white mt-1.5 font-sans leading-none">Start Pomodoro</span>
            <p className="text-[9.5px] text-zinc-500 font-sans leading-snug">Activate concentration</p>
          </button>

          <button
            onClick={() => onChangeMenu('sticky_notes')}
            className="p-3.5 rounded-2xl bg-black/45 border border-white/5 hover:border-indigo-500/40 transition-all hover:-translate-y-0.5 cursor-pointer text-left space-y-1 block leading-none"
          >
            <span className="text-lg">🔖</span>
            <span className="block text-xs font-bold text-white mt-1.5 font-sans leading-none">New Sticky Note</span>
            <p className="text-[9.5px] text-zinc-500 font-sans leading-snug">Quick scratchpad</p>
          </button>
        </div>
      );

    case 'focus_timer':
      const formatMin = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      };

      const handleRecordLapse = () => {
        const activePreset = lapsePresets.find((p: any) => p.id === selectedPresetId);
        const presetSec = (activePreset ? activePreset.minutes : 25) * 60;
        const elapsedSec = Math.max(0, presetSec - timerSeconds);
        
        const formatSecs = (sec: number) => {
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        const newLapse = {
          id: `lapse-${Date.now()}`,
          title: lapseTitle.trim() || `Lapse #${recordedLapses.length + 1}`,
          remaining: formatSecs(timerSeconds),
          elapsed: formatSecs(elapsedSec),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        setRecordedLapses([newLapse, ...recordedLapses]);
        setLapseTitle('');
        addNotification('Lapse Logged', `Recorded lapse split point: "${newLapse.title}"`, 'info');
      };

      const handleStopTimer = () => {
        setTimerActive(false);
        const activePreset = lapsePresets.find((p: any) => p.id === selectedPresetId);
        setTimerSeconds((activePreset ? activePreset.minutes : 25) * 60);
        addNotification('Timer Stopped', 'Focus sprint reset to starting state.', 'info');
      };

      return (
        <div className="space-y-2.5">
          {/* Main Top timer readout */}
          <div className="flex items-center justify-between p-2.5 bg-black/45 border border-white/5 rounded-xl gap-3">
            <div className="block leading-none text-left">
              <span className="text-xl font-bold font-mono text-white select-all">{formatMin(timerSeconds)}</span>
              <span className="text-[8.5px] text-[#10B981] font-mono tracking-wider font-extrabold block mt-0.5 uppercase drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                {timerActive ? '⏱️ LAPSE RUNNING' : '⏱️ TIMEOUT'}
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setTimerActive(!timerActive)}
                className="py-1 px-2.5 rounded-md text-[9px] font-mono font-bold bg-[#10B981] text-black cursor-pointer uppercase shadow shadow-emerald-500/10 hover:bg-[#10B981]/90 active:scale-95 transition-all"
              >
                {timerActive ? 'PAUSE' : 'START'}
              </button>
              <button
                onClick={() => {
                  setTimerActive(false);
                  const activePreset = lapsePresets.find((p: any) => p.id === selectedPresetId);
                  setTimerSeconds((activePreset ? activePreset.minutes : 25) * 60);
                }}
                className="p-1 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 rounded-md text-zinc-400 hover:text-emerald-400 cursor-pointer transition-all active:scale-95"
                title="Reset to selected setting duration"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Action buttons section for Lapse, Pause, Stop */}
          <div className="space-y-2 p-2.5 bg-black/25 border border-white/[0.03] rounded-xl">
            {/* Input to mark name or title for the lapse */}
            <div className="space-y-0.5 block text-left">
              <label className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Lapse Title / Segment Tag</label>
              <input
                type="text"
                placeholder="Enter lapse title..."
                value={lapseTitle}
                onChange={(e) => setLapseTitle(e.target.value)}
                className="w-full bg-[#121214]/90 border border-white/5 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-emerald-500/50 font-sans"
              />
            </div>

            {/* Lapse, Pause, Stop Button row */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={handleRecordLapse}
                className="py-1 px-1.5 rounded-lg border border-white/5 hover:border-emerald-500/15 bg-white/[0.01] hover:bg-emerald-500/[0.03] text-[9px] font-mono font-bold text-zinc-300 hover:text-emerald-400 flex items-center justify-center space-x-1 transition-colors cursor-pointer uppercase"
                title="Record Lap/Lapse Split Point"
              >
                <span>⏱️ Time Lapse</span>
              </button>
              
              <button
                onClick={() => {
                  setTimerActive(false);
                  addNotification('Timer Paused', 'Focus interval suspended.', 'info');
                }}
                className="py-1 px-1.5 rounded-lg border border-white/5 hover:border-emerald-500/35 bg-white/[0.01] hover:bg-emerald-500/5 text-[9px] font-mono font-bold text-emerald-400 flex items-center justify-center space-x-1 transition-colors cursor-pointer uppercase"
                title="Pause active countdown"
              >
                <Pause className="w-2.5 h-2.5" />
                <span>Pause</span>
              </button>

              <button
                onClick={handleStopTimer}
                className="py-1 px-1.5 rounded-lg border border-[#ef4444]/15 hover:border-[#ef4444]/35 bg-[#ef4444]/5 hover:bg-[#ef4444]/10 text-[9px] font-mono font-bold text-[#ef4444] flex items-center justify-center space-x-1 transition-colors cursor-pointer uppercase"
                title="Stop & Reset entirely"
              >
                <div className="w-1.5 h-1.5 bg-[#ef4444] rounded" />
                <span>Stop</span>
              </button>
            </div>
          </div>

          {/* Preset Custom Lapse Settings manager */}
          <div className="border-t border-white/5 pt-2.5 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Lapse Presets & Interval Settings</span>
            </div>
            
            {/* Built-in & Custom settings quick loaded buttons */}
            <div className="flex flex-wrap gap-1">
              {lapsePresets.map((preset: any) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setTimerActive(false);
                      setTimerSeconds(preset.minutes * 60);
                      addNotification('Preset Loaded', `Loaded "${preset.title}" lapse duration.`, 'info');
                    }}
                    className={`px-1.5 py-0.5 rounded-lg border text-[9px] font-mono transition-all text-left flex items-center justify-between gap-1 cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-[#10B981] font-extrabold shadow-sm' 
                        : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <span>{preset.title}</span>
                    <span className="opacity-60 font-medium">({preset.minutes}m)</span>
                    {preset.id !== 'p-1' && preset.id !== 'p-2' && preset.id !== 'p-3' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLapsePresets(lapsePresets.filter((p: any) => p.id !== preset.id));
                          if (selectedPresetId === preset.id) {
                            setSelectedPresetId('p-1');
                            setTimerSeconds(25 * 60);
                          }
                        }}
                        className="p-0.5 hover:text-[#ef4444] text-zinc-500 transition-colors ml-0.5"
                        title="Remove custom setting"
                      >
                        <Trash className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Preset constructor */}
            <div className="bg-[#121214]/50 border border-white/5 p-2 rounded-xl space-y-1.5">
              <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider font-bold block">Configure Custom Lapse Goal</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Lapse Setting Name"
                  value={newPresetTitle}
                  onChange={(e) => setNewPresetTitle(e.target.value)}
                  className="flex-grow bg-black/40 border border-white/5 rounded-md px-1.5 py-0.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/40"
                />
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={newPresetMinutes}
                  onChange={(e) => setNewPresetMinutes(parseInt(e.target.value) || 1)}
                  className="w-10 bg-black/40 border border-white/5 rounded-md px-1 py-0.5 text-[10px] text-white text-center focus:outline-none"
                  title="Duration in minutes"
                />
                <button
                  onClick={() => {
                    if (!newPresetTitle.trim()) {
                      addNotification('Error', 'Please provide a name/title.', 'warning');
                      return;
                    }
                    const newPreset = {
                      id: `preset-${Date.now()}`,
                      title: newPresetTitle.trim(),
                      minutes: newPresetMinutes
                    };
                    setLapsePresets([...lapsePresets, newPreset]);
                    setNewPresetTitle('');
                    setNewPresetMinutes(25);
                    setSelectedPresetId(newPreset.id);
                    setTimerSeconds(newPreset.minutes * 60);
                    addNotification('Setting Added', `Saved setting "${newPreset.title}".`, 'info');
                  }}
                  className="p-1 px-2 rounded-md text-[9px] font-mono font-bold bg-[#10B981] text-black cursor-pointer hover:bg-[#10B981]/90 flex items-center gap-0.5 shrink-0"
                >
                  <Plus className="w-2.5 h-2.5 text-black" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* List of recorded splits */}
          {recordedLapses.length > 0 && (
            <div className="border-t border-white/5 pt-3.5 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Lapse Split Register</span>
                <button
                  onClick={() => {
                    setRecordedLapses([]);
                    addNotification('Splits Cleared', 'All saved splits removed.', 'info');
                  }}
                  className="text-[8px] font-mono text-[#ef4444] hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1.5 max-h-[110px] overflow-y-auto custom-scrollbar">
                {recordedLapses.map((lap: any) => (
                  <div key={lap.id} className="p-2 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
                    <div className="truncate leading-none">
                      <span className="text-[10px] font-bold text-white/95 truncate block">{lap.title}</span>
                      <span className="text-[8px] font-mono text-zinc-500 mt-0.5 block">Recorded at {lap.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 select-none text-[8.5px] font-mono">
                      <span className="px-1 py-0.5 rounded border border-indigo-500/10 text-indigo-400 bg-indigo-500/5">
                        Run: {lap.elapsed}
                      </span>
                      <span className="px-1 py-0.5 rounded border border-white/5 text-zinc-400 bg-white/[0.01]">
                        Left: {lap.remaining}
                      </span>
                      <button
                        onClick={() => setRecordedLapses(recordedLapses.filter((l: any) => l.id !== lap.id))}
                        className="p-1 text-zinc-600 hover:text-[#ef4444] transition-colors cursor-pointer"
                        title="Delete split snapshot"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 'due_today':
      const due = getDueTasks();
      return (
        <div className="space-y-3.5 text-left flex flex-col h-full justify-between">
          <div 
            className="space-y-1.5 overflow-y-auto custom-scrollbar flex-grow pr-1"
            style={{ height: `${dueTodayHeight}px`, maxHeight: '420px' }}
          >
            {due.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-5">
                <span className="text-xl mb-1 select-none">✨</span>
                <p className="text-[10.5px] text-zinc-500 italic">No milestones due today.</p>
              </div>
            ) : (
              due.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => onEditTask?.(t)}
                  className="p-2.5 bg-black/45 border border-white/5 hover:border-white/10 rounded-xl flex justify-between items-center cursor-pointer group transition-all"
                >
                  <div className="truncate leading-none">
                    <span className="text-xs font-bold text-white/95 truncate block">{t.title}</span>
                    <span className="text-[9.5px] text-zinc-500 font-mono mt-1.5 block">Assignee: {t.assignee || 'Unassigned'}</span>
                  </div>
                  <span className={`text-[8.5px] font-mono border px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                    t.priority === 'High' ? 'border-red-500/20 text-red-500 bg-red-500/5' :
                    'border-zinc-700 text-zinc-400 bg-white/5'
                  }`}>{t.priority}</span>
                </div>
              ))
            )}
          </div>

          {/* Dynamic adjustment footer sliders */}
          <div className="mt-2 pt-3 border-t border-white/5 bg-black/20 p-2.5 rounded-2xl space-y-2 select-none">
            <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-wider text-zinc-400">
              <span className="font-bold">📏 Height & Spacing Control</span>
              <button 
                onClick={() => {
                  setDueTodayHeight(140);
                  setDueTodayLimit(5);
                }}
                className="text-amber-500/80 hover:text-amber-400 hover:underline cursor-pointer transition-colors"
                title="Reset to default spacing settings"
              >
                Reset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[9px] font-mono text-zinc-500">
              <div className="flex items-center justify-between gap-2.5">
                <span className="shrink-0">Height: <strong className="text-white font-bold">{dueTodayHeight}px</strong></span>
                <input 
                  type="range" 
                  min="60" 
                  max="350" 
                  step="10"
                  value={dueTodayHeight} 
                  onChange={(e) => setDueTodayHeight(parseInt(e.target.value))}
                  className="flex-grow accent-amber-400 h-1 rounded bg-zinc-800 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between gap-2.5">
                <span className="shrink-0">Capacity: <strong className="text-white font-bold">{dueTodayLimit}</strong></span>
                <input 
                  type="range" 
                  min="2" 
                  max="10" 
                  step="1"
                  value={dueTodayLimit} 
                  onChange={(e) => setDueTodayLimit(parseInt(e.target.value))}
                  className="flex-grow accent-amber-400 h-1 rounded bg-zinc-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      );

    case 'project_health': {
      const totalTasks = (tasks || []).length;
      const doneTasks = (tasks || []).filter(t => t.status === 'Done').length;
      const inProgressTasks = (tasks || []).filter(t => t.status === 'InProgress').length;

      // Flow Efficiency: percentage of active tasks completed vs in-progress setup
      const activeTasks = (tasks || []).filter(t => t.status !== 'Backlog');
      const activeTotal = activeTasks.length;
      const activeDone = activeTasks.filter(t => t.status === 'Done').length;
      const activeInProgress = activeTasks.filter(t => t.status === 'InProgress').length;
      
      const flowEfficiency = activeTotal > 0 
        ? Math.round(((activeDone + activeInProgress * 0.5) / activeTotal) * 100) 
        : 100; // Pristine 100% when there are no active tasks to block momentum

      // SaaS Velocity: ratio of Done tasks to total tasks scaling to 100
      const saasVelocity = totalTasks > 0 
        ? Math.round((doneTasks / totalTasks) * 100) 
        : 100; // Pristine 100 on empty board

      return (
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-black/45 border border-white/5 rounded-2xl block leading-snug space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold font-mono text-emerald-400">{flowEfficiency}%</span>
              <span className="text-[9px] font-mono text-zinc-550">{activeDone}/{activeTotal} active</span>
            </div>
            <span className="block text-[9.5px] uppercase font-mono tracking-wider text-zinc-500">Flow Efficiency</span>
            {/* Elegant micro progress bar */}
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${flowEfficiency}%` }} 
              />
            </div>
          </div>
          <div className="p-3 bg-black/45 border border-white/5 rounded-2xl block leading-snug space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold font-mono text-sky-400">{saasVelocity} / 100</span>
              <span className="text-[9px] font-mono text-zinc-550">{doneTasks}/{totalTasks} total</span>
            </div>
            <span className="block text-[9.5px] uppercase font-mono tracking-wider text-zinc-500">SaaS velocity</span>
            {/* Elegant micro progress bar */}
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="bg-sky-400 h-full transition-all duration-500" 
                style={{ width: `${saasVelocity}%` }} 
              />
            </div>
          </div>
        </div>
      );
    }

    case 'active_projects':
      return (
        <div className="grid grid-cols-2 gap-2 text-left text-xs font-semibold">
          {workspaces.slice(0, 4).map(ws => {
            const isCurrent = ws.id === activeWorkspaceId;
            return (
              <button
                key={ws.id}
                type="button"
                id={`ws-switch-btn-${ws.id}`}
                onClick={() => {
                  if (onSelectWorkspace) {
                    onSelectWorkspace(ws.id);
                    addNotification('Workspace Switched', `Switched active space to "${ws.name}"`, 'success');
                  }
                }}
                className={`p-3 rounded-xl transition-all duration-200 text-left cursor-pointer border relative overflow-hidden group/ws-btn w-full block ${
                  isCurrent 
                    ? 'bg-white/10 shadow-inner' 
                    : 'bg-black/45 border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                }`}
                style={{
                  borderColor: isCurrent ? `${accentColor}50` : undefined
                }}
              >
                {/* Visual Accent indicator left line */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all`}
                  style={{
                    backgroundColor: isCurrent ? accentColor : 'transparent'
                  }}
                />
                <div className="pl-1.5 truncate">
                  <span className={`font-bold block truncate transition-colors ${
                    isCurrent ? 'text-white font-extrabold' : 'text-zinc-300 group-hover/ws-btn:text-white'
                  }`}>
                    {ws.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      );

    case 'team_status':
      return (
        <div className="space-y-2 text-left">
          {[
            { name: 'Elena Rostova', status: 'Online', task: 'Validating Gemini Rest Schema' },
            { name: 'Marcus Vance', status: 'Busy', task: 'Figma token coordinate review' }
          ].map(user => (
            <div key={user.name} className="flex justify-between items-center p-2 bg-black/45 border border-white/5 rounded-xl text-xs gap-3">
              <div className="truncate block leading-tight">
                <span className="font-bold text-white block">{user.name}</span>
                <span className="text-[9px] text-[#a1a1aa] truncate block leading-none mt-0.5 italic">{user.task}</span>
              </div>
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                user.status === 'Online' ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
            </div>
          ))}
        </div>
      );

    case 'recent_notes':
      return (
        <div className="space-y-3.5 text-left">
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Jot down brief scratchpad item..."
              value={quickNoteText}
              onChange={(e) => setQuickNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddQuickNote();
                }
              }}
              className="flex-grow text-xs px-2.5 py-1 bg-black border border-white/10 rounded-lg text-white focus:outline-none placeholder-zinc-650 h-8 font-sans"
            />
            <button
              onClick={handleAddQuickNote}
              className="px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10.5px] font-mono cursor-pointer"
            >
              SAVE
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {notesFeed.length === 0 ? (
              <p className="text-[10px] text-zinc-500 italic py-3 text-center">No active stickies. Create one above!</p>
            ) : (
              notesFeed.slice(0, 8).map(n => (
                <div 
                  key={n.id} 
                  onClick={() => {
                    setEditingNote(n);
                    setEditingNoteTitle(n.title || '');
                    setEditingNoteText(n.text || '');
                  }}
                  className="p-2.5 bg-black/30 border border-white/5 hover:border-white/15 rounded-xl text-[10.5px] block leading-tight hover:bg-white/[0.02] transition-all cursor-pointer group relative"
                >
                  <div className="flex items-start justify-between mr-16">
                    <span className="font-bold text-white block truncate">{n.title || 'Quick Scratchpad'}</span>
                  </div>
                  <p className="text-zinc-400 line-clamp-2 italic mt-1 font-sans mb-1 pr-12">{n.text}</p>
                  
                  {/* Hover Actions Tray */}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 border border-white/10 rounded-md p-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNote(n);
                        setEditingNoteTitle(n.title || '');
                        setEditingNoteText(n.text || '');
                      }}
                      className="text-zinc-400 hover:text-[#daff33] p-0.5 rounded cursor-pointer transition-colors"
                      title="Edit Note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(n.id);
                      }}
                      className="text-zinc-400 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );

    case 'calendar_events':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {calendarEvents.map((ev, i) => (
            <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-2xl block space-y-1">
              <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">{ev.date}</span>
              <h4 className="text-xs font-bold text-white leading-tight line-clamp-2">{ev.title}</h4>
              <span className="text-[9px] text-zinc-500 font-sans block pt-1">Lead: {ev.lead}</span>
            </div>
          ))}
        </div>
      );

    default:
      return <div className="text-zinc-500 italic select-none">No widget configuration found.</div>;
  }
}
