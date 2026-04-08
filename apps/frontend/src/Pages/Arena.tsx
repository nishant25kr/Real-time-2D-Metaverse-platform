import { useEffect, useRef, useState } from 'react';
import type { Furniture } from '../types';

const CELL_SIZE = 20;

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

export const Arena = () => {
  const canvasRef = useRef<any>(null);
  const wsRef = useRef<any>(null);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [users, setUsers] = useState(new Map());
  const [chairCordinates, setChairCordinates] = useState<object[]>([])
  const [possibleChairToSit, setPossibleChairToSit] = useState<number>(0)
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack>()
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack>()
  const [isinsideRoom, setisinsideRoom] = useState<boolean>(false)
  const peerRef = useRef(new Map<string, RTCPeerConnection>())
  const localVideoRef: any = useRef(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map<string, MediaStream>())
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoTrackRef = useRef<MediaStreamTrack | undefined>(undefined);
  const localAudioTrackRef = useRef<MediaStreamTrack | undefined>(undefined);
  const onMessageRef = useRef<any>(null);

  const rooms = [
    { minX: 1, maxX: 20, minY: 1, maxY: 20, name: "Room A" },
    { minX: 21, maxX: 40, minY: 1, maxY: 20, name: "Room B" },
    { minX: 41, maxX: 60, minY: 1, maxY: 20, name: "Room C" },
    { minX: 1, maxX: 20, minY: 30, maxY: 42, name: "Room D" },
    { minX: 22, maxX: 42, minY: 30, maxY: 42, name: "Room E" }
  ];

  const furniture: Furniture[] = [
    {
      id: 'table-a1', type: 'rect-table', x: 2, y: 4, width: 16, height: 6,
      label: 'Meeting',
      chairs: [
        { dx: 1, dy: -1, rotate: 0, chairId: 1 },
        { dx: 5, dy: -1, rotate: 0, chairId: 2 },
        { dx: 9, dy: -1, rotate: 0, chairId: 3 },
        { dx: 13, dy: -1, rotate: 0, chairId: 4 },

        { dx: 1, dy: 6, rotate: 180, chairId: 5 },
        { dx: 5, dy: 6, rotate: 180, chairId: 6 },
        { dx: 9, dy: 6, rotate: 180, chairId: 7 },
        { dx: 13, dy: 6, rotate: 180, chairId: 8 },
      ]
    },
    {
      id: 'table-a1', type: 'rect-table', x: 22, y: 4, width: 16, height: 6,
      label: 'Meeting',
      chairs: [
        { dx: 1, dy: -1, rotate: 0, chairId: 1 },
        { dx: 5, dy: -1, rotate: 0, chairId: 2 },
        { dx: 9, dy: -1, rotate: 0, chairId: 3 },
        { dx: 13, dy: -1, rotate: 180, chairId: 4 },

        { dx: 1, dy: 6, rotate: 180, chairId: 5 },
        { dx: 5, dy: 6, rotate: 180, chairId: 6 },
        { dx: 9, dy: 6, rotate: 180, chairId: 7 },
        { dx: 13, dy: 6, rotate: 180, chairId: 8 },
      ]
    }
  ];

  const cleanupConnection = () => {
    peerRef.current.forEach(pc => pc.close());
    peerRef.current.clear();
    pendingCandidates.current.clear();
    setRemoteStreams(new Map());

    const stream = localStreamRef.current || localStream;
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }

    localVideoTrackRef.current?.stop();
    localAudioTrackRef.current?.stop();
    localVideoTrack?.stop();
    localAudioTrack?.stop();

    localStreamRef.current = null;
    localVideoTrackRef.current = undefined;
    localAudioTrackRef.current = undefined;
    setLocalStream(null);
    setLocalVideoTrack(undefined);
    setLocalAudioTrack(undefined);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  async function getAccess() {
    if (localStreamRef.current && localStreamRef.current.active) {
      return localStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      localStreamRef.current = stream;
      localVideoTrackRef.current = videoTrack;
      localAudioTrackRef.current = audioTrack;

      setLocalStream(stream);
      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      return stream
    } catch (err) {
    }
  }

  async function checkNearChair(x: any, y: any) {
    chairCordinates.forEach((e: any) => {
      const validCordinates = e.direction ? [
        { x: e.x - 1, y: e.y - 1 },
        { x: e.x + 1, y: e.y - 1 },
        { x: e.x - 1, y: e.y },
        { x: e.x, y: e.y - 1 },
        { x: e.x + 1, y: e.y },
      ] : [
        { x: e.x - 1, y: e.y + 1 },
        { x: e.x - 1, y: e.y },
        { x: e.x + 1, y: e.y + 1 },
        { x: e.x, y: e.y + 1 },
        { x: e.x + 1, y: e.y },
      ]

      validCordinates.forEach((c) => {
        if (c.x == x && c.y == y) {
          setCurrentUser((prev: any) => ({
            ...prev,
            message: `cmd+I to sit in chair`
          }))
          setPossibleChairToSit(e.chairId)
        } else {
          if (possibleChairToSit != 0) {
            setPossibleChairToSit(0)
          }
          setCurrentUser((prev: any) => {
            if (prev.message) {
              const { message, ...rest } = prev;
              return rest;
            }
            return prev;
          })
        }
      })

    })
  }

  function CheckisinsideRoom(x: any, y: any) {
    const inside = rooms.some(room =>
      x >= room.minX && x <= room.maxX && y >= room.minY && y <= room.maxY
    );


    if (!inside && localStreamRef.current) {
      cleanupConnection();
    }

    return inside;
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || '';
    const spaceId = urlParams.get('spaceId') || '';

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
      onMessageRef.current?.(message);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      cleanupConnection();
    };
  }, []);

  async function sendOffer(i: string) {
    if (peerRef.current.has(i)) {
      const existing = peerRef.current.get(i);
      if (existing?.signalingState !== 'closed') return;
    }

    let stream: any = localStreamRef.current;
    if (!stream) {
      stream = await getAccess();
    }

    if (!stream) {
      return;
    }

    const pc = new RTCPeerConnection(configuration);
    peerRef.current.set(i, pc);

    const vTrack = stream.getVideoTracks()[0];
    const aTrack = stream.getAudioTracks()[0];

    if (vTrack) pc.addTrack(vTrack, stream);
    if (aTrack) pc.addTrack(aTrack, stream);

    pc.onicecandidate = (e) => {
      if (!e.candidate) return;

      wsRef.current?.send(JSON.stringify({
        type: "add-ice-candidate",
        payload: {
          targetId: i,
          meetingId: "meetingRoom1",
          candidate: e.candidate
        }
      }));
    };

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        const existingStream = next.get(i) || new MediaStream();
        if (!existingStream.getTracks().find(t => t.id === event.track.id)) {
          existingStream.addTrack(event.track);
        }
        next.set(i, existingStream);
        return next;
      });
    };

    try {

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);


      wsRef.current?.send(JSON.stringify({
        type: "offer",
        payload: {
          targetId: i,
          meetingId: "meetingRoom1",
          sdp: offer
        }
      }));

    } catch (err) {

    }
  }

  async function receiveOffer(message: any) {
    const senderId = message.payload.senderId;

    let currentStream: MediaStream | null = localStreamRef.current;
    if (!currentStream) {
      currentStream = await getAccess() as MediaStream;
    }

    if (peerRef.current.has(senderId)) {
      const existing = peerRef.current.get(senderId);
      if (existing?.signalingState !== 'closed') return;
    }

    const pc = new RTCPeerConnection(configuration);
    peerRef.current.set(senderId, pc);

    if (currentStream) {
      const vTrack = currentStream.getVideoTracks()[0];
      const aTrack = currentStream.getAudioTracks()[0];
      if (vTrack) pc.addTrack(vTrack, currentStream);
      if (aTrack) pc.addTrack(aTrack, currentStream);
    }

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        const existingStream = next.get(senderId) || new MediaStream();

        if (!existingStream.getTracks().find(t => t.id === event.track.id)) {
          existingStream.addTrack(event.track);
        }

        next.set(senderId, existingStream);
        return next;
      });
    };

    pc.onicecandidate = (e) => {
      if (!e.candidate) return;

      wsRef.current?.send(JSON.stringify({
        type: "add-ice-candidate",
        payload: {
          meetingId: "meetingRoom1",
          targetId: senderId,
          candidate: e.candidate
        }
      }));
    };

    await pc.setRemoteDescription(message.payload.sdp);

    // Process queued candidates
    const queued = pendingCandidates.current.get(senderId) || [];
    while (queued.length > 0) {
      const candidate = queued.shift();
      if (candidate) pc.addIceCandidate(candidate);
    }

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    wsRef.current?.send(JSON.stringify({
      type: "answer",
      payload: {
        meetingId: "meetingRoom1",
        targetId: senderId,
        sdp: answer
      }
    }));
  }

  async function onAnswerReceive(message: any) {
    const senderId = message.payload.senderId;
    const pc = peerRef.current.get(senderId);
    if (!pc || pc.signalingState === 'stable') return;
    await pc.setRemoteDescription(message.payload.sdp);

    // Process queued candidates
    const queued = pendingCandidates.current.get(senderId) || [];
    while (queued.length > 0) {
      const candidate = queued.shift();
      if (candidate) pc.addIceCandidate(candidate)
    }
  }

  const handleWebSocketMessage = async (message: any) => {
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
            users.set(message.payload.id, user);
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
        const leftUserId = message.payload.id;
        setUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.delete(leftUserId);
          return newUsers;
        });
        // Cleanup WebRTC if user left completely
        cleanupPeerConnection(leftUserId);
        break;

      case 'user-left-meeting':
        // Cleanup WebRTC when user leaves meeting area
        cleanupPeerConnection(message.payload.userId);
        break;

      case "offer":
        await receiveOffer(message)
        break;

      case "answer":
        await onAnswerReceive(message)
        break;

      case "add-ice-candidate":
        const { candidate, senderId: iceSenderId } = message.payload;

        if (!candidate || !iceSenderId) return;

        try {
          const pc = peerRef.current.get(iceSenderId);
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(candidate);
          } else {
            if (!pendingCandidates.current.has(iceSenderId)) {
              pendingCandidates.current.set(iceSenderId, []);
            }
            pendingCandidates.current.get(iceSenderId)!.push(candidate);
          }
        } catch (err) {

        }
        break;

      case "init-call":
        const id = message.payload.id;
        const ids = id.filter((e: string) => e !== currentUser?.userId);
        ids.forEach((i: string) => {
          sendOffer(i)
        })
        break;

    }
  };

  // Update the message handler ref every render to keep it fresh
  onMessageRef.current = handleWebSocketMessage;

  const cleanupPeerConnection = (userId: string) => {
    const pc = peerRef.current.get(userId);
    if (pc) {
      pc.close();
      peerRef.current.delete(userId);
    }
    pendingCandidates.current.delete(userId);
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  };

  const handleMove = (newX: any, newY: any) => {
    if (!currentUser) return;
    checkNearChair(newX, newY)
    const inside = CheckisinsideRoom(newX, newY)
    wsRef.current.send(JSON.stringify({
      type: 'move',
      payload: {
        x: newX,
        y: newY,
        userId: currentUser.userId,
        isinsideRoom: inside,
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
        const cy = py + chair.dy * CELL_SIZE + CELL_SIZE / 2
        const id = chair.chairId
        const direction: boolean = chair.rotate == 0 ? true : false
        setChairCordinates((prev: any) => {
          const newX = Math.floor(cx / CELL_SIZE) + 1;
          const newY = Math.floor(cy / CELL_SIZE) + 1;

          const exists = prev.some((c: any) => c.x === newX && c.y === newY);
          if (exists) return prev;

          return [...prev, { x: newX, y: newY, chairId: id, direction }];
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
    });


    if (currentUser && currentUser.x) {
      ctx.beginPath();
      ctx.fillStyle = '#FF6B6B';
      ctx.arc(currentUser.x * CELL_SIZE, currentUser.y * CELL_SIZE, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${currentUser.x}-${currentUser.y} ${currentUser.message ? `${currentUser.message}` : ""}`, currentUser.x * CELL_SIZE, currentUser.y * CELL_SIZE + 40);
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
      if (possibleChairToSit) {
        furniture[0].chairs.forEach((e) => {
          if (e.chairId === possibleChairToSit) {
            const px = 3 * CELL_SIZE;
            const py = 4 * CELL_SIZE;
            const cx = px + e.dx * CELL_SIZE + CELL_SIZE / 2;
            const cy = py + e.dy * CELL_SIZE + CELL_SIZE / 2;
            const x = Math.floor(cx / CELL_SIZE) + 1;
            const y = Math.floor(cy / CELL_SIZE) + 1;
            setCurrentUser(prev => ({ ...prev, x, y }))
            handleMove(x, y)
          }
        })
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

  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      const stream = new MediaStream([localVideoTrack]);
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(() => { });
    }
  }, [localVideoTrack]);

  return (
    <div className="" onKeyDown={handleKeyDown} tabIndex={0}>
      <h1>{JSON.stringify(currentUser.userId)}</h1>
      <div className="flex gap-7 mt-4">
        <div className='relative'>

          <p className="absolute top-0 left-0 bg-black/50 text-white text-xs p-1">{currentUser.userId}</p>
          <video
            ref={(el) => {
                  localVideoRef.current = el;
                  if (el) el.srcObject = localStream;
                }}
            autoPlay
            playsInline
            muted
            className="w-40 h-32 bg-black object-cover rounded-lg"
          />
        </div>

        <div className=" flex flex-wrap  gap-7 ">
          {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
            <div key={userId} className="relative">
              <p className="absolute top-0 left-0 bg-black/50 text-white text-xs p-1">{userId}</p>
              <video
                autoPlay
                playsInline
                muted
                ref={(el) => {
                  if (el) el.srcObject = stream;
                }}
                className="w-40 h-32 bg-black object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
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