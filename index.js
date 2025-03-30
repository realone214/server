
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');

const { Server } = require('socket.io');
const port = process.env.PORT || 3001;
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, { 
  cors: { 
    origin: "https://server-1-sxdl.onrender.com", 
    methods: ["GET", "POST"],
  },
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const rooms = {};
const activeUsers = {};
const allMessages = {};

io.on('connection', (socket) => {
  socket.on('join_room', ({ room, userName }) => {
    socket.join(room);
    socket.userName = userName;

    if (!rooms[room]) {
      rooms[room] = [];
    }

    if (!activeUsers[room]) {
      activeUsers[room] = new Set();
    }

    activeUsers[room].add(userName);
    io.to(room).emit('active_users', Array.from(activeUsers[room]));

    rooms[room].push(socket.id);
    socket.emit('joined_room', room);
    socket.to(room).emit('update_user_count', { room, userCount: rooms[room].length });

    if (allMessages[room]) {
      socket.emit('all_messages', allMessages[room]);
    }
  });

  socket.on('send_message', (data) => {
    if (!allMessages[data.room]) {
      allMessages[data.room] = [];
    }
    allMessages[data.room].push(data);
    socket.to(data.room).emit('receive_message', data);
    socket.emit('receive_message', data); // Echo back to the sender
  });

  socket.on('leave_room', ({ room, userName }) => {
    if (activeUsers[room]) {
      activeUsers[room].delete(userName);
      io.to(room).emit('active_users', Array.from(activeUsers[room]));
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    for (const room in activeUsers) {
      if (activeUsers[room].has(socket.userName)) {
        activeUsers[room].delete(socket.userName);
        io.to(room).emit('active_users', Array.from(activeUsers[room]));
      }
    }
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
