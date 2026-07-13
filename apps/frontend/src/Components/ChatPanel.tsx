import { useEffect, useRef, useState } from 'react';
import type { MessageSchema } from '../types';

interface ChatPanelProps {
  messages: MessageSchema[];
  currentUserId: string | undefined;
  onSendMessage: (message: string) => void;
}

export const ChatPanel = ({ messages, currentUserId, onSendMessage }: ChatPanelProps) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Chat header */}
      <div className="px-4 py-2.5 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em]">Chat</span>
          {messages.length > 0 && (
            <span className="ml-auto text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.08) transparent',
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-[11px] text-gray-400">No messages yet</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id || index}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                style={{
                  animation: 'chatFadeIn 0.25s ease-out',
                }}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm ${
                    isOwn
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-50 border border-gray-100 text-gray-700'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-[10px] font-medium text-gray-400 mb-0.5">
                      {msg.senderId.slice(0, 8)}…
                    </p>
                  )}
                  <p className="text-[13px] leading-relaxed break-words">{msg.message}</p>
                  <p className={`text-[9px] mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-300'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-3 pb-3 pt-2">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-200">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-default transition-all duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
