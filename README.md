# Meta-Verse 🌌

A full-stack, real-time 2D Metaverse application. Users can create virtual spaces, customize avatars, interact with map elements, and move around to interact with others in real-time.

## Features

### 👤 Users & Avatars
- **Authentication:** Secure user registration and login using JWTs.
- **Avatars:** Users can customize their digital appearance by selecting from a variety of avatars.
- **Roles:** Role-based access control, offering special privileges to Admin users (e.g., creating base maps and elements).

### 🌍 Spaces & Maps
- **Custom Spaces:** Users can create their own virtual Spaces with custom dimensions (e.g., width & height).
- **Elements:** Spaces can be populated with `Elements` (e.g., chairs, desks, walls).
- **Predefined Maps:** The platform offers built-in default Maps that come pre-populated with map elements for users to explore.

### 🏃‍♂️ Real-Time Interaction (WebSockets)
The core of the Metaverse is driven by a custom WebSocket server managing real-time connections:
- **Join Rooms:** When a user enters a space, they spawn at a calculated coordinate (X, Y) and are subscribed to events in that specific room.
- **Live Movement (Broadcasting):** As the user walks around the map, their position is broadcasted to everyone else in the same room.
- **Movement Validation:** Real-time cheat protection! The server calculates the displacement of coordinates `(moveX, moveY)` to ensure a player only moves 1 tile at a time. Illegal movements are immediately rejected by the server and re-synced.
- **Presence Notifications:** All players in a room receive a real-time notification when a user joins or leaves.

## Architecture & Codebase

The platform is organized into three major pieces:

1. **HTTP Server (`apps/http`)**
   Built with Express.js, providing the REST API for the application:
   - `/api/v1/user`: Registration, login, and profile (avatar) updates.
   - `/api/v1/space`: Creating custom spaces, fetching elements in a space, or dropping new map elements inside.
   - `/api/v1/admin`: Admin-only routes for creating global `Elements`, `Maps`, and uploading `Avatars`.

2. **WebSocket Server (`apps/ws`)**
   Built with `ws`. Responsible for keeping the live state of all active connected WebSockets. It acts as a Room Manager that multiplexes players into their correct `spaceId`.
   - Event handlers for `join`, `move`, `user-joined`, and `user-left`.

3. **Database (`packages/db`)**
   The source of truth managing everything from players to XY-coordinates of elements. Powered by PostgreSQL and Prisma ORM.

## Database Schema (Prisma)

The application uses a highly relational setup:
- **User:** `id`, `username`, `password`, `avatarId`, `role`
- **Space:** Defines `width`/`height` and belongs to a `User` (creator).
- **Element:** Global objects with a specific `imageUrl`, `width`, `height`, and whether they are `static` (collidable).
- **spaceElements / MapElements:** Junction tables mapping Elements to Spaces (or Maps) with specific `x, y` positions.

## Local Development

### Prerequisites
- Node.js (>= 18)
- PostgreSQL

### Getting Started
1. Clone the project and run `npm install` in the root directory.
2. Set up your `.env` files with your `DATABASE_URL` and `JWT_SECRET`.
3. Initialize the Prisma database:
   ```bash
   cd packages/db
   npx prisma generate
   npx prisma db push
   ```
4. Start both the HTTP and WebSocket servers concurrently from the root directory:
   ```bash
   npm run dev
   ```

*(This repository is a monorepo powered by Turborepo, making it easy to run all projects concurrently).*
