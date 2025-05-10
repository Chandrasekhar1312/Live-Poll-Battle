const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());

const server = app.listen(port, () => {
  console.log(`✅ HTTP server running on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

let rooms = {};

function createRoom() {
  const roomCode = Math.random().toString(36).substr(2, 5);
  rooms[roomCode] = {
    users: [],
    votes: { optionA: 0, optionB: 0 },
    votedUsers: new Set(),
    timer: null
  };
  console.log(`🟢 Room created: ${roomCode}`);
  return roomCode;
}

wss.on('connection', (ws) => {
  console.log("🔌 New WebSocket connection");

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    const { type } = data;

    if (type === 'create_room') {
      const roomCode = createRoom();
      ws.send(JSON.stringify({ type: 'room_created', roomCode }));
    }

    if (type === 'join_room') {
      const { roomCode, name, userId } = data;

      if (!rooms[roomCode]) {
        ws.send(JSON.stringify({ type: 'error', message: '❌ Room not found' }));
        return;
      }

      rooms[roomCode].users.push(ws);
      ws.roomCode = roomCode;
      ws.name = name;
      ws.userId = userId;

      console.log(`👤 ${name} joined room ${roomCode}`);

      ws.send(JSON.stringify({
        type: 'joined',
        roomCode,
        votes: rooms[roomCode].votes
      }));

      if (!rooms[roomCode].timer) {
        rooms[roomCode].timer = setTimeout(() => {
          broadcast(roomCode, { type: 'end_poll' });
          console.log(`⏱️ Poll ended in room ${roomCode}`);
        }, 60000);
      }
    }

    if (type === 'vote') {
      const { roomCode, userId, vote } = data;
      const room = rooms[roomCode];

      if (!room) return;
      if (room.votedUsers.has(userId)) {
        console.log(`⚠️ Duplicate vote from userId: ${userId}`);
        return;
      }

      room.votes[vote]++;
      room.votedUsers.add(userId);

      console.log(`✅ Vote in ${roomCode}: ${vote} by ${userId}`);
      broadcast(roomCode, {
        type: 'vote_update',
        votes: room.votes
      });
    }
  });

  ws.on('close', () => {
    console.log("🔌 WebSocket disconnected");
  });
});

function broadcast(roomCode, msg) {
  rooms[roomCode]?.users.forEach(user => {
    if (user.readyState === 1) {
      user.send(JSON.stringify(msg));
    }
  });
}
