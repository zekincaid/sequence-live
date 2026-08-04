# Sequence — Live Multiplayer

Real-time Sequence, 2/3/4/6 players, synced instantly over WebSocket.
No Claude account needed for anyone — including you, once it's deployed.

## What's here
- `server.js` — tiny Node relay server. It doesn't referee the game; it
  just forwards whatever state the current player's browser computes to
  everyone else in the same room. No database.
- `public/index.html` — the game itself (board, cards, rules, teams).
- `package.json` — one dependency (`ws`).

## Deploy it (free, ~5 minutes, no credit card)

**Option A — Render.com (recommended, keeps running for free)**
1. Go to render.com and sign up (free, just an email or GitHub login).
2. Create a new **Web Service**.
3. When it asks for a repo, choose "Deploy an existing image" is *not* what
   you want — instead pick **"Public Git repository"** and paste in a repo
   URL if you've pushed these 3 files to GitHub, OR use **Render's "Deploy
   from a Blueprint"/manual upload** if offered. Simplest path: create a
   free GitHub repo, upload these 3 files (`server.js`, `package.json`,
   and the `public/` folder), then connect that repo to Render.
4. Build command: `npm install` — Start command: `npm start`.
5. Click **Create Web Service**. Render gives you a URL like
   `https://your-app.onrender.com` — that's your game link.

**Option B — Glitch.com (fastest, no GitHub needed)**
1. Go to glitch.com → New Project → "hello-node".
2. Delete the sample files it creates, and paste in `server.js`,
   `package.json`, and create a `public/index.html` with the contents here.
3. Glitch installs dependencies and starts it automatically.
4. Click "Show" to get your live URL.

Either way: once deployed, send that URL to whoever's playing. Nobody
needs an account — they just open the link, enter their name, and either
create or join a room by code.

## How it plays
1. One person opens the link, picks player count (2/3/4/6, with a team
   choice for 6), and clicks **Create New Game** — gets a room code.
2. They send the same link + room code to everyone else.
3. Everyone enters the code and their name to take a seat.
4. Host clicks **Start Game** once all seats are filled.
5. Moves sync live for everyone — no refreshing, no waiting.

## Notes
- State lives in server memory only — if the server restarts (e.g. a
  free-tier host sleeping after inactivity), in-progress games are lost.
  Fine for a casual game night; not for anything you need to persist.
- Chip ownership is visible to anyone who inspects the network traffic,
  same caveat as before — this is a friendly-game build, not
  tournament-secure.
