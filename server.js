const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

// room code -> { state: object|null, clients: Set<WebSocket> }
const rooms = new Map();

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, 'public', filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  let joinedRoom = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }

    if (msg.type === 'join') {
      joinedRoom = String(msg.room || '').toUpperCase();
      if (!joinedRoom) return;
      if (!rooms.has(joinedRoom)) rooms.set(joinedRoom, { state: null, clients: new Set() });
      const room = rooms.get(joinedRoom);
      room.clients.add(ws);
      // send the current known state (if any) to the newcomer
      if (room.state) {
        ws.send(JSON.stringify({ type: 'state', state: room.state }));
      }
      return;
    }

    if (msg.type === 'state' && joinedRoom) {
      const room = rooms.get(joinedRoom);
      if (!room) return;
      room.state = msg.state;
      for (const client of room.clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'state', state: msg.state }));
        }
      }
    }
  });

  ws.on('close', () => {
    if (joinedRoom && rooms.has(joinedRoom)) {
      rooms.get(joinedRoom).clients.delete(ws);
      // clean up empty rooms after a while to avoid unbounded memory growth
      const room = rooms.get(joinedRoom);
      if (room.clients.size === 0) {
        setTimeout(() => {
          if (rooms.has(joinedRoom) && rooms.get(joinedRoom).clients.size === 0) {
            rooms.delete(joinedRoom);
          }
        }, 1000 * 60 * 30); // 30 min grace period
      }
    }
  });
});

server.listen(PORT, () => console.log('Sequence live server listening on port ' + PORT));
