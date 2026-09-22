/**
 * ==========================================================================
 * BLOXVERSE ITBM EDITION - TOWER OF OBBY MINI-GAME ENGINE
 * 2D Canvas Platformer with Physics, Checkpoints, Hazards & Coin Rewards
 * ==========================================================================
 */

class ObbyEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.animId = null;

    // Viewport & Scaling
    this.width = 960;
    this.height = 540;

    // Audio SFX
    this.audio = null;

    // Keys State
    this.keys = {
      left: false,
      right: false,
      up: false
    };

    // Camera
    this.camera = { x: 0, y: 0 };

    // Game Session Stats
    this.timer = 0;
    this.timerInterval = null;
    this.collectedCoinsCount = 0;
    this.checkpointsReached = 0;
    this.currentCheckpoint = { x: 80, y: 380 };
    this.isDead = false;
    this.deathTimer = 0;
    this.won = false;

    // Particles
    this.particles = [];

    // Player State
    this.player = {
      x: 80,
      y: 380,
      width: 28,
      height: 44,
      vx: 0,
      vy: 0,
      speed: 5.5,
      jumpForce: 11.5,
      gravity: 0.52,
      grounded: false,
      facing: 1, // 1 = right, -1 = left
      coyoteTimer: 0,
      jumpBuffer: 0,
      runAnimFrame: 0
    };

    // Stage Data (Will be loaded in initStage)
    this.platforms = [];
    this.hazards = [];
    this.checkpoints = [];
    this.collectibles = [];
    this.goal = null;

    this.initAudio();
  }

  initAudio() {
    if (window.AudioContext || window.webkitAudioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audio = new AudioCtx();
    }
  }

  playSound(type) {
    if (!this.audio) return;
    if (this.audio.state === 'suspended') this.audio.resume();

    const now = this.audio.currentTime;

    if (type === 'jump') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'coin') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987, now);
      osc.frequency.setValueAtTime(1318, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'checkpoint') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659, now + 0.1);
      osc.frequency.setValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'hazard') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'victory') {
      // Fanfare Chords
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
      notes.forEach((freq, idx) => {
        const osc = this.audio.createOscillator();
        const gain = this.audio.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.18, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(this.audio.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    }
  }

  /**
   * Initializes or binds DOM, listeners and viewport
   */
  mount(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.bindKeyboard();
    this.bindTouch();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!this.running) return;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        this.keys.up = true;
        this.player.jumpBuffer = 6;
        e.preventDefault();
      }
      if (e.code === 'KeyR') {
        this.respawnPlayer(true);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) this.keys.up = false;
    });
  }

  bindTouch() {
    const btnLeft = document.getElementById('touch-btn-left');
    const btnRight = document.getElementById('touch-btn-right');
    const btnJump = document.getElementById('touch-btn-jump');

    if (!btnLeft || !btnRight || !btnJump) return;

    const addTouch = (el, pressAction, releaseAction) => {
      el.addEventListener('mousedown', (e) => { e.preventDefault(); pressAction(); });
      el.addEventListener('mouseup', (e) => { e.preventDefault(); releaseAction(); });
      el.addEventListener('touchstart', (e) => { e.preventDefault(); pressAction(); });
      el.addEventListener('touchend', (e) => { e.preventDefault(); releaseAction(); });
    };

    addTouch(btnLeft, () => { this.keys.left = true; }, () => { this.keys.left = false; });
    addTouch(btnRight, () => { this.keys.right = true; }, () => { this.keys.right = false; });
    addTouch(btnJump, () => { 
      this.keys.up = true; 
      this.player.jumpBuffer = 6; 
    }, () => { 
      this.keys.up = false; 
    });
  }

  /**
   * Builds the Obby level layout with platforms, moving blocks, checkpoints, red lava hazards, and goal
   */
  initStage() {
    this.platforms = [
      // Safe Starting Zone
      { x: 40, y: 440, w: 220, h: 40, type: 'solid', color: '#2b3648' },
      
      // Section 1: Floating Step Pillars
      { x: 320, y: 410, w: 90, h: 25, type: 'solid', color: '#00a2ff' },
      { x: 470, y: 370, w: 90, h: 25, type: 'solid', color: '#00a2ff' },
      { x: 620, y: 340, w: 90, h: 25, type: 'solid', color: '#00a2ff' },
      { x: 770, y: 310, w: 90, h: 25, type: 'solid', color: '#00a2ff' },

      // Section 1 Rest & Checkpoint 1 Island
      { x: 930, y: 310, w: 180, h: 30, type: 'solid', color: '#2b3648' },

      // Section 2: Moving Platform over Red Hazard Pit
      { 
        x: 1180, y: 280, w: 100, h: 22, type: 'moving', color: '#00e5ff',
        startX: 1180, endX: 1420, speed: 2.2, dir: 1
      },

      // Step Island
      { x: 1580, y: 270, w: 110, h: 24, type: 'solid', color: '#00a2ff' },

      // Section 3: Floating Stepping Stones
      { x: 1750, y: 240, w: 75, h: 22, type: 'solid', color: '#9d4edd' },
      { x: 1880, y: 210, w: 75, h: 22, type: 'solid', color: '#9d4edd' },
      { x: 2010, y: 190, w: 85, h: 22, type: 'solid', color: '#9d4edd' },

      // Checkpoint 2 Island
      { x: 2160, y: 190, w: 190, h: 30, type: 'solid', color: '#2b3648' },

      // Section 4: Vertical Climbing Hazard Pillars
      { 
        x: 2420, y: 220, w: 90, h: 22, type: 'moving_y', color: '#00e5ff',
        startY: 160, endY: 280, speed: 1.8, dir: 1
      },
      { x: 2580, y: 160, w: 80, h: 22, type: 'solid', color: '#ffb800' },
      { x: 2730, y: 130, w: 80, h: 22, type: 'solid', color: '#ffb800' },
      { x: 2880, y: 110, w: 80, h: 22, type: 'solid', color: '#ffb800' },

      // Grand Summit Platform (Goal)
      { x: 3040, y: 100, w: 260, h: 50, type: 'solid', color: '#162234' }
    ];

    // Red Laser Hazard Blocks (Instant OOF upon touch)
    this.hazards = [
      // Floor Pit Lasers under Section 1
      { x: 280, y: 510, w: 620, h: 30, label: 'Lava Grid' },
      // Pit Lasers under Section 2
      { x: 1120, y: 510, w: 600, h: 30, label: 'Laser Trench' },
      // Laser obstacle sitting on step island
      { x: 1625, y: 254, w: 20, h: 16, label: 'Spike' },
      // Floor Pit Lasers under Section 3 & 4
      { x: 1730, y: 510, w: 1280, h: 30, label: 'Abyss Field' },
      // Floating laser bar between high steps
      { x: 2650, y: 110, w: 18, h: 18, label: 'Laser Orb' }
    ];

    // Checkpoints
    this.checkpoints = [
      { id: 1, x: 990, y: 310, reached: false },
      { id: 2, x: 2230, y: 190, reached: false }
    ];

    // Collectible Mid-stage BloxCoins (+5 coins each)
    this.collectibles = [
      { x: 365, y: 360, collected: false },
      { x: 665, y: 290, collected: false },
      { x: 1300, y: 210, collected: false },
      { x: 1635, y: 190, collected: false },
      { x: 1915, y: 155, collected: false },
      { x: 2620, y: 110, collected: false },
      { x: 2770, y: 80, collected: false }
    ];

    // Summit Goal / Golden Trophy
    this.goal = {
      x: 3180,
      y: 100,
      w: 48,
      h: 56
    };
  }

  /**
   * Starts the Obby game session
   */
  start() {
    this.running = true;
    this.won = false;
    this.isDead = false;
    this.timer = 0;
    this.collectedCoinsCount = 0;
    this.checkpointsReached = 0;
    this.currentCheckpoint = { x: 80, y: 380 };

    this.initStage();
    this.respawnPlayer(false);
    this.hideVictoryModal();

    // Start Timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.running && !this.won) {
        this.timer += 0.1;
        this.updateHUD();
      }
    }, 100);

    this.updateHUD();

    // Loop
    cancelAnimationFrame(this.animId);
    this.loop = this.loop.bind(this);
    this.animId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animId);
  }

  respawnPlayer(resetCheckpoints = false) {
    if (resetCheckpoints) {
      this.currentCheckpoint = { x: 80, y: 380 };
      this.checkpoints.forEach(cp => cp.reached = false);
      this.checkpointsReached = 0;
    }

    this.player.x = this.currentCheckpoint.x;
    this.player.y = this.currentCheckpoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.grounded = false;
    this.isDead = false;
    this.deathTimer = 0;

    // Spawn puff particles
    this.createPuffParticles(this.player.x + 14, this.player.y + 22, '#00e5ff');
  }

  handleDeath() {
    if (this.isDead) return;
    this.isDead = true;
    this.deathTimer = 35; // Frames before respawning
    this.playSound('hazard');

    // Scatter blocky death particles
    const avatar = window.AVATAR_REGISTRY[window.BloxState.getActiveAvatarId()] || window.AVATAR_REGISTRY.aahaan;
    for (let i = 0; i < 22; i++) {
      this.particles.push({
        x: this.player.x + Math.random() * this.player.width,
        y: this.player.y + Math.random() * this.player.height,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.7) * 9,
        size: Math.random() * 7 + 4,
        color: [avatar.colors.torsoAccent, avatar.colors.headwear, '#ff3366', '#ffffff'][Math.floor(Math.random() * 4)],
        alpha: 1,
        decay: 0.03
      });
    }
  }

  createPuffParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 5 + 3,
        color: color,
        alpha: 0.9,
        decay: 0.04
      });
    }
  }

  createConfetti() {
    const colors = ['#ffd166', '#00e5ff', '#ff3366', '#00e676', '#9d4edd', '#ffffff'];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: this.goal.x + 24,
        y: this.goal.y + 10,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.9) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.012
      });
    }
  }

  /**
   * Main Physics & Logic Update
   */
  update() {
    if (this.won) {
      this.updateParticles();
      return;
    }

    if (this.isDead) {
      this.deathTimer--;
      if (this.deathTimer <= 0) {
        this.respawnPlayer(false);
      }
      this.updateParticles();
      return;
    }

    // Dynamic Moving Platforms
    this.platforms.forEach(p => {
      if (p.type === 'moving') {
        p.x += p.speed * p.dir;
        if (p.x >= p.endX) {
          p.x = p.endX;
          p.dir = -1;
        } else if (p.x <= p.startX) {
          p.x = p.startX;
          p.dir = 1;
        }
      } else if (p.type === 'moving_y') {
        p.y += p.speed * p.dir;
        if (p.y >= p.endY) {
          p.y = p.endY;
          p.dir = -1;
        } else if (p.y <= p.startY) {
          p.y = p.startY;
          p.dir = 1;
        }
      }
    });

    // Horizontal Movement
    if (this.keys.left) {
      this.player.vx = -this.player.speed;
      this.player.facing = -1;
      this.player.runAnimFrame += 0.2;
    } else if (this.keys.right) {
      this.player.vx = this.player.speed;
      this.player.facing = 1;
      this.player.runAnimFrame += 0.2;
    } else {
      this.player.vx *= 0.72; // Smooth friction
      if (Math.abs(this.player.vx) < 0.2) this.player.vx = 0;
    }

    // Coyote Time & Jump Buffering
    if (this.player.grounded) {
      this.player.coyoteTimer = 6;
    } else {
      this.player.coyoteTimer = Math.max(0, this.player.coyoteTimer - 1);
    }

    if (this.player.jumpBuffer > 0) {
      this.player.jumpBuffer--;
      if (this.player.coyoteTimer > 0) {
        this.player.vy = -this.player.jumpForce;
        this.player.grounded = false;
        this.player.coyoteTimer = 0;
        this.player.jumpBuffer = 0;
        this.playSound('jump');
        this.createPuffParticles(this.player.x + 14, this.player.y + 42, '#ffffff');
      }
    }

    // Apply Gravity
    this.player.vy += this.player.gravity;
    if (this.player.vy > 14) this.player.vy = 14; // Terminal velocity

    // Move X & Resolve Platform Collisions
    this.player.x += this.player.vx;
    this.resolveCollisionsX();

    // Move Y & Resolve Platform Collisions
    this.player.y += this.player.vy;
    this.player.grounded = false;
    this.resolveCollisionsY();

    // Hazard Collisions
    this.checkHazardCollisions();

    // Checkpoint Trigger
    this.checkCheckpoints();

    // Collectible Coin Collisions
    this.checkCoinCollectibles();

    // Goal Summit Collision
    this.checkGoalTrigger();

    // Fall into abyss
    if (this.player.y > 650) {
      this.handleDeath();
    }

    // Camera Smooth Follow
    const targetCamX = this.player.x - this.width * 0.35;
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    if (this.camera.x < 0) this.camera.x = 0;

    // Update Particles
    this.updateParticles();
  }

  resolveCollisionsX() {
    const p = this.player;
    this.platforms.forEach(plat => {
      if (this.isAABBOverlap(p.x, p.y, p.width, p.height, plat.x, plat.y, plat.w, plat.h)) {
        if (p.vx > 0) {
          p.x = plat.x - p.width;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = plat.x + plat.w;
          p.vx = 0;
        }
      }
    });
  }

  resolveCollisionsY() {
    const p = this.player;
    this.platforms.forEach(plat => {
      if (this.isAABBOverlap(p.x, p.y, p.width, p.height, plat.x, plat.y, plat.w, plat.h)) {
        if (p.vy > 0) { // Landing on top
          p.y = plat.y - p.height;
          p.vy = 0;
          p.grounded = true;

          // If standing on a moving platform, carry horizontal velocity
          if (plat.type === 'moving') {
            p.x += plat.speed * plat.dir;
          }
        } else if (p.vy < 0) { // Bonking head
          p.y = plat.y + plat.h;
          p.vy = 0;
        }
      }
    });
  }

  checkHazardCollisions() {
    const p = this.player;
    this.hazards.forEach(h => {
      if (this.isAABBOverlap(p.x, p.y, p.width, p.height, h.x, h.y, h.w, h.h)) {
        this.handleDeath();
      }
    });
  }

  checkCheckpoints() {
    const p = this.player;
    this.checkpoints.forEach(cp => {
      if (!cp.reached && this.isAABBOverlap(p.x, p.y, p.width, p.height, cp.x, cp.y - 40, 40, 50)) {
        cp.reached = true;
        this.currentCheckpoint = { x: cp.x + 6, y: cp.y - 48 };
        this.checkpointsReached++;
        this.playSound('checkpoint');
        this.createPuffParticles(cp.x + 20, cp.y - 20, '#00e676');
        this.updateHUD();
        window.BloxLobby.showToast('Checkpoint Saved!', `Reached Checkpoint ${cp.id}!`, 'success', '🚩');
      }
    });
  }

  checkCoinCollectibles() {
    const p = this.player;
    this.collectibles.forEach(c => {
      if (!c.collected && this.isAABBOverlap(p.x, p.y, p.width, p.height, c.x - 12, c.y - 12, 24, 24)) {
        c.collected = true;
        this.collectedCoinsCount++;
        this.playSound('coin');
        this.createPuffParticles(c.x, c.y, '#ffd166');
        this.updateHUD();
      }
    });
  }

  checkGoalTrigger() {
    const p = this.player;
    const g = this.goal;
    if (!this.won && this.isAABBOverlap(p.x, p.y, p.width, p.height, g.x, g.y - g.h, g.w, g.h + 10)) {
      this.won = true;
      this.playSound('victory');
      this.createConfetti();
      this.handleVictory();
    }
  }

  handleVictory() {
    const timeTaken = Math.max(1, parseFloat(this.timer.toFixed(1)));
    const bonusCoins = this.collectedCoinsCount * 5;
    const completionReward = 50;
    const totalCoinsEarned = completionReward + bonusCoins;

    // Calculate score: fast completion + coins
    const calculatedScore = Math.max(100, Math.round(1000 - timeTaken * 12 + this.collectedCoinsCount * 30));

    // Save to State
    const isHigh = window.BloxState.recordScore('obby', calculatedScore);
    window.BloxState.addCoins(totalCoinsEarned, 'Tower of Obby Clear');

    // Show Victory Overlay
    setTimeout(() => {
      this.showVictoryModal(timeTaken, calculatedScore, totalCoinsEarned, isHigh);
    }, 400);
  }

  showVictoryModal(time, score, coins, isHigh) {
    const overlay = document.getElementById('victory-overlay');
    if (!overlay) return;

    document.getElementById('vic-time').textContent = `${time}s`;
    document.getElementById('vic-score').textContent = `${score} pts`;
    document.getElementById('vic-coins').textContent = `+${coins} ¢`;

    const subTitle = document.getElementById('vic-subtitle');
    if (subTitle) {
      subTitle.textContent = isHigh 
        ? `🔥 Brand New High Score! You earned +${coins} BloxCoins!`
        : `Course conquered in style! You earned +${coins} BloxCoins!`;
    }

    overlay.classList.add('show');
  }

  hideVictoryModal() {
    const overlay = document.getElementById('victory-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  isAABBOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
  }

  updateHUD() {
    const timerEl = document.getElementById('obby-hud-timer');
    const coinEl = document.getElementById('obby-hud-coins');
    const cpEl = document.getElementById('obby-hud-checkpoint');

    if (timerEl) timerEl.textContent = `${this.timer.toFixed(1)}s`;
    if (coinEl) coinEl.textContent = `${this.collectedCoinsCount}`;
    if (cpEl) cpEl.textContent = `${this.checkpointsReached} / ${this.checkpoints.length}`;
  }

  /**
   * Main Render Pipeline
   */
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Cyber Sky Background & Neon Grid Lines
    this.renderBackground(ctx);

    // Save camera transform
    ctx.save();
    ctx.translate(-Math.floor(this.camera.x), 0);

    // 2. Render Platforms
    this.renderPlatforms(ctx);

    // 3. Render Hazards
    this.renderHazards(ctx);

    // 4. Render Checkpoints
    this.renderCheckpoints(ctx);

    // 5. Render Collectible Coins
    this.renderCollectibles(ctx);

    // 6. Render Goal / Golden Trophy
    this.renderGoal(ctx);

    // 7. Render Active Avatar Character
    if (!this.isDead) {
      this.renderPlayerAvatar(ctx);
    }

    // 8. Render Particles
    this.renderParticles(ctx);

    ctx.restore();
  }

  renderBackground(ctx) {
    // Gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#0c101c');
    grad.addColorStop(1, '#171e2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Distant background grid lines with parallax
    ctx.strokeStyle = 'rgba(0, 162, 255, 0.07)';
    ctx.lineWidth = 1;
    const camOffset = (this.camera.x * 0.25) % 60;
    for (let x = -camOffset; x < this.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
  }

  renderPlatforms(ctx) {
    this.platforms.forEach(p => {
      ctx.save();
      // Platform Body
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Top highlighted edge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(p.x, p.y, p.w, 3);

      // Roblox-style studs on top
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      const studSpacing = 24;
      for (let sx = p.x + 10; sx < p.x + p.w - 10; sx += studSpacing) {
        ctx.beginPath();
        ctx.arc(sx, p.y + 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moving Platform indicators
      if (p.type === 'moving' || p.type === 'moving_y') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
      }

      ctx.restore();
    });
  }

  renderHazards(ctx) {
    this.hazards.forEach(h => {
      ctx.save();
      // Neon Red Lava glow
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(h.x, h.y, h.w, h.h);

      // Warning laser pattern
      ctx.fillStyle = '#ffebee';
      for (let lx = h.x + 6; lx < h.x + h.w; lx += 18) {
        ctx.fillRect(lx, h.y + 2, 6, h.h - 4);
      }
      ctx.restore();
    });
  }

  renderCheckpoints(ctx) {
    this.checkpoints.forEach(cp => {
      ctx.save();
      const reached = cp.reached;
      const glowColor = reached ? '#00e676' : '#ffd166';

      // Base Pad
      ctx.fillStyle = reached ? '#004d20' : '#4a3b00';
      ctx.fillRect(cp.x - 6, cp.y - 8, 44, 10);

      // Glowing Flagpole
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cp.x + 4, cp.y - 48, 3, 40);

      // Flag Banner
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = glowColor;
      ctx.beginPath();
      ctx.moveTo(cp.x + 7, cp.y - 48);
      ctx.lineTo(cp.x + 32, cp.y - 36);
      ctx.lineTo(cp.x + 7, cp.y - 24);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }

  renderCollectibles(ctx) {
    this.collectibles.forEach(c => {
      if (c.collected) return;
      ctx.save();
      const time = performance.now() * 0.004;
      const bob = Math.sin(time) * 4;
      const widthScale = Math.abs(Math.cos(time));

      ctx.translate(c.x, c.y + bob);
      ctx.scale(Math.max(0.15, widthScale), 1);

      // Gold Coin
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffb800';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff4cc';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  renderGoal(ctx) {
    const g = this.goal;
    ctx.save();
    const time = performance.now() * 0.003;
    const floatY = Math.sin(time) * 5;

    // Glowing Summit Base
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(g.x + 4, g.y - 10, 40, 12);

    // Rotating 3D Trophy
    ctx.translate(g.x + 24, g.y - 38 + floatY);
    ctx.shadowColor = '#ffd166';
    ctx.shadowBlur = 20;

    // Trophy Cup
    ctx.fillStyle = '#ffb800';
    ctx.beginPath();
    ctx.arc(0, -6, 16, 0, Math.PI);
    ctx.fill();

    // Stem & Pedestal
    ctx.fillRect(-4, 0, 8, 14);
    ctx.fillRect(-12, 14, 24, 6);

    // Star on Trophy
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -6, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderPlayerAvatar(ctx) {
    const p = this.player;
    const avatarId = window.BloxState.getActiveAvatarId();
    const avatar = window.AVATAR_REGISTRY[avatarId] || window.AVATAR_REGISTRY.aahaan;
    const c = avatar.colors;

    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height);

    // Apply horizontal flip if facing left
    ctx.scale(p.facing, 1);

    const isRunning = Math.abs(p.vx) > 0.3 && p.grounded;
    const legAngle = isRunning ? Math.sin(p.runAnimFrame) * 0.35 : 0;
    const armAngle = isRunning ? -Math.sin(p.runAnimFrame) * 0.4 : 0;

    // 1. Legs (Blocky Roblox legs)
    // Left Leg
    ctx.save();
    ctx.translate(-7, -18);
    ctx.rotate(legAngle);
    ctx.fillStyle = c.pants;
    ctx.fillRect(-5, 0, 10, 18);
    ctx.fillStyle = c.shoes;
    ctx.fillRect(-5, 14, 10, 4);
    ctx.restore();

    // Right Leg
    ctx.save();
    ctx.translate(7, -18);
    ctx.rotate(-legAngle);
    ctx.fillStyle = c.pants;
    ctx.fillRect(-5, 0, 10, 18);
    ctx.fillStyle = c.shoes;
    ctx.fillRect(-5, 14, 10, 4);
    ctx.restore();

    // 2. Torso (Blocky Roblox torso)
    ctx.fillStyle = c.torsoAccent;
    ctx.fillRect(-12, -36, 24, 18);
    // Torso emblem badge
    ctx.fillStyle = c.shoes;
    ctx.fillRect(-4, -30, 8, 6);

    // 3. Left & Right Block Arms
    ctx.save();
    ctx.translate(-14, -36);
    ctx.rotate(armAngle);
    ctx.fillStyle = c.limbs;
    ctx.fillRect(-4, 0, 8, 17);
    ctx.fillStyle = c.skin;
    ctx.fillRect(-4, 13, 8, 4);
    ctx.restore();

    ctx.save();
    ctx.translate(14, -36);
    ctx.rotate(-armAngle);
    ctx.fillStyle = c.limbs;
    ctx.fillRect(-4, 0, 8, 17);
    ctx.fillStyle = c.skin;
    ctx.fillRect(-4, 13, 8, 4);
    ctx.restore();

    // 4. Head (Classic Roblox Blocky Head with Stud)
    // Neck Stud
    ctx.fillStyle = c.skin;
    ctx.fillRect(-3, -38, 6, 3);

    // Head Cube
    ctx.fillStyle = c.skin;
    ctx.fillRect(-9, -50, 18, 14);

    // Top Stud
    ctx.fillRect(-3, -53, 6, 3);

    // Headgear & Eyes
    if (avatarId === 'aahaan') {
      // Cyber Visor
      ctx.fillStyle = '#0b1320';
      ctx.fillRect(-8, -46, 16, 6);
      ctx.fillStyle = c.headwear;
      ctx.fillRect(-7, -45, 14, 4);
    } else if (avatarId === 'hetvi') {
      // Golden Crown
      ctx.fillStyle = c.headwear;
      ctx.fillRect(-9, -53, 18, 4);
      ctx.beginPath();
      ctx.moveTo(-9, -53);
      ctx.lineTo(-4, -57);
      ctx.lineTo(0, -53);
      ctx.lineTo(4, -57);
      ctx.lineTo(9, -53);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#2d1305';
      ctx.fillRect(0, -45, 3, 4);
      ctx.fillRect(5, -45, 3, 4);
    } else {
      // Sanvi: Blaze Bandana
      ctx.fillStyle = c.headwear;
      ctx.fillRect(-10, -49, 20, 4);
      // Fast Eyes
      ctx.fillStyle = '#111624';
      ctx.fillRect(1, -44, 3, 3);
      ctx.fillRect(6, -44, 3, 3);
    }

    ctx.restore();
  }

  renderParticles(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    });
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.render();
    this.animId = requestAnimationFrame(this.loop);
  }
}

// Global Obby Instance
window.ObbyGame = new ObbyEngine();
