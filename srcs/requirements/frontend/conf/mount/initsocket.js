const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');

console.log("init socketssss\n\n\n\n\n\n");
const app = express();
// Configurer CORS pour permettre les requêtes depuis toutes les origines (pour le prototype seulement)
app.use(cors({
  origin: '*',  // Permettre toutes les origines
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Si nécessaire
}));

// Middleware pour définir les en-têtes CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use('/websocket', (req, res, next) => {
	console.log('Request received on /websocket');
	next();
  });
// Exemple de route pour tester le serveur
app.get('/websocket', (req, res) => {
  res.send('Hello World!');
});


// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.io avec le serveur HTTP
const io = new Server(server, {
  cors: {
    origin: '*',  // Permettre toutes les origines
    methods: ['GET', 'POST'],
    credentials: true // Si nécessaire
  }
});

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

const PORT = `3001`;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
