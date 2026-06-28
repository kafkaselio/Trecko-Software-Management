/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, MessageSquare, Hash, Users, Menu, X, ChevronRight, ChevronLeft,
  Plus, Search, Bell, Clock, Compass, BookOpen, FileText, CheckSquare,
  Layers, Settings, Sun, Moon, Workflow, TrendingUp, Send, Calendar,
  Paperclip, Trash2, Sliders, Check, RotateCcw, Volume2, VolumeX,
  Activity, FileCode, Share2, HelpCircle, AlertCircle, FilePlus, ChevronDown, Terminal, FolderPlus,
  Edit3, ShieldAlert, CheckCircle
} from 'lucide-react';

import { Task, Doc, ChannelMessage, Channel, Habit, CloudFile, Workspace, Theme } from './types';
import { useAppStore } from './store';
import { localDB } from './utils/db';
import CommandPalette from './components/CommandPalette';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import TeammateChat from './components/TeammateChat';
import WikiSystem from './components/WikiSystem';
import DevToolsSuite from './components/DevToolsSuite';
import MissionControlDashboard from './components/MissionControlDashboard';
import AiWorkspaceAssistantPanel from './components/AiWorkspaceAssistantPanel';
import TacticalUtilities from './components/TacticalUtilities';
import SprintCalendar from './components/SprintCalendar';


const THEMES: Theme[] = [
  {
    id: 'geometric-balance',
    name: 'Geometric Balance',
    bgClass: 'bg-[#090909] text-[#EDEDED]',
    cardClass: 'bg-white/[0.02] border-white/5 backdrop-blur-md rounded-3xl',
    borderClass: 'border-white/5',
    textClass: 'text-[#EDEDED]',
    mutedClass: 'text-white/40',
    accentClass: 'bg-indigo-500 hover:bg-indigo-400 text-white border-white/10 shadow-lg shadow-indigo-500/20',
    gradientFrom: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Pitch',
    bgClass: 'bg-[#09090b] text-[#f4f4f5]',
    cardClass: 'bg-[#121214]/90 border-[#27272a] backdrop-blur-md rounded-xl',
    borderClass: 'border-[#27272a]',
    textClass: 'text-[#f4f4f5]',
    mutedClass: 'text-[#a1a1aa]',
    accentClass: 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500/30',
    gradientFrom: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Dusk',
    bgClass: 'bg-[#0f0e17] text-[#fffffe]',
    cardClass: 'bg-[#161424]/90 border-[#302c48] backdrop-blur-md',
    borderClass: 'border-[#302c48]',
    textClass: 'text-[#fffffe]',
    mutedClass: 'text-[#a7a9be]',
    accentClass: 'bg-violet-600 hover:bg-violet-500 text-white border-violet-500/30',
    gradientFrom: 'from-violet-600 to-fuchsia-600',
  },
  {
    id: 'emerald',
    name: 'Cyber Emerald',
    bgClass: 'bg-[#050c08] text-[#e8f5e9]',
    cardClass: 'bg-[#0c1811]/90 border-[#1b3825] backdrop-blur-md',
    borderClass: 'border-[#1b3825]',
    textClass: 'text-[#e8f5e green]',
    mutedClass: 'text-emerald-400/70',
    accentClass: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30',
    gradientFrom: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'light-copper',
    name: 'Volt Cyber-Neon',
    bgClass: 'bg-[#0a0d02] text-[#daff33]',
    cardClass: 'bg-[#121602]/90 border-[#daff33]/20 shadow-[0_0_15px_rgba(218,255,51,0.05)] backdrop-blur-md rounded-2xl',
    borderClass: 'border-[#daff33]/15',
    textClass: 'text-[#daff33]',
    mutedClass: 'text-[#daff33]/50',
    accentClass: 'bg-[#daff33] text-black hover:bg-[#c2ef00] border-[#daff33]/30 shadow-[0_0_20px_rgba(218,255,51,0.2)]',
    gradientFrom: 'from-[#daff33] to-[#86ff00]',
  },
  {
    id: 'crimson',
    name: 'Crimson Protocol',
    bgClass: 'bg-[#0c0506] text-[#ffebee]',
    cardClass: 'bg-[#160b0d]/90 border-rose-900/30 backdrop-blur-md rounded-2xl',
    borderClass: 'border-rose-900/20',
    textClass: 'text-[#ffebee]',
    mutedClass: 'text-rose-400/60',
    accentClass: 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500/35 shadow-[0_0_18px_rgba(225,29,72,0.15)]',
    gradientFrom: 'from-rose-600 to-red-700',
  },
  {
    id: 'aurora',
    name: 'Nordic Aurora',
    bgClass: 'bg-[#030a0d] text-[#e0f7fa]',
    cardClass: 'bg-[#07131a]/95 border-cyan-950/45 backdrop-blur-md rounded-2xl',
    borderClass: 'border-cyan-950/30',
    textClass: 'text-[#e0f7fa]',
    mutedClass: 'text-cyan-400/65',
    accentClass: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400/35 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    gradientFrom: 'from-cyan-500 to-emerald-500',
  },
  {
    id: 'bronze',
    name: 'Solarized Bronze',
    bgClass: 'bg-[#0f0b07] text-[#fdf6e3]',
    cardClass: 'bg-[#18110b]/90 border-amber-950/40 backdrop-blur-md rounded-2xl',
    borderClass: 'border-amber-950/30',
    textClass: 'text-[#fdf6e3]',
    mutedClass: 'text-amber-500/60',
    accentClass: 'bg-amber-500 hover:bg-amber-400 text-stone-900 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    gradientFrom: 'from-amber-600 to-orange-600',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    bgClass: 'bg-[#0f0702] text-[#fff3e0]',
    cardClass: 'bg-[#190f05]/95 border-orange-950/45 backdrop-blur-md rounded-2xl',
    borderClass: 'border-orange-500/15',
    textClass: 'text-[#fff3e0]',
    mutedClass: 'text-orange-400/60',
    accentClass: 'bg-orange-500 hover:bg-orange-400 text-stone-900 border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.15)]',
    gradientFrom: 'from-orange-500 to-amber-600',
  },
  {
    id: 'deep-orchid',
    name: 'Deep Orchid',
    bgClass: 'bg-[#0c0209] text-[#fce4ec]',
    cardClass: 'bg-[#170514]/95 border-pink-950/45 backdrop-blur-md rounded-2xl',
    borderClass: 'border-pink-500/15',
    textClass: 'text-[#fce4ec]',
    mutedClass: 'text-pink-400/60',
    accentClass: 'bg-pink-600 hover:bg-pink-500 text-white border-pink-500/40 shadow-[0_0_15px_rgba(219,39,119,0.15)]',
    gradientFrom: 'from-pink-600 to-fuchsia-700',
  },
  {
    id: 'titanium-slate',
    name: 'Titanium Slate',
    bgClass: 'bg-[#111518] text-[#eceff1]',
    cardClass: 'bg-[#1c2226]/95 border-slate-800/45 backdrop-blur-md rounded-2xl',
    borderClass: 'border-slate-700/20',
    textClass: 'text-[#eceff1]',
    mutedClass: 'text-slate-400/60',
    accentClass: 'bg-teal-500 hover:bg-teal-400 text-slate-950 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.15)]',
    gradientFrom: 'from-slate-500 to-teal-500',
  },
  {
    id: 'electric-indigo',
    name: 'Electric Indigo',
    bgClass: 'bg-[#020311] text-[#e8eaf6]',
    cardClass: 'bg-[#090b21]/95 border-indigo-950/45 backdrop-blur-md rounded-2xl',
    borderClass: 'border-indigo-500/15',
    textClass: 'text-[#e8eaf6]',
    mutedClass: 'text-indigo-400/60',
    accentClass: 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/40 shadow-[0_0_15px_rgba(79,70,229,0.2)]',
    gradientFrom: 'from-indigo-600 to-blue-700',
  }
];

export default function App() {
  // --- Booting up state ---
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [bootPhase, setBootPhase] = useState<string>('Initializing');

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsBooting(false);
        }, 400);
      }
      setBootProgress(progress);
      
      if (progress < 25) {
        setBootPhase('Loading core telemetry variables...');
      } else if (progress < 50) {
        setBootPhase('Synchronizing offline storage registers...');
      } else if (progress < 75) {
        setBootPhase('Formulating structural workspace canvas nodes...');
      } else if (progress < 95) {
        setBootPhase('Setting up high-performance view adapters...');
      } else {
        setBootPhase('Ready. Boot complete.');
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // --- Workspace Multi-Environment State ---
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem('workspace_os_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'ws-delta', name: 'Sovereign Engineering', code: '▲ DELTA', description: 'Deep tech development & main codebase architecting', accentClass: 'text-blue-500' },
      { id: 'ws-creative', name: 'Product Marketing v2', code: '◆ DESIGN', description: 'Design prototypes & user growth strategies', accentClass: 'text-violet-500' },
      { id: 'ws-personal', name: 'Personal Operations', code: '● MATRIX', description: 'Habits, journaling, schedule coordination', accentClass: 'text-emerald-500' }
    ];
  });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-delta');

  useEffect(() => {
    localStorage.setItem('workspace_os_list', JSON.stringify(workspaces));
  }, [workspaces]);

  // --- Theme Selection State ---
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('trecko_current_theme');
    if (saved) {
      const found = THEMES.find(t => t.id === saved);
      if (found) return found;
    }
    return THEMES[0];
  });

  useEffect(() => {
    localStorage.setItem('trecko_current_theme', currentTheme.id);
    useAppStore.getState().setCurrentThemeId(currentTheme.id);
  }, [currentTheme]);

  // --- Dynamic Loading Overlays (AI Generation) ---
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiPromptTitle, setAiPromptTitle] = useState<string>('');
  const [aiPromptDesc, setAiPromptDesc] = useState<string>('');
  const [aiLoadingPhase, setAiLoadingPhase] = useState<string>('');

  // --- Core Application Modules State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Record<string, ChannelMessage[]>>({});
  const [habits, setHabits] = useState<Habit[]>([]);
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([]);

  // --- Workspace Events, Productivity Pulse, and Pipeline Alignment State ---
  const [upcomingEvents, setUpcomingEvents] = useState<{ id: string; title: string; time: string; location: string; colorClass: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('workspace_os_upcoming_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'ev-1', title: 'Design Review Grid', time: '10:30 AM', location: 'Zoom Meet', colorClass: 'bg-indigo-500', completed: false },
      { id: 'ev-2', title: 'Systems Tech Sync', time: '2:00 PM', location: 'Matrix Room', colorClass: 'bg-purple-500', completed: false },
      { id: 'ev-3', title: 'Google Integration Audits', time: '4:15 PM', location: 'Remote', colorClass: 'bg-amber-500', completed: false }
    ];
  });

  const [productivityPulse, setProductivityPulse] = useState<number[]>(() => {
    const saved = localStorage.getItem('workspace_os_productivity_pulse');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [45, 60, 30, 80, 50, 95, 60]; // Monday - Sunday default pulse percent of focus actions
  });

  const [statusSpotlight, setStatusSpotlight] = useState<'All' | 'Backlog' | 'Todo' | 'InProgress' | 'Done'>('All');
  const [showVelocityChecklist, setShowVelocityChecklist] = useState(false);
  const [showSprintChecklist, setShowSprintChecklist] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isTacticalDropdownOpen, setIsTacticalDropdownOpen] = useState(false);
  
  // Pipeline quick injector entry
  const [pipelineInput, setPipelineInput] = useState('');
  const [pipelineTargetCol, setPipelineTargetCol] = useState<'Backlog' | 'Todo' | 'InProgress' | 'Done'>('Backlog');

  // Sidebar Inline Event Add Form State
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('11:00 AM');
  const [newEventLocation, setNewEventLocation] = useState('Google Meet');
  const [newEventColor, setNewEventColor] = useState('bg-indigo-500');

  useEffect(() => {
    localStorage.setItem('workspace_os_upcoming_events', JSON.stringify(upcomingEvents));
  }, [upcomingEvents]);

  // Sync pulse state
  useEffect(() => {
    localStorage.setItem('workspace_os_productivity_pulse', JSON.stringify(productivityPulse));
  }, [productivityPulse]);

  const boostPulse = (amount: number = 10) => {
    const todayIndex = (new Date().getDay() + 6) % 7; // Monday-based index
    setProductivityPulse(prev => {
      const next = [...prev];
      next[todayIndex] = Math.min(100, next[todayIndex] + amount);
      return next;
    });
  };

  const handlePipelineInject = () => {
    if (!pipelineInput.trim()) return;
    const newTask: Task = {
      id: `tk-dyn-${Date.now()}`,
      title: pipelineInput.trim(),
      status: pipelineTargetCol,
      priority: 'Medium',
      label: 'Core',
      description: 'Sprint node drafted from dashboard metrics pipeline controller',
      assignee: googleUser ? googleUser.name : 'Alex Chen',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      comments: [],
      subtasks: []
    };
    setTasks(prev => [...prev, newTask]);
    setPipelineInput('');
    boostPulse(10);
    // Notify the user via pilot simulated history
    setAiChatHistory(prev => [...prev, { sender: 'assistant', text: `✨ **Pipeline Injection Succeeded!** Drafted task *"${newTask.title}"* into stage *${newTask.status}*. Your focus daily pulse increased by +10%!` }]);
  };

  // --- Google Sync & Workspace Authentication State ---
  const [googleUser, setGoogleUser] = useState<{
    email: string;
    name: string;
    picture: string;
    syncedCalendar: boolean;
    syncedDrive: boolean;
    syncedDocs: boolean;
    lastSynced: string;
  } | null>(() => {
    const saved = localStorage.getItem('workspace_os_google_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [googleLoginStep, setGoogleLoginStep] = useState<'welcome' | 'email' | 'password' | 'authorizing' | 'done'>('welcome');
  const [googleEmailInput, setGoogleEmailInput] = useState('obsidians378@gmail.com');
  const [googlePasswordInput, setGooglePasswordInput] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // --- Workspace Modification Intermediaries ---
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState('');
  const [isAddingWs, setIsAddingWs] = useState(false);
  const [addWsInput, setAddWsInput] = useState('');
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editingWorkspaceName, setEditingWorkspaceName] = useState('');
  const [editingWorkspaceDesc, setEditingWorkspaceDesc] = useState('');
  const [editingWorkspaceAccent, setEditingWorkspaceAccent] = useState('text-indigo-400');

  const [isEditingActiveWorkspaceInline, setIsEditingActiveWorkspaceInline] = useState(false);
  const [inlineWorkspaceName, setInlineWorkspaceName] = useState('');
  const [inlineWorkspaceDesc, setInlineWorkspaceDesc] = useState('');
  const [inlineWorkspaceAccent, setInlineWorkspaceAccent] = useState('text-indigo-400');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- UI Navigation State ---
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'chat' | 'projects' | 'wiki' | 'personal' | 'files' | 'customizer' | 'sync' | 'tools' | 'sprint_calendar'>('dashboard');
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [projectLayout, setProjectLayout] = useState<'kanban' | 'list' | 'timeline'>('kanban');

  const isSidebarCollapsed = useAppStore(state => state.isSidebarCollapsed);
  const setIsSidebarCollapsed = useAppStore(state => state.setIsSidebarCollapsed);
  const teamMembers = useAppStore(state => state.teamMembers);
  const addTeamMember = useAppStore(state => state.addTeamMember);
  const removeTeamMember = useAppStore(state => state.removeTeamMember);
  const trashBin = useAppStore(state => state.trashBin);

  // Load Saved Google state
  useEffect(() => {
    if (googleUser) {
      localStorage.setItem('workspace_os_google_user', JSON.stringify(googleUser));
    } else {
      localStorage.removeItem('workspace_os_google_user');
    }
  }, [googleUser]);

  // Synchronize initial document file registers with custom express server
  useEffect(() => {
    const syncServerFiles = async () => {
      try {
        const res = await fetch('/api/files');
        if (res.ok) {
          const serverList = await res.json();
          if (serverList && serverList.length > 0) {
            setCloudFiles(serverList);
          }
        }
      } catch (err) {
        console.warn('Fallback server file registry inaccessible:', err);
      }
    };
    syncServerFiles();
  }, [activeWorkspaceId]);

  // Document management upload helper routines
  const getFileCategory = (filename: string): 'Document' | 'Asset' | 'Design' | 'Code' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(ext || '')) return 'Asset';
    if (['ts', 'tsx', 'js', 'jsx', 'py', 'json', 'css', 'html', 'c', 'cpp', 'rs'].includes(ext || '')) return 'Code';
    if (['pdf', 'docx', 'txt', 'md', 'epub', 'xlsx', 'csv'].includes(ext || '')) return 'Document';
    return 'Document';
  };

  const triggerFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Content = reader.result as string;
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${(file.size / 1024).toFixed(0)} KB`;
      
      const payload = {
        name: file.name,
        size: sizeStr,
        type: file.type || 'Document Reference',
        category: getFileCategory(file.name),
        tag: 'Admin Upload',
        contentBase64: base64Content
      };

      try {
        const response = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const uploadedFile = await response.json();
          setCloudFiles(prev => [uploadedFile, ...prev]);
        } else {
          // Local fallback
          setCloudFiles(prev => [
            {
              id: `f-fb-${Date.now()}`,
              name: file.name,
              size: sizeStr,
              type: file.type || 'Document',
              category: getFileCategory(file.name),
              tag: 'Local Offline',
              dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              contentBase64: base64Content as string
            },
            ...prev
          ]);
        }
      } catch (err) {
        // Safe Local fallback
        setCloudFiles(prev => [
          {
            id: `f-fb-${Date.now()}`,
            name: file.name,
            size: sizeStr,
            type: file.type || 'Document',
            category: getFileCategory(file.name),
            tag: 'Local Offline',
            dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            contentBase64: base64Content as string
          },
          ...prev
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadFile = (file: CloudFile) => {
    const content = (file as any).contentBase64;
    const link = document.createElement('a');
    if (content) {
      link.href = content;
    } else {
      // Create a pleasant mock text file context representation
      const blob = new Blob([`Security coordinate data for offline storage: ${file.name}`], { type: 'text/markdown' });
      link.href = URL.createObjectURL(blob);
    }
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteFile = async (id: string, name: string) => {
    if (!confirm(`Confirm removal of "${name}" from server?`)) return;
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setCloudFiles(prev => prev.filter(item => item.id !== id));
      } else {
        setCloudFiles(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      setCloudFiles(prev => prev.filter(item => item.id !== id));
    }
  };

  // Google Login Auth simulation triggers
  const triggerGoogleAuth = () => {
    if (!googleEmailInput.trim()) return;
    setIsGoogleLoading(true);
    setGoogleLoginStep('authorizing');
    setTimeout(() => {
      const parts = googleEmailInput.split('@')[0];
      const formalName = parts.charAt(0).toUpperCase() + parts.slice(1) + ' Admin';
      setGoogleUser({
        email: googleEmailInput,
        name: formalName,
        picture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
        syncedCalendar: true,
        syncedDrive: true,
        syncedDocs: false,
        lastSynced: new Date().toLocaleTimeString()
      });
      setGoogleLoginStep('welcome');
      setIsGoogleLoading(false);
      // Switch workspace name to obsidian customized sync space to visually sync
      setWorkspaces(prev => prev.map(w => w.id === activeWorkspaceId ? {
        ...w,
        name: `Obsidian Sovereign Space`
      } : w));
      setActiveMenu('sync');
    }, 2000);
  };

  const toggleSyncService = (propName: 'syncedCalendar' | 'syncedDrive' | 'syncedDocs') => {
    if (!googleUser) return;
    setGoogleUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [propName]: !prev[propName],
        lastSynced: new Date().toLocaleTimeString()
      };
    });
  };

  const syncCoordinatesNow = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      if (googleUser) {
        setGoogleUser(prev => prev ? { ...prev, lastSynced: new Date().toLocaleTimeString() } : null);
      }
      alert('Workspace sync completely established with secure Google cloud nodes.');
    }, 1500);
  };

  // Workspace adding and renaming operations
  const handleSaveRename = () => {
    if (!renameInput.trim()) return;
    setWorkspaces(prev => prev.map(w => w.id === activeWorkspaceId ? { ...w, name: renameInput.trim() } : w));
    setIsRenaming(false);
  };

  const handleDeleteWorkspace = (wsId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (workspaces.length <= 1) {
      alert("At least one workspace must be kept in your cluster.");
      return;
    }
    const confirmDelete = window.confirm("Are you sure you want to delete this workspace and clear its local database registry?");
    if (!confirmDelete) return;

    const remaining = workspaces.filter(w => w.id !== wsId);
    setWorkspaces(remaining);
    localStorage.removeItem(`workspace_os_${wsId}`);

    if (activeWorkspaceId === wsId) {
      setActiveWorkspaceId(remaining[0].id);
    }
  };

  const handleOpenEditWorkspace = (ws: Workspace, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingWorkspace(ws);
    setEditingWorkspaceName(ws.name);
    setEditingWorkspaceDesc(ws.description || '');
    setEditingWorkspaceAccent(ws.accentClass || 'text-indigo-400');
  };

  const handleSaveEditWorkspace = () => {
    if (!editingWorkspace) return;
    if (!editingWorkspaceName.trim()) return;

    setWorkspaces(prev => prev.map(w => w.id === editingWorkspace.id ? {
      ...w,
      name: editingWorkspaceName.trim(),
      description: editingWorkspaceDesc.trim(),
      accentClass: editingWorkspaceAccent,
      code: `▲ ${editingWorkspaceName.trim().substring(0, 5).toUpperCase()}`
    } : w));

    setEditingWorkspace(null);
  };

  const handleSaveAddWs = () => {
    if (!addWsInput.trim()) return;
    const title = addWsInput.trim();
    const id = `ws-dyn-${Date.now()}`;
    setWorkspaces(prev => [...prev, {
      id,
      name: title,
      code: `▲ ${title.substring(0, 5).toUpperCase()}`,
      description: 'Sovereign environment parameters',
      accentClass: 'text-indigo-400'
    }]);
    setActiveWorkspaceId(id);
    setIsAddingWs(false);
    setAddWsInput('');
  };

  // --- Pomodoro State ---
  const [pomoTime, setPomoTime] = useState<number>(1500); // 25:00
  const [pomoMaxTime, setPomoMaxTime] = useState<number>(1500); // Progress tracker max
  const [pomoActive, setPomoActive] = useState<boolean>(false);
  const [pomoSoundOn, setPomoSoundOn] = useState<boolean>(false);
  const [pomoLapsCount, setPomoLapsCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('pomo_laps_count') || '0');
  });
  const [pomoHistory, setPomoHistory] = useState<{ id: string; event: string; duration: string; timestamp: string }[]>(() => {
    const saved = localStorage.getItem('pomo_history_items');
    return saved ? JSON.parse(saved) : [
      { id: 'h-1', event: 'Sprint Focus Completed', duration: '25:00', timestamp: '10:14 AM' },
      { id: 'h-2', event: 'Task Refactoring Cycle', duration: '12:45', timestamp: '11:32 AM' }
    ];
  });
  const synthRef = useRef<AudioContext | null>(null);
  const synthOscRef = useRef<OscillatorNode | null>(null);

  // --- Multi-User Switcher & Active Teammates ---
  const TEAM_MEMBERS = [
    { id: 'm-alex', name: 'Alex Chen', role: 'SaaS Facilitator', email: 'obsidians378@gmail.com', initials: 'AC', color: '#6366f1' },
    { id: 'm-elena', name: 'Elena Rostova', role: 'Staff API Architect', email: 'elena.rostova@trecko.io', initials: 'ER', color: '#10b981' },
    { id: 'm-marcus', name: 'Marcus Vance', role: 'Lead UX Designer', email: 'marcus.vance@trecko.io', initials: 'MV', color: '#f59e0b' },
    { id: 'm-sarah', name: 'Sarah Jenkins', role: 'Full-stack Engineer', email: 'sarah.j@trecko.io', initials: 'SJ', color: '#ec4899' }
  ];
  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return localStorage.getItem('active_workspace_member_id') || 'm-alex';
  });
  const currentActiveUser = TEAM_MEMBERS.find(m => m.id === activeMemberId) || TEAM_MEMBERS[0];
  const [selectedBlueprintTemplate, setSelectedBlueprintTemplate] = useState<string>('engineering');
  const [overviewTab, setOverviewTab] = useState<'blueprint' | 'offline_tasks'>('blueprint');

  // --- Dynamic Avatar & Custom Name states ---
  const [profileName, setProfileName] = useState<string>(() => {
    return localStorage.getItem('custom_profile_name') || '';
  });
  const [profilePicUrl, setProfilePicUrl] = useState<string>(() => {
    return localStorage.getItem('custom_profile_pic_url') || '';
  });
  const [isEditingAccount, setIsEditingAccount] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [rightPanelTab, setRightPanelTab] = useState<'feed' | 'checkpoints'>('feed');

  // --- Floating Assistants & Drawers ---
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isTrashBinOpen, setIsTrashBinOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isPomoHovered, setIsPomoHovered] = useState<boolean>(false);
  const [paletteQuery, setPaletteQuery] = useState<string>('');
  const [aiChatInput, setAiChatInput] = useState<string>('');
  const [aiChatHistory, setAiChatHistory] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([]);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  // --- Team Management States ---
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberEmail, setNewMemberEmail] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<string>('Frontend Developer');
  const [copiedMemberId, setCopiedMemberId] = useState<string | null>(null);

  // --- Detail Drawers ---
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [chatMessageText, setChatMessageText] = useState<string>('');
  const [docSearch, setDocSearch] = useState<string>('');
  const [isWikiEditing, setIsWikiEditing] = useState<boolean>(false);
  const [newHabitName, setNewHabitName] = useState<string>('');
  const [taskOverviewSearch, setTaskOverviewSearch] = useState<string>('');
  const [taskOverviewStatusFilter, setTaskOverviewStatusFilter] = useState<string>('all');
  const [taskOverviewPriorityFilter, setTaskOverviewPriorityFilter] = useState<string>('all');

  // --- Derived Dashboard Metrics & Stats ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressCount = tasks.filter(t => t.status === 'InProgress').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Done');
  const highestHabitStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak), 0) : 0;
  
  // Real active log entry
  const lastTeammateMessages = (Object.values(messages) as ChannelMessage[][])
    .flat()
    .filter((m: ChannelMessage) => m.sender !== 'You');
  const latestActivityText = lastTeammateMessages.length > 0 
    ? `${lastTeammateMessages[lastTeammateMessages.length - 1].sender} (${lastTeammateMessages[lastTeammateMessages.length - 1].role}): "${lastTeammateMessages[lastTeammateMessages.length - 1].text.substring(0, 70)}..."`
    : "Elena Rostova (Lead Systems Architect) summarized current pipeline backlog bounds.";

  // --- Load Initial Config from LocalStorage or Load Fallbacks ---
  useEffect(() => {
    const savedData = localStorage.getItem(`workspace_os_${activeWorkspaceId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setTasks(parsed.tasks);
        setDocs(parsed.docs);
        setChannels(parsed.channels);
        setMessages(parsed.messages);
        setHabits(parsed.habits);
        setCloudFiles(parsed.cloudFiles);

        if (parsed.channels && parsed.channels.length > 0) {
          setActiveChannelId(parsed.channels[0].id);
        }
        if (parsed.docs && parsed.docs.length > 0) {
          setActiveDocId(parsed.docs[0].id);
        }
      } catch (e) {
        loadPresetData(activeWorkspaceId);
      }
    } else {
      loadPresetData(activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  // Save changes automatically
  useEffect(() => {
    if (tasks.length > 0 || docs.length > 0 || channels.length > 0) {
      const stateToSave = { tasks, docs, channels, messages, habits, cloudFiles };
      localStorage.setItem(`workspace_os_${activeWorkspaceId}`, JSON.stringify(stateToSave));
    }
  }, [tasks, docs, channels, messages, habits, cloudFiles, activeWorkspaceId]);

  useEffect(() => {
    localStorage.setItem('pomo_laps_count', pomoLapsCount.toString());
  }, [pomoLapsCount]);

  useEffect(() => {
    localStorage.setItem('pomo_history_items', JSON.stringify(pomoHistory));
  }, [pomoHistory]);

  useEffect(() => {
    localStorage.setItem('active_workspace_member_id', activeMemberId);
  }, [activeMemberId]);

  // Advanced Global Keyboard Hotkeys Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }
      // Escape closes dialogs
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setEditingTask(null);
        setIsShortcutsModalOpen(false);
        return;
      }

      // Alt Keys
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'd') {
          e.preventDefault();
          setActiveMenu('dashboard');
        } else if (key === 'k') {
          e.preventDefault();
          setActiveMenu('projects');
        } else if (key === 'c') {
          e.preventDefault();
          setActiveMenu('chat');
        } else if (key === 'w') {
          e.preventDefault();
          setActiveMenu('wiki');
        } else if (key === 's') {
          e.preventDefault();
          setActiveMenu('sync');
        } else if (key === 't') {
          e.preventDefault();
          setActiveMenu('tools');
        } else if (key === 'a') {
          e.preventDefault();
          setIsAssistantOpen(prev => !prev);
        } else if (key === 'h') {
          e.preventDefault();
          togglePomodoro();
        } else if (key === 'r') {
          e.preventDefault();
          const nextIndex = Math.floor(Math.random() * THEMES.length);
          setCurrentTheme(THEMES[nextIndex]);
        } else if (key === 'n') {
          e.preventDefault();
          const newTask: Task = {
            id: `task-dyn-${Date.now()}`,
            title: 'Conversational Draft Ticket',
            status: 'Todo',
            priority: 'High',
            label: 'Engineering',
            description: 'Define coordinates and specifications...',
            assignee: profileName || currentActiveUser.name,
            dueDate: new Date().toISOString().split('T')[0]
          };
          setTasks(prev => [...prev, newTask]);
          setEditingTask(newTask);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileName, currentActiveUser, setTasks, setEditingTask, setActiveMenu, setIsAssistantOpen, togglePomodoro]);

  // Audio synthethizer effect for Pomodoro
  useEffect(() => {
    if (pomoActive && pomoSoundOn) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        synthRef.current = ctx;

        // Create oscillator for low frequency focus hum
        // We pulse it slowly to feel calm and rhythmic like breath cycles
        const osc = ctx.createOscillator();
        const biquadFilter = ctx.createBiquadFilter();
        const gainNode = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // low A drone
        
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.setValueAtTime(150, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        // LFO rate to pulse gain for diaphragmatic rhythm
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // LFO rate
        lfoGain.gain.setValueAtTime(0.04, ctx.currentTime); // LFO depth

        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);

        osc.connect(biquadFilter);
        biquadFilter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        lfo.start();
        synthOscRef.current = osc;
      } catch (err) {
        console.warn('Audio Context failed to start.', err);
      }
    } else {
      stopPomodoroSynth();
    }
    return () => stopPomodoroSynth();
  }, [pomoActive, pomoSoundOn]);

  const stopPomodoroSynth = () => {
    if (synthOscRef.current) {
      try {
        synthOscRef.current.stop();
      } catch (_) {}
      synthOscRef.current = null;
    }
    if (synthRef.current) {
      try {
        synthRef.current.close();
      } catch (_) {}
      synthRef.current = null;
    }
  };

  // Pomodoro countdown timer loop
  useEffect(() => {
    let interval: any = null;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => {
        setPomoTime(pomoTime - 1);
      }, 1000);
    } else if (pomoTime === 0) {
      setPomoActive(false);
      stopPomodoroSynth();
      // Track lap and history
      setPomoLapsCount(prev => prev + 1);
      const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setPomoHistory(prev => [
        {
          id: `pomo-auto-${Date.now()}`,
          event: "Full Focus Cycle Complete",
          duration: "25:00",
          timestamp: timestampStr
        },
        ...prev
      ]);
      // Simple play short pleasant beep
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (_) {}
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime]);

  function togglePomodoro() {
    setPomoActive(prev => !prev);
  }

  const resetPomodoro = () => {
    setPomoActive(false);
    setPomoTime(pomoMaxTime);
  };

  // --- Load Presets ---
  const loadPresetData = (workspaceId: string) => {
    let presetTasks: Task[] = [];
    let presetDocs: Doc[] = [];
    let presetChannels: Channel[] = [];
    let presetMessages: Record<string, ChannelMessage[]> = {};
    let presetHabits: Habit[] = [];
    let presetFiles: CloudFile[] = [];

    if (workspaceId === 'ws-delta') {
      // Sovereign Engineering Presets
      presetTasks = [
        { id: 't1', title: 'Refactor secure proxy for Gemini API authentication', status: 'Done', priority: 'High', label: 'Engineering', description: 'Migrate active clients back to secure Express system on port 3000 to defend secret credentials.', assignee: 'Elena Rostova', dueDate: '2026-05-24' },
        { id: 't2', title: 'Compile beautiful fluid SVG graphs for custom velocity logs', status: 'InProgress', priority: 'High', label: 'Design', description: 'Produce responsive SVG coordinate heatmaps that adapt to viewport and support hover statistics.', assignee: 'Marcus Vance', dueDate: '2026-05-28' },
        { id: 't3', title: 'Build interactive Pomodoro workspace synthesizer', status: 'Todo', priority: 'Medium', label: 'Engineering', description: 'Program custom AudioContext white-noise filters & Low Frequency Oscillators for deep alpha-wave concentration.', assignee: 'Elena Rostova', dueDate: '2026-06-02' },
        { id: 't4', title: 'Construct full Notion slash-command autocomplete modal', status: 'Backlog', priority: 'Low', label: 'Marketing', description: 'Inject popover selectors when key string "/" triggers standard database inputs.', assignee: 'Alex Chen', dueDate: '2026-06-10' }
      ];
      presetDocs = [
        { id: 'doc-standards', title: 'Engineering & Code Standards', content: '# Architectural Engineering Blueprint\n\nWelcome to the sovereign code workspace registry. We align our services around clean functional flows, reactive rendering states, and native TypeScript type system constraints.\n\n### Core Directives:\n- Keep state strictly component local or persisted in local storage.\n- Keep API operations clean of external dependencies.\n- Ensure complete secure proxies for third-party endpoints.', category: 'Specification', updatedAt: 'May 22, 2026' },
        { id: 'doc-architecture', title: 'Secure WebSocket Server Spec', content: '# WebSocket Infrastructure Blueprint\n\nEnsure client sessions bridge audio directly using strict payload structure constraints:\n\n```json\n{\n  "audio": "[base64]",\n  "samplerate": 16000\n}\n```\n\nMinimize latency boundaries inside the router matrix.', category: 'Overview', updatedAt: 'May 19, 2026' }
      ];
      presetChannels = [
        { id: 'ch-alpha', name: 'alpha-synergy', category: 'Channels', unreadCount: 2 },
        { id: 'ch-dev', name: 'dev-architecture', category: 'Channels', unreadCount: 0 },
        { id: 'dm-marcus', name: 'Marcus Vance', category: 'Direct Messages', role: 'Lead UX Designer', unreadCount: 0 },
        { id: 'dm-elena', name: 'Elena Rostova', category: 'Direct Messages', role: 'Staff API Architect', unreadCount: 0 }
      ];
      presetMessages = {
        'ch-alpha': [
          { id: 'm1', sender: 'Elena Rostova', role: 'Staff API Architect', text: 'I completed running safety tests on the express proxy router inside Docker. Port boundaries look robust.', timeAgo: '2 hours ago', reactions: [{ emoji: '👍', count: 2, users: ['Marcus', 'Alex'] }] },
          { id: 'm2', sender: 'Marcus Vance', role: 'Lead UX Designer', text: 'Stunning job! Let us coordinate with the visual vector system tests next. I just designed the new dark theme guidelines.', timeAgo: '30 mins ago', reactions: [{ emoji: '🔥', count: 3, users: ['Elena', 'Alex', 'Self'] }] }
        ],
        'ch-dev': [
          { id: 'm3', sender: 'Elena Rostova', role: 'Staff API Architect', text: 'We need to deprecate older endpoints to guarantee zero key exposure to clients. Everything is routed to /api helper paths now.', timeAgo: '4 hours ago', reactions: [] }
        ],
        'dm-marcus': [
          { id: 'm4', sender: 'Marcus Vance', role: 'Lead UX Designer', text: 'Hey, did you make sure to test the SVG graph scales on smaller devices? Let me know if you face scaling issues!', timeAgo: 'Yesterday', reactions: [{ emoji: '👀', count: 1, users: ['Self'] }] }
        ],
        'dm-elena': [
          { id: 'm5', sender: 'Elena Rostova', role: 'Staff API Architect', text: 'Can you verify the environment variable secrets inside the Workspace secrets panel? Applet needs full authorization.', timeAgo: 'Yesterday', reactions: [] }
        ]
      };
      presetHabits = [
        { id: 'h1', title: 'Write Clean TS Documentation', streak: 12, completedToday: true },
        { id: 'h2', title: 'Complete Deep Pomodoro Sprint (50m)', streak: 4, completedToday: false },
        { id: 'h3', title: 'Check Sprint Milestones', streak: 19, completedToday: true }
      ];
      presetFiles = [
        { id: 'f1', name: 'workspace-architecture.pdf', size: '2.4 MB', type: 'PDF Document', category: 'Document', tag: 'Infrastructure', dateAdded: 'May 12, 2026' },
        { id: 'f2', name: 'linear-dashboard-prototype.fig', size: '18.1 MB', type: 'Figma File', category: 'Design', tag: 'Design', dateAdded: 'May 18, 2026' },
        { id: 'f3', name: 'index-route-proxy.ts', size: '14 KB', type: 'TypeScript', category: 'Code', tag: 'Core', dateAdded: 'May 20, 2026' }
      ];
    } else if (workspaceId === 'ws-creative') {
      presetTasks = [
        { id: 'c1', title: 'Draft Product Hunt listing copy & teaser assets', status: 'InProgress', priority: 'High', label: 'Marketing', description: 'Focus on minimal visual layout style and short technical bullet points.', assignee: 'Alex Chen', dueDate: '2026-05-30' },
        { id: 'c2', title: 'Design obsidian-neon dark variant icons', status: 'Done', priority: 'Medium', label: 'Design', description: 'Generate raw high-fidelity vector shapes showing sleek modular layouts.', assignee: 'Marcus Vance', dueDate: '2026-05-20' }
      ];
      presetDocs = [
        { id: 'doc-kickoff', title: 'Product Launch TEASER Speeches', content: '# Product Synergy Roadmap\n\nLaunch with focus on absolute performance, zero-friction workflows, and AI intelligence integrations.', category: 'Guide', updatedAt: 'May 21, 2026' }
      ];
      presetChannels = [
        { id: 'ch-design', name: 'creative-feedback', category: 'Channels', unreadCount: 1 }
      ];
      presetMessages = {
        'ch-design': [
          { id: 'mc1', sender: 'Alex Chen', role: 'SaaS Facilitator', text: 'Let us publish the interactive preview link on Twitter. The feedback should highlight the custom audio synth tracker!', timeAgo: '1 hour ago', reactions: [] }
        ]
      };
      presetHabits = [
        { id: 'h4', title: 'Post 2 Community Teasers', streak: 3, completedToday: true },
        { id: 'h5', title: 'Review Figma Frame Spacings', streak: 8, completedToday: false }
      ];
      presetFiles = [
        { id: 'f4', name: 'social-banner.png', size: '1.2 MB', type: 'PNG Image', category: 'Asset', tag: 'Marketing', dateAdded: 'May 21, 2026' }
      ];
    } else {
      presetTasks = [
        { id: 'p1', title: 'Draft standard personal budget allocation spreadsheet', status: 'Todo', priority: 'Medium', label: 'Research', description: 'Consolidate multiple personal cloud records into an asset spreadsheet database.', assignee: 'Alex Chen', dueDate: '2026-05-29' }
      ];
      presetDocs = [
        { id: 'doc-journal', title: 'Daily Epiphanies & Logbook', content: '# Core Reflections\n\npersist focused mind habits. Ensure 1 Pomodoro session is run before reading social updates.', category: 'Meeting Minutes', updatedAt: 'May 22, 2026' }
      ];
      presetChannels = [
        { id: 'ch-personal', name: 'life-schedule', category: 'Channels', unreadCount: 0 }
      ];
      presetMessages = {
        'ch-personal': [
          { id: 'mp1', sender: 'Alex Chen', role: 'SaaS Facilitator', text: 'This space tracks the routines, book logs, and standard high-priority family coordination items.', timeAgo: 'Draft', reactions: [] }
        ]
      };
      presetHabits = [
        { id: 'h6', title: 'Drink 3L Water', streak: 22, completedToday: true },
        { id: 'h7', title: '15 Minutes Calm Breathing', streak: 1, completedToday: false }
      ];
      presetFiles = [];
    }

    setTasks(presetTasks);
    setDocs(presetDocs);
    setChannels(presetChannels);
    setMessages(presetMessages);
    setHabits(presetHabits);
    setCloudFiles(presetFiles);

    if (presetChannels.length > 0) setActiveChannelId(presetChannels[0].id);
    if (presetDocs.length > 0) setActiveDocId(presetDocs[0].id);
  };

  // --- Dynamic Compiler: Formulating Structured Workspace Blueprint Natively Offline ---
  const handleIntelligentWorkspaceCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptTitle.trim()) return;

    setIsAiGenerating(true);
    setAiLoadingPhase('Allocating localized workspace variables...');

    // Simulate compilation steps
    setTimeout(() => setAiLoadingPhase('Formulating custom Kanban workflows...'), 400);
    setTimeout(() => setAiLoadingPhase('Compiling Notion spec files...'), 800);
    setTimeout(() => setAiLoadingPhase('Spawning offline direct chat backups...'), 1200);

    setTimeout(() => {
      try {
        const title = aiPromptTitle.trim();
        const newWsId = `ws-dynamic-${Date.now()}`;
        const newWs: Workspace = {
          id: newWsId,
          name: title,
          code: `💻 ${title.substring(0, 7).toUpperCase()}`,
          description: aiPromptDesc || 'Offline secure workspace profile',
          accentClass: 'text-teal-400'
        };

        let newTasks: Task[] = [];
        let newDocs: Doc[] = [];
        let newChannels: Channel[] = [];
        let newMessages: Record<string, ChannelMessage[]> = {};

        if (selectedBlueprintTemplate === 'marketing') {
          newTasks = [
            { id: `t-dy-1-${Date.now()}`, title: `Compile Product Teaser assets for ${title}`, status: 'Todo', priority: 'High', label: 'Marketing', description: 'Draft raw high-contrast SVG shapes showing layout variations and deploy social copy.', assignee: 'Marcus Vance', dueDate: '2026-06-03' },
            { id: `t-dy-2-${Date.now()}`, title: `Setup campaign newsletter landing specs`, status: 'InProgress', priority: 'Medium', label: 'Design', description: 'Structure lightweight static HTML email templates to minimize client overhead.', assignee: 'Alex Chen', dueDate: '2026-06-08' },
            { id: `t-dy-3-${Date.now()}`, title: `Approve vector launch badges`, status: 'Done', priority: 'Low', label: 'Design', description: 'Review assets in bytes directory before pushing to git.', assignee: 'Marcus Vance', dueDate: '2026-05-24' }
          ];
          newDocs = [
            { id: `d-dy-1-${Date.now()}`, title: `${title} Marketing Copy Specs`, category: 'Specification', updatedAt: 'Just Now', content: `# Campaign Overview & Target\n\n- Promote absolute performance.\n- Emphasize deep-tech custom synthesizer pomodoro tracker and secure offline specs.\n\n### Campaign Goals:\n- Keep customer coordinates secure.\n- Boost conversion ratio by 15%.`, folder: 'Planning & Strategies', section: 'Active Drafts' }
          ];
          newChannels = [
            { id: `ch-dy-${Date.now()}`, name: 'marketing-synergy', category: 'Channels', unreadCount: 0 }
          ];
          newMessages = {
            [`ch-dy-${Date.now()}`]: [
              { id: `m-dy-1`, sender: 'Marcus Vance', role: 'Lead UX Designer', text: 'Hey team, I uploaded the mock social-banner files inside bytes directory. Let me know your thoughts!', timeAgo: 'Just now', reactions: [] }
            ]
          };
        } else if (selectedBlueprintTemplate === 'habits') {
          newTasks = [
            { id: `t-dy-1-${Date.now()}`, title: `Run 4 Focus intervals for ${title}`, status: 'Todo', priority: 'Medium', label: 'Research', description: 'Log completed laps to history logs and report metrics to core bench.', assignee: 'Alex Chen', dueDate: '2026-05-30' },
            { id: `t-dy-2-${Date.now()}`, title: `Track daily hydration cycle`, status: 'Done', priority: 'Low', label: 'Research', description: 'Drink 3L water and coordinates daily routines.', assignee: 'Alex Chen', dueDate: '2026-05-24' }
          ];
          newDocs = [
            { id: `d-dy-1-${Date.now()}`, title: `${title} Daily Epiphany Journal`, category: 'Meeting Minutes', updatedAt: 'Just Now', content: `# Self Reflection logbook\n\nEnsure complete focus before diving into notifications. Leverage offline Pomodoro laps carefully to optimize flow states.`, folder: 'General Specifications', section: 'Active Drafts' }
          ];
          newChannels = [
            { id: `ch-dy-${Date.now()}`, name: 'habit-routine', category: 'Channels', unreadCount: 0 }
          ];
          newMessages = {
            [`ch-dy-${Date.now()}`]: [
              { id: `m-dy-1`, sender: 'Alex Chen', role: 'SaaS Facilitator', text: 'Spawning habit planner. Let us hit our streaks consistently!', timeAgo: 'Just now', reactions: [] }
            ]
          };
        } else if (selectedBlueprintTemplate === 'product-design') {
          newTasks = [
            { id: `t-dy-1-${Date.now()}`, title: `Formulate modular Design Tokens for ${title}`, status: 'Todo', priority: 'High', label: 'Design', description: 'Define spacing scale, typography curves, and clean tailwind theme extensions.', assignee: 'Marcus Vance', dueDate: '2026-06-03' },
            { id: `t-dy-2-${Date.now()}`, title: `Review micro-interactions on task card checkbox`, status: 'InProgress', priority: 'Medium', label: 'Design', description: 'Polish hover transition durations and focus rings for seamless user response.', assignee: 'Alex Chen', dueDate: '2026-05-29' }
          ];
          newDocs = [
            { id: `d-dy-1-${Date.now()}`, title: `${title} Interactive Guidelines`, category: 'Specification', updatedAt: 'Just Now', content: `# Design System & Typography\n\n- Header font: Space Grotesk\n- Body font: Inter\n- Mono font: JetBrains Mono\n\n### Design philosophy:\n- Elegant negative space.\n- Micro-animations to guide user attention.`, folder: 'Planning & Strategies', section: 'Active Drafts' }
          ];
          newChannels = [
            { id: `ch-dy-${Date.now()}`, name: 'design-radar', category: 'Channels', unreadCount: 0 }
          ];
          newMessages = {
            [`ch-dy-${Date.now()}`]: [
              { id: `m-dy-1`, sender: 'Marcus Vance', role: 'Lead UX Designer', text: 'Spawning product design blueprint! Let us build a masterfully crafted visual interface.', timeAgo: 'Just now', reactions: [] }
            ]
          };
        } else if (selectedBlueprintTemplate === 'security-audit') {
          newTasks = [
            { id: `t-dy-1-${Date.now()}`, title: `Secure local sandbox boundary for ${title}`, status: 'Todo', priority: 'High', label: 'Security', description: 'Confirm zero key disclosure occurs and verify local state serialization.', assignee: 'Elena Rostova', dueDate: '2026-05-31' },
            { id: `t-dy-2-${Date.now()}`, title: `Audit cipher algorithms on client session`, status: 'InProgress', priority: 'Medium', label: 'Research', description: 'Verify deterministic SHA-256 coordinates for task encryption.', assignee: 'Elena Rostova', dueDate: '2026-06-05' }
          ];
          newDocs = [
            { id: `d-dy-1-${Date.now()}`, title: `${title} Security Architecture Spec`, category: 'Security Reports', updatedAt: 'Just Now', content: `# Security Controls\n\n- No remote database keys\n- Sandboxed execution state\n- Total local synchronization.`, folder: 'Development Blueprints', section: 'Production Specifications' }
          ];
          newChannels = [
            { id: `ch-dy-${Date.now()}`, name: 'security-alerts', category: 'Channels', unreadCount: 0 }
          ];
          newMessages = {
            [`ch-dy-${Date.now()}`]: [
              { id: `m-dy-1`, sender: 'Elena Rostova', role: 'Staff API Architect', text: 'Hardened cryptographic hashes established. Sandboxing complete.', timeAgo: 'Just now', reactions: [] }
            ]
          };
        } else if (selectedBlueprintTemplate === 'personal-journal') {
          newTasks = [
            { id: `t-dy-1-${Date.now()}`, title: `Track personal sprint habits and Pomodoro laps`, status: 'Todo', priority: 'Medium', label: 'Research', description: 'Log finished intervals to Pomodoro History inside focus planners.', assignee: 'Alex Chen', dueDate: '2026-05-30' },
            { id: `t-dy-2-${Date.now()}`, title: `Submit weekly architecture evaluation`, status: 'InProgress', priority: 'Low', label: 'Research', description: 'Write down findings inside Daily Epiphany logbook.', assignee: 'Alex Chen', dueDate: '2026-05-28' }
          ];
          newDocs = [
            { id: `d-dy-1-${Date.now()}`, title: `${title} Epiphany Logbook`, category: 'Meeting Minutes', updatedAt: 'Just Now', content: `# Self Reflection logbook\n\nEnsure complete focus before diving into notifications. Leverage offline Pomodoro laps carefully to optimize flow states.`, folder: 'General Specifications', section: 'Active Drafts' }
          ];
          newChannels = [
            { id: `ch-dy-${Date.now()}`, name: 'journal-updates', category: 'Channels', unreadCount: 0 }
          ];
          newMessages = {
            [`ch-dy-${Date.now()}`]: [
              { id: `m-dy-1`, sender: 'Alex Chen', role: 'SaaS Facilitator', text: 'Personal journal schema imported. Keep up the high energy!', timeAgo: 'Just now', reactions: [] }
            ]
          };
        } else {
          newTasks = [
            { id: `t-dy-1-${Date.now()}`, title: `Integrate secure PDF local parser in ${title}`, status: 'InProgress', priority: 'High', label: 'Engineering', description: 'Utilize pure client-side printable templates to export markdown specifications without server latency.', assignee: 'Elena Rostova', dueDate: '2026-05-28' },
            { id: `t-dy-2-${Date.now()}`, title: `Test SHA-256 and MD5 cryptographic seeds`, status: 'Todo', priority: 'Medium', label: 'Engineering', description: 'Formulate deterministic client hashes for multi-user session verification.', assignee: 'Elena Rostova', dueDate: '2026-06-02' },
            { id: `t-dy-3-${Date.now()}`, title: `Deploy nested folder drawer for wiki specs`, status: 'Done', priority: 'High', label: 'Design', description: 'Group documents dynamically under Folders and Sections inside the side navigation bar.', assignee: 'Marcus Vance', dueDate: '2026-05-24' }
          ];
          newDocs = [
            { id: `d-dy-1-${Date.now()}`, title: `${title} Architecture Spec`, category: 'API Schema', updatedAt: 'Just Now', content: `# System Architecture\n\nWe coordinate standard workspace modules around offline local-first state storage.\n\n### Core Schema:\n- Base URL: localhost:3000\n- Offline PDF Renderer: window.print() system\n- Active Multi-User Switcher: state synchronized`, folder: 'Development Blueprints', section: 'Production Specifications' }
          ];
          newChannels = [
            { id: `ch-dy-${Date.now()}`, name: 'engineering-core', category: 'Channels', unreadCount: 0 }
          ];
          newMessages = {
            [`ch-dy-${Date.now()}`]: [
              { id: `m-dy-1`, sender: 'Elena Rostova', role: 'Staff API Architect', text: 'I updated the port bindings inside local configs. Port 3000 is running perfectly secure offline.', timeAgo: 'Just now', reactions: [] }
            ]
          };
        }

        setWorkspaces(prev => [...prev, newWs]);
        setActiveWorkspaceId(newWsId);
        setTasks(newTasks);
        setDocs(newDocs);
        setChannels(newChannels);
        setMessages(newMessages);
        setHabits([
          { id: `hdy-1-${Date.now()}`, title: `Check ${title} milestones`, streak: 1, completedToday: false },
          { id: `hdy-2-${Date.now()}`, title: 'Complete focus session', streak: 4, completedToday: true }
        ]);
        setCloudFiles([
          { id: `fdy-1-${Date.now()}`, name: `compiled-spec-${title.toLowerCase().replace(/\s+/g, '-')}.md`, size: '1.8 KB', type: 'Markdown Document', category: 'Document', tag: 'Core', dateAdded: 'Just Now' }
        ]);

        if (newChannels.length > 0) setActiveChannelId(newChannels[0].id);
        if (newDocs.length > 0) setActiveDocId(newDocs[0].id);

        setActiveMenu('projects');
        setAiPromptTitle('');
        setAiPromptDesc('');
        setIsAiGenerating(false);

      } catch (err) {
        console.error(err);
        setIsAiGenerating(false);
      }
    }, 1500);
  };

  // --- Send Chat message in Channels/DMs & Trigger Adaptive AI Teammate Responses ---
  const handleSendMessage = (customText?: string) => {
    const textToSend = customText !== undefined ? customText : chatMessageText;
    if (!textToSend.trim()) return;

    const activeChatChannel = channels.find(c => c.id === activeChannelId);
    const channelNameText = activeChatChannel ? activeChatChannel.name : 'general';

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChannelMessage = {
      id: `m-usr-${Date.now()}`,
      sender: profileName || (googleUser ? googleUser.name : currentActiveUser.name),
      role: `${currentActiveUser.role} (Active Session)`,
      text: textToSend,
      timeAgo: 'Just Now',
      timestamp: timestampStr,
      reactions: []
    } as any;

    const currentChannelMsgs = messages[activeChannelId] || [];
    const updatedMsgs = [...currentChannelMsgs, newMsg];

    setMessages(prev => ({
      ...prev,
      [activeChannelId]: updatedMsgs
    }));

    const sentText = textToSend;
    setChatMessageText('');

    // Trigger AI response to simulate collaboration
    setTimeout(async () => {
      // Simulate teammate based on DM/Channel context
      let senderName = 'Marcus Vance';
      let senderRole = 'Lead UX Designer';
      
      if (activeChatChannel?.category === 'Direct Messages') {
        senderName = activeChatChannel.name;
        senderRole = activeChatChannel.role || 'Teammate';
      } else {
        // Pick dynamic teammate
        const teammatePool = [
          { name: 'Elena Rostova', role: 'Staff API Architect' },
          { name: 'Marcus Vance', role: 'Lead UX Designer' },
          { name: 'Core OS Assistant', role: 'System AI Co-pilot' }
        ];
        const chosen = teammatePool[Math.floor(Math.random() * teammatePool.length)];
        senderName = chosen.name;
        senderRole = chosen.role;
      }

      // Call server side chat helper using current context
      try {
        const historyContext = updatedMsgs.slice(-5).map(m => ({
          sender: m.sender === 'Alex Chen' ? 'user' : 'assistant',
          text: `[${m.sender} - ${m.role}]: ${m.text}`
        }));

        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Current Slack channel: #${channelNameText}. Teammate responding: ${senderName} (${senderRole}). Alex Chen just said: "${sentText}". Formulate a quick, highly realistic follow-up workspace query or collaborative text matching your teammate personality. 1-2 sentence response. Direct dialogue, do not wrap in descriptive narrations.`,
            history: historyContext
          })
        });

        const data = await response.json();
        const responseText = data.text || 'Checking coordinates, looks solid!';

        const aiMsg: ChannelMessage = {
          id: `m-ai-${Date.now()}`,
          sender: senderName,
          role: senderRole,
          text: responseText,
          timeAgo: 'Just Now',
          reactions: [{ emoji: '💬', count: 1, users: ['Alex'] }]
        };

        setMessages(prev => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), aiMsg]
        }));
      } catch (err) {
        // Sim response fallback
        const aiMsg: ChannelMessage = {
          id: `m-ai-${Date.now()}`,
          sender: senderName,
          role: senderRole,
          text: `Got that. Let's analyze the codebase constraints next morning.`,
          timeAgo: 'Just Now',
          reactions: []
        };
        setMessages(prev => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), aiMsg]
        }));
      }
    }, 1500);
  };

  // --- Dynamic Channel AI Summarizer ---
  const handleSummarizeChannelDiscussion = async () => {
    const activeChatChannel = channels.find(c => c.id === activeChannelId);
    if (!activeChatChannel) return;

    const msgsToSummarize = messages[activeChannelId] || [];
    if (msgsToSummarize.length === 0) {
      alert("No discussion messages inside this channel yet to summarize.");
      return;
    }

    setIsAiTyping(true);
    setIsAssistantOpen(true);

    const docCompilation = msgsToSummarize.map(m => `${m.sender} (${m.role}): ${m.text}`).join('\n');

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Provide an executive, ultra-minimal bullet-point workspace summary of the following team channel discussion in Slack channel #${activeChatChannel.name}:\n\n${docCompilation}`
        })
      });
      const data = await response.json();
      const text = data.text || "Could not parse summaries.";

      setAiChatHistory(prev => [
        ...prev,
        { sender: 'user', text: `Summarize Channel #${activeChatChannel.name}` },
        { sender: 'assistant', text: `### 📜 Summary of #${activeChatChannel.name}\n\n${text}` }
      ]);
    } catch (err) {
      setAiChatHistory(prev => [
        ...prev,
        { sender: 'assistant', text: "Service error compiled, please try re-submitting channel logs." }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // --- Notion Document AI Assistant Edit ---
  const handleAiEditWikiDoc = async (instruction: string) => {
    const doc = docs.find(d => d.id === activeDocId);
    if (!doc) return;

    setIsAiTyping(true);
    setIsAssistantOpen(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `You are an elite copy editor. Respond with ONLY the updated markdown document body. Do not include introductory text. Update this document based on constraints: "${instruction}"\n\nTitle: ${doc.title}\nCategory: ${doc.category}\n\nDocument Body:\n${doc.content}`
        })
      });
      const data = await response.json();
      const updatedBody = data.text || doc.content;

      // Update state
      setDocs(prev => prev.map(d => {
        if (d.id === activeDocId) {
          return { ...d, content: updatedBody, updatedAt: 'Just Now (AI Updated)' };
        }
        return d;
      }));

      setAiChatHistory(prev => [
        ...prev,
        { sender: 'assistant', text: `📝 Updated Document: **${doc.title}** dynamically based on your request.` }
      ]);
    } catch (e) {
      alert("Failed to access Gemini to update page content.");
    } finally {
      setIsAiTyping(false);
    }
  };

  // --- Conversational Assistant UI Chat with Context Aggregation & Natural Language Quick-Add ---
  const handleSendAssistantChat = async (forcedQuery?: unknown) => {
    const queryToSubmit = (typeof forcedQuery === 'string') ? forcedQuery : aiChatInput;
    if (!queryToSubmit || !queryToSubmit.trim()) return;

    setAiChatInput('');
    setAiChatHistory(prev => [...prev, { sender: 'user', text: queryToSubmit }]);
    setIsAiTyping(true);

    const lowercaseQuery = queryToSubmit.toLowerCase().trim();

    // 1. Natural Language Quick-Add Task Parser
    if (lowercaseQuery.startsWith('add task') || lowercaseQuery.startsWith('create task')) {
      const cleanTitle = queryToSubmit
        .replace(/^(add task|create task)\s+/i, '')
        .trim();

      if (cleanTitle) {
        const parsedPriority = lowercaseQuery.includes('priority low') ? 'Low' : lowercaseQuery.includes('priority high') ? 'High' : 'Medium';
        const parsedStatus = lowercaseQuery.includes('status done') ? 'Done' : lowercaseQuery.includes('status progress') ? 'InProgress' : 'Todo';
        
        const newTaskItem: Task = {
          id: `task-ai-dyn-${Date.now()}`,
          title: cleanTitle.split(' priority ')[0].split(' status ')[0],
          status: parsedStatus,
          priority: parsedPriority,
          label: 'AI Quick Add',
          description: `Automatically created via conversational quick-add instruction in Aura Copilot.`,
          assignee: 'Alex Chen',
          dueDate: new Date().toISOString().split('T')[0]
        };

        setTasks(prev => [...prev, newTaskItem]);
        setTimeout(() => {
          setAiChatHistory(prev => [
            ...prev,
            { sender: 'assistant', text: `✅ **Task created successfully!** Installed task **"${newTaskItem.title}"** inside the **${newTaskItem.status}** column with **${newTaskItem.priority}** priority.` }
          ]);
          setIsAiTyping(false);
        }, 500);
        return;
      }
    }

    // 2. Natural Language Quick-Add Wiki Doc Parser
    if (lowercaseQuery.startsWith('add doc') || lowercaseQuery.startsWith('create doc')) {
      const cleanDocTitle = queryToSubmit
        .replace(/^(add doc|create doc)\s+/i, '')
        .trim();

      if (cleanDocTitle) {
        const newWikiDoc: Doc = {
          id: `doc-ai-dyn-${Date.now()}`,
          title: cleanDocTitle,
          content: `# ${cleanDocTitle}\n\n- Created via natural language prompt. Description spec to be detailed next.`,
          category: 'AI Blueprint',
          updatedAt: 'Just Now'
        };

        setDocs(prev => [...prev, newWikiDoc]);
        setTimeout(() => {
          setAiChatHistory(prev => [
            ...prev,
            { sender: 'assistant', text: `📝 **Wiki Document created!** Generated draft **"${newWikiDoc.title}"** inside the specifications list.` }
          ]);
          setIsAiTyping(false);
        }, 500);
        return;
      }
    }

    // 3. Conversational AI Assistant Context-Aware Thread Query
    try {
      const systemContextMessage = `[WORKSPACE OS ECOSYSTEM ACTIVE CONTEXT]: 
Active Workspace Tasks Checklist: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority, label: t.label })))};
Active Wiki Documents: ${JSON.stringify(docs.map(d => ({ title: d.title, category: d.category })))};
Active channels list: ${JSON.stringify(channels.map(c => c.name))}.
User Query instruction: ${queryToSubmit}`;

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: systemContextMessage,
          history: aiChatHistory
        })
      });

      if (!response.ok) {
        // Fallback to offline responsive NLP module so that the copilot is ALWAYS working beautifully!
        const queryLower = lowercaseQuery;
        let responseText = '';
        if (queryLower.includes('summary') || queryLower.includes('sprint') || queryLower.includes('status')) {
          const todoCount = tasks.filter(t => t.status === 'Todo').length;
          const progressCount = tasks.filter(t => t.status === 'InProgress').length;
          const doneCount = tasks.filter(t => t.status === 'Done').length;
          responseText = `📋 **Offline Local Workspace Summary**:\n\n• **Active Boards Status**: \`Backlog\`: ${tasks.filter(t => t.status === 'Backlog').length} | \`Todo\`: ${todoCount} | \`In Progress\`: ${progressCount} | \`Completed\`: ${doneCount}\n• **Sprint Speed**: You have completed **${Math.round((doneCount / (tasks.length || 1)) * 100)}%** of the general project milestones.\n• **Hot Tasks**: ${tasks.filter(t => t.priority === 'High' && t.status !== 'Done').map(t => `"${t.title}"`).slice(0, 2).join(', ') || 'None'}\n\n*Aura system is functioning locally in offline sandbox mode without exposing telemetry.*`;
        } else if (queryLower.includes('task') || queryLower.includes('kanban')) {
          responseText = `🎯 **Workspace Task Planner Guide**:\nTo quickly inject a card coordinates into key backlog lists, use the conversational syntax:\n- Type **"add task [New Task Title] priority high status progress"**\nOr use the \`Alt + N\` hotkey combination to draft and edit a new task card instantly!`;
        } else if (queryLower.includes('wiki') || queryLower.includes('doc') || queryLower.includes('notion')) {
          responseText = `📝 **Notion Specification Mirror Overview**:\nThere are currently **${docs.length} documentation spec pages** active. You can create a new specification directly:\n- Type **"add doc [New Page Title]"** in this chat feed.\n- Navigate to the **Notion Wiki Registry** via \`Alt + W\` to visually edit full Markdown specifications.`;
        } else if (queryLower.includes('theme') || queryLower.includes('palette') || queryLower.includes('color')) {
          responseText = `🎨 **Aesthetic Palette Configurator**:\nWe support **4 high-contrast system themes**:\n1. **Geometric Balance** (Default dark gray)\n2. **Obsidian Pitch** (Slick pitch dark)\n3. **Cosmic Dusk** (Ambient deep space)\n4. **Emerald Cyber** (Vibrant cyber green)\n\n*Hotkey: Press \`Alt + R\` to toggle random themes right now!*`;
        } else if (queryLower.includes('pomo') || queryLower.includes('timer') || queryLower.includes('focus')) {
          responseText = `⏱️ **Pomodoro Attention Loop**:\nTo trigger the spatial audio synthesizer focus loop:\n- Press **Alt + H** to immediately activate/pause the 25-minute focus session.\n- Current completed focus repetitions: **${pomoLapsCount} intervals**.`;
        } else {
          responseText = `🤖 **Aura Local Co-pilot Response**: \nI am responding in offline sandbox mode. Here are some quick directives to control your Workspace coordinates:\n- Let's finalize your high-priority items like: **"${tasks.find(t => t.priority === 'High')?.title || 'code refactoring'}"**.\n- You can use standard developer hotkeys (try **Alt + N** for a new card or **Alt + S** for settings).\n\n*To enable the complete live generative Gemini 3.5 model, configure your API Key in the Settings panel.*`;
        }
        setAiChatHistory(prev => [...prev, { sender: 'assistant', text: responseText }]);
      } else {
        const data = await response.json();
        setAiChatHistory(prev => [...prev, { sender: 'assistant', text: data.text || 'Process mapping achieved.' }]);
      }
    } catch (e) {
      // Offline responsive local parsing on throw
      const queryLower = lowercaseQuery;
      let responseText = '';
      if (queryLower.includes('summary') || queryLower.includes('sprint') || queryLower.includes('status')) {
        const todoCount = tasks.filter(t => t.status === 'Todo').length;
        const progressCount = tasks.filter(t => t.status === 'InProgress').length;
        const doneCount = tasks.filter(t => t.status === 'Done').length;
        responseText = `📋 **Offline Local Workspace Summary**:\n\n• **Active Boards Status**: \`Backlog\`: ${tasks.filter(t => t.status === 'Backlog').length} | \`Todo\`: ${todoCount} | \`In Progress\`: ${progressCount} | \`Completed\`: ${doneCount}\n• **Sprint Speed**: You have completed **${Math.round((doneCount / (tasks.length || 1)) * 100)}%** of the general project milestones.\n• **Hot Tasks**: ${tasks.filter(t => t.priority === 'High' && t.status !== 'Done').map(t => `"${t.title}"`).slice(0, 2).join(', ') || 'None'}`;
      } else {
        responseText = `🤖 **Aura Offline Workspace Agent**:\nActive in secure client-side model sandbox. You can coordinate your sprints using hotkeys like:\n- **Alt + N** for an instant new task card.\n- **Alt + S** to view Keyboard Shortcuts mapped directly in the settings tab.`;
      }
      setAiChatHistory(prev => [...prev, { sender: 'assistant', text: responseText }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // --- Add Items Helper Creators ---
  const handleCreateTask = (status: Task['status']) => {
    const newTask: Task = {
      id: `task-new-${Date.now()}`,
      title: 'New Workspace Specification Issue',
      status,
      priority: 'Medium',
      label: 'Engineering',
      description: 'Define exact architectural coordinates and set sprint bounds.',
      assignee: 'Alex Chen',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    setEditingTask(newTask);
  };

  const handleCreateWikiDoc = () => {
    const newDocObj: Doc = {
      id: `doc-new-${Date.now()}`,
      title: 'Untitled Document Draft',
      content: '# Document Draft\n\n- Press edit to modify raw texts.\n- Command palette contains rich markdown references.',
      category: 'Specification',
      updatedAt: 'Just Now'
    };
    setDocs(prev => [...prev, newDocObj]);
    setActiveDocId(newDocObj.id);
    setIsWikiEditing(true);
  };

  const handleCreateHabit = () => {
    if (!newHabitName.trim()) return;
    const newHb: Habit = {
      id: `hb-new-${Date.now()}`,
      title: newHabitName,
      streak: 0,
      completedToday: false
    };
    setHabits(prev => [...prev, newHb]);
    setNewHabitName('');
  };

  // Add Emoji reaction to chat message
  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessages(prev => {
      const currentChMessages = prev[activeChannelId] || [];
      const updatedMessages = currentChMessages.map(m => {
        if (m.id === msgId) {
          const reactions = [...m.reactions];
          const existIdx = reactions.findIndex(r => r.emoji === emoji);
          if (existIdx >= 0) {
            reactions[existIdx] = {
              ...reactions[existIdx],
              count: reactions[existIdx].count + 1,
              users: [...reactions[existIdx].users, 'Self']
            };
          } else {
            reactions.push({ emoji, count: 1, users: ['Self'] });
          }
          return { ...m, reactions };
        }
        return m;
      });
      return { ...prev, [activeChannelId]: updatedMessages };
    });
  };

  // Drag and Drop simulated helpers
  const handleMoveTaskStatus = (taskId: string, direction: 'forward' | 'backward') => {
    const statusIdx: Task['status'][] = ['Backlog', 'Todo', 'InProgress', 'Done'];
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const curIdx = statusIdx.indexOf(t.status);
        let targetIdx = curIdx + (direction === 'forward' ? 1 : -1);
        if (targetIdx >= 0 && targetIdx < statusIdx.length) {
          return { ...t, status: statusIdx[targetIdx] };
        }
      }
      return t;
    }));
  };

  // --- Command Palette Quick Execution ---
  const handleExecuteCommand = (cmd: string) => {
    setIsCommandPaletteOpen(false);
    setPaletteQuery('');
    if (cmd === 'new-task') {
      handleCreateTask('Todo');
    } else if (cmd === 'new-doc') {
      handleCreateWikiDoc();
    } else if (cmd === 'pomo-start') {
      setPomoActive(true);
      setActiveMenu('personal');
    } else if (cmd === 'theme-emerald') {
      setCurrentTheme(THEMES[2]);
    } else if (cmd === 'theme-obsidian') {
      setCurrentTheme(THEMES[0]);
    } else if (cmd === 'theme-cosmic') {
      setCurrentTheme(THEMES[1]);
    } else if (cmd === 'theme-light') {
      setCurrentTheme(THEMES[3]);
    } else if (cmd === 'clear-done') {
      setTasks(prev => prev.filter(t => t.status !== 'Done'));
    }
  };

  // Calculated variables
  const filteredDocs = docs.filter(doc => doc.title.toLowerCase().includes(docSearch.toLowerCase()));
  const currentDoc = docs.find(d => d.id === activeDocId);
  const currentChannel = channels.find(c => c.id === activeChannelId);
  const currentChannelMsgs = messages[activeChannelId] || [];

  // Completed tasks count
  const doneTasks = tasks.filter(t => t.status === 'Done');
  const inProgressTasks = tasks.filter(t => t.status === 'InProgress');
  const progressRatio = tasks.length > 0 ? (doneTasks.length / tasks.length) * 100 : 0;

  return (
    <div className={`min-h-screen font-sans flex flex-col uppercase-none overflow-x-hidden select-none ${currentTheme.bgClass} transition-colors duration-500`}>
      
      {isBooting && (
        <div className="fixed inset-0 bg-[#060608] z-[9999] flex flex-col items-center justify-center font-mono text-xs text-white selection:bg-indigo-500/30 animate-fade-in">
          <div className="w-[380px] space-y-6">
            {/* Header logo */}
            <div className="flex items-center space-x-3 select-none">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/10 p-2 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-wider uppercase text-[#EDEDED]">Trecko Workspace</span>
                <span className="text-[10px] text-[#daff33] font-bold uppercase tracking-widest animate-pulse">BOOT SEQUENCE V4.5.3</span>
              </div>
            </div>

            {/* Terminal text and status */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2 select-none">
              <div className="flex items-center justify-between text-[10px] text-white/40 border-b border-white/5 pb-1.5">
                <span>SYSTEM DIAGNOSIS</span>
                <span className="text-[#daff33] font-bold">ONLINE</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-white/70">
                <p className="text-white/45">&gt; Loading local app states...</p>
                <p className="text-white/45">&gt; PORT: 3000 Ingress Ready</p>
                <p className="text-[#daff33] flex items-center gap-1.5 mt-1">
                  <span className="inline-block w-1.5 h-1.5 bg-[#daff33] rounded-full shrink-0" />
                  <span className="animate-pulse">{bootPhase}</span>
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-white/40">
                <span>COMPILING ENVIRONMENT</span>
                <span className="text-white/80">{bootProgress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-[#daff33] rounded-full transition-all duration-150" 
                  style={{ width: `${bootProgress}%` }}
                />
              </div>
            </div>

            <div className="text-center">
              <span className="text-[9px] text-white/30 tracking-wider uppercase">SECURE OFFLINE CLIENT COORDINATES ACTIVE</span>
            </div>
          </div>
        </div>
      )}
      
      {/* --- MASTER NAVIGATION TOP BAR --- */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40 bg-[#090909]/80 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/10 p-1.5 rounded-lg flex items-center justify-center shadow-lg transition-all hover:scale-105">
            <Layers className="w-8 h-8 text-white" id="icon-brand" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wider uppercase text-[#EDEDED]">Trecko</span>
          </div>
        </div>

        {/* --- Unified Search Input & Quick Command trigger --- */}
        <div className="hidden md:flex items-center space-x-2 flex-grow max-w-md mx-6">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full h-9 px-4 rounded-full flex items-center justify-between text-xs border border-white/10 bg-white/5 hover:border-indigo-500/50 text-left text-white/40 transition-all focus:outline-none"
          >
            <span className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-white/40" />
              <span>Command + K</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[9px] bg-white/10 text-white/60 border border-white/5 rounded select-none">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* --- Quick Header Tools --- */}
        <div className="flex items-center space-x-3 text-xs">
          <div
            onMouseEnter={() => setIsPomoHovered(true)}
            onMouseLeave={() => setIsPomoHovered(false)}
            className="relative group shadow-sm mr-3"
          >
            <button
              id="header-timer-btn"
              onClick={() => handleExecuteCommand('pomo-start')}
              className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg border border-white/5 bg-[#0a0a0c]/85 hover:bg-white/10 hover:border-emerald-500/40 transition-all text-white/80 cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.05)]"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {/* Minimalist Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 select-none pointer-events-none" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1.5"
                    fill="transparent"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#10B981"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 10}
                    strokeDashoffset={(2 * Math.PI * 10) * (1 - pomoTime / pomoMaxTime)}
                    strokeLinecap="square"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: 'drop-shadow(0px 0px 3px rgba(16, 185, 129, 0.6))'
                    }}
                  />
                </svg>
                <Clock className={`w-3 h-3 text-[#10B981] ${pomoActive ? 'animate-pulse' : ''}`} style={{ filter: 'drop-shadow(0px 0px 2px rgba(16, 185, 129, 0.4))' }} />
              </div>
              <span className="font-mono text-[11px] font-bold tracking-wider text-[#10B981]">
                {Math.floor(pomoTime / 60)}:{(pomoTime % 60).toString().padStart(2, '0')}
              </span>
            </button>
            <div className="absolute top-full right-0 h-4 bg-transparent w-40" /> {/* Hover bridge gap */}

            {isPomoHovered && (
              <div className="absolute right-0 top-full mt-2 w-68 bg-[#09090b]/98 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 text-xs animate-fade-in space-y-4 ring-1 ring-[#10B981]/20 text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 select-none">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-2 w-2">
                      {pomoActive && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                      )}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${pomoActive ? 'bg-[#10B981]' : 'bg-white/20'}`}></span>
                    </span>
                    <span className="font-mono text-[9px] font-bold text-white/50 uppercase tracking-widest">Focus Session</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold border tracking-wide select-none ${
                    pomoActive
                      ? 'bg-emerald-500/10 text-[#10B981] border-[#10B981]/20'
                      : 'bg-white/5 text-white/40 border-white/5'
                  }`}>
                    {pomoActive ? 'COUNTING' : 'SUSPENDED'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-[9px] leading-none text-white/40 select-none">
                    <span className="uppercase tracking-wider">Acoustic wave hum</span>
                    <span className="text-[#10B981] font-bold">{Math.floor(pomoTime / 60)}m left</span>
                  </div>
                  {/* Progress bar with modern design */}
                  <div className="h-1.5 w-full bg-white/[0.02] overflow-hidden rounded-full border border-white/5 p-[1px]">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-[#10B981] to-[#daff33] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(pomoTime / pomoMaxTime) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Additional Stats Grid to enforce the premium aesthetic */}
                <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-2.5 font-mono select-none">
                  <div>
                    <p className="text-[8px] text-zinc-500 uppercase tracking-wider">Laps Completed</p>
                    <p className="text-xs font-bold text-[#10B981]">{pomoLapsCount}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-zinc-500 uppercase tracking-wider">Acoustic Wave</p>
                    <p className="text-xs font-bold text-zinc-300">{pomoSoundOn ? "Active Hum" : "Muted"}</p>
                  </div>
                </div>

                {/* Micro quick operations */}
                <div className="flex gap-1.5 pt-1 font-mono text-[9.5px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePomodoro();
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                      pomoActive 
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981] border-[#10B981]/20' 
                        : 'bg-[#10B981] hover:bg-[#10B981]/90 text-black font-extrabold border-0 shadow-md shadow-emerald-500/15'
                    }`}
                  >
                    {pomoActive ? 'PAUSE TIMER' : 'START FOCUS'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPomodoro();
                    }}
                    className="p-1.5 px-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg border border-white/5 transition-all cursor-pointer flex items-center justify-center hover:border-emerald-500/30"
                    title="Reset Focus Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* --- Custom Profile Icon with Dropdown Menu & File Uploader --- */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-9 h-9 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center cursor-pointer overflow-hidden hover:border-white/30 transition-all select-none focus:outline-none animate-fade-in"
              title="Custom User Profile"
            >
              {profilePicUrl ? (
                <img src={profilePicUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Profile" />
              ) : googleUser ? (
                <img src={googleUser.picture} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center font-bold text-xs font-mono"
                  style={{ backgroundColor: currentActiveUser.color + '20', color: currentActiveUser.color }}
                >
                  {profileName ? profileName.slice(0, 2).toUpperCase() : currentActiveUser.initials}
                </div>
              )}
            </button>

            {isProfileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#09090b]/98 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-xs text-left animate-fade-in space-y-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="font-sans text-xs font-bold text-white uppercase tracking-wider">Profile</span>
                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="p-1 px-2 text-zinc-400 hover:text-white rounded-lg bg-white/5 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <div className="w-12 h-12 rounded-full border border-white/10 bg-zinc-950 overflow-hidden shrink-0 relative flex items-center justify-center">
                      {profilePicUrl ? (
                        <img src={profilePicUrl} className="w-full h-full object-cover animate-fade-in" alt="Avatar" />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center font-bold text-xs font-mono"
                          style={{ backgroundColor: currentActiveUser.color + '20', color: currentActiveUser.color }}
                        >
                          {profileName ? profileName.slice(0, 2).toUpperCase() : currentActiveUser.initials}
                        </div>
                      )}
                    </div>
                    <div className="truncate flex-grow">
                      <p className="font-semibold text-xs text-white truncate">
                        {profileName || (googleUser ? googleUser.name : currentActiveUser.name)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Name field */}
                    <div className="space-y-1 block text-left">
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">name</label>
                      <input
                        type="text"
                        placeholder="Enter custom nickname..."
                        value={profileName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProfileName(val);
                          localStorage.setItem('custom_profile_name', val);
                        }}
                        className="w-full bg-[#121214]/90 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>

                    {/* Profile Pic Upload from Gallery */}
                    <div className="space-y-1.5 block text-left">
                      <label className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Upload avatar from gallery</label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center px-3 py-2 border border-dashed border-white/10 hover:border-indigo-500/40 bg-zinc-950/[0.3] hover:bg-zinc-950/20 rounded-xl cursor-pointer text-[10px] font-mono font-bold text-zinc-300 hover:text-white transition-all">
                          <span>📁 Upload Pic</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64 = event.target?.result as string;
                                  if (base64) {
                                    setProfilePicUrl(base64);
                                    localStorage.setItem('custom_profile_pic_url', base64);
                                    useAppStore.getState().addNotification('Avatar Uploaded', 'New profile picture rendered successfully.', 'info');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {profilePicUrl && (
                          <button
                            onClick={() => {
                              setProfilePicUrl('');
                              localStorage.removeItem('custom_profile_pic_url');
                              useAppStore.getState().addNotification('Avatar Removed', 'Resorted to default user initials.', 'info');
                            }}
                            className="p-2 border border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                            title="Remove custom picture"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>


        </div>
      </header>

      {/* --- MAIN CORE GRID CONTAINER --- */}
      <div className="flex-grow flex relative">
        
        {/* --- COLUMN 1: LEFT AREA WORKSPACE MENU --- */}
        <aside className={`${isSidebarCollapsed ? 'w-14' : 'w-56'} border-r border-white/5 bg-[#0C0C0C]/50 flex flex-col shrink-0 text-[#f4f4f5] text-xs transition-all duration-300 ease-out overflow-x-hidden`}>
          
          {/* Workspace selector container */}
          <div className={`p-4 border-b border-white/5 flex flex-col ${isSidebarCollapsed ? 'items-center justify-center' : 'space-y-2'}`}>
            {isSidebarCollapsed ? (
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 text-[#daff33] font-bold flex items-center justify-center border border-indigo-500/30 text-xs font-mono select-none"
                title={workspaces.find(w => w.id === activeWorkspaceId)?.name || 'WS'}
              >
                {(workspaces.find(w => w.id === activeWorkspaceId)?.name || 'WS').charAt(0).toUpperCase()}
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Workspace</h2>
                </div>

                {isEditingActiveWorkspaceInline ? (
                  <div className="space-y-2.5 p-2.5 rounded-lg bg-white/5 border border-white/10 animate-fade-in text-left">
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider font-mono">Edit Workspace Specs</p>
                    
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-wider text-white/30 font-bold font-mono">Workspace Name</label>
                      <input
                        type="text"
                        value={inlineWorkspaceName}
                        onChange={(e) => setInlineWorkspaceName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (!inlineWorkspaceName.trim()) return;
                            setWorkspaces(prev => prev.map(w => w.id === activeWorkspaceId ? {
                              ...w,
                              name: inlineWorkspaceName.trim(),
                              description: inlineWorkspaceDesc.trim(),
                              accentClass: inlineWorkspaceAccent,
                              code: `▲ ${inlineWorkspaceName.trim().substring(0, 5).toUpperCase()}`
                            } : w));
                            setIsEditingActiveWorkspaceInline(false);
                          }
                        }}
                        className="w-full bg-[#050505] border border-white/10 px-2 py-1 text-xs rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium font-sans"
                        placeholder="Workspace name..."
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-wider text-white/30 font-bold font-mono">Description / Objectives</label>
                      <input
                        type="text"
                        value={inlineWorkspaceDesc}
                        onChange={(e) => setInlineWorkspaceDesc(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (!inlineWorkspaceName.trim()) return;
                            setWorkspaces(prev => prev.map(w => w.id === activeWorkspaceId ? {
                              ...w,
                              name: inlineWorkspaceName.trim(),
                              description: inlineWorkspaceDesc.trim(),
                              accentClass: inlineWorkspaceAccent,
                              code: `▲ ${inlineWorkspaceName.trim().substring(0, 5).toUpperCase()}`
                            } : w));
                            setIsEditingActiveWorkspaceInline(false);
                          }
                        }}
                        className="w-full bg-[#050505] border border-white/10 px-2 py-1 text-xs rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                        placeholder="Objectives..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] uppercase tracking-wider text-white/30 font-bold font-mono block">Accent Color</label>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {[
                          { id: 'indigo', class: 'text-indigo-400', bg: 'bg-indigo-400' },
                          { id: 'blue', class: 'text-blue-500', bg: 'bg-blue-500' },
                          { id: 'emerald', class: 'text-emerald-500', bg: 'bg-emerald-500' },
                          { id: 'rose', class: 'text-rose-500', bg: 'bg-rose-500' },
                          { id: 'amber', class: 'text-amber-500', bg: 'bg-amber-500' },
                          { id: 'cyan', class: 'text-cyan-400', bg: 'bg-cyan-400' },
                          { id: 'voltage', class: 'text-[#daff33]', bg: 'bg-[#daff33]' },
                        ].map(color => {
                          const isSelected = inlineWorkspaceAccent === color.class;
                          return (
                            <button
                              key={color.id}
                              type="button"
                              onClick={() => setInlineWorkspaceAccent(color.class)}
                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isSelected ? 'ring-1 ring-white/60 scale-110' : 'opacity-65 hover:opacity-100'
                              }`}
                              title={color.id}
                            >
                              <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex space-x-1.5 pt-1 text-[9px] font-mono font-bold">
                      <button 
                        onClick={() => setIsEditingActiveWorkspaceInline(false)} 
                        className="flex-1 py-1 rounded bg-white/5 hover:bg-white/10 text-white/40 border border-white/5 cursor-pointer text-center"
                      >
                        CANCEL
                      </button>
                      <button 
                        onClick={() => {
                          if (!inlineWorkspaceName.trim()) return;
                          setWorkspaces(prev => prev.map(w => w.id === activeWorkspaceId ? {
                            ...w,
                            name: inlineWorkspaceName.trim(),
                            description: inlineWorkspaceDesc.trim(),
                            accentClass: inlineWorkspaceAccent,
                            code: `▲ ${inlineWorkspaceName.trim().substring(0, 5).toUpperCase()}`
                          } : w));
                          setIsEditingActiveWorkspaceInline(false);
                        }} 
                        className="flex-grow flex-1 py-1 rounded bg-[#daff33] hover:bg-[#c2ef00] text-black cursor-pointer text-center"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>
                ) : isAddingWs ? (
                  <div className="space-y-1.5 p-2.5 rounded-lg bg-white/5 border border-white/10 animate-fade-in">
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider font-mono">Build Workspace Specs</p>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={addWsInput}
                        onChange={(e) => setAddWsInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveAddWs();
                          if (e.key === 'Escape') setIsAddingWs(false);
                        }}
                        className="flex-grow bg-[#050505] border border-white/10 px-2 py-1 text-xs rounded text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium font-sans"
                        placeholder="e.g. Genesis Protocol"
                        autoFocus
                      />
                      <button onClick={handleSaveAddWs} className="p-1.5 rounded-lg bg-indigo-500/15 hover:bg-[#daff33]/20 hover:text-black hover:border-[#daff33]/30 text-indigo-400 border border-indigo-500/10 cursor-pointer">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setIsAddingWs(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 border border-white/5 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setIsWorkspaceDropdownOpen(prev => !prev)}
                      className="w-full py-2 px-3 flex items-center justify-between rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="truncate pl-0.5">{workspaces.find(w => w.id === activeWorkspaceId)?.name || 'Select Workspace'}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-white/40 shrink-0 ml-1.5 transition-transform duration-205" style={{ transform: isWorkspaceDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                    </button>

                    {isWorkspaceDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-45" 
                          onClick={() => setIsWorkspaceDropdownOpen(false)} 
                        />
                        <div className="absolute left-0 right-0 mt-2 p-1 bg-[#121214] border border-white/10 rounded-xl shadow-2xl z-50 animate-fade-in space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                          <div className="px-2.5 py-1.5 text-[9px] uppercase tracking-wider text-white/30 font-bold border-b border-white/5 mb-1.5 font-mono">
                            Active Workspace Space
                          </div>
                          {workspaces.map(ws => {
                            const isCurrent = ws.id === activeWorkspaceId;
                            const textAccentClass = ws.accentClass || 'text-indigo-400';
                            
                            return (
                              <div
                                key={ws.id}
                                className={`group/ws flex items-center justify-between p-1 rounded-lg transition-all ${
                                  isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                              >
                                <button
                                  onClick={() => {
                                    setActiveWorkspaceId(ws.id);
                                    setIsWorkspaceDropdownOpen(false);
                                  }}
                                  className="flex-grow text-left px-2 py-1.5 text-xs font-semibold flex flex-col space-y-0.5 cursor-pointer border-l-2 border-transparent"
                                  style={isCurrent ? { borderLeftColor: 'currentColor' } : {}}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${textAccentClass.replace('text-', 'bg-')}`} />
                                    <span className={`truncate ${isCurrent ? 'text-white' : 'text-zinc-300'}`}>{ws.name}</span>
                                  </div>
                                  <span className="text-[9px] text-zinc-500 font-normal truncate block leading-none pl-3.5">{ws.description || 'Custom active coordinates'}</span>
                                </button>
                                
                                <div className="flex items-center space-x-1 pr-1.5 opacity-0 group-hover/ws:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleOpenEditWorkspace(ws, e)}
                                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-[#daff33] transition-colors cursor-pointer"
                                    title="Edit workspace properties & theme"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteWorkspace(ws.id, e)}
                                    className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Delete workspace"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {/* Footer action buttons inner menu */}
                          <div className="border-t border-white/5 mt-1.5 pt-1.5 pb-1 flex items-center justify-between px-2 text-[9px] font-mono">
                            <button 
                              onClick={() => {
                                setAddWsInput('');
                                setIsAddingWs(true);
                                setIsWorkspaceDropdownOpen(false);
                              }}
                              className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer uppercase font-bold"
                            >
                              <Plus className="w-3 h-3 text-[#10B981]" /> Add Workspace
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentWs = workspaces.find(w => w.id === activeWorkspaceId);
                                if (currentWs) {
                                  setInlineWorkspaceName(currentWs.name);
                                  setInlineWorkspaceDesc(currentWs.description || '');
                                  setInlineWorkspaceAccent(currentWs.accentClass || 'text-indigo-400');
                                  setIsEditingActiveWorkspaceInline(true);
                                  setIsWorkspaceDropdownOpen(false);
                                }
                              }}
                              className="text-zinc-400 hover:text-[#10B981] flex items-center gap-1 cursor-pointer uppercase font-bold"
                            >
                              <Edit3 className="w-3 h-3 text-[#10B981]" /> Edit Active
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Hide/Collapse Panel Arrow Button Bar */}
          <div className="p-2 border-b border-white/5 flex items-center justify-center">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1.5 ${isSidebarCollapsed ? 'w-9' : 'w-36'} rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-[#10B981] border border-white/5 transition-all cursor-pointer flex items-center justify-center`}
              title={isSidebarCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-[#10B981]" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Module Navigation Menu */}
          <nav className={`p-4 flex-grow space-y-1 ${isSidebarCollapsed ? 'flex flex-col items-center px-1' : ''}`}>
            {!isSidebarCollapsed && (
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 px-3 py-2 block">Suite Routes</h2>
            )}
            
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-xl text-zinc-400 hover:text-white' : 'justify-between px-3 py-2 rounded-lg'} hover:bg-white/5 text-sm transition-all cursor-pointer ${activeMenu === 'dashboard' ? 'bg-white/5 text-white border border-white/10 shadow-sm' : 'border border-transparent text-white/55'}`}
              title="Home dashboard"
            >
              <span className="flex items-center space-x-3">
                <Compass className={`w-4 h-4 shrink-0 transition-colors ${activeMenu === 'dashboard' ? 'text-indigo-400' : 'text-zinc-400'}`} />
                {!isSidebarCollapsed && <span>Home dashboard</span>}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu('chat')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-xl text-zinc-400 hover:text-white' : 'justify-between px-3 py-2 rounded-lg'} hover:bg-white/5 text-sm transition-all cursor-pointer relative ${activeMenu === 'chat' ? 'bg-white/5 text-white border border-white/10 shadow-sm' : 'border border-transparent text-white/55'}`}
              title="Slack-Style Chat"
            >
              <span className="flex items-center space-x-3">
                <MessageSquare className={`w-4 h-4 shrink-0 transition-colors ${activeMenu === 'chat' ? 'text-purple-400' : 'text-zinc-400'}`} />
                {!isSidebarCollapsed && <span>Slack-Style Chat</span>}
              </span>
              {channels.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
                <span className={`text-[9px] font-bold bg-indigo-500 text-white rounded-full flex items-center justify-center min-w-[16px] h-4 leading-none ${isSidebarCollapsed ? 'absolute -top-1 -right-0 px-1 scale-75' : 'px-1 ml-2'}`}>
                  {channels.reduce((acc, c) => acc + c.unreadCount, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu('projects')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-xl text-zinc-400 hover:text-white' : 'justify-between px-3 py-2 rounded-lg'} hover:bg-white/5 text-sm transition-all cursor-pointer ${activeMenu === 'projects' ? 'bg-white/5 text-white border border-white/10 shadow-sm' : 'border border-transparent text-white/55'}`}
              title="Agile Kanban board"
            >
              <span className="flex items-center space-x-3">
                <Workflow className={`w-4 h-4 shrink-0 transition-colors ${activeMenu === 'projects' ? 'text-emerald-400' : 'text-zinc-400'}`} />
                {!isSidebarCollapsed && <span>Agile Kanban board</span>}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu('sprint_calendar')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-xl text-zinc-400 hover:text-white' : 'justify-between px-3 py-2 rounded-lg'} hover:bg-white/5 text-sm transition-all cursor-pointer ${activeMenu === 'sprint_calendar' ? 'bg-[#daff33]/5 text-white border border-[#daff33]/25 shadow-sm' : 'border border-transparent text-white/55'}`}
              title="Sprint Calendar"
            >
              <span className="flex items-center space-x-3">
                <Calendar className={`w-4 h-4 shrink-0 transition-colors ${activeMenu === 'sprint_calendar' ? 'text-indigo-450' : 'text-zinc-400'}`} />
                {!isSidebarCollapsed && <span>Sprint Calendar</span>}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu('wiki')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-xl text-zinc-400 hover:text-white' : 'justify-between px-3 py-2 rounded-lg'} hover:bg-white/5 text-sm transition-all cursor-pointer ${activeMenu === 'wiki' ? 'bg-white/5 text-white border border-white/10 shadow-sm' : 'border border-transparent text-white/55'}`}
              title="Doc boxes"
            >
              <span className="flex items-center space-x-3">
                <BookOpen className={`w-4 h-4 shrink-0 transition-colors ${activeMenu === 'wiki' ? 'text-amber-400' : 'text-zinc-400'}`} />
                {!isSidebarCollapsed && <span>Doc boxes</span>}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu('personal')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-xl text-zinc-400 hover:text-white' : 'justify-between px-3 py-2 rounded-lg'} hover:bg-white/5 text-sm transition-all cursor-pointer ${activeMenu === 'personal' ? 'bg-white/5 text-white border border-white/10 shadow-sm' : 'border border-transparent text-white/55'}`}
              title="Pomodoro Planners"
            >
              <span className="flex items-center space-x-3">
                <Clock className={`w-4 h-4 shrink-0 transition-colors ${activeMenu === 'personal' ? 'text-pink-400' : 'text-zinc-400'}`} />
                {!isSidebarCollapsed && <span>Pomodoro Planners</span>}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu('files')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-xl text-zinc-400 hover:text-white' : 'justify-between px-3 py-2 rounded-lg'} hover:bg-white/5 text-sm transition-all cursor-pointer ${activeMenu === 'files' ? 'bg-white/5 text-white border border-white/10 shadow-sm' : 'border border-transparent text-white/55'}`}
              title="Bytes Directories"
            >
              <span className="flex items-center space-x-3">
                <FileText className={`w-4 h-4 shrink-0 transition-colors ${activeMenu === 'files' ? 'text-blue-400' : 'text-zinc-400'}`} />
                {!isSidebarCollapsed && <span>Bytes Directories</span>}
              </span>
            </button>

            <button
              onClick={() => setActiveMenu('sync')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-xl text-zinc-400 hover:text-white' : 'justify-between px-3 py-2 rounded-lg'} hover:bg-white/5 text-sm transition-all cursor-pointer ${activeMenu === 'sync' ? 'bg-white/5 text-white border border-white/20' : 'border border-transparent text-white/55'}`}
              title="Settings"
            >
              <span className="flex items-center space-x-3">
                <Settings className={`w-4 h-4 shrink-0 transition-colors ${activeMenu === 'sync' ? 'text-zinc-300' : 'text-zinc-400'}`} />
                {!isSidebarCollapsed && <span>Settings</span>}
              </span>
              {!isSidebarCollapsed && (
                googleUser ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-2" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 ml-2" />
                )
              )}
            </button>

            {/* Trash Bin restoration trigger positioned below Settings */}
            <button
              onClick={() => setIsTrashBinOpen(true)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2 rounded-xl text-zinc-400 hover:text-white' : 'justify-between px-3 py-2 rounded-lg'} hover:bg-white/5 text-sm transition-all cursor-pointer border border-transparent text-white/55 hover:text-red-400`}
              title="Trash ledger & recover center"
            >
              <span className="flex items-center space-x-3">
                <Trash2 className="w-4 h-4 shrink-0 text-red-500" />
                {!isSidebarCollapsed && <span className="font-sans">Trash Bin</span>}
              </span>
              {trashBin.length > 0 && !isSidebarCollapsed && (
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-full font-mono font-bold leading-none">
                  {trashBin.length}
                </span>
              )}
              {trashBin.length > 0 && isSidebarCollapsed && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>

            {/* --- TACTICAL UTILITIES SECTOR --- */}
            <div className={`pt-2 ${isSidebarCollapsed ? 'border-t border-white/5 w-full my-2' : ''} relative`}>
              {!isSidebarCollapsed ? (
                <div className="px-1 mb-1.5">
                  <button
                    onClick={() => setIsTacticalDropdownOpen(!isTacticalDropdownOpen)}
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer ${
                      ['focus_session', 'sticky_notes', 'whiteboard', 'team_presence', 'project_health', 'habit_tracker', 'goal_radar', 'time_analytics', 'quick_dock', 'file_vault', 'personal_crm', 'knowledge_graph'].includes(activeMenu as string)
                        ? 'border-[#daff33]/20 bg-[#daff33]/5 text-[#daff33]'
                        : 'text-white'
                    }`}
                  >
                    <span className="flex items-center space-x-2 min-w-0">
                      <Sliders className="w-3.5 h-3.5 text-[#daff33] shrink-0" />
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] truncate">
                        {(() => {
                          const activeUtil = [
                            { id: 'focus_session', label: 'Focus Tracker' },
                            { id: 'sticky_notes', label: 'Sticky Notes' },
                            { id: 'whiteboard', label: 'Whiteboard' },
                            { id: 'team_presence', label: 'Presence Hub' },
                            { id: 'project_health', label: 'Health Engine' },
                            { id: 'habit_tracker', label: 'Routine Planner' },
                            { id: 'goal_radar', label: 'Goal Radar' },
                            { id: 'time_analytics', label: 'Time Analytics' },
                            { id: 'quick_dock', label: 'Utility Dock' },
                            { id: 'file_vault', label: 'File Vault' },
                            { id: 'personal_crm', label: 'Personal CRM' },
                            { id: 'knowledge_graph', label: 'Graph Network' }
                          ].find(item => item.id === activeMenu);
                          return activeUtil ? activeUtil.label : 'Tactical Utilities';
                        })()}
                      </span>
                    </span>
                    <ChevronDown 
                      className="w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200" 
                      style={{ transform: isTacticalDropdownOpen ? 'rotate(180deg)' : 'none' }} 
                    />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center mb-1">
                  <button
                    onClick={() => {
                      setIsTacticalDropdownOpen(true);
                      setIsSidebarCollapsed(false);
                    }}
                    type="button"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    title="Toggle Tactical Utilities Drawer"
                  >
                    <Sliders className="w-4 h-4 text-[#daff33]" />
                  </button>
                </div>
              )}

              {/* Collapsible Shelf Dropdown container */}
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isTacticalDropdownOpen && !isSidebarCollapsed ? 'max-h-[380px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="p-1 px-1.5 bg-[#08080a]/90 backdrop-blur-md border border-white/5 rounded-xl space-y-0.5 max-h-[280px] overflow-y-auto custom-scrollbar shadow-inner">
                  {[
                    { id: 'focus_session', label: 'Focus Tracker', icon: Clock, color: 'text-pink-400' },
                    { id: 'sticky_notes', label: 'Sticky Notes Grid', icon: FileText, color: 'text-amber-400' },
                    { id: 'whiteboard', label: 'Whiteboard Canvas', icon: Workflow, color: 'text-emerald-400' },
                    { id: 'team_presence', label: 'Presence Hub', icon: Users, color: 'text-purple-400' },
                    { id: 'project_health', label: 'Project Health Engine', icon: Activity, color: 'text-indigo-400' },
                    { id: 'habit_tracker', label: 'Routine Planner', icon: CheckSquare, color: 'text-emerald-300' },
                    { id: 'goal_radar', label: 'Goal Radar Target', icon: Compass, color: 'text-teal-400' },
                    { id: 'time_analytics', label: 'Time Analytics Node', icon: Clock, color: 'text-sky-300' },
                    { id: 'quick_dock', label: 'Quick Utility Dock', icon: Terminal, color: 'text-orange-400' },
                    { id: 'file_vault', label: 'Encrypted File Vault', icon: Paperclip, color: 'text-blue-400' },
                    { id: 'personal_crm', label: 'Personal CRM Portal', icon: Users, color: 'text-sky-400' },
                    { id: 'knowledge_graph', label: 'Obsidian Graph Network', icon: Workflow, color: 'text-violet-400' }
                  ].map(item => {
                    const IconComp = item.icon;
                    const isActive = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveMenu(item.id as any);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-white/5 text-[11px] transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[#daff33]/10 text-white border border-[#daff33]/25 font-bold shadow-sm' 
                            : 'border border-transparent text-[#8a8a93] hover:text-white'
                        }`}
                        title={item.label}
                      >
                        <span className="flex items-center space-x-2.5 truncate">
                          <IconComp className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? item.color : 'text-zinc-550 group-hover:text-white'}`} style={{ color: isActive ? undefined : 'var(--color-zinc-500)' }} />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#daff33]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>


          </nav>

          {isEditingAccount ? (
            <div className="p-4 border-t border-white/5 bg-white/[0.02] space-y-2 text-left animate-fade-in">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#daff33]">Edit Local Profile</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingAccount(false); }}
                  className="text-[9px] text-[#daff33] hover:text-white px-1.5 py-0.5 rounded bg-white/5 font-mono cursor-pointer"
                >
                  SAVE
                </button>
              </div>
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Custom Display Name"
                  value={profileName || (googleUser ? googleUser.name : currentActiveUser.name)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfileName(val);
                    localStorage.setItem('custom_profile_name', val);
                  }}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500 font-sans"
                />
                <input
                  type="text"
                  placeholder="Profile Image URL (https/...)"
                  value={profilePicUrl}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfilePicUrl(val);
                    localStorage.setItem('custom_profile_pic_url', val);
                  }}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[10px] text-white/80 focus:outline-none focus:border-indigo-500 font-mono"
                />
                {profilePicUrl && (
                  <p className="text-[8px] text-white/30 font-mono italic">Custom image override is active</p>
                )}
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingAccount(true)}
              className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between shrink-0 cursor-pointer hover:bg-white/[0.03] transition-colors overflow-hidden animate-fade-in group"
              title="Click to customize name & avatar picture"
            >
              <div className="flex items-center space-x-2 overflow-hidden w-full max-w-[85%]">
                {profilePicUrl ? (
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#daff33]/30 flex items-center justify-center shrink-0 shadow-sm shadow-[#daff33]/15">
                    <img src={profilePicUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-lg" alt="Avatar override" />
                  </div>
                ) : googleUser ? (
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#daff33]/20 flex items-center justify-center bg-white/5 shrink-0">
                    <img src={googleUser.picture} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-lg" alt="Avatar" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-[10px] shrink-0 font-mono transition-all duration-300" style={{ backgroundColor: currentActiveUser.color + '20', borderColor: currentActiveUser.color, color: currentActiveUser.color }}>
                    {profileName ? profileName.slice(0, 2).toUpperCase() : currentActiveUser.initials}
                  </div>
                )}
                <div className="truncate flex-grow text-left">
                  <p className="font-semibold text-[11px] text-white truncate flex items-center gap-1.5 leading-none">
                    <span>{profileName || (googleUser ? googleUser.name : currentActiveUser.name)}</span>
                    <Edit3 className="w-2.5 h-2.5 text-white/0 group-hover:text-white/50 transition-colors" />
                  </p>
                  <p className="text-[9px] text-white/40 truncate mt-0.5">{googleUser ? googleUser.email : currentActiveUser.role}</p>
                </div>
              </div>
              <Users className="w-4 h-4 text-white/40 group-hover:text-[#daff33] shrink-0 transition-colors" />
            </div>
          )}
        </aside>

        {/* --- COLUMN 2: PRIMARY MODULAR PORT CONTROLLER --- */}
        <main className="flex-grow p-5 md:p-6 lg:p-7 overflow-y-auto max-w-full">
          
          {/* --- MODULE A: UNIFIED OVERVIEW DASHBOARD --- */}
          {activeMenu === 'dashboard' && (
            <MissionControlDashboard
              tasks={tasks}
              docs={docs}
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={(id) => setActiveWorkspaceId(id)}
              createTask={(status) => handleCreateTask(status)}
              theme={currentTheme}
              accentColor={
                currentTheme.id === 'emerald' ? '#34d399' :
                currentTheme.id === 'light-copper' ? '#daff33' :
                currentTheme.id === 'crimson' ? '#e11d48' :
                currentTheme.id === 'cosmic' ? '#8b5cf6' :
                currentTheme.id === 'aurora' ? '#06b6d4' :
                currentTheme.id === 'bronze' ? '#f59e0b' :
                currentTheme.id === 'sunset-amber' ? '#f97316' :
                currentTheme.id === 'deep-orchid' ? '#db2777' :
                '#6366f1'
              }
              onChangeMenu={(menu) => setActiveMenu(menu)}
              addNotification={(title, body, type) => useAppStore.getState().addNotification(title, body, type || 'info')}
              onEditTask={(task) => setEditingTask(task)}
            />
          )}
          {activeMenu === 'legacy-never-rendered' && (
            <div className="space-y-6">
              
              {/* Clean Offline Project Blueprint Schema Builder (Zero AI/Stars, 100% Client-Side Local Compiler) */}
              <section className="p-5 rounded-xl border border-white/5 bg-zinc-950/45 backdrop-blur space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:space-x-4 space-y-2 md:space-y-0 text-left">
                  <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/25 self-start">
                    <Layers className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex-grow space-y-1">
                    <h2 className="text-sm font-semibold tracking-wide flex items-center space-x-2 text-white">
                      <span>Offline Workspace Blueprint Builder</span>
                    </h2>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-2xl">
                      Assemble localized Kanban tasks, Notion wikis, and offline kickoff streams safely on this client session without external database dependencies or API key disclosure.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleIntelligentWorkspaceCreate} className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1 text-left">
                  <div className="md:col-span-4">
                    <label className="block text-[9px] font-bold text-zinc-500 mb-1 uppercase font-mono">1. Blueprint Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Neon Horizon Logistics System"
                      value={aiPromptTitle}
                      onChange={(e) => setAiPromptTitle(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border bg-black/45 focus:outline-none focus:ring-1 focus:ring-teal-500 border-zinc-800 text-white"
                      required
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[9px] font-bold text-[#a1a1aa] mb-1 uppercase font-mono">2. Blueprint Schema</label>
                    <select
                      value={selectedBlueprintTemplate}
                      onChange={(e) => setSelectedBlueprintTemplate(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-xl border bg-[#0d0d0f] hover:bg-[#141418] focus:outline-none focus:ring-1 focus:ring-teal-500 border-white/10 hover:border-white/20 text-white font-sans transition-all cursor-pointer shadow-lg outline-none"
                    >
                      <option value="engineering" className="bg-[#0c0c0e] text-[#eeeeee]">💻 Software Engineering Agile</option>
                      <option value="marketing" className="bg-[#0c0c0e] text-[#eeeeee]">📈 Product Launch Campaign</option>
                      <option value="habits" className="bg-[#0c0c0e] text-[#eeeeee]">🥗 Personal Habits & Growth</option>
                      <option value="product-design" className="bg-[#0c0c0e] text-[#eeeeee]">🎨 Product Interface Research & Prototype UI</option>
                      <option value="security-audit" className="bg-[#0c0c0e] text-[#eeeeee]">🔒 Sovereign Security & Cryptographic Audit</option>
                      <option value="personal-journal" className="bg-[#0c0c0e] text-[#eeeeee]">✍️ Personal Daily Epiphanies & Logbook</option>
                    </select>
                  </div>
                  <div className="md:col-span-4 flex items-end">
                    <button
                      type="submit"
                      disabled={isAiGenerating}
                      className="w-full h-9 px-4 bg-[#daff33] hover:bg-[#c3e52b] text-black rounded-xl text-xs font-mono font-extrabold transition-all flex items-center justify-center space-x-1.5 focus:outline-none shadow cursor-pointer uppercase"
                    >
                      {isAiGenerating ? (
                        <>
                          <span className="animate-spin w-3 h-3 border-2 border-black border-t-transparent rounded-full" />
                          <span>COMPILING LOGS...</span>
                        </>
                      ) : (
                        <>
                          <FolderPlus className="w-4 h-4 text-black" />
                          <span>BUILD WORKSPACE</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              {/* Modern Segmented Navigation Tabs for Overview Page */}
              <div className="flex border-b border-white/5 pb-2 justify-between items-center">
                <div className="flex space-x-1 p-0.5 bg-black/40 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setOverviewTab('blueprint')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 cursor-pointer ${
                      overviewTab === 'blueprint'
                        ? 'bg-zinc-800 text-[#eeeeee] border border-white/10'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>🎯 Workspace Builder & Metrics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverviewTab('offline_tasks')}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 cursor-pointer ${
                      overviewTab === 'offline_tasks'
                        ? 'bg-zinc-800 text-[#eeeeee] border border-white/10'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>📋 Offline Task Overview</span>
                  </button>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest hidden md:block">
                  Sovereign User Sandbox Mode
                </div>
              </div>

              {overviewTab === 'offline_tasks' ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Search and filtered query selectors */}
                  <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/45 flex flex-col sm:flex-row gap-3 items-center justify-between text-left">
                    <div className="flex items-center space-x-2 w-full sm:w-auto bg-black/35 px-3 py-1.5 rounded-lg border border-white/5">
                      <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search offline tasks..."
                        value={taskOverviewSearch}
                        onChange={(e) => setTaskOverviewSearch(e.target.value)}
                        className="bg-transparent text-xs text-white placeholder-zinc-650 focus:outline-none w-48 border-0 focus:ring-0 p-0 font-sans"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <div>
                        <select
                          value={taskOverviewStatusFilter}
                          onChange={(e) => setTaskOverviewStatusFilter(e.target.value)}
                          className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-zinc-300 focus:outline-none cursor-pointer hover:border-white/20"
                        >
                          <option value="all" className="bg-[#0c0c0e]">ALL STATUSES</option>
                          <option value="Backlog" className="bg-[#0c0c0e]">BACKLOG</option>
                          <option value="Todo" className="bg-[#0c0c0e]">TODO</option>
                          <option value="InProgress" className="bg-[#0c0c0e]">IN PROGRESS</option>
                          <option value="Done" className="bg-[#0c0c0e]">DONE</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={taskOverviewPriorityFilter}
                          onChange={(e) => setTaskOverviewPriorityFilter(e.target.value)}
                          className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono text-zinc-300 focus:outline-none cursor-pointer hover:border-white/20"
                        >
                          <option value="all" className="bg-[#0c0c0e]">ALL PRIORITIES</option>
                          <option value="High" className="bg-[#0c0c0e]">HIGH Priority</option>
                          <option value="Medium" className="bg-[#0c0c0e]">MEDIUM Priority</option>
                          <option value="Low" className="bg-[#0c0c0e]">LOW Priority</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          setTaskOverviewSearch('');
                          setTaskOverviewStatusFilter('all');
                          setTaskOverviewPriorityFilter('all');
                        }}
                        className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 text-[10px] font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        RESET
                      </button>
                    </div>
                  </div>

                  {/* Tasks list display */}
                  <div className="p-5 rounded-xl border border-white/5 bg-zinc-950/45 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Filtered Tasks ({
                        tasks.filter(t => {
                          const matchesSearch = t.title.toLowerCase().includes(taskOverviewSearch.toLowerCase()) || t.description.toLowerCase().includes(taskOverviewSearch.toLowerCase());
                          const matchesStatus = taskOverviewStatusFilter === 'all' || t.status === taskOverviewStatusFilter;
                          const matchesPriority = taskOverviewPriorityFilter === 'all' || t.priority === taskOverviewPriorityFilter;
                          return matchesSearch && matchesStatus && matchesPriority;
                        }).length
                      })</h3>
                      <button
                        onClick={() => setActiveMenu('projects')}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline font-mono cursor-pointer transition-colors"
                      >
                        Launch Interactive Kanban Board →
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar">
                      {tasks.filter(t => {
                        const matchesSearch = t.title.toLowerCase().includes(taskOverviewSearch.toLowerCase()) || t.description.toLowerCase().includes(taskOverviewSearch.toLowerCase());
                        const matchesStatus = taskOverviewStatusFilter === 'all' || t.status === taskOverviewStatusFilter;
                        const matchesPriority = taskOverviewPriorityFilter === 'all' || t.priority === taskOverviewPriorityFilter;
                        return matchesSearch && matchesStatus && matchesPriority;
                      }).length === 0 ? (
                        <p className="text-zinc-500 italic p-6 text-center text-xs">No offline tasks match your criteria query.</p>
                      ) : (
                        tasks.filter(t => {
                          const matchesSearch = t.title.toLowerCase().includes(taskOverviewSearch.toLowerCase()) || t.description.toLowerCase().includes(taskOverviewSearch.toLowerCase());
                          const matchesStatus = taskOverviewStatusFilter === 'all' || t.status === taskOverviewStatusFilter;
                          const matchesPriority = taskOverviewPriorityFilter === 'all' || t.priority === taskOverviewPriorityFilter;
                          return matchesSearch && matchesStatus && matchesPriority;
                        }).map(t => (
                          <div
                            key={t.id}
                            className="p-3 bg-[#0d0d0f] hover:bg-[#141418] border border-white/5 hover:border-white/10 rounded-xl flex items-start justify-between gap-4 transition-all"
                          >
                            <div className="flex items-start space-x-3 text-left">
                              <input
                                type="checkbox"
                                checked={t.status === 'Done'}
                                onChange={() => {
                                  const nextStatus = t.status === 'Done' ? 'Todo' : 'Done';
                                  setTasks(prev => prev.map(item => item.id === t.id ? { ...item, status: nextStatus } : item));
                                  if (nextStatus === 'Done') boostPulse(15);
                                }}
                                className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 cursor-pointer"
                              />
                              <div className="space-y-1">
                                <h4 className={`text-xs font-semibold ${t.status === 'Done' ? 'line-through text-zinc-500' : 'text-white'}`}>
                                  {t.title}
                                </h4>
                                <p className="text-[11px] text-zinc-400 max-w-xl">
                                  {t.description || 'No description provided.'}
                                </p>
                                <div className="flex items-center space-x-2 pt-1">
                                  {t.dueDate && <span className="text-[9px] font-mono text-zinc-500">📅 {t.dueDate}</span>}
                                  <span className="text-[9px] text-zinc-550">•</span>
                                  <span className="text-[9px] font-mono text-zinc-500 uppercase">🏷️ {t.label || 'Task'}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                                t.status === 'Done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                t.status === 'InProgress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                t.status === 'Todo' ? 'bg-amber-500/10 border-amber-500/20 text-yellow-400' :
                                'bg-zinc-800 border-zinc-700 text-zinc-400'
                              }`}>{t.status === 'InProgress' ? 'In Progress' : t.status}</span>
                              <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                                t.priority === 'High' ? 'bg-red-500/10 border-red-500/25 text-red-400' :
                                t.priority === 'Medium' ? 'font-medium bg-amber-500/10 border-yellow-500/25 text-yellow-400' :
                                'bg-zinc-800 border-zinc-750 text-zinc-500'
                              }`}>{t.priority}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Progress Summary Cards widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className={`p-4 rounded-xl border ${currentTheme.cardClass} flex flex-col justify-between`}>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-zinc-500 flex items-center justify-between">
                          <span>Project completion index ratio</span>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </p>
                        <p className="text-2xl font-bold font-mono mt-1 text-emerald-400">
                          {totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0.0'}%
                        </p>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mt-3 pt-2 text-[10px]">
                          <span className="text-zinc-500">Relative to workspace benchmark</span>
                          <button
                            onClick={() => setShowVelocityChecklist(!showVelocityChecklist)}
                            className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded cursor-pointer transition-colors"
                          >
                            {showVelocityChecklist ? 'HIDE WORK' : 'MANAGE TASKS'}
                          </button>
                        </div>

                        {showVelocityChecklist && (
                          <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar animate-fade-in text-[11px]">
                            {tasks.length === 0 ? (
                              <p className="text-[9px] text-zinc-550 font-mono italic">No items drafted in pipeline</p>
                            ) : (
                              tasks.map(t => (
                                <div key={t.id} className="flex items-center justify-between hover:bg-white/[0.02] p-1 rounded transition-colors group">
                                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={t.status === 'Done'}
                                      onChange={() => {
                                        const nextStatus = t.status === 'Done' ? 'Todo' : 'Done';
                                        setTasks(prev => prev.map(item => item.id === t.id ? { ...item, status: nextStatus } : item));
                                        if (nextStatus === 'Done') boostPulse(15);
                                      }}
                                      className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0 cursor-pointer"
                                    />
                                    <span className={`truncate max-w-[130px] font-medium ${t.status === 'Done' ? 'line-through text-zinc-500' : 'text-white/80'}`}>
                                      {t.title}
                                    </span>
                                  </label>
                                  <span className={`text-[8px] font-mono px-1 py-0.2 rounded border ${t.status === 'Done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-805/40 border-zinc-800 text-zinc-400'}`}>{t.status}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${currentTheme.cardClass} flex flex-col justify-between`}>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-zinc-500 flex items-center justify-between">
                          <span>Sprint Issue Tracker</span>
                          <Activity className="w-4 h-4 text-blue-400" />
                        </p>
                        <p className="text-2xl font-bold font-mono mt-1 text-blue-400">
                          {completedTasks} / {totalTasks} Completed
                        </p>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mt-3 pt-2 text-[10px]">
                          <span className="text-zinc-500">{inProgressCount} tasks actively active</span>
                          <button
                            onClick={() => setShowSprintChecklist(!showSprintChecklist)}
                            className="text-[9px] font-mono text-blue-400 hover:text-blue-300 font-bold px-1.5 py-0.5 bg-blue-500/10 rounded cursor-pointer transition-colors"
                          >
                            {showSprintChecklist ? 'HIDE LIST' : 'QUICK COMPLETE'}
                          </button>
                        </div>

                        {showSprintChecklist && (
                          <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar animate-fade-in text-[11px]">
                            {tasks.filter(t => t.status !== 'Done').length === 0 ? (
                              <div className="py-2 text-center">
                                <p className="text-[9.5px] text-[#daff33] font-bold font-mono">ALL TASKS DEPLOYED 🚀</p>
                                <p className="text-[8px] text-zinc-500 uppercase tracking-widest leading-none mt-1">Sprint completely completed</p>
                              </div>
                            ) : (
                              tasks.filter(t => t.status !== 'Done').map(t => (
                                <div key={t.id} className="flex items-center justify-between hover:bg-white/[0.02] p-1 rounded transition-colors">
                                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={false}
                                      onChange={() => {
                                        setTasks(prev => prev.map(item => item.id === t.id ? { ...item, status: 'Done' } : item));
                                        boostPulse(20);
                                      }}
                                      className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-0 cursor-pointer"
                                    />
                                    <span className="truncate max-w-[130px] font-medium text-white/80">
                                      {t.title}
                                    </span>
                                  </label>
                                  <span className={`text-[8px] font-mono px-1 py-0.2 rounded border ${t.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-yellow-400'}`}>{t.priority}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${currentTheme.cardClass} flex flex-col justify-between`}>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-zinc-500 flex items-center justify-between">
                          <span>Maximum Habit Streak</span>
                          <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
                        </p>
                        <p className="text-2xl font-bold font-mono mt-1 text-orange-400">
                          {highestHabitStreak} Days
                        </p>
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => setActiveMenu('personal')}
                            className="flex-grow py-1 px-3 bg-orange-750/20 hover:bg-orange-700/40 text-orange-400 rounded text-[10px] font-semibold border border-orange-500/20 cursor-pointer"
                          >
                            Update Focus & Habits
                          </button>
                          <button
                            onClick={resetPomodoro}
                            className="p-1 border border-zinc-750 rounded text-zinc-400 hover:text-zinc-300 cursor-pointer"
                            title="Reset Pomodoro Timer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Two Panel Dashboard details: High priority Kanban & Metrics Graph */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* Interactive Sprint Metric Allocation Widget */}
                    <div className={`p-5 rounded-xl border ${currentTheme.cardClass}`}>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wider">Workspace pipeline volume allocation</h3>
                        <span className="text-[8px] font-mono tracking-widest text-[#daff33] bg-[#daff33]/10 px-1.5 py-0.5 rounded font-bold">CLICK COLUMNS TO SPOTLIGHT</span>
                      </div>
                      <div className="h-44 w-full flex items-end justify-between relative pt-6 px-4">
                        
                        {/* SVG Guidelines */}
                        <div className="absolute inset-x-0 top-1/4 border-t border-zinc-800/40 pointer-events-none"></div>
                        <div className="absolute inset-x-0 top-2/4 border-t border-zinc-800/40 pointer-events-none"></div>
                        <div className="absolute inset-x-0 top-3/2 border-t border-zinc-800/40 pointer-events-none"></div>
     
                        {/* Quick dynamic bar graphs for pipeline columns */}
                        {(['Backlog', 'Todo', 'InProgress', 'Done'] as const).map((col) => {
                          const count = tasks.filter(t => t.status === col).length;
                          const maxCount = Math.max(...['Backlog', 'Todo', 'InProgress', 'Done'].map(c => tasks.filter(t => t.status === c).length), 1);
                          const percent = (count / maxCount) * 100;
                          return (
                            <div 
                              key={col} 
                              onClick={() => {
                                setStatusSpotlight(col);
                                setActiveMenu('projects');
                              }}
                              className="flex-grow flex flex-col items-center justify-end h-full z-10 group relative cursor-pointer"
                              title={`Click to filter Kanban by ${col}`}
                            >
                              <div className="absolute bottom-full mb-1 bg-zinc-950 text-[9px] font-mono border border-zinc-800 text-white rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                {count} {count === 1 ? 'task' : 'tasks'}
                              </div>
                              <div className="w-10 rounded-t overflow-hidden relative bg-zinc-850/50 hover:bg-[#daff33]/15 border border-zinc-800 hover:border-[#daff33]/40 transition-all flex flex-col justify-end shadow-inner hover:shadow-lg" style={{ height: `${percent || 15}%`, minHeight: '16px' }}>
                                <div className="bg-gradient-to-t from-indigo-600/85 to-[#818cf8] flex items-center justify-center font-bold font-mono text-[9px] text-white" style={{ height: `${percent}%` }}>
                                  {count > 0 && <span>{count}</span>}
                                </div>
                              </div>
                              <span className="text-[9px] font-mono tracking-wider text-zinc-400 mt-2 hover:text-[#daff33] transition-colors">{col === 'InProgress' ? 'In Progress' : col}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dynamic Pipeline Injector Controls */}
                      <div className="mt-4 pt-3.5 border-t border-white/5">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1aa] font-mono mb-2">Sprint Pipeline Controller Injector</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pipelineInput}
                            onChange={(e) => setPipelineInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handlePipelineInject();
                            }}
                            className="flex-grow bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans transition-all"
                            placeholder="Type standard or deep tech sprint node to inject..."
                          />
                          <select
                            value={pipelineTargetCol}
                            onChange={(e) => setPipelineTargetCol(e.target.value as any)}
                            className="bg-zinc-950 border border-zinc-800 rounded-xl px-2 text-[10px] text-zinc-300 font-mono focus:outline-none cursor-pointer"
                          >
                            <option value="Backlog" className="bg-[#0c0c0e]">Backlog</option>
                            <option value="Todo" className="bg-[#0c0c0e]">Todo</option>
                            <option value="InProgress" className="bg-[#0c0c0e]">In Progress</option>
                            <option value="Done" className="bg-[#0c0c0e]">Done</option>
                          </select>
                          <button
                            onClick={handlePipelineInject}
                            className="px-3.5 bg-indigo-950/20 hover:bg-indigo-900/40 text-indigo-400 hover:text-white border border-indigo-900/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 select-none shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Inject</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Priority items list list widget */}
                    <div className={`p-5 rounded-xl border ${currentTheme.cardClass} flex flex-col`}>
                      <div className="flex items-center justify-between mb-3 border-b border-zinc-800/30 pb-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider">Unfinished High Priority coordination Tasks</h3>
                        <button onClick={() => setActiveMenu('projects')} className="text-[10px] text-[#818cf8] hover:underline cursor-pointer">View Kanban</button>
                      </div>
                      <div className="space-y-2 flex-grow overflow-y-auto max-h-44">
                        {highPriorityTasks.length === 0 ? (
                          <div className="text-zinc-500 h-full flex flex-col items-center justify-center text-center text-xs space-y-1 pt-6">
                            <Check className="w-5 h-5 text-emerald-400" />
                            <p>Perfect coordinates! Zero High priority Backlogs.</p>
                          </div>
                        ) : (
                          highPriorityTasks.map(t => (
                            <div
                              key={t.id}
                              onClick={() => setEditingTask(t)}
                              className="p-2.5 rounded bg-zinc-900/30 border border-zinc-800 flex items-center justify-between hover:bg-zinc-800/20 cursor-pointer transition-all"
                            >
                              <div className="space-y-1">
                                <p className="font-semibold text-xs leading-tight">{t.title}</p>
                                <p className="text-[9px] text-[#a1a1aa]">{t.description?.substring(0, 75)}...</p>
                              </div>
                              <span className="text-[9px] bg-red-600/10 text-red-400 border border-red-500/10 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                {t.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Clean Personal Workspace System Online indicator footer row */}
                  <div className={`p-4 rounded-xl border ${currentTheme.cardClass} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left`}>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Sovereign Offline Workspace Safe State</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Perfect sandbox encryption. Zero database sync leaks or network telemetry trackers active.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveMenu('projects');
                      }}
                      className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700/85 text-zinc-200 border border-white/5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer"
                    >
                      Verify Kanban
                    </button>
                  </div>
                </>
              )}

            </div>
          )}

          {/* --- MODULE B: SLACK-STYLE TEAM CHAT COLLABORATION --- */}
          {activeMenu === 'chat' && (
            <TeammateChat
              channels={channels}
              activeChannelId={activeChannelId}
              onSelectChannelId={(id) => {
                setActiveChannelId(id);
                // Reset unread count for selected channel
                setChannels(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
              }}
              messages={messages}
              onSendMessage={(txt) => handleSendMessage(txt)}
              onAddReaction={handleAddReaction}
              onTogglePinMessage={(msgId) => {
                setMessages(prev => {
                  const currentChMessages = prev[activeChannelId] || [];
                  const updatedMessages = currentChMessages.map(m => {
                    if (m.id === msgId) {
                      return { ...m, pinned: !(m as any).pinned } as any;
                    }
                    return m;
                  });
                  return { ...prev, [activeChannelId]: updatedMessages };
                });
              }}
              onCreateChannel={(name, cat) => {
                const newCh: Channel = {
                  id: `ch-dyn-${Date.now()}`,
                  name: name.trim().toLowerCase().replace(/\s+/g, '-'),
                  category: cat,
                  unreadCount: 0
                };
                setChannels(prev => [...prev, newCh]);
                setActiveChannelId(newCh.id);
              }}
              theme={currentTheme}
            />
          )}

          {/* --- MODULE C: LINEAR-STYLE KANBAN PROJECT MANAGER --- */}
          {activeMenu === 'projects' && (
            <KanbanBoard
              tasks={tasks}
              onEditTask={(t) => setEditingTask(t)}
              onCreateTask={handleCreateTask}
              onSetTaskStatus={(taskId, status) => {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
                if (status === 'Done') {
                  boostPulse(15);
                }
              }}
              onRestoreTask={(taskId) => {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, archived: false } : t));
              }}
              onReorderTasks={(newTasks) => {
                setTasks(newTasks);
                useAppStore.getState().reorderTasks(newTasks);
              }}
              theme={currentTheme}
              statusSpotlight={statusSpotlight}
              onSetStatusSpotlight={setStatusSpotlight}
            />
          )}

          {/* --- MODULE D: NOTION-STYLE WIKI DOCUMENTATION --- */}
          {activeMenu === 'sprint_calendar' && (
            <SprintCalendar
              tasks={tasks}
              onTasksChange={(updatedTasks) => setTasks(updatedTasks)}
              onEditTask={(t) => setEditingTask(t)}
              theme={currentTheme}
              accentColor={
                currentTheme.id === 'emerald' ? '#34d399' :
                currentTheme.id === 'light-copper' ? '#daff33' :
                currentTheme.id === 'crimson' ? '#e11d48' :
                currentTheme.id === 'cosmic' ? '#8b5cf6' :
                currentTheme.id === 'aurora' ? '#06b6d4' :
                currentTheme.id === 'bronze' ? '#f59e0b' :
                currentTheme.id === 'sunset-amber' ? '#f97316' :
                currentTheme.id === 'deep-orchid' ? '#db2777' :
                '#6366f1'
              }
            />
          )}

          {activeMenu === 'wiki' && (
            <WikiSystem
              docs={docs}
              activeDocId={activeDocId}
              onSetActiveDocId={(id) => {
                setActiveDocId(id);
                setIsWikiEditing(false);
              }}
              onSaveDoc={(updatedDoc) => {
                setDocs(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
              }}
              onCreateDoc={handleCreateWikiDoc}
              onAiEditWikiDoc={handleAiEditWikiDoc}
              theme={currentTheme}
            />
          )}

          {/* --- MODULE E: PERSONAL PRODUCTIVITY SPRINT TIMERS --- */}
          {activeMenu === 'personal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Synthesized focused countdown block */}
              <div className={`p-6 rounded-xl border ${currentTheme.cardClass} flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden`}>
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-[#10B981] to-[#daff33]" />
                
                <div className="space-y-1">
                  <h3 className="text-xs font-mono uppercase tracking-widest font-black text-[#f4f4f5]">Pomodoro Attention Synth</h3>
                  <p className="text-[10px] text-zinc-400">Offline acoustic waves tuned for deep alpha concentration</p>
                </div>

                {/* Modern Presets Selector */}
                <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 w-full max-w-sm">
                  {[
                    { label: '25m Focus', value: 1500 },
                    { label: '50m Deep', value: 3000 },
                    { label: '10m Break', value: 600 }
                  ].map(preset => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setPomoActive(false);
                        setPomoMaxTime(preset.value);
                        setPomoTime(preset.value);
                      }}
                      className={`py-1.5 text-[9px] font-mono font-bold transition-all rounded-lg uppercase cursor-pointer ${
                        pomoMaxTime === preset.value 
                          ? 'bg-[#10B981] text-black font-extrabold shadow-md shadow-emerald-500/10' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                
                {/* Visual pulse ring surrounding timer - SVG custom progress ring */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* Subtle outer continuous glow that adapts to state */}
                  <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-1000 ${pomoActive ? 'bg-[#10B981]/20 scale-110' : 'bg-transparent scale-100'}`} />
                  
                  {/* Progress Ring SVG */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 176 176">
                    {/* Track */}
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke="rgba(255, 255, 255, 0.02)"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    {/* Progress Indicator */}
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke={pomoActive ? "url(#emeraldGradient)" : "rgba(255, 255, 255, 0.1)"}
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 76}
                      strokeDashoffset={(2 * Math.PI * 76) * (1 - pomoTime / pomoMaxTime)}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    
                    {/* Gradients definition */}
                    <defs>
                      <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Inside metrics display */}
                  <div className="w-36 h-36 rounded-full bg-zinc-950/95 border border-white/5 flex flex-col items-center justify-center select-none shadow-[2px_10px_30px_rgba(0,0,0,0.85)] z-10 transition-colors duration-500">
                    <span className="font-mono text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      {Math.floor(pomoTime / 60)}:{(pomoTime % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] text-[#10B981] font-mono mt-1 tracking-widest font-black uppercase flex items-center space-x-1">
                      <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${pomoActive ? 'animate-ping' : ''}`} />
                      <span>{pomoActive ? 'AURA ACTIVE' : 'SUSPENDED'}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 w-full max-w-sm">
                  {/* Synthesis Audio parameters settings switcher */}
                  <div className="grid grid-cols-2 gap-2 text-xs w-full">
                    <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col justify-between text-left space-y-1">
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase font-black">LAPS COMPLETED</span>
                      <span className="text-base font-extrabold text-[#10B981] font-mono">{pomoLapsCount} intervals</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex flex-col justify-between text-left space-y-1">
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase font-black">Acoustic Synth</span>
                      <button
                        onClick={() => setPomoSoundOn(prev => !prev)}
                        className={`w-full py-1 text-[9px] font-mono font-bold rounded border transition-all uppercase cursor-pointer ${
                          pomoSoundOn 
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                            : 'bg-white/5 text-zinc-500 border-white/10'
                        }`}
                      >
                        {pomoSoundOn ? '🔊 Synth On' : '🔇 Muted'}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-2 w-full">
                    <button
                      onClick={togglePomodoro}
                      className={`flex-grow py-2.5 rounded-xl text-xs font-mono font-extrabold tracking-wider transition-all cursor-pointer border ${
                        pomoActive 
                          ? 'bg-black/40 border-emerald-500/30 text-[#10B981] hover:bg-emerald-500/5' 
                          : 'bg-[#10B981] text-black hover:bg-emerald-400 border-0 shadow-lg shadow-emerald-500/10'
                      }`}
                    >
                      {pomoActive ? 'SUSPEND FOCUS' : 'ENGAGE SPRINT'}
                    </button>
                    <button
                      onClick={resetPomodoro}
                      className="px-4.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-xl text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Reset focus"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Habit trackers list list widget */}
              <div className={`p-5 rounded-xl border ${currentTheme.cardClass} space-y-4`}>
                <h3 className="text-xs uppercase font-semibold">Habit loops coordinator</h3>
                
                <div className="space-y-2">
                  {habits.map(h => (
                    <div
                      key={h.id}
                      onClick={() => {
                        setHabits(prev => prev.map(it => {
                          if (it.id === h.id) {
                            const nextCompleted = !it.completedToday;
                            if (nextCompleted) {
                              boostPulse(12);
                            }
                            return {
                              ...it,
                              completedToday: nextCompleted,
                              streak: it.completedToday ? Math.max(0, it.streak - 1) : it.streak + 1
                            };
                          }
                          return it;
                        }));
                      }}
                      className="p-3 rounded bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-800/40 cursor-pointer flex items-center justify-between text-xs font-semibold"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded border ${h.completedToday ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-zinc-700 text-transparent'} flex items-center justify-center`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className={h.completedToday ? 'line-through text-zinc-500' : ''}>{h.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-orange-400">⚡ Streak: {h.streak}d</span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2 pt-2 border-t border-zinc-800/40">
                  <input
                    type="text"
                    placeholder="Coordinate custom routine task..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="flex-grow h-8 px-3 rounded text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-200 outline-none"
                  />
                  <button
                    onClick={handleCreateHabit}
                    className="h-8 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[10px] font-bold"
                  >
                    Add routine
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- MODULE F: FILE EXPLORER REGISTRY --- */}
          {activeMenu === 'files' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider">Shared Resources & Documents</h2>
                  <p className="text-xs text-zinc-500">Manage, share, and track reference folders, specifications, and layout designs.</p>
                </div>
              </div>

              {/* Hidden file input for real backend file uploads */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {cloudFiles.map(f => (
                  <div key={f.id} className={`p-4 rounded-xl border ${currentTheme.cardClass} flex flex-col justify-between space-y-3 relative overflow-hidden group`}>
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-zinc-800/30 border border-zinc-700 rounded-lg">
                        <FileCode className="w-5 h-5 text-indigo-400" />
                      </div>
                      <span className="text-[8px] bg-zinc-800 text-[#a1a1aa] px-1.5 rounded font-mono uppercase">{f.category}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-xs leading-tight truncate" title={f.name}>{f.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Size: {f.size} | Tag: {f.tag}</p>
                    </div>
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => downloadFile(f)}
                        className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => deleteFile(f.id, f.name)}
                        className="p-1.5 bg-red-950/10 border border-red-900/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded cursor-pointer transition-colors"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* File Upload zone */}
                <div
                  onClick={triggerFileSelection}
                  className="p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/10 flex flex-col items-center justify-center text-center space-y-2 py-8 cursor-pointer hover:bg-zinc-900/20 hover:border-zinc-500 transition-colors"
                >
                  <Paperclip className="w-5 h-4.5 text-[#daff33]" />
                  <div>
                    <p className="font-semibold text-[11px] text-zinc-300">Upload file asset</p>
                    <p className="text-[9px] text-[#71717a]">PDFs, code specs, images, or schemas</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- MODULE H: GOOGLE LOGIN PAGE & ACCOUNT SYNC --- */}
          {activeMenu === 'sync' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {!googleUser ? (
                /* --- GOOGLE SIGN-IN INTERACTIVE MOCKUP MODULE --- */
                <div className="w-full max-w-md mx-auto my-8 bg-black/40 border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8 animate-fade-in text-zinc-300 font-sans">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-white font-sans">Trecko Workspace Sync</h2>
                      <p className="text-xs text-white/50 mt-1">Sync workspace pipeline status & files with your Google account</p>
                    </div>
                  </div>

                  {googleLoginStep === 'welcome' && (
                    <div className="space-y-4 animate-fade-in">
                      <p className="text-xs text-zinc-400 text-center leading-relaxed">
                        Authorize Workspace OS security keys to safely sync task boards, backups, and attachments.
                      </p>
                      
                      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between cursor-pointer" onClick={() => {
                        setGoogleEmailInput('obsidians378@gmail.com');
                        setGoogleLoginStep('email');
                      }}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#daff33]/10 border border-[#daff33]/20 flex items-center justify-center text-[10px] font-bold text-[#daff33] font-mono">
                            OA
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-semibold text-white">obsidians378@gmail.com</p>
                            <p className="text-[10px] text-white/40 font-mono">Primary Security Email</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      </div>

                      <button
                        onClick={() => {
                          setGoogleEmailInput('');
                          setGoogleLoginStep('email');
                        }}
                        className="w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-semibold rounded-2xl transition-all cursor-pointer text-center block"
                      >
                        Use another account
                      </button>
                    </div>
                  )}

                  {googleLoginStep === 'email' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-white/40 font-mono">Google Email</label>
                        <input
                          type="email"
                          value={googleEmailInput}
                          onChange={(e) => setGoogleEmailInput(e.target.value)}
                          className="w-full h-11 px-4 text-xs rounded-xl bg-zinc-950 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                          placeholder="obsidians378@gmail.com"
                          autoFocus
                          required
                        />
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => setGoogleLoginStep('welcome')}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-semibold text-white/60 transition-all cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => {
                            if (googleEmailInput.trim()) {
                              setGoogleLoginStep('password');
                            }
                          }}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  )}

                  {googleLoginStep === 'password' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center space-x-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-mono font-bold text-white/60">G</div>
                        <span className="text-white/60 truncate font-mono">{googleEmailInput}</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-white/40 font-mono">Password</label>
                        <input
                          type="password"
                          value={googlePasswordInput}
                          onChange={(e) => setGooglePasswordInput(e.target.value)}
                          className="w-full h-11 px-4 text-xs rounded-xl bg-zinc-950 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                          placeholder="••••••••"
                          autoFocus
                          required
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              triggerGoogleAuth();
                            }
                          }}
                        />
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => setGoogleLoginStep('email')}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-semibold text-white/60 transition-all cursor-pointer"
                        >
                          Change Email
                        </button>
                        <button
                          onClick={() => triggerGoogleAuth()}
                          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-semibold transition-all cursor-pointer"
                        >
                          Login with Google
                        </button>
                      </div>
                    </div>
                  )}

                  {googleLoginStep === 'authorizing' && (
                    <div className="text-center py-6 space-y-4 animate-fade-in flex flex-col items-center">
                      <div className="animate-spin w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full" />
                      <div>
                        <p className="text-sm font-bold text-white">Consolidating Security Credentials...</p>
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">Interfacing with secure portal. Saving token...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* --- GOOGLE SYNC DASHBOARD PANEL --- */
                <div className="space-y-6 animate-fade-in text-[#f4f4f5]">
                  <div className={`p-6 rounded-3xl border ${currentTheme.cardClass} flex flex-col md:flex-row items-center md:items-start justify-between gap-6`}>
                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-[#daff33]/40 p-0.5 shadow-md shrink-0">
                        <img src={googleUser.picture} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-lg" alt="Synced Avatar" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
                          <span>{googleUser.name}</span>
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">SECURE SYNCED</span>
                        </h3>
                        <p className="text-xs text-white/50">{googleUser.email}</p>
                        <p className="text-[10px] text-zinc-550 mt-1 font-mono uppercase tracking-[0.1em] text-zinc-500">Last synced state coordinate: {googleUser.lastSynced}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setGoogleUser(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/5 hover:border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      Disconnect Account
                    </button>
                  </div>

                  {/* Settings toggles */}
                  <div className={`p-6 rounded-3xl border ${currentTheme.cardClass} space-y-6`}>
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-wide uppercase">Google Workspace Synchronization settings</h4>
                      <p className="text-xs text-white/40 mt-1">Activate reactive synchronization for your workspace resources and files</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Calendar toggle card */}
                      <div className={`p-4 rounded-2xl border ${currentTheme.borderClass} ${googleUser.syncedCalendar ? 'bg-[#daff33]/5 border-[#daff33]/25 shadow-sm' : 'bg-transparent'} flex flex-col justify-between space-y-3`}>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">Calendar Sync</span>
                          <button
                            onClick={() => toggleSyncService('syncedCalendar')}
                            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${googleUser.syncedCalendar ? 'bg-emerald-500' : 'bg-zinc-850 bg-zinc-800'}`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${googleUser.syncedCalendar ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Event Sync</p>
                          <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Auto syncs high-fidelity standup coordinates and calendar milestones.</p>
                        </div>
                      </div>

                      {/* Drive Backup toggle card */}
                      <div className={`p-4 rounded-2xl border ${currentTheme.borderClass} ${googleUser.syncedDrive ? 'bg-[#daff33]/5 border-[#daff33]/25 shadow-sm' : 'bg-transparent'} flex flex-col justify-between space-y-3`}>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">Documents Backup</span>
                          <button
                            onClick={() => toggleSyncService('syncedDrive')}
                            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${googleUser.syncedDrive ? 'bg-emerald-500' : 'bg-zinc-850 bg-zinc-800'}`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${googleUser.syncedDrive ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Drive / Asset Sync</p>
                          <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Automatically upload and back up documents to Google Drive secure storage.</p>
                        </div>
                      </div>

                      {/* Docs Wiki toggle card */}
                      <div className={`p-4 rounded-2xl border ${currentTheme.borderClass} ${googleUser.syncedDocs ? 'bg-[#daff33]/5 border-[#daff33]/25 shadow-sm' : 'bg-transparent'} flex flex-col justify-between space-y-3`}>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">Notion Wiki Mirror</span>
                          <button
                            onClick={() => toggleSyncService('syncedDocs')}
                            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${googleUser.syncedDocs ? 'bg-emerald-500' : 'bg-zinc-850 bg-zinc-800'}`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${googleUser.syncedDocs ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Google Docs Link</p>
                          <p className="text-[10px] text-white/40 mt-1 leading-relaxed">Converts Notion-style design specifications into synced Google Docs reference pages.</p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="flex flex-col md:flex-row gap-2 pt-4 border-t border-white/5 font-mono text-[10px] font-bold">
                      <button
                        onClick={syncCoordinatesNow}
                        disabled={isGoogleLoading}
                        className="flex-1 py-3 bg-[#daff33] text-black hover:bg-[#c2ef00] transition-all cursor-pointer rounded-xl flex items-center justify-center space-x-2"
                      >
                        {isGoogleLoading ? (
                          <>
                            <span className="animate-spin w-3 h-3 border-2 border-black border-t-transparent rounded-full" />
                            <span>TRANSMITTING BATCH CODES...</span>
                          </>
                        ) : (
                          <>
                            <span>FORCE WORKSPACE SECURE SYNC</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const backup = {
                            workspaces,
                            tasks,
                            docs,
                            channels,
                            messages,
                            cloudFiles,
                            syncUser: googleUser
                          };
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
                          const downloadAnchor = document.createElement('a');
                          downloadAnchor.setAttribute("href", dataStr);
                          downloadAnchor.setAttribute("download", `workspace-os-${activeWorkspaceId}-coordinates-backup.json`);
                          document.body.appendChild(downloadAnchor);
                          downloadAnchor.click();
                          downloadAnchor.remove();
                        }}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 rounded-xl transition-all cursor-pointer"
                      >
                        EXPORT CONFIG SPEC
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SKIN THEME OPTIONS IN SETTINGS --- */}
              <div className={`p-6 rounded-3xl border ${currentTheme.cardClass} space-y-4`}>
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-[#daff33]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Skin Theme & Workspace Aesthetics</h3>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Select a unified theme palette to paint the application components, container borders, and background canvas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  {THEMES.map(th => {
                    const isActive = currentTheme.id === th.id;
                    return (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setCurrentTheme(th)}
                        className={`p-3.5 text-left rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] cursor-pointer ${
                          isActive 
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-white shadow-lg' 
                            : 'border-white/5 bg-zinc-900/40 hover:border-white/15 text-zinc-450 hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#daff33] shadow animate-pulse" />
                        )}
                        <span className="font-bold text-xs block">{th.name}</span>
                        <span className="text-[10px] text-zinc-500 mt-1 block leading-tight">
                          {th.id === 'geometric-balance' ? 'Minimal Tech Slate' : 
                           th.id === 'obsidian' ? 'Onyx Dark Pitch' : 
                           th.id === 'cosmic' ? 'Dusk Deep Space' : 
                           th.id === 'emerald' ? 'Cyberpunk Mint' : 
                           th.id === 'light-copper' ? 'Volt Cyber-Neon' : 
                           th.id === 'crimson' ? 'Crimson Protocol' : 
                           th.id === 'aurora' ? 'Nordic Lights' : 
                           th.id === 'bronze' ? 'Solar Bronze' :
                           th.id === 'sunset-amber' ? 'Warm Sunset Glow' :
                           th.id === 'deep-orchid' ? 'Royal Pink Magic' :
                           th.id === 'titanium-slate' ? 'Industrial Cool Steel' :
                           th.id === 'electric-indigo' ? 'Vivid Laser Indigo' : 'Special Palette'}
                        </span>
                        
                        <div className="mt-3 flex items-center space-x-1">
                          <span className={`w-3 h-3 rounded-full ${
                            th.id === 'geometric-balance' ? 'bg-[#090909]' : 
                            th.id === 'obsidian' ? 'bg-[#09090b]' : 
                            th.id === 'cosmic' ? 'bg-[#0f0e17]' : 
                            th.id === 'emerald' ? 'bg-[#050c08]' : 
                            th.id === 'light-copper' ? 'bg-[#0a0d02]' : 
                            th.id === 'crimson' ? 'bg-[#0c0506]' : 
                            th.id === 'aurora' ? 'bg-[#030a0d]' : 
                            th.id === 'sunset-amber' ? 'bg-[#0f0702]' :
                            th.id === 'deep-orchid' ? 'bg-[#0c0209]' :
                            th.id === 'titanium-slate' ? 'bg-[#111518]' :
                            th.id === 'electric-indigo' ? 'bg-[#020311]' :
                            'bg-[#0f0b07]'
                          }`} />
                          <span className={`w-3 h-3 rounded-full ${
                            th.id === 'geometric-balance' ? 'bg-indigo-500' : 
                            th.id === 'obsidian' ? 'bg-blue-600' : 
                            th.id === 'cosmic' ? 'bg-violet-600' : 
                            th.id === 'emerald' ? 'bg-emerald-600' : 
                            th.id === 'light-copper' ? 'bg-[#daff33]' : 
                            th.id === 'crimson' ? 'bg-rose-600' : 
                            th.id === 'aurora' ? 'bg-cyan-500' : 
                            th.id === 'sunset-amber' ? 'bg-orange-500' :
                            th.id === 'deep-orchid' ? 'bg-pink-500' :
                            th.id === 'titanium-slate' ? 'bg-teal-500' :
                            th.id === 'electric-indigo' ? 'bg-indigo-600' :
                            'bg-amber-500'
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-[#bfdbfe]">
                  <span>Active borders coordinate standard standard</span>
                  <span className="font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">1px Solid styled container bounds</span>
                </div>
              </div>

              {/* --- CUSTOM PROFILE IDENTITY PANEL --- */}
              <div className={`p-6 rounded-3xl border ${currentTheme.cardClass} space-y-4`}>
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-[#daff33]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-sans">Workspace Identity Profile</h3>
                </div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Customize your local multi-user profile information. This allows you to set custom display names and active avatar picture streams.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 block">Custom Profile Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Chen"
                      value={profileName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileName(val);
                        localStorage.setItem('custom_profile_name', val);
                      }}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-450 block text-zinc-400">Custom Avatar Picture URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={profilePicUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfilePicUrl(val);
                        localStorage.setItem('custom_profile_pic_url', val);
                      }}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  {profilePicUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-indigo-500/20 shadow">
                      <img src={profilePicUrl} className="w-full h-full object-cover" alt="Identity Preview" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Active Name Coordinate: <span className="text-[#daff33]">{profileName || googleUser?.name || currentActiveUser.name}</span></p>
                    <p className="text-[10px] text-zinc-500 font-mono">Current active session initialized under role: {currentActiveUser.role}</p>
                  </div>
                </div>
              </div>

              {/* --- TEAM SQUAD MEMBERS & PROJECT INVITATION MATRIX --- */}
              <div className={`p-6 rounded-3xl border ${currentTheme.cardClass} space-y-6`}>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-[#daff33]" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-sans">Team Squad Directory & Project Invite</h3>
                  </div>
                  <span className="text-[10px] font-mono bg-zinc-800 text-indigo-400 border border-white/5 px-2.5 py-0.5 rounded uppercase font-bold">
                    Multi-user Group
                  </span>
                </div>

                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Register active team profiles inside this workspace environment and generate custom, encrypted group invitation codes to onboard remote developers onto your active boards.
                </p>

                {/* Grid container with Form & Active list */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 text-left">
                  
                  {/* Left Column: Form to define profile and compile invitation link */}
                  <div className="space-y-4 bg-zinc-950/20 p-5 rounded-2xl border border-white/5">
                    <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest font-mono border-b border-white/5 pb-1.5 flex items-center justify-between">
                      <span>onboard new coordinate</span>
                      <span className="text-[9px] text-zinc-500 font-normal">invite code compiler</span>
                    </h4>

                    {/* Inputs */}
                    <div className="space-y-3">
                      <div className="space-y-1 text-left">
                        <label className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-zinc-400 block">FullName Name Parameter</label>
                        <input
                          type="text"
                          placeholder="e.g. Liam Sterling"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-sans h-9"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-zinc-400 block">Secure E-Mail Address</label>
                        <input
                          type="email"
                          placeholder="e.g. liam@sovereign.io"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono h-9"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-zinc-400 block">Operational Squad Role Designation</label>
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-9 font-sans cursor-pointer"
                        >
                          <option value="Lead Software Architect">Lead Software Architect</option>
                          <option value="Senior Frontend Generalist">Senior Frontend Generalist</option>
                          <option value="Workspace Ops Controller">Workspace Ops Controller</option>
                          <option value="QA Systems Automation Special">QA Systems Automation Special</option>
                          <option value="Project Delivery Manager">Project Delivery Manager</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!newMemberName.trim() || !newMemberEmail.trim()) {
                          useAppStore.getState().addNotification('Parameters Incomplete', 'Provide full names and emails to register team profiles.', 'info');
                          return;
                        }
                        
                        addTeamMember({
                          name: newMemberName,
                          email: newMemberEmail,
                          role: newMemberRole,
                          status: 'invited'
                        });

                        useAppStore.getState().addNotification(
                          'Team Member Profile Registered',
                          `"${newMemberName}" added as ${newMemberRole}. Invite protocol standby.`,
                          'info'
                        );

                        setNewMemberName('');
                        setNewMemberEmail('');
                      }}
                      className="w-full py-2 bg-[#daff33] text-black hover:bg-[#c2ef00] rounded-xl text-[10px] font-mono tracking-wider font-extrabold shadow-sm transition-all text-center uppercase cursor-pointer"
                    >
                      Issue invitation credentials
                    </button>
                  </div>

                  {/* Right Column: Active and Invited squad list */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest font-mono border-b border-white/5 pb-1.5 text-left">
                      Active Squad Core Directory ({teamMembers.length})
                    </h4>

                    {teamMembers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 bg-zinc-900/10 rounded-2xl text-zinc-500">
                        <p className="font-medium font-sans text-xs">Squad directory is empty</p>
                        <p className="text-[9px] font-mono leading-relaxed mt-1 text-center">Register new developers above to assemble your team</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-2 custom-scrollbar">
                        {teamMembers.map((member) => {
                          const inviteToken = `lnk_ws_${activeWorkspaceId}_token_${member.id}`;
                          const inviteUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?inviteToken=${inviteToken}&role=${encodeURIComponent(member.role)}`;
                          const isCopied = copiedMemberId === member.id;

                          const copyToClipboard = () => {
                            navigator.clipboard.writeText(inviteUrl);
                            setCopiedMemberId(member.id);
                            useAppStore.getState().addNotification(
                              'Invite Copied',
                              `Group invitation link copied for ${member.name}. Share code securely.`,
                              'info'
                            );
                            setTimeout(() => {
                              setCopiedMemberId(null);
                            }, 2500);
                          };

                          return (
                            <div key={member.id} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all flex flex-col space-y-3 text-left">
                              <div className="flex items-start justify-between">
                                <div className="text-left space-y-0.5">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-white text-xs font-sans block">{member.name}</span>
                                    {member.status === 'invited' ? (
                                      <span className="text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse block">
                                        INVITED
                                      </span>
                                    ) : (
                                      <span className="text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 block">
                                        ACTIVE
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-zinc-400 font-sans">{member.role}</p>
                                  <p className="text-[9px] text-zinc-600 font-mono italic">{member.email}</p>
                                </div>

                                <button
                                  onClick={() => {
                                    removeTeamMember(member.id);
                                    useAppStore.getState().addNotification('Profile Removed', `"${member.name}" removed from squad listings.`, 'info');
                                  }}
                                  className="text-zinc-600 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                                  title="Revoke session credentials"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Invitation code link generator box */}
                              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/45 border border-white/5 gap-2.5">
                                <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[130px] select-all select-none block">
                                  {inviteUrl}
                                </span>
                                <button
                                  onClick={copyToClipboard}
                                  className={`px-3 py-1 text-[9px] font-mono font-extrabold uppercase rounded-lg border cursor-pointer select-none transition-all ${
                                    isCopied 
                                      ? 'bg-emerald-500/15 border-emerald-500/30 text-[#10B981]' 
                                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white hover:text-white'
                                  }`}
                                >
                                  {isCopied ? 'COPIED LINK' : 'COPY LINK'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* --- ADVANCED SHORTCUT KEYMAP DIRECTORY --- */}
              <div className={`p-6 rounded-3xl border ${currentTheme.cardClass} space-y-4`}>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-[#daff33]" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Core Keyboard Keymap Mappings</h3>
                  </div>
                  <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 border border-white/5 px-2 py-0.5 rounded uppercase font-bold">Alt Trigger Active</span>
                </div>

                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Navigate seamlessly across active panels, dispatch commands, and toggle utilities instantly using native keyboard controller hotkeys:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {/* Column A: Navigation */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest font-mono">Panel Navigation</h4>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Home dashboard</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Alt+D</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Agile Kanban Board (Tasks)</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Alt+K</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Slack-Style Chat (Syncs)</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Alt+C</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Doc boxes (Wiki Docs)</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Alt+W</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Settings & Google Workspace Sync</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Alt+S</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Dev Tools Suite</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Alt+T</kbd>
                      </div>
                    </div>
                  </div>

                  {/* Column B: Executive Operations */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest font-mono">Executive Workflows</h4>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs font-sans text-zinc-100">Open Command Palette</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Ctrl+K</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#daff33]/5 border border-[#daff33]/20 hover:bg-[#daff33]/10 transition-all">
                        <span className="text-zinc-200 select-none font-semibold text-xs flex items-center gap-1.5">
                          <span>Create New Task Ticket</span>
                          <span className="text-[8px] bg-[#daff33]/15 text-[#daff33] px-1 rounded uppercase font-bold font-mono">HOTKEY</span>
                        </span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-[#daff33] border border-[#daff33]/30 rounded font-mono font-bold uppercase shadow-sm">Alt+N</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Toggle Aura Companion Drawer</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Alt+A</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Toggle Pomodoro Focus Session</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Alt+H</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Switch Random Accent Skins</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Alt+R</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all">
                        <span className="text-zinc-350 select-none text-xs">Close Dialog Modal / Exit view</span>
                        <kbd className="px-2 py-0.5 text-[9px] bg-zinc-800 text-white/90 border border-white/10 rounded font-mono font-bold uppercase shadow-sm">Esc</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* --- TACTICAL UTILITIES PORT CONTROLLER RENDERER --- */}
          {['focus_session', 'sticky_notes', 'whiteboard', 'team_presence', 'project_health', 'habit_tracker', 'goal_radar', 'time_analytics', 'quick_dock', 'file_vault', 'personal_crm', 'knowledge_graph'].includes(activeMenu as string) && (
            <TacticalUtilities 
              activeSection={activeMenu as any} 
              tasks={tasks}
              onTasksChange={(updatedTasks) => setTasks(updatedTasks)}
              onEditTask={(task) => setEditingTask(task)}
              theme={currentTheme}
            />
          )}

          {/* --- MODULE I: INTEGRATED DEVTOOLS SUITE --- */}
          {activeMenu === 'tools' && (
            <DevToolsSuite theme={currentTheme} />
          )}

        </main>

      </div>

      {/* --- SIDE-MODAL FRAME: EDIT KANBAN TASK DETAIL DRAWER --- */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updatedTask) => {
            const oldTask = tasks.find(t => t.id === updatedTask.id);
            if (oldTask && oldTask.status !== 'Done' && updatedTask.status === 'Done') {
              boostPulse(15);
            }
            setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
            setEditingTask(null);
          }}
          onDelete={(taskId) => {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setEditingTask(null);
          }}
          onArchive={(taskId) => {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, archived: true } : t));
            setEditingTask(null);
          }}
        />
      )}

      {/* --- GLOBAL DIALOG MODAL LAYOUT: EDIT WORKSPACE MODAL --- */}
      {editingWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-[#000000]/85 backdrop-blur-md transition-opacity" 
            onClick={() => setEditingWorkspace(null)} 
          />
          
          <div className="bg-[#121214] border border-white/15 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 animate-fade-in space-y-5 text-zinc-350 font-sans text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#daff33]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Workspace Customizer</h3>
              </div>
              <button 
                onClick={() => setEditingWorkspace(null)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/55 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Configure parameters and color accents for <span className="text-white font-semibold">"{editingWorkspace.name}"</span>.
            </p>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-white/40 font-mono">Workspace Name</label>
                <input
                  type="text"
                  value={editingWorkspaceName}
                  onChange={(e) => setEditingWorkspaceName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl bg-zinc-950 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:ring-indigo-500 text-white font-medium"
                  placeholder="e.g. Genesis Protocol"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-wider text-white/40 font-mono">Objectives / Meta Description</label>
                <input
                  type="text"
                  value={editingWorkspaceDesc}
                  onChange={(e) => setEditingWorkspaceDesc(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl bg-zinc-950 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:ring-indigo-500 text-white"
                  placeholder="e.g. Main code deployment coordinates"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-wider text-white/40 font-mono block">Color Coordinate Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'indigo', class: 'text-indigo-400', bg: 'bg-indigo-400', label: 'Indigo' },
                    { id: 'blue', class: 'text-blue-500', bg: 'bg-blue-500', label: 'Blue' },
                    { id: 'emerald', class: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Green' },
                    { id: 'violet', class: 'text-violet-500', bg: 'bg-violet-500', label: 'Violet' },
                    { id: 'rose', class: 'text-rose-500', bg: 'bg-rose-500', label: 'Rose' },
                    { id: 'amber', class: 'text-amber-500', bg: 'bg-amber-500', label: 'Amber' },
                    { id: 'cyan', class: 'text-cyan-400', bg: 'bg-cyan-400', label: 'Teal' },
                    { id: 'voltage', class: 'text-[#daff33]', bg: 'bg-[#daff33]', label: 'Volt' },
                  ].map(color => {
                    const isSelected = editingWorkspaceAccent === color.class;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setEditingWorkspaceAccent(color.class)}
                        className={`p-1 text-[10px] rounded-xl border flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer h-10 ${
                          isSelected ? 'border-white/40 bg-white/5' : 'border-white/5 bg-zinc-900/45 hover:border-white/15'
                        }`}
                        title={color.label}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${color.bg}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2 text-[10px] font-mono font-bold">
              <button
                onClick={() => setEditingWorkspace(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/55 border border-white/5 transition-all cursor-pointer text-center"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveEditWorkspace}
                className="flex-grow flex-1 py-2.5 bg-[#daff33] text-black hover:bg-[#c2ef00] transition-all cursor-pointer rounded-xl text-center"
              >
                SAVE PARAMETERS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- GLOBAL DIALOG MODAL LAYOUT: Ctrl+K COMMAND PALETTE --- */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        themes={THEMES}
        currentTheme={currentTheme}
        onSelectTheme={(theme) => setCurrentTheme(theme)}
        workspaces={workspaces}
        onSelectWorkspace={(wsId) => setActiveWorkspaceId(wsId)}
        onChangeMenu={(menu) => setActiveMenu(menu)}
        onCreateTask={(status) => handleCreateTask(status)}
        onCreateDoc={() => handleCreateWikiDoc()}
        onClearDoneTasks={() => setTasks(prev => prev.filter(t => t.status !== 'Done'))}
        onStartPomodoro={togglePomodoro}
        tasks={tasks}
        docs={docs}
        channels={channels}
        onSelectDoc={(id) => setActiveDocId(id)}
        onSelectTask={(task) => setEditingTask(task)}
        onSelectChannel={(id) => setActiveChannelId(id)}
      />

      <AiWorkspaceAssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        tasks={tasks}
        docs={docs}
        accentColor={currentTheme.id === 'emerald' ? '#34d399' : '#daff33'}
        addNotification={(title, body, type) => useAppStore.getState().addNotification(title, body, type || 'info')}
      />

      {/* --- GLOBAL DIALOG MODAL LAYOUT: KEYBOARD SHORTCUTS GUIDE --- */}
      {isShortcutsModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col text-xs">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 bg-white/[0.01]">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-xs tracking-wider uppercase text-[#EDEDED] font-mono">Workspace OS Keymap</span>
              </div>
              <button 
                onClick={() => setIsShortcutsModalOpen(false)} 
                className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto pr-3.5 custom-scrollbar">
              <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-wider font-mono font-bold select-none">
                Assigned system boundaries & standard operational hotkeys
              </p>

              {/* Category: System Operations */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest font-mono">Core Utilities</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#EDEDED]/70 font-medium">Command Palette Query</span>
                    <kbd className="px-2 py-0.5 text-[9px] bg-white/10 text-[#EDEDED] border border-white/5 rounded font-mono font-bold select-none uppercase">Ctrl+K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#EDEDED]/70 font-medium font-sans">Dismiss Mode / Close Dialog</span>
                    <kbd className="px-2 py-0.5 text-[9px] bg-white/10 text-[#EDEDED] border border-white/5 rounded font-mono font-bold select-none uppercase">Esc</kbd>
                  </div>
                </div>
              </div>

              {/* Category: Board & Cards */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest font-mono">Sprint Boards</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#EDEDED]/70 font-medium">Drag & Drop Card</span>
                    <span className="text-[10px] text-white/40 font-semibold italic">Reorder or move column</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#EDEDED]/70 font-medium">Click Card</span>
                    <span className="text-[10px] text-white/40 font-semibold italic">Open issue coordinate details</span>
                  </div>
                </div>
              </div>

              {/* Category: Lateral Panels */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] text-indigo-400 uppercase tracking-widest font-mono">Oracle Assistants</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#EDEDED]/70 font-medium">Oracle Assistant toggle</span>
                    <kbd className="px-2 py-0.5 text-[9px] bg-white/10 text-[#EDEDED] border border-white/5 rounded font-mono font-bold select-none uppercase">Click Sparkles</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[#EDEDED]/70 font-medium">Focus Attention Timer</span>
                    <kbd className="px-2 py-0.5 text-[9px] bg-white/10 text-[#EDEDED] border border-white/5 rounded font-mono font-bold select-none uppercase">Click Clock</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-white/[0.01] text-[10px] text-white/40 text-center font-mono uppercase tracking-wider">
              Secure operational metrics logged on port 3000
            </div>
          </div>
        </div>
      )}

      {/* --- TRASH BIN & RESTORATION LEDGER MODAL --- */}
      {isTrashBinOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#09090b] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col h-[550px] text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4.5 bg-zinc-900/30">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm text-white uppercase tracking-wider font-sans">Restoration & Recovery Console</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Centralized trash registry for deleted workspace modules</p>
                </div>
              </div>
              <button 
                onClick={() => setIsTrashBinOpen(false)} 
                className="text-white/40 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-zinc-950/25">
              
              {/* Category tabs: Trash ledger items vs Inactive/completed coordinate records */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Deleted Ledger Registry ({trashBin.length})</span>
                  {trashBin.length > 0 && (
                    <button 
                      onClick={() => {
                        useAppStore.getState().clearTrash();
                        useAppStore.getState().addNotification('Trash Liquidated', 'All elements in the ledger have been permanently purged.', 'info');
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 font-mono font-bold select-none cursor-pointer bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors"
                    >
                      Clear Bin Permanently
                    </button>
                  )}
                </div>

                {trashBin.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/5 bg-zinc-900/10 rounded-2xl space-y-3">
                    <Trash2 className="w-8 h-8 text-zinc-700 stroke-[1.5]" />
                    <div className="text-center">
                      <p className="text-zinc-400 font-medium font-sans">Ledger clean and unburdened</p>
                      <p className="text-[10px] text-zinc-600 font-mono">No deleted sticky notes, tasks, or files logged</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {trashBin.map((item) => {
                      let typeLabel = '';
                      let badgeColor = '';
                      if (item.type === 'note') { typeLabel = 'Sticky Note'; badgeColor = 'bg-amber-500/10 border-amber-500/25 text-amber-400'; }
                      else if (item.type === 'task') { typeLabel = 'Kanban Task'; badgeColor = 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'; }
                      else if (item.type === 'file') { typeLabel = 'Workspace File'; badgeColor = 'bg-sky-500/10 border-sky-500/25 text-sky-400'; }
                      else if (item.type === 'contact') { typeLabel = 'CRM Contact'; badgeColor = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'; }

                      const processRestore = async () => {
                        try {
                          if (item.type === 'note') {
                            await localDB.put('notes', item.originalData);
                            useAppStore.getState().addNotification('Sticky Note Restored', `"${item.title}" successfully returned to your active desk space.`, 'info');
                          } else if (item.type === 'task') {
                            const currentTasks = useAppStore.getState().tasks;
                            const restoredTask = { ...item.originalData, archived: false, status: 'Todo' };
                            const targetIdx = currentTasks.findIndex(t => t.id === item.id);
                            if (targetIdx > -1) {
                              const nextList = [...currentTasks];
                              nextList[targetIdx] = restoredTask;
                              useAppStore.getState().reorderTasks(nextList);
                            } else {
                              useAppStore.getState().reorderTasks([...currentTasks, restoredTask]);
                            }
                            useAppStore.getState().addNotification('Task Restored', `"${item.title}" reinstated inside backlog column status.`, 'info');
                          } else if (item.type === 'file') {
                            await localDB.put('files', item.originalData);
                            const currentList = useAppStore.getState().cloudFiles;
                            if (!currentList.some(f => f.id === item.id)) {
                              useAppStore.getState().addCloudFile(item.originalData);
                            }
                            useAppStore.getState().addNotification('File Restored', `"${item.title}" successfully restored in server storage.`, 'info');
                          } else if (item.type === 'contact') {
                            await localDB.put('crm', item.originalData);
                            useAppStore.getState().addNotification('Contact Restored', `"${item.title}" returned into address index directory.`, 'info');
                          }
                          useAppStore.getState().removeFromTrash(item.id);
                          window.dispatchEvent(new Event('storage'));
                        } catch (err) {
                          console.error(err);
                        }
                      };

                      return (
                        <div key={item.id} className="flex items-center justify-between p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all hover:border-white/10 group">
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <span className={`px-2 py-0.5 border text-[9px] font-mono font-bold rounded uppercase tracking-wider ${badgeColor}`}>
                              {typeLabel}
                            </span>
                            <div className="min-w-0 text-left">
                              <p className="text-white font-medium truncate text-xs">{item.title}</p>
                              <p className="text-[10px] text-zinc-500 font-mono">Deleted under coordinate ledger: {new Date(item.deletedAt).toLocaleTimeString()}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={processRestore}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-[#10B981] font-mono font-bold uppercase select-none rounded-xl cursor-pointer text-[10px] transition-all flex items-center space-x-1"
                              title="Restore to original ledger coordinates"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>RESTORE</span>
                            </button>
                            <button
                              onClick={() => {
                                useAppStore.getState().removeFromTrash(item.id);
                                useAppStore.getState().addNotification('Element Purged', `Permanently deleted from server registry index.`, 'info');
                              }}
                              className="p-1.5 bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/30 text-red-500 rounded-lg cursor-pointer transition-all flex items-center justify-center opacity-70 hover:opacity-100"
                              title="Permanently remove from disk"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Completed Tasks section for restorative coordinate operations */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold block text-left">Marked Completed Task Items</span>
                {tasks.filter(t => t.status === 'Done').length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 border border-dashed border-white/5 bg-zinc-900/5 rounded-2xl space-y-2">
                    <p className="text-zinc-500 font-medium font-sans">No completed/Done tasks currently logged</p>
                    <p className="text-[9px] text-zinc-500 font-mono">Complete user stories inside kanban boards to visualize them here</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                    {tasks.filter(t => t.status === 'Done').map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.02]">
                        <div className="flex items-center space-x-3 text-left">
                          <CheckCircle className="w-4 h-4 text-[#10B981]" />
                          <div>
                            <p className="text-emerald-400 font-sans line-through opacity-80">{t.title}</p>
                            <span className="text-[9px] text-zinc-500 font-mono tracking-wider">LANE: {t.label || 'Engineering'} • PRIORITY: {t.priority}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedList = tasks.map(origin => origin.id === t.id ? { ...origin, status: 'Todo' } : origin);
                            useAppStore.getState().reorderTasks(updatedList);
                            useAppStore.getState().addNotification('Task Reopened', `"${t.title}" returned into active board lanes.`, 'info');
                          }}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg font-mono text-[10px] font-bold cursor-pointer transition-all flex items-center space-x-1"
                          title="Restore task to Todo"
                        >
                          <RotateCcw className="w-3 h-3 text-zinc-400" />
                          <span>SEND BACK</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-6 py-4 bg-zinc-900/40 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
              <span>LEDGER SYSTEM INTEGRITY SECURED UNDER STANDARD ENCRYPTED WORKSPACE DESK</span>
              <span>PORT: 3000 ID</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
