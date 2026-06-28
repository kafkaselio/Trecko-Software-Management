/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'Backlog' | 'Todo' | 'InProgress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  label: string;
  description: string;
  assignee: string;
  dueDate: string;
  archived?: boolean;
  subtasks?: SubTask[];
  comments?: TaskComment[];
  createdAt?: string;
}

export interface Doc {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  folder?: string;
  section?: string;
  box?: string;
  collection?: string;
}

export interface ChannelMessage {
  id: string;
  sender: string;
  role: string;
  text: string;
  timestamp?: string; // Real timestamp string e.g. "12:14 PM"
  timeAgo?: string;
  pinned?: boolean;
  reactions: { emoji: string; count: number; users: string[] }[];
}

export interface Channel {
  id: string;
  name: string;
  category: 'Channels' | 'Direct Messages';
  role?: string;
  unreadCount: number;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
}

export interface CloudFile {
  id: string;
  name: string;
  size: string;
  type: string;
  category: 'Document' | 'Design' | 'Code' | 'Asset';
  tag: string;
  dateAdded: string;
}

export interface Workspace {
  id: string;
  name: string;
  code: string;
  description: string;
  accentClass: string;
}

export interface Theme {
  id: string;
  name: string;
  bgClass: string;
  cardClass: string;
  borderClass: string;
  textClass: string;
  mutedClass: string;
  accentClass: string;
  gradientFrom: string;
}

export interface TrashBinItem {
  id: string;
  type: 'note' | 'task' | 'file' | 'contact' | 'habit';
  title: string;
  originalData: any;
  deletedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'invited';
}

