import React, { useState } from 'react';
import { X, Check, Trash2, Plus, CornerDownRight, Square, CheckSquare, Archive } from 'lucide-react';
import { Task } from '../types';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Comment {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
}

// Extend default Task interface to include subtasks & comments
interface ExtendedTask extends Task {
  subtasks?: SubTask[];
  comments?: Comment[];
}

interface TaskModalProps {
  task: ExtendedTask | null;
  onClose: () => void;
  onSave: (task: ExtendedTask) => void;
  onDelete: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
}

export default function TaskModal({
  task,
  onClose,
  onSave,
  onDelete,
  onArchive,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [status, setStatus] = useState<Task['status']>(task?.status || 'Todo');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'Medium');
  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [description, setDescription] = useState(task?.description || '');
  const [label, setLabel] = useState(task?.label || 'Feature');
  const [subtasks, setSubtasks] = useState<SubTask[]>(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Real task discussion comments system
  const [comments, setComments] = useState<Comment[]>(task?.comments || []);
  const [newCommentText, setNewCommentText] = useState('');

  if (!task) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setSubtasks(prev => [...prev, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(prev => prev.map(s => s.id === subId ? { ...s, completed: !s.completed } : s));
  };

  const handleDeleteSubtask = (subId: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== subId));
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const newCom: Comment = {
      id: `com-${Date.now()}`,
      text: newCommentText.trim(),
      sender: 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setComments(prev => [...prev, newCom]);
    setNewCommentText('');
  };

  const handleSaveWorkspaceCoordinates = () => {
    onSave({
      ...task,
      title,
      status,
      priority,
      assignee,
      dueDate,
      description,
      label,
      subtasks, // Save updated subtasks list
      comments, // Save updated comments list
    });
  };

  return (
    <div className="fixed inset-0 bg-[#000000bf] backdrop-blur-xs flex items-center justify-end z-50 animate-fade-in text-xs text-[#EDEDED] font-sans">
      <div className="w-full max-w-md h-full bg-[#0d0d0f] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl space-y-4">
        
        <div className="space-y-5 flex-grow overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-white/45 font-mono font-bold uppercase">
              Adjusting Item: {task.id}
            </span>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-white/30 block">Issue Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveWorkspaceCoordinates();
                }
              }}
              className="w-full h-9 px-3.5 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-indigo-500 font-semibold"
              placeholder="Workspace task specification title"
            />
          </div>

          {/* Category Label */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-white/30 block font-sans">Category Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveWorkspaceCoordinates();
                }
              }}
              className="w-full h-8 px-3.5 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Feature, Bug, Refractor, Hotfix"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/30 block">Pipeline Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-8 px-2 rounded-xl border border-white/10 bg-[#0d0d0f] text-white outline-none focus:border-indigo-500"
              >
                <option value="Backlog">Backlog</option>
                <option value="Todo">Todo</option>
                <option value="InProgress">InProgress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/30 block">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full h-8 px-2 rounded-xl border border-white/10 bg-[#0d0d0f] text-white outline-none focus:border-indigo-500"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/30 block">Collaborator Owner</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveWorkspaceCoordinates();
                  }
                }}
                className="w-full h-8 px-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-indigo-500"
                placeholder="Owner code name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/30 block">Target Due</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveWorkspaceCoordinates();
                  }
                }}
                className="w-full h-8 px-3 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-indigo-500 text-white/50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-white/30 block">Description Brief</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-20 p-3 rounded-xl border border-white/10 bg-white/5 font-mono text-[11px] focus:outline-none focus:border-indigo-500 text-white/80"
              placeholder="Task instructions and guidelines"
            />
          </div>

          {/* REAL SUBTASKS SYSTEM SECTION */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-white/30 flex items-center justify-between">
              <span>Subtask Milestones ({subtasks.filter(s => s.completed).length}/{subtasks.length})</span>
            </label>

            {/* List existing subtasks */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {subtasks.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 group hover:bg-white/[0.02] transition-colors">
                  <button 
                    onClick={() => handleToggleSubtask(sub.id)}
                    className="flex items-center space-x-2 text-left flex-grow focus:outline-none"
                  >
                    {sub.completed ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-white/30 shrink-0" />
                    )}
                    <span className={`text-[11px] ${sub.completed ? 'line-through text-white/30' : 'text-white/80'}`}>
                      {sub.title}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Subtask input block */}
            <div className="flex space-x-2 pt-1">
              <input
                type="text"
                placeholder="Add sub-task guideline..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-grow h-8 px-3 rounded-xl border border-white/10 bg-white/5 text-[11px]"
              />
              <button
                onClick={handleAddSubtask}
                className="h-8 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-colors"
              >
                Add
              </button>
            </div>
            {/* Real task discussion comments section */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-white/30 block">Discussion Feed ({comments.length})</label>
              
              <div className="space-y-2 max-h-36 overflow-y-auto pr-0.5">
                {comments.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic text-center py-2">No engineering updates logged for this issue coordinate.</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="p-2 rounded-xl bg-white/[0.01] border border-white/5 space-y-1">
                      <div className="flex justify-between items-center text-[8.5px] font-mono text-white/30">
                        <span className="font-bold text-indigo-400">{c.sender}</span>
                        <span>{c.timestamp}</span>
                      </div>
                      <p className="text-[10.5px] text-white/80 leading-relaxed break-words">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Insert discussion comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  className="flex-grow h-8 px-3 rounded-xl border border-white/10 bg-white/5 text-[11px]"
                />
                <button
                  onClick={handleAddComment}
                  className="h-8 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold text-[10px] transition-colors"
                >
                  Comment
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Buttons footer */}
        <div className="border-t border-white/5 pt-4 flex space-x-2">
          {status === 'Done' ? (
            <button
              onClick={() => {
                if (onArchive) {
                  onArchive(task.id);
                } else {
                  onDelete(task.id); // fallback
                }
              }}
              className="py-2 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/15 font-bold rounded-xl w-1/3 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Archive className="w-4 h-4" />
              <span>Archive</span>
            </button>
          ) : (
            <button
              onClick={() => onDelete(task.id)}
              className="py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 font-bold rounded-xl w-1/3 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge</span>
            </button>
          )}
          <button
            onClick={handleSaveWorkspaceCoordinates}
            className="py-2 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl w-2/3 flex items-center justify-center space-x-1.5 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Save properties</span>
          </button>
        </div>

      </div>
    </div>
  );
}
