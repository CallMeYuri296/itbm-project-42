# BloxVerse | ITBM Gaming Platform MVP

An original, web-based Roblox-style gaming platform prototype built for an Information Technology & Business Management (ITBM) project presentation.

---

## 🎮 Complete Feature Set (Phases 1 – 4)
- **Classic Roblox Aesthetic**: Dark glassmorphic interface, neon accents, floating 3D perspective podium, and topbar navigation.
- **Selectable Characters**: Three distinct, custom-designed blocky vector avatars:
  - **Aahaan**: *Tech Adventurer* (Cyan cyber visor & circuit streetwear)
  - **Hetvi**: *Creative Strategist* (Golden star crown & royal purple streetwear)
  - **Sanvi**: *Speed Champion* (Blaze crimson headband & emerald runner kit)
- **Three Playable 2D Mini-Games**:
  - **Tower of Obby**: Precision 2D platformer with moving platforms, red laser grids, checkpoints, golden trophy, and confetti.
  - **Gold Rush**: 30s top-down timed arena with multi-tier coins, combo multiplier, obstacles, and rainbow star powerups.
  - **Hazard Dodge**: Multi-wave survival game with bouncing plasma mines, telegraphed laser sweeps, kinetic dash, and energy shield.
- **In-Game Cosmetic Shop & Dynamic Dressing**:
  - Spend BloxCoins to unlock Crown of Aurelia, Cyberpunk Visor HUD, and Neon Sprint Trail.
  - Equipped cosmetics dynamically render over avatars on the lobby podium.
- **Milestone Achievements & Progression System**:
  - 9 automated milestone badges with real-time popup toasts on completion.
- **Dynamic Competitive Leaderboards**:
  - Live ranking calculating total performance across Obby, Gold Rush, and Hazard Dodge.
- **Virtual Coin Economy & LocalStorage Persistence**:
  - Live coin wallet tracking balance, games played, and high scores.
  - Data automatically persists across browser refreshes using `localStorage`.
- **ITBM Commercialization Hub**:
  - Educational breakdown of four digital platform revenue models: Sponsored Game Worlds, Rewarded Video Ads, VIP Passes, and Creator Economy Tokenomics.
  - Interactive simulated rewarded ad tool that awards +25 coins in real time.
- **Built-in Presentation Tools**:
  - Presenter toolbar with one-click buttons to add coins (`+50`, `+100`) or reset demo state.
  - Retro synthesizer sound effects using Web Audio API.

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
├── index.html              # Main webpage (Lobby Hub, Topbar, Modals, 3 Game Arenas, Shop, Leaderboards, ITBM Showcase)
├── css/
│   ├── style.css           # Core theme, glassmorphic UI, animations, toasts, buttons
│   ├── lobby.css           # 3D-perspective character podium, game cards, modal layouts
│   ├── obby.css            # Canvas viewport, HUD, touch controls, victory celebration modal
│   ├── games.css           # Arenas, D-pads, HUDs for Gold Rush and Hazard Dodge
│   └── phase4.css          # Shop items grid, achievement badges, dynamic leaderboard tables
└── js/
    ├── state.js            # LocalStorage wallet engine, coin balances, scores & inventory
    ├── avatars.js          # Procedural Roblox-style vector avatars & cosmetic rendering
    ├── shop.js             # Cosmetic store catalog, purchase verification, equip/unequip
    ├── achievements.js     # Milestone achievement detection and notification toasts
    ├── obby.js             # Obby 2D platformer engine with physics and checkpoints
    ├── coinrush.js         # Gold Rush timed collection arena engine
    ├── hazarddodge.js      # Hazard Dodge survival sprint engine
    ├── lobby.js            # UI controller, audio SFX synthesizer, toasts, ad simulation
    └── main.js             # Platform bootstrapper & presentation console helpers
```

---

## 🗺️ Development Roadmap
- [x] **Phase 1**: Base Architecture, Main Lobby UI, Player Avatars (Aahaan, Hetvi, Sanvi), and LocalStorage Economy State.
- [x] **Phase 2**: Obstacle Course ("Tower of Obby") Mini-Game (2D Canvas platformer, physics, hazards, checkpoints, coin reward loop).
- [x] **Phase 3**: Coin Collection Arena ("Gold Rush") & Survival/Avoidance ("Hazard Dodge") Mini-Games.
- [x] **Phase 4**: In-Game Shop, Cosmetic Customization, Achievements, Leaderboards, and Commercialization Showcase. All MVP features complete!