// Apex Isle multiplayer relay: room codes + quick match.
// The server only relays messages between players in the same room.
// Each player's own browser simulates their character (client-authoritative).
const { WebSocketServer } = require('ws');
const PORT = process.env.PORT || 8080;
const MAX = 16;
const wss = new WebSocketServer({ port: PORT });
const rooms = new Map();
const RELAY = new Set(['s', 'shot', 'hit', 'dead', 'pick']);

const gen = () => { let c; do { c = Math.random().toString(36).slice(2, 7).toUpperCase(); } while (rooms.has(c)); return c; };
const send = (ws, o) => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };
const plist = r => [...r.players.values()].map(w => ({ id: w.id, name: w.name, skin: w.skin }));
const bc = (r, o, except) => r.players.forEach(w => { if (w !== except) send(w, o); });

function addTo(ws, r) {
  r.players.set(ws.id, ws);
  ws.room = r;
  send(ws, { t: 'room', code: r.code, id: ws.id, host: r.host, players: plist(r) });
  bc(r, { t: 'plist', players: plist(r), host: r.host }, ws);
}
function startRoom(r) {
  if (r.started || r.players.size < 1) return;
  clearTimeout(r.timer);
  r.started = true;
  const order = [...r.players.keys()];
  const seed = Math.floor(Math.random() * 2147483647);
  bc(r, { t: 'start', seed, order, players: plist(r) });
}
function leave(ws) {
  const r = ws.room;
  if (!r) return;
  r.players.delete(ws.id);
  ws.room = null;
  if (!r.players.size) { clearTimeout(r.timer); rooms.delete(r.code); return; }
  if (r.host === ws.id) r.host = r.players.keys().next().value;
  bc(r, { t: 'left', from: ws.id });
  bc(r, { t: 'plist', players: plist(r), host: r.host });
}
function ident(ws, d) {
  ws.name = String(d.name || 'Player').replace(/[^\w \-]/g, '').slice(0, 14) || 'Player';
  ws.skin = Math.max(0, Math.min(30, d.skin | 0));
}

wss.on('connection', ws => {
  ws.id = Math.random().toString(36).slice(2, 8);
  ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', raw => {
    let d; try { d = JSON.parse(raw); } catch { return; }
    if (RELAY.has(d.t)) {
      const r = ws.room;
      if (r && r.started) { d.from = ws.id; bc(r, d, ws); }
      return;
    }
    switch (d.t) {
      case 'create': {
        leave(ws); ident(ws, d);
        const r = { code: gen(), host: ws.id, players: new Map(), started: false, pub: false, timer: null };
        rooms.set(r.code, r); addTo(ws, r); break;
      }
      case 'join': {
        leave(ws); ident(ws, d);
        const r = rooms.get(String(d.code || '').toUpperCase());
        if (!r || r.started || r.players.size >= MAX) { send(ws, { t: 'plist', players: [], host: null }); break; }
        addTo(ws, r); break;
      }
      case 'quick': {
        leave(ws); ident(ws, d);
        let r = [...rooms.values()].find(x => x.pub && !x.started && x.players.size < MAX);
        if (!r) { r = { code: gen(), host: ws.id, players: new Map(), started: false, pub: true, timer: null }; rooms.set(r.code, r); }
        addTo(ws, r);
        if (r.players.size >= MAX) startRoom(r);
        else if (r.players.size >= 2 && !r.timer) r.timer = setTimeout(() => startRoom(r), 12000);
        break;
      }
      case 'start': {
        const r = ws.room;
        if (r && r.host === ws.id) startRoom(r);
        break;
      }
      case 'leave': leave(ws); break;
    }
  });
  ws.on('close', () => leave(ws));
});

// drop dead connections (also keeps free hosts from idling the socket)
setInterval(() => wss.clients.forEach(c => { if (!c.alive) return c.terminate(); c.alive = false; c.ping(); }), 30000);
console.log('Apex Isle server listening on port ' + PORT);
