import { useMemo } from 'react';
import { CELL_SIZE, FURNITURE, INDIVIDUAL_TABLES } from '../Constants';

export function useCoordinates() {
  const validCoordinates = useMemo<Map<string, { x: number; y: number; id: number; name?: string }[]>>(() => {
    const map = new Map<string, { x: number; y: number; id: number; name?: string }[]>();

    FURNITURE.forEach((item) => {
      const px = item.x * CELL_SIZE;
      const py = item.y * CELL_SIZE;
      const roomCoords: { x: number; y: number; id: number }[] = [];

      item.chairs.forEach((chair) => {
        const cx = px + chair.dx * CELL_SIZE + CELL_SIZE / 2;
        const cy = py + chair.dy * CELL_SIZE + CELL_SIZE / 2;
        const cellX = Math.floor(cx / CELL_SIZE) + 1;
        const cellY = Math.floor(cy / CELL_SIZE) + 1;
        const isFacingUp = chair.rotate === 0;

        const adjacentCells = isFacingUp
          ? [
            { x: cellX - 1, y: cellY - 1 },
            { x: cellX + 1, y: cellY - 1 },
            { x: cellX - 1, y: cellY },
            { x: cellX, y: cellY - 1 },
            { x: cellX + 1, y: cellY },
          ]
          : [
            { x: cellX - 1, y: cellY + 1 },
            { x: cellX - 1, y: cellY },
            { x: cellX + 1, y: cellY + 1 },
            { x: cellX, y: cellY + 1 },
            { x: cellX + 1, y: cellY },
          ];

        adjacentCells.forEach((cell) => {
          roomCoords.push({ x: cell.x, y: cell.y, id: chair.chairId });
        });
      });

      const existing = map.get(item.room.name) ?? [];
      map.set(item.room.name, [...existing, ...roomCoords]);
    });

    let roomCoords: { x: number; y: number; id: number; name: string }[] = [];
    INDIVIDUAL_TABLES.forEach((item) => {
      const px = item.x * CELL_SIZE;
      const py = item.y * CELL_SIZE;

      item.chairs.forEach((chair: any) => {
        const cx = px + chair.dx * CELL_SIZE + CELL_SIZE / 2;
        const cy = py + chair.dy * CELL_SIZE + CELL_SIZE / 2;
        const cellX = Math.floor(cx / CELL_SIZE) + 1;
        const cellY = Math.floor(cy / CELL_SIZE) + 1;
        const isFacingUp = chair.rotate === 0;

        const adjacentCells = isFacingUp
          ? [
            { x: cellX - 1, y: cellY - 1 },
            { x: cellX + 1, y: cellY - 1 },
            { x: cellX - 1, y: cellY },
            { x: cellX, y: cellY - 1 },
            { x: cellX + 1, y: cellY },
          ]
          : [
            { x: cellX - 1, y: cellY + 1 },
            { x: cellX - 1, y: cellY },
            { x: cellX + 1, y: cellY + 1 },
            { x: cellX, y: cellY + 1 },
            { x: cellX + 1, y: cellY },
          ];

        adjacentCells.forEach((cell) => {
          roomCoords.push({ x: cell.x, y: cell.y, id: chair.chairId, name: item.name });
        });
      });

    });
    const existing = map.get("Table") ?? [];
    map.set("Table", [...existing, ...roomCoords]);
    console.log("map", map)
    return map;
  }, []);



  const invalidCoordinates = useMemo<Set<string>>(() => {
    const set = new Set<string>();

    FURNITURE.forEach((item) => {
      const px = item.x * CELL_SIZE;
      const py = item.y * CELL_SIZE;
      // const pw = item.width * CELL_SIZE;
      // const ph = item.height * CELL_SIZE;

      const r = item.room;
      const doorMid = Math.floor((r.minX + r.maxX) / 2);
      const doorCells = new Set([
        r.rotate === 0 ? `${doorMid - 1},${r.maxY}` : `${doorMid - 1},${r.minY}`,
        r.rotate === 0 ? `${doorMid},${r.maxY}` : `${doorMid},${r.minY}`,
        r.rotate === 0 ? `${doorMid + 1},${r.maxY}` : `${doorMid + 1},${r.minY}`,
      ]);

      const addIfNotDoor = (x: number, y: number) => {
        const key = `${x},${y}`;
        if (!doorCells.has(key)) set.add(key);
      };
      if (r.rotate == 0) {
        for (let i = 0; i < 20; i++) {
          addIfNotDoor(r.minX, r.minY + i);
          addIfNotDoor(r.minX + i, r.minY);
          addIfNotDoor(r.maxX, r.minY + i);
          addIfNotDoor(r.minX + i, r.maxY);
        }
      } else {
        for (let i = 0; i < 20; i++) {
          addIfNotDoor(r.minX + i, r.minY)
          addIfNotDoor(r.minX + i, r.maxY)
        }
        for (let i = r.minY; i < r.maxY; i++) {
          addIfNotDoor(r.minX, i)
          addIfNotDoor(r.maxX, i)
        }
      }

      const c = item.chairs
      c.forEach((c) => {
        const cx = px + c.dx * CELL_SIZE + CELL_SIZE / 2;
        const cy = py + c.dy * CELL_SIZE + CELL_SIZE / 2;
        console.log(Math.floor(cx / CELL_SIZE), Math.floor(cy / CELL_SIZE))
        const key = `${Math.floor(cx / CELL_SIZE) + 1},${Math.floor(cy / CELL_SIZE) + 1}`;
        set.add(key);
      })

    });

    INDIVIDUAL_TABLES.forEach((item) => {
      const px = item.x * CELL_SIZE;
      const py = item.y * CELL_SIZE;

      const c = item.chairs
      c.forEach((c: any) => {
        const cx = px + c.dx * CELL_SIZE + CELL_SIZE / 2;
        const cy = py + c.dy * CELL_SIZE + CELL_SIZE / 2;
        console.log(Math.floor(cx / CELL_SIZE) + 1, Math.floor(cy / CELL_SIZE) + 1)
        const key = `${Math.floor(cx / CELL_SIZE) + 1},${Math.floor(cy / CELL_SIZE) + 1}`;
        console.log('Adding invalid chair coordinate:', key);
        set.add(key);
      })
    });

    return set;
  }, []);

  return { validCoordinates, invalidCoordinates };
}