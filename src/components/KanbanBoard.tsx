import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Layers, Briefcase, Activity, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, AlertCircle, Archive, RotateCcw, Trash2, ArrowUpDown, Undo, Redo, Calendar } from 'lucide-react';
import { Task, Theme } from '../types';
import { useAppStore } from '../store';

function renderEmptyIllustration(status: Task['status']) {
  if (status === 'Backlog') {
    return (
      <svg className="w-16 h-16 mx-auto mb-2 text-indigo-400/40" viewBox="0 0 64 64" fill="none" stroke="currentColor">
        <rect x="12" y="10" width="40" height="10" rx="2" strokeWidth="1.5" className="stroke-indigo-500/30" />
        <line x1="18" y1="15" x2="30" y2="15" strokeWidth="1.5" strokeLinecap="round" className="stroke-indigo-400" />
        <circle cx="44" cy="15" r="1.5" className="fill-indigo-400" />
        
        <rect x="12" y="26" width="40" height="10" rx="2" strokeWidth="1.5" className="stroke-white/10" />
        <line x1="18" y1="31" x2="26" y2="31" strokeWidth="1.5" strokeLinecap="round" className="stroke-white/30" />
        <circle cx="44" cy="31" r="1.5" className="fill-white/30" />

        <rect x="12" y="42" width="40" height="10" rx="2" strokeWidth="1.5" className="stroke-white/5" strokeDasharray="3 3"/>
        <line x1="18" y1="47" x2="34" y2="47" strokeWidth="1.5" strokeLinecap="round" className="stroke-white/10" />
        
        <path d="M6,15 L10,15" strokeWidth="1" strokeDasharray="2 2" className="stroke-white/20" />
        <path d="M54,31 L58,31" strokeWidth="1" strokeDasharray="2 2" className="stroke-white/20" />
      </svg>
    );
  }
  if (status === 'Todo') {
    return (
      <svg className="w-16 h-16 mx-auto mb-2 text-amber-400/40" viewBox="0 0 64 64" fill="none" stroke="currentColor">
        <circle cx="32" cy="32" r="22" strokeWidth="1" className="stroke-white/10" strokeDasharray="3 3" />
        <circle cx="32" cy="32" r="14" strokeWidth="1.5" className="stroke-amber-500/20" />
        <circle cx="32" cy="32" r="4" strokeWidth="1.5" className="stroke-amber-400 fill-amber-500/10" />
        
        <line x1="32" y1="4" x2="32" y2="60" strokeWidth="1" strokeDasharray="4 4" className="stroke-white/10" />
        <line x1="4" y1="32" x2="60" y2="32" strokeWidth="1" strokeDasharray="4 4" className="stroke-white/10" />
        
        <path d="M12,12 L18,12 M12,12 L12,18" strokeWidth="1.5" strokeLinecap="round" className="stroke-white/30" />
        <path d="M52,12 L46,12 M52,12 L52,18" strokeWidth="1.5" strokeLinecap="round" className="stroke-white/30" />
        <path d="M52,52 L46,52 M52,52 L52,46" strokeWidth="1.5" strokeLinecap="round" className="stroke-white/30" />
        <path d="M12,52 L18,52 M12,52 L12,46" strokeWidth="1.5" strokeLinecap="round" className="stroke-white/30" />
      </svg>
    );
  }
  if (status === 'InProgress') {
    return (
      <svg className="w-16 h-16 mx-auto mb-2 text-indigo-400/40" viewBox="0 0 64 64" fill="none" stroke="currentColor">
        <circle cx="32" cy="32" r="18" strokeWidth="1.5" className="stroke-indigo-500/10" />
        <path d="M14,32 A18,18 0 1,1 50,32" strokeWidth="1.5" className="stroke-indigo-400/50" strokeDasharray="5 3" />
        
        <circle cx="50" cy="32" r="3" className="fill-indigo-400" />
        
        <path d="M22,28 L27,33 L32,25 L37,35 L42,31" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-white/40" />
        <circle cx="32" cy="32" r="26" strokeWidth="1" className="stroke-white/5" strokeDasharray="4 6" />
      </svg>
    );
  }
  return (
    <svg className="w-16 h-16 mx-auto mb-2 text-emerald-400/40" viewBox="0 0 64 64" fill="none" stroke="currentColor">
      <path d="M32,8 L54,20 L54,44 L32,56 L10,44 L10,20 Z" strokeWidth="1.5" className="stroke-emerald-500/20" strokeLinejoin="round" />
      <path d="M32,8 L32,56" strokeWidth="1.5" className="stroke-emerald-500/10" />
      <path d="M10,20 L32,32 L54,20" strokeWidth="1.5" className="stroke-emerald-400/30" strokeLinejoin="round" />
      <path d="M10,44 L32,32 L54,44" strokeWidth="1" strokeDasharray="2 2" className="stroke-white/10" strokeLinejoin="round" />
      
      <circle cx="32" cy="32" r="9" className="fill-[#08080A] stroke-emerald-400/60" strokeWidth="1.5" />
      <path d="M28,32 L31,35 L36,29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-400" />
    </svg>
  );
}

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onCreateTask: (status: Task['status']) => void;
  onSetTaskStatus: (taskId: string, status: Task['status']) => void;
  onRestoreTask?: (taskId: string) => void;
  onReorderTasks?: (tasks: Task[]) => void;
  theme: Theme;
  statusSpotlight?: 'All' | 'Backlog' | 'Todo' | 'InProgress' | 'Done';
  onSetStatusSpotlight?: (status: 'All' | 'Backlog' | 'Todo' | 'InProgress' | 'Done') => void;
}

export default function KanbanBoard({
  tasks: propTasks,
  onEditTask,
  onCreateTask,
  onSetTaskStatus,
  onRestoreTask,
  onReorderTasks,
  theme,
  statusSpotlight = 'All',
  onSetStatusSpotlight,
}: KanbanBoardProps) {
  const storeTasks = useAppStore(state => state.tasks);
  const storeShowArchived = useAppStore(state => state.showArchived);
  const storeSetShowArchived = useAppStore(state => state.setShowArchived);
  const storeRestoreTask = useAppStore(state => state.restoreTask);
  const storeReorderTask = useAppStore(state => state.reorderTasks);

  const [localShowArchived, setLocalShowArchived] = useState(false);

  // Fallback to store showArchived if available, else local state
  const showArchived = storeShowArchived !== undefined ? storeShowArchived : localShowArchived;
  const setShowArchived = storeSetShowArchived !== undefined ? storeSetShowArchived : setLocalShowArchived;

  const handleRestore = (taskId: string) => {
    if (onRestoreTask) {
      onRestoreTask(taskId);
    } else {
      storeRestoreTask(taskId);
    }
  };

  const handleReorderTasks = (newTasks: Task[]) => {
    if (onReorderTasks) {
      onReorderTasks(newTasks);
    } else {
      storeReorderTask(newTasks);
    }
  };

  // Always use the props tasks to keep Kanban board in sync with dashboard widgets
  const tasks = propTasks;

  const [layout, setLayout] = useState<'kanban' | 'list' | 'timeline' | 'calendar'>('kanban');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [labelFilter, setLabelFilter] = useState<string>('All');

  // Calendar View States
  const [calendarYear, setCalendarYear] = useState<number>(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(() => new Date().getMonth());
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeScheduleTask, setActiveScheduleTask] = useState<Task | null>(null);

  // Helper to format Date target as YYYY-MM-DD
  const formatDateString = (dateObj: Date) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper to fetch padded list of 42 calendar grid days
  const getDaysInMonth = (year: number, month: number) => {
    const days: Date[] = [];
    // First day of target month
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Previous Month padded days
    const prevMonthLast = new Date(year, month, 0);
    const prevMonthDaysCount = prevMonthLast.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthDaysCount - i));
    }
    
    // Current Month days
    const currentMonthLast = new Date(year, month + 1, 0);
    const currentMonthDaysCount = currentMonthLast.getDate();
    for (let i = 1; i <= currentMonthDaysCount; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Next Month padded days (make 42 cells total for even 6 rows)
    const totalCells = 42;
    const paddingCount = totalCells - days.length;
    for (let i = 1; i <= paddingCount; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDropOnDate = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      const updatedTasks = tasks.map(t => t.id === id ? { ...t, dueDate: dateStr } : t);
      handleReorderTasks(updatedTasks);
      const affectedTask = tasks.find(t => t.id === id);
      if (affectedTask) {
        useAppStore.getState().addNotification(
          'Task Rescheduled',
          `"${affectedTask.title}" has been moved to ${dateStr}.`,
          'task'
        );
      }
    }
  };

  const handleCreateTaskForDate = (dateStr: string) => {
    const newTask: Task = {
      id: `task-gen-${Date.now()}`,
      title: 'New Scheduled Task',
      status: 'Todo',
      priority: 'Medium',
      label: 'Engineering',
      description: 'Scheduled via calendar layout.',
      assignee: 'Alex Chen',
      dueDate: dateStr,
      archived: false,
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    handleReorderTasks([newTask, ...tasks]);
    onEditTask(newTask); // Automatically open the edit modal to set its title or details
    useAppStore.getState().addNotification('Task Added', `New task scheduled for ${dateStr}`, 'task');
  };

  const toggleTaskStatus = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering edit modal
    const nextStatus: Task['status'] = task.status === 'Done' ? 'Todo' : 'Done';
    const updated = tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t);
    handleReorderTasks(updated);
    useAppStore.getState().addNotification(
      nextStatus === 'Done' ? 'Task Finished' : 'Task Opened',
      `"${task.title}" status changed to ${nextStatus}.`,
      'task'
    );
  };

  const moveTaskToNextWeek = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    let baseDate = new Date();
    if (task.dueDate) {
      try {
        baseDate = new Date(task.dueDate);
      } catch (err) {}
    }
    // Add 7 days
    baseDate.setDate(baseDate.getDate() + 7);
    const newDateStr = formatDateString(baseDate);
    const updated = tasks.map(t => t.id === task.id ? { ...t, dueDate: newDateStr } : t);
    handleReorderTasks(updated);
    useAppStore.getState().addNotification(
      'Task Postponed',
      `"${task.title}" rescheduled for next week (${newDateStr}).`,
      'task'
    );
  };
  
  // Sorting, Undo / Redo states
  const [sortBy, setSortBy] = useState<'None' | 'Priority' | 'DueDate' | 'CreationDate'>('None');
  const [past, setPast] = useState<Task[][]>([]);
  const [future, setFuture] = useState<Task[][]>([]);

  // Track workspace switches to clear history
  const prevTaskIdsRef = useRef<string>('');
  useEffect(() => {
    const currentIds = tasks.map(t => t.id).sort().join(',');
    const oldIds = prevTaskIdsRef.current.split(',').filter(Boolean);
    const isWorkspaceSwitch = oldIds.length > 0 && tasks.length > 0 && !tasks.some(t => oldIds.includes(t.id));
    if (isWorkspaceSwitch) {
      setPast([]);
      setFuture([]);
    }
    prevTaskIdsRef.current = currentIds;
  }, [tasks]);

  const saveStateToHistory = () => {
    setPast(prev => [...prev, tasks]);
    setFuture([]); // Clear redo stack on new action
  };

  const handleUndo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setPast(newPast);
    setFuture(prev => [tasks, ...prev]);
    handleReorderTasks(previous);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setFuture(newFuture);
    setPast(prev => [...prev, tasks]);
    handleReorderTasks(next);
  };

  // Keyboard listeners for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [past, future, tasks]);

  // Grouping, collapse & multi-select states
  const [groupBy, setGroupBy] = useState<'None' | 'Priority' | 'Assignee'>('None');
  const [collapsedColumns, setCollapsedColumns] = useState<Record<Task['status'], boolean>>({
    Backlog: false,
    Todo: false,
    InProgress: false,
    Done: false,
  });
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const toggleColumnCollapse = (status: Task['status']) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const handleBulkMove = (status: Task['status']) => {
    saveStateToHistory();
    const updated = tasks.map(t => selectedTaskIds.includes(t.id) ? { ...t, status } : t);
    handleReorderTasks(updated);
    setSelectedTaskIds([]);
  };

  const handleBulkAssign = (assignee: string) => {
    saveStateToHistory();
    const targetAssignee = assignee === 'Unassigned' ? '' : assignee;
    const updated = tasks.map(t => selectedTaskIds.includes(t.id) ? { ...t, assignee: targetAssignee } : t);
    handleReorderTasks(updated);
    setSelectedTaskIds([]);
  };

  const handleBulkPriority = (priority: 'High' | 'Medium' | 'Low') => {
    saveStateToHistory();
    const updated = tasks.map(t => selectedTaskIds.includes(t.id) ? { ...t, priority } : t);
    handleReorderTasks(updated);
    setSelectedTaskIds([]);
  };

  const handleBulkArchive = () => {
    saveStateToHistory();
    selectedTaskIds.forEach(id => {
      const target = tasks.find(t => t.id === id);
      if (target) {
        useAppStore.getState().addToTrash({
          id: target.id,
          type: 'task',
          title: target.title || 'Untitled Kanban Task',
          originalData: target
        });
      }
    });
    const updated = tasks.map(t => selectedTaskIds.includes(t.id) ? { ...t, archived: true } : t);
    handleReorderTasks(updated);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    saveStateToHistory();
    selectedTaskIds.forEach(id => {
      const target = tasks.find(t => t.id === id);
      if (target) {
        useAppStore.getState().addToTrash({
          id: target.id,
          type: 'task',
          title: target.title || 'Untitled Kanban Task',
          originalData: target
        });
      }
    });
    const updated = tasks.filter(t => !selectedTaskIds.includes(t.id));
    handleReorderTasks(updated);
    setSelectedTaskIds([]);
  };

  const handleLaneDrop = (e: React.DragEvent, status: Task['status'], priority: 'High' | 'Medium' | 'Low') => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const taskToMove = tasks.find(t => t.id === taskId);
      if (taskToMove) {
        saveStateToHistory();
        const remaining = tasks.filter(t => t.id !== taskId);
        const updated = [...remaining, { ...taskToMove, status, priority }];
        handleReorderTasks(updated);
        onSetTaskStatus(taskId, status);
      }
    }
  };

  const handleAssigneeDrop = (e: React.DragEvent, status: Task['status'], assignee: string) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const taskToMove = tasks.find(t => t.id === taskId);
      if (taskToMove) {
        saveStateToHistory();
        const remaining = tasks.filter(t => t.id !== taskId);
        const targetAssignee = assignee === 'Unassigned' ? '' : assignee;
        const updated = [...remaining, { ...taskToMove, status, assignee: targetAssignee }];
        handleReorderTasks(updated);
        onSetTaskStatus(taskId, status);
      }
    }
  };
  
  // Floating dock filter states
  const [filterAssignedToMe, setFilterAssignedToMe] = useState(false);
  const [filterUpcoming, setFilterUpcoming] = useState(false);

  // Move task status programmatically
  const stepStatus = (taskId: string, direction: 'forward' | 'backward') => {
    const statuses: Task['status'][] = ['Backlog', 'Todo', 'InProgress', 'Done'];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const curIdx = statuses.indexOf(task.status);
    let nextIdx = curIdx + (direction === 'forward' ? 1 : -1);
    if (nextIdx >= 0 && nextIdx < statuses.length) {
      saveStateToHistory();
      onSetTaskStatus(taskId, statuses[nextIdx]);
    }
  };

  const handleReorder = (draggedId: string, overId: string, overStatus: Task['status']) => {
    const taskToMove = tasks.find(t => t.id === draggedId);
    const targetTask = tasks.find(t => t.id === overId);
    if (!taskToMove) return;

    saveStateToHistory();
    if (taskToMove.status !== overStatus) {
      onSetTaskStatus(draggedId, overStatus);
    }

    let updatedPriority = taskToMove.priority;
    let updatedAssignee = taskToMove.assignee;

    if (targetTask) {
      if (groupBy === 'Priority') {
        updatedPriority = targetTask.priority;
      } else if (groupBy === 'Assignee') {
        updatedAssignee = targetTask.assignee;
      }
    }

    const remainingTasks = tasks.filter(t => t.id !== draggedId);
    const overIdx = remainingTasks.findIndex(t => t.id === overId);
    if (overIdx === -1) {
      const updated = [...remainingTasks, { ...taskToMove, status: overStatus, priority: updatedPriority, assignee: updatedAssignee }];
      handleReorderTasks(updated);
      return;
    }

    const updated = [...remainingTasks];
    updated.splice(overIdx, 0, { ...taskToMove, status: overStatus, priority: updatedPriority, assignee: updatedAssignee });
    handleReorderTasks(updated);
  };

  const renderCard = (t: Task, status: Task['status']) => {
    const isSelected = selectedTaskIds.includes(t.id);
    const handleCheckboxClick = (e: React.MouseEvent, taskId: string) => {
      e.stopPropagation();
      setSelectedTaskIds(prev => 
        prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
      );
    };

    return (
      <div
        key={t.id}
        draggable={true}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', t.id);
          e.currentTarget.classList.add('opacity-30');
        }}
        onDragEnd={(e) => {
          e.currentTarget.classList.remove('opacity-30');
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.add('border-t-2', 'border-t-indigo-500', 'scale-[1.01]', 'bg-white/[0.03]');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('border-t-2', 'border-t-indigo-500', 'scale-[1.01]', 'bg-white/[0.03]');
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.remove('border-t-2', 'border-t-indigo-500', 'scale-[1.01]', 'bg-white/[0.03]');
          const draggedId = e.dataTransfer.getData('text/plain');
          if (draggedId && draggedId !== t.id) {
            handleReorder(draggedId, t.id, status);
          }
        }}
        onClick={() => onEditTask(t)}
        className={`p-3.5 rounded-2xl bg-[#0e0e11] bg-0e0e11 border border-white/5 border-white-5 hover:border-indigo-500/50 hover:border-indigo-500-50 hover:bg-white/[0.02] hover:bg-white-0.02 cursor-grab active:cursor-grabbing active-cursor-grabbing transition-all space-y-2 text-xs relative group shadow-sm ${
          isSelected ? 'border-indigo-500 bg-indigo-500/[0.03] shadow-md shadow-indigo-500/5' : ''
        }`}
      >
        <div className="flex items-start space-x-2">
          {/* Custom style Checkbox */}
          <div 
            onClick={(e) => handleCheckboxClick(e, t.id)}
            className={`mt-0.5 w-3.5 h-3.5 flex items-center justify-center rounded border transition-all cursor-pointer shrink-0 ${
              isSelected 
                ? 'bg-indigo-500 border-indigo-400 text-white shadow-sm shadow-indigo-500/20' 
                : 'border-white/15 bg-white/5 hover:border-indigo-500/40'
            }`}
          >
            {isSelected && (
              <svg className="w-2.5 h-2.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
          <p className="font-semibold text-white/95 leading-snug tracking-tight text-[12px] flex-1">{t.title}</p>
        </div>

        <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed pl-[22px]">{t.description}</p>
        
        <div className="flex items-center justify-between pt-1 pl-[22px]">
          <div className="flex flex-wrap items-center gap-1.55">
            <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/5 text-white/50 font-medium">{t.label}</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              t.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
              t.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
              'bg-white/5 text-white/40 border border-white/5'
            } border`}>
              {t.priority}
            </span>
            {!!(t as any).archived && (
              <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Archived</span>
            )}
          </div>
          <span className="text-[9.5px] text-white/40 font-mono text-right">{t.assignee}</span>
        </div>

        {/* Interactive Move Arrows or Restore Controls */}
        <div className={`absolute right-2 top-2 flex space-x-0.5 ${ (t as any).archived ? 'opacity-100' : 'opacity-0 group-hover:opacity-100' } transition-opacity`}>
          {!!(t as any).archived ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                saveStateToHistory();
                handleRestore(t.id);
              }}
              className="p-1 px-2 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/25 rounded-lg text-[9px] font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Restore to active board"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>RESTORE</span>
            </button>
          ) : (
            <>
              {status !== 'Done' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveStateToHistory();
                    onSetTaskStatus(t.id, 'Done');
                  }}
                  className="p-1 px-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-lg text-[9px] font-bold flex items-center space-x-1 transition-all"
                  title="Mark finished"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>DONE</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stepStatus(t.id, 'backward');
                }}
                className="p-1 bg-white/10 hover:bg-white/20 rounded-md text-white/60 hover:text-white"
                title="Move back"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stepStatus(t.id, 'forward');
                }}
                className="p-1 bg-white/10 hover:bg-white/20 rounded-md text-white/60 hover:text-white"
                title="Move branch ahead"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Get distinct tags
  const distinctLabels = Array.from(new Set(tasks.map(t => t.label).filter(Boolean)));

  // Filter tasks including soft-delete/archive filter & custom quick filters
  const filteredTasks = tasks.filter(t => {
    // Soft-delete: show ONLY archived if showArchived is true, otherwise show ONLY active
    const matchesArchived = showArchived ? !!(t as any).archived : !(t as any).archived;
    if (!matchesArchived) return false;

    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesLabel = labelFilter === 'All' || t.label === labelFilter;

    // Quick filter: Assigned to me (Alex Chen or You)
    let matchesMe = true;
    if (filterAssignedToMe) {
      const assigneeName = (t.assignee || '').toLowerCase();
      matchesMe = assigneeName === 'alex chen' || assigneeName === 'you';
    }

    // Quick filter: Upcoming due dates (within next 7 days from May 23, 2026)
    let matchesUpcoming = true;
    if (filterUpcoming) {
      if (!t.dueDate) {
        matchesUpcoming = false;
      } else {
        try {
          const today = new Date('2026-05-23');
          today.setHours(0, 0, 0, 0);
          const duedate = new Date(t.dueDate);
          duedate.setHours(0, 0, 0, 0);
          const diffTime = duedate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          // If due date is in the future and within 7 days, or today
          matchesUpcoming = diffDays >= 0 && diffDays <= 7;
        } catch (e) {
          matchesUpcoming = false;
        }
      }
    }

    return matchesSearch && matchesPriority && matchesLabel && matchesMe && matchesUpcoming;
  });

  const getSortedTasks = (tasksList: Task[]) => {
    const sorted = [...tasksList];
    if (sortBy === 'None') return sorted;
    
    if (sortBy === 'Priority') {
      const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return sorted.sort((a, b) => {
        const wA = priorityWeight[a.priority || 'Low'] || 0;
        const wB = priorityWeight[b.priority || 'Low'] || 0;
        return wB - wA; // High priority first
      });
    }
    
    if (sortBy === 'DueDate') {
      return sorted.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const tA = new Date(a.dueDate).getTime();
        const tB = new Date(b.dueDate).getTime();
        return tA - tB; // Sooner date first
      });
    }

    if (sortBy === 'CreationDate') {
      const getCreationValue = (t: Task) => {
        if (t.id.startsWith('task-new-')) {
          const ts = parseInt(t.id.replace('task-new-', ''));
          return isNaN(ts) ? 9999999999999 : ts;
        }
        if (t.id.startsWith('t') && !isNaN(parseInt(t.id.substring(1)))) {
          return parseInt(t.id.substring(1));
        }
        if ((t as any).createdAt) {
          return new Date((t as any).createdAt).getTime();
        }
        return 0; // Default
      };
      return sorted.sort((a, b) => getCreationValue(a) - getCreationValue(b)); // Oldest first
    }
    
    return sorted;
  };

  const sortedFilteredTasks = getSortedTasks(filteredTasks);

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between pb-4 gap-4 border-b border-white/5">
        <div className="space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-wider flex items-center space-x-2 text-[#EDEDED]">
            <span>{showArchived ? 'Archived Sprint Issues' : 'Active Sprint Board'}</span>
            <span className={`text-[10px] ${showArchived ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} border px-2 py-0.5 rounded uppercase font-mono`}>
              {showArchived ? 'Archive Registry' : 'Live Registry'} ({filteredTasks.length} Issues)
            </span>
          </h2>
          <p className="text-xs text-white/40 leading-tight">
            {showArchived ? 'Soft-deleted historical issues. Re-verify coordinates or restore active state.' : 'Design pipeline limits. Pull or drag tasks into corresponding status columns.'}
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/30" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs h-8 pl-8 pr-3 rounded-full bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Filter Priority */}
          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-full px-3 h-8 text-[11px] text-white/60">
            <Filter className="w-3 h-3 text-white/30" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-transparent border-0 focus:ring-0 p-0 text-white select-none text-[11px] cursor-pointer outline-none"
            >
              <option value="All" className="bg-[#0C0C0C] text-white">All Priorities</option>
              <option value="High" className="bg-[#0C0C0C] text-red-400">High Only</option>
              <option value="Medium" className="bg-[#0C0C0C] text-amber-400">Medium Only</option>
              <option value="Low" className="bg-[#0C0C0C] text-zinc-400">Low Only</option>
            </select>
          </div>

          {/* Filter Labels */}
          {distinctLabels.length > 0 && (
            <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-full px-3 h-8 text-[11px] text-white/60">
              <select
                value={labelFilter}
                onChange={(e) => setLabelFilter(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 p-0 text-white select-none text-[11px] cursor-pointer outline-none"
              >
                <option value="All" className="bg-[#0C0C0C] text-white">All Labels</option>
                {distinctLabels.map(lbl => (
                  <option key={lbl} value={lbl} className="bg-[#0C0C0C] text-white">{lbl}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-full px-3 h-8 text-[11px] text-white/60">
            <ArrowUpDown className="w-3 h-3 text-white/30" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-0 focus:ring-0 p-0 text-white select-none text-[11px] cursor-pointer outline-none font-bold"
            >
              <option value="None" className="bg-[#0C0C0C] text-zinc-400">Sort: Default</option>
              <option value="Priority" className="bg-[#0C0C0C] text-white">Sort: Priority</option>
              <option value="DueDate" className="bg-[#0C0C0C] text-white">Sort: Due Date</option>
              <option value="CreationDate" className="bg-[#0C0C0C] text-white">Sort: Created Date</option>
            </select>
          </div>

          {/* Archive Toggle Button */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center space-x-1.5 px-3 h-8 rounded-full border text-[10px] sm:text-xs font-bold transition-all ${
              showArchived
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white/80'
            }`}
            title={showArchived ? 'View active sprint tasks' : 'View soft-deleted archived tasks'}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'View Active' : 'View Archive'}</span>
          </button>

          {/* Undo/Redo Controls */}
          <div className="flex items-center space-x-1 border border-white/10 bg-white/5 rounded-full p-0.5 h-8">
            <button
              onClick={handleUndo}
              disabled={past.length === 0}
              className={`px-2.5 h-6 rounded-full transition-all text-[10px] font-bold flex items-center space-x-1 cursor-pointer ${
                past.length > 0
                  ? 'bg-white/5 text-white hover:bg-white/10'
                  : 'text-white/20 opacity-40 cursor-not-allowed'
              }`}
              title="Undo last movement (Ctrl+Z)"
            >
              <Undo className="w-3 h-3" />
              <span className="hidden sm:inline">Undo</span>
              {past.length > 0 && (
                <span className="text-[8px] bg-indigo-500/35 px-1.5 py-0.2 rounded-full font-mono text-zinc-100">{past.length}</span>
              )}
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className={`px-2.5 h-6 rounded-full transition-all text-[10px] font-bold flex items-center space-x-1 cursor-pointer ${
                future.length > 0
                  ? 'bg-white/5 text-white hover:bg-white/10'
                  : 'text-white/20 opacity-40 cursor-not-allowed'
              }`}
              title="Redo movement (Ctrl+Y)"
            >
              <Redo className="w-3 h-3" />
              <span className="hidden sm:inline">Redo</span>
              {future.length > 0 && (
                <span className="text-[8px] bg-emerald-500/35 px-1.5 py-0.2 rounded-full font-mono text-zinc-100">{future.length}</span>
              )}
            </button>
          </div>

          {/* Vertical Grouping (Swimlanes) selectors */}
          <div className="flex items-center space-x-1 border border-white/10 bg-white/5 rounded-full p-0.5 h-8 text-[11px] text-white/60">
            <Layers className="w-3 h-3 text-white/30 ml-2" />
            <span className="hidden sm:inline text-[9px] text-white/30 pr-1 uppercase tracking-wider font-mono">Group:</span>
            <button
              onClick={() => setGroupBy('None')}
              className={`px-2.5 py-0.5 h-6 rounded-full transition-all text-[10px] font-bold ${groupBy === 'None' ? 'bg-indigo-500 text-white shadow-sm' : 'text-white/40 hover:text-white/85'}`}
            >
              None
            </button>
            <button
              onClick={() => setGroupBy('Priority')}
              className={`px-2.5 py-0.5 h-6 rounded-full transition-all text-[10px] font-bold ${groupBy === 'Priority' ? 'bg-indigo-500 text-white shadow-sm' : 'text-white/40 hover:text-white/85'}`}
            >
              Priority
            </button>
            <button
              onClick={() => setGroupBy('Assignee')}
              className={`px-2.5 py-0.5 h-6 rounded-full transition-all text-[10px] font-bold ${groupBy === 'Assignee' ? 'bg-indigo-500 text-white shadow-sm' : 'text-white/40 hover:text-white/85'}`}
            >
              Team
            </button>
          </div>

          {/* Layout buttons */}
          <div className="flex rounded-full p-0.5 border border-white/10 bg-white/5 text-[10px] sm:text-xs">
            <button
              onClick={() => setLayout('kanban')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold ${layout === 'kanban' ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white transition-colors'}`}
            >
              Board
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold ${layout === 'list' ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white transition-colors'}`}
            >
              List
            </button>
            <button
              onClick={() => setLayout('timeline')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold ${layout === 'timeline' ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white transition-colors'}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setLayout('calendar')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold ${layout === 'calendar' ? 'bg-indigo-500 text-white' : 'text-white/40 hover:text-white transition-colors'}`}
            >
              Calendar
            </button>
          </div>

          {/* Create trigger */}
          <button
            onClick={() => onCreateTask('Todo')}
            className="h-8 px-3.5 bg-indigo-500 hover:bg-indigo-400 font-bold text-white rounded-full text-xs flex items-center space-x-1 transition-colors shadow-lg shadow-indigo-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Issue</span>
          </button>
        </div>
      </div>

      {statusSpotlight !== 'All' && (
        <div className="mb-4 p-3 rounded-xl bg-[#daff33]/10 border border-[#daff33]/20 flex items-center justify-between animate-fade-in text-xs text-white">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#daff33] animate-pulse"></span>
            <span>
              Pipeline Alignment: Spotlighting the <span className="font-bold underline text-[#daff33]">{statusSpotlight === 'InProgress' ? 'In Progress' : statusSpotlight}</span> column. Non-matching phases are dimmed.
            </span>
          </div>
          <button
            onClick={() => onSetStatusSpotlight?.('All')}
            className="text-[10px] font-mono bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded px-2.5 py-1 cursor-pointer font-bold select-none"
          >
            CLEAR SPOTLIGHT
          </button>
        </div>
      )}

      {/* Kanban Column View */}
      {layout === 'kanban' && (
        <div className="grid grid-cols-4 grid-cols-4-custom gap-4 items-start w-full min-w-[1240px] xl:min-w-0 overflow-x-auto pb-4 custom-scrollbar">
          {(['Backlog', 'Todo', 'InProgress', 'Done'] as Task['status'][]).map(status => {
            const colTasks = sortedFilteredTasks.filter(t => t.status === status);
            const isColCollapsed = collapsedColumns[status];
            const isSpotlighted = statusSpotlight === 'All' || statusSpotlight === status;

            if (isColCollapsed) {
              return (
                <div 
                  key={status} 
                  className={`p-3 rounded-2xl flex flex-row lg:flex-col items-center justify-between lg:justify-start lg:space-y-6 w-full lg:w-14 min-h-[50px] lg:min-h-[420px] transition-all duration-300 shrink-0 shadow-sm ${
                    statusSpotlight !== 'All' 
                      ? isSpotlighted 
                        ? 'bg-[#0d0d10] border-2 border-[#daff33]/40 shadow-[0_0_15px_rgba(218,255,51,0.15)] opacity-100' 
                        : 'bg-[#0d0d10] border border-white/5 opacity-25'
                      : 'bg-[#0d0d10] border border-white/5 opacity-100'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-white/[0.04]');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('bg-white/[0.04]');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-white/[0.04]');
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) {
                      const taskToMove = tasks.find(t => t.id === taskId);
                      if (taskToMove) {
                        const remaining = tasks.filter(t => t.id !== taskId);
                        const updated = [...remaining, { ...taskToMove, status }];
                        handleReorderTasks(updated);
                        onSetTaskStatus(taskId, status);
                      }
                    }
                  }}
                >
                  <div className="flex items-center lg:flex-col lg:space-y-4 gap-2">
                    <button
                      onClick={() => toggleColumnCollapse(status)}
                      className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white border border-white/5 transition-all"
                      title={`Expand ${status} Column`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400"></span>

                    <span className="font-mono text-[9px] font-bold text-white/40 tracking-wider uppercase lg:[writing-mode:vertical-lr] select-none whitespace-nowrap">
                      {status === 'InProgress' ? 'In Progress' : status}
                    </span>
                  </div>

                  <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold text-indigo-400">
                    {colTasks.length}
                  </span>
                </div>
              );
            }

            const priorityLanes: { key: 'High' | 'Medium' | 'Low'; label: string; borderClass: string; textClass: string }[] = [
              { key: 'High', label: 'High Priority', borderClass: 'border-red-500/10 bg-red-500/[0.005]', textClass: 'text-red-400' },
              { key: 'Medium', label: 'Medium Priority', borderClass: 'border-amber-500/10 bg-amber-500/[0.005]', textClass: 'text-amber-400' },
              { key: 'Low', label: 'Low Priority', borderClass: 'border-white/5 bg-white/[0.002]', textClass: 'text-zinc-500' },
            ];

            const assignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[];
            const assigneeLanes = [...assignees, 'Unassigned'];

            return (
              <div 
                key={status} 
                className={`p-4 bg-white bg-white-0.01 border border-white-5 rounded-2xl flex flex-col space-y-3 min-h-420px transition-all duration-300 bg-white/[0.01] border-white/5 min-h-[420px] shrink-0 shadow-sm ${
                  statusSpotlight !== 'All'
                    ? isSpotlighted
                      ? 'bg-white/[0.02] border-2 border-[#daff33]/50 shadow-[0_0_15px_rgba(218,255,51,0.15)] opacity-100'
                      : 'bg-white/[0.005] border border-white/5 opacity-25'
                    : 'opacity-100'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-white/[0.04]');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-white/[0.04]');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-white/[0.04]');
                  const taskId = e.dataTransfer.getData('text/plain');
                  if (taskId) {
                    const taskToMove = tasks.find(t => t.id === taskId);
                    if (taskToMove) {
                      const remaining = tasks.filter(t => t.id !== taskId);
                      const updated = [...remaining, { ...taskToMove, status }];
                      handleReorderTasks(updated);
                      onSetTaskStatus(taskId, status);
                    }
                  }
                }}
              >
                {/* Column Title */}
                <div className="flex items-center justify-between pb-2 border-b border-white-5 border-white/5 select-none">
                  <div className="flex items-center space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      status === 'Done' ? 'bg-emerald-400 animate-pulse' : 
                      status === 'InProgress' ? 'bg-indigo-400' : 
                      status === 'Todo' ? 'bg-amber-400' : 'bg-white/20'
                    }`}></span>
                    <span className="font-bold text-[11px] text-white/70 uppercase tracking-widest">{status}</span>
                    <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold text-white/50">{colTasks.length}</span>
                  </div>

                  <button
                    onClick={() => toggleColumnCollapse(status)}
                    className="p-1 px-2.5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-all flex items-center space-x-1 border border-white/5 hover:border-indigo-500/20 group cursor-pointer"
                    title={`Collapse ${status} status column`}
                  >
                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-white/40 group-hover:text-white/80 transition-colors">Collapse</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-white/30 group-hover:text-indigo-450 transition-colors" />
                  </button>
                </div>

                {/* Sub Task listing inside column */}
                <div className="space-y-2.5 flex-grow overflow-y-auto max-h-[500px] pr-0.5 custom-scrollbar">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-5 border border-dashed border-white/5 bg-white/[0.005] rounded-2xl text-center space-y-3.5 shrink-0 select-none">
                      {renderEmptyIllustration(status)}
                      <div className="space-y-1">
                        <p className="text-[#EDEDED]/60 font-mono text-[10px] uppercase tracking-wider font-bold">
                          Empty {status === 'InProgress' ? 'InProgress' : status}
                        </p>
                        <p className="text-[10px] text-white/20 max-w-[160px] mx-auto leading-relaxed">
                          {status === 'Backlog' && 'Sovereign queue is clear. No cold-storage backlogs or passive specs recorded.'}
                          {status === 'Todo' && 'All objectives cleared. Insert new sprint items or drag active issues.'}
                          {status === 'InProgress' && 'CPU cycles idle. No active system engineering or dynamic logs running.'}
                          {status === 'Done' && 'No completed nodes. Propel target tasks to completion status.'}
                        </p>
                      </div>
                      <button
                        onClick={() => onCreateTask(status)}
                        className="mt-1 flex items-center space-x-1 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1 rounded-full transition-all"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Quick Add</span>
                      </button>
                    </div>
                  ) : groupBy === 'None' ? (
                    colTasks.map(t => renderCard(t, status))
                  ) : groupBy === 'Priority' ? (
                    <div className="space-y-3.5">
                      {priorityLanes.map(lane => {
                        const laneTasks = colTasks.filter(t => {
                          const priority = t.priority || 'Low';
                          return priority === lane.key;
                        });
                        return (
                          <div
                            key={lane.key}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add('bg-white/[0.02]', 'border-indigo-500/30');
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('bg-white/[0.02]', 'border-indigo-500/30');
                            }}
                            onDrop={(e) => {
                              e.currentTarget.classList.remove('bg-white/[0.02]', 'border-indigo-500/30');
                              handleLaneDrop(e, status, lane.key);
                            }}
                            className={`p-2 rounded-xl border border-white/5 transition-all space-y-2 ${lane.borderClass}`}
                          >
                            <div className="flex items-center justify-between pb-1 border-b border-white/[0.02] select-none">
                              <span className={`text-[9px] font-bold uppercase tracking-widest ${lane.textClass}`}>
                                {lane.label}
                              </span>
                              <span className="text-[9px] text-white/30 font-mono font-bold">({laneTasks.length})</span>
                            </div>
                            <div className="space-y-2">
                              {laneTasks.length === 0 ? (
                                <div className="text-center py-3 text-white/10 text-[9px] font-mono uppercase tracking-wider italic border border-dashed border-white/5 rounded-lg select-none">
                                  Drag card to prioritize
                                </div>
                              ) : (
                                laneTasks.map(t => renderCard(t, status))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {assigneeLanes.map(lane => {
                        const laneTasks = colTasks.filter(t => {
                          if (lane === 'Unassigned') {
                            return !t.assignee;
                          }
                          return t.assignee === lane;
                        });
                        return (
                          <div
                            key={lane}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add('bg-white/[0.02]', 'border-indigo-500/30');
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('bg-white/[0.02]', 'border-indigo-500/30');
                            }}
                            onDrop={(e) => {
                              e.currentTarget.classList.remove('bg-white/[0.02]', 'border-indigo-500/30');
                              handleAssigneeDrop(e, status, lane);
                            }}
                            className="p-2 rounded-xl border border-white/5 bg-white/[0.002] transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between pb-1 border-b border-white/[0.02] select-none">
                              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest font-mono">
                                {lane === 'Unassigned' ? 'Unassigned' : lane}
                              </span>
                              <span className="text-[9px] text-white/30 font-mono font-bold">({laneTasks.length})</span>
                            </div>
                            <div className="space-y-2">
                              {laneTasks.length === 0 ? (
                                <div className="text-center py-3 text-white/10 text-[9px] font-mono uppercase tracking-wider italic border border-dashed border-white/5 rounded-lg select-none">
                                  Drag to assign
                                </div>
                              ) : (
                                laneTasks.map(t => renderCard(t, status))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Add column specific button */}
                <button
                  onClick={() => onCreateTask(status)}
                  className="w-full py-2 bg-white/[0.01] hover:bg-white/5 border border-dashed border-white/5 hover:border-white/20 text-[10px] font-bold rounded-xl text-white/40 hover:text-white flex items-center justify-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Issue</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Layout List View */}
      {layout === 'list' && (
        <div className="border border-white/5 bg-[#0e0e11] rounded-2xl overflow-hidden text-xs shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-white/40 font-mono text-[9px] uppercase tracking-wider">
                <th className="p-3.5 pl-6 w-10">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedTaskIds.length === sortedFilteredTasks.length && sortedFilteredTasks.length > 0) {
                        setSelectedTaskIds([]);
                      } else {
                        setSelectedTaskIds(sortedFilteredTasks.map(t => t.id));
                      }
                    }}
                    className={`w-3.5 h-3.5 flex items-center justify-center rounded border transition-all cursor-pointer ${
                      selectedTaskIds.length === sortedFilteredTasks.length && sortedFilteredTasks.length > 0
                        ? 'bg-indigo-500 border-indigo-400 text-white' 
                        : 'border-white/15 bg-white/5 hover:border-indigo-500/40'
                    }`}
                  >
                    {selectedTaskIds.length === sortedFilteredTasks.length && sortedFilteredTasks.length > 0 && (
                      <svg className="w-2.5 h-2.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="p-3.5">Issue Coordinate Title</th>
                <th className="p-3.5">Pipeline Status</th>
                <th className="p-3.5">Workflow Category</th>
                <th className="p-3.5">Priority Index</th>
                <th className="p-3.5">Owner Code</th>
                <th className="p-3.5 pr-6">Expected Deliverable Due</th>
              </tr>
            </thead>
            <tbody>
              {sortedFilteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-white/30 italic">
                    No active issues matching criteria logged.
                  </td>
                </tr>
              ) : (
                sortedFilteredTasks.map(t => {
                  const isSelected = selectedTaskIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => onEditTask(t)}
                      className={`border-b border-white/5 hover:bg-white/[0.01] cursor-pointer transition-colors ${isSelected ? 'bg-indigo-500/[0.03]' : ''}`}
                    >
                      <td className="p-3.5 pl-6" onClick={(e) => e.stopPropagation()}>
                        <div 
                          onClick={() => {
                            setSelectedTaskIds(prev => 
                              prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                            );
                          }}
                          className={`w-3.5 h-3.5 flex items-center justify-center rounded border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-500 border-indigo-400 text-white shadow-sm shadow-indigo-500/20' 
                              : 'border-white/15 bg-white/5 hover:border-indigo-500/40'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-white/90">{t.title}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          t.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          t.status === 'InProgress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                          t.status === 'Todo' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-white/5 text-white/40 border-white/5'
                        } uppercase font-mono`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-white/50">{t.label}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold ${
                          t.priority === 'High' ? 'text-red-400' : 
                          t.priority === 'Medium' ? 'text-amber-400' : 
                          'text-white/40'
                        }`}>{t.priority}</span>
                      </td>
                      <td className="p-3.5 font-sans text-white/50">{t.assignee}</td>
                      <td className="p-3.5 pr-6 text-white/40 font-mono text-[10px]">{t.dueDate}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Layout Timeline/Gantt View */}
      {layout === 'timeline' && (
        <div className="p-6 border border-white/5 bg-[#0e0e11] rounded-2xl text-xs space-y-4 shadow-sm">
          <h3 className="text-xs uppercase font-bold text-white/60 tracking-wider">Sprint Deliverables Timeline Map</h3>
          <div className="space-y-4 pt-2">
            {sortedFilteredTasks.length === 0 ? (
              <div className="text-center py-6 text-white/30 italic">
                No sprint deliverables allocated.
              </div>
            ) : (
              sortedFilteredTasks.map((t, idx) => (
                <div key={t.id} className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-12 md:col-span-3 font-semibold text-white/90 truncate cursor-pointer" onClick={() => onEditTask(t)}>
                    {t.title}
                  </div>
                  <div className="col-span-12 md:col-span-9 h-7 relative bg-white/5 border border-white/5 rounded-full overflow-hidden">
                    <div
                       className="absolute h-full rounded-full text-[9px] font-bold px-4 flex items-center justify-center transition-all cursor-pointer"
                       onClick={() => onEditTask(t)}
                       style={{
                         left: `${10 + (idx * 16) % 55}%`,
                         width: `${30 + (idx * 5) % 35}%`,
                         backgroundColor: t.status === 'Done' ? '#10b98115' : t.status === 'InProgress' ? '#6366f115' : '#ffffff05',
                         border: t.status === 'Done' ? '1px solid #10b98130' : t.status === 'InProgress' ? '1px solid #6366f130' : '1px solid #ffffff10',
                         color: t.status === 'Done' ? '#34d399' : t.status === 'InProgress' ? '#818cf8' : '#ffffff40'
                       }}
                    >
                      <span className="font-mono">{t.status} : {t.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {layout === 'calendar' && (
        <div className="space-y-4 select-none animate-fade-in text-left">
          <div className="p-5 border border-white/5 bg-[#0e0e11]/95 rounded-3xl text-xs space-y-5 shadow-2xl">
            {/* Calendar Controller Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#f4f4f5] flex items-center gap-1.5 font-sans">
                    <span>Sprint Calendar Planner</span>
                    {activeScheduleTask && (
                      <span className="text-[10px] bg-amber-500/15 border border-amber-500/35 text-amber-400 px-2.5 py-0.5 rounded-lg animate-pulse font-mono font-bold">
                        🎯 CLICK A DATE CELL TO SCHEDULE THIS DELIVERABLE
                      </span>
                    )}
                  </h3>
                  <p className="text-[10.5px] text-zinc-400">Scroll months or jump below. Drag issues directly to schedule, or click "+" inline to log future deadlines.</p>
                </div>
              </div>

              {/* Navigation Tools */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setCalendarMonth(prev => {
                      if (prev === 0) {
                        setCalendarYear(y => y - 1);
                        return 11;
                      }
                      return prev - 1;
                    });
                  }}
                  className="px-2.5 py-1.5 h-8 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="px-4 py-1.5 h-8 bg-black/60 border border-white/5 rounded-lg text-xs font-bold text-white min-w-[130px] text-center flex items-center justify-center font-mono uppercase tracking-wider">
                  {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>

                <button
                  onClick={() => {
                    setCalendarMonth(prev => {
                      if (prev === 11) {
                        setCalendarYear(y => y + 1);
                        return 0;
                      }
                      return prev + 1;
                    });
                  }}
                  className="px-2.5 py-1.5 h-8 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

                <button
                  onClick={() => {
                    const today = new Date();
                    setCalendarYear(today.getFullYear());
                    setCalendarMonth(today.getMonth());
                  }}
                  className="px-3 py-1.5 h-8 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white/80 hover:text-white rounded-lg text-[10.5px] font-bold font-mono transition-all cursor-pointer"
                >
                  TODAY
                </button>

                <button
                  onClick={() => {
                    // Quick-schedule / scroll further 2 weeks out
                    const futureDate = new Date();
                    futureDate.setDate(futureDate.getDate() + 14);
                    setCalendarYear(futureDate.getFullYear());
                    setCalendarMonth(futureDate.getMonth());
                    useAppStore.getState().addNotification('Calendar Focused', 'Scrolled view into upcoming weeks’ sprint slots.', 'info');
                  }}
                  className="px-3.5 py-1.5 h-8 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-lg text-[10.5px] font-bold font-mono transition-all cursor-pointer"
                  title="Forward focus 14 days"
                >
                  NEXT WEEKS
                </button>
              </div>
            </div>

            {/* Main Layout Division: Calendar Core + Backlog Inbox Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Left Side: Days Grid Card Canvas */}
              <div className="lg:col-span-9 space-y-3">
                
                {/* Weekday Strip Headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => (
                    <div key={idx} className="py-1">{dayName}</div>
                  ))}
                </div>

                {/* 42 Recurrent Date Cell Panels */}
                <div className="grid grid-cols-7 gap-1.5">
                  {getDaysInMonth(calendarYear, calendarMonth).map((day, cellIdx) => {
                    const dateStr = formatDateString(day);
                    const isToday = formatDateString(new Date()) === dateStr;
                    const isCurrentMonth = day.getMonth() === calendarMonth;
                    
                    // Filter tasks corresponding to cell date
                    const cellTasks = sortedFilteredTasks.filter(t => t.dueDate === dateStr);

                    return (
                      <div
                        key={cellIdx}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDropOnDate(e, dateStr)}
                        onClick={() => {
                          if (activeScheduleTask) {
                            const updated = tasks.map(t => t.id === activeScheduleTask.id ? { ...t, dueDate: dateStr } : t);
                            handleReorderTasks(updated);
                            useAppStore.getState().addNotification(
                              'Task Scheduled',
                              `Scheduled "${activeScheduleTask.title}" on ${dateStr}.`,
                              'task'
                            );
                            setActiveScheduleTask(null);
                          }
                        }}
                        className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition-all group relative cursor-pointer ${
                          isToday 
                            ? 'bg-indigo-500/[0.04] border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30' 
                            : isCurrentMonth 
                              ? 'bg-[#09090b]/40 border-white/5 hover:border-white/10' 
                              : 'bg-[#09090b]/10 border-white/[0.02] text-zinc-650 opacity-40 hover:opacity-100 hover:bg-[#09090b]/25'
                        } ${activeScheduleTask ? 'hover:bg-amber-500/5 hover:border-amber-500/50' : ''}`}
                      >
                        {/* Cell Tag and Addition Controls */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-mono font-black ${
                            isToday ? 'text-indigo-400 font-extrabold scale-110' : 'text-zinc-500'
                          }`}>
                            {day.getDate()}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateTaskForDate(dateStr);
                            }}
                            className="w-4 h-4 bg-white/5 hover:bg-indigo-500 rounded flex items-center justify-center hover:text-white text-zinc-500 border border-white/5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Insert custom scheduled task"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Scrolling cell content for tasks */}
                        <div className="flex-grow mt-1.5 space-y-1.5 max-h-[85px] overflow-y-auto custom-scrollbar pt-0.5">
                          {cellTasks.map(t => {
                            const isDone = t.status === 'Done';
                            return (
                              <div
                                key={t.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, t.id)}
                                onDragEnd={handleDragEnd}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditTask(t);
                                }}
                                className={`p-1.5 rounded-lg border text-[9.5px] cursor-grab active:cursor-grabbing hover:bg-zinc-900 group/item transition-all flex flex-col space-y-1 leading-snug ${
                                  isDone 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 line-through' 
                                    : t.status === 'InProgress' 
                                      ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                                      : 'bg-zinc-950/80 border-white/5 text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold truncate max-w-[65px] sm:max-w-none">{t.title}</span>
                                  {/* Quick checkbox check */}
                                  <button
                                    onClick={(e) => toggleTaskStatus(t, e)}
                                    className={`w-3 h-3 rounded flex items-center justify-center transition-colors shrink-0 ${
                                      isDone ? 'bg-emerald-600/20 text-emerald-400 font-bold' : 'bg-white/5 text-zinc-500 hover:bg-white/20'
                                    }`}
                                    title={isDone ? 'Restore as incomplete' : 'Complete deliverable'}
                                  >
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 font-bold group-hover/item:text-zinc-400">
                                  <span>{t.priority}</span>
                                  {/* Postpone target 1 week shortcut */}
                                  <button
                                    onClick={(e) => moveTaskToNextWeek(t, e)}
                                    className="px-1 py-0.2 bg-white/5 rounded text-[8px] border border-white/5 hover:bg-indigo-500 hover:text-white transition-colors uppercase ml-1 opacity-0 group-hover/item:opacity-100 cursor-pointer text-zinc-505 font-bold shrink-0 font-mono"
                                    title="Postpone 1 week forward"
                                  >
                                    +1 WK
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Cell Footer Labels */}
                        {cellTasks.length > 0 && (
                          <div className="text-[7.5px] font-mono text-zinc-500 text-right font-extrabold pr-0.5 mt-1">
                            {cellTasks.length} {cellTasks.length === 1 ? 'TASK' : 'TASKS'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side Column: Snoozed / Unscheduled Inbox */}
              <div className="lg:col-span-3 space-y-3">
                <div className="p-4 rounded-2xl border border-white/5 bg-black/40 space-y-3.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest leading-none">📂 INBOX BACKLOG</span>
                      <span className="text-[8.5px] font-mono bg-zinc-800/80 border border-white/5 text-zinc-400 px-2 py-0.5 rounded-lg uppercase font-bold">
                        {tasks.filter(t => !t.dueDate && !t.archived).length} OPEN
                      </span>
                    </div>
                    <p className="text-[9.5px] text-zinc-500 mt-1 leading-normal">
                      These sprint issues have no set date. Click a card, then select a calendar cell to schedule, or drag them directly.
                    </p>
                  </div>

                  {activeScheduleTask && (
                    <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between animate-pulse">
                      <div className="leading-tight">
                        <span className="text-[8.5px] text-amber-400 font-mono font-bold block uppercase tracking-wider">Draft Placement</span>
                        <p className="text-[10px] text-zinc-300 font-bold truncate max-w-[120px]">{activeScheduleTask.title}</p>
                      </div>
                      <button
                        onClick={() => setActiveScheduleTask(null)}
                        className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-[8.5px] border border-white/5 cursor-pointer font-bold font-mono"
                      >
                        RESET
                      </button>
                    </div>
                  )}

                  {/* Scrollable backlog drawer */}
                  <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-0.5">
                    {tasks.filter(t => !t.dueDate && !t.archived).map(t => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => {
                          if (activeScheduleTask?.id === t.id) {
                            setActiveScheduleTask(null);
                          } else {
                            setActiveScheduleTask(t);
                          }
                        }}
                        className={`p-2.5 border rounded-xl cursor-pointer transition-all space-y-1 text-left ${
                          activeScheduleTask?.id === t.id
                            ? 'border-indigo-400 bg-indigo-500/5 shadow-md shadow-indigo-500/10'
                            : 'border-white/5 bg-zinc-950/60 hover:bg-zinc-900 hover:border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10.5px] font-bold text-white leading-normal line-clamp-2">{t.title}</span>
                          <span className={`text-[7px] font-mono border px-1.5 py-0.5 uppercase font-bold shrink-0 ${
                            t.priority === 'High' ? 'border-red-500/20 text-red-400 bg-red-400/5' :
                            'border-zinc-700 text-zinc-400'
                          }`}>{t.priority}</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 line-clamp-1 italic font-sans">{t.description}</p>
                        
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[8px] text-zinc-400 font-bold font-mono uppercase bg-white/5 border border-white/5 px-1.5 rounded">{t.label}</span>
                          <span className="text-[8px] text-zinc-650 font-mono font-bold uppercase">UNSCHEDULED</span>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => !t.dueDate && !t.archived).length === 0 && (
                      <div className="text-center py-8 text-zinc-600 font-sans italic text-[10px]">
                        No unscheduled tasks found. Pipeline synchronized!
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING BULK ACTIONS TOOLBAR --- */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none w-[95%] max-w-2xl">
          <div className="bg-[#121214] border border-indigo-500/30 p-2.5 pl-4 pr-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_24px_60px_rgba(0,0,0,0.9)] pointer-events-auto hover:border-indigo-500/50 transition-all">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <p className="font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                Bulk ({selectedTaskIds.length} Issue{selectedTaskIds.length === 1 ? '' : 's'} Selected)
              </p>
              <button 
                onClick={() => setSelectedTaskIds([])}
                className="text-[10px] text-white/45 hover:text-white underline ml-2 transition-colors cursor-pointer"
              >
                Deselect
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Green Box Check Mark Option */}
              <button
                onClick={() => handleBulkMove('Done')}
                className="h-7 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
                title="Mark selected tasks as finished"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                <span>Mark Finished</span>
              </button>

              {/* Target Status */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkMove(e.target.value as Task['status']);
                    e.target.value = '';
                  }
                }}
                className="bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg px-2 py-1 select-none text-[10px] h-7 cursor-pointer outline-none transition-colors"
                defaultValue=""
              >
                <option value="" disabled className="bg-[#0C0C0C]">Move Status</option>
                <option value="Backlog" className="bg-[#0C0C0C]">Backlog</option>
                <option value="Todo" className="bg-[#0C0C0C]">Todo</option>
                <option value="InProgress" className="bg-[#0C0C0C]">In Progress</option>
                <option value="Done" className="bg-[#0C0C0C]">Done</option>
              </select>

              {/* Target Assignee */}
              <select
                onChange={(e) => {
                  if (e.target.value !== undefined) {
                    handleBulkAssign(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg px-2 py-1 select-none text-[10px] h-7 cursor-pointer outline-none transition-colors"
                defaultValue=""
              >
                <option value="" disabled className="bg-[#0C0C0C]">Assign To</option>
                <option value="Alex Chen" className="bg-[#0C0C0C]">Alex Chen</option>
                <option value="Sarah Connor" className="bg-[#0C0C0C]">Sarah Connor</option>
                <option value="Dave Miller" className="bg-[#0C0C0C]">Dave Miller</option>
                <option value="Unassigned" className="bg-[#0C0C0C]">Unassigned (None)</option>
              </select>

              {/* Target Priority */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkPriority(e.target.value as Task['priority']);
                    e.target.value = '';
                  }
                }}
                className="bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg px-2 py-1 select-none text-[10px] h-7 cursor-pointer outline-none transition-colors"
                defaultValue=""
              >
                <option value="" disabled className="bg-[#0C0C0C]">Set Priority</option>
                <option value="High" className="bg-[#0C0C0C] text-red-500">High</option>
                <option value="Medium" className="bg-[#0C0C0C] text-amber-500">Medium</option>
                <option value="Low" className="bg-[#0C0C0C] text-zinc-500">Low</option>
              </select>

              {/* Soft Archive */}
              <button
                onClick={handleBulkArchive}
                className="h-7 px-2.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1"
                title="Soft archive selected tasks"
              >
                <Archive className="w-3 h-3" />
                <span>Archive</span>
              </button>

              {/* Hard Delete */}
              <button
                onClick={handleBulkDelete}
                className="h-7 px-2.5 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 text-red-400 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1"
                title="Permanently purge selected tasks"
              >
                <Trash2 className="w-3 h-3" />
                <span>Purge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING QUICK-FILTER BAR / DOCKED ACTION TIER --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-none">
        <div className="bg-[#121214]/90 backdrop-blur-md border border-white/10 p-2 pl-4 pr-3.5 rounded-full flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto transition-all hover:border-indigo-500/40">
          <div className="flex items-center space-x-2 border-r border-white/10 pr-3 select-none">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="font-mono text-[9px] font-bold text-white/50 tracking-wider uppercase">Sprint Dock</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle: Assigned to Me */}
            <button
              onClick={() => setFilterAssignedToMe(!filterAssignedToMe)}
              className={`h-7 px-3 rounded-full text-[10px] font-bold transition-all flex items-center space-x-1.5 ${
                filterAssignedToMe 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/15' 
                  : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>Me</span>
              <span className={`px-1 rounded-md text-[8px] font-mono leading-none ${filterAssignedToMe ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30'}`}>
                {tasks.filter(t => {
                  const matchesArchived = showArchived ? !!(t as any).archived : !(t as any).archived;
                  if (!matchesArchived) return false;
                  const name = (t.assignee || '').toLowerCase();
                  return name === 'alex chen' || name === 'you';
                }).length}
              </span>
            </button>

            {/* Toggle: Upcoming Due */}
            <button
              onClick={() => setFilterUpcoming(!filterUpcoming)}
              className={`h-7 px-3 rounded-full text-[10px] font-bold transition-all flex items-center space-x-1.5 ${
                filterUpcoming 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                  : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>Upcoming</span>
              <span className={`px-1 rounded-md text-[8px] font-mono leading-none ${filterUpcoming ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-white/30'}`}>
                {tasks.filter(t => {
                  const matchesArchived = showArchived ? !!(t as any).archived : !(t as any).archived;
                  if (!matchesArchived) return false;
                  if (!t.dueDate) return false;
                  try {
                    const today = new Date('2026-05-23');
                    today.setHours(0,0,0,0);
                    const dt = new Date(t.dueDate);
                    dt.setHours(0,0,0,0);
                    const diffTime = dt.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 7;
                  } catch (e) { return false; }
                }).length}
              </span>
            </button>
          </div>

          {(filterAssignedToMe || filterUpcoming) && (
            <button
              onClick={() => {
                setFilterAssignedToMe(false);
                setFilterUpcoming(false);
              }}
              className="px-2 h-7 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-white/60 rounded-full transition-all border border-white/5 hover:text-white"
              title="Reset dock filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
