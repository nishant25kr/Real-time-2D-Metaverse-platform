import { useMemo } from 'react';
import type { MessageSchema } from '../types';
import { ChatPanel } from './ChatPanel';

interface SidebarProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  messages: MessageSchema[];
  currentUserId: string | undefined;
  onSendMessage: (message: string) => void;
}

export const Sidebar = ({
  localStream,
  remoteStreams,
  messages,
  currentUserId,
  onSendMessage,
}: SidebarProps) => {
  const totalParticipants = 1 + remoteStreams.size;

  // Determine grid columns based on participant count
  const gridCols = useMemo(() => {
    if (totalParticipants <= 1) return 1;
    if (totalParticipants <= 4) return 2;
    return 2; // 2 columns for 5+, they scroll
  }, [totalParticipants]);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gap: '6px',
  };

  return (
    <div
      className="w-80 flex flex-col shrink-0 border-l border-gray-200/70 overflow-hidden bg-white"
      style={{
        animation: 'sidebarSlideIn 0.3s ease-out',
      }}
    >
      {/* Participants Section */}
      <div className="flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.12em]">
              Participants
            </span>
            <span className="ml-auto text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-full">
              {totalParticipants}
            </span>
          </div>
        </div>

        <div
          className="p-3 overflow-y-auto max-h-[45vh]"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.08) transparent',
          }}
        >
          <div style={gridStyle}>
            {/* Local user video */}
            <div className="relative group">
              {localStream ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 group-hover:border-indigo-300 transition-all duration-300 shadow-sm">
                  <video
                    autoPlay
                    playsInline
                    muted
                    ref={(el) => {
                      if (el) el.srcObject = localStream;
                    }}
                    className="w-full aspect-video object-cover bg-gray-50"
                  />
                  {/* You badge */}
                  <div className="absolute bottom-1.5 left-1.5">
                    <span
                      className="text-[9px] font-medium text-gray-700 px-1.5 py-0.5 rounded bg-white/80 border border-gray-200/60"
                      style={{ backdropFilter: 'blur(8px)' }}
                    >
                      You
                    </span>
                  </div>
                  {/* Live dot */}
                  <div className="absolute top-1.5 right-1.5">
                    <span className="flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video rounded-lg flex flex-col items-center justify-center gap-1 border border-dashed border-gray-200 bg-gray-50/50">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <p className="text-[9px] text-gray-400">You</p>
                </div>
              )}
            </div>

            {/* Remote user videos */}
            {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
              <div key={userId} className="relative group">
                <div className="relative rounded-lg overflow-hidden border border-gray-200 group-hover:border-indigo-300 transition-all duration-300 shadow-sm">
                  <video
                    autoPlay
                    playsInline
                    ref={(el) => {
                      if (el) el.srcObject = stream;
                    }}
                    className="w-full aspect-video object-cover bg-gray-50"
                  />
                  <div className="absolute bottom-1.5 left-1.5">
                    <span
                      className="text-[9px] font-medium text-gray-600 px-1.5 py-0.5 rounded bg-white/80 border border-gray-200/60"
                      style={{ backdropFilter: 'blur(8px)' }}
                    >
                      {userId.slice(0, 6)}…
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {!localStream && remoteStreams.size === 0 && (
            <div className="flex flex-col items-center justify-center py-6 opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <p className="text-[11px] text-gray-400">No one else is here yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <ChatPanel
        messages={messages}
        currentUserId={currentUserId}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};
