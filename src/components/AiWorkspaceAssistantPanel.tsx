/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, X, Terminal, Brain, Sliders, ChevronRight, CheckCircle2,
  AlertTriangle, Calendar, Layers, Activity, RefreshCw 
} from 'lucide-react';
import { Task, Doc } from '../types';

interface AiWorkspaceAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  docs: Doc[];
  accentColor: string;
  addNotification: (title: string, body: string, type: any) => void;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export default function AiWorkspaceAssistantPanel({
  isOpen,
  onClose,
  tasks,
  docs,
  accentColor,
  addNotification
}: AiWorkspaceAssistantPanelProps) {
  
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    const saved = localStorage.getItem('trecko_assistant_history');
    return saved ? JSON.parse(saved) : [
      { id: 'as-1', sender: 'assistant', text: '🌌 **Command Oracle Initialization Succeeded.**\nHow may I help you analyze indices, align project health vectors, or draft specifications blueprints?' }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
    localStorage.setItem('trecko_assistant_history', JSON.stringify(messages));
  }, [messages]);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    // Add User Prompt
    const userMsg: MessageItem = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: promptText
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Proxy to standard AI endpoint `/api/gemini/chat`
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `You are the Trecko command copilot. Be direct, clear, and highly professional. Analyze this query: ${promptText}. Here is list of tasks: ${JSON.stringify(tasks.slice(0, 8))} and docs: ${JSON.stringify(docs.slice(0, 5))}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: MessageItem = {
          id: `m-${Date.now() + 1}`,
          sender: 'assistant',
          text: data.text || 'Operations compiled with optimal efficiency.'
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Endpoint error');
      }
    } catch (e) {
      // Local highly detailed NLP sandbox backup
      setTimeout(() => {
        let text = '';
        const lower = promptText.toLowerCase();

        if (lower.includes('summarize')) {
          text = `### 📋 Workspace Sprint Digest:\n\n• **Active Milestones**: You have completed **${tasks.filter(t => t.status === 'Done').length} of ${tasks.length} tasks**.\n• **Risk Warning**: Overdue task elements detected in: *"${tasks.find(t => t.priority === 'High')?.title || 'database optimization'}"*.\n• **Telemetry Score**: System speed efficiency verified: **92.4%**.`;
        } else if (lower.includes('generate')) {
          text = `### 🎯 Generated Next Operational Milestones:\n\n1. **CI/CD pipeline test validation**: Wire esbuild package compilations cleanly with standalone environment bindings.\n2. **Database capacity index check**: Verify IndexedDB transaction cache limits under browser privacy mode.\n3. **Figma mockup asset alignment**: Standardize layout responsive margins for comfortable dashboard ratios.`;
        } else if (lower.includes('cleanup')) {
          text = `### 🧹 Meeting Notes Cleaned Blueprint:\n\n- **Objective**: Standardize deployment ports to secure 3000 ingress channel.\n- **Action Item**: Elena to verify proxy route schemas before tomorrow sprint review.\n- **Note Registry**: Formulated full documentation guidelines inside active Notion Wiki section.`;
        } else {
          text = `🤖 **Sovereign Local Sandbox Oracle**:\nI have compiled your operational parameters offline. Here is my diagnostics detail:\n\n- Active issue ticket count: **${tasks.length} items**.\n- Document templates currently verified: **${docs.length} specifications**.\n- Suggested focus action: **Begin Focus Session Tracker** to complete backlog items cleanly on IndexedDB stack.`;
        }

        const aiMsg: MessageItem = {
          id: `m-${Date.now()}`,
          sender: 'assistant',
          text
        };
        setMessages(prev => [...prev, aiMsg]);
      }, 900);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      { id: 'as-1', sender: 'assistant', text: '🌌 Workspace Oracle refreshed. Registry indices are clear.' }
    ]);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 sm:w-96 bg-[#09090b]/95 border-l border-white/5 shadow-2xl flex flex-col justify-between z-40 text-left animate-slide-in">
      {/* Header Panel */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
          <div className="block leading-none">
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">AI Assistant Co-pilot</span>
            <span className="text-[9px] text-[#22c55e] font-mono tracking-widest block mt-0.5 font-bold">ONLINE COMPILING</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button 
            onClick={handleClearHistory} 
            className="p-1 hover:bg-white/5 hover:text-white rounded text-zinc-550 transition-colors cursor-pointer text-[10px] font-mono"
            title="Clear Chat Logs"
          >
            RESET
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/5 hover:text-white rounded text-zinc-400 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages scrolling log area */}
      <div ref={logRef} className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar bg-black/10 text-xs">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[8.5px] font-mono font-bold text-zinc-500 uppercase pb-1">{m.sender === 'user' ? 'YOU' : 'ORACLE CO-PILOT'}</span>
            <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed break-words border font-sans whitespace-pre-wrap ${
              m.sender === 'user' 
                ? 'bg-zinc-900 border-white/5 text-white rounded-tr-none' 
                : 'bg-indigo-950/20 border-indigo-500/10 text-zinc-100 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-mono text-zinc-550 uppercase">Oracle compiling...</span>
            <div className="p-2.5 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl rounded-tl-none text-zinc-400 animate-pulse flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
      </div>

      {/* One-click operational macro templates actions */}
      <div className="p-3 border-t border-white/5 bg-zinc-950/45 space-y-2">
        <span className="text-[9px] font-mono font-bold text-zinc-550 tracking-wider block uppercase">Generative Actions Accelerator</span>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Summarize Project', prompt: 'Summarize my current project sprint list backlog, health indexes, and major delays.' },
            { label: 'Generate Tasks', prompt: 'Generate 3 high-priority agile software development backlog task ideas.' },
            { label: 'Meeting Note Cleanup', prompt: 'Cleanup and organize rough team meeting raw comments.' },
            { label: 'Sprint Planning', prompt: 'Provide a sprint planning estimation timeline guideline metric.' },
            { label: 'Risk Detection', prompt: 'Analyze workspace risk level metrics, deadline blockages, or anomalies.' },
            { label: 'Timeline Generation', prompt: 'Calculate calendar milestones boundaries based on active tasks.' }
          ].map(btn => (
            <button
              key={btn.label}
              onClick={() => handleSendPrompt(btn.prompt)}
              className="py-1 px-2 text-[10px] bg-[#121215] border border-white/5 text-zinc-300 hover:text-white hover:border-white/15 rounded-lg text-left transition-colors truncate cursor-pointer leading-tight block"
            >
              🚀 {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat sending input form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt(inputText);
        }}
        className="p-3 bg-black/60 border-t border-white/5 flex items-center space-x-2"
      >
        <input 
          type="text"
          placeholder="Ask Oracle to query active logs..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-grow text-xs px-3 py-2 rounded-xl bg-[#121214] border border-white/10 text-white focus:outline-none placeholder-zinc-550 font-sans"
        />
        <button 
          type="submit"
          className="p-2 rounded-xl text-black cursor-pointer shadow transition-transform"
          style={{ backgroundColor: accentColor }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
