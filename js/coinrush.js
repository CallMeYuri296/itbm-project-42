/**
 * ==========================================================================
 * BLOXVERSE ITBM EDITION - GOLD RUSH COIN DASH ARENA MINI-GAME
 * Timed 30-Second Top-Down Coin Collection with Combos, Power-Ups & Sinks
 * ==========================================================================
 */

class CoinRushEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.animId = null;

    this.width = 960;
    this.height = 540;

    // Keys State
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // Audio SFX
    this.audio = null;

    // Game Session
    this.roundTime = 30; // 30 seconds
    this.timer = 30;
    this.timerInterval = null;
    this.coinsCollectedCount = 0;
    this.totalCoinValueEarned = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.comboTimer = 0;

    // Player
    this.player = {
      x: 480,
      y: 270,
      radius: 20,
      vx: 0,
      vy: 0,
      speed: 5.4,
      boostTimer: 0,
      angle: 0
    };

    // Arena Obstacles
    this.pillars = [
      { x: 220, y: 140, w: 70, h: 70 },
      { x: 670, y: 140, w: 70, h: 70 },
      { x: 220, y: 330, w: 70, h: 70 },
      { x: 670, y: 330, w: 70, h: 70 }
    ];

    this.coins = [];
    this.particles = [];
    this.floatingTexts = [];

    this.initAudio();
  }

  initAudio() {
    if (window.AudioContext || window.webkitAudioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audio = new AudioCtx();
    }
  }

  playSound(type, pitchMultiplier = 1) {
    if (!this.audio) return;
    if (this.audio.state === 'suspended') this.audio.resume();

    const now = this.audio.currentTime;

    if (type === 'coin') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'sine';
      const baseFreq = 880 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.setValueAtTime(baseFreq * 1.33, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'star') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.08);
      osc.frequency.setValueAtTime(1046.5, now + 0.16);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'whistle') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.5);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  }

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
      if (['ArrowUp', 'KeyW'].includes(e.code)) { this.keys.up = true; e.preventDefault(); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { this.keys.down = true; e.preventDefault(); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { this.keys.left = true; e.preventDefault(); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { this.keys.right = true; e.preventDefault(); }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
    });
  }

  bindTouch() {
    const bindBtn = (id, keyName) => {
      const el = document.getElementById(id);
      if (!el) return;
      const setKey = (val) => { this.keys[keyName] = val; };
      el.addEventListener('mousedown', (e) => { e.preventDefault(); setKey(true); });
      el.addEventListener('mouseup', (e) => { e.preventDefault(); setKey(false); });
      el.addEventListener('touchstart', (e) => { e.preventDefault(); setKey(true); });
      el.addEventListener('touchend', (e) => { e.preventDefault(); setKey(false); });
    };

    bindBtn('cr-btn-up', 'up');
    bindBtn('cr-btn-down', 'down');
    bindBtn('cr-btn-left', 'left');
    bindBtn('cr-btn-right', 'right');
  }

  start() {
    this.running = true;
    this.timer = this.roundTime;
    this.coinsCollectedCount = 0;
    this.totalCoinValueEarned = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.comboTimer = 0;
    this.coins = [];
    this.particles = [];
    this.floatingTexts = [];

    this.player.x = 480;
    this.player.y = 270;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.boostTimer = 0;
    this.player.angle = 0;

    // Populate initial coins
    for (let i = 0; i < 14; i++) {
      this.spawnCoin();
    }

    this.hideResultModal();
    this.updateHUD();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.running) {
        this.timer -= 1;
        this.updateHUD();
        if (this.timer <= 0) {
          this.endGame();
        }
      }
    }, 1000);

    cancelAnimationFrame(this.animId);
    this.loop = this.loop.bind(this);
    this.animId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animId);
  }

  spawnCoin(forcedType = null) {
    let x, y, collides;
    let attempts = 0;

    // Pick valid position avoiding pillars
    do {
      x = Math.random() * (this.width - 120) + 60;
      y = Math.random() * (this.height - 120) + 60;
      collides = false;

      for (let p of this.pillars) {
        if (x > p.x - 20 && x < p.x + p.w + 20 && y > p.y - 20 && y < p.y + p.h + 20) {
          collides = true;
          break;
        }
      }
      attempts++;
    } while (collides && attempts < 20);

    // Coin rarity
    let type = forcedType;
    if (!type) {
      const rand = Math.random();
      if (rand < 0.08) type = 'star';    // 8% Star Coin (+10 + speed boost)
      else if (rand < 0.30) type = 'gold'; // 22% Gold Coin (+5)
      else if (rand < 0.60) type = 'silver'; // 30% Silver Coin (+2)
      else type = 'bronze'; // 40% Bronze (+1)
    }

    let val = 1;
    let color = '#cd7f32';
    let radius = 10;

    if (type === 'silver') {
      val = 2;
      color = '#e2e8f0';
      radius = 11;
    } else if (type === 'gold') {
      val = 5;
      color = '#ffd166';
      radius = 13;
    } else if (type === 'star') {
      val = 10;
      color = '#00e5ff';
      radius = 15;
    }

    this.coins.push({
      x, y,
      type,
      val,
      color,
      radius,
      spawnScale: 0.1,
      bobOffset: Math.random() * Math.PI * 2
    });
  }

  update() {
    // Determine player speed
    let currentSpeed = this.player.speed;
    if (this.player.boostTimer > 0) {
      this.player.boostTimer--;
      currentSpeed = 8.5; // Boosted sprint
      // Emit rainbow trail particles
      if (Math.random() < 0.6) {
        this.createTrailParticle(this.player.x, this.player.y);
      }
    }

    // Input Movement
    let dx = 0;
    let dy = 0;
    if (this.keys.left) dx -= 1;
    if (this.keys.right) dx += 1;
    if (this.keys.up) dy -= 1;
    if (this.keys.down) dy += 1;

    if (dx !== 0 && dy !== 0) {
      // Normalize diagonal
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.player.vx = dx * currentSpeed;
    this.player.vy = dy * currentSpeed;

    if (dx !== 0 || dy !== 0) {
      this.player.angle = Math.atan2(dy, dx);
    }

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Arena Boundary Clamp
    const pr = this.player.radius;
    this.player.x = Math.max(35 + pr, Math.min(this.width - 35 - pr, this.player.x));
    this.player.y = Math.max(35 + pr, Math.min(this.height - 35 - pr, this.player.y));

    // Resolve Pillar Obstacle Collisions
    this.pillars.forEach(p => {
      const closestX = Math.max(p.x, Math.min(this.player.x, p.x + p.w));
      const closestY = Math.max(p.y, Math.min(this.player.y, p.y + p.h));
      const distSq = (this.player.x - closestX) ** 2 + (this.player.y - closestY) ** 2;

      if (distSq < pr ** 2) {
        const dist = Math.sqrt(distSq) || 0.1;
        const overlap = pr - dist;
        this.player.x += ((this.player.x - closestX) / dist) * overlap;
        this.player.y += ((this.player.y - closestY) / dist) * overlap;
      }
    });

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.updateHUD();
      }
    }

    // Coin Pickups
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (c.spawnScale < 1) c.spawnScale += 0.15;

      const dist = Math.hypot(this.player.x - c.x, this.player.y - c.y);
      if (dist < this.player.radius + c.radius) {
        // Collect!
        this.handleCoinCollect(c, i);
      }
    }

    // Keep minimum coins on screen
    if (this.coins.length < 12) {
      this.spawnCoin();
    }

    // Update Particles
    this.updateParticles();
    this.updateFloatingTexts();
  }

  handleCoinCollect(coin, index) {
    this.coins.splice(index, 1);
    this.coinsCollectedCount++;

    // Increment combo
    this.combo = Math.min(5, this.combo + 0.2);
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.comboTimer = 75; // ~1.25 seconds to chain next coin

    const baseVal = coin.val;
    const earnedVal = Math.round(baseVal * this.combo);
    this.totalCoinValueEarned += earnedVal;

    // Pitch rises with combo
    const pitch = 0.9 + Math.min(1.2, (this.combo - 1) * 0.25);

    if (coin.type === 'star') {
      this.player.boostTimer = 240; // 4 seconds of speed boost
      this.playSound('star');
      this.createBurstParticles(coin.x, coin.y, '#00e5ff', 24);
      this.addFloatingText(coin.x, coin.y, `SUPER BOOST! +${earnedVal}`, '#00e5ff');
      window.BloxLobby.showToast('Rainbow Star!', 'Speed Boost Activated!', 'coin', '⭐');
    } else {
      this.playSound('coin', pitch);
      this.createBurstParticles(coin.x, coin.y, coin.color, 10);
      const text = this.combo > 1.2 ? `+${earnedVal} (x${this.combo.toFixed(1)})` : `+${earnedVal}`;
      this.addFloatingText(coin.x, coin.y, text, coin.color);
    }

    this.updateHUD();
  }

  createBurstParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: Math.random() * 5 + 3,
        color,
        alpha: 1,
        decay: 0.04
      });
    }
  }

  createTrailParticle(x, y) {
    const avatar = window.AVATAR_REGISTRY[window.BloxState.getActiveAvatarId()] || window.AVATAR_REGISTRY.aahaan;
    this.particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 6 + 3,
      color: avatar.colors.headwear,
      alpha: 0.8,
      decay: 0.05
    });
  }

  addFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x, y,
      text,
      color,
      vy: -1.4,
      alpha: 1
    });
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }
  }

  updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.alpha -= 0.025;
      if (t.alpha <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  endGame() {
    this.stop();
    this.playSound('whistle');

    const totalCoinsToCredit = Math.max(10, this.totalCoinValueEarned);
    const calculatedScore = Math.round(this.totalCoinValueEarned * 12 + this.maxCombo * 60);

    // Save Score & Coins into BloxState
    const isHigh = window.BloxState.recordScore('coins', calculatedScore);
    window.BloxState.addCoins(totalCoinsToCredit, 'Gold Rush Arena');

    this.showResultModal(this.coinsCollectedCount, totalCoinsToCredit, calculatedScore, this.maxCombo, isHigh);
  }

  showResultModal(coinsCount, coinsEarned, score, maxCombo, isHigh) {
    const overlay = document.getElementById('coinrush-result-overlay');
    if (!overlay) return;

    document.getElementById('cr-res-coins').textContent = `${coinsCount}`;
    document.getElementById('cr-res-score').textContent = `${score} pts`;
    document.getElementById('cr-res-earned').textContent = `+${coinsEarned} ¢`;

    const subTitle = document.getElementById('cr-res-subtitle');
    if (subTitle) {
      subTitle.textContent = isHigh 
        ? `🔥 Fantastic! New High Score with a max combo of x${maxCombo.toFixed(1)}!`
        : `Arena run completed! Max combo of x${maxCombo.toFixed(1)} achieved.`;
    }

    overlay.classList.add('show');
  }

  hideResultModal() {
    const overlay = document.getElementById('coinrush-result-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  updateHUD() {
    const timerEl = document.getElementById('cr-hud-timer');
    const coinsEl = document.getElementById('cr-hud-coins');
    const comboEl = document.getElementById('cr-hud-combo');

    if (timerEl) timerEl.textContent = `${this.timer}s`;
    if (coinsEl) coinsEl.textContent = `${this.totalCoinValueEarned}`;
    if (comboEl) comboEl.textContent = `x${this.combo.toFixed(1)}`;
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Arena Floor & Cyber Grid
    this.renderArenaGrid(ctx);

    // 2. Pillars
    this.renderPillars(ctx);

    // 3. Coins
    this.renderCoins(ctx);

    // 4. Player Avatar (Top-down Blocky Roblox)
    this.renderPlayer(ctx);

    // 5. Particles & Floating Texts
    this.renderEffects(ctx);
  }

  renderArenaGrid(ctx) {
    // Dark floor
    ctx.fillStyle = '#0f1422';
    ctx.fillRect(0, 0, this.width, this.height);

    // Outer glow border
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, this.width - 60, this.height - 60);

    // Inner Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 30; x <= this.width - 30; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, this.height - 30);
      ctx.stroke();
    }
    for (let y = 30; y <= this.height - 30; y += 45) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(this.width - 30, y);
      ctx.stroke();
    }
  }

  renderPillars(ctx) {
    this.pillars.forEach(p => {
      ctx.save();
      // Pillar base
      ctx.fillStyle = '#1c2436';
      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Neon Top Border
      ctx.strokeStyle = '#00a2ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.w, p.h);

      // Stud on pillar
      ctx.fillStyle = 'rgba(0, 162, 255, 0.3)';
      ctx.fillRect(p.x + 15, p.y + 15, p.w - 30, p.h - 30);
      ctx.restore();
    });
  }

  renderCoins(ctx) {
    const time = performance.now() * 0.005;

    this.coins.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.spawnScale, c.spawnScale);

      const bob = Math.sin(time + c.bobOffset) * 3;
      ctx.translate(0, bob);

      ctx.shadowColor = c.color;
      ctx.shadowBlur = c.type === 'star' ? 18 : 8;

      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
      ctx.fill();

      // Coin rim
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, c.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Coin symbol
      ctx.fillStyle = '#121620';
      ctx.font = `bold ${Math.round(c.radius * 0.9)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.type === 'star' ? '★' : '¢', 0, 1);

      ctx.restore();
    });
  }

  renderPlayer(ctx) {
    const p = this.player;
    const avatarId = window.BloxState.getActiveAvatarId();
    const avatar = window.AVATAR_REGISTRY[avatarId] || window.AVATAR_REGISTRY.aahaan;
    const c = avatar.colors;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    // Speed boost glow
    if (p.boostTimer > 0) {
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 20;
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blocky Shoulders / Torso (Top-down view)
    ctx.fillStyle = c.torsoAccent;
    ctx.fillRect(-16, -12, 32, 24);

    // Hands
    ctx.fillStyle = c.skin;
    ctx.fillRect(14, -10, 6, 8);
    ctx.fillRect(14, 2, 6, 8);

    // Block Head
    ctx.fillStyle = c.skin;
    ctx.fillRect(-10, -9, 20, 18);

    // Headgear from top
    if (avatarId === 'aahaan') {
      // Cyan Visor Band
      ctx.fillStyle = c.headwear;
      ctx.fillRect(2, -9, 8, 18);
    } else if (avatarId === 'hetvi') {
      // Golden Crown Points
      ctx.fillStyle = c.headwear;
      ctx.fillRect(-6, -11, 12, 4);
      ctx.fillRect(8, -8, 4, 16);
    } else {
      // Sanvi: Blaze Bandana
      ctx.fillStyle = c.headwear;
      ctx.fillRect(4, -10, 6, 20);
    }

    ctx.restore();
  }

  renderEffects(ctx) {
    // Particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    });

    // Floating Combo / Bonus Texts
    this.floatingTexts.forEach(t => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillStyle = t.color;
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
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

// Global Instance
window.CoinRushGame = new CoinRushEngine();
