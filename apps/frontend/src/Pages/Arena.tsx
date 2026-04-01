import { useEffect, useRef, useState } from 'react';

const CELL_SIZE = 20;

export const Arena = () => {

  interface chairCordinates {
    x: number,
    y: number
  }

  const canvasRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [users, setUsers] = useState(new Map());
  const [params, setParams] = useState({ token: '', spaceId: '' });
  const [chairCordinates, setChairCordinates] = useState<object[]>([])
  const [possibleChairToSit, setPossibleChairToSit] = useState<number>(0)
  const [message, setMessage] = useState<string>()


  const rooms = [
    { minX: 1, maxX: 20, minY: 1, maxY: 20, name: "Room A" },
    { minX: 21, maxX: 41, minY: 1, maxY: 20, name: "Room B" },
    { minX: 42, maxX: 62, minY: 1, maxY: 20, name: "Room C" },
    { minX: 1, maxX: 20, minY: 30, maxY: 42, name: "Room D" },
    { minX: 22, maxX: 42, minY: 30, maxY: 42, name: "Room E" }
  ];

  function popUp(message: string, type: string) {
    return message
  }


  type FurnitureType = 'rect-table' | 'round-table' | 'solo-desk';

  interface Furniture {
    id: string;
    type: FurnitureType;
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
    chairs: { dx: number; dy: number; chairId: number; rotate: number }[];
  }

  const furniture: Furniture[] = [
    {
      id: 'table-a1', type: 'rect-table', x: 3, y: 4, width: 14, height: 6,
      label: 'Meeting',
      chairs: [
        { dx: 1, dy: -1, rotate: 0, chairId: 1 },
        // { dx: 3,  dy: -1, rotate: 0, chairId:2 },
        { dx: 5, dy: -1, rotate: 0, chairId: 2 },
        // { dx: 7,  dy: -1, rotate: 0 },
        { dx: 9, dy: -1, rotate: 0, chairId: 3 },
        // { dx: 11, dy: -1, rotate: 0 },

        { dx: 1, dy: 6, rotate: 180, chairId: 4 },
        // { dx: 3,  dy: 6, rotate: 180 },
        { dx: 5, dy: 6, rotate: 180, chairId: 5 },
        // { dx: 7,  dy: 6, rotate: 180 },
        // { dx: 9,  dy: 6, rotate: 180 },
        // { dx: 11, dy: 6, rotate: 180 },

        // { dx: -1, dy: 1, rotate: 90 },
        // { dx: -1, dy: 3, rotate: 90 },
        // { dx: -1, dy: 5, rotate: 90 },

        // { dx: 14, dy: 1, rotate: 270 },
        // { dx: 14, dy: 3, rotate: 270 },
        // { dx: 14, dy: 5, rotate: 270 },
      ]
    }
  ];

  function isinRoom(x: any, y: any) {
    if (x > 1 && x < 20 && y > 1 && y < 20) {
      console.log("inside the room")
    } else {

    }
    chairCordinates.forEach((e: any) => {
      const validCordinates = [
        { x: e.x, y: e.y },
        { x: e.x - 1, y: e.y },
        { x: e.x, y: e.y - 1 },
        { x: e.x + 1, y: e.y + 1 },
        { x: e.x + 2, y: e.y },
        { x: e.x + 1, y: e.y }
      ]
      validCordinates.forEach((c) => {
        if (c.x == x && c.y == y) {
          console.log("near chair", e.chairId)
          //write popup message
          setMessage(popUp(`click cmd+I to sit in chair`,"hello"))
          setPossibleChairToSit(e.chairId)

        } else {
          if (possibleChairToSit != 0) {
            setPossibleChairToSit(0)
          }
        }
      })

    })
  }

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
          const users = new Map(prev);
          const user = users.get(message.payload.id);
          if (user) {
            user.x = message.payload.x;
            user.y = message.payload.y;
            users.set(message.payload.userId, user);
          }
          return users;
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
  };

  const handleMove = (newX: any, newY: any) => {
    if (!currentUser) return;
    isinRoom(newX, newY)
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

    const ctx = canvas.getContext('2d')

    const resizeCanvas = () => {
      canvas.width = window.innerWidth - 50;
      canvas.height = window.innerHeight - 100;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resizeCanvas()

    for (let i = 0; i < canvas.width; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.lineWidth = 0.1;
      ctx.stroke();
    }

    for (let i = 0; i < canvas.height; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    const drawChair = (ctx: CanvasRenderingContext2D, px: number, py: number) => {
      const w = CELL_SIZE;
      const h = CELL_SIZE;
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px, py, w, h, 4);
      ctx.fill();
      ctx.stroke();
    };

    const drawTable = (ctx: CanvasRenderingContext2D, item: Furniture) => {
      const px = item.x * CELL_SIZE;
      const py = item.y * CELL_SIZE;
      const pw = item.width * CELL_SIZE;
      const ph = item.height * CELL_SIZE;

      item.chairs.forEach(chair => {
        const cx = px + chair.dx * CELL_SIZE + CELL_SIZE / 2;
        const cy = py + chair.dy * CELL_SIZE + CELL_SIZE / 2;

        const id = chair.chairId
        setChairCordinates((prev) => {
          const newX = Math.floor(cx / CELL_SIZE);
          const newY = Math.floor(cy / CELL_SIZE);

          const exists = prev.some((c: any) => c.x === newX && c.y === newY);
          if (exists) return prev;

          return [...prev, { x: newX, y: newY, chairId: id }];
        });
        drawChair(ctx, cx, cy);
      });

      ctx.fillStyle = item.type === 'solo-desk' ? '#6366f1' : '#d97706';
      ctx.strokeStyle = item.type === 'solo-desk' ? '#4338ca' : '#b45309';
      ctx.lineWidth = 1.5;

      if (item.type === 'round-table') {
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph / 2, pw / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(px + CELL_SIZE / 2, py + CELL_SIZE / 2, pw, ph, 6);
        ctx.fill();
        ctx.stroke();
      }

      if (item.label) {
        ctx.fillStyle = item.type === 'solo-desk' ? '#e0e7ff' : '#451a03';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, px + pw / 2, py + ph / 2 + 4);
      }
    };

    furniture.forEach(item => drawTable(ctx, item));

    rooms.forEach((room) => {
      const startX = room.minX * CELL_SIZE;
      const startY = room.minY * CELL_SIZE;
      const width = (room.maxX - room.minX) * CELL_SIZE;
      const height = (room.maxY - room.minY) * CELL_SIZE;

      ctx.fillStyle = 'rgba(0, 150, 255, 0.08)';
      ctx.fillRect(startX, startY, width, height);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, width, height);

      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      // ctx.fillText(room.name, startX + width / 2, startY + height / 2);
    });


    if (currentUser && currentUser.x) {
      ctx.beginPath();
      ctx.fillStyle = '#FF6B6B';
      ctx.arc(currentUser.x * CELL_SIZE, currentUser.y * CELL_SIZE, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${currentUser.x}-${currentUser.y}`, currentUser.x * CELL_SIZE, currentUser.y * CELL_SIZE + 40);
    }

    users.forEach(user => {
      if (!user.x) {
        return
      }
      ctx.beginPath();
      ctx.fillStyle = '#ffe1e1';
      ctx.arc(user.x * CELL_SIZE, user.y * CELL_SIZE, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${user.x}-${user.y}`, user.x * CELL_SIZE, user.y * CELL_SIZE + 40);
    });

  }, [currentUser, users]);

  const handleKeyDown = (e: any) => {

    if (!currentUser) return;


    if (e.metaKey && e.key.toLowerCase() === "i") {
      console.log("button pressed")
      if (possibleChairToSit) {
        furniture[0].chairs.forEach((e) => {
          if (e.chairId === possibleChairToSit) {
            const px = 3 * CELL_SIZE;
            const py = 4 * CELL_SIZE;
            const cx = px + e.dx * CELL_SIZE + CELL_SIZE / 2;
            const cy = py + e.dy * CELL_SIZE + CELL_SIZE / 2;
            const x = Math.floor(cx / CELL_SIZE) + 1;
            const y = Math.floor(cy / CELL_SIZE) + 1;
            console.log("sitting in chair", possibleChairToSit, "in sit :", x, y)
            setCurrentUser({ x, y })
            handleMove(x, y)
          }
        })
      } else {

      }
    }

    switch (e.key) {
      case 'ArrowUp':
        setCurrentUser((prev: any) => {
          if (!prev || prev.x === undefined) return prev;
          const newY = prev.y - 1;
          handleMove(prev.x, newY);
          return { ...prev, y: newY };
        });
        break;

      case 'ArrowDown':
        setCurrentUser((prev: any) => {
          if (!prev || prev.x === undefined) return prev;
          const newY = prev.y + 1;
          handleMove(prev.x, newY);
          return { ...prev, y: newY };
        });
        break;

      case 'ArrowLeft':
        setCurrentUser((prev: any) => {
          if (!prev || prev.x === undefined) return prev;
          const newX = prev.x - 1;
          handleMove(newX, prev.y);
          return { ...prev, x: newX };
        });
        break;

      case 'ArrowRight':
        setCurrentUser((prev: any) => {
          if (!prev || prev.x === undefined) return prev;
          const newX = prev.x + 1;
          handleMove(newX, prev.y);
          return { ...prev, x: newX };
        });
        break;
    }

  };

  return (
    <div className="" onKeyDown={handleKeyDown} tabIndex={0}>
      <h1>{JSON.stringify(message)}</h1>
      <h1>current user{JSON.stringify(currentUser)}</h1>
      <h1>possible chair{possibleChairToSit}</h1>
      <h1>{JSON.stringify(chairCordinates)}</h1>
      <h1>user:{users.size}</h1>
      <h1>Token:{JSON.stringify(params.token)}</h1>
      <h1>spaceID:{JSON.stringify(params.spaceId)}</h1>
      <div className="border m-3 overflow-scrollrounded-lg">
        <canvas
          ref={canvasRef}
          className="bg-white block "
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">Use arrow keys to move your avatar</p>
    </div>
  );
};

export default Arena;