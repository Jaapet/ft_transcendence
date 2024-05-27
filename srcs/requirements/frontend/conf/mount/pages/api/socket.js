const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const express = require('express');

const app = express();
const server = http.createServer();
const io = new Server(server);

app.use(cors({
	origin: 'http://transcendence.gmcg.fr:50381',
	credentials: true // Si nécessaire
  }));

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('messageFromClient', (data) => {
    console.log('Received from client:', data);
    socket.emit('messageFromServer', { message: 'Message received!' });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
