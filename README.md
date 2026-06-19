# 🌌 Meta-Verse — Real-Time 2D Metaverse with WebRTC Video Conferencing

> A production-grade, full-stack 2D virtual workspace where users create customizable spaces, walk around as avatars on a canvas-rendered map, enter meeting rooms, and automatically connect via peer-to-peer video calls — all in real-time.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=flat&logo=prisma&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSockets-010101?style=flat&logo=socketdotio&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=flat&logo=webrtc&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=flat&logo=turborepo&logoColor=white)

---

## ✨ What It Does

Meta-Verse is a **Gather.town-inspired** virtual workspace application. Users sign up, choose an avatar, create or join passcode-protected virtual spaces, and navigate a 2D canvas-rendered office floor plan in real-time. When users walk into designated **meeting rooms** or sit at **individual desks**, the system automatically initiates **peer-to-peer WebRTC video/audio calls** — no manual call setup needed.

### 🎬 Key Interactions
- **Arrow keys** — Move your avatar tile-by-tile across the map
- **Cmd + I** — Sit down at a nearby chair (triggers video call)
- **Cmd + K** — Stand up and leave the meeting
- Walk into a room boundary → camera auto-activates
- Walk out → camera auto-stops, all peer connections cleaned up

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MONOREPO (Turborepo)                     │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  apps/       │  apps/       │  apps/       │  packages/         │
│  frontend    │  http        │  ws          │  db                │
│  (React+Vite)│  (Express 5) │  (WebSocket) │  (Prisma+Postgres) │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│ • Canvas 2D  │ • REST API   │ • Room Mgr   │ • Schema Models    │
│   rendering  │ • JWT Auth   │ • Meeting    │ • PrismaClient     │
│ • WebRTC     │ • Bcrypt     │   Room Mgr   │ • PG Pool +        │
│   hooks      │ • Zod valid. │ • SDP/ICE    │   SSL adapter      │
│ • React      │ • RBAC       │   relay      │                    │
│   Router v7  │ • CRUD APIs  │ • Movement   │                    │
│              │              │   validation │                    │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

This is a **Turborepo monorepo** with 3 apps and 1 shared package, all written in **TypeScript** with strict type safety across the stack.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework with hooks-based architecture |
| **TypeScript** | End-to-end type safety |
| **Vite 8** | Lightning-fast dev server & HMR |
| **React Router v7** | Client-side routing (Landing, Signup, Login, Dashboard, Avatar, Arena) |
| **HTML5 Canvas API** | Custom 2D map rendering — grid, furniture, rooms, avatars drawn programmatically |
| **WebRTC (browser API)** | Peer-to-peer video/audio with ICE candidate exchange & SDP negotiation |
| **Tailwind CSS v4** | Utility-first styling |
| **Axios** | HTTP client for REST API communication |
| **Custom React Hooks** | `useWebRTC`, `useArenaCanvas`, `useMedia`, `useRoomPresence`, `useCoordinates` — clean separation of concerns |

### Backend — HTTP Server
| Technology | Purpose |
|---|---|
| **Express 5** | RESTful API server |
| **JWT (jsonwebtoken)** | Stateless authentication with role-based payloads |
| **Bcrypt** | Secure password hashing (10 salt rounds) |
| **Zod v4** | Runtime request validation schemas for all endpoints |
| **CORS** | Cross-origin resource sharing |
| **Role-Based Access Control** | Admin middleware guards admin-only routes; User middleware for authenticated routes |

### Backend — WebSocket Server
| Technology | Purpose |
|---|---|
| **ws** | Raw WebSocket server (no abstraction layers — full control) |
| **Singleton Pattern** | `RoomManager` and `MeetingRoomManager` as singleton services |
| **Custom Event Protocol** | `join`, `move`, `offer`, `answer`, `add-ice-candidate`, `init-call`, `user-joined`, `user-left` |
| **Server-Side Movement Validation** | Calculates displacement to prevent cheating — only 1-tile moves allowed |
| **WebRTC Signaling Server** | Relays SDP offers/answers and ICE candidates between peers |

### Database
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Primary relational database |
| **Prisma ORM v7** | Type-safe database client with migrations |
| **@prisma/adapter-pg** | Direct PostgreSQL pool adapter with SSL support for cloud deployments |
| **6 Models** | `User`, `Space`, `Element`, `spaceElements`, `Map`, `MapElements`, `Avatar` |

### DevOps & Tooling
| Technology | Purpose |
|---|---|
| **Turborepo** | Monorepo build orchestration with task caching & dependency graph |
| **npm Workspaces** | Package management across `apps/*` and `packages/*` |
| **Jest 30** | Integration test suite (1000+ lines covering Auth, CRUD, WebSocket flows) |
| **ESLint** | Linting with React Hooks plugin |
| **Prettier** | Code formatting |
| **tsx** | TypeScript execution with hot-reload for development |

---

## 🔥 Technical Highlights (What Makes This Stand Out)

### 1. Full WebRTC Implementation from Scratch
No third-party video SDK. Built the entire **WebRTC signaling flow** manually:
- Custom signaling server over raw WebSockets
- SDP offer/answer exchange
- ICE candidate trickle with pending queue (handles candidates arriving before remote description is set)
- Automatic peer connection lifecycle management (create → negotiate → stream → cleanup)

### 2. Canvas-Based 2D Game Engine
The entire virtual office is rendered on **HTML5 Canvas** — no game engine library:
- Grid system with configurable cell size
- Furniture rendering (rectangular tables, round tables, solo desks)
- Meeting room boundary detection with wall rendering and door gaps
- Avatar rendering with real-time position labels
- Dynamic canvas resizing based on room presence state

### 3. Real-Time Anti-Cheat Movement Validation
The WebSocket server validates every move server-side:
```
displacement = |currentX - newX| + |currentY - newY|
valid = (Xdisp <= 1 && Ydisp <= 1) && (Xdisp + Ydisp > 0)
```
Invalid movements are **rejected and the client is re-synced** to the last known good position.

### 4. Proximity-Based Video Activation
Video calls activate based on spatial context:
- **Meeting Rooms**: Walk through a room boundary → camera auto-starts → sit at a chair → join multi-party video call
- **Individual Tables**: Sit at any standalone desk → 1-on-1 video session
- **Leave**: Stand up or walk out → streams stop, all RTCPeerConnections cleanly closed

### 5. Singleton Room Management Architecture
Two manager classes orchestrate all real-time state:
- **`RoomManager`** — Maps `spaceId → User[]`, handles broadcast, join/leave
- **`MeetingRoomManager`** — Nested `Map<spaceId, Map<roomId, MeetingRoom>>`, manages video call rooms within spaces

### 6. Comprehensive Integration Test Suite
**1000+ lines** of end-to-end tests covering:
- Authentication flows (signup, signin, duplicate prevention)
- User metadata & avatar CRUD
- Space creation, deletion, ownership validation
- Element management within spaces
- Admin endpoint authorization guards
- WebSocket connection, room joining, and movement events

---

## 📂 Project Structure

```
meta-verse/
├── apps/
│   ├── frontend/          # React 19 + Vite SPA
│   │   └── src/
│   │       ├── Pages/     # Landing, Signup, Login, Dashboard, Avatar, Arena
│   │       ├── hooks/     # useWebRTC, useArenaCanvas, useMedia, useRoomPresence, useCoordinates
│   │       ├── Constants  # Room layouts, furniture configs, RTC config
│   │       └── types.ts   # Shared type definitions
│   ├── http/              # Express 5 REST API
│   │   └── src/
│   │       ├── routes/v1/ # user, space, admin routers + auth endpoints
│   │       ├── middlewares/# JWT auth + RBAC guards
│   │       └── types/     # Zod validation schemas
│   └── ws/                # WebSocket signaling + game server
│       └── src/
│           └── Managers/  # User, RoomManager, MeetingRoom, MeetingRoomManager
├── packages/
│   └── db/                # Shared Prisma client + PostgreSQL schema
│       ├── prisma/schema.prisma
│       └── src/index.ts   # PG pool with cloud SSL support
├── tests/                 # Jest integration test suite
├── turbo.json             # Turborepo pipeline config
└── package.json           # Workspace root
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL instance (local or cloud)

### Setup
```bash
git clone https://github.com/nishant25kr/meta-verse.git
cd meta-verse
npm install

# Configure environment variables
# packages/db/.env  → DATABASE_URL
# apps/http/.env    → JWT_SECRET, PORT
# apps/ws/.env      → JWT_SECRET
# apps/frontend/.env → VITE_BACKEND_URL

# Initialize database
cd packages/db
npx prisma generate
npx prisma db push

# Run all services concurrently
cd ../..
npm run dev
```

---

## 📄 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/signup` | — | Register new user (user/admin) |
| POST | `/api/v1/signin` | — | Login & receive JWT |
| POST | `/api/v1/user/metadata` | User | Update avatar |
| GET | `/api/v1/user/metadata/bulk` | User | Batch fetch user avatars |
| PUT | `/api/v1/user/add-avatar` | User | Set user avatar |
| POST | `/api/v1/space` | User | Create a new space |
| GET | `/api/v1/space/all` | — | List all spaces |
| GET | `/api/v1/space/:id/:passcode` | — | Get space by ID + passcode |
| POST | `/api/v1/space/element` | User | Add element to space |
| DELETE | `/api/v1/space/element` | User | Remove element from space |
| DELETE | `/api/v1/space/:spaceId` | User | Delete owned space |
| POST | `/api/v1/admin/element` | Admin | Create global element |
| PUT | `/api/v1/admin/element` | Admin | Update element |
| POST | `/api/v1/admin/avatar` | Admin | Create avatar option |
| GET | `/api/v1/admin/avatar` | Admin | List all avatars |
| POST | `/api/v1/admin/map` | Admin | Create map template |

---

## 🧪 WebSocket Event Protocol

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join` | Client → Server | Join a space with token + passcode |
| `space-joined` | Server → Client | Confirm join with spawn point + existing users |
| `user-joined` | Server → Room | Broadcast new user to all in space |
| `move` | Bidirectional | Send/receive position updates |
| `movement-rejected` | Server → Client | Re-sync client after invalid move |
| `user-left` | Server → Room | Broadcast user departure |
| `init-call` | Server → Client | Trigger WebRTC negotiation for meeting room |
| `offer` / `answer` | Relayed | SDP exchange via signaling server |
| `add-ice-candidate` | Relayed | ICE candidate trickle |
| `user-left-meeting` | Server → Room | Cleanup video call when user stands up |

---

## 📬 Contact

Built with 💻 by **Nishant Kumar**

---

*This project demonstrates proficiency in real-time systems, WebRTC, WebSocket architecture, full-stack TypeScript, relational database design, monorepo tooling, and integration testing.*
