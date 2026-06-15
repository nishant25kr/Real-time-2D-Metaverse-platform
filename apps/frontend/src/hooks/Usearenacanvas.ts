import { useEffect, useRef } from 'react';
import { CELL_SIZE, FURNITURE } from '../Constants';
import type { Furniture } from '../types';

interface CanvasProps {
  currentUser: { x: number; y: number; userId: string } | null;
  users: Map<string, any>;
  insideRoom: boolean;
  message: string;    
}

export function useArenaCanvas({ currentUser, users, insideRoom, message }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // FIX: assign numbers, not strings
    canvas.width = insideRoom ? window.innerWidth - 300 : window.innerWidth - 100;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x < canvas.width; x += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Furniture
    FURNITURE.forEach((item) => drawTable(ctx, item));

    // Room walls
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

      // Erase door gap
      room.rotate === 0 ? 
      `${ctx.clearRect(sx + w / 2 - 30, sy + h - 7, 60, 20)}`:
      `${ctx.clearRect(sx + w / 2 - 30, sy - 7, 60, 20)}`
      ;
    })

    if (currentUser?.x) {
      drawAvatar(ctx, currentUser.x, currentUser.y, '#FF6B6B', `${currentUser.x}-${currentUser.y} ${message}`);
    }

    // Other users
    users.forEach((user) => {
      if (!user.x) return;
      drawAvatar(ctx, user.x, user.y, '#ffe1e1', `${user.x}-${user.y}`);
    });
  }, [currentUser, users, insideRoom, message]);

  return canvasRef;
}


function drawAvatar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x * CELL_SIZE, y * CELL_SIZE, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(label, x * CELL_SIZE, y * CELL_SIZE + 40);
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