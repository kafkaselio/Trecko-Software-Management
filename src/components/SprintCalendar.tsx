import React, { useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, CheckCircle2, 
  Circle, HelpCircle, AlertTriangle, Play, CheckSquare, Clock, Filter, Sparkles, MoveRight
} from 'lucide-react';
import { Task, Theme } from '../types';
import { useAppStore } from '../store';

interface SprintCalendarProps {
  tasks: Task[];
  onTasksChange: (updatedTasks: Task[]) => void;
  onEditTask: (task: Task) => void;
  accentColor: string;
  theme?: Theme;
}

export default function SprintCalendar({ tasks, onTasksChange, onEditTask, accentColor, theme }: SprintCalendarProps) {
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const [sprintWeeks, setSprintWeeks] = useState<1 | 2 | 4>(1);
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedLabel, setSelectedLabel] = useState<string>('All');

  // Month navigation state
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());

  // Week navigation state (represented by offset in weeks from current week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (
      x < rect.left ||
      x >= rect.right ||
      y < rect.top ||
      y >= rect.bottom
    ) {
      setDragOverDate(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    setDragOverDate(null);

    if (!taskId) return;

    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    if (taskToMove.dueDate === targetDateStr) return;

    const updated = tasks.map(t => t.id === taskId ? { ...t, dueDate: targetDateStr } : t);
    onTasksChange(updated);

    useAppStore.getState().addNotification(
      'Sovereign Rescheduling', 
      `"${taskToMove.title}" rescheduled to ${targetDateStr}.`, 
      'task'
    );
  };

  // Filter out archived tasks
  const activeTasks = tasks.filter(t => !t.archived);

  // Unique labels list
  const labels = Array.from(new Set(activeTasks.map(t => t.label).filter(Boolean)));

  // Filter tasks based on selected priority/label
  const filteredTasks = activeTasks.filter(t => {
    const priorityMatch = selectedPriority === 'All' || t.priority === selectedPriority;
    const labelMatch = selectedLabel === 'All' || t.label === selectedLabel;
    return priorityMatch && labelMatch;
  });

  // Calculate current date range for "Week View" or longer layout ranges
  const getSprintDates = (offsetWeeks: number, numWeeks: number) => {
    const today = new Date();
    // Get the current day of the week (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const currentDay = today.getDay();
    // Calculate the distance to Monday (making Monday the start of the week)
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    // Start of the week is Monday + offset in weeks
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + distanceToMonday + offsetWeeks * 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const dates: Date[] = [];
    const totalDays = numWeeks * 7;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getSprintDates(weekOffset, sprintWeeks);
  const startOfWeekStr = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endOfWeekStr = weekDates[weekDates.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Formatting date string as YYYY-MM-DD
  const formatDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to change task status (Mark tasks complete/incomplete)
  const handleToggleTask = (task: Task) => {
    const nextStatus: Task['status'] = task.status === 'Done' ? 'Todo' : 'Done';
    const updated = tasks.map(t => t.id === task.id ? { ...t, status: nextStatus } : t);
    onTasksChange(updated);
    useAppStore.getState().addNotification(
      nextStatus === 'Done' ? 'Task Completed' : 'Task Active', 
      `"${task.title}" updated cleanly in sovereign sprint logs.`, 
      'task'
    );
  };

  // Move task to next week (Postpone by 7 days)
  const handleMoveToNextWeek = (task: Task) => {
    let baseDate = new Date();
    if (task.dueDate) {
      try {
        baseDate = new Date(task.dueDate);
      } catch (e) {}
    }
    baseDate.setDate(baseDate.getDate() + 7);
    const newDueDate = formatDateString(baseDate);
    const updated = tasks.map(t => t.id === task.id ? { ...t, dueDate: newDueDate } : t);
    onTasksChange(updated);
    useAppStore.getState().addNotification(
      'Rescheduled Task', 
      `"${task.title}" postponed by 7 days to ${newDueDate}.`, 
      'task'
    );
  };

  // Stateful Task Creation Modal helpers
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Alex Chen');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskLabel, setNewTaskLabel] = useState('Engineering');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const openAddTaskModal = (dateStr: string) => {
    setNewTaskDate(dateStr);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskAssignee('Alex Chen');
    setNewTaskPriority('Medium');
    setNewTaskLabel('Engineering');
    setShowAddModal(true);
  };

  const handleSaveNewTask = () => {
    if (!newTaskTitle.trim()) {
      useAppStore.getState().addNotification('Validation Checked', 'Task description matrix cannot be empty.', 'info');
      return;
    }
    const newTask: Task = {
      id: `task-cal-${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'Todo',
      priority: newTaskPriority,
      label: newTaskLabel.trim(),
      description: newTaskDesc.trim() || 'Logged directly via Sprint Calendar tracker.',
      assignee: newTaskAssignee,
      dueDate: newTaskDate,
      archived: false,
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    onTasksChange([newTask, ...tasks]);
    setShowAddModal(false);
    useAppStore.getState().addNotification('Task Allocated', `"${newTask.title}" assigned to ${newTask.assignee} on ${newTask.dueDate}.`, 'task');
  };

  // Helper to fetch padded list of dates for Month Grid
  const getDaysInMonthGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    
    const prevMonthLast = new Date(year, month, 0);
    const prevMonthDaysCount = prevMonthLast.getDate();
    
    const days: Date[] = [];
    
    // Pad previous month's days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthDaysCount - i));
    }
    
    // Current month days
    const currentMonthLast = new Date(year, month + 1, 0);
    const currentMonthDaysCount = currentMonthLast.getDate();
    for (let i = 1; i <= currentMonthDaysCount; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Pad next month's days to make an even grid of 42 cells total (6 rows of 7 days)
    const paddingCount = 42 - days.length;
    for (let i = 1; i <= paddingCount; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const monthGridDays = getDaysInMonthGrid(currentMonth);

  return (
    <div className="space-y-6 text-left animate-fade-in select-none">
      
      {/* 1. Header Control Panel */}
      <div className={`p-5 rounded-3xl border flex flex-col items-start gap-4 shadow-sm md:flex-row md:items-center justify-between ${theme ? theme.cardClass : 'border-white/5 bg-[#09090b]/80'}`}>
        <div className="space-y-1 block">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Sprint Calendar Engine</h1>
          </div>
          <p className="text-[10.5px] text-zinc-400">Pulling task due dates to map sprint coordinates. Browse future weeks and log/complete operational items instantly.</p>
        </div>

        {/* Filters and View Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <div className="flex items-center space-x-1 border border-white/10 bg-black/40 rounded-full px-2.5 py-0.5">
            <span className="text-[8.5px] font-mono text-zinc-550 mr-1.5 uppercase font-bold">Priority:</span>
            {['All', 'High', 'Medium', 'Low'].map(p => (
              <button 
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-2 py-0.5 rounded text-[8.5px] font-bold font-mono transition-all cursor-pointer ${
                  selectedPriority === p ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Label Selector if labels count exists */}
          {labels.length > 0 && (
            <select
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="px-2.5 py-1 text-[9px] font-bold font-mono text-zinc-300 bg-black/40 rounded-full border border-white/10 outline-none focus:ring-1 cursor-pointer"
            >
              <option value="All">All Sectors</option>
              {labels.map(lbl => (
                <option key={lbl} value={lbl}>{lbl.toUpperCase()}</option>
              ))}
            </select>
          )}

          <div className="h-6 w-px bg-white/10 mx-1" />

          {/* Week Range / Month planning view selector */}
          <div className="flex items-center space-x-1 border border-white/10 bg-black p-0.5 rounded-full">
            <button
              onClick={() => { setViewType('week'); setSprintWeeks(1); }}
              className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all cursor-pointer ${
                viewType === 'week' && sprintWeeks === 1 ? 'text-black' : 'text-zinc-400 hover:text-white'
              }`}
              style={viewType === 'week' && sprintWeeks === 1 ? { backgroundColor: accentColor } : {}}
            >
              1 Week
            </button>
            <button
              onClick={() => { setViewType('week'); setSprintWeeks(2); }}
              className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all cursor-pointer ${
                viewType === 'week' && sprintWeeks === 2 ? 'text-black' : 'text-zinc-400 hover:text-white'
              }`}
              style={viewType === 'week' && sprintWeeks === 2 ? { backgroundColor: accentColor } : {}}
            >
              2 Weeks
            </button>
            <button
              onClick={() => { setViewType('week'); setSprintWeeks(4); }}
              className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all cursor-pointer ${
                viewType === 'week' && sprintWeeks === 4 ? 'text-black' : 'text-zinc-400 hover:text-white'
              }`}
              style={viewType === 'week' && sprintWeeks === 4 ? { backgroundColor: accentColor } : {}}
            >
              4 Weeks
            </button>
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1 text-[9px] font-bold uppercase rounded-full transition-all cursor-pointer ${
                viewType === 'month' ? 'text-black' : 'text-zinc-400 hover:text-white'
              }`}
              style={viewType === 'month' ? { backgroundColor: accentColor } : {}}
            >
              Full Month
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 mx-1" />

          {/* Quick Add Task Button */}
          <button
            onClick={() => openAddTaskModal(formatDateString(new Date()))}
            className="flex items-center space-x-1 px-3.5 py-1.5 text-[9px] font-bold uppercase rounded-full cursor-pointer transition-all active:scale-95 text-black hover:opacity-95"
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Navigation Bar */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${theme ? theme.cardClass : 'border-white/5 bg-[#0e0e11]/90'}`}>
        {viewType === 'week' ? (
          <>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setWeekOffset(prev => prev - sprintWeeks)}
                className="p-1.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title={`Scroll Previous ${sprintWeeks > 1 ? `${sprintWeeks} Weeks` : 'Week'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                className="px-2.5 py-1 bg-zinc-900 border border-white/5 text-[9.5px] font-bold font-mono text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
              >
                CURRENT {sprintWeeks > 1 ? `SPRINT` : 'WEEK'}
              </button>
              <button
                onClick={() => setWeekOffset(prev => prev + sprintWeeks)}
                className="p-1.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title={`Scroll Forward ${sprintWeeks > 1 ? `${sprintWeeks} Weeks` : 'Week'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-3 text-right">
              <span className="text-[10.5px] font-mono text-zinc-400 font-bold uppercase tracking-wide">
                Sprint Bounds: <span className="text-[#daff33]" style={{ color: accentColor }}>{startOfWeekStr}</span> — <span className="text-zinc-400">{endOfWeekStr}</span>
              </span>
              <div className="text-[9.5px] bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-lg text-indigo-400 font-mono font-bold">
                {sprintWeeks === 1 
                  ? `WEEK ${weekOffset > 0 ? `+${weekOffset}` : weekOffset}` 
                  : `${sprintWeeks} WEEKS BATCH`
                }
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const prev = new Date(currentMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCurrentMonth(prev);
                }}
                className="p-1.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2.5 py-1 bg-zinc-900 border border-white/5 text-[9.5px] font-bold font-mono text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer"
              >
                THIS MONTH
              </button>
              <button
                onClick={() => {
                  const next = new Date(currentMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCurrentMonth(next);
                }}
                className="p-1.5 bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11.5px] font-mono font-extrabold uppercase text-white tracking-widest bg-black/50 border border-white/5 px-4.5 py-1 rounded-xl">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </>
        )}
      </div>

      {/* 3. Main Views Grid Container */}
      {viewType === 'week' ? (
        /* WEEK STRIP VIEW */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDates.map((day, idx) => {
            const dateStr = formatDateString(day);
            const isToday = formatDateString(new Date()) === dateStr;
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = day.getDate();
            
            // Extract and sort current tasks of the date
            const daysTasks = filteredTasks.filter(t => t.dueDate === dateStr);
            const isDragTarget = dragOverDate === dateStr;

            return (
              <div 
                key={idx}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all group relative ${
                  isDragTarget
                    ? 'scale-[1.02] shadow-[0_0_20px_rgba(129,140,248,0.2)]'
                    : isToday 
                      ? 'bg-indigo-500/[0.04] border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.12)]' 
                      : `${theme ? theme.cardClass : 'bg-[#09090b]/40 border-white/5'} hover:border-white/10`
                } ${
                  sprintWeeks === 1 
                    ? 'min-h-[290px]' 
                    : sprintWeeks === 2 
                      ? 'min-h-[190px]' 
                      : 'min-h-[150px]'
                }`}
                style={isDragTarget ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : {}}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-2">
                  <div className="text-left leading-tight">
                    <span className={`text-[10px] uppercase font-bold tracking-widest font-mono block ${isToday ? 'text-indigo-400' : 'text-zinc-500'}`}>
                      {dayName}
                    </span>
                    <span className={`text-sm font-black font-mono block ${isToday ? 'text-indigo-300 font-extrabold scale-105' : 'text-white'}`}>
                      {dayNum}
                    </span>
                  </div>

                  <button
                    onClick={() => openAddTaskModal(dateStr)}
                    className="w-5 h-5 bg-white/5 hover:bg-indigo-500 text-zinc-500 hover:text-white rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/5"
                    title="Plan operational deliverable for this day"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Days Tasks list */}
                <div className={`flex-grow space-y-2 pr-0.5 custom-scrollbar ${
                  sprintWeeks === 1 
                    ? 'max-h-[200px] overflow-y-auto' 
                    : sprintWeeks === 2 
                      ? 'max-h-[110px] overflow-y-auto' 
                      : 'max-h-[80px] overflow-y-auto'
                }`}>
                  {daysTasks.map(task => {
                    const isDone = task.status === 'Done';
                    const isHigh = task.priority === 'High';
                    const isDragged = draggedTaskId === task.id;
                    
                    return (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onEditTask(task)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative group/item cursor-pointer select-none cursor-grab active:cursor-grabbing space-y-1 ${
                          isDragged ? 'opacity-30 border-dashed scale-95' : ''
                        } ${
                          isDone 
                            ? 'bg-emerald-505/5 border-emerald-500/20 text-emerald-350 line-through opacity-85'
                            : task.status === 'InProgress'
                              ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-300'
                              : 'bg-zinc-950/80 border-white/5 text-zinc-350 hover:bg-zinc-900 hover:border-white/10'
                        }`}
                        style={isDragged ? { borderColor: `${accentColor}50` } : {}}
                      >
                        {/* Task Title & Toggle Status Button */}
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-[10px] font-semibold leading-snug line-clamp-2">{task.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTask(task);
                            }}
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors shrink-0 mt-0.5 cursor-pointer ${
                              isDone ? 'bg-emerald-600/20 text-emerald-400 font-black' : 'bg-white/5 hover:bg-white/10 text-zinc-500'
                            }`}
                            title={isDone ? 'Incomplete issue' : 'Complete task'}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Description snippet if any */}
                        {task.description && (
                          <p className="text-[9px] text-zinc-500 line-clamp-1 italic font-sans">{task.description}</p>
                        )}

                        {/* Task Priority details & next week slider icon */}
                        <div className="flex items-center justify-between text-[7.5px] font-mono text-zinc-550 border-t border-white/[0.03] pt-1">
                          <div className="flex gap-1 items-center">
                            <span className={`px-1 rounded uppercase font-bold ${
                              isHigh ? 'border border-red-500/10 text-red-400 bg-red-500/[0.01]' : 'border border-zinc-800'
                            }`}>
                              {task.priority || 'Medium'}
                            </span>
                          </div>

                          {/* Quick postpone Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToNextWeek(task);
                            }}
                            className="p-0.5 bg-white/5 text-zinc-500 hover:bg-indigo-500/20 hover:text-indigo-400 border border-white/5 rounded text-[8px] font-mono cursor-pointer opacity-0 group-hover/item:opacity-100 transition-all flex items-center gap-0.5"
                            title="Move to Next Week (+7 Days)"
                          >
                            <span>+1WK</span>
                            <MoveRight className="w-2 h-2" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {daysTasks.length === 0 && (
                    <div className={`text-center font-sans text-zinc-600 text-[9px] italic flex flex-col items-center justify-center space-y-1 ${
                      sprintWeeks === 1 ? 'py-10' : sprintWeeks === 2 ? 'py-4' : 'py-2'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5 text-zinc-700 block" />
                      <span>Free Day</span>
                    </div>
                  )}
                </div>

                {/* Day Footer Stat */}
                {daysTasks.length > 0 && (
                  <div className="text-[7.5px] font-mono text-zinc-600 text-right mt-1.5 pt-1.5 border-t border-white/[0.03] uppercase font-bold">
                    {daysTasks.filter(t => t.status === 'Done').length} / {daysTasks.length} DONE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* FULL MONTH CANVAS GRID */
        <div className="p-4 rounded-3xl border border-white/5 bg-[#09090b]/80 space-y-4">
          <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {monthGridDays.map((day, idx) => {
              const dateStr = formatDateString(day);
              const isToday = formatDateString(new Date()) === dateStr;
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const dayTasks = filteredTasks.filter(t => t.dueDate === dateStr);
              const isDragTarget = dragOverDate === dateStr;

              return (
                <div
                  key={idx}
                  onDragOver={(e) => handleDragOver(e, dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, dateStr)}
                  className={`min-h-[100px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all group relative ${
                    isDragTarget
                      ? 'scale-[1.01] shadow-[0_0_12px_rgba(129,140,248,0.15)]'
                      : isToday
                        ? 'bg-indigo-500/[0.04] border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                        : isCurrentMonth
                          ? 'bg-[#09090b]/30 border-white/5 hover:border-white/10'
                          : 'bg-transparent border-white/[0.015] text-zinc-700 opacity-40 hover:opacity-105'
                  }`}
                  style={isDragTarget ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono ${isToday ? 'text-indigo-400 font-extrabold' : 'text-zinc-500'}`}>
                      {day.getDate()}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddTaskModal(dateStr);
                      }}
                      className="w-3.5 h-3.5 bg-white/5 hover:bg-indigo-500 rounded flex items-center justify-center text-zinc-550 hover:text-white border border-white/5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Tasks nested inside cell */}
                  <div className="flex-grow mt-1 space-y-1 overflow-y-auto max-h-[65px] custom-scrollbar">
                    {dayTasks.map(t => {
                      const isDragged = draggedTaskId === t.id;
                      return (
                        <div
                          key={t.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(t);
                          }}
                          className={`px-1 py-0.5 rounded text-[8.5px] truncate text-left border cursor-grab active:cursor-grabbing select-none ${
                            isDragged ? 'opacity-30 border-dashed scale-95' : ''
                          } ${
                            t.status === 'Done'
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 line-through'
                              : t.status === 'InProgress'
                                ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-300'
                                : 'bg-zinc-900 border-white/5 text-zinc-350'
                          }`}
                          style={isDragged ? { borderColor: `${accentColor}50` } : {}}
                        >
                          {t.title}
                        </div>
                      );
                    })}
                  </div>

                  {dayTasks.length > 0 && (
                    <div className="text-[7px] text-zinc-500 font-mono text-right font-extrabold uppercase mt-0.5">
                      {dayTasks.length} {dayTasks.length === 1 ? 'Task' : 'Tasks'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Quick Sandbox Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/60 flex items-center space-x-3 text-left">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-zinc-400 leading-none">OVERDUE BOUNDS</h4>
            <span className="text-lg font-black font-mono text-rose-400 block mt-1">
              {filteredTasks.filter(t => t.dueDate && t.status !== 'Done' && new Date(t.dueDate) < new Date()).length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/60 flex items-center space-x-3 text-left">
          <div className="p-2.5 bg-[#daff33]/10 border border-[#daff33]/20 text-[#daff33] rounded-xl flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-zinc-400 leading-none">QUEUED FOR THIS WEEK</h4>
            <span className="text-lg font-black font-mono text-[#daff33] block mt-1">
              {filteredTasks.filter(t => {
                if (!t.dueDate) return false;
                const dateObj = new Date(t.dueDate);
                return weekDates.some(wd => wd.toDateString() === dateObj.toDateString());
              }).length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/60 flex items-center space-x-3 text-left">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-zinc-400 leading-none">PIPELINE EFFICIENCY</h4>
            <span className="text-lg font-black font-mono text-emerald-400 block mt-1">
              {filteredTasks.length > 0 
                ? Math.round((filteredTasks.filter(t => t.status === 'Done').length / filteredTasks.length) * 100)
                : 100}%
            </span>
          </div>
        </div>
      </div>

      {/* 5. STATEFUL SPRINT TASK ALLOCATION MODAL */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-[#0e0e11] border border-white/10 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    Allocate Sprint Task
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    Target Date: <span className="text-[#daff33] font-bold">{newTaskDate}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 px-2.5 text-[10px] text-zinc-400 hover:text-white bg-white/5 rounded-lg border border-white/5 cursor-pointer font-mono font-bold"
              >
                CLOSE
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase font-black text-zinc-400 tracking-wider">
                  Task Title or Req
                </label>
                <input
                  type="text"
                  placeholder="e.g. Establish live Webhook verification handlers"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-sans text-white placeholder-zinc-650 bg-black border border-white/10 rounded-xl outline-none focus:border-[#daff33]/40 transition-colors"
                  autoFocus
                />
              </div>

              {/* Assignment (Assignee) Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase font-black text-zinc-400 tracking-wider">
                  Task Assignment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Alex Chen', role: 'SaaS Facilitator' },
                    { name: 'Elena Rostova', role: 'Staff API Architect' },
                    { name: 'Marcus Vance', role: 'Lead UX Designer' },
                    { name: 'Sarah Jenkins', role: 'Full-stack Engineer' }
                  ].map(member => {
                    const isSelected = newTaskAssignee === member.name;
                    return (
                      <button
                        type="button"
                        key={member.name}
                        onClick={() => setNewTaskAssignee(member.name)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-500/5 border-indigo-500/40 shadow-sm'
                            : 'bg-black/30 border-white/5 hover:border-white/10 hover:bg-black/50'
                        }`}
                      >
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-[#daff33]' : 'text-zinc-300'}`}>
                          {member.name}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-tight mt-0.5">
                          {member.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority & Sector Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono uppercase font-black text-[#daff33] tracking-wider">
                    Priority Level
                  </label>
                  <div className="flex bg-black/50 border border-white/5 p-1 rounded-xl gap-1">
                    {(['Low', 'Medium', 'High'] as const).map(p => {
                      const isSel = newTaskPriority === p;
                      return (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setNewTaskPriority(p)}
                          className={`flex-1 py-1 px-2 text-[9px] font-mono uppercase font-extrabold text-center transition-all cursor-pointer ${
                            isSel 
                              ? p === 'High' 
                                ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold'
                                : p === 'Medium'
                                  ? 'bg-[#daff33]/15 border border-[#daff33]/25 text-[#daff33] font-bold'
                                  : 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                              : 'text-zinc-500 border border-transparent'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 text-left font-mono">
                  <label className="text-[10px] font-mono uppercase font-black text-zinc-400 tracking-wider">
                    Sectors Dimension
                  </label>
                  <select
                    value={newTaskLabel}
                    onChange={(e) => setNewTaskLabel(e.target.value)}
                    className="w-full bg-black border border-white/10 text-xs text-zinc-300 font-mono px-3 py-1.5 rounded-xl cursor-pointer outline-none focus:border-[#daff33]/40"
                  >
                    {['Engineering', 'Design', 'Marketing', 'Research', 'Infrastructure', 'QA'].map(lbl => (
                      <option key={lbl} value={lbl} className="bg-[#0e0e11]">
                        {lbl.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Task Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono uppercase font-black text-zinc-400 tracking-wider">
                    Due Coordinates
                  </label>
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full px-3.5 py-1.5 text-xs font-mono text-white bg-black border border-white/10 rounded-xl outline-none focus:border-[#daff33]/40"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono uppercase font-black text-zinc-400 tracking-wider">
                    Or custom assignee overrides
                  </label>
                  <input
                    type="text"
                    placeholder="Type name directly..."
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3.5 py-1.5 text-xs text-white placeholder-zinc-650 bg-black border border-white/10 rounded-xl outline-none focus:border-[#daff33]/40 transition-colors"
                  />
                </div>
              </div>

              {/* Task Description */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase font-black text-zinc-400 tracking-wider">
                  Requirement Details (Description)
                </label>
                <textarea
                  placeholder="Map technical details, checklists or constraints for this sprint target..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-1.5 text-xs text-white placeholder-zinc-650 bg-black border border-white/10 rounded-xl outline-none focus:border-[#daff33]/40 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 text-right border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveNewTask}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#daff33] text-black text-xs font-mono font-extrabold uppercase rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#daff33]/15 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ALLOCATE DELIVERABLE</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
