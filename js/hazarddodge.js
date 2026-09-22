/**
 * ==========================================================================
 * BLOXVERSE ITBM EDITION - HAZARD DODGE SURVIVAL MINI-GAME
 * Avoidance Survival Engine with Progressive Hazard Waves, Dash, & Shields
 * ==========================================================================
 */

class HazardDodgeEngine {
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
    this.timeSurvived = 0;
    this.timerInterval = null;
    this.currentWave = 1;

    // Player
    this.player = {
      x: 480,
      y: 270,
      radius: 18,
      vx: 0,
      vy: 0,
      speed: 4.8,
      dashCooldown: 0,
      dashActiveTimer: 0,
      hasShield: false,
      angle: 0
    };

    // Hazards
    this.mines = [];
    this.lasers = [];
    this.shockwaves = [];
    this.powerups = [];
    this.particles = [];

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

    if (type === 'dash') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'laser') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'shield') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'explosion') {
      const osc = this.audio.createOscillator();
      const gain = this.audio.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.audio.destination);
      osc.start(now);
      osc.stop(now + 0.4);
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
      if (['Space', 'KeyJ'].includes(e.code)) {
        this.triggerDash();
        e.preventDefault();
      }
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

    bindBtn('hd-btn-up', 'up');
    bindBtn('hd-btn-down', 'down');
    bindBtn('hd-btn-left', 'left');
    bindBtn('hd-btn-right', 'right');

    const dashBtn = document.getElementById('hd-btn-dash');
    if (dashBtn) {
      dashBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.triggerDash();
      });
    }
  }

  triggerDash() {
    if (this.player.dashCooldown > 0) return;
    this.player.dashActiveTimer = 10; // 10 frames of invulnerable high-speed dash
    this.player.dashCooldown = 65; // ~1.1s cooldown
    this.playSound('dash');
    this.createDashGhost(this.player.x, this.player.y);
  }

  start() {
    this.running = true;
    this.timeSurvived = 0;
    this.currentWave = 1;
    this.mines = [];
    this.lasers = [];
    this.shockwaves = [];
    this.powerups = [];
    this.particles = [];

    this.player.x = 480;
    this.player.y = 270;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.dashCooldown = 0;
    this.player.dashActiveTimer = 0;
    this.player.hasShield = false;
    this.player.angle = 0;

    // Spawn initial wave of bouncing mines
    this.spawnMine();
    this.spawnMine();

    this.hideResultModal();
    this.updateHUD();

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.running) {
        this.timeSurvived += 0.1;
        this.checkWaveProgression();
        this.updateHUD();
      }
    }, 100);

    cancelAnimationFrame(this.animId);
    this.loop = this.loop.bind(this);
    this.animId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animId);
  }

  checkWaveProgression() {
    const t = this.timeSurvived;

    // Wave 1: Mines (0 - 12s)
    if (t > 5 && this.mines.length < 3) this.spawnMine();
    if (t > 10 && this.mines.length < 4) this.spawnMine();

    // Wave 2: Sweeping Lasers (12s+)
    if (t >= 12 && this.currentWave < 2) {
      this.currentWave = 2;
      window.BloxLobby.showToast('Wave 2 Warning!', 'Laser Grids incoming!', 'info', '⚠️');
    }
    if (t >= 12 && Math.random() < 0.04 && this.lasers.length < 2) {
      this.spawnLaser();
    }

    // Wave 3: Expanding Shockwaves (25s+)
    if (t >= 25 && this.currentWave < 3) {
      this.currentWave = 3;
      window.BloxLobby.showToast('Wave 3 Warning!', 'Plasma Shockwaves detected!', 'info', '🚨');
    }
    if (t >= 25 && Math.random() < 0.03 && this.shockwaves.length < 2) {
      this.spawnShockwave();
    }

    // Wave 4: Ultimate Frenzy (40s+)
    if (t >= 40 && this.currentWave < 4) {
      this.currentWave = 4;
      window.BloxLobby.showToast('Wave 4 Overdrive!', 'Maximum Hazard Intensity!', 'coin', '⚡');
    }
    if (t >= 40 && this.mines.length < 6) {
      this.spawnMine();
    }

    // Shield Powerup Spawner (Occasional)
    if (!this.player.hasShield && this.powerups.length === 0 && Math.random() < 0.015) {
      this.spawnShield();
    }
  }

  spawnMine() {
    // Spawn at outer border
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * this.width; y = 40; }
    else if (side === 1) { x = this.width - 40; y = Math.random() * this.height; }
    else if (side === 2) { x = Math.random() * this.width; y = this.height - 40; }
    else { x = 40; y = Math.random() * this.height; }

    const speed = 2.4 + Math.random() * 1.5;
    const angle = Math.random() * Math.PI * 2;

    this.mines.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 14,
      rotation: 0
    });
  }

  spawnLaser() {
    const isHorizontal = Math.random() < 0.5;
    this.lasers.push({
      isHorizontal,
      coord: isHorizontal ? (Math.random() * (this.height - 120) + 60) : (Math.random() * (this.width - 120) + 60),
      timer: 55, // ~0.9s telegraph warning, then 15 frames of lethal beam
      firing: false
    });
  }

  spawnShockwave() {
    this.shockwaves.push({
      x: Math.random() * (this.width - 200) + 100,
      y: Math.random() * (this.height - 200) + 100,
      currentRadius: 0,
      maxRadius: 85,
      timer: 50, // Telegraph expansion
      exploded: false
    });
  }

  spawnShield() {
    this.powerups.push({
      x: Math.random() * (this.width - 160) + 80,
      y: Math.random() * (this.height - 160) + 80,
      radius: 16
    });
  }

  update() {
    const p = this.player;

    // Dash Timers
    if (p.dashCooldown > 0) p.dashCooldown--;
    let currentSpeed = p.speed;

    if (p.dashActiveTimer > 0) {
      p.dashActiveTimer--;
      currentSpeed = 12.0; // High speed dash burst
      this.createDashGhost(p.x, p.y);
    }

    // Input Movement
    let dx = 0;
    let dy = 0;
    if (this.keys.left) dx -= 1;
    if (this.keys.right) dx += 1;
    if (this.keys.up) dy -= 1;
    if (this.keys.down) dy += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    p.vx = dx * currentSpeed;
    p.vy = dy * currentSpeed;

    if (dx !== 0 || dy !== 0) {
      p.angle = Math.atan2(dy, dx);
    }

    p.x += p.vx;
    p.y += p.vy;

    // Arena Boundary Clamp
    p.x = Math.max(35 + p.radius, Math.min(this.width - 35 - p.radius, p.x));
    p.y = Math.max(35 + p.radius, Math.min(this.height - 35 - p.radius, p.y));

    // Update Bouncing Mines
    this.mines.forEach(m => {
      m.x += m.vx;
      m.y += m.vy;
      m.rotation += 0.05;

      // Bounce off walls
      if (m.x <= 35 + m.radius) { m.x = 35 + m.radius; m.vx *= -1; }
      else if (m.x >= this.width - 35 - m.radius) { m.x = this.width - 35 - m.radius; m.vx *= -1; }
      if (m.y <= 35 + m.radius) { m.y = 35 + m.radius; m.vy *= -1; }
      else if (m.y >= this.height - 35 - m.radius) { m.y = this.height - 35 - m.radius; m.vy *= -1; }

      // Mine vs Player Collision
      if (p.dashActiveTimer <= 0) {
        const dist = Math.hypot(p.x - m.x, p.y - m.y);
        if (dist < p.radius + m.radius) {
          this.handlePlayerHit();
        }
      }
    });

    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.timer--;

      if (l.timer === 15) {
        l.firing = true;
        this.playSound('laser');
      }

      if (l.firing && p.dashActiveTimer <= 0) {
        if (l.isHorizontal && Math.abs(p.y - l.coord) < p.radius + 10) {
          this.handlePlayerHit();
        } else if (!l.isHorizontal && Math.abs(p.x - l.coord) < p.radius + 10) {
          this.handlePlayerHit();
        }
      }

      if (l.timer <= 0) {
        this.lasers.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.timer--;

      if (s.timer > 15) {
        // Warning circle expansion
        s.currentRadius = ((50 - s.timer) / 35) * s.maxRadius;
      } else if (s.timer === 15) {
        // Blast!
        s.exploded = true;
        this.playSound('explosion');
        this.createShockwaveParticles(s.x, s.y);
      }

      if (s.exploded && p.dashActiveTimer <= 0) {
        const dist = Math.hypot(p.x - s.x, p.y - s.y);
        if (dist < s.maxRadius + p.radius) {
          this.handlePlayerHit();
        }
      }

      if (s.timer <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Powerups (Shield)
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      const dist = Math.hypot(p.x - pw.x, p.y - pw.y);
      if (dist < p.radius + pw.radius) {
        this.powerups.splice(i, 1);
        p.hasShield = true;
        this.playSound('shield');
        this.updateHUD();
        window.BloxLobby.showToast('Energy Shield!', 'Absorbs 1 Hazard Hit!', 'success', '🛡️');
      }
    }

    // Update Particles
    this.updateParticles();
  }

  handlePlayerHit() {
    if (this.player.hasShield) {
      // Shield absorbs hit
      this.player.hasShield = false;
      this.playSound('explosion');
      this.createShockwaveParticles(this.player.x, this.player.y, '#00e5ff');
      this.player.dashActiveTimer = 18; // Brief invulnerability
      this.updateHUD();
      window.BloxLobby.showToast('Shield Broken!', 'Hazard absorbed safely!', 'info', '💥');
      return;
    }

    // Lethal Hit - Game Over
    this.playSound('explosion');
    this.createShockwaveParticles(this.player.x, this.player.y, '#ff3366');
    this.endGame();
  }

  createDashGhost(x, y) {
    const avatar = window.AVATAR_REGISTRY[window.BloxState.getActiveAvatarId()] || window.AVATAR_REGISTRY.aahaan;
    this.particles.push({
      x, y,
      vx: 0, vy: 0,
      size: 26,
      color: avatar.colors.headwear,
      alpha: 0.6,
      decay: 0.08
    });
  }

  createShockwaveParticles(x, y, color = '#ff3366') {
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const speed = Math.random() * 5 + 4;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color,
        alpha: 1,
        decay: 0.035
      });
    }
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

  endGame() {
    this.stop();

    const time = parseFloat(this.timeSurvived.toFixed(1));

    // Calculate coin reward based on survival time + milestone bonuses
    let coinsEarned = Math.max(5, Math.floor(time / 2));
    if (time >= 15) coinsEarned += 10;
    if (time >= 30) coinsEarned += 20;
    if (time >= 45) coinsEarned += 30;

    const calculatedScore = Math.round(time * 25);

    // Save Score & Coins into BloxState
    const isHigh = window.BloxState.recordScore('survival', Math.round(time));
    window.BloxState.addCoins(coinsEarned, 'Hazard Dodge Survival');

    this.showResultModal(time, coinsEarned, calculatedScore, this.currentWave, isHigh);
  }

  showResultModal(time, coins, score, wave, isHigh) {
    const overlay = document.getElementById('hazarddodge-result-overlay');
    if (!overlay) return;

    document.getElementById('hd-res-time').textContent = `${time}s`;
    document.getElementById('hd-res-score').textContent = `${score} pts`;
    document.getElementById('hd-res-earned').textContent = `+${coins} ¢`;

    const subTitle = document.getElementById('hd-res-subtitle');
    if (subTitle) {
      subTitle.textContent = isHigh 
        ? `🔥 Incredible Reflexes! New High Score survived through Wave ${wave}!`
        : `Run ended at Wave ${wave}. Great survival effort!`;
    }

    overlay.classList.add('show');
  }

  hideResultModal() {
    const overlay = document.getElementById('hazarddodge-result-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  updateHUD() {
    const timeEl = document.getElementById('hd-hud-time');
    const waveEl = document.getElementById('hd-hud-wave');
    const shieldEl = document.getElementById('hd-hud-shield');
    const dashEl = document.getElementById('hd-hud-dash');

    if (timeEl) timeEl.textContent = `${this.timeSurvived.toFixed(1)}s`;
    if (waveEl) waveEl.textContent = `Wave ${this.currentWave}`;
    if (shieldEl) {
      shieldEl.textContent = this.player.hasShield ? 'Shield: ACTIVE' : 'Shield: None';
      shieldEl.style.color = this.player.hasShield ? '#00e5ff' : 'var(--text-muted)';
    }
    if (dashEl) {
      dashEl.textContent = this.player.dashCooldown <= 0 ? 'Dash: READY' : 'Dash: Recharging';
      dashEl.style.color = this.player.dashCooldown <= 0 ? '#00e676' : 'var(--text-muted)';
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Neon Grid & Pulse Arena
    this.renderArenaGrid(ctx);

    // 2. Shockwaves
    this.renderShockwaves(ctx);

    // 3. Lasers
    this.renderLasers(ctx);

    // 4. Powerups
    this.renderPowerups(ctx);

    // 5. Bouncing Mines
    this.renderMines(ctx);

    // 6. Player Avatar
    this.renderPlayer(ctx);

    // 7. Particles
    this.renderParticles(ctx);
  }

  renderArenaGrid(ctx) {
    ctx.fillStyle = '#0a0d16';
    ctx.fillRect(0, 0, this.width, this.height);

    // Neon Danger Border
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, this.width - 60, this.height - 60);

    // Grid
    ctx.strokeStyle = 'rgba(255, 51, 102, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 30; x <= this.width - 30; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, this.height - 30);
      ctx.stroke();
    }
    for (let y = 30; y <= this.height - 30; y += 50) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(this.width - 30, y);
      ctx.stroke();
    }
  }

  renderMines(ctx) {
    this.mines.forEach(m => {
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rotation);

      // Red Hazard Glow
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 12;

      // Spikes
      ctx.fillStyle = '#ff1744';
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.fillRect(-3, -m.radius - 5, 6, 10);
      }

      // Mine Core
      ctx.fillStyle = '#220008';
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  renderLasers(ctx) {
    this.lasers.forEach(l => {
      ctx.save();
      if (!l.firing) {
        // Telegraph indicator (dashed line)
        ctx.strokeStyle = 'rgba(255, 51, 102, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        if (l.isHorizontal) {
          ctx.moveTo(30, l.coord);
          ctx.lineTo(this.width - 30, l.coord);
        } else {
          ctx.moveTo(l.coord, 30);
          ctx.lineTo(l.coord, this.height - 30);
        }
        ctx.stroke();
      } else {
        // Firing beam!
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#ff1744';
        if (l.isHorizontal) {
          ctx.fillRect(30, l.coord - 10, this.width - 60, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(30, l.coord - 4, this.width - 60, 8);
        } else {
          ctx.fillRect(l.coord - 10, 30, 20, this.height - 60);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(l.coord - 4, 30, 8, this.height - 60);
        }
      }
      ctx.restore();
    });
  }

  renderShockwaves(ctx) {
    this.shockwaves.forEach(s => {
      ctx.save();
      if (!s.exploded) {
        // Expanding warning perimeter
        ctx.strokeStyle = 'rgba(255, 51, 102, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 51, 102, 0.15)';
        ctx.fill();
      }
      ctx.restore();
    });
  }

  renderPowerups(ctx) {
    const time = performance.now() * 0.005;

    this.powerups.forEach(pw => {
      ctx.save();
      ctx.translate(pw.x, pw.y);
      const bob = Math.sin(time) * 4;
      ctx.translate(0, bob);

      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 18;

      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
      ctx.fill();

      // Shield icon
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛡️', 0, 1);

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

    // Dash / Invulnerability aura
    if (p.dashActiveTimer > 0) {
      ctx.shadowColor = '#00e676';
      ctx.shadowBlur = 24;
    }

    // Protective Energy Shield Bubble
    if (p.hasShield) {
      ctx.save();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
      ctx.fill();
      ctx.restore();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 20, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Torso / Shoulders
    ctx.fillStyle = c.torsoAccent;
    ctx.fillRect(-15, -11, 30, 22);

    // Hands
    ctx.fillStyle = c.skin;
    ctx.fillRect(13, -9, 5, 7);
    ctx.fillRect(13, 2, 5, 7);

    // Head
    ctx.fillStyle = c.skin;
    ctx.fillRect(-9, -8, 18, 16);

    // Headgear
    if (avatarId === 'aahaan') {
      ctx.fillStyle = c.headwear;
      ctx.fillRect(2, -8, 7, 16);
    } else if (avatarId === 'hetvi') {
      ctx.fillStyle = c.headwear;
      ctx.fillRect(-5, -10, 10, 3);
      ctx.fillRect(7, -7, 4, 14);
    } else {
      ctx.fillStyle = c.headwear;
      ctx.fillRect(3, -9, 5, 18);
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

// Global Instance
window.HazardDodgeGame = new HazardDodgeEngine();
