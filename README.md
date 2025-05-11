

# 🗳️ Live Poll Battle

**Live Poll Battle** is a real-time web app where users can create or join a poll room and vote on one of two options. The vote results update instantly for all users in the room using WebSockets.

---

## ⚙️ Setup Instructions

Follow these steps to run the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/live-poll-battle.git
cd live-poll-battle
```

### 2. Start the backend server

```bash
cd server
npm install
node index.js
```

This starts the WebSocket server on `http://localhost:3001`.

### 3. Start the frontend React app

Open a new terminal window:

```bash
cd client
npm install
npm start
```

This starts the app on `http://localhost:3000`.

---

## 🌟 Features Implemented

### Frontend (ReactJS)

- Let user enter a unique name (no password)
- Create a new room or join an existing one using a room code
- Show a simple question with two voting options (e.g., “Cats vs Dogs”)
- Allow user to vote once
- Prevent re-voting and show "You have already voted" message
- Show live vote count updates from other users in the room
- Start a 60-second countdown when the room is created; block votes after timer ends
- Store vote information in `localStorage` so it stays after refresh

### Backend (NodeJS + WebSocket)

- Create and manage multiple poll rooms in memory
- Handle user connections and room joining
- Accept vote messages and broadcast updates to everyone in the room
- Keep vote state and timer per room (no database needed)

---

## 🧠 How Voting & Room State Works

The backend uses an in-memory JavaScript object to manage rooms. Each room has its own data: users, votes, timer, and whether voting is open or closed. When a user joins or votes, the server updates the room state and sends the update to all users in that room using WebSockets.

Rooms are completely separate, so multiple rooms can run at the same time without affecting each other. Since there's no database, all information resets when the server restarts. The frontend also uses localStorage to remember if a user has voted, even after refreshing the page.

---

✅ Built with simplicity, speed, and real-time interaction in mind.
# live-poll-battle
