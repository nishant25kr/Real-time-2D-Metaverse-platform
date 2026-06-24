import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CELL_SIZE, FURNITURE, INDIVIDUAL_TABLES } from '../Constants';
import { useMedia } from '../hooks/Usemedia';
import { useWebRTC } from '../hooks/Usewebrtc';
import { useArenaCanvas } from '../hooks/Usearenacanvas';
import { useRoomPresence } from '../hooks/Useroompresence';
import { useCoordinates } from '../hooks/Usecoordinates';
import type { User } from '../types';

export const Arena = () => {
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState(new Map<string, User>());
  const [message, setMessage] = useState('Go near a chair');
  const [onTheChair, setOnTheChair] = useState(false);
  const [onTheTable, setOnTheTable] = useState(false)
  const [loading, setLoading] = useState(false);

  const currentUserRef = useRef<User | null>(null);
  const onTheChairRef = useRef(false);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const onMessageRef = useRef<((msg: any) => void) | null>(null);

  const { localStream, streamRef, getAccess, stopAll } = useMedia();

  const { insideRoom, currentRoom, insideRoomRef, currentRoomRef, checkRoomPresence } =
    useRoomPresence();

  const { validCoordinates, invalidCoordinates } = useCoordinates();

  const { remoteStreams, sendOffer, receiveOffer, receiveAnswer, addIceCandidate,
    cleanupPeer, cleanupAllPeers } = useWebRTC({ wsRef, streamRef, getAccess });

  const canvasRef = useArenaCanvas({ currentUser, users, insideRoom, message });

  const handleLeave = useCallback(() => {
    // Send leave message to backend before closing
    wsRef.current?.send(JSON.stringify({ type: 'leave' }));
    // Clean up media and WebRTC
    stopAll();
    cleanupAllPeers();
    // Close the WebSocket connection
    wsRef.current?.close();
    wsRef.current = null;
    // Navigate back to dashboard
    navigate('/dashboard');
  }, [stopAll, cleanupAllPeers, navigate]);

  const isValidMove = useCallback((x: number, y: number): boolean => {
    return !invalidCoordinates.has(`${x},${y}`);
  }, [invalidCoordinates]);

  const findNearbyChairCell = useCallback(
    (x: number, y: number, roomName: string): { x: number; y: number; name?: string } | undefined => {
      const coords = validCoordinates.get(roomName);
      if (!coords) { setMessage('Go near a chair'); return undefined; }

      const match = coords.find((c) => c.x === x && c.y === y);
      if (!match) { setMessage('Go near a chair'); return undefined; }

      setMessage('Cmd+I to sit');

      if (roomName === "Table") {
        for (const item of INDIVIDUAL_TABLES) {
          if (item.name !== match.name) continue;
          const px = item.x * CELL_SIZE;
          const py = item.y * CELL_SIZE;
          const chair = item.chairs.find((c: { chairId: number }) => c.chairId === match.id);
          if (!chair) continue;
          const cx = Math.floor((px + chair.dx * CELL_SIZE + CELL_SIZE / 2) / CELL_SIZE) + 1;
          const cy = Math.floor((py + chair.dy * CELL_SIZE + CELL_SIZE / 2) / CELL_SIZE) + 1;
          return { x: cx, y: cy, name: match.name };
        }
      }

      for (const item of FURNITURE) {
        if (item.room.name !== roomName) continue;
        const px = item.x * CELL_SIZE;
        const py = item.y * CELL_SIZE;
        const chair = item.chairs.find((c: { chairId: number }) => c.chairId === match.id);
        if (!chair) continue;
        const cx = Math.floor((px + chair.dx * CELL_SIZE + CELL_SIZE / 2) / CELL_SIZE) + 1;
        const cy = Math.floor((py + chair.dy * CELL_SIZE + CELL_SIZE / 2) / CELL_SIZE) + 1;
        return { x: cx, y: cy };
      }

      setMessage('Press Cmd+I to sit');
      return undefined;
    },
    [validCoordinates]
  );

  const sendMove = useCallback((x: number, y: number, isSitting: boolean, tablename?: string) => {
    wsRef.current?.send(JSON.stringify({
      type: 'move',
      payload: {
        x,
        y,
        userId: currentUserRef.current?.userId,
        isSitting,
        roomId: currentRoomRef.current || tablename
      },
    }));
  }, []);

  const handleMove = useCallback((x: number, y: number, isSitting: boolean, onTable?: boolean, tablename?: string) => {
    if (onTable) {
      if (!streamRef.current) {
        getAccess();
      } else if (streamRef.current) {
        stopAll();
        cleanupAllPeers();
      }

      sendMove(x, y, isSitting, tablename);
      return;
    } else {
      const { insideRoom: nowInside } = checkRoomPresence(x, y);

      if (nowInside && !streamRef.current) {
        getAccess();
      } else if (!nowInside && streamRef.current) {
        stopAll();
        cleanupAllPeers();
      }

      sendMove(x, y, isSitting);
    }

  }, [checkRoomPresence, streamRef, getAccess, stopAll, cleanupAllPeers, sendMove]);

  const handleWebSocketMessage = useCallback(async (msg: any) => {
    switch (msg.type) {

      case 'space-joined': {
        console.log('message joined')
        const user: User = {
          x: msg.payload.spawn.x,
          y: msg.payload.spawn.y,
          userId: msg.payload.yourId,
        };
        currentUserRef.current = user;
        setCurrentUser(user);

        if (msg.payload.users.length > 0) {
          const map = new Map<string, User>();
          msg.payload.users.forEach((u: any) => map.set(u.id, u));
          setUsers(map);
        }
        setLoading(false);
        break;
      }

      case 'user-joined':
        setUsers((prev) => {
          const next = new Map(prev);
          next.set(msg.payload.id, { x: msg.payload.x, y: msg.payload.y, userId: msg.payload.id });
          return next;
        });
        break;

      case 'move':
        setUsers((prev) => {
          const next = new Map(prev);
          const user = next.get(msg.payload.id);
          if (user) next.set(msg.payload.id, { ...user, x: msg.payload.x, y: msg.payload.y });
          return next;
        });
        break;

      case 'movement-rejected': {
        const corrected: User = {
          ...currentUserRef.current!,
          x: msg.payload.x,
          y: msg.payload.y
        };
        currentUserRef.current = corrected;
        setCurrentUser(corrected);
        setOnTheChair(false);
        setOnTheTable(false);
        onTheChairRef.current = false;
        if (streamRef.current) {
          stopAll();
          cleanupAllPeers();
        } 
        break;
      }

      case 'user-left':
        setUsers((prev) => { const next = new Map(prev); next.delete(msg.payload.id); return next; });
        cleanupPeer(msg.payload.id);
        break;

      case 'user-left-meeting':
        cleanupPeer(msg.payload.userId);
        break;

      case 'offer':
        await receiveOffer(msg);
        break;

      case 'answer':
        await receiveAnswer(msg);
        break;

      case 'add-ice-candidate':
        await addIceCandidate(msg.payload);
        break;

      case 'init-call': {
        const { meetingId, id: ids } = msg.payload;
        const others = (ids as string[]).filter((id) => id !== currentUserRef.current?.userId);
        others.forEach((id) => sendOffer(id, meetingId));
        break;
      }
    }
  }, [cleanupPeer, receiveOffer, receiveAnswer, addIceCandidate, sendOffer]);

  onMessageRef.current = handleWebSocketMessage;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const user = currentUserRef.current;
    if (!user) return;

    if (e.metaKey && e.key.toLowerCase() === 'k') {
      if (!onTheChairRef.current) return;
      const pos = lastPosition.current ?? { x: user.x, y: user.y };
      onTheChairRef.current = false;
      setOnTheChair(false);
      setOnTheTable(false);
      const updated: User = { ...user, ...pos };
      currentUserRef.current = updated;
      setCurrentUser(updated);
      handleMove(pos.x, pos.y, false);
      return;
    }

    if (onTheChairRef.current) return;
    if (onTheChair) return;
    if (e.metaKey && e.key.toLowerCase() === 'i') {
      if (!insideRoomRef.current) {
        const tableseat = findNearbyChairCell(user.x, user.y, "Table");
        if (!tableseat || !tableseat.x || !tableseat.y) return;
        const seats = { x: tableseat?.x, y: tableseat?.y }
        lastPosition.current = { x: user.x, y: user.y };
        if (seats) {
          onTheChairRef.current = true;
          setOnTheChair(true);
          setOnTheTable(true)
          const seated: User = { ...user, ...tableseat };
          currentUserRef.current = seated;
          setCurrentUser(seated);
          handleMove(seats.x, seats.y, true, true, tableseat?.name);
        }
        return;
      } else {
        const seat = findNearbyChairCell(user.x, user.y, currentRoomRef.current);
        if (!seat) return;
        lastPosition.current = { x: user.x, y: user.y };
        onTheChairRef.current = true;
        setOnTheChair(true);
        const seated: User = { ...user, ...seat };
        currentUserRef.current = seated;
        setCurrentUser(seated);
        handleMove(seat.x, seat.y, true);
        return;
      }
    }

    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp') dy = -1;
    if (e.key === 'ArrowDown') dy = 1;
    if (e.key === 'ArrowLeft') dx = -1;
    if (e.key === 'ArrowRight') dx = 1;
    if (!dx && !dy) return;

    const newX = user.x + dx;
    const newY = user.y + dy;
    if (!isValidMove(newX, newY)) return;

    lastPosition.current = { x: user.x, y: user.y };
    const moved: User = { ...user, x: newX, y: newY };
    currentUserRef.current = moved;
    setCurrentUser(moved);
    handleMove(newX, newY, false);
  }, [findNearbyChairCell, handleMove, isValidMove, insideRoomRef, currentRoomRef]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ?? '';
    const spaceId = params.get('spaceId') ?? '';
    const passcode = params.get('passcode') ?? '';

    const ws = new WebSocket('ws://localhost:8080/');
    // const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ 
        type: 'join',
         payload: {
          spaceId,
          token, 
          passcode 
        } 
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data as string);
      onMessageRef.current?.(msg);
    };

    return () => {
      ws.close();
      cleanupAllPeers();
      stopAll();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="px-10 py-5 border-b border-gray-100">
          <span className="text-sm font-semibold tracking-widest uppercase text-gray-800">MetaVerse</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Connecting to space...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen bg-white"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <span className="text-sm font-semibold tracking-widest uppercase text-gray-800">MetaVerse</span>
        <div className="flex items-center gap-3">
          {insideRoom && (
            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {currentRoom}
            </span>
          )}
          <span className="text-xs text-gray-400">{message}</span>
          <button
            id="leave-space-btn"
            onClick={handleLeave}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 hover:border-red-300 transition-all duration-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Leave Space
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <canvas ref={canvasRef} className="bg-white block" />
        </div>

        {(insideRoom || onTheTable) && (
          <div className="w-72 flex flex-col border-l border-gray-100 bg-white shrink-0">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Participants</p>
            </div>

            <div className="flex flex-col gap-3 p-4 overflow-y-auto flex-1">
              {localStream ? (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-gray-400">You</p>
                  <video
                    autoPlay playsInline muted
                    ref={(el) => { if (el) el.srcObject = localStream; }}
                    className="w-full aspect-video bg-gray-100 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-gray-100 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                  <p className="text-xs text-gray-400">Camera off</p>
                </div>
              )}

              {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
                <div key={userId} className="flex flex-col gap-1.5">
                  <p className="text-xs text-gray-400 truncate">{userId.slice(0, 8)}…</p>
                  <video
                    autoPlay playsInline
                    ref={(el) => { if (el) el.srcObject = stream; }}
                    className="w-full aspect-video bg-gray-100 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              ))}

              {!localStream && remoteStreams.size === 0 && (
                <p className="text-xs text-gray-400 text-center mt-4">No one else is here yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Arena;