import { useEffect, useRef } from 'react';
import { CELL_SIZE, FURNITURE, INDIVIDUAL_TABLES, LABEL_OFFSET_Y } from '../Constants';
import type { Furniture } from '../types';

interface CanvasProps {
  currentUser: { x: number; y: number; userId: string; username: string } | null;
  users: Map<string, any>;
  insideRoom: boolean;
  message: string;    
  avatar: any;
}

export function useArenaCanvas({ currentUser, users, insideRoom, message, avatar }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = insideRoom ? window.innerWidth - 300 : window.innerWidth - 100;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 0.2;
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x < canvas.width; x += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    FURNITURE.forEach((item) => drawTable(ctx, item));

    FURNITURE.forEach((item) => {
      const room = item.room

      const sx = room.minX * CELL_SIZE;
      const sy = room.minY * CELL_SIZE;
      const w  = (room.maxX - room.minX) * CELL_SIZE;
      const h  = (room.maxY - room.minY) * CELL_SIZE;

      ctx.beginPath();
      ctx.roundRect(sx, sy, w, h, 1);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 13;
      ctx.stroke();

      room.rotate === 0 ? 
      `${ctx.clearRect(sx + w / 2 - 30, sy + h - 7, 60, 20)}`:
      `${ctx.clearRect(sx + w / 2 - 30, sy - 7, 60, 20)}`
      ;
    })

    INDIVIDUAL_TABLES.forEach((item) => {
      drawTable(ctx,item)
    })

    if (currentUser?.x) {
      drawAvatar(ctx, currentUser.x, currentUser.y, '#FF6B6B', `${currentUser.x}-${currentUser.y} ${message}`, currentUser.username, avatar);
    }

    users.forEach((user) => {
      if (!user.x) return;
      console.log('user', user)
      drawAvatar(ctx, user.x, user.y, '#ffe1e1', `${user.x}-${user.y}`, user.username, user.avatar.imageUrl? user.avatar.imageUrl : "");
    });
  }, [currentUser, users, insideRoom, message]);

  return canvasRef;
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string,
  username: string,
  imageUrl: string
) {
  const img: any = new Image()
  img.src = imageUrl

  const pixelX = x * CELL_SIZE;
  const pixelY = y * CELL_SIZE;

  ctx.drawImage(
    img,
    pixelX - CELL_SIZE / 2,
    pixelY - CELL_SIZE / 2,
    CELL_SIZE,
    CELL_SIZE
  );

  ctx.fillStyle = color;
  ctx.fillText(label, pixelX, pixelY + LABEL_OFFSET_Y);
  ctx.fillText(username, pixelX, pixelY + LABEL_OFFSET_Y + 12);
}
function drawChair(ctx: CanvasRenderingContext2D, px: number, py: number) {
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(px, py, CELL_SIZE, CELL_SIZE, 4);
  ctx.fill();
  ctx.stroke();
}

function drawTable(ctx: CanvasRenderingContext2D, item: Furniture) {
  const px = item.x * CELL_SIZE;
  const py = item.y * CELL_SIZE;
  const pw = item.width  * CELL_SIZE;
  const ph = item.height * CELL_SIZE;

  item.chairs.forEach((chair) => {
    const cx = px + chair.dx * CELL_SIZE + CELL_SIZE / 2;
    const cy = py + chair.dy * CELL_SIZE + CELL_SIZE / 2;
    drawChair(ctx, cx, cy);
  }); 

  ctx.fillStyle   = item.type === 'solo-desk' ? '#6366f1' : '#d97706';
  ctx.strokeStyle = item.type === 'solo-desk' ? '#4338ca' : '#b45309';
  ctx.lineWidth   = 1.5;

  if (item.type === 'round-table') {
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + ph / 2, pw / 2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.roundRect(px + CELL_SIZE / 2, py + CELL_SIZE / 2, pw, ph, 6);
    ctx.fill(); ctx.stroke();
  }

  if (item.label) {
    ctx.fillStyle = item.type === 'solo-desk' ? '#e0e7ff' : '#451a03';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, px + pw / 2 + CELL_SIZE / 2, py + ph / 2 + CELL_SIZE / 2 + 4);
  }
}