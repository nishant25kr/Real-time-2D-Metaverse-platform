import { useEffect, useRef, useState } from 'react';

const CELL_SIZE = 10;


export const Arena = () => {
  const canvasRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [users, setUsers] = useState(new Map());
  const [params, setParams] = useState({ token: '', spaceId: '' });

  const rooms = [
    { minX: 5, maxX: 20, minY: 5, maxY: 20  , name: "Room A" },
    { minX: 12, maxX: 18, minY: 5, maxY: 10, name: "Room B" },
    { minX: 5, maxX: 10, minY: 12, maxY: 18, name: "Room C" },
    { minX: 12, maxX: 18, minY: 12, maxY: 18, name: "Room D" },
    { minX: 20, maxX: 26, minY: 8, maxY: 14, name: "Room E" }
  ];


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || '';
    const spaceId = urlParams.get('spaceId') || '';
    setParams({ token, spaceId });

    wsRef.current = new WebSocket('ws://localhost:8080/');

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({
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

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'space-joined':
        console.log("space-joined from backend", message)
        setCurrentUser({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          userId: message.payload.yourId
        });

        if (message.payload.users.length > 0) {

          const userMap = new Map();
          message.payload.users.forEach((user: any) => {
            userMap.set(user.id, user);
          });
          setUsers(userMap);
        }
        break;

      case 'user-joined':
        setUsers(prev => {
          const newUsers = new Map(prev);

          newUsers.set(message.payload.id, {
            x: message.payload.x,
            y: message.payload.y,
            userId: message.payload.id
          });

          return newUsers;
        });
        break;

      case 'move':
        setUsers(prev => {
          const newUsers = new Map(prev);
          const user = newUsers.get(message.payload.userId);
          if (user) {
            user.x = message.payload.x;
            user.y = message.payload.y;
            newUsers.set(message.payload.userId, user);
          }
          return newUsers;
        });
        break;

      case 'movement-rejected':
        // Reset current user position if movement was rejected
        setCurrentUser((prev: any) => ({
          ...prev,
          x: message.payload.x,
          y: message.payload.y
        }));
        break;

      case 'user-left':
        setUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.delete(message.payload.userId);
          return newUsers;
        });
        break;
    }
  };

  const handleMove = (newX: any, newY: any) => {
    if (!currentUser) return;

    wsRef.current.send(JSON.stringify({
      type: 'move',
      payload: {
        x: newX,
        y: newY,
        userId: currentUser.userId
      }
    }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const offsetX = currentUser.x * CELL_SIZE - canvas.width / 2;
    const offsetY = currentUser.y * CELL_SIZE - canvas.height / 2;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("width", canvas.width)
    console.log("height", canvas.height)

    ctx.strokeStyle = '#eee';
    for (let i = 0; i < canvas.width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    rooms.forEach(room => {
      const startX = room.minX * CELL_SIZE - offsetX;
      const startY = room.minY * CELL_SIZE - offsetY;
      const width = (room.maxX - room.minX) * CELL_SIZE;
      const height = (room.maxY - room.minY) * CELL_SIZE;
      console.log(startX,startY,width,height)

      ctx.fillStyle = "rgba(0, 150, 255, 0.1)";
      ctx.fillRect(startX, startY, width, height);

      ctx.strokeStyle = "#0096FF";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, width, height);

      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        room.name,
        startX + width / 2,
        startY + height / 2
      );

    });

    if (currentUser && currentUser.x) {
      ctx.beginPath();
      ctx.fillStyle = '#FF6B6B';
      ctx.arc(currentUser.x * 15, currentUser.y * 15, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${currentUser.x}-${currentUser.y}`, currentUser.x * 15, currentUser.y * 15 + 40);
    }

    users.forEach(user => {
      if (!user.x) {
        return
      }
      ctx.beginPath();
      ctx.fillStyle = '#4ECDC4';
      ctx.arc(user.x * 25, user.y * 25, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`User ${user.x, user.y}`, user.x * 25, user.y * 25 + 40);
    });

  }, [currentUser, users]);

  const handleKeyDown = (e: any) => {

    if (!currentUser) return;
    const { x, y } = currentUser;
    console.log("x", x)

    console.log("x", y)
    switch (e.key) {
      case 'ArrowUp':
        console.log("x", x)
        console.log("Y", y)
        handleMove(x, y - 1);
        break;

      case 'ArrowDown':
        handleMove(x, y + 1);
        break;

      case 'ArrowLeft':
        handleMove(x - 1, y);
        break;

      case 'ArrowRight':
        handleMove(x + 1, y);
        break;
    }
  };

  return (
    <div className="p-4" onKeyDown={handleKeyDown} tabIndex={0}>

      <h1 className="text-2xl font-bold mb-4">Arena</h1>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Token: {params.token}</p>
        <p className="text-sm text-gray-600">Space ID: {params.spaceId}</p>
        <p className="text-sm text-gray-600">Connected Users: {users.size + (currentUser ? 1 : 0)}</p>
      </div>
      <div className="border rounded-lg p-2">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="bg-white border "
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">Use arrow keys to move your avatar</p>
    </div>
  );
};

export default Arena;