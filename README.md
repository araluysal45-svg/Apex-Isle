# Apex Isle: 3D Battle Royale

A browser battle royale (Three.js). Solo and Practice work with no server. Online play (room codes and quick match)
needs the small server in `server/`.

## Files
```
index.html        the whole game
config.js         put your server address here
server/server.js  multiplayer relay (Node.js)
server/package.json
.nojekyll
```

## 1) Put the game on GitHub Pages (free)
1. Create a new GitHub repository (public), e.g. `apex-isle`.
2. Upload ALL files and the `server` folder (drag and drop on the repo page, then Commit).
3. Repo **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`. Save.
4. After a minute your game is live at `https://YOUR-NAME.github.io/apex-isle/`.

## 2) Online play (needs a server, GitHub Pages cannot run one)
GitHub Pages only hosts static files, so deploy `server/` somewhere that runs Node.js. Free option: **Render**.
1. render.com > New > Web Service > connect your GitHub repo.
2. Root Directory: `server`   Build Command: `npm install`   Start Command: `npm start`   Plan: Free.
3. Deploy. You get a URL like `https://apex-isle-server.onrender.com`.
4. Open `config.js` in your repo and set (note `wss://`):
   `window.APEX_SERVER = 'wss://apex-isle-server.onrender.com';`
5. Commit. Reload the game: PLAY tab now shows **Create Room / Join Code / Quick Match**.

Notes
- Render's free plan sleeps after inactivity; the first connection can take ~30 s to wake it.
- Local test: `cd server && npm install && npm start`, set `window.APEX_SERVER='ws://localhost:8080'`, then
  serve the folder (`npx serve .`) and open two browser tabs.

## How online works (and limits)
- Create a room: share the 5-letter code. The host presses START. Quick Match joins a public room and auto-starts
  ~12 s after 2+ players are in.
- Up to 16 players per room. Online matches have **no bots** (only real players).
- Every player's browser simulates their own character; the server just relays positions, shots, hits and
  loot pickups. Loot layout and the storm are identical for everyone (shared seed).
- Not synced yet: built walls/floors/ramps, cars, slime blocks, crates, supply-drop contents. Those are local to each player.
- Client-authoritative = a cheater could modify their own client. Fine for friends; not for a public competitive game.

## Controls
WASD move, Shift sprint, C/Ctrl crouch, Space jump, mouse look (or hold click and drag), click fire,
right click aim, R reload, E interact (loot, crates, cars, ziplines, sewer hatches), Q drop weapon,
1-3 weapons, 4 shield, 5 medkit, 6 slime block, X pickaxe (chop trees/rocks/cars for wood/stone/metal),
B build mode (1 wall, 2 floor, 3 ramp, T material, click to place), M map, N mute music, Esc pause.
