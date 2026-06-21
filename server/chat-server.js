/**
 * chat-server.js — Maharani Bridal Real-Time Chat Server
 *
 * WebSocket server (ws) running on port 8080.
 * Rooms are keyed by bookingId (e.g. "BK-123456").
 * Message history is stored in-memory per room for the session.
 *
 * Protocol (JSON over WS):
 *   Client → Server:
 *     { type: 'join',    roomId, senderName, senderRole }        // 'customer' | 'artist'
 *     { type: 'message', roomId, senderName, senderRole, text }
 *     { type: 'typing',  roomId, senderName, isTyping }
 *
 *   Server → Client:
 *     { type: 'history',  messages: [...] }
 *     { type: 'message',  ... }
 *     { type: 'presence', onlineCount, names: [...] }
 *     { type: 'typing',   senderName, isTyping }
 *     { type: 'error',    message }
 */

import { WebSocketServer, WebSocket } from 'ws';

const PORT = 8080;
const wss  = new WebSocketServer({ port: PORT });

// rooms: Map<roomId, { clients: Set<ws>, history: Message[] }>
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { clients: new Set(), history: [] });
  }
  return rooms.get(roomId);
}

function broadcast(room, payload, exclude = null) {
  const data = JSON.stringify(payload);
  for (const client of room.clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

function broadcastAll(room, payload) {
  broadcast(room, payload, null);
}

wss.on('connection', (ws) => {
  let currentRoom = null;
  let senderName  = 'Unknown';
  let senderRole  = 'customer';

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      return;
    }

    if (msg.type === 'join') {
      const { roomId, senderName: name, senderRole: role } = msg;
      if (!roomId) return;

      currentRoom = getRoom(roomId);
      senderName  = name || 'Unknown';
      senderRole  = role || 'customer';
      ws.roomId   = roomId;
      ws.senderName = senderName;
      ws.senderRole = senderRole;

      currentRoom.clients.add(ws);

      // Send message history to the joining client
      ws.send(JSON.stringify({ type: 'history', messages: currentRoom.history }));

      // Broadcast updated presence to everyone in the room
      const names = [...currentRoom.clients]
        .filter(c => c.readyState === WebSocket.OPEN && c.senderName)
        .map(c => ({ name: c.senderName, role: c.senderRole }));

      broadcastAll(currentRoom, {
        type: 'presence',
        onlineCount: names.length,
        members: names,
      });

      console.log(`[CHAT] ${senderName} (${senderRole}) joined room "${roomId}" — ${names.length} online`);
    }

    else if (msg.type === 'message') {
      if (!currentRoom) return;
      const text = (msg.text || '').trim();
      if (!text) return;

      const message = {
        id:         Date.now() + '-' + Math.random().toString(36).slice(2),
        roomId:     ws.roomId,
        senderName: ws.senderName,
        senderRole: ws.senderRole,
        text,
        timestamp:  new Date().toISOString(),
      };

      currentRoom.history.push(message);

      // Cap history at 200 messages per room
      if (currentRoom.history.length > 200) {
        currentRoom.history = currentRoom.history.slice(-200);
      }

      broadcastAll(currentRoom, { type: 'message', message });
      console.log(`[CHAT] [${ws.roomId}] ${ws.senderName}: ${text.slice(0, 60)}`);
    }

    else if (msg.type === 'typing') {
      if (!currentRoom) return;
      broadcast(currentRoom, {
        type:       'typing',
        senderName: ws.senderName,
        senderRole: ws.senderRole,
        isTyping:   !!msg.isTyping,
      }, ws);
    }
  });

  ws.on('close', () => {
    if (currentRoom) {
      currentRoom.clients.delete(ws);
      const names = [...currentRoom.clients]
        .filter(c => c.readyState === WebSocket.OPEN && c.senderName)
        .map(c => ({ name: c.senderName, role: c.senderRole }));

      broadcastAll(currentRoom, {
        type: 'presence',
        onlineCount: names.length,
        members: names,
      });
      console.log(`[CHAT] ${senderName} left room "${ws.roomId}" — ${names.length} remaining`);
    }
  });

  ws.on('error', (err) => console.error('[CHAT] WS error:', err.message));
});

console.log(`\n🌸 Maharani Bridal Chat Server running on ws://localhost:${PORT}\n`);
