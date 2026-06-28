import React, { useState, useEffect } from 'react';
import { Hash, MessageSquare, Send, Users, Paperclip, Sparkles, Plus, Pin, Smile } from 'lucide-react';
import { Channel, ChannelMessage, Theme } from '../types';

interface TeammateChatProps {
  channels: Channel[];
  onSelectChannelId: (id: string) => void;
  activeChannelId: string;
  messages: { [channelId: string]: ChannelMessage[] };
  onSendMessage: (text: string) => void;
  onAddReaction: (msgId: string, emoji: string) => void;
  onTogglePinMessage: (msgId: string) => void;
  onCreateChannel: (name: string, category: 'Channels' | 'Direct Messages') => void;
  theme: Theme;
}

export default function TeammateChat({
  channels,
  onSelectChannelId,
  activeChannelId,
  messages,
  onSendMessage,
  onAddReaction,
  onTogglePinMessage,
  onCreateChannel,
  theme,
}: TeammateChatProps) {
  const [chatInput, setChatInput] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [channelCategory, setChannelCategory] = useState<'Channels' | 'Direct Messages'>('Channels');

  const currentChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const currentMessages = currentChannel ? (messages[currentChannel.id] || []) : [];
  const pinnedMessages = currentMessages.filter(m => (m as any).pinned);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  const handleAddChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    let formattedName = newChannelName.trim().toLowerCase().replace(/\s+/g, '-');
    onCreateChannel(formattedName, channelCategory);
    setNewChannelName('');
    setIsCreatingChannel(false);
  };

  const activeChannelMessages = messages[activeChannelId] || [];

  return (
    <div className="h-[calc(100vh-175px)] flex border border-white/5 rounded-2xl overflow-hidden bg-[#0a0a0c]">
      
      {/* 1. Left Chat Channel Selector Panel */}
      <aside className="w-56 border-r border-white/5 bg-[#0C0C0C]/50 flex flex-col shrink-0 text-xs text-[#a1a1aa]">
        
        {/* Creator Channel Selector */}
        <div className="p-4 border-b border-white/5 flex flex-col gap-2">
          {isCreatingChannel ? (
            <form onSubmit={handleAddChannelSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="channel-name..."
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="w-full text-[10px] h-7 px-2 border border-white/10 rounded-md bg-white/5 text-white focus:outline-none"
                autoFocus
              />
              <div className="flex gap-1">
                <select
                  value={channelCategory}
                  onChange={(e: any) => setChannelCategory(e.target.value)}
                  className="w-1/2 text-[9px] h-6 bg-[#0c0c0c] border border-white/10 rounded-md text-white px-1"
                >
                  <option value="Channels">Channel</option>
                  <option value="Direct Messages">DM</option>
                </select>
                <button type="submit" className="w-1/4 h-6 text-[10px] bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-500">+</button>
                <button type="button" onClick={() => setIsCreatingChannel(false)} className="w-1/4 h-6 text-[10px] bg-white/5 rounded-md hover:bg-white/10">✕</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingChannel(true)}
              className="w-full py-1.5 px-3 border border-dashed border-white/10 hover:border-white/20 hover:text-white rounded-lg flex items-center justify-center space-x-1 font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Channel</span>
            </button>
          )}
        </div>

        {/* Regular Channels List */}
        <div className="p-3 flex-grow overflow-y-auto space-y-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 px-2 py-1 flex items-center justify-between">
              <span>Channels</span>
              <Hash className="w-3 h-3 text-white/20" />
            </p>
            <div className="space-y-0.5 mt-1">
              {channels.filter(c => c.category === 'Channels').map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelectChannelId(c.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors group ${
                    activeChannelId === c.id ? 'bg-white/5 text-white font-bold' : 'hover:bg-white/[0.02] text-white/50'
                  }`}
                >
                  <span className="flex items-center space-x-1.5 truncate">
                    <Hash className="w-3.5 h-3.5 text-white/20 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* DMs List */}
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 px-2 py-1 flex items-center justify-between">
              <span>Direct Messages</span>
              <Users className="w-3 h-3 text-white/20" />
            </p>
            <div className="space-y-0.5 mt-1">
              {channels.filter(c => c.category === 'Direct Messages').map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelectChannelId(c.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                    activeChannelId === c.id ? 'bg-white/5 text-white font-bold' : 'hover:bg-white/[0.02] text-white/50'
                  }`}
                >
                  <span className="flex items-center space-x-1.5 truncate">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
                    <span className="truncate">{c.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Chat Feed Frame */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#0d0d10]">
        
        {/* Header Info */}
        <div className="h-14 border-b border-white/5 px-5 flex items-center justify-between shrink-0 bg-[#0c0c0e]/30">
          <div className="truncate">
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Hash className="w-4 h-4 text-white/40" />
              <span>{currentChannel ? currentChannel.name : 'synergy-kickoff'}</span>
            </h3>
            <p className="text-[10px] text-white/40 italic truncate mt-0.5">
              Secure thread coordinates linked with real-time model simulations
            </p>
          </div>
        </div>

        {/* Pinned Messages Banner */}
        {pinnedMessages.length > 0 && (
          <div className="bg-amber-500/5 border-b border-amber-500/10 p-2.5 px-5 flex items-center justify-between text-[11px] text-amber-300/80">
            <div className="flex items-center space-x-2 truncate">
              <Pin className="w-3 h-3 text-amber-400 shrink-0 rotate-45" />
              <span className="font-semibold text-amber-400">PINNED SPEC:</span>
              <span className="truncate italic">"{pinnedMessages[pinnedMessages.length - 1].text}"</span>
            </div>
            <span className="text-[9px] bg-amber-500/10 px-1.5 text-amber-400 rounded-md shrink-0 ml-2">
              {pinnedMessages.length} Pinned
            </span>
          </div>
        )}

        {/* Messages List Area */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4 text-xs">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/30 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-white/10" />
              <div>
                <p className="font-semibold text-[13px] text-white/50">Welcome to #{currentChannel ? currentChannel.name : 'channel'}</p>
                <p className="text-[11px] text-white/30 p-2 max-w-sm">This is the beginning of the #{currentChannel ? currentChannel.name : 'channel'} workspace thread coordinate loop.</p>
              </div>
            </div>
          ) : (
            currentMessages.map((msg, idx) => {
              // Check for consecutive visual messages grouping (group if same sender & within same segment)
              const previousMsg = idx > 0 ? currentMessages[idx - 1] : null;
              const isConsecutive = previousMsg && previousMsg.sender === msg.sender;

              return (
                <div key={msg.id} className={`group flex space-x-3 items-start transition-all ${isConsecutive ? 'mt-1 pl-11' : 'mt-4'}`}>
                  {/* Sender Profile (Omit avatar if consecutive) */}
                  {!isConsecutive && (
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-md">
                      {msg.sender.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-grow space-y-1 min-w-0">
                    {/* Timestamp & Badges Header */}
                    {!isConsecutive && (
                      <p className="flex items-center space-x-2">
                        <span className="font-bold text-white/90 text-[12px]">{msg.sender}</span>
                        <span className="text-[9px] text-[#bfdbfe]/90 bg-indigo-500/10 border border-indigo-500/15 px-1.5 py-0.5 rounded-md font-sans">
                          {msg.role}
                        </span>
                        <span className="text-[9px] text-white/20 font-mono">{msg.timestamp || 'Just now'}</span>
                        {(msg as any).pinned && (
                          <Pin className="w-3 h-3 text-amber-400 rotate-45 shrink-0" />
                        )}
                      </p>
                    )}

                    {/* Message Body Text */}
                    <div className="flex items-start gap-2 max-w-full">
                      <p className="text-white/80 leading-relaxed max-w-2xl select-text break-words pr-4 text-[11.5px]">
                        {msg.text}
                      </p>
                    </div>

                    {/* Reactions array */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5 items-center">
                      {msg.reactions && msg.reactions.map((rc, ix) => (
                        <button
                          key={ix}
                          onClick={() => onAddReaction(msg.id, rc.emoji)}
                          className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono font-bold flex items-center space-x-1"
                        >
                          <span>{rc.emoji}</span>
                          <span className="text-white/40">{rc.count}</span>
                        </button>
                      ))}

                      {/* Tool Panel (Pin, Smile React) */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-2 pl-2 transition-opacity duration-200">
                        <button
                          onClick={() => onTogglePinMessage(msg.id)}
                          className={`p-1 hover:bg-white/5 rounded-md transition-colors ${
                            (msg as any).pinned ? 'text-amber-400' : 'text-white/30 hover:text-white'
                          }`}
                          title="Pin specification message"
                        >
                          <Pin className="w-3 h-3 rotate-45" />
                        </button>

                        <div className="flex items-center gap-1 bg-[#141416] p-0.5 px-1.5 rounded-full border border-white/5">
                          {['👍', '🔥', '👀', '❤️'].map(em => (
                            <button
                              key={em}
                              onClick={() => onAddReaction(msg.id, em)}
                              className="hover:scale-125 transition-transform text-[10px]"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Text Form Area */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0c]/80 shrink-0">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-white/30 hover:text-white transition-colors" title="Attach blueprint document">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder={`Write a message to teammates in #${currentChannel ? currentChannel.name : 'kickoff'}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-grow h-10 px-4 rounded-xl text-xs bg-[#121214] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={handleSend}
              className="h-10 w-10 bg-indigo-500 hover:bg-indigo-400 rounded-xl flex items-center justify-center text-white shrink-0 focus:outline-none transition-colors shadow-lg shadow-indigo-500/10"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[8px] text-white/20 font-mono mt-1.5 pr-2 text-right uppercase tracking-wider">
            Press Enter to simulation-test teammate model weights
          </p>
        </div>

      </div>

    </div>
  );
}
