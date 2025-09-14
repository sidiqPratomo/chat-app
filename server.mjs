
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);

const FE_URL = process.env.VITE_FE_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: [FE_URL],
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('user joined', (username) => {
    socket.broadcast.emit('user joined', username);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
