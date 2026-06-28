/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit3, Trash2, Check, Star, Pin, Archive, RotateCcw, 
  MapPin, Clock, Calendar, Shield, Activity, Users, Layers, TrendingUp, 
  Settings, Terminal, FileText, Send, Sparkles, CheckSquare, RefreshCw, 
  Calculator, HelpCircle, HardDrive, Share2, Award, Radar, Eye, ArrowLeftRight,
  ChevronLeft, ChevronRight, CheckCircle, Info, Paperclip, Minimize2, Maximize2,
  Sliders, Palette, ArrowRight, Grid, LayoutGrid, HeartPulse, UserCheck, 
  Network, Play, Pause, Save, ZoomIn, ZoomOut, Move, Copy, Trash, FolderOpen, Download, X
} from 'lucide-react';
import { useAppStore } from '../store';
import { Task, Doc, Theme } from '../types';
import { localDB } from '../utils/db';
import InteractiveD3Graph from './InteractiveD3Graph';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

interface TacticalUtilitiesProps {
  activeSection: string;
  onNavigate?: (section: string) => void;
  onEditTask?: (task: Task) => void;
  tasks?: Task[];
  onTasksChange?: (updatedTasks: Task[]) => void;
  theme?: Theme;
}

export default function TacticalUtilities({ 
  activeSection, onNavigate, onEditTask, tasks: propTasks, onTasksChange, theme 
}: TacticalUtilitiesProps) {
  const store = useAppStore();
  const tasks = propTasks || store.tasks;
  const { 
    docs, habits, cloudFiles, currentThemeId, 
    createTask, setTaskStatus, activeWorkspaceId, addNotification 
  } = store;

  // Unified global utility state for layout options
  const [densityMode, setDensityMode] = useState<'comfortable' | 'compact' | 'ultra'>('comfortable');
  const [accentColor, setAccentColor] = useState<string>(() => localStorage.getItem('trecko_accent_color') || '#daff33');

  // Trigger local storage save for custom UI options
  const handleAccentChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('trecko_accent_color', color);
    addNotification('Accent Theme Synced', `Visual indicators updated cleanly with high contrast coordinates.`, 'info');
  };

  return (
    <div className={`space-y-6 ${
      densityMode === 'compact' ? 'text-[11px]' : densityMode === 'ultra' ? 'text-[10px]' : 'text-xs'
    }`}>
      {/* 2. Unified Header Controls for Aesthetic Customizations */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${theme ? theme.cardClass : 'border-white/5 bg-zinc-950/45'}`}>
        <div className="space-y-1 block text-left">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <h1 className="text-sm font-bold text-white uppercase tracking-wider font-sans">Command Section: Tactical Utilities</h1>
          </div>
          <p className="text-[10.5px] text-zinc-400">Micro-modules, infinite canvases, interactive radars, and biometric logs synced on client-side IndexedDB.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Theme Accent Picker */}
          <div className="flex items-center space-x-1 border border-white/10 bg-black/40 rounded-full px-2.5 py-1">
            <Palette className="w-3.5 h-3.5 text-zinc-400 mr-1" />
            {['#daff33', '#818cf8', '#34d399', '#f87171', '#fb7185', '#38bdf8'].map(color => (
              <button
                key={color}
                onClick={() => handleAccentChange(color)}
                className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${accentColor === color ? 'scale-125 ring-1 ring-white/60' : 'hover:scale-110'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {renderUtilityModule(activeSection, { 
        accentColor, densityMode, tasks, docs, habits, cloudFiles, 
        createTask, setTaskStatus, activeWorkspaceId, addNotification, onNavigate, onEditTask, onTasksChange,
        theme
      })}
    </div>
  );
}

function renderUtilityModule(section: string, context: any) {
  switch (section) {
    case 'focus_session':
      return <FocusSessionTracker {...context} />;
    case 'sticky_notes':
      return <StickyNotesHub {...context} />;
    case 'whiteboard':
      return <WhiteboardCanvas {...context} />;
    case 'team_presence':
      return <TeamPresenceDashboard {...context} />;
    case 'project_health':
      return <ProjectHealthCenter {...context} />;
    case 'habit_tracker':
      return <HabitRoutineTracker {...context} />;
    case 'goal_radar':
      return <GoalRadarCenter {...context} />;
    case 'time_analytics':
      return <TimeAnalyticsDashboard {...context} />;
    case 'quick_dock':
      return <QuickUtilityDock {...context} />;
    case 'file_vault':
      return <FileVaultComponent {...context} />;
    case 'personal_crm':
      return <PersonalCRMComponent {...context} />;
    case 'knowledge_graph':
      return <KnowledgeGraph {...context} />;
    default:
      return (
        <div className="p-12 text-center text-zinc-500 italic">
          Tactical module initialization error. Select an active utility from the sidebar.
        </div>
      );
  }
}

/* ==========================================================================
   1. FOCUS SESSION TRACKER
   ========================================================================== */
function FocusSessionTracker({ accentColor, addNotification }: any) {
  const [duration, setDuration] = useState(25); // Target in minutes
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('focus_streak_count') || '3'));
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('focus_session_history');
    return saved ? JSON.parse(saved) : [
      { id: 'fh-1', tag: 'Engineering', date: 'May 30', duration: '50 min', score: 98 },
      { id: 'fh-2', tag: 'Devops', date: 'May 31', duration: '25 min', score: 85 },
      { id: 'fh-3', tag: 'Design', date: 'Jun 01', duration: '45 min', score: 94 }
    ];
  });
  const [selectedTag, setSelectedTag] = useState('Engineering');
  const tagsList = ['Engineering', 'Design', 'Strategy', 'Writing', 'Code Audit'];

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    setSecondsLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleSessionComplete = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('focus_streak_count', String(newStreak));

    const newRecord = {
      id: `fh-${Date.now()}`,
      tag: selectedTag,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: `${duration} min`,
      score: Math.floor(Math.random() * 15) + 85
    };
    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('focus_session_history', JSON.stringify(updatedHistory));

    addNotification('Focus Session Concluded!', `Successfully completed a ${duration}m deep work sprint. Streak of ${newStreak} active!`, 'habit');
  };

  const percent = ((duration * 60 - secondsLeft) / (duration * 60)) * 100;
  const radius = 50;
  const strokeDashoffset = 2 * Math.PI * radius * (1 - percent / 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Circle Ring Control */}
      <div className="lg:col-span-4 p-5 rounded-3xl border border-white/5 bg-[#09090b]/80 flex flex-col items-center justify-center space-y-4">
        <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Deep Work Timer</h3>

        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="88" cy="88" r={radius} className="stroke-white/5 fill-none" strokeWidth="6" />
            <circle 
              cx="88" 
              cy="88" 
              r={radius} 
              className="fill-none transition-all duration-300" 
              strokeWidth="6" 
              stroke={accentColor}
              strokeDasharray={2 * Math.PI * radius}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-mono font-bold text-white tracking-wide">{formatTime(secondsLeft)}</span>
            <span className="text-[9px] text-zinc-550 font-mono font-semibold uppercase tracking-widest mt-1" style={{ color: accentColor }}>{selectedTag}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 w-full">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-grow py-2 rounded-xl text-black font-mono font-bold text-xs transition-transform tracking-wide flex items-center justify-center space-x-1.5 cursor-pointer shadow"
            style={{ backgroundColor: accentColor }}
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isActive ? 'PAUSE FLOW' : 'ENGAGE SPRINT'}</span>
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              setSecondsLeft(duration * 60);
            }}
            className="p-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex space-x-1 bg-black/40 border border-white/5 rounded-lg p-0.5 w-full">
          {[15, 25, 50, 90].map((t) => (
            <button
              key={t}
              onClick={() => {
                setIsActive(false);
                setDuration(t);
              }}
              className={`flex-1 py-1 rounded text-[10px] font-medium font-mono ${duration === t ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t}m
            </button>
          ))}
        </div>
      </div>

      {/* Focus History & Score */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 space-y-1">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest block font-mono">Streak count</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-mono text-white">{streak}</span>
              <span className="text-[10px] text-zinc-400 font-semibold" style={{ color: accentColor }}>Days Hot</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 space-y-1">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest block font-mono">Focus Rating</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">92</span>
              <span className="text-[10px] text-zinc-500">/ 100 XP</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 space-y-1">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest block font-mono">Completed Today</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-mono text-white">4.8</span>
              <span className="text-[10px] text-zinc-500">Hours Deep</span>
            </div>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="p-5 rounded-2xl border border-white/5 bg-zinc-950/45 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Historical Logs & Focus Chart</h3>
            <div className="flex items-center space-x-1">
              {tagsList.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all cursor-pointer ${selectedTag === tag ? 'text-black' : 'text-zinc-500 hover:text-white bg-white/5'}`}
                  style={selectedTag === tag ? { backgroundColor: accentColor } : {}}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="h-28 flex items-end justify-between px-2 pt-2 border-b border-white/5">
            {[4, 6, 3, 8, 5, 9, 7].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer space-y-1.5">
                <div 
                  className="w-10 rounded-t-md transition-all duration-300 relative" 
                  style={{ 
                    height: `${h * 10}px`, 
                    backgroundColor: i === 6 ? accentColor : '#27272a'
                  }}
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 text-[8px] font-mono px-1 bg-black text-white rounded border border-white/10 z-10">{h}h</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-500">Day {i + 1}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {history.map((record, idx) => (
              <div key={record.id || idx} className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="font-semibold text-white/95">{record.tag} Track</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{record.date}</span>
                </div>
                <div className="flex items-center space-x-3 text-[10px] font-mono">
                  <span className="text-zinc-400">{record.duration} Session</span>
                  <span className="text-emerald-400 font-bold">Accuracy: {record.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. STICKY NOTES HUB
   ========================================================================== */
function StickyNotesHub({ accentColor, addNotification, theme }: any) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editText, setEditText] = useState('');
  const [editColor, setEditColor] = useState('yellow');
  const [editLabel, setEditLabel] = useState('Personal');

  const colors: Record<string, string> = {
    yellow: 'bg-amber-400 text-black border-amber-300 shadow-amber-400/10',
    green: 'bg-emerald-400 text-black border-emerald-300 shadow-emerald-400/10',
    purple: 'bg-purple-500 text-white border-purple-400 shadow-purple-500/10',
    blue: 'bg-indigo-400 text-black border-indigo-300 shadow-indigo-400/10',
    zinc: 'bg-zinc-800 text-zinc-200 border-zinc-700 shadow-zinc-800/10'
  };

  useEffect(() => {
    if (editingNote) {
      setEditTitle(editingNote.title || '');
      setEditText(editingNote.text || '');
      setEditColor(editingNote.color || 'yellow');
      setEditLabel(editingNote.label || 'Personal');
    }
  }, [editingNote]);

  const handleSaveEdit = () => {
    if (!editingNote) return;
    const updated = notes.map(n => n.id === editingNote.id ? {
      ...n,
      title: editTitle.trim() || 'Quick Note',
      text: editText.trim(),
      color: editColor,
      label: editLabel.trim() || 'Personal'
    } : n);
    setNotes(updated);
    const target = updated.find(n => n.id === editingNote.id);
    if (target) localDB.put('notes', target);
    setEditingNote(null);
    addNotification('Sticky Note Updated', `Successfully updated "${editTitle}".`, 'success');
  };

  useEffect(() => {
    localDB.getAll('notes').then(res => {
      if (res && res.length > 0) {
        setNotes(res);
      } else {
        const presets = [
          { id: 'st-1', title: 'Sprint Blueprint Config', text: 'Run the esbuild compile route with --packages=external flags before publishing.', label: 'Infrastructure', color: 'yellow', isPinned: true, isArchived: false },
          { id: 'st-2', title: 'Figma Token Accents', text: 'Align the border radii elements to standard 12px for desktop coordinates.', label: 'Design', color: 'purple', isPinned: false, isArchived: false }
        ];
        setNotes(presets);
        presets.forEach(p => localDB.put('notes', p));
      }
    });
  }, []);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const item = {
      id: `st-${Date.now()}`,
      title: newTitle.trim() || 'Quick Note',
      text: newNoteText.trim(),
      label: 'Personal',
      color: selectedColor,
      isPinned: false,
      isArchived: false
    };
    const next = [item, ...notes];
    setNotes(next);
    localDB.put('notes', item);
    setNewNoteText('');
    setNewTitle('');
    addNotification('Sticky Note Saved', `Saved to IndexedDB index registry.`, 'info');
  };

  const handlePin = (id: string) => {
    const next = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    setNotes(next);
    const target = next.find(n => n.id === id);
    if (target) localDB.put('notes', target);
  };

  const handleArchive = (id: string) => {
    const next = notes.map(n => n.id === id ? { ...n, isArchived: !n.isArchived } : n);
    setNotes(next);
    const target = next.find(n => n.id === id);
    if (target) localDB.put('notes', target);
  };

  const handleDelete = (id: string) => {
    const target = notes.find(n => n.id === id);
    if (target) {
      useAppStore.getState().addToTrash({
        id: target.id,
        type: 'note',
        title: target.title || 'Quick Sticky Note',
        originalData: target
      });
    }
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    localDB.delete('notes', id);
  };

  const filtered = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchive = n.isArchived === showArchived;
    return matchesSearch && matchesArchive;
  });

  const sortedNotes = [...filtered].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="space-y-6 text-left">
      {/* Search and Creator bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Creator panel */}
        <div className={`md:col-span-5 p-4 rounded-2xl border space-y-4 ${theme ? theme.cardClass : 'border-white/5 bg-[#09090b]/80'}`}>
          <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Assemble Sticky Node</h3>
          <div className="space-y-2.5">
            <input 
              type="text" 
              placeholder="Note Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 bg-black text-white focus:outline-none focus:ring-1"
              style={{ '--tw-ring-color': accentColor } as any}
            />
            <textarea 
              placeholder="Type markdown or body content here..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              rows={3}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black text-white focus:outline-none focus:ring-1 h-24"
              style={{ '--tw-ring-color': accentColor } as any}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              {Object.keys(colors).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                    selectedColor === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c === 'yellow' ? '#facc15' : c === 'green' ? '#34d399' : c === 'purple' ? '#a855f7' : c === 'blue' ? '#818cf8' : '#27272a' }}
                />
              ))}
            </div>

            <button
              onClick={handleAddNote}
              className="px-3.5 py-1.5 text-[10px] font-mono font-bold text-black rounded-lg transition-transform cursor-pointer shadow"
              style={{ backgroundColor: accentColor }}
            >
              SAVE STICKY
            </button>
          </div>
        </div>

        {/* Filters/Search panel */}
        <div className={`md:col-span-7 p-4 rounded-2xl border flex flex-col justify-between ${theme ? theme.cardClass : 'border-white/5 bg-[#09090b]/80'}`}>
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Search Workspace Notes</h3>
            <div className="flex items-center space-x-2 bg-black py-1.5 px-3 rounded-lg border border-white/10">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Fuzzy match title, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none flex-grow border-0 p-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-[10px] text-zinc-400 font-mono">Persist stack in IndexedDB: active size ({notes.length})</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowArchived(false)}
                className={`text-[10px] px-2.5 py-1 rounded-lg shrink-0 font-mono cursor-pointer transition-all border ${
                  !showArchived 
                    ? 'bg-[#daff33]/10 text-[#daff33] border-[#daff33]/25 font-bold' 
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 border-white/10'
                }`}
              >
                Active ({notes.filter(n => !n.isArchived).length})
              </button>
              <button
                onClick={() => setShowArchived(true)}
                className={`text-[10px] px-2.5 py-1 rounded-lg shrink-0 font-mono cursor-pointer transition-all border ${
                  showArchived 
                    ? 'bg-[#daff33]/10 text-[#daff33] border-[#daff33]/25 font-bold' 
                    : 'bg-white/5 hover:bg-white/10 text-zinc-400 border-white/10'
                }`}
              >
                Archived ({notes.filter(n => n.isArchived).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Notes with active vs archive selector section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold font-mono text-zinc-450 uppercase tracking-wider">
              {showArchived ? 'ARCHIVED STICKY NOTES REGISTRY' : 'ACTIVE WORKSPACE COORDINATES'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500"> Tap any card to Edit content or colors directly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedNotes.length === 0 ? (
            <div className="col-span-full p-12 text-center text-zinc-500 italic bg-[#09090b]/40 rounded-xl border border-white/5 border-dashed">
              No notes created matching this registry view.
            </div>
          ) : (
            sortedNotes.map(n => (
              <div 
                key={n.id} 
                onClick={() => setEditingNote(n)}
                className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer hover:ring-2 hover:ring-white/20 hover:scale-[1.01] ${colors[n.color] || colors.zinc}`}
                title="Click to edit sticky note content"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h4 className="text-xs font-bold leading-tight font-sans tracking-tight">{n.title}</h4>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePin(n.id); }} 
                        className="opacity-60 hover:opacity-100 transition-all cursor-pointer p-0.5 hover:bg-black/10 rounded"
                        title={n.isPinned ? 'Unpin Note' : 'Pin Note'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${n.isPinned ? 'fill-current stroke-current scale-110' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleArchive(n.id); }} 
                        className="opacity-60 hover:opacity-100 transition-all cursor-pointer p-0.5 hover:bg-black/10 rounded"
                        title={n.isArchived ? 'Unarchive Note' : 'Archive Note'}
                      >
                        <Archive className={`w-3.5 h-3.5 ${n.isArchived ? 'text-amber-650' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} 
                        className="opacity-60 hover:opacity-100 transition-all cursor-pointer p-0.5 hover:bg-black/10 rounded"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5 float-right" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed whitespace-pre-line font-medium opacity-90">{n.text}</p>
                </div>

                <div className="pt-3.5 border-t border-black/10 mt-3 flex justify-between items-center text-[8.5px] font-bold font-mono uppercase tracking-wider opacity-60">
                  <span>🔖 {n.label || 'Personal'}</span>
                  <span>IDB ACTIVE</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Sticky Note Modal Popup */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in" id="edit-note-modal">
          <div className="relative w-full max-w-sm p-5 bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold uppercase font-mono tracking-widest text-[#daff33]">Edit Sticky Note</h3>
              <button 
                onClick={() => setEditingNote(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9.5px] font-mono font-bold text-zinc-450 uppercase tracking-wider block">Note Title</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-white/10 bg-black text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-mono font-bold text-zinc-450 uppercase tracking-wider block">Note Body Content</label>
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={4}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-white/10 bg-black text-white focus:outline-none focus:ring-1 h-28 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-zinc-455 uppercase tracking-wider block">Label / Tag</label>
                  <input 
                    type="text" 
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="e.g. Personal, Design"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-zinc-450 uppercase tracking-wider block">Accent Tone</label>
                  <div className="flex items-center space-x-1.5 h-8">
                    {Object.keys(colors).map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`w-4.5 h-4.5 rounded-full border transition-all cursor-pointer ${
                          editColor === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c === 'yellow' ? '#facc15' : c === 'green' ? '#34d399' : c === 'purple' ? '#a855f7' : c === 'blue' ? '#818cf8' : '#27272a' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2.5">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-grow py-2 text-xs font-mono font-bold text-black rounded-lg transition-transform cursor-pointer shadow text-center bg-[#daff33]"
              >
                APPLY CHANGES
              </button>
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 text-xs font-mono font-bold text-zinc-350 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   3. WHITEBOARD CANVAS
   ========================================================================== */
function WhiteboardCanvas({ accentColor, addNotification }: any) {
  const [elements, setElements] = useState<any[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'draw' | 'text' | 'shape' | 'erase'>('draw');
  const [shapeType, setShapeType] = useState<'rect' | 'circle' | 'mindmap'>('rect');
  const [drawColor, setDrawColor] = useState('#daff33');
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [drawingPoints, setDrawingPoints] = useState<any[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const isDraggingCanvas = useRef(false);
  const transformStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    localDB.getAll('boards').then(res => {
      if (res && res.length > 0) {
        setElements(res);
      } else {
        const presets = [
          { id: 'wb-1', type: 'rect', x: 120, y: 80, w: 150, h: 90, color: '#38bdf8', text: 'Main Launch Hub' },
          { id: 'wb-2', type: 'circle', x: 380, y: 130, r: 50, color: '#a855f7', text: 'Auth Proxy Node' }
        ];
        setElements(presets);
        presets.forEach(p => localDB.put('boards', p));
      }
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Relative mouse vector with respect to zoom & pan
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const canvasX = (clientX - pan.x) / zoom;
    const canvasY = (clientY - pan.y) / zoom;

    if (e.button === 1 || e.shiftKey) {
      // Middle click or drag pan trigger
      isDraggingCanvas.current = true;
      transformStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (tool === 'draw') {
      setIsDrawing(true);
      setDrawingPoints([{ x: canvasX, y: canvasY }]);
    } else if (tool === 'shape') {
      const newElem: any = {
        id: `wb-${Date.now()}`,
        type: shapeType,
        color: drawColor,
        text: shapeType === 'mindmap' ? 'Topic node' : ''
      };

      if (shapeType === 'rect') {
        newElem.x = canvasX - 50;
        newElem.y = canvasY - 30;
        newElem.w = 120;
        newElem.h = 60;
      } else if (shapeType === 'circle') {
        newElem.x = canvasX;
        newElem.y = canvasY;
        newElem.r = 44;
      } else {
        // Mindmap
        newElem.x = canvasX;
        newElem.y = canvasY;
        newElem.w = 130;
        newElem.h = 50;
      }
      const updated = [...elements, newElem];
      setElements(updated);
      localDB.put('boards', newElem);
    } else if (tool === 'text') {
      const content = prompt("Enter text for this canvas spot:") || '';
      if (content) {
        const item = {
          id: `wb-${Date.now()}`,
          type: 'text',
          x: canvasX,
          y: canvasY,
          color: drawColor,
          text: content
        };
        const updated = [...elements, item];
        setElements(updated);
        localDB.put('boards', item);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingCanvas.current) {
      setPan({
        x: e.clientX - transformStart.current.x,
        y: e.clientY - transformStart.current.y
      });
      return;
    }

    if (isDrawing && tool === 'draw') {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const canvasX = (clientX - pan.x) / zoom;
      const canvasY = (clientY - pan.y) / zoom;

      setDrawingPoints(prev => [...prev, { x: canvasX, y: canvasY }]);
    }
  };

  const handlePointerUp = () => {
    isDraggingCanvas.current = false;
    if (isDrawing && tool === 'draw') {
      setIsDrawing(false);
      if (drawingPoints.length > 1) {
        const item = {
          id: `wb-${Date.now()}`,
          type: 'path',
          points: drawingPoints,
          color: drawColor
        };
        const updated = [...elements, item];
        setElements(updated);
        localDB.put('boards', item);
      }
      setDrawingPoints([]);
    }
  };

  const handleElementDelete = (id: string, e: any) => {
    e.stopPropagation();
    const updated = elements.filter(item => item.id !== id);
    setElements(updated);
    localDB.delete('boards', id);
  };

  const handleClearAll = () => {
    setElements([]);
    elements.forEach(item => localDB.delete('boards', item.id));
    addNotification('Canvas Cleared', 'Infinite coordinates index reseted cleanly.', 'info');
  };

  return (
    <div className="space-y-4 text-left">
      {/* Control panel buttons */}
      <div className="p-3 bg-[#09090b]/80 border border-white/5 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-1.5 bg-black/40 border border-white/5 rounded-xl p-0.5">
          {[
            { id: 'draw', label: 'Draw' },
            { id: 'text', label: 'Insert Text' },
            { id: 'shape', label: 'Shapes Framework' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setTool(opt.id as any)}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                tool === opt.id ? 'bg-[#daff33] text-black font-extrabold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
              style={tool === opt.id ? { backgroundColor: accentColor } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {tool === 'shape' && (
          <div className="flex items-center space-x-1 border-l border-white/10 pl-3">
            {[
              { id: 'rect', label: 'Rectangle' },
              { id: 'circle', label: 'Circle Orbit' },
              { id: 'mindmap', label: 'Mind Map Connection' }
            ].map(sh => (
              <button
                key={sh.id}
                onClick={() => setShapeType(sh.id as any)}
                className={`px-2.5 py-0.5 rounded text-[9px] font-mono border transition-colors cursor-pointer ${
                  shapeType === sh.id ? 'border-[#daff33] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
                style={shapeType === sh.id ? { borderColor: accentColor } : {}}
              >
                {sh.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-black/40 border border-white/5 rounded-xl p-1 text-[10px] font-mono text-zinc-400 font-bold">
            <button onClick={() => setZoom(prev => Math.max(0.4, prev - 0.2))} className="p-1 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="px-1">{Math.floor(zoom * 100)}%</span>
            <button onClick={() => setZoom(prev => Math.min(2.5, prev + 0.2))} className="p-1 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>

          <button
            onClick={() => setPan({ x: 0, y: 0 })}
            className="p-1.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-white cursor-pointer"
            title="Recenter Camera Coordinates"
          >
            <Move className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearAll}
            className="p-1.5 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl font-mono text-[9px] font-bold uppercase cursor-pointer"
          >
            RESET
          </button>
        </div>
      </div>

      {/* SVG Canvas stage framework */}
      <div className="relative w-full h-[380px] bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden cursor-crosshair">
        {/* Infinite Grid Background relative to pan/zoom */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />

        <svg
          ref={svgRef}
          className="w-full h-full"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Visual Transformation Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {elements.map(elem => {
              if (elem.type === 'rect') {
                return (
                  <g key={elem.id}>
                    <rect 
                      x={elem.x} 
                      y={elem.y} 
                      width={elem.w} 
                      height={elem.h} 
                      fill="rgba(255,255,255,0.02)" 
                      stroke={elem.color} 
                      strokeWidth="2" 
                      rx="8"
                    />
                    <text 
                      x={elem.x + elem.w/2} 
                      y={elem.y + elem.h/2 + 4} 
                      fill="white" 
                      fontSize="10" 
                      textAnchor="middle"
                      className="font-mono font-bold fill-white/80"
                    >
                      {elem.text || 'Process Stage'}
                    </text>
                    <g transform={`translate(${elem.x + elem.w - 14}, ${elem.y + 4})`}>
                      <circle cx="5" cy="5" r="5" fill="rgba(239, 68, 68, 0.4)" className="cursor-pointer hover:fill-red-500" onClick={(e) => handleElementDelete(elem.id, e)} />
                    </g>
                  </g>
                );
              }

              if (elem.type === 'circle') {
                return (
                  <g key={elem.id}>
                    <circle 
                      cx={elem.x} 
                      cy={elem.y} 
                      r={elem.r} 
                      fill="rgba(255,255,255,0.02)" 
                      stroke={elem.color} 
                      strokeWidth="2"
                    />
                    <text 
                      x={elem.x} 
                      y={elem.y + 4} 
                      fill="white" 
                      fontSize="9" 
                      textAnchor="middle"
                      className="font-mono font-bold fill-white/80"
                    >
                      {elem.text || 'Sphere Orbit'}
                    </text>
                    <circle cx={elem.x + elem.r - 8} cy={elem.y - elem.r + 8} r="5" fill="rgba(239, 68, 68, 0.4)" className="cursor-pointer hover:fill-red-500" onClick={(e) => handleElementDelete(elem.id, e)} />
                  </g>
                );
              }

              if (elem.type === 'mindmap') {
                return (
                  <g key={elem.id}>
                    <rect 
                      x={elem.x - elem.w/2} 
                      y={elem.y - elem.h/2} 
                      width={elem.w} 
                      height={elem.h} 
                      fill="rgba(255,255,255,0.04)" 
                      stroke={accentColor} 
                      strokeWidth="2" 
                      rx="16"
                    />
                    <text 
                      x={elem.x} 
                      y={elem.y + 4} 
                      fill="white" 
                      fontSize="9.5" 
                      textAnchor="middle"
                      className="font-sans font-extrabold fill-zinc-100"
                    >
                      {elem.text || 'Knowledge Axis'}
                    </text>
                    <circle cx={elem.x + elem.w/2 - 10} cy={elem.y - elem.h/2 + 10} r="5" fill="rgba(239, 68, 68, 0.4)" className="cursor-pointer hover:fill-red-500" onClick={(e) => handleElementDelete(elem.id, e)} />
                  </g>
                );
              }

              if (elem.type === 'text') {
                return (
                  <g key={elem.id}>
                    <text 
                      x={elem.x} 
                      y={elem.y} 
                      fill={elem.color} 
                      fontSize="11" 
                      className="font-mono font-bold"
                    >
                      {elem.text}
                    </text>
                    <circle cx={elem.x - 8} cy={elem.y - 4} r="4" fill="rgba(239, 68, 68, 0.4)" className="cursor-pointer" onClick={(e) => handleElementDelete(elem.id, e)} />
                  </g>
                );
              }

              if (elem.type === 'path') {
                let d = `M ${elem.points[0].x} ${elem.points[0].y}`;
                for (let i = 1; i < elem.points.length; i++) {
                  d += ` L ${elem.points[i].x} ${elem.points[i].y}`;
                }
                return (
                  <g key={elem.id}>
                    <path 
                      d={d} 
                      fill="none" 
                      stroke={elem.color} 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                    <circle cx={elem.points[0].x} cy={elem.points[0].y} r="5" fill="rgba(239, 68, 68, 0.5)" className="cursor-pointer hover:fill-red-500" onClick={(e) => handleElementDelete(elem.id, e)} />
                  </g>
                );
              }

              return null;
            })}

            {/* Currently actively drafting path outline */}
            {isDrawing && drawingPoints.length > 1 && (
              <path
                d={`M ${drawingPoints[0].x} ${drawingPoints[0].y} ` + drawingPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
                fill="none"
                stroke={drawColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>
        </svg>

        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/80 rounded-lg text-[9px] text-zinc-550 font-mono flex items-center space-x-1.5 border border-white/5 uppercase tracking-wider">
          <span>⚙️ Space Drag pan: SHIFT + MOUSE Drag</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. TEAM PRESENCE DASHBOARD
   ========================================================================== */
function TeamPresenceDashboard({ accentColor }: any) {
  const [users, setUsers] = useState([
    { id: 'u1', name: 'Elena Rostova', role: 'Staff API Architect', status: 'Online', lastActive: 'Active now', task: 'Validating Gemini REST schemas', score: 'High-Flow', mood: '🔥 Deep Code' },
    { id: 'u2', name: 'Marcus Vance', role: 'Lead UX Designer', status: 'Busy', lastActive: '3m ago', task: 'Aesthetic coordinate alignments', score: 'Focusing', mood: '🎨 Creative' },
    { id: 'u3', name: 'Alex Chen', role: 'SaaS Facilitator', status: 'Away', lastActive: '20m ago', task: 'Formulating tactical blueprint', score: 'Idle', mood: '☕ Planning' },
    { id: 'u4', name: 'Sarah Jenkins', role: 'QA Engine Orchestrator', status: 'Online', lastActive: 'Active now', task: 'Writing playwrite interface tests', score: 'High-Flow', mood: '🏁 Testing' },
    { id: 'u5', name: 'Nikolai Volkov', role: 'Telemetry Specialist', status: 'Offline', lastActive: 'Yesterday', task: 'Server load metrics tracking', score: 'Offline', mood: '💤 Sleep' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-emerald-400 shadow-emerald-400/20';
      case 'Busy': return 'bg-rose-400 shadow-rose-400/20';
      case 'Away': return 'bg-amber-400 shadow-amber-400/20';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="p-4 rounded-2xl border border-white/5 bg-zinc-950/45 space-y-2">
        <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Active Workspace Pulse</h3>
        <p className="text-[10.5px] text-zinc-500">Real-time status registers of engineering nodes, active sprints coordinates, and biometrics indicators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => (
          <div key={u.id} className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 flex flex-col justify-between hover:border-white/10 transition-all space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-white uppercase text-xs">
                  {u.name.substring(0, 2)}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#09090b] ${getStatusColor(u.status)}`} />
                </div>
                <div className="block leading-tight">
                  <h4 className="text-xs font-semibold text-white/95">{u.name}</h4>
                  <span className="text-[10px] text-zinc-500 font-medium">{u.role}</span>
                </div>
              </div>

              <span className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold uppercase truncate ${
                u.score === 'High-Flow' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                u.score === 'Focusing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' :
                'bg-zinc-800/10 text-zinc-550 border border-transparent'
              }`}>{u.score}</span>
            </div>

            <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-zinc-550 font-mono block">Current Operations</span>
              <p className="text-xs text-white/80 font-medium line-clamp-1">{u.task}</p>
            </div>

            <div className="flex justify-between items-center text-[9.5px] font-mono text-zinc-500 pt-2 border-t border-white/5">
              <span>⏰ {u.lastActive}</span>
              <span className="font-sans font-bold" style={{ color: accentColor }}>Vibe: {u.mood}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   5. PROJECT HEALTH CENTER
   ========================================================================== */
function ProjectHealthCenter({ accentColor }: any) {
  const metrics = [
    { title: 'Project progress index', val: '78.4%', desc: 'Overall sprint completion ratio', progress: 78.4, indicator: '#34d399' },
    { title: 'Workspace Risk Level', val: '8.4%', desc: 'Flagged anomalies inside active nodes', progress: 8.4, indicator: '#f87171' },
    { title: 'Deadline Delay Ratio', val: 'Minimal', desc: 'Predicted delay curves from timeline', progress: 12, indicator: '#daff33' },
    { title: 'SaaS velocity weight', val: '32 pts', desc: 'Average story points completed per sprint', progress: 85, indicator: '#38bdf8' },
    { title: 'Active Burn Rate', val: '$24K', desc: 'Infrastructure metrics budget cost per sprint', progress: 62, indicator: '#bbf7d0' },
    { title: 'Team active Capacity', val: '95.2%', desc: 'Productive bandwidth logs of resources', progress: 95.2, indicator: '#daff33' }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="p-5 bg-zinc-950/45 border border-white/5 rounded-2xl">
        <h3 className="text-xs uppercase font-extrabold tracking-wider" style={{ color: accentColor }}>Sprint Diagnostics Dashboard</h3>
        <p className="text-[10.5px] font-sans text-zinc-400 mt-1">Deep telemetry analysis detailing system progress vector levels, burn capacities, and potential anomalies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-white/5 bg-[#09090b]/80 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[9.5px] font-mono font-bold uppercase text-zinc-500 tracking-wider block">{m.title}</span>
              <div className="flex items-baseline justify-between pt-0.5">
                <span className="text-2xl font-bold font-mono text-white">{m.val}</span>
                <span className="text-[9px] text-zinc-400 font-sans">{m.desc}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-[#18181b] h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${m.progress}%`, backgroundColor: m.indicator }} 
                />
              </div>
              <div className="flex justify-between items-center text-[8px] font-mono text-zinc-650 font-bold uppercase">
                <span>0.0% Bounds</span>
                <span>Optimized</span>
                <span>100% Benchmark</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   6. COMMAND PALETTE (Helper callback within UI)
   ========================================================================== */
// This component displays interactive buttons to trigger key palette controls
export function GlobalCommandBar({ accentColor, triggerAction }: any) {
  return (
    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-left space-y-2">
      <span className="text-[10px] font-bold font-mono text-orange-400 uppercase tracking-widest block">💡 COMMAND PALETTE SYSTEM REGISTER</span>
      <p className="text-[10.5px] text-zinc-450 leading-relaxed">Press <kbd className="bg-white/10 px-1 border border-white/15 rounded text-white font-mono">CTRL + K</kbd> anywhere across our environment to launch the active Fuzzy Command Center overlay instantly!</p>
    </div>
  );
}

/* ==========================================================================
   8. HABIT & ROUTINE TRACKER
   ========================================================================== */
function HabitRoutineTracker({ 
  accentColor, 
  habits: appHabits, 
  addNotification, 
  tasks, 
  onTasksChange, 
  onEditTask 
}: any) {
  // Helper to format local dates
  const formatDateLocal = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Convert array legacy logs of 7 days to actual date string keys mapping
  const initializeLegacyHabits = () => {
    // Let's assume the week of June 1, 2026 as default reference
    const baseWkDates = [
      '2026-06-01', // Mon
      '2026-06-02', // Tue
      '2026-06-03', // Wed
      '2026-06-04', // Thu
      '2026-06-05', // Fri
      '2026-06-06', // Sat
      '2026-06-07'  // Sun
    ];

    const initialRaw = [
      { id: 'hb-1', title: 'Deep Work Session', streak: 12, log: [1, 1, 0, 1, 1, 1, 1] },
      { id: 'hb-2', title: 'Code Review Grid', streak: 4, log: [1, 0, 1, 1, 0, 1, 0] },
      { id: 'hb-3', title: 'Refactor Docs Schema', streak: 3, log: [0, 1, 1, 0, 1, 1, 1] },
      { id: 'hb-4', title: 'Exercise System Sync', streak: 8, log: [1, 1, 1, 1, 1, 0, 1] }
    ];

    return initialRaw.map(item => {
      const history: Record<string, boolean> = {};
      item.log.forEach((val, idx) => {
        if (baseWkDates[idx] && val === 1) {
          history[baseWkDates[idx]] = true;
        }
      });
      return {
        id: item.id,
        title: item.title,
        streak: item.streak,
        history
      };
    });
  };

  const calculateStreak = (history: Record<string, boolean>): number => {
    let streak = 0;
    const testDate = new Date(); // Start checking from today
    while (true) {
      const key = formatDateLocal(testDate);
      if (history[key]) {
        streak++;
        testDate.setDate(testDate.getDate() - 1);
      } else {
        // If today is completed, streak was checked. If not, check yesterday's streak container.
        if (streak === 0) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = formatDateLocal(yesterday);
          if (history[yesterdayKey]) {
            testDate.setTime(yesterday.getTime());
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  const [items, setItems] = useState<any[]>(() => {
    const saved = localStorage.getItem('trecko_habits_v2_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initializeLegacyHabits();
  });

  // Save history automatically
  useEffect(() => {
    localStorage.setItem('trecko_habits_v2_history', JSON.stringify(items));
  }, [items]);

  const [newTitle, setNewTitle] = useState('');

  // Daily/Routine Task states
  const [routineTaskTitle, setRoutineTaskTitle] = useState('');
  const [routineTaskPriority, setRoutineTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskFilter, setTaskFilter] = useState<'All' | 'Active' | 'Routine' | 'Done'>('All');

  // Week selection states
  const [weekPivot, setWeekPivot] = useState<Date>(() => new Date('2026-06-03'));
  
  // Immersive Monthly Calendar States
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarActiveHabitId, setCalendarActiveHabitId] = useState('hb-1');
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(5); // June is index 5

  const getMonday = (d: Date): Date => {
    const target = new Date(d);
    const day = target.getDay();
    const diff = target.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(target.setDate(diff));
  };

  const getWeekDates = (pivot: Date): Date[] => {
    const monday = getMonday(pivot);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      dates.push(nextDay);
    }
    return dates;
  };

  const activeWeekDates = getWeekDates(weekPivot);

  const formatWeekRange = (dates: Date[]) => {
    if (dates.length < 7) return '';
    const start = dates[0];
    const end = dates[6];
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

  const toggleDayDate = (habitId: string, dateStr: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === habitId) {
        const nextHistory = { ...item.history };
        if (nextHistory[dateStr]) {
          delete nextHistory[dateStr];
        } else {
          nextHistory[dateStr] = true;
        }
        const streak = calculateStreak(nextHistory);
        return {
          ...item,
          history: nextHistory,
          streak: streak
        };
      }
      return item;
    }));
    addNotification('Habit Updated', 'Tactical completion status recorded.', 'info');
  };

  const handleAddNew = () => {
    if (!newTitle.trim()) return;
    const item = {
      id: `hb-${Date.now()}`,
      title: newTitle.trim(),
      streak: 0,
      history: {}
    };
    setItems([...items, item]);
    setNewTitle('');
    addNotification('Habit Added', `"${item.title}" registered in matrix chart tracking.`, 'info');
  };

  const countClicksInMonth = (habitId: string, year: number, month: number) => {
    const habit = items.find(h => h.id === habitId);
    if (!habit || !habit.history) return 0;
    
    let count = 0;
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    Object.keys(habit.history).forEach(key => {
      if (key.startsWith(prefix) && habit.history[key]) {
        count++;
      }
    });
    return count;
  };

  const handleMarkAllInMonth = (habitId: string, year: number, month: number, markValue: boolean) => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    setItems(prev => prev.map(item => {
      if (item.id === habitId) {
        const nextHistory = { ...item.history };
        for (let day = 1; day <= totalDays; day++) {
          const dateStr = formatDateLocal(new Date(year, month, day));
          if (markValue) {
            nextHistory[dateStr] = true;
          } else {
            delete nextHistory[dateStr];
          }
        }
        const streak = calculateStreak(nextHistory);
        return {
          ...item,
          history: nextHistory,
          streak: streak
        };
      }
      return item;
    }));
    addNotification(
      markValue ? 'Month Complete' : 'Month Cleared', 
      markValue ? 'Entire month plotted as complete.' : 'All completions for month cleared.', 
      'info'
    );
  };

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const cells: React.ReactNode[] = [];
    
    for (let i = 0; i < startOffset; i++) {
      cells.push(
        <div key={`spacer-${i}`} className="aspect-square bg-transparent border border-transparent rounded-lg" />
      );
    }
    
    for (let day = 1; day <= totalDays; day++) {
      const cellDateObj = new Date(year, month, day);
      const dateStr = formatDateLocal(cellDateObj);
      const activeHabit = items.find(h => h.id === calendarActiveHabitId);
      const isActive = !!activeHabit?.history?.[dateStr];
      const isToday = dateStr === formatDateLocal(new Date());
      
      cells.push(
        <button
          key={`day-${day}`}
          onClick={() => toggleDayDate(calendarActiveHabitId, dateStr)}
          className={`aspect-square relative rounded-xl border text-[11px] font-mono font-bold flex flex-col justify-between p-1 cursor-pointer transition-all hover:scale-105 ${
            isActive 
              ? 'text-black border-transparent font-black ring-1 ring-white/10' 
              : 'border-white/5 bg-zinc-950/40 text-zinc-400 hover:border-white/20 hover:bg-zinc-900'
          } ${isToday ? 'ring-2 ring-zinc-100' : ''}`}
          style={{
            ...(isActive ? { backgroundColor: accentColor } : {}),
          }}
          title={isActive ? `Completed on ${dateStr}` : `Incomplete on ${dateStr}`}
        >
          <span>{day}</span>
          {isToday && (
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-sky-455 rounded-full animate-pulse animate-duration-1000" title="Today" />
          )}
          {isActive && !isToday && (
            <span className="w-1.5 h-1.5 rounded-full bg-black/60 self-end mr-0.5 mb-0.5" />
          )}
        </button>
      );
    }

    return cells;
  };

  const handleToggleTaskStatus = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === 'Done' ? 'Todo' : 'Done';
    if (onTasksChange) {
      onTasksChange(tasks.map((t: any) => t.id === task.id ? { ...t, status: nextStatus } : t));
    } else {
      useAppStore.getState().setTaskStatus(task.id, nextStatus);
    }
    addNotification('Task Switched', `"${task.title}" status registered as ${nextStatus}.`, 'task');
  };

  const handleRescheduleTask = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    let d = new Date();
    if (task.dueDate) {
      try { d = new Date(task.dueDate); } catch (err) {}
    }
    d.setDate(d.getDate() + 7);
    const dateStr = d.toISOString().split('T')[0];
    if (onTasksChange) {
      onTasksChange(tasks.map((t: any) => t.id === task.id ? { ...t, dueDate: dateStr } : t));
    } else {
      useAppStore.getState().updateTask({ ...task, dueDate: dateStr });
    }
    addNotification('Task Snoozed', `Moved "${task.title}" backward by 1 week to ${dateStr}.`, 'task');
  };

  const handleCreateRoutineTask = () => {
    if (!routineTaskTitle.trim()) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      id: `task-rt-${Date.now()}`,
      title: routineTaskTitle.trim(),
      status: 'Todo',
      priority: routineTaskPriority,
      label: 'Routine',
      description: 'Recurring tactical checklist item.',
      assignee: 'Alex Chen',
      dueDate: todayStr,
      archived: false,
      subtasks: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    if (onTasksChange) {
      onTasksChange([newTask, ...tasks]);
    } else {
      useAppStore.getState().createTask(newTask);
    }
    setRoutineTaskTitle('');
    addNotification('Task Added to Planner', `"${newTask.title}" added to routine pipeline.`, 'task');
  };

  // Filter tasks based on settings
  const filteredTasks = (tasks || []).filter((t: any) => {
    if (t.archived) return false;
    if (taskFilter === 'Routine') return t.label?.toLowerCase() === 'routine' || t.title?.toLowerCase().includes('routine');
    if (taskFilter === 'Active') return t.status !== 'Done';
    if (taskFilter === 'Done') return t.status === 'Done';
    return true; // All
  });

  return (
    <div className="space-y-6 text-left">
      {/* Habits & heatmaps matrix */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Habit register & track */}
        <div className="md:col-span-5 space-y-5">
          <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 space-y-4">
            <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Register Habit</h3>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Habit Title (e.g. Exercise, Log telemetry...)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black text-white focus:outline-none focus:ring-1"
                style={{ '--tw-ring-color': accentColor } as any}
              />
            </div>
            <button
              onClick={handleAddNew}
              className="w-full h-8.5 text-[10px] font-mono font-bold text-black rounded-lg transition-transform cursor-pointer shadow"
              style={{ backgroundColor: accentColor }}
            >
              ADD HABIT MATRIX
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Weekly Activity Matrix Heatmap</h3>
              <button
                onClick={() => {
                  setCalendarActiveHabitId(items[0]?.id || 'hb-1');
                  setIsCalendarOpen(true);
                }}
                className="px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase rounded bg-white/5 border border-white/10 text-zinc-300 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <Calendar className="w-3 h-3" />
                <span>Month Calendar</span>
              </button>
            </div>

            {/* Week selection controls */}
            <div className="flex items-center justify-between bg-black/40 border border-white/5 p-1.5 rounded-xl text-[9px] font-mono text-zinc-300">
              <button
                onClick={() => {
                  const prev = new Date(weekPivot);
                  prev.setDate(prev.getDate() - 7);
                  setWeekPivot(prev);
                }}
                className="p-1 hover:text-white rounded bg-white/5 transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              <span className="font-bold uppercase tracking-wide">{formatWeekRange(activeWeekDates)}</span>
              
              <button
                onClick={() => {
                  const next = new Date(weekPivot);
                  next.setDate(next.getDate() + 7);
                  setWeekPivot(next);
                }}
                className="p-1 hover:text-white rounded bg-white/5 transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {items.map(habit => (
                <div key={habit.id} className="p-2.5 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-1.5 hover:border-white/10 transition-colors">
                  <div className="block leading-tight select-none truncate max-w-[100px]">
                    <h4 className="text-[10.5px] font-semibold text-white/95 truncate" title={habit.title}>{habit.title}</h4>
                    <span className="text-[9px] font-mono font-bold" style={{ color: accentColor }}>Streak: {habit.streak}d</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {activeWeekDates.map((dateObj, idx) => {
                      const dateStr = formatDateLocal(dateObj);
                      const isActive = !!habit.history?.[dateStr];
                      const isToday = dateStr === formatDateLocal(new Date());
                      const initials = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleDayDate(habit.id, dateStr)}
                          className={`w-8 h-8 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isActive 
                              ? 'text-black font-black' 
                              : 'border-white/5 bg-white/[0.02] text-zinc-550 hover:border-white/20'
                          } ${isToday ? 'ring-1 ring-sky-400' : ''}`}
                          style={isActive ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                          title={`${initials[idx]} - ${dateStr} (${isActive ? 'Completed' : 'Incomplete'})`}
                        >
                          <span className="text-[6.5px] uppercase font-semibold opacity-60 leading-none">{initials[idx]}</span>
                          <span className="text-[9px] font-mono leading-none mt-0.5 font-bold">{dateObj.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Month Calendar View Portal Modal */}
        {isCalendarOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 text-left animate-fade-in">
            <div className="w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[550px] md:h-[500px]">
              {/* Left Column: Habits Sidebar */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-[#0e0e11] p-5 flex flex-col select-none justify-between">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Habit Roster</h3>
                    <p className="text-[9.5px] text-zinc-500 font-sans">Select a habit to chart on target matrix.</p>
                  </div>
                  <div className="space-y-2 max-h-[220px] md:max-h-[280px] overflow-y-auto custom-scrollbar">
                    {items.map(habit => {
                      const isActive = habit.id === calendarActiveHabitId;
                      const compThisMonth = countClicksInMonth(habit.id, calendarYear, calendarMonth);
                      return (
                        <button
                          key={habit.id}
                          onClick={() => setCalendarActiveHabitId(habit.id)}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer block ${
                            isActive 
                              ? 'border-white/15 bg-white/5 shadow-inner' 
                              : 'border-transparent bg-transparent hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="truncate text-xs font-semibold text-white">{habit.title}</div>
                          <div className="flex items-center justify-between mt-1 text-[8px] font-mono text-zinc-500">
                            <span>Streak: {habit.streak}d</span>
                            <span>{compThisMonth} logged</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 hidden md:block">
                  <p className="text-[8px] font-mono text-zinc-600 leading-relaxed uppercase">
                    ● Active Tracker Matrix v2.0<br/>
                    Click any calendar day to plot completions dynamically.
                  </p>
                </div>
              </div>

              {/* Right Column: Month Calendar view */}
              <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded hover:scale-110 transition-all duration-200" style={{ backgroundColor: accentColor }} />
                        <span>{items.find(h => h.id === calendarActiveHabitId)?.title || 'Select a Habit'}</span>
                      </h2>
                      <p className="text-[9.5px] text-zinc-500 mt-0.5">Toggle date completion directly within the calendar grid.</p>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setIsCalendarOpen(false)}
                      className="p-1 px-2 text-zinc-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>

                  {/* Month selector with arrows */}
                  <div className="flex items-center justify-between bg-black/40 border border-white/5 p-2 rounded-xl text-xs font-mono">
                    <button
                      onClick={() => {
                        let prevMonth = calendarMonth - 1;
                        let prevYear = calendarYear;
                        if (prevMonth < 0) {
                          prevMonth = 11;
                          prevYear -= 1;
                        }
                        setCalendarMonth(prevMonth);
                        setCalendarYear(prevYear);
                      }}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="text-white font-bold uppercase tracking-wider select-none">
                      {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>

                    <button
                      onClick={() => {
                        let nextMonth = calendarMonth + 1;
                        let nextYear = calendarYear;
                        if (nextMonth > 11) {
                          nextMonth = 0;
                          nextYear += 1;
                        }
                        setCalendarMonth(nextMonth);
                        setCalendarYear(nextYear);
                      }}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Calendar Grid Header */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-zinc-500 font-bold uppercase mb-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days Matrix Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {generateCalendarDays(calendarYear, calendarMonth)}
                  </div>
                </div>

                {/* Quick stats & action bar */}
                <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                  <div className="flex space-x-4">
                    <div>
                      <span className="text-zinc-650 block text-[8px] uppercase font-bold">Month Compliance</span>
                      <span className="text-zinc-300 font-bold">
                        {countClicksInMonth(calendarActiveHabitId, calendarYear, calendarMonth)} Days
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-650 block text-[8px] uppercase font-bold">Consistency Rate</span>
                      <span className="text-zinc-300 font-bold">
                        {Math.round((countClicksInMonth(calendarActiveHabitId, calendarYear, calendarMonth) / new Date(calendarYear, calendarMonth + 1, 0).getDate()) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMarkAllInMonth(calendarActiveHabitId, calendarYear, calendarMonth, true)}
                      className="px-2 py-1 text-[9px] font-bold bg-zinc-900 border border-white/10 hover:border-white/20 hover:bg-zinc-800 text-zinc-300 rounded-lg cursor-pointer transition-colors"
                    >
                      Mark Month
                    </button>
                    <button
                      onClick={() => handleMarkAllInMonth(calendarActiveHabitId, calendarYear, calendarMonth, false)}
                      className="px-2 py-1 text-[9px] font-bold bg-[#f43f5e]/10 border border-[#f43f5e]/20 hover:border-[#f43f5e]/30 text-rose-450 rounded-lg cursor-pointer transition-colors"
                    >
                      Clear Month
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Routine tasks controller */}
        <div className="md:col-span-7 space-y-5">
          
          {/* Section for Quick registering operational tasks inside routine planner */}
          <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-zinc-350 tracking-wider">Queue Operational Routine Task</h3>
              <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">DUE TODAY</span>
            </div>

            <div className="flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="Task description (e.g. Back up database cluster, Sync logs)"
                value={routineTaskTitle}
                onChange={(e) => setRoutineTaskTitle(e.target.value)}
                className="flex-grow text-xs px-3 py-1.5 h-8.5 rounded-lg border border-white/10 bg-black text-white focus:outline-none placeholder-zinc-500"
              />

              <select
                value={routineTaskPriority}
                onChange={(e: any) => setRoutineTaskPriority(e.target.value)}
                className="px-2 h-8.5 text-[9.5px] font-mono bg-black text-zinc-300 border border-white/10 rounded-lg outline-none cursor-pointer font-bold"
              >
                <option value="High">HIGH</option>
                <option value="Medium">MED</option>
                <option value="Low">LOW</option>
              </select>

              <button
                onClick={handleCreateRoutineTask}
                className="px-3.5 h-8.5 text-[10px] font-mono font-bold text-black rounded-lg transition-all shrink-0 cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                ADD TASK
              </button>
            </div>
          </div>

          {/* Connected Task List Checklist */}
          <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5 block">
                <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Operational Pipeline Checklist</h3>
                <p className="text-[9.5px] text-zinc-500">Live synchronization with dynamic sprint due dates.</p>
              </div>

              {/* Checklist Segment Toggles */}
              <div className="flex items-center space-x-1 border border-white/10 bg-black p-0.5 rounded-full shrink-0 self-start sm:self-center">
                {[
                  { id: 'All', label: 'ALL' },
                  { id: 'Active', label: 'ACTIVE' },
                  { id: 'Routine', label: 'ROUTINE' },
                  { id: 'Done', label: 'DONE' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setTaskFilter(filter.id as any)}
                    className={`px-2 py-0.5 rounded-full text-[8px] font-bold font-mono transition-all cursor-pointer ${
                      taskFilter === filter.id 
                        ? 'text-black' 
                        : 'text-zinc-400 hover:text-[#fff]'
                    }`}
                    style={taskFilter === filter.id ? { backgroundColor: accentColor } : {}}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Render Checklist */}
            <div className="space-y-2 max-h-[295px] overflow-y-auto custom-scrollbar pr-0.5">
              {filteredTasks.map((t: any) => {
                const isFinished = t.status === 'Done';
                return (
                  <div
                    key={t.id}
                    onClick={() => { if (onEditTask) onEditTask(t); }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all cursor-pointer group ${
                      isFinished 
                        ? 'bg-emerald-505/5 border-emerald-500/22 text-emerald-350 line-through opacity-80' 
                        : 'bg-zinc-950/70 border-white/5 hover:border-white/10 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      {/* Interactive toggle Status trigger */}
                      <button
                        onClick={(e) => handleToggleTaskStatus(t, e)}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                          isFinished 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450' 
                            : 'border-[#555] bg-white/5 text-transparent hover:bg-white/10'
                        }`}
                      >
                        <Check className="w-3 h-3 hover:text-indigo-400" />
                      </button>

                      <div className="truncate leading-tight block">
                        <span className="text-[11px] font-medium text-zinc-200 block truncate leading-normal">{t.title}</span>
                        <div className="flex items-center space-x-2 text-[8px] font-mono text-zinc-550 pt-0.5">
                          <span className={`${
                            t.priority === 'High' ? 'text-red-400' :
                            t.priority === 'Medium' ? 'text-indigo-400' : 'text-zinc-500'
                          } font-bold uppercase`}>{t.priority}</span>
                          <span>•</span>
                          <span className="uppercase text-zinc-500">{t.label || 'SECTOR'}</span>
                          {t.dueDate && (
                            <>
                              <span>•</span>
                              <span className="text-zinc-400 font-bold bg-[#daff33]/5 px-1.5 py-0.2 rounded border border-[#daff33]/15">{t.dueDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Postpone task 1 week shortcut */}
                      <button
                        onClick={(e) => handleRescheduleTask(t, e)}
                        className="px-2 py-1 h-6 bg-zinc-800 hover:bg-indigo-600 hover:text-white rounded text-[8px] font-mono border border-white/5 text-zinc-400 font-bold cursor-pointer"
                        title="Postpone 1 week forward"
                      >
                        +1 WK
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="text-center py-12 text-zinc-600 font-sans italic text-[10px]">
                  No operational items in this checklist. Pipeline synchronized!
                </div>
              )}
            </div>

            {/* Checklist progress banner */}
            {filteredTasks.length > 0 && (
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase font-black pt-2 border-t border-white/[0.03]">
                <span>Progress Matrix Tracker</span>
                <span>
                  {filteredTasks.filter((t: any) => t.status === 'Done').length} / {filteredTasks.length} Done ({Math.round((filteredTasks.filter((t: any) => t.status === 'Done').length / filteredTasks.length) * 100)}%)
                </span>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

/* ==========================================================================
   9. GOAL RADAR
   ========================================================================== */
function GoalRadarCenter({ accentColor }: any) {
  const [data, setData] = useState([
    { subject: 'Learning', A: 85, fullMark: 100 },
    { subject: 'Career', A: 78, fullMark: 100 },
    { subject: 'Finance', A: 60, fullMark: 100 },
    { subject: 'Health', A: 70, fullMark: 100 },
    { subject: 'Projects', A: 95, fullMark: 100 },
    { subject: 'Relationships', A: 68, fullMark: 100 },
  ]);

  const handleValChange = (index: number, val: number) => {
    setData(prev => prev.map((item, idx) => idx === index ? { ...item, A: val } : item));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      <div className="lg:col-span-5 p-5 rounded-3xl border border-white/5 bg-[#09090b]/80 space-y-4">
        <h3 className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Configure Goal Vector Scale</h3>

        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={item.subject} className="space-y-1">
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="font-semibold text-white/90">{item.subject} Status</span>
                <span className="font-mono text-zinc-400 font-bold" style={{ color: accentColor }}>{item.A}% Target</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={item.A}
                onChange={(e) => handleValChange(idx, parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-[#daff33]"
                style={{ accentColor: accentColor } as any}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-7 p-5 rounded-3xl border border-white/5 bg-zinc-950/45 flex flex-col justify-between min-h-[340px]">
        <h3 className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Dynamic Radar Alignment Map</h3>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={10} />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
              <RechartsRadar 
                name="Sovereign Target" 
                dataKey="A" 
                stroke={accentColor} 
                fill={accentColor} 
                fillOpacity={0.2} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   10. TIME ANALYTICS DASHBOARD
   ========================================================================== */
function TimeAnalyticsDashboard({ accentColor }: any) {
  const [selectedRange, setSelectedRange] = useState<'weekly' | 'categories'>('weekly');

  const dailyTimeData = [
    { name: 'Mon', hours: 4.2 },
    { name: 'Tue', hours: 5.5 },
    { name: 'Wed', hours: 6.8 },
    { name: 'Thu', hours: 7.2 },
    { name: 'Fri', hours: 5.0 },
    { name: 'Sat', hours: 3.1 },
    { name: 'Sun', hours: 4.8 }
  ];

  const categoryPieData = [
    { name: 'Engineering', value: 45, color: '#daff33' },
    { name: 'Architecture', value: 25, color: '#38bdf8' },
    { name: 'Figma Prototyping', value: 15, color: '#a855f7' },
    { name: 'Operations Spec', value: 15, color: '#fb7185' }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="p-4 rounded-xl border border-white/5 bg-[#09090b]/80 flex justify-between items-center">
        <h3 className="text-xs uppercase font-bold text-zinc-300 tracking-wider">Time Allocation Telemetry</h3>
        <div className="space-x-1 p-0.5 bg-black/40 border border-white/5 rounded-lg flex">
          <button 
            onClick={() => setSelectedRange('weekly')} 
            className={`px-3 py-1 rounded text-[10px] font-semibold cursor-pointer ${selectedRange === 'weekly' ? 'bg-[#daff33] text-black font-extrabold' : 'text-zinc-500 hover:text-white'}`}
            style={selectedRange === 'weekly' ? { backgroundColor: accentColor } : {}}
          >
            Weekly Workload
          </button>
          <button 
            onClick={() => setSelectedRange('categories')} 
            className={`px-3 py-1 rounded text-[10px] font-semibold cursor-pointer ${selectedRange === 'categories' ? 'bg-[#daff33] text-black font-extrabold' : 'text-zinc-400 hover:text-white'}`}
            style={selectedRange === 'categories' ? { backgroundColor: accentColor } : {}}
          >
            By Categories
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {selectedRange === 'weekly' ? (
          <>
            <div className="lg:col-span-8 p-5 bg-zinc-950/45 border border-white/5 rounded-3xl h-64 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider">Activity timeline flow (Daily Focus Hours)</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTimeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '10px', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="hours" stroke={accentColor} strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 p-5 bg-[#09090b]/80 border border-white/5 rounded-3xl flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider">Efficiency quotient</span>
              <div className="space-y-3.5">
                <div className="block leading-none">
                  <span className="text-3xl font-extrabold font-mono text-white">93.4%</span>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-snug">Average productive alignment rating for the past 7 active calendar steps.</p>
                </div>
                <div className="w-full bg-[#18181b] h-1 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '93.4%', backgroundColor: accentColor }} />
                </div>
              </div>
              <span className="text-[8.5px] font-mono text-zinc-550 border-t border-white/5 pt-2 uppercase tracking-wide">SYSTEM TELEMETRY ONLINE</span>
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 p-5 bg-zinc-950/45 border border-white/5 rounded-3xl flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 flex flex-col space-y-3 text-left">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Metrics Allocation Index</h4>
              <div className="space-y-2">
                {categoryPieData.map((pt, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10.5px]">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: pt.color }} />
                      <span className="font-semibold text-white/90">{pt.name}</span>
                    </div>
                    <span className="font-mono text-zinc-500">{pt.value}% Focus Ratio</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   11. QUICK UTILITY DOCK & MINI MODALS
   ========================================================================== */
function QuickUtilityDock({ accentColor }: any) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Modal Calculator states
  const [calcInput, setCalcInput] = useState('');
  const handleCalcBtn = (char: string) => {
    if (char === 'C') setCalcInput('');
    else if (char === '=') {
      try {
        const res = Function(`"use strict"; return (${calcInput})`)();
        setCalcInput(String(res));
      } catch (e) {
        setCalcInput('Err');
      }
    } else {
      setCalcInput(prev => prev + char);
    }
  };

  // Stopwatch States
  const [swTime, setSwTime] = useState(0);
  const [isSwActive, setIsSwActive] = useState(false);
  const swRef = useRef<any>(null);

  const toggleSw = () => {
    if (isSwActive) {
      clearInterval(swRef.current);
    } else {
      swRef.current = setInterval(() => {
        setSwTime(prev => prev + 10);
      }, 10);
    }
    setIsSwActive(!isSwActive);
  };

  const resetSw = () => {
    clearInterval(swRef.current);
    setSwTime(0);
    setIsSwActive(false);
  };

  const formatSw = (t: number) => {
    const min = Math.floor(t / 60000);
    const sec = Math.floor((t % 60000) / 1000);
    const ms = Math.floor((t % 1000) / 10);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-left">
      <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/45 space-y-1.5">
        <h3 className="text-xs uppercase font-extrabold tracking-wider" style={{ color: accentColor }}>Tactical Action Center Dock</h3>
        <p className="text-[10px] text-zinc-500 font-sans">Toggle popover terminal modals to compute conversion formulas, clock parameters, and sprint chronometers.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 pt-2">
        {[
          { id: 'calc', label: 'Calculator Matrix', icon: <Calculator className="w-5 h-5" /> },
          { id: 'world_clock', label: 'World Clock Grid', icon: <Clock className="w-5 h-5" /> },
          { id: 'converter', label: 'Unit Converter', icon: <ArrowLeftRight className="w-5 h-5" /> },
          { id: 'stopwatch', label: 'Chronometer', icon: <Activity className="w-5 h-5" /> }
        ].map(dock => (
          <button
            key={dock.id}
            onClick={() => setActiveModal(dock.id)}
            className="p-5 rounded-2xl bg-[#09090b]/80 border border-white/5 hover:border-white/10 text-center hover:bg-white/[0.02] flex flex-col items-center justify-center space-y-2.5 transition-all cursor-pointer group"
          >
            <div className="p-3 bg-white/5 group-hover:bg-white/10 rounded-xl transition-colors text-white" style={{ color: accentColor }}>
              {dock.icon}
            </div>
            <span className="text-[10px] font-bold font-mono tracking-wider text-zinc-400 group-hover:text-white uppercase leading-none">{dock.label}</span>
          </button>
        ))}
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d0f]/95 shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10.5px] font-mono font-bold text-white uppercase tracking-wider">🛠️ {activeModal.replace('_', ' ').toUpperCase()} INTERFACE</span>
              <button onClick={() => setActiveModal(null)} className="text-zinc-500 hover:text-white transition-all cursor-pointer"><Minimize2 className="w-4 h-4" /></button>
            </div>

            {activeModal === 'calc' && (
              <div className="space-y-3.5">
                <div className="h-10 px-3 bg-black border border-white/10 rounded-lg flex items-center justify-end">
                  <span className="text-sm font-mono font-bold string text-white">{calcInput || '0'}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
                  {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map(ch => (
                    <button
                      key={ch}
                      onClick={() => handleCalcBtn(ch)}
                      className={`h-9 rounded-lg border flex items-center justify-center font-bold text-white hover:bg-white/10 transition-colors cursor-pointer ${
                        ch === '=' ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/5'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'stopwatch' && (
              <div className="space-y-4 text-center">
                <div className="text-3xl font-mono font-bold text-white">{formatSw(swTime)}</div>
                <div className="flex space-x-2">
                  <button
                    onClick={toggleSw}
                    className="flex-1 py-1.5 text-xs text-black font-semibold rounded-lg shadow cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isSwActive ? 'PAUSE CHRONO' : 'START CHRONO'}
                  </button>
                  <button
                    onClick={resetSw}
                    className="px-3 border border-white/10 hover:border-white/20 text-white rounded-lg transition-all cursor-pointer"
                  >
                    RESET
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'world_clock' && (
              <div className="space-y-2 text-xs">
                {[
                  { name: 'London (UTC)', time: new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London' }) },
                  { name: 'Tokyo (JST)', time: new Date().toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo' }) },
                  { name: 'New York (EDT)', time: new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York' }) },
                  { name: 'San Francisco', time: new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' }) }
                ].map(clock => (
                  <div key={clock.name} className="flex justify-between items-center p-2.5 bg-black rounded-lg border border-white/5">
                    <span className="font-bold text-white/90">{clock.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{clock.time}</span>
                  </div>
                ))}
              </div>
            )}

            {activeModal === 'converter' && (
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="space-y-1 block text-left">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Input Distance Metric</span>
                  <div className="flex space-x-2 items-center">
                    <span className="p-2 border border-white/15 bg-black rounded text-[#daff33] font-mono">1 mile</span>
                    <span className="text-zinc-650 opacity-40">➔</span>
                    <span className="p-2 border border-white/15 bg-black rounded text-zinc-300 font-mono">1.609 km</span>
                  </div>
                </div>
                <div className="space-y-1 block text-left pt-2">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Weight Metric conversion</span>
                  <div className="flex space-x-2 items-center">
                    <span className="p-2 border border-white/15 bg-black rounded text-[#daff33] font-mono">1 kg</span>
                    <span className="text-zinc-650 opacity-40">➔</span>
                    <span className="p-2 border border-white/15 bg-black rounded text-zinc-300 font-mono">2.204 lbs</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   12. FILE VAULT (Local base64 documents upload & persistence DB)
   ========================================================================== */
function FileVaultComponent({ accentColor, addNotification }: any) {
  const [files, setFiles] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileContents, setSelectedFileContents] = useState<string | null>(null);

  useEffect(() => {
    localDB.getAll('files').then(res => {
      setFiles(res || []);
    });
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (rawFile) {
      processFile(rawFile);
    }
  };

  const processFile = (rawFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      const cloudItem = {
        id: `f-vault-${Date.now()}`,
        name: rawFile.name,
        size: `${(rawFile.size / 1024).toFixed(1)} KB`,
        type: rawFile.type || 'Document',
        category: rawFile.name.endsWith('.pdf') ? 'PDF' : rawFile.name.endsWith('.docx') ? 'DOCX' : 'Markdown',
        tag: activeFolder === 'All' ? 'Documents' : activeFolder,
        dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        contentBase64: b64
      };
      const updated = [cloudItem, ...files];
      setFiles(updated);
      localDB.put('files', cloudItem);
      addNotification('Vessel Saved in File Vault', `Saved "${rawFile.name}" securely.`, 'info');
    };
    reader.readAsDataURL(rawFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const rawFile = e.dataTransfer.files?.[0];
    if (rawFile) {
      processFile(rawFile);
    }
  };

  const handleDelete = (id: string, e: any) => {
    e.stopPropagation();
    const target = files.find(f => f.id === id);
    if (target) {
      useAppStore.getState().addToTrash({
        id: target.id,
        type: 'file',
        title: target.name || 'Sovereign Asset Document',
        originalData: target
      });
    }
    const next = files.filter(f => f.id !== id);
    setFiles(next);
    localDB.delete('files', id);
  };

  const filtered = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolder === 'All' ? true : f.tag === activeFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Folders and files upload action */}
      <div className="lg:col-span-4 space-y-4">
        {/* Drag Over Area */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-6 border-2 border-dashed rounded-3xl text-center space-y-4 transition-all ${
            isDragOver ? 'bg-white/5 border-[#daff33]' : 'border-white/10 bg-[#09090b]/80'
          }`}
          style={isDragOver ? { borderColor: accentColor } : {}}
        >
          <HardDrive className="w-8 h-8 text-zinc-500 mx-auto" style={{ color: accentColor }} />
          <div className="space-y-1 block leading-none">
            <span className="text-xs font-bold text-white tracking-wide">Drag & Drop Binary Files</span>
            <p className="text-[10px] text-zinc-500">Supports PDF, DOCX, Images, and plain Markdown files.</p>
          </div>

          <label className="inline-block px-3.5 py-1.5 text-[9px] font-mono font-bold text-black rounded-lg cursor-pointer hover:opacity-90 shadow uppercase" style={{ backgroundColor: accentColor }}>
            BROWSE LOCAL DEVICE
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* Categories Directories menu */}
        <div className="p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase text-zinc-500 tracking-wider">Local Folders Tree</h3>
          <div className="space-y-1">
            {['All', 'Documents', 'Engineering', 'Marketing', 'Figma Assets'].map(folder => (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  activeFolder === folder ? 'bg-white/5 text-white font-bold border border-white/10' : 'text-zinc-550 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FolderOpen className={`w-3.5 h-3.5 ${activeFolder === folder ? 'text-[#daff33]' : 'text-zinc-550'}`} style={activeFolder === folder ? { color: accentColor } : {}} />
                  <span>{folder}</span>
                </div>
                <span className="text-[9.5px] font-mono opacity-60">({folder === 'All' ? files.length : files.filter(f => f.tag === folder).length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Files List mapping */}
      <div className="lg:col-span-8 p-5 rounded-3xl border border-white/5 bg-zinc-950/45 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3.5 sm:items-center sm:justify-between">
          <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">File Vault Ledger ({filtered.length})</h3>

          <div className="flex items-center space-x-1 px-3 py-1 bg-black/40 border border-white/10 rounded-xl max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Fuzzy title match..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none border-0 p-0"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-zinc-650 italic">Empty Vault database ledger.</p>
          ) : (
            filtered.map(f => (
              <div 
                key={f.id} 
                className="p-3 bg-black/40 hover:bg-[#141418] border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between gap-4 transition-all cursor-pointer group"
                onClick={() => setSelectedFileContents(f.contentBase64 || '# No file base64 data available.')}
              >
                <div className="flex items-center space-x-3 text-left">
                  <FileText className={`w-4 h-4 shrink-0`} style={{ color: accentColor }} />
                  <div className="block leading-tight">
                    <span className="text-xs font-bold text-white/95 line-clamp-1">{f.name}</span>
                    <span className="text-[8.5px] font-mono font-semibold uppercase opacity-65" style={{ color: accentColor }}>Size: {f.size} • Added {f.dateAdded}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[8.5px] font-mono border border-white/10 px-2 py-0.5 rounded uppercase font-bold text-white/40">{f.category || 'Mime'}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const content = f.contentBase64;
                      const link = document.createElement('a');
                      if (content) {
                        link.href = content;
                      } else {
                        const blob = new Blob([`Security coordinate data for offline storage: ${f.name}`], { type: 'text/markdown' });
                        link.href = URL.createObjectURL(blob);
                      }
                      link.download = f.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-all text-[11px] cursor-pointer"
                    title="Download document file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => handleDelete(f.id, e)} className="opacity-0 group-hover:opacity-100 p-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/25 transition-all text-[11px] cursor-pointer" title="Delete file">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedFileContents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d0d0f]/95 shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[10.5px] font-mono font-bold text-white uppercase tracking-wider">📄 Binary Previewer</span>
              <button onClick={() => setSelectedFileContents(null)} className="text-zinc-500 hover:text-white transition-all cursor-pointer"><Minimize2 className="w-4 h-4" /></button>
            </div>
            <div className="p-4 bg-black border border-white/10 rounded-xl h-60 overflow-y-auto custom-scrollbar font-mono text-[9px] text-zinc-500 select-all whitespace-pre-wrap break-all">
              {selectedFileContents}
            </div>
            <div className="text-[9.5px] text-zinc-550 italic uppercase font-mono">Persisted encrypted index data inside IndexedDB</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   14. PERSONAL CRM
   ========================================================================== */
function PersonalCRMComponent({ accentColor, addNotification }: any) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStatus, setNewStatus] = useState<'Warm Reachout' | 'Contract' | 'Negotiating' | 'Interview' | 'Hired'>('Warm Reachout');
  const [newNotes, setNewNotes] = useState('');

  const stages: ('Warm Reachout' | 'Contract' | 'Negotiating' | 'Interview' | 'Hired')[] = [
    'Warm Reachout', 'Contract', 'Negotiating', 'Interview', 'Hired'
  ];

  useEffect(() => {
    localDB.getAll('crm').then(res => {
      if (res && res.length > 0) {
        setContacts(res);
      } else {
        const presets = [
          { id: 'c-1', name: 'Nikolai Volkov', company: 'Google Inc', status: 'Negotiating', notes: 'Discuss developer project roadmap credentials.', followUpDate: '2026-06-15' },
          { id: 'c-2', name: 'Elena Rostova', company: 'YCombinator SaaS', status: 'Contract', notes: 'Sovereign systems integration contract finalized.', followUpDate: '2026-06-19' }
        ];
        setContacts(presets);
        presets.forEach(p => localDB.put('crm', p));
      }
    });
  }, []);

  const handleAddContact = () => {
    if (!newName.trim()) return;
    const item = {
      id: `c-crm-${Date.now()}`,
      name: newName.trim(),
      company: newCompany.trim() || 'Unassigned Workspace',
      status: newStatus,
      notes: newNotes.trim(),
      followUpDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
    };
    const next = [...contacts, item];
    setContacts(next);
    localDB.put('crm', item);
    setNewName('');
    setNewCompany('');
    setNewNotes('');
    addNotification('CRM Contact Added', `"${item.name}" registered securely.`, 'info');
  };

  const updateContactStatus = (id: string, newSt: any) => {
    const next = contacts.map(c => c.id === id ? { ...c, status: newSt } : c);
    setContacts(next);
    const target = next.find(c => c.id === id);
    if (target) localDB.put('crm', target);
  };

  const handleDelete = (id: string) => {
    const target = contacts.find(c => c.id === id);
    if (target) {
      useAppStore.getState().addToTrash({
        id: target.id,
        type: 'contact',
        title: target.name || 'CRM Contact Entry',
        originalData: target
      });
    }
    const next = contacts.filter(c => c.id !== id);
    setContacts(next);
    localDB.delete('crm', id);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Search and Creator bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Creator panel */}
        <div className="md:col-span-1 p-4 rounded-2xl border border-white/5 bg-[#09090b]/80 space-y-4 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase text-zinc-300 tracking-wider mb-3.5">Assemble Contact</h3>
            <div className="space-y-2.5">
              <input 
                type="text" 
                placeholder="Full Name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black text-white focus:outline-none"
              />
              <input 
                type="text" 
                placeholder="Company / Source..."
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black text-white focus:outline-none"
              />
              <select 
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black text-white focus:outline-none uppercase font-mono tracking-wider cursor-pointer h-9"
              >
                {stages.map(st => (
                  <option key={st} value={st} className="bg-zinc-950">{st}</option>
                ))}
              </select>
              <textarea 
                placeholder="Notes / Actions summary..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={2}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-black text-white focus:outline-none h-14"
              />
            </div>
          </div>
          <button
            onClick={handleAddContact}
            className="w-full h-9 text-[10px] font-mono font-bold text-black rounded-lg transition-transform cursor-pointer shadow uppercase mt-4"
            style={{ backgroundColor: accentColor }}
          >
            ADD CRM ENTRY
          </button>
        </div>

        {/* Kanban Board of Contacts */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-5 gap-3">
          {stages.map(st => {
            const colContacts = contacts.filter(c => c.status === st);
            return (
              <div key={st} className="p-3 bg-zinc-950/45 border border-white/5 rounded-2xl space-y-3 min-h-[300px]">
                <div className="flex justify-between items-center pb-2 border-b border-white/5 select-none uppercase font-mono">
                  <span className="text-[9px] font-bold text-white/50 tracking-wider leading-none">{st}</span>
                  <span className="text-[9px] font-bold px-1.5 bg-white/5 text-zinc-400 rounded-full leading-none">{colContacts.length}</span>
                </div>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                  {colContacts.map(c => (
                    <div key={c.id} className="p-3 bg-[#0d0d0f] hover:bg-[#141418] border border-white/5 rounded-xl text-xs space-y-2 relative group transition-all">
                      <div className="block leading-tight">
                        <h4 className="font-bold text-white/95 line-clamp-1">{c.name}</h4>
                        <span className="text-[9.5px] text-zinc-500 font-medium font-mono block leading-none mt-0.5">{c.company}</span>
                      </div>

                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{c.notes || 'No notes drafted'}</p>

                      <div className="flex items-center justify-between text-[8px] font-mono text-zinc-550 border-t border-white/5 pt-1.5">
                        <span>⌛ {c.followUpDate}</span>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => handleDelete(c.id)} className="opacity-0 group-hover:opacity-100 text-rose-450 hover:text-rose-400 cursor-pointer text-[10px]">DELETE</button>
                        </div>
                      </div>

                      {/* Direction Shift Buttons */}
                      <div className="flex justify-between items-center pt-1 stroke-current text-[8px] opacity-40 hover:opacity-100">
                        <button 
                          disabled={stages.indexOf(st) === 0}
                          onClick={() => updateContactStatus(c.id, stages[stages.indexOf(st) - 1])}
                          className="px-1 py-0.2 hover:text-[#daff33] rounded cursor-pointer leading-none font-mono font-bold"
                          style={{ color: accentColor }}
                        >
                          ◀
                        </button>
                        <button 
                          disabled={stages.indexOf(st) === stages.length - 1}
                          onClick={() => updateContactStatus(c.id, stages[stages.indexOf(st) + 1])}
                          className="px-1 py-0.2 hover:text-[#daff33] rounded cursor-pointer leading-none font-mono font-bold"
                          style={{ color: accentColor }}
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   15. KNOWLEDGE GRAPH
   ========================================================================== */
function KnowledgeGraph({ accentColor, tasks: propTasks, docs: propDocs, habits: propHabits }: any) {
  const store = useAppStore();
  const tasks = propTasks || store.tasks;
  const docs = propDocs || store.docs;
  const habits = propHabits || store.habits;
  const { 
    updateTask, updateDoc, toggleHabitComplete, 
    setActiveMenu, setActiveDocId, createTask, createDoc, 
    createHabit, addNotification 
  } = store;

  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; group: string; details: string; originalId?: string } | null>(null);

  // Spawner form states
  const [isSpawning, setIsSpawning] = useState(false);
  const [spawnType, setSpawnType] = useState<'task' | 'doc' | 'habit'>('task');
  const [spawnTitle, setSpawnTitle] = useState('');
  const [spawnDetails, setSpawnDetails] = useState('');
  const [spawnStatus, setSpawnStatus] = useState<'Todo' | 'In Progress' | 'In Review' | 'Done'>('Todo');

  // Load selection details dynamically from local state/store if it changes
  const getSelectedNodeDetails = () => {
    if (!selectedNode) return null;
    if (selectedNode.id === 'root') {
      return {
        id: 'root',
        label: 'CMD Center Root',
        group: 'nexus',
        details: 'The sovereign workspace anchor linking all knowledge files, milestones, and habit routines under local IndexedDB.',
      };
    }

    if (selectedNode.group === 'specifications') {
      const doc = docs.find((d: any) => d.id === selectedNode.originalId);
      if (doc) {
        return {
          id: selectedNode.id,
          originalId: doc.id,
          label: doc.title,
          group: 'specifications',
          details: doc.content || '(Empty document text content)',
          raw: doc
        };
      }
    }

    if (selectedNode.group === 'milestones') {
      const t = tasks.find((tk: any) => tk.id === selectedNode.originalId);
      if (t) {
        return {
          id: selectedNode.id,
          originalId: t.id,
          label: t.title,
          group: 'milestones',
          details: t.description || 'Sprint task registered with index parameters.',
          status: t.status,
          raw: t
        };
      }
    }

    if (selectedNode.group === 'habits') {
      const h = habits.find((hb: any) => hb.id === selectedNode.originalId);
      if (h) {
        return {
          id: selectedNode.id,
          originalId: h.id,
          label: h.title,
          group: 'habits',
          details: `Current Streak tracking metrics: ${h.streak || 0} active days logged recently.`,
          streak: h.streak || 0,
          completedToday: h.completedToday,
          raw: h
        };
      }
    }

    return selectedNode;
  };

  const activeDetails = getSelectedNodeDetails();

  // Handle SPAWN submit
  const handleSpawnNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spawnTitle.trim()) return;

    if (spawnType === 'task') {
      const newTask = {
        title: spawnTitle.trim(),
        description: spawnDetails.trim() || 'Spawned directly from interactive topology network.',
        status: spawnStatus,
        priority: 'Medium' as any,
        tags: ['topology-spawn'],
        subtasks: [],
        comments: []
      };
      createTask(newTask);
      addNotification('Task Spawned', `"${spawnTitle}" connected successfully to CMD Center Root locus.`, 'task');
    } else if (spawnType === 'doc') {
      const newD = {
        title: spawnTitle.trim(),
        content: spawnDetails.trim() || 'Spawned documentation schema.',
        category: 'Wiki Document'
      };
      createDoc(newD);
      addNotification('Document Connected', `"${spawnTitle}" specification node published to sidebar index.`, 'info');
    } else if (spawnType === 'habit') {
      createHabit(spawnTitle.trim());
      addNotification('Habit Synced', `"${spawnTitle}" routine target linked to bio-metric diagnostics radar.`, 'habit');
    }

    setIsSpawning(false);
    setSpawnTitle('');
    setSpawnDetails('');
    setSpawnStatus('Todo');
  };

  // Build current network topology nodes
  const nodes: any[] = [];
  const links: any[] = [];

  // Anchor Node
  nodes.push({ id: 'root', label: 'CMD Center Root', group: 'nexus', details: 'Sovereign Workspace OS core coordinates.' });

  // Load wiki doc nodes
  docs.forEach((d: any, idx: number) => {
    const nodeId = `doc-${d.id}`;
    nodes.push({
      id: nodeId,
      label: d.title,
      group: 'specifications',
      originalId: d.id,
      details: d.content || d.title
    });
    links.push({ source: 'root', target: nodeId });
  });

  // Load tasks
  tasks.forEach((t: any, idx: number) => {
    const nodeId = `task-${t.id}`;
    const statusColor = t.status === 'Done' ? 'emerald' : 'yellow';
    nodes.push({
      id: nodeId,
      label: t.title,
      group: 'milestones',
      originalId: t.id,
      details: t.description || t.title,
      status: t.status
    });
    links.push({ source: 'root', target: nodeId });

    // Link task back to documents dynamically based on tags/title alignment for organic layout
    if (docs.length > 0) {
      const docTarget = docs[idx % docs.length];
      links.push({ source: nodeId, target: `doc-${docTarget.id}`, type: 'cross' });
    }
  });

  // Load Habits
  habits.forEach((h: any, idx: number) => {
    const nodeId = `habit-${h.id}`;
    nodes.push({
      id: nodeId,
      label: h.title,
      group: 'habits',
      originalId: h.id,
      details: `Active tracking. Streak: ${h.streak || 0} days.`
    });
    links.push({ source: 'root', target: nodeId });
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* SVG Canvas Area */}
      <div className="lg:col-span-8 p-5 rounded-3xl border border-white/5 bg-zinc-950/45 flex flex-col justify-between min-h-[380px] relative">
        <div className="flex items-center justify-between mb-2">
          <div className="space-y-0.5">
            <h3 className="text-xs uppercase font-extrabold text-zinc-300 tracking-wider">Interactive Topology Network</h3>
            <p className="text-[10px] text-zinc-500">Live linked workspaces nodes mapping telemetry indicators.</p>
          </div>

          <button
            onClick={() => setIsSpawning(prev => !prev)}
            className="flex items-center space-x-1.5 px-2 py-1 rounded bg-[#daff33]/10 text-[#daff33] hover:bg-[#daff33]/20 text-[9px] font-mono font-bold tracking-wider uppercase border border-[#daff33]/25 cursor-pointer transition-transform hover:scale-103 mr-1"
          >
            <Plus className="w-3 h-3" />
            <span>Spawn Node</span>
          </button>
        </div>

        {/* Inline Spawner Box */}
        {isSpawning && (
          <form onSubmit={handleSpawnNode} className="absolute left-5 right-5 top-16 bg-[#0c0c0e]/95 border border-white/10 rounded-2xl p-4 space-y-3 z-20 shadow-2xl animate-fade-in text-left backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-white/50 font-bold">Workspace Connection Builder</span>
              <button type="button" onClick={() => setIsSpawning(false)} className="text-zinc-500 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded bg-white/5 font-mono">X</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8.5px] uppercase font-mono text-zinc-400 block mb-1 font-bold">Node Type</label>
                <select
                  value={spawnType}
                  onChange={(e) => setSpawnType(e.target.value as any)}
                  className="w-full bg-black border border-white/15 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-400 font-sans"
                >
                  <option value="task">Actionable Task</option>
                  <option value="doc">Wiki Document</option>
                  <option value="habit">Habit Routine</option>
                </select>
              </div>

              {spawnType === 'task' && (
                <div>
                  <label className="text-[8.5px] uppercase font-mono text-zinc-400 block mb-1 font-bold">Initial Status</label>
                  <select
                    value={spawnStatus}
                    onChange={(e) => setSpawnStatus(e.target.value as any)}
                    className="w-full bg-black border border-white/15 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-400 font-sans"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[8.5px] uppercase font-mono text-zinc-400 block font-bold">Node Name / Title</label>
              <input
                type="text"
                autoFocus
                required
                value={spawnTitle}
                onChange={(e) => setSpawnTitle(e.target.value)}
                placeholder="Database architecture core..."
                className="w-full bg-black border border-white/15 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-sans"
              />
            </div>

            {spawnType !== 'habit' && (
              <div className="space-y-1">
                <label className="text-[8.5px] uppercase font-mono text-zinc-400 block font-bold">Objective Details / Content Snippet</label>
                <textarea
                  value={spawnDetails}
                  onChange={(e) => setSpawnDetails(e.target.value)}
                  placeholder="Insert objective outlines or documentation details here..."
                  rows={2}
                  className="w-full bg-black border border-white/15 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-sans resize-none"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#daff33] text-black hover:bg-[#cbf415] text-[10px] font-mono uppercase tracking-wider font-extrabold cursor-pointer"
              >
                Assemble Node
              </button>
            </div>
          </form>
        )}

        <InteractiveD3Graph
          nodes={nodes}
          links={links}
          selectedNode={selectedNode}
          onSelectNode={(node) => setSelectedNode(node)}
          accentColor={accentColor}
        />
      </div>

      {/* Diagnostics / Update Controller Panel */}
      <div className="lg:col-span-4 p-5 rounded-3xl border border-white/5 bg-[#09090b]/80 flex flex-col justify-between min-h-[380px]">
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Topology Controller</h3>
            <span className="text-[8px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase">Modulation suite</span>
          </div>

          {activeDetails ? (
            <div className="space-y-4">
              {/* Type Category Tag */}
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-mono px-2 py-0.5 bg-white/5 text-white/80 rounded border border-white/10 uppercase font-bold tracking-wider">
                  {activeDetails.group}
                </span>

                {/* Sub-group status labels */}
                {activeDetails.group === 'milestones' && (
                  <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    activeDetails.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                  }`}>
                    {activeDetails.status}
                  </span>
                )}
              </div>

              {/* Editable Fields based on node type */}
              <div className="space-y-3 bg-black/45 border border-white/5 rounded-2xl p-4.5">
                {activeDetails.id === 'root' ? (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">{activeDetails.label}</h4>
                    <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">{activeDetails.details}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[9px] font-mono text-zinc-500">
                      <div>ACTIVE DOCUMENTS: <span className="text-white font-bold">{docs.length}</span></div>
                      <div>ACTIVE TASKS: <span className="text-white font-bold">{tasks.length}</span></div>
                      <div>TRACKED HABITS: <span className="text-white font-bold">{habits.length}</span></div>
                      <div>GRAPH STATUS: <span className="text-amber-400 font-bold">STABLE</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Node Name/Title Inline Input Editing */}
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-mono text-zinc-500 uppercase font-bold">Node Identity (Real-time updates)</label>
                      <input
                        type="text"
                        value={activeDetails.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeDetails.group === 'specifications' && activeDetails.originalId) {
                            updateDoc(activeDetails.originalId, { title: val });
                          } else if (activeDetails.group === 'milestones' && activeDetails.raw) {
                            updateTask({ ...activeDetails.raw, title: val });
                          }
                        }}
                        placeholder="Rename element..."
                        className="w-full bg-black/70 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-400 font-medium font-sans"
                      />
                    </div>

                    {/* Status selection updater for Milestones in detail */}
                    {activeDetails.group === 'milestones' && activeDetails.raw && (
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-mono text-zinc-500 uppercase font-bold">Milestone State Coordinates</label>
                        <select
                          value={activeDetails.status}
                          onChange={(e) => {
                            if (activeDetails.originalId) {
                              store.setTaskStatus(activeDetails.originalId, e.target.value as any);
                            }
                          }}
                          className="w-full bg-black/70 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-400 font-sans"
                        >
                          <option value="Todo">Todo</option>
                          <option value="In Progress">In Progress</option>
                          <option value="In Review">In Review</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                    )}

                    {/* Details Snippet or Content Text Area Editing */}
                    {activeDetails.group !== 'habits' && (
                      <div className="space-y-1">
                        <label className="text-[8.5px] font-mono text-zinc-500 uppercase font-bold">Objective Specification Parameters</label>
                        <textarea
                          rows={3}
                          value={activeDetails.details}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (activeDetails.group === 'specifications' && activeDetails.originalId) {
                              updateDoc(activeDetails.originalId, { content: val });
                            } else if (activeDetails.group === 'milestones' && activeDetails.raw) {
                              updateTask({ ...activeDetails.raw, description: val });
                            }
                          }}
                          placeholder="Insert descriptions..."
                          className="w-full bg-black/70 border border-white/10 rounded px-2.5 py-1 text-[10.5px] text-zinc-300 focus:outline-none focus:border-indigo-400 font-sans resize-none"
                        />
                      </div>
                    )}

                    {/* Habit trackers toggler layout */}
                    {activeDetails.group === 'habits' && activeDetails.originalId && (
                      <div className="py-2.5 border-t border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400">Current Streak: <strong className="text-white">{activeDetails.streak || 0} days</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeDetails.originalId) {
                              toggleHabitComplete(activeDetails.originalId);
                              addNotification('Habit Modified', `Logged routine completion update successfully.`, 'habit');
                            }
                          }}
                          className={`px-3 py-1 rounded text-[10px] font-mono uppercase font-bold cursor-pointer transition-all ${
                            activeDetails.completedToday
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {activeDetails.completedToday ? 'Completed Today ✓' : 'Mark Completed ✓'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigator Action buttons to transport direct to actual panel views */}
              <div className="space-y-1.5 pt-2">
                {activeDetails.group === 'specifications' && activeDetails.originalId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeDetails.originalId) {
                        setActiveDocId(activeDetails.originalId);
                        setActiveMenu('wiki');
                      }
                    }}
                    className="w-full py-1.5 rounded bg-white/5 hover:bg-white/10 hover:text-white text-zinc-300 text-[10.5px] font-mono font-bold tracking-wider uppercase border border-white/10 transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5"
                  >
                    <span>Inspect Documents registry</span>
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {activeDetails.group === 'milestones' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu('projects');
                    }}
                    className="w-full py-1.5 rounded bg-white/5 hover:bg-white/10 hover:text-white text-zinc-300 text-[10.5px] font-mono font-bold tracking-wider uppercase border border-white/10 transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5"
                  >
                    <span>Navigate to Kanban board</span>
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {activeDetails.group === 'habits' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu('habit_tracker');
                    }}
                    className="w-full py-1.5 rounded bg-white/5 hover:bg-white/10 hover:text-white text-zinc-300 text-[10.5px] font-mono font-bold tracking-wider uppercase border border-white/10 transition-colors cursor-pointer text-center flex items-center justify-center space-x-1.5"
                  >
                    <span>Check Habits tracker</span>
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 py-6">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center mx-auto text-zinc-600">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-[10.5px] text-zinc-500 italic text-center max-w-[210px] mx-auto leading-relaxed">
                Highlight any coordinates vector node on the active topology network view to decode metadata, edit indices, or navigate sectors.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center text-[8.5px] font-mono uppercase text-zinc-600 select-none">
          <span>Active Connections: {links.length}</span>
          <span>IndexedDB Synced ✓</span>
        </div>
      </div>
    </div>
  );
}
