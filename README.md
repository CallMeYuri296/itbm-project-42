# BloxVerse | ITBM Gaming Platform MVP

An original, web-based Roblox-style gaming platform prototype built for an Information Technology & Business Management (ITBM) project presentation.

---

## 🎮 Features Implemented (Phase 1)
- **Classic Roblox Aesthetic**: Dark glassmorphic interface, neon accents, floating 3D perspective podium, and topbar navigation.
- **Selectable Characters**: Three distinct, custom-designed blocky vector avatars:
  - **Aahaan**: *Tech Adventurer* (Cyan cyber visor & circuit streetwear)
  - **Hetvi**: *Creative Strategist* (Golden star crown & royal purple streetwear)
  - **Sanvi**: *Speed Champion* (Blaze crimson headband & emerald runner kit)
- **Virtual Coin Economy & LocalStorage Persistence**:
  - Live coin wallet tracking balance, games played, and high scores.
  - Data automatically persists across browser refreshes using `localStorage`.
- **ITBM Commercialization Hub**:
  - Educational breakdown of four digital platform revenue models: Sponsored Game Worlds, Rewarded Video Ads, VIP Passes, and Creator Economy Tokenomics.
  - Interactive simulated rewarded ad tool that awards +25 coins in real time.
- **Built-in Presentation Tools**:
  - Presenter toolbar with one-click buttons to add coins (`+50`, `+100`) or reset demo state.
  - Zero-dependency retro synthesizer sound effects (coin chimes, whooshes, clicks) using Web Audio API.

---

## 🚀 How to Run the Platform

### Method 1: Direct File Launch (No Setup Required)
Simply **double-click** [`index.html`](index.html) or right-click and open it with **Google Chrome**, **Safari**, or **Microsoft Edge**.

### Method 2: Local Python Server (Optional)
```bash
python3 -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

---

## 📁 Project Structure
```
itbm-project-42/
├── index.html              # Main webpage (Lobby Hub, Topbar, Modals, ITBM Showcase)
├── css/
│   ├── style.css           # Core theme, glassmorphic UI, animations, toasts, buttons
│   └── lobby.css           # 3D-perspective character podium, game cards, modal layouts
└── js/
    ├── state.js            # LocalStorage wallet engine, coin balances & player stats
    ├── avatars.js          # Procedural Roblox-style vector avatars (Aahaan, Hetvi, Sanvi)
    ├── lobby.js            # UI controller, audio SFX synthesizer, toasts, ad simulation
    └── main.js             # Platform bootstrapper & presentation console helpers
```

---

## 🗺️ Development Roadmap
- [x] **Phase 1**: Base Architecture, Main Lobby UI, Player Avatars (Aahaan, Hetvi, Sanvi), and LocalStorage Economy State.
- [ ] **Phase 2**: Obstacle Course ("Obby") Mini-Game (2D Canvas platformer, physics, hazards, checkpoints, coin reward loop).
- [ ] **Phase 3**: Coin Collection Arena & Survival/Avoidance Mini-Games.
- [ ] **Phase 4**: In-Game Shop, Cosmetic Customization, Leaderboards, and Commercialization UI placeholders.