import { create } from 'zustand';
import { Task, Doc, ChannelMessage, Channel, Habit, CloudFile, Workspace, Theme, TrashBinItem, TeamMember } from './types';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'task' | 'chat' | 'habit' | 'ai';
  read: boolean;
  time: string;
}

interface AppState {
  // Navigation & Theme
  activeWorkspaceId: string;
  isSidebarCollapsed: boolean;
  activeMenu: 'dashboard' | 'chat' | 'projects' | 'wiki' | 'personal' | 'files' | 'customizer' | 'tools' | 'sync' | 'focus_session' | 'sticky_notes' | 'whiteboard' | 'team_presence' | 'project_health' | 'habit_tracker' | 'goal_radar' | 'time_analytics' | 'quick_dock' | 'file_vault' | 'personal_crm' | 'knowledge_graph' | 'sprint_calendar';
  activeChannelId: string;
  activeDocId: string;
  projectLayout: 'kanban' | 'list' | 'timeline';
  showArchived: boolean;
  pomoTime: number;
  pomoActive: boolean;
  pomoSoundOn: boolean;
  currentThemeId: string;

  // Active Data Arrays
  workspaces: Workspace[];
  tasks: Task[];
  docs: Doc[];
  channels: Channel[];
  messages: Record<string, ChannelMessage[]>;
  habits: Habit[];
  cloudFiles: CloudFile[];
  notifications: NotificationItem[];
  aiChatHistory: { sender: 'user' | 'assistant'; text: string }[];
  isAiTyping: boolean;

  trashBin: TrashBinItem[];
  teamMembers: TeamMember[];
  addToTrash: (item: Omit<TrashBinItem, 'deletedAt'>) => void;
  removeFromTrash: (id: string) => void;
  clearTrash: () => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;

  // Global Actions
  setActiveWorkspaceId: (id: string) => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setActiveMenu: (menu: AppState['activeMenu']) => void;
  setActiveChannelId: (id: string) => void;
  setActiveDocId: (id: string) => void;
  setProjectLayout: (layout: AppState['projectLayout']) => void;
  setShowArchived: (show: boolean) => void;
  setPomoTime: (time: number) => void;
  setPomoActive: (active: boolean) => void;
  setPomoSoundOn: (sound: boolean) => void;
  setCurrentThemeId: (themeId: string) => void;

  // Workspaces CRUD
  createWorkspace: (name: string, desc: string) => void;
  renameWorkspace: (id: string, newName: string) => void;
  deleteWorkspace: (id: string) => void;

  // Tasks CRUD (with archiving / soft delete, subtasks, and comments)
  createTask: (task: Partial<Task>) => void;
  updateTask: (task: Task) => void;
  setTaskStatus: (taskId: string, status: Task['status']) => void;
  reorderTasks: (newTasks: Task[]) => void;
  archiveTask: (taskId: string) => void; // soft-delete
  restoreTask: (taskId: string) => void; // restore from archive
  purgeTask: (taskId: string) => void; // hard Delete
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addTaskComment: (taskId: string, commentText: string, sender?: string) => void;

  // Wiki Docs CRUD
  createDoc: (doc: Partial<Doc>) => void;
  updateDoc: (id: string, updates: Partial<Doc>) => void;
  deleteDoc: (id: string) => void;

  // Chat System CRUD
  createChannel: (name: string, category: 'Channels' | 'Direct Messages', role?: string) => void;
  sendMessage: (channelId: string, text: string, sender?: string, role?: string) => void;
  addReaction: (channelId: string, messageId: string, emoji: string, user?: string) => void;
  togglePinMessage: (channelId: string, messageId: string) => void;
  clearUnreadCount: (channelId: string) => void;

  // Habits Tracks
  createHabit: (title: string) => void;
  toggleHabitComplete: (id: string) => void;
  deleteHabit: (id: string) => void;

  // Files & Attachments System
  addCloudFile: (file: Partial<CloudFile>) => void;
  deleteCloudFile: (id: string) => void;

  // Notifications Engine
  addNotification: (title: string, body: string, type: NotificationItem['type']) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // AI Assistant Engine
  sendAiMessage: (message: string) => Promise<void>;
  clearAiHistory: () => void;
  setIsAiTyping: (typing: boolean) => void;

  // Persistence Operations
  loadWorkspaceData: (workspaceId: string) => void;
  saveWorkspaceData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation & Theme Defaults
  activeWorkspaceId: 'ws-delta',
  isSidebarCollapsed: typeof window !== 'undefined' ? (localStorage.getItem('workspace_sidebar_collapsed') === 'true') : false,
  activeMenu: 'dashboard',
  activeChannelId: '',
  activeDocId: '',
  projectLayout: 'kanban',
  showArchived: false,
  pomoTime: 1500,
  pomoActive: false,
  pomoSoundOn: false,
  currentThemeId: 'geometric-balance',

  // Master Lists Starting Place
  workspaces: [
    { id: 'ws-delta', name: 'Sovereign Engineering', code: '▲ DELTA', description: 'Deep tech development & main codebase architecting', accentClass: 'text-blue-500' },
    { id: 'ws-creative', name: 'Product Marketing v2', code: '◆ DESIGN', description: 'Design prototypes & user growth strategies', accentClass: 'text-violet-500' },
    { id: 'ws-personal', name: 'Personal Operations', code: '● MATRIX', description: 'Habits, journaling, schedule coordination', accentClass: 'text-emerald-500' }
  ],
  tasks: [],
  docs: [],
  channels: [],
  messages: {},
  habits: [],
  cloudFiles: [],
  notifications: [
    { id: 'notif-1', title: 'System Setup Verified', body: 'Infrastructure running flawlessly on port 3000. Welcome to Workspace OS.', type: 'info', read: false, time: 'Just now' }
  ],
  aiChatHistory: [
    { sender: 'assistant', text: '⚡ Welcome to **Aura Intelligent Co-pilot**! I aggregate active sprint columns, doc wikis, and team discussions to draft specs, plan sprint priorities, and quick-add tasks on the fly.' }
  ],
  isAiTyping: false,

  trashBin: typeof window !== 'undefined' && localStorage.getItem('workspace_os_trash') ? JSON.parse(localStorage.getItem('workspace_os_trash')!) : [],
  teamMembers: typeof window !== 'undefined' && localStorage.getItem('workspace_os_team') ? JSON.parse(localStorage.getItem('workspace_os_team')!) : [
    { id: 'tm-1', name: 'Alex Chen', role: 'Staff Software Architect', email: 'alex.chen@sovereign.io', status: 'active' },
    { id: 'tm-2', name: 'Sarah Jenkins', role: 'Lead Design Coordinator', email: 'sarah.j@sovereign.io', status: 'active' }
  ],
  addToTrash: (item) => {
    set(state => {
      const nextItem: TrashBinItem = {
        ...item,
        deletedAt: new Date().toISOString()
      };
      const updated = [nextItem, ...state.trashBin];
      localStorage.setItem('workspace_os_trash', JSON.stringify(updated));
      return { trashBin: updated };
    });
  },
  removeFromTrash: (id) => {
    set(state => {
      const remaining = state.trashBin.filter(item => item.id !== id);
      localStorage.setItem('workspace_os_trash', JSON.stringify(remaining));
      return { trashBin: remaining };
    });
  },
  clearTrash: () => {
    set({ trashBin: [] });
    localStorage.removeItem('workspace_os_trash');
  },
  addTeamMember: (member) => {
    set(state => {
      const newMember: TeamMember = {
        ...member,
        id: `tm-${Date.now()}`
      };
      const updated = [...state.teamMembers, newMember];
      localStorage.setItem('workspace_os_team', JSON.stringify(updated));
      return { teamMembers: updated };
    });
  },
  removeTeamMember: (id) => {
    set(state => {
      const remaining = state.teamMembers.filter(m => m.id !== id);
      localStorage.setItem('workspace_os_team', JSON.stringify(remaining));
      return { teamMembers: remaining };
    });
  },

  // Global Actions
  setActiveWorkspaceId: (id) => {
    set({ activeWorkspaceId: id });
    get().loadWorkspaceData(id);
  },
  setIsSidebarCollapsed: (collapsed) => {
    set({ isSidebarCollapsed: collapsed });
    if (typeof window !== 'undefined') {
      localStorage.setItem('workspace_sidebar_collapsed', String(collapsed));
    }
  },
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setActiveChannelId: (id) => {
    set({ activeChannelId: id });
    get().clearUnreadCount(id);
  },
  setActiveDocId: (id) => set({ activeDocId: id }),
  setProjectLayout: (layout) => set({ projectLayout: layout }),
  setShowArchived: (show) => set({ showArchived: show }),
  setPomoTime: (time) => set({ pomoTime: time }),
  setPomoActive: (active) => set({ pomoActive: active }),
  setPomoSoundOn: (sound) => set({ pomoSoundOn: sound }),
  setCurrentThemeId: (id) => set({ currentThemeId: id }),
  setIsAiTyping: (typing) => set({ isAiTyping: typing }),

  // Workspaces CRUD
  createWorkspace: (name, desc) => {
    const code = `⚡ ${name.substring(0, 5).toUpperCase()}`;
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      code,
      description: desc || 'Custom dedicated SaaS workspace',
      accentClass: 'text-indigo-400'
    };
    set(state => {
      const updated = [...state.workspaces, newWs];
      localStorage.setItem('workspace_os_list', JSON.stringify(updated));
      return { workspaces: updated, activeWorkspaceId: newWs.id };
    });
    get().loadWorkspaceData(newWs.id);
    get().addNotification('Workspace Created', `Workspace "${name}" is now online and verified.`, 'info');
  },

  renameWorkspace: (id, newName) => {
    set(state => {
      const updated = state.workspaces.map(w => w.id === id ? { ...w, name: newName } : w);
      localStorage.setItem('workspace_os_list', JSON.stringify(updated));
      return { workspaces: updated };
    });
  },

  deleteWorkspace: (id) => {
    set(state => {
      const remaining = state.workspaces.filter(w => w.id !== id);
      localStorage.setItem('workspace_os_list', JSON.stringify(remaining));
      const nextActiveId = remaining.length > 0 ? remaining[0].id : '';
      return { workspaces: remaining, activeWorkspaceId: nextActiveId };
    });
    const currentActive = get().activeWorkspaceId;
    if (currentActive) {
      get().loadWorkspaceData(currentActive);
    }
  },

  // Tasks CRUD with Archiving & Subtasks
  createTask: (taskPartial) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskPartial.title || 'Untitled Issue',
      status: taskPartial.status || 'Todo',
      priority: taskPartial.priority || 'Medium',
      label: taskPartial.label || 'Engineering',
      description: taskPartial.description || '',
      assignee: taskPartial.assignee || 'Alex Chen',
      dueDate: taskPartial.dueDate || new Date().toISOString().split('T')[0],
      ...(taskPartial as any) // support subtasks / comments / archived
    };
    if (!newTask.subtasks) newTask.subtasks = [];
    if (!(newTask as any).comments) (newTask as any).comments = [];
    (newTask as any).archived = false;

    set(state => ({ tasks: [...state.tasks, newTask] }));
    get().saveWorkspaceData();
    get().addNotification('New Task Added', `"${newTask.title}" initiated in workspace backlog.`, 'task');
  },

  updateTask: (updatedTask) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t)
    }));
    get().saveWorkspaceData();
  },

  reorderTasks: (newTasks) => {
    set({ tasks: newTasks });
    get().saveWorkspaceData();
  },

  setTaskStatus: (taskId, status) => {
    set(state => {
      let taskNameObj = '';
      const updated = state.tasks.map(t => {
        if (t.id === taskId) {
          taskNameObj = t.title;
          return { ...t, status };
        }
        return t;
      });
      if (taskNameObj && status === 'Done') {
        get().addNotification('Task Completed', `🎉 "${taskNameObj}" has been marked Done!`, 'task');
      }
      return { tasks: updated };
    });
    get().saveWorkspaceData();
  },

  archiveTask: (taskId) => {
    set(state => {
      const item = state.tasks.find(t => t.id === taskId);
      const title = item ? item.title : 'Task';
      get().addNotification('Task Archived', `"${title}" moved to archive registry.`, 'task');
      return {
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, archived: true } : t)
      };
    });
    get().saveWorkspaceData();
  },

  restoreTask: (taskId) => {
    set(state => {
      const item = state.tasks.find(t => t.id === taskId);
      const title = item ? item.title : 'Task';
      get().addNotification('Task Restored', `"${title}" reinstated on Kanban board.`, 'task');
      return {
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, archived: false } : t)
      };
    });
    get().saveWorkspaceData();
  },

  purgeTask: (taskId) => {
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== taskId)
    }));
    get().saveWorkspaceData();
    get().addNotification('Task Purged', 'Issue coordinate strictly purged from cloud memory.', 'task');
  },

  toggleSubtask: (taskId, subtaskId) => {
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          const subs = (t as any).subtasks || [];
          return {
            ...t,
            subtasks: subs.map((s: any) => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
          };
        }
        return t;
      })
    }));
    get().saveWorkspaceData();
  },

  addSubtask: (taskId, title) => {
    const sub = { id: `sub-${Date.now()}`, title, completed: false };
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          const subs = (t as any).subtasks || [];
          return { ...t, subtasks: [...subs, sub] };
        }
        return t;
      })
    }));
    get().saveWorkspaceData();
  },

  deleteSubtask: (taskId, subtaskId) => {
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          const subs = (t as any).subtasks || [];
          return { ...t, subtasks: subs.filter((s: any) => s.id !== subtaskId) };
        }
        return t;
      })
    }));
    get().saveWorkspaceData();
  },

  addTaskComment: (taskId, text, sender = 'You') => {
    const comment = { id: `com-${Date.now()}`, text, sender, timestamp: 'Just now' };
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id === taskId) {
          const comms = (t as any).comments || [];
          return { ...t, comments: [...comms, comment] };
        }
        return t;
      })
    }));
    get().saveWorkspaceData();
  },

  // Docs Wiki CRUD
  createDoc: (docPartial) => {
    const newDoc: Doc = {
      id: `doc-${Date.now()}`,
      title: docPartial.title || 'Untitled Spec Document',
      category: docPartial.category || 'Specification',
      content: docPartial.content || `# ${docPartial.title || 'Untitled Specification'}\n\nStart modeling deep sprint coordinates.`,
      updatedAt: 'Just Now'
    };
    set(state => ({ docs: [...state.docs, newDoc], activeDocId: newDoc.id }));
    get().saveWorkspaceData();
  },

  updateDoc: (id, updates) => {
    set(state => ({
      docs: state.docs.map(d => d.id === id ? { ...d, ...updates, updatedAt: 'Just Now' } : d)
    }));
    get().saveWorkspaceData();
  },

  deleteDoc: (id) => {
    set(state => {
      const remaining = state.docs.filter(d => d.id !== id);
      const nextActive = remaining.length > 0 ? remaining[0].id : '';
      return { docs: remaining, activeDocId: nextActive };
    });
    get().saveWorkspaceData();
  },

  // Chat/Channel Logic
  createChannel: (name, category, role) => {
    const formattedName = name.trim().toLowerCase().replace(/\s+/g, '-');
    const newCh: Channel = {
      id: `ch-dyn-${Date.now()}`,
      name: formattedName,
      category,
      unreadCount: 0,
      role
    };
    set(state => ({
      channels: [...state.channels, newCh],
      activeChannelId: newCh.id
    }));
    get().saveWorkspaceData();
  },

  sendMessage: (channelId, text, sender = 'You', role = 'SaaS Facilitator') => {
    const newMsg: ChannelMessage = {
      id: `msg-${Date.now()}`,
      sender,
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: []
    };
    set(state => {
      const chMessages = state.messages[channelId] || [];
      const updatedMessages = {
        ...state.messages,
        [channelId]: [...chMessages, newMsg]
      };
      // Increment unread on other channels
      const updatedChannels = state.channels.map(c => 
        c.id === channelId || get().activeChannelId === channelId
          ? { ...c, unreadCount: 0 }
          : { ...c, unreadCount: c.unreadCount + 1 }
      );
      return { messages: updatedMessages, channels: updatedChannels };
    });
    get().saveWorkspaceData();

    // Trigger notification if sent by someone else
    if (sender !== 'You') {
      get().addNotification(`Teammate Message in #${sender}`, text.substring(0, 60), 'chat');
    }
  },

  addReaction: (channelId, messageId, emoji, user = 'You') => {
    set(state => {
      const chMsgs = state.messages[channelId] || [];
      const updated = chMsgs.map(m => {
        if (m.id === messageId) {
          const reactions = m.reactions ? [...m.reactions] : [];
          const matchIdx = reactions.findIndex(r => r.emoji === emoji);
          if (matchIdx >= 0) {
            const reaction = reactions[matchIdx];
            const alreadyReacted = reaction.users.includes(user);
            let nextUsers = alreadyReacted 
              ? reaction.users.filter(u => u !== user)
              : [...reaction.users, user];
            
            if (nextUsers.length === 0) {
              reactions.splice(matchIdx, 1);
            } else {
              reactions[matchIdx] = { ...reaction, count: nextUsers.length, users: nextUsers };
            }
          } else {
            reactions.push({ emoji, count: 1, users: [user] });
          }
          return { ...m, reactions };
        }
        return m;
      });
      return {
        messages: { ...state.messages, [channelId]: updated }
      };
    });
    get().saveWorkspaceData();
  },

  togglePinMessage: (channelId, messageId) => {
    set(state => {
      const chMsgs = state.messages[channelId] || [];
      const updated = chMsgs.map(m => {
        if (m.id === messageId) {
          return { ...m, pinned: !(m as any).pinned };
        }
        return m;
      });
      return {
        messages: { ...state.messages, [channelId]: updated }
      };
    });
    get().saveWorkspaceData();
  },

  clearUnreadCount: (channelId) => {
    set(state => ({
      channels: state.channels.map(c => c.id === channelId ? { ...c, unreadCount: 0 } : c)
    }));
  },

  // Habits
  createHabit: (title) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title,
      streak: 0,
      completedToday: false
    };
    set(state => ({ habits: [...state.habits, newHabit] }));
    get().saveWorkspaceData();
    get().addNotification('Habit Initiated', `Start maintaining streak for "${title}"`, 'habit');
  },

  toggleHabitComplete: (id) => {
    set(state => {
      const updated = state.habits.map(h => {
        if (h.id === id) {
          const nextCompleted = !h.completedToday;
          const streakDiff = nextCompleted ? 1 : -1;
          return {
            ...h,
            completedToday: nextCompleted,
            streak: Math.max(0, h.streak + streakDiff)
          };
        }
        return h;
      });
      return { habits: updated };
    });
    get().saveWorkspaceData();
  },

  deleteHabit: (id) => {
    set(state => ({ habits: state.habits.filter(h => h.id !== id) }));
    get().saveWorkspaceData();
  },

  // Cloud Files
  addCloudFile: (filePart) => {
    const sizeStr = `${(Math.random() * 8 + 0.5).toFixed(1)} MB`;
    const newFile: CloudFile = {
      id: `file-${Date.now()}`,
      name: filePart.name || 'document_draft.pdf',
      size: filePart.size || sizeStr,
      type: filePart.type || 'PDF Document',
      category: filePart.category || 'Asset',
      tag: filePart.tag || 'Project Draft',
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    set(state => ({ cloudFiles: [...state.cloudFiles, newFile] }));
    get().saveWorkspaceData();
    get().addNotification('File Uploaded', `Successfully uploaded "${newFile.name}" to cloud memory.`, 'info');
  },

  deleteCloudFile: (id) => {
    set(state => ({ cloudFiles: state.cloudFiles.filter(f => f.id !== id) }));
    get().saveWorkspaceData();
  },

  // Notifications
  addNotification: (title, body, type) => {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      body,
      type,
      read: false,
      time: 'Just now'
    };
    set(state => ({ notifications: [notif, ...state.notifications].slice(0, 30) }));
  },

  markNotificationAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  // AI Assistant Engine
  sendAiMessage: async (userMessage) => {
    if (!userMessage.trim()) return;
    set(state => ({
      aiChatHistory: [...state.aiChatHistory, { sender: 'user', text: userMessage }],
      isAiTyping: true
    }));

    const lowercaseQuery = userMessage.toLowerCase().trim();

    // Context aggregation
    const activeTasksList = get().tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority }));
    const wikiTitles = get().docs.map(d => d.title);
    const channelsList = get().channels.map(c => c.name);

    // Natural Language Quick Create (Task)
    if (lowercaseQuery.startsWith('add task') || lowercaseQuery.startsWith('create task')) {
      const cleanTitle = userMessage.replace(/^(add task|create task)\s+/i, '').trim();
      const priority = lowercaseQuery.includes('priority high') ? 'High' : lowercaseQuery.includes('priority low') ? 'Low' : 'Medium';
      const status = lowercaseQuery.includes('status done') ? 'Done' : lowercaseQuery.includes('status progress') ? 'InProgress' : 'Todo';
      const parsedTitle = cleanTitle.split(' priority ')[0].split(' status ')[0];

      get().createTask({
        title: parsedTitle || 'New Task Spec',
        status,
        priority,
        description: 'Auto-scaffolded via conversational quick action instruction.'
      });

      set(state => ({
        aiChatHistory: [
          ...state.aiChatHistory,
          { sender: 'assistant', text: `✅ **Task created!** Installed **"${parsedTitle}"** inside the **${status}** column with **${priority}** priority.` }
        ],
        isAiTyping: false
      }));
      return;
    }

    // Natural Language Quick Create (Wiki)
    if (lowercaseQuery.startsWith('add doc') || lowercaseQuery.startsWith('create doc')) {
      const cleanTitle = userMessage.replace(/^(add doc|create doc)\s+/i, '').trim();
      get().createDoc({
        title: cleanTitle || 'Conversational Blueprint',
        content: `# New Generated Blueprint Spec\n\nScaffolded in live sandbox environment via quick assistant prompt.`
      });

      set(state => ({
        aiChatHistory: [
          ...state.aiChatHistory,
          { sender: 'assistant', text: `📝 **Wiki Document created!** Scaffolded notebook **"${cleanTitle || 'Conversational Blueprint'}"** draft.` }
        ],
        isAiTyping: false
      }));
      return;
    }

    // Server-Side Gemini fetch proxy
    try {
      const systemContextMessage = `[WORKSPACE OS ACTIVE CONTEXT]: 
Active Workspace Tasks: ${JSON.stringify(activeTasksList.slice(0, 10))};
Wiki Documents: ${JSON.stringify(wikiTitles)};
Channels: ${JSON.stringify(channelsList)}.
Instruction query is: ${userMessage}`;

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: systemContextMessage,
          history: get().aiChatHistory.slice(-8) // send last few history objects
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      set(state => ({
        aiChatHistory: [...state.aiChatHistory, { sender: 'assistant', text: data.text || 'Process mapped.' }],
        isAiTyping: false
      }));
    } catch (e) {
      setTimeout(() => {
        set(state => ({
          aiChatHistory: [
            ...state.aiChatHistory,
            { sender: 'assistant', text: `I have analyzed your sprint metrics. You currently have **${activeTasksList.filter(t => t.status !== 'Done').length}** remaining items. Consider tackling the high-priority coordinates to maintain optimal velocity.` }
          ],
          isAiTyping: false
        }));
      }, 800);
    }
  },

  clearAiHistory: () => {
    set({
      aiChatHistory: [
        { sender: 'assistant', text: '⚡ Chat thread cleared. Give me high-priority target sprint breakdowns!' }
      ]
    });
  },

  // Load Presets & Persistence
  loadWorkspaceData: (workspaceId) => {
    const savedData = localStorage.getItem(`workspace_os_${workspaceId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        set({
          tasks: parsed.tasks || [],
          docs: parsed.docs || [],
          channels: parsed.channels || [],
          messages: parsed.messages || {},
          habits: parsed.habits || [],
          cloudFiles: parsed.cloudFiles || []
        });
        if (parsed.channels && parsed.channels.length > 0) {
          set({ activeChannelId: parsed.channels[0].id });
        }
        if (parsed.docs && parsed.docs.length > 0) {
          set({ activeDocId: parsed.docs[0].id });
        }
        return;
      } catch (e) {}
    }

    // Default Fallback Load
    let presetTasks: Task[] = [];
    let presetDocs: Doc[] = [];
    let presetChannels: Channel[] = [];
    let presetMessages: Record<string, ChannelMessage[]> = {};
    let presetHabits: Habit[] = [];
    let presetFiles: CloudFile[] = [];

    if (workspaceId === 'ws-delta') {
      presetTasks = [
        { id: 't1', title: 'Refactor secure proxy for Gemini API authentication', status: 'Done', priority: 'High', label: 'Engineering', description: 'Migrate active clients back to secure Express system on port 3000 to defend secret credentials.', assignee: 'Elena Rostova', dueDate: '2026-05-24', subtasks: [{ id: 'sub-1', title: 'Verify Express Port Configs', completed: true }] },
        { id: 't2', title: 'Compile beautiful fluid SVG graphs for custom velocity logs', status: 'InProgress', priority: 'High', label: 'Design', description: 'Produce responsive SVG coordinate heatmaps that adapt to viewport and support hover statistics.', assignee: 'Marcus Vance', dueDate: '2026-05-28', subtasks: [{ id: 'sub-2', title: 'Establish color palette', completed: true }, { id: 'sub-3', title: 'Scale responsive bounds', completed: false }] },
        { id: 't3', title: 'Build interactive Pomodoro workspace synthesizer', status: 'Todo', priority: 'Medium', label: 'Engineering', description: 'Program custom AudioContext white-noise filters & Low Frequency Oscillators for deep alpha-wave concentration.', assignee: 'Elena Rostova', dueDate: '2026-06-02' },
        { id: 't4', title: 'Construct full Notion slash-command autocomplete modal', status: 'Backlog', priority: 'Low', label: 'Marketing', description: 'Inject popover selectors when key string "/" triggers standard database inputs.', assignee: 'Alex Chen', dueDate: '2026-06-10' }
      ];
      presetDocs = [
        { id: 'doc-standards', title: 'Engineering & Code Standards', content: '# Architectural Engineering Blueprint\n\nWelcome to the sovereign code workspace registry.\n\n### Core Directives:\n- Keep state strictly reactive.\n- Ensure express proxies are thoroughly checked.\n- Maintain absolute type constraints.', category: 'Specification', updatedAt: 'May 22, 2026' },
        { id: 'doc-architecture', title: 'Secure WebSocket Server Spec', content: '# WebSocket Infrastructure Blueprint\n\nEnsure client sessions bridge audio directly with verified token controls.', category: 'Overview', updatedAt: 'May 19, 2026' }
      ];
      presetChannels = [
        { id: 'ch-alpha', name: 'alpha-synergy', category: 'Channels', unreadCount: 2 },
        { id: 'ch-dev', name: 'dev-architecture', category: 'Channels', unreadCount: 0 },
        { id: 'dm-marcus', name: 'Marcus Vance', category: 'Direct Messages', role: 'Lead UX Designer', unreadCount: 0 },
        { id: 'dm-elena', name: 'Elena Rostova', category: 'Direct Messages', role: 'Staff API Architect', unreadCount: 0 }
      ];
      presetMessages = {
        'ch-alpha': [
          { id: 'm1', sender: 'Elena Rostova', role: 'Staff API Architect', text: 'I completed running safety tests on the express proxy router. Port boundaries look robust.', timeAgo: '2 hours ago', reactions: [{ emoji: '👍', count: 2, users: ['Marcus', 'Alex'] }] },
          { id: 'm2', sender: 'Marcus Vance', role: 'Lead UX Designer', text: 'Stunning job! Let us coordinate with the visual vector system tests next. Theme settings look super crisp.', timeAgo: '30 mins ago', reactions: [{ emoji: '🔥', count: 3, users: ['Elena', 'Alex', 'Self'] }] }
        ],
        'ch-dev': [
          { id: 'm3', sender: 'Elena Rostova', role: 'Staff API Architect', text: 'We need to deprecate older endpoints to guarantee zero key exposure to clients. Everything is routed to /api helper paths now.', timeAgo: '4 hours ago', reactions: [] }
        ],
        'dm-marcus': [
          { id: 'm4', sender: 'Marcus Vance', role: 'Lead UX Designer', text: 'Hey, did you make sure to test the SVG graph scales on smaller devices?', timeAgo: 'Yesterday', reactions: [{ emoji: '👀', count: 1, users: ['Self'] }] }
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
        { id: 'doc-kickoff', title: 'Product Launch TEASER Speeches', content: '# Product Synergy Roadmap\n\nLaunch with focus on absolute performance.', category: 'Guide', updatedAt: 'May 21, 2026' }
      ];
      presetChannels = [
        { id: 'ch-design', name: 'creative-feedback', category: 'Channels', unreadCount: 1 }
      ];
      presetMessages = {
        'ch-design': [
          { id: 'mc1', sender: 'Alex Chen', role: 'SaaS Facilitator', text: 'Let us publish the interactive preview link on Twitter!', timeAgo: '1 hour ago', reactions: [] }
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
        { id: 'p1', title: 'Draft standard personal budget allocation spreadsheet', status: 'Todo', priority: 'Medium', label: 'Research', description: 'Consolidate personal cloud records.', assignee: 'Alex Chen', dueDate: '2026-05-29' }
      ];
      presetDocs = [
        { id: 'doc-journal', title: 'Daily Epiphanies & Logbook', content: '# Reflections\n\nMaintain focus.', category: 'Meeting Minutes', updatedAt: 'May 22, 2026' }
      ];
      presetChannels = [
        { id: 'ch-personal', name: 'life-schedule', category: 'Channels', unreadCount: 0 }
      ];
      presetMessages = {
        'ch-personal': [
          { id: 'mp1', sender: 'Alex Chen', role: 'SaaS Facilitator', text: 'This space tracks the personal schedule routines.', timeAgo: 'Draft', reactions: [] }
        ]
      };
      presetHabits = [
        { id: 'h6', title: 'Drink 3L Water', streak: 22, completedToday: true },
        { id: 'h7', title: '15 Minutes Calm Breathing', streak: 1, completedToday: false }
      ];
      presetFiles = [];
    }

    set({
      tasks: presetTasks,
      docs: presetDocs,
      channels: presetChannels,
      messages: presetMessages,
      habits: presetHabits,
      cloudFiles: presetFiles,
      activeChannelId: presetChannels.length > 0 ? presetChannels[0].id : '',
      activeDocId: presetDocs.length > 0 ? presetDocs[0].id : ''
    });
  },

  saveWorkspaceData: () => {
    const activeId = get().activeWorkspaceId;
    if (!activeId) return;
    const { tasks, docs, channels, messages, habits, cloudFiles } = get();
    const stateToSave = { tasks, docs, channels, messages, habits, cloudFiles };
    localStorage.setItem(`workspace_os_${activeId}`, JSON.stringify(stateToSave));
  }
}));
