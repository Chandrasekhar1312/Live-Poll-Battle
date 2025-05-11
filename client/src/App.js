import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

let socket;

function App() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [votes, setVotes] = useState({ optionA: 0, optionB: 0 });
  const [hasVoted, setHasVoted] = useState(false);
  const [timer, setTimer] = useState(60);
  const userId = useRef(uuidv4());
  const timerRef = useRef();

  useEffect(() => {
    socket = new WebSocket('ws://localhost:3001');

    socket.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.type === 'room_created') {
        setRoomCode(data.roomCode);
        joinRoom(data.roomCode);
      }

      if (data.type === 'joined') {
        setInRoom(true);
        setVotes(data.votes);
        const voted = localStorage.getItem(`${data.roomCode}-${userId.current}`) === 'voted';
        setHasVoted(voted);
        startTimer();
      }

      if (data.type === 'vote_update') {
        console.log('[CLIENT] Vote update:', data.votes);
        setVotes(data.votes);
      }

      if (data.type === 'end_poll') {
        clearInterval(timerRef.current);
        alert("⏱️ Poll has ended!");
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const createRoom = () => {
    socket.send(JSON.stringify({ type: 'create_room' }));
  };

  const joinRoom = (code) => {
    socket.send(JSON.stringify({
      type: 'join_room',
      roomCode: code || roomCode,
      name,
      userId: userId.current
    }));
  };

  const vote = (option) => {
    if (hasVoted || timer === 0) return;

    socket.send(JSON.stringify({
      type: 'vote',
      roomCode,
      userId: userId.current,
      vote: option
    }));

    setHasVoted(true);
    localStorage.setItem(`${roomCode}-${userId.current}`, 'voted');
  };

  const startTimer = () => {
    setTimer(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!inRoom) {
    return (
      <div>
        <h2>Enter Your Name:</h2>
        <input value={name} onChange={e => setName(e.target.value)} />
        <br /><br />
        <button onClick={createRoom}>Create Room</button>
        <br /><br />
        <input value={roomCode} onChange={e => setRoomCode(e.target.value)} placeholder="Enter Room Code" />
        <button onClick={() => joinRoom()}>Join Room</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Room Code: {roomCode}</h2>
      <h3>Live Poll: 🐱 Cats vs 🐶 Dogs</h3>
      <button disabled={hasVoted || timer === 0} onClick={() => vote('optionA')}>Vote Cats</button>
      <button disabled={hasVoted || timer === 0} onClick={() => vote('optionB')}>Vote Dogs</button>
      <p>🐱 Cats: {votes.optionA} | 🐶 Dogs: {votes.optionB}</p>
      <p>{hasVoted ? "✅ You have voted!" : "🗳️ Cast your vote!"}</p>
      <p>⏳ Time left: {timer}s</p>
    </div>
  );
}

export default App;
