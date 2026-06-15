import { useRef, useState, useCallback } from 'react';

/**
 * Manages the local media stream (camera + mic).
 *
 * Key design decisions:
 *  - A ref holds the authoritative stream so async callbacks always see the
 *    latest value without stale-closure issues.
 *  - State mirrors the ref purely for rendering (video element, UI toggles).
 */
export function useMedia() {
  const streamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const getAccess = useCallback(async (): Promise<MediaStream | null> => {
    // Return existing active stream instead of opening a new device session
    if (streamRef.current?.active) return streamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('getUserMedia failed:', err);
      return null;
    }
  }, []);

  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLocalStream(null);
  }, []);

  return { localStream, streamRef, getAccess, stopAll };
}