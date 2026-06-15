import { useRef, useState, useCallback } from 'react';
import { RTC_CONFIGURATION } from '../Constants';

interface UseWebRTCProps {
  /** Stable ref to the WebSocket so we never capture a stale socket. */
  wsRef: React.MutableRefObject<WebSocket | null>;
  /** Stable ref to the local MediaStream. */
  streamRef: React.MutableRefObject<MediaStream | null>;
  /** Called when we need a stream but streamRef is empty (lazy init). */
  getAccess: () => Promise<MediaStream | null>;
}

export function useWebRTC({ wsRef, streamRef, getAccess }: UseWebRTCProps) {
  const peerRef = useRef(new Map<string, RTCPeerConnection>());
  const pendingCandidates = useRef(new Map<string, RTCIceCandidateInit[]>());
  const [remoteStreams, setRemoteStreams] = useState(new Map<string, MediaStream>());

  // ─── helpers ──────────────────────────────────────────────────────────────

  const addRemoteTrack = useCallback((userId: string, track: MediaStreamTrack) => {
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      const stream = next.get(userId) ?? new MediaStream();
      if (!stream.getTracks().find((t) => t.id === track.id)) {
        stream.addTrack(track);
      }
      next.set(userId, stream);
      return next;
    });
  }, []);

  const sendIceCandidate = useCallback(
    (targetId: string, meetingId: string, candidate: RTCIceCandidate) => {
      wsRef.current?.send(
        JSON.stringify({
          type: 'add-ice-candidate',
          payload: { targetId, meetingId, candidate },
        })
      );
    },
    [wsRef]
  );

  const createPeer = useCallback(
    (userId: string, meetingId: string, stream: MediaStream): RTCPeerConnection => {
      const pc = new RTCPeerConnection(RTC_CONFIGURATION);
      peerRef.current.set(userId, pc);

      stream.getVideoTracks()[0] && pc.addTrack(stream.getVideoTracks()[0], stream);
      stream.getAudioTracks()[0] && pc.addTrack(stream.getAudioTracks()[0], stream);

      pc.onicecandidate = (e) => {
        if (e.candidate) sendIceCandidate(userId, meetingId, e.candidate);
      };

      pc.ontrack = (e) => addRemoteTrack(userId, e.track);

      return pc;
    },
    [addRemoteTrack, sendIceCandidate]
  );

  const drainPendingCandidates = useCallback(
    async (pc: RTCPeerConnection, userId: string) => {
      const queued = pendingCandidates.current.get(userId) ?? [];
      while (queued.length > 0) {
        const candidate = queued.shift()!;
        await pc.addIceCandidate(candidate).catch(console.error);
      }
    },
    []
  );

  // ─── public API ───────────────────────────────────────────────────────────

  const sendOffer = useCallback(
    async (targetId: string, meetingId: string) => {
      // Don't create duplicate connections
      const existing = peerRef.current.get(targetId);
      if (existing && existing.signalingState !== 'closed') return;

      const stream = streamRef.current ?? (await getAccess());
      if (!stream) return;

      const pc = createPeer(targetId, meetingId, stream);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current?.send(
          JSON.stringify({ type: 'offer', payload: { targetId, meetingId, sdp: offer } })
        );
      } catch (err) {
        console.error('sendOffer failed:', err);
      }
    },
    [streamRef, getAccess, createPeer, wsRef]
  );

  const receiveOffer = useCallback(
    async (message: any) => {
      const senderId: string = message.payload.senderId;
      const existing = peerRef.current.get(senderId);
      if (existing && existing.signalingState !== 'closed') return;

      const stream = streamRef.current ?? (await getAccess());
      if (!stream) return;

      const pc = createPeer(senderId, message.payload.meetingId, stream);

      await pc.setRemoteDescription(message.payload.sdp);
      await drainPendingCandidates(pc, senderId);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      wsRef.current?.send(
        JSON.stringify({
          type: 'answer',
          payload: { meetingId: message.payload.meetingId, targetId: senderId, sdp: answer },
        })
      );
    },
    [streamRef, getAccess, createPeer, drainPendingCandidates, wsRef]
  );

  const receiveAnswer = useCallback(
    async (message: any) => {
      const senderId: string = message.payload.senderId;
      const pc = peerRef.current.get(senderId);
      if (!pc || pc.signalingState === 'stable') return;

      await pc.setRemoteDescription(message.payload.sdp);
      await drainPendingCandidates(pc, senderId);
    },
    [drainPendingCandidates]
  );

  const addIceCandidate = useCallback(async (payload: any) => {
    const { candidate, senderId } = payload;
    if (!candidate || !senderId) return;

    const pc = peerRef.current.get(senderId);
    if (pc?.remoteDescription) {
      await pc.addIceCandidate(candidate).catch(console.error);
    } else {
      if (!pendingCandidates.current.has(senderId)) {
        pendingCandidates.current.set(senderId, []);
      }
      pendingCandidates.current.get(senderId)!.push(candidate);
    }
  }, []);

  const cleanupPeer = useCallback((userId: string) => {
    peerRef.current.get(userId)?.close();
    peerRef.current.delete(userId);
    pendingCandidates.current.delete(userId);
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const cleanupAllPeers = useCallback(() => {
    peerRef.current.forEach((pc) => pc.close());
    peerRef.current.clear();
    pendingCandidates.current.clear();
    setRemoteStreams(new Map());
  }, []);

  return {
    remoteStreams,
    sendOffer,
    receiveOffer,
    receiveAnswer,
    addIceCandidate,
    cleanupPeer,
    cleanupAllPeers,
  };
}