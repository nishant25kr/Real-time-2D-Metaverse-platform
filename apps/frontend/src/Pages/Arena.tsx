import { useEffect, useRef, useState, useCallback } from 'react';

// Configuration constants for easier adjustments
const TILE_SIZE = 50;
const AVATAR_RADIUS = 20;

export const Arena = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<Map<string, any>>(new Map());
  const [params, setParams] = useState({ token: '', spaceId: '' });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update canvas size to match container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || '';
    const spaceId = urlParams.get('spaceId') || '';
    setParams({ token, spaceId });

    wsRef.current = new WebSocket('ws://localhost:8080/');

    wsRef.current.onopen = () => {
      wsRef.current?.send(JSON.stringify({
        type: 'join',
        payload: {
          spaceId,
          token
        }
      }));
    };

    wsRef.current.onmessage = (event: any) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'space-joined':
        setCurrentUser({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          id: message.payload.id || 'me' // fallback if not provided
        });

        // Initialize other users
        const userMap = new Map();
        message.payload.users.forEach((user: any) => {
          userMap.set(user.id, user);
        });
        setUsers(userMap);
        break;

      case 'user-joined':
        setUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.set(message.payload.id, {
            x: message.payload.x,
            y: message.payload.y,
            id: message.payload.id
          });
          return newUsers;
        });
        break;

      case 'move': // Changed from 'movement'
        setUsers(prev => {
          const newUsers = new Map(prev);
          const user = newUsers.get(message.payload.id);
          if (user) {
            newUsers.set(message.payload.id, {
              ...user,
              x: message.payload.x,
              y: message.payload.y
            });
          }
          return newUsers;
        });
        break;

      case 'movement-rejected':
        setCurrentUser((prev: any) => ({
          ...prev,
          x: message.payload.x,
          y: message.payload.y
        }));
        break;

      case 'user-left':
        setUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.delete(message.payload.id);
          return newUsers;
        });
        break;
    }
  }, []);

  const handleMove = useCallback((newX: number, newY: number) => {
    if (!currentUser || !wsRef.current) return;

    // Optimistic UI update
    setCurrentUser((prev: any) => ({ ...prev, x: newX, y: newY }));

    // Send movement request
    wsRef.current.send(JSON.stringify({
      type: 'move',
      payload: {
        x: newX,
        y: newY
      }
    }));
  }, [currentUser]);

  // Main Draw Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Camera following current player
    const cameraX = currentUser ? (currentUser.x * TILE_SIZE) - (dimensions.width / 2) : 0;
    const cameraY = currentUser ? (currentUser.y * TILE_SIZE) - (dimensions.height / 2) : 0;

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Draw grid background
    const gridStartCol = Math.floor(cameraX / TILE_SIZE) - 2;
    const gridEndCol = gridStartCol + Math.ceil(dimensions.width / TILE_SIZE) + 4;
    const gridStartRow = Math.floor(cameraY / TILE_SIZE) - 2;
    const gridEndRow = gridStartRow + Math.ceil(dimensions.height / TILE_SIZE) + 4;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = gridStartCol; i <= gridEndCol; i++) {
      ctx.beginPath();
      ctx.moveTo(i * TILE_SIZE, gridStartRow * TILE_SIZE);
      ctx.lineTo(i * TILE_SIZE, gridEndRow * TILE_SIZE);
      ctx.stroke();
    }
    for (let j = gridStartRow; j <= gridEndRow; j++) {
      ctx.beginPath();
      ctx.moveTo(gridStartCol * TILE_SIZE, j * TILE_SIZE);
      ctx.lineTo(gridEndCol * TILE_SIZE, j * TILE_SIZE);
      ctx.stroke();
    }

    // Draw other users
    users.forEach(user => {
      // Body
      ctx.beginPath();
      ctx.fillStyle = '#14B8A6'; // Teal color
      ctx.arc(user.x * TILE_SIZE, user.y * TILE_SIZE, AVATAR_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shadow
      ctx.beginPath();
      ctx.ellipse(user.x * TILE_SIZE, user.y * TILE_SIZE + 22, 15, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = user.id.length > 8 ? user.id.substring(0, 5) + '...' : user.id;
      ctx.fillText(label, user.x * TILE_SIZE, user.y * TILE_SIZE - 30);
    });

    // Draw current user (Player)
    if (currentUser) {
      // Glow/Pulse effect would be nice, but simple for now
      ctx.beginPath();
      ctx.fillStyle = '#6366F1'; // Indigo color
      ctx.arc(currentUser.x * TILE_SIZE, currentUser.y * TILE_SIZE, AVATAR_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#A5B4FC';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Simple "Face" indicator (look at last direction?)
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(currentUser.x * TILE_SIZE - 6, currentUser.y * TILE_SIZE - 4, 3, 0, Math.PI * 2);
      ctx.arc(currentUser.x * TILE_SIZE + 6, currentUser.y * TILE_SIZE - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('YOU', currentUser.x * TILE_SIZE, currentUser.y * TILE_SIZE - 35);
    }

    ctx.restore();
  }, [currentUser, users, dimensions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!currentUser) return;

    const { x, y } = currentUser;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        handleMove(x, y - 1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        handleMove(x, y + 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        handleMove(x - 1, y);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        handleMove(x + 1, y);
        break;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-[#0F172A] overflow-hidden focus:outline-none"
      onKeyDown={handleKeyDown} 
      tabIndex={0}
    >
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            MetaVerse Arena
          </h1>
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-mono">Space: <span className="text-slate-200">{params.spaceId.substring(0, 12)}...</span></p>
            <p className="text-xs text-slate-400">Players: <span className="text-slate-200 font-bold">{users.size + (currentUser ? 1 : 0)}</span>在线</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
        <p className="text-xs text-slate-300 font-medium tracking-wide">
          WASD or Arrow Keys to Move
        </p>
      </div>

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block"
      />

    </div>
  );
};

export default Arena;