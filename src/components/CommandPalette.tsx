import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Layers, 
  Briefcase, 
  MessageSquare, 
  BookOpen, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  Hash, 
  FileText, 
  CheckSquare, 
  Settings, 
  Sliders 
} from 'lucide-react';
import { Theme, Workspace, Task, Doc, Channel } from '../types';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ComponentType<any>;
  shortcut?: string;
  execute: () => void;
  contentText?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  themes: Theme[];
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  workspaces: Workspace[];
  onSelectWorkspace: (wsId: string) => void;
  onChangeMenu: (menu: 'dashboard' | 'chat' | 'projects' | 'wiki' | 'personal' | 'files' | 'customizer' | 'sync' | 'tools') => void;
  onCreateTask: (status: 'Todo' | 'Backlog' | 'InProgress' | 'Done') => void;
  onCreateDoc: () => void;
  onClearDoneTasks: () => void;
  onStartPomodoro: () => void;
  // Global search additions
  tasks: Task[];
  docs: Doc[];
  channels: Channel[];
  onSelectDoc: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onSelectChannel: (id: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  themes,
  currentTheme,
  onSelectTheme,
  workspaces,
  onSelectWorkspace,
  onChangeMenu,
  onCreateTask,
  onCreateDoc,
  onClearDoneTasks,
  onStartPomodoro,
  tasks,
  docs,
  channels,
  onSelectDoc,
  onSelectTask,
  onSelectChannel,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('command_palette_recent_queries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecentQueries(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem('command_palette_recent_queries', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentQuery = (q: string) => {
    setRecentQueries(prev => {
      const updated = prev.filter(item => item !== q);
      localStorage.setItem('command_palette_recent_queries', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentQueries = () => {
    setRecentQueries([]);
    localStorage.removeItem('command_palette_recent_queries');
  };

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActiveIndex(0);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compile general commands list
  const baseCommands: CommandItem[] = [
    {
      id: 'go-dashboard',
      label: 'Navigate to Home dashboard',
      category: 'Navigation Shortcuts',
      icon: Layers,
      execute: () => { onChangeMenu('dashboard'); onClose(); }
    },
    {
      id: 'go-projects',
      label: 'Navigate to Agile Kanban Board',
      category: 'Navigation Shortcuts',
      icon: Briefcase,
      shortcut: 'G + P',
      execute: () => { onChangeMenu('projects'); onClose(); }
    },
    {
      id: 'go-chat',
      label: 'Open Slack-Style Collaboration Chat',
      category: 'Navigation Shortcuts',
      icon: MessageSquare,
      shortcut: 'G + C',
      execute: () => { onChangeMenu('chat'); onClose(); }
    },
    {
      id: 'go-wiki',
      label: 'Open Doc boxes (Wiki docs)',
      category: 'Navigation Shortcuts',
      icon: BookOpen,
      shortcut: 'G + W',
      execute: () => { onChangeMenu('wiki'); onClose(); }
    },
    {
      id: 'go-personal',
      label: 'Open focus planners and Pomodoro tracker',
      category: 'Navigation Shortcuts',
      icon: Clock,
      execute: () => { onChangeMenu('personal'); onClose(); }
    },
    {
      id: 'create-task',
      label: 'Add new sprint issue / task',
      category: 'Action Tools',
      icon: CheckCircle2,
      shortcut: 'N',
      execute: () => { onCreateTask('Todo'); onClose(); }
    },
    {
      id: 'create-doc',
      label: 'Draft new specification index page',
      category: 'Action Tools',
      icon: BookOpen,
      execute: () => { onCreateDoc(); onClose(); }
    },
    {
      id: 'start-pomo',
      label: 'Initialize Pomodoro Focus Timer Session',
      category: 'Action Tools',
      icon: Clock,
      execute: () => { onStartPomodoro(); onClose(); }
    },
    {
      id: 'clear-done',
      label: 'Wipe all completed tasks from active workspace',
      category: 'Maintenance Actions',
      icon: Trash2,
      execute: () => { onClearDoneTasks(); onClose(); }
    },
  ];

  // Map workspace documents into searchable items
  const docCommands: CommandItem[] = docs.map(d => ({
    id: `doc-${d.id}`,
    label: d.title,
    category: `Wiki Document • ${d.category || 'General'}`,
    icon: FileText,
    contentText: `${d.title} ${d.content || ''} ${d.category || ''} ${d.folder || ''} ${d.section || ''}`,
    execute: () => {
      onChangeMenu('wiki');
      onSelectDoc(d.id);
      onClose();
    }
  }));

  // Map workspace tasks into searchable items
  const taskCommands: CommandItem[] = tasks.map(t => ({
    id: `task-${t.id}`,
    label: t.title,
    category: `Task • ${t.status} [Priority: ${t.priority}]`,
    icon: CheckSquare,
    contentText: `${t.title} ${t.description || ''} ${t.status} ${t.priority}`,
    execute: () => {
      onChangeMenu('projects');
      onSelectTask(t);
      onClose();
    }
  }));

  // Map workspace channels into searchable items
  const channelCommands: CommandItem[] = channels.map(c => ({
    id: `channel-${c.id}`,
    label: `#${c.name}`,
    category: `Chat Channel • ${c.category || ''}`,
    icon: Hash,
    contentText: `${c.name} ${c.category || ''}`,
    execute: () => {
      onChangeMenu('chat');
      onSelectChannel(c.id);
      onClose();
    }
  }));

  // Map settings and visual style parameters
  const settingCommands: CommandItem[] = [
    {
      id: 'setting-rename',
      label: 'Rename Workspace and Change Brand Title',
      category: 'Workspace Admin',
      icon: Settings,
      execute: () => { onChangeMenu('dashboard'); onClose(); }
    },
    {
      id: 'setting-theme',
      label: 'Customize Skin Colors and Styling Presets',
      category: 'Workspace Settings',
      icon: Sliders,
      execute: () => { onChangeMenu('customizer'); onClose(); }
    },
    ...themes.map(t => ({
      id: `theme-${t.id}`,
      label: `Switch theme style: Apply visual preset ${t.name}`,
      category: 'Styling Presets',
      icon: Sliders,
      execute: () => { onSelectTheme(t); onClose(); }
    })),
    ...workspaces.map(ws => ({
      id: `ws-${ws.id}`,
      label: `Jump environments into Workspace: ${ws.name}`,
      category: 'Workspace Switcher',
      icon: Briefcase,
      execute: () => { onSelectWorkspace(ws.id); onClose(); }
    }))
  ];

  const commandsList = [
    ...(docCommands || []),
    ...(taskCommands || []),
    ...baseCommands,
    ...channelCommands,
    ...settingCommands
  ];

  const getFilteredCommands = () => {
    let list = commandsList;
    const searchTest = query.trim();

    const prefixMatch = searchTest.match(/^([a-zA-Z]+):(.*)/);
    if (prefixMatch) {
      const prefix = prefixMatch[1].toLowerCase();
      const subQuery = prefixMatch[2].trim().toLowerCase();

      if (prefix === 'doc' || prefix === 'docs') {
        list = list.filter(cmd => cmd.id.startsWith('doc-') || cmd.category.toLowerCase().includes('wiki document'));
      } else if (prefix === 'task' || prefix === 'tasks') {
        list = list.filter(cmd => cmd.id.startsWith('task-') || cmd.category.toLowerCase().includes('task •') || cmd.category.toLowerCase().includes('task:'));
      } else if (prefix === 'ws' || prefix === 'w' || prefix === 'workspace' || prefix === 'workspaces') {
        list = list.filter(cmd => cmd.id.startsWith('ws-') || cmd.category.toLowerCase().includes('workspace switcher') || cmd.category.toLowerCase().includes('workspace admin'));
      }

      if (subQuery) {
        list = list.filter(cmd =>
          cmd.label.toLowerCase().includes(subQuery) ||
          cmd.category.toLowerCase().includes(subQuery) ||
          (cmd.contentText && cmd.contentText.toLowerCase().includes(subQuery))
        );
      }
    } else if (searchTest) {
      const q = searchTest.toLowerCase();
      list = list.filter(cmd =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        (cmd.contentText && cmd.contentText.toLowerCase().includes(q))
      );
    }
    return list;
  };

  const filteredCommands = getFilteredCommands();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        addRecentQuery(query);
        filteredCommands[activeIndex].execute();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000e3] backdrop-blur-xs flex items-start justify-center z-50 p-4 pt-24 md:pt-36">
      <div 
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl bg-[#0d0d0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col focus:outline-none text-xs text-[#EDEDED]"
        tabIndex={0}
      >
        <div className="h-12 border-b border-white/5 px-4 flex items-center space-x-3">
          <Search className="w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search any setting, task, document, command, or channel globally..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            className="flex-grow bg-transparent border-0 focus:outline-none focus:ring-0 text-white font-sans text-sm placeholder-white/30 h-full"
            autoFocus
          />
          <span className="text-[10px] font-mono text-white/20 px-1 border border-white/10 rounded mr-2">ESC</span>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recent Queries tracker */}
        {recentQueries.length > 0 && (
          <div className="px-4 py-2 border-b border-white/5 bg-[#0a0a0c]/85 flex items-center flex-wrap gap-2 text-[10px] text-zinc-400 font-sans">
            <span className="flex items-center space-x-1 font-mono text-[9px] uppercase tracking-wider text-white/30 shrink-0">
              <Clock className="w-3 h-3 text-white/30 mr-1 shrink-0 animate-pulse" />
              Recent Searches:
            </span>
            <div className="flex flex-wrap gap-1 items-center flex-grow">
              {recentQueries.map((rq, idx) => (
                <div key={idx} className="flex items-center space-x-1 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-lg hover:border-indigo-400/30 hover:bg-white/10 transition-all select-none">
                  <button
                    onClick={() => {
                      setQuery(rq);
                      setActiveIndex(0);
                    }}
                    className="cursor-pointer text-zinc-300 hover:text-white"
                  >
                    {rq}
                  </button>
                  <button
                    onClick={() => removeRecentQuery(rq)}
                    className="p-px text-white/25 hover:text-red-400 rounded transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <button 
                onClick={clearRecentQueries}
                className="text-[9px] text-red-400/50 hover:text-red-400 font-mono uppercase bg-red-400/5 px-1.5 py-0.5 rounded border border-red-500/10 cursor-pointer ml-auto"
                title="Clear searches history"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* List of Search Results */}
        <div ref={listRef} className="p-2 space-y-0.5 max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-white/30 font-semibold">
              No matching workspace coordinates found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    addRecentQuery(query);
                    cmd.execute();
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between font-sans transition-colors ${
                    isSelected ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'text-white/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-white/30'}`} />
                    <div className="flex flex-col">
                      <span className="font-medium text-[12px]">{cmd.label}</span>
                      <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{cmd.category}</span>
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-[8px] bg-white/5 text-white/40 border border-white/5 rounded font-mono">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Search Prefixes Interactive Bar */}
        <div className="px-4 py-2 border-t border-white/5 bg-[#050506]/90 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-500 font-sans">
          <span className="font-mono text-[9px] uppercase tracking-wider text-white/30 mr-1">Search prefixes:</span>
          <button 
            onClick={() => { setQuery('doc:'); setActiveIndex(0); }} 
            className="px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 font-mono text-[9px] transition-all cursor-pointer hover:scale-102"
          >
            doc: documents
          </button>
          <button 
            onClick={() => { setQuery('task:'); setActiveIndex(0); }} 
            className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 font-mono text-[9px] transition-all cursor-pointer hover:scale-102"
          >
            task: tasks
          </button>
          <button 
            onClick={() => { setQuery('ws:'); setActiveIndex(0); }} 
            className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 font-mono text-[9px] transition-all cursor-pointer hover:scale-102"
          >
            ws: workspaces
          </button>
          <button 
            onClick={() => { setQuery(''); setActiveIndex(0); }} 
            className="px-1.5 py-0.5 rounded-lg bg-[#daff33]/5 hover:bg-[#daff33]/15 text-[#daff33] border border-[#daff33]/10 font-mono text-[9px] transition-all cursor-pointer hover:scale-102 ml-auto"
          >
            clear
          </button>
        </div>

        <div className="p-3 border-t border-white/5 bg-[#080809] text-[9px] text-white/30 text-center font-mono uppercase tracking-wider flex justify-between px-6">
          <span>▲▼ arrow keys to choose</span>
          <span>ENTER to apply choice</span>
        </div>
      </div>
    </div>
  );
}
