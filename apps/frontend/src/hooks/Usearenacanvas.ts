import { useEffect, useRef } from 'react';
import { CELL_SIZE, FURNITURE, INDIVIDUAL_TABLES } from '../Constants';
import type { Furniture } from '../types';

interface CanvasProps {
  currentUser: { x: number; y: number; userId: string; username: string } | null;
  users: Map<string, any>;
  insideRoom: boolean;
  message: string;
  avatar: any;
}

// Image cache to prevent flickering on every re-render
const imageCache = new Map<string, HTMLImageElement>();

function getCachedImage(url: string): HTMLImageElement | null {
  if (!url) return null;
  const cached = imageCache.get(url);
  if (cached && cached.complete && cached.naturalWidth > 0) return cached;

  if (!cached) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    imageCache.set(url, img);
  }
  return null;
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

    // Grid
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x < canvas.width; x += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Furniture & rooms
    FURNITURE.forEach((item) => drawTable(ctx, item));

    FURNITURE.forEach((item) => {
      const room = item.room;

      const sx = room.minX * CELL_SIZE;
      const sy = room.minY * CELL_SIZE;
      const w  = (room.maxX - room.minX) * CELL_SIZE;
      const h  = (room.maxY - room.minY) * CELL_SIZE;

      ctx.beginPath();
      ctx.roundRect(sx, sy, w, h, 1);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 13;
      ctx.stroke();

      room.rotate === 0
        ? `${ctx.clearRect(sx + w / 2 - 30, sy + h - 7, 60, 20)}`
        : `${ctx.clearRect(sx + w / 2 - 30, sy - 7, 60, 20)}`;
    });

    INDIVIDUAL_TABLES.forEach((item) => {
      drawTable(ctx, item);
    });

    // Draw other users first (so current user renders on top)
    users.forEach((user) => {
      if (!user.x) return;
      const imgUrl = user.avatar?.imageUrl ?? '';
      drawAvatar(ctx, user.x, user.y, user.username, imgUrl, false);
    });

    // Draw current user
    if (currentUser?.x) {
      drawAvatar(ctx, currentUser.x, currentUser.y, currentUser.username, avatar, true, message);
    }
  }, [currentUser, users, insideRoom, message, avatar]);

  return canvasRef;
}

const AVATAR_RADIUS = 14;

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  username: string,
  imageUrl: string,
  isCurrentUser: boolean,
  statusMessage?: string
) {
  const pixelX = x * CELL_SIZE;
  const pixelY = y * CELL_SIZE;
  const centerX = pixelX;
  const centerY = pixelY;

  ctx.save();

  // --- Outer ring ---
  ctx.beginPath();
  ctx.arc(centerX, centerY, AVATAR_RADIUS + 2, 0, Math.PI * 2);
  if (isCurrentUser) {
    ctx.fillStyle = '#6366f1';
  } else {
    ctx.fillStyle = '#e2e8f0';
  }
  ctx.fill();

  // --- Avatar circle (image or fallback) ---
  const img = getCachedImage(imageUrl);
  if (img) {
    // Clip to circle and draw image
    ctx.beginPath();
    ctx.arc(centerX, centerY, AVATAR_RADIUS, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      img,
      centerX - AVATAR_RADIUS,
      centerY - AVATAR_RADIUS,
      AVATAR_RADIUS * 2,
      AVATAR_RADIUS * 2
    );
    ctx.restore();
    ctx.save();
  } else {
    // Fallback: colored circle with initial
    ctx.beginPath();
    ctx.arc(centerX, centerY, AVATAR_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = isCurrentUser ? '#818cf8' : '#cbd5e1';
    ctx.fill();

    // Draw initial letter
    const initial = (username || '?').charAt(0).toUpperCase();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, centerX, centerY + 1);
  }

  // --- Username pill below avatar ---
  const nameText = username || 'User';
  const displayName = nameText.length > 10 ? nameText.slice(0, 9) + '…' : nameText;
  ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const nameWidth = ctx.measureText(displayName).width;
  const pillW = nameWidth + 8;
  const pillH = 14;
  const pillX = centerX - pillW / 2;
  const pillY = centerY + AVATAR_RADIUS + 4;

  // Pill background
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 4);
  ctx.fillStyle = isCurrentUser ? '#6366f1' : '#1e293b';
  ctx.fill();

  // Pill text
  ctx.fillStyle = '#ffffff';
  ctx.fillText(displayName, centerX, pillY + 2.5);

  // --- Status message tooltip (only for current user) ---
  if (isCurrentUser && statusMessage && statusMessage !== 'Go near a chair') {
    ctx.font = '9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const msgWidth = ctx.measureText(statusMessage).width;
    const tooltipW = msgWidth + 12;
    const tooltipH = 16;
    const tooltipX = centerX - tooltipW / 2;
    const tooltipY = centerY - AVATAR_RADIUS - tooltipH - 6;

    // Tooltip bg
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipW, tooltipH, 4);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fill();

    // Tooltip arrow
    ctx.beginPath();
    ctx.moveTo(centerX - 4, tooltipY + tooltipH);
    ctx.lineTo(centerX, tooltipY + tooltipH + 4);
    ctx.lineTo(centerX + 4, tooltipY + tooltipH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fill();

    // Tooltip text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(statusMessage, centerX, tooltipY + 3);
  }

  ctx.restore();
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