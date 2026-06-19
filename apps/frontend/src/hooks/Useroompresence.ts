import { useRef, useState, useCallback } from 'react';
import { FURNITURE } from '../Constants';

export function useRoomPresence() {
  const [insideRoom, setInsideRoom]   = useState(false);
  const [currentRoom, setCurrentRoom] = useState('');
  const insideRoomRef  = useRef(false);
  const currentRoomRef = useRef('');

  const checkRoomPresence = useCallback((x: number, y: number) => {
    let foundRoom = '';

    for (const item of FURNITURE) {
      const r = item.room;
      if (x >= r.minX && x <= r.maxX && y >= r.minY && y <= r.maxY) {
        foundRoom = r.name;
        break;
      }
    }

    const changed = foundRoom !== currentRoomRef.current;
    if (!changed) return { insideRoom: insideRoomRef.current, currentRoom: currentRoomRef.current };

    const isInside = foundRoom !== '';
    insideRoomRef.current  = isInside;
    currentRoomRef.current = foundRoom;
    setInsideRoom(isInside);
    setCurrentRoom(foundRoom);

    return { insideRoom: isInside, currentRoom: foundRoom };
  }, []);

  return { insideRoom, currentRoom, insideRoomRef, currentRoomRef, checkRoomPresence };
}