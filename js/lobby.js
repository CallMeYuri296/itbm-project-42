/**
 * ==========================================================================
 * BLOXVERSE ITBM EDITION - LOBBY CONTROLLER & UI SYSTEM
 * Handles podium rendering, avatar selector modal, tabs, toasts & sound effects
 * ==========================================================================
 */

class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playCoinSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Arpeggio chime
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playClickSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playSwitchSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

const SFX = new SoundEffects();

class LobbyManager {
  constructor() {
    this.state = window.BloxState;
    this.dom = {};
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.renderAll();
    this.renderAvatarModalCards();
    if (window.ObbyGame) {
      window.ObbyGame.mount('obby-canvas');
    }
    if (window.CoinRushGame) {
      window.CoinRushGame.mount('coinrush-canvas');
    }
    if (window.HazardDodgeGame) {
      window.HazardDodgeGame.mount('hazarddodge-canvas');
    }
    if (window.BloxShop) {
      window.BloxShop.render();
    }
    if (window.BloxAchievements) {
      window.BloxAchievements.check();
      window.BloxAchievements.renderGrid();
    }
    this.renderLeaderboard();
  }

  cacheDOM() {
    // Topbar
    this.dom.topbarCoins = document.getElementById('topbar-coin-val');
    this.dom.topbarCoinBadge = document.getElementById('topbar-coin-badge');
    this.dom.topbarAvatarMini = document.getElementById('topbar-avatar-mini');
    this.dom.topbarUserName = document.getElementById('topbar-user-name');
    this.dom.topbarUserRole = document.getElementById('topbar-user-role');
    this.dom.profilePill = document.getElementById('user-profile-pill');

    // Podium Showcase
    this.dom.podiumAvatar = document.getElementById('podium-avatar-container');
    this.dom.podiumDisk = document.getElementById('podium-disk');
    this.dom.podiumName = document.getElementById('podium-char-name');
    this.dom.podiumRole = document.getElementById('podium-char-role');
    this.dom.podiumTagline = document.getElementById('podium-char-tagline');
    this.dom.btnSwitchAvatar = document.getElementById('btn-switch-avatar');

    // Live Stats
    this.dom.statTotalCoins = document.getElementById('stat-total-coins');
    this.dom.statGamesPlayed = document.getElementById('stat-games-played');
    this.dom.statObbyBest = document.getElementById('stat-obby-best');
    this.dom.statCoinsBest = document.getElementById('stat-coins-best');
    this.dom.statSurvivalBest = document.getElementById('stat-survival-best');

    // Modals
    this.dom.avatarModal = document.getElementById('avatar-modal');
    this.dom.avatarModalClose = document.getElementById('avatar-modal-close');
    this.dom.avatarSelectionList = document.getElementById('avatar-selection-list');

    // Navigation Tabs
    this.dom.navTabs = document.querySelectorAll('.nav-tab-btn');
    this.dom.viewSections = document.querySelectorAll('.view-section');

    // Toasts
    this.dom.toastContainer = document.getElementById('toast-container');

    // Demo Buttons
    this.dom.demoAdd50 = document.getElementById('demo-add-50');
    this.dom.demoAdd100 = document.getElementById('demo-add-100');
    this.dom.demoReset = document.getElementById('demo-reset');

    // Rewarded Ad Simulation Button (ITBM showcase)
    this.dom.btnSimulateAd = document.getElementById('btn-simulate-ad');
    this.dom.adOverlay = document.getElementById('ad-simulation-overlay');
  }

  bindEvents() {
    // Open Avatar Modal
    if (this.dom.profilePill) {
      this.dom.profilePill.addEventListener('click', () => this.openAvatarModal());
    }
    if (this.dom.btnSwitchAvatar) {
      this.dom.btnSwitchAvatar.addEventListener('click', () => this.openAvatarModal());
    }

    // Close Avatar Modal
    if (this.dom.avatarModalClose) {
      this.dom.avatarModalClose.addEventListener('click', () => this.closeAvatarModal());
    }
    if (this.dom.avatarModal) {
      this.dom.avatarModal.addEventListener('click', (e) => {
        if (e.target === this.dom.avatarModal) this.closeAvatarModal();
      });
    }

    // Tab Navigation
    this.dom.navTabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        SFX.playClickSound();
        const targetView = btn.dataset.view;
        this.switchTab(targetView, btn);
      });
    });

    // Demo Controls
    if (this.dom.demoAdd50) {
      this.dom.demoAdd50.addEventListener('click', () => {
        SFX.playCoinSound();
        this.state.addCoins(50, 'Demo Presenter Bonus');
        this.showToast('Demo Reward', '+50 BloxCoins added to balance!', 'coin', '🪙');
      });
    }

    if (this.dom.demoAdd100) {
      this.dom.demoAdd100.addEventListener('click', () => {
        SFX.playCoinSound();
        this.state.addCoins(100, 'Investor Grant');
        this.showToast('Investor Grant', '+100 BloxCoins added!', 'coin', '💰');
      });
    }

    if (this.dom.demoReset) {
      this.dom.demoReset.addEventListener('click', () => {
        if (confirm('Reset platform data back to initial showcase state?')) {
          this.state.resetData();
          this.showToast('Reset Complete', 'Data reset to default 100 coins & Aahaan.', 'info', '🔄');
        }
      });
    }

    // Rewarded Ad Interactive Demo (ITBM presentation highlight)
    if (this.dom.btnSimulateAd) {
      this.dom.btnSimulateAd.addEventListener('click', () => {
        this.simulateRewardedAd();
      });
    }

    // React to state changes
    this.state.subscribe('balanceChanged', ({ balance, diff, type, reason }) => {
      this.renderCoins(balance, diff > 0);
      if (window.BloxShop) window.BloxShop.render();
      if (window.BloxAchievements) window.BloxAchievements.check();
      this.renderLeaderboard();
    });

    this.state.subscribe('avatarChanged', ({ avatarId }) => {
      this.renderAvatarProfile(avatarId);
      this.updateAvatarModalSelection(avatarId);
      this.renderLeaderboard();
    });

    this.state.subscribe('statsChanged', ({ stats }) => {
      this.renderStats(stats);
      if (window.BloxAchievements) window.BloxAchievements.check();
      this.renderLeaderboard();
    });

    this.state.subscribe('inventoryChanged', () => {
      this.renderAvatarProfile(this.state.getActiveAvatarId());
      if (window.BloxShop) window.BloxShop.render();
      if (window.BloxAchievements) window.BloxAchievements.check();
    });

    this.state.subscribe('stateReset', () => {
      this.renderAll();
      if (window.BloxShop) window.BloxShop.render();
      if (window.BloxAchievements) {
        window.BloxAchievements.check();
        window.BloxAchievements.renderGrid();
      }
      this.renderLeaderboard();
    });
  }

  renderAll() {
    const activeId = this.state.getActiveAvatarId();
    const balance = this.state.getBalance();
    const stats = this.state.getState().stats;

    this.renderAvatarProfile(activeId);
    this.renderCoins(balance, false);
    this.renderStats(stats);
  }

  renderCoins(balance, animatePulse = false) {
    if (this.dom.topbarCoins) {
      this.dom.topbarCoins.textContent = balance.toLocaleString();
    }
    if (this.dom.statTotalCoins) {
      this.dom.statTotalCoins.textContent = balance.toLocaleString();
    }
    if (animatePulse && this.dom.topbarCoinBadge) {
      this.dom.topbarCoinBadge.classList.remove('pulse');
      void this.dom.topbarCoinBadge.offsetWidth; // Trigger reflow
      this.dom.topbarCoinBadge.classList.add('pulse');
    }
  }

  renderStats(stats) {
    if (this.dom.statGamesPlayed) this.dom.statGamesPlayed.textContent = stats.gamesPlayed;
    if (this.dom.statObbyBest) this.dom.statObbyBest.textContent = stats.obbyHighScore > 0 ? `${stats.obbyHighScore} pts` : '--';
    if (this.dom.statCoinsBest) this.dom.statCoinsBest.textContent = stats.coinRushHighScore > 0 ? `${stats.coinRushHighScore} pts` : '--';
    if (this.dom.statSurvivalBest) this.dom.statSurvivalBest.textContent = stats.survivalHighScore > 0 ? `${stats.survivalHighScore}s` : '--';
  }

  renderAvatarProfile(avatarId) {
    const avatar = window.AVATAR_REGISTRY[avatarId] || window.AVATAR_REGISTRY.aahaan;
    const cosmetics = this.state.getActiveCosmetics ? this.state.getActiveCosmetics() : {};

    // Topbar Pill
    if (this.dom.topbarAvatarMini) {
      this.dom.topbarAvatarMini.innerHTML = window.renderAvatarSVG(avatar.id, { badgeMode: true, cosmetics });
    }
    if (this.dom.topbarUserName) this.dom.topbarUserName.textContent = avatar.name;
    if (this.dom.topbarUserRole) this.dom.topbarUserRole.textContent = avatar.title;

    // Podium Showcase
    if (this.dom.podiumAvatar) {
      this.dom.podiumAvatar.innerHTML = window.renderAvatarSVG(avatar.id, { badgeMode: false, cosmetics });
    }
    if (this.dom.podiumName) this.dom.podiumName.textContent = avatar.name;
    if (this.dom.podiumRole) this.dom.podiumRole.textContent = avatar.title;
    if (this.dom.podiumTagline) this.dom.podiumTagline.textContent = `"${avatar.tagline}"`;

    // Dynamic color glow for the podium disk
    if (this.dom.podiumDisk) {
      this.dom.podiumDisk.style.borderColor = avatar.colors.torsoAccent;
      this.dom.podiumDisk.style.boxShadow = `0 0 35px ${avatar.colors.torsoAccent}66`;
    }
  }

  openAvatarModal() {
    SFX.playClickSound();
    if (this.dom.avatarModal) {
      this.updateAvatarModalSelection(this.state.getActiveAvatarId());
      this.dom.avatarModal.classList.add('open');
    }
  }

  closeAvatarModal() {
    SFX.playClickSound();
    if (this.dom.avatarModal) {
      this.dom.avatarModal.classList.remove('open');
    }
  }

  renderAvatarModalCards() {
    if (!this.dom.avatarSelectionList) return;
    const currentId = this.state.getActiveAvatarId();
    this.dom.avatarSelectionList.innerHTML = '';

    Object.values(window.AVATAR_REGISTRY).forEach(avatar => {
      const card = document.createElement('div');
      card.className = `avatar-select-card ${avatar.id === currentId ? 'selected' : ''}`;
      card.dataset.avatarId = avatar.id;

      card.innerHTML = `
        <span class="avatar-selected-badge">Active</span>
        <div class="avatar-card-preview">
          ${window.renderAvatarSVG(avatar.id, { badgeMode: false })}
        </div>
        <div class="avatar-card-name">${avatar.name}</div>
        <div class="avatar-card-role">${avatar.title}</div>
        <p style="font-size: 0.76rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.35;">
          ${avatar.bio}
        </p>
        <div class="avatar-card-traits">
          <div class="trait-row">
            <span>Speed</span>
            <div class="trait-bar-track">
              <div class="trait-bar-fill" style="width: ${avatar.traits.speed}%; background: ${avatar.colors.headwear};"></div>
            </div>
          </div>
          <div class="trait-row">
            <span>Agility</span>
            <div class="trait-bar-track">
              <div class="trait-bar-fill" style="width: ${avatar.traits.agility}%; background: ${avatar.colors.torsoAccent};"></div>
            </div>
          </div>
          <div class="trait-row">
            <span>Strategy</span>
            <div class="trait-bar-track">
              <div class="trait-bar-fill" style="width: ${avatar.traits.strategy}%; background: ${avatar.colors.shoes};"></div>
            </div>
          </div>
        </div>
        <button class="btn btn-sm ${avatar.id === currentId ? 'btn-secondary' : 'btn-primary'}" style="width: 100%;">
          ${avatar.id === currentId ? 'Currently Equipped' : 'Select Avatar'}
        </button>
      `;

      card.addEventListener('click', () => {
        this.selectAvatar(avatar.id);
      });

      this.dom.avatarSelectionList.appendChild(card);
    });
  }

  updateAvatarModalSelection(selectedId) {
    if (!this.dom.avatarSelectionList) return;
    const cards = this.dom.avatarSelectionList.querySelectorAll('.avatar-select-card');
    cards.forEach(card => {
      const id = card.dataset.avatarId;
      const isSelected = (id === selectedId);
      card.classList.toggle('selected', isSelected);
      const btn = card.querySelector('button');
      if (btn) {
        btn.textContent = isSelected ? 'Currently Equipped' : 'Select Avatar';
        btn.className = `btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-primary'}`;
      }
    });
  }

  selectAvatar(avatarId) {
    if (this.state.getActiveAvatarId() === avatarId) {
      this.closeAvatarModal();
      return;
    }
    SFX.playSwitchSound();
    this.state.setActiveAvatar(avatarId);
    const char = window.AVATAR_REGISTRY[avatarId];
    this.showToast('Avatar Switched', `Now playing as ${char.name} (${char.title})`, 'info', '👤');
    setTimeout(() => this.closeAvatarModal(), 200);
  }

  switchTab(targetViewId, activeBtn) {
    this.dom.navTabs.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');

    this.dom.viewSections.forEach(section => {
      section.classList.toggle('active', section.id === targetViewId);
    });
  }

  showToast(title, message, type = 'info', iconText = '🔔') {
    if (!this.dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${iconText}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;

    this.dom.toastContainer.appendChild(toast);
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  simulateRewardedAd() {
    if (!this.dom.adOverlay) return;
    SFX.playClickSound();

    let countdown = 3;
    const adCountEl = document.getElementById('ad-timer-countdown');
    const adStatusEl = document.getElementById('ad-status-text');

    this.dom.adOverlay.style.display = 'flex';
    if (adCountEl) adCountEl.textContent = countdown;
    if (adStatusEl) adStatusEl.textContent = 'Simulating Sponsor Video Ad...';

    const interval = setInterval(() => {
      countdown -= 1;
      if (adCountEl) adCountEl.textContent = countdown;

      if (countdown <= 0) {
        clearInterval(interval);
        this.dom.adOverlay.style.display = 'none';
        SFX.playCoinSound();
        this.state.addCoins(25, 'Rewarded Ad View');
        this.showToast('Ad Reward Granted', '+25 BloxCoins earned from Sponsor!', 'coin', '🎁');
      }
    }, 1000);
  }

  launchObby() {
    SFX.playClickSound();
    // Deselect nav tabs
    this.dom.navTabs.forEach(btn => btn.classList.remove('active'));

    // Show obby section
    this.dom.viewSections.forEach(sec => {
      sec.classList.toggle('active', sec.id === 'view-obby');
    });

    if (window.ObbyGame) {
      window.ObbyGame.start();
    }
    this.showToast('Game Started', 'Tower of Obby loaded! Reach the trophy!', 'info', '🧗');
  }

  exitToLobby() {
    SFX.playSwitchSound();
    if (window.ObbyGame) {
      window.ObbyGame.stop();
      window.ObbyGame.hideVictoryModal();
    }
    if (window.BloxAchievements) {
      window.BloxAchievements.check();
      window.BloxAchievements.renderGrid();
    }
    const gamesTab = document.querySelector('[data-view="view-games"]');
    if (gamesTab) {
      this.switchTab('view-games', gamesTab);
    }
  }

  launchCoinRush() {
    SFX.playClickSound();
    this.dom.navTabs.forEach(btn => btn.classList.remove('active'));

    this.dom.viewSections.forEach(sec => {
      sec.classList.toggle('active', sec.id === 'view-coinrush');
    });

    if (window.CoinRushGame) {
      window.CoinRushGame.start();
    }
    this.showToast('Game Started', 'Gold Rush Arena started! Collect coins!', 'coin', '🪙');
  }

  exitCoinRush() {
    SFX.playSwitchSound();
    if (window.CoinRushGame) {
      window.CoinRushGame.stop();
      window.CoinRushGame.hideResultModal();
    }
    if (window.BloxAchievements) {
      window.BloxAchievements.check();
      window.BloxAchievements.renderGrid();
    }
    const gamesTab = document.querySelector('[data-view="view-games"]');
    if (gamesTab) {
      this.switchTab('view-games', gamesTab);
    }
  }

  launchHazardDodge() {
    SFX.playClickSound();
    this.dom.navTabs.forEach(btn => btn.classList.remove('active'));

    this.dom.viewSections.forEach(sec => {
      sec.classList.toggle('active', sec.id === 'view-hazarddodge');
    });

    if (window.HazardDodgeGame) {
      window.HazardDodgeGame.start();
    }
    this.showToast('Game Started', 'Hazard Dodge started! Dodge all hazards!', 'info', '⚡');
  }

  exitHazardDodge() {
    SFX.playSwitchSound();
    if (window.HazardDodgeGame) {
      window.HazardDodgeGame.stop();
      window.HazardDodgeGame.hideResultModal();
    }
    if (window.BloxAchievements) {
      window.BloxAchievements.check();
      window.BloxAchievements.renderGrid();
    }
    const gamesTab = document.querySelector('[data-view="view-games"]');
    if (gamesTab) {
      this.switchTab('view-games', gamesTab);
    }
  }

  /**
   * Phase 4: Dynamic Leaderboard Rendering
   * Renders real high score data combined with roster stats
   */
  renderLeaderboard(filter = 'all') {
    const tableBody = document.getElementById('leaderboard-tbody');
    if (!tableBody) return;

    const s = this.state.getState();
    const activeId = s.activeAvatarId;
    const stats = s.stats;
    const balance = s.balance;

    // Build data for all 3 avatar identities
    // Active avatar gets player's real live recorded stats
    const roster = [
      {
        id: 'aahaan',
        name: 'Aahaan',
        role: 'Tech Adventurer',
        color: 'var(--roblox-blue)',
        avatarBadge: 'AH',
        badgeBg: '#17223b',
        obbyScore: activeId === 'aahaan' ? (stats.obbyHighScore || 0) : Math.max(320, stats.obbyHighScore || 0),
        goldRushScore: activeId === 'aahaan' ? (stats.coinRushHighScore || 0) : Math.max(85, stats.coinRushHighScore || 0),
        survivalTime: activeId === 'aahaan' ? (stats.survivalHighScore || 0) : 48.5,
        coins: activeId === 'aahaan' ? balance : 1250,
        isCurrent: activeId === 'aahaan'
      },
      {
        id: 'hetvi',
        name: 'Hetvi',
        role: 'Creative Strategist',
        color: '#9d4edd',
        avatarBadge: 'HV',
        badgeBg: '#3c096c',
        obbyScore: activeId === 'hetvi' ? (stats.obbyHighScore || 0) : Math.max(280, stats.obbyHighScore || 0),
        goldRushScore: activeId === 'hetvi' ? (stats.coinRushHighScore || 0) : Math.max(95, stats.coinRushHighScore || 0),
        survivalTime: activeId === 'hetvi' ? (stats.survivalHighScore || 0) : 42.0,
        coins: activeId === 'hetvi' ? balance : 1100,
        isCurrent: activeId === 'hetvi'
      },
      {
        id: 'sanvi',
        name: 'Sanvi',
        role: 'Speed Champion',
        color: '#06d6a0',
        avatarBadge: 'SV',
        badgeBg: '#07241a',
        obbyScore: activeId === 'sanvi' ? (stats.obbyHighScore || 0) : Math.max(310, stats.obbyHighScore || 0),
        goldRushScore: activeId === 'sanvi' ? (stats.coinRushHighScore || 0) : Math.max(70, stats.coinRushHighScore || 0),
        survivalTime: activeId === 'sanvi' ? (stats.survivalHighScore || 0) : 52.8,
        coins: activeId === 'sanvi' ? balance : 980,
        isCurrent: activeId === 'sanvi'
      }
    ];

    // Calculate composite rank score: Obby + (GoldRush * 3) + (Survival * 10)
    roster.forEach(r => {
      r.totalRating = (r.obbyScore) + (r.goldRushScore * 3) + Math.round(r.survivalTime * 10);
    });

    roster.sort((a, b) => b.totalRating - a.totalRating);

    const rankMedals = ['🥇 #1', '🥈 #2', '🥉 #3'];
    const rankColors = ['lb-rank-gold', 'lb-rank-silver', 'lb-rank-bronze'];

    tableBody.innerHTML = roster.map((player, idx) => {
      return `
        <tr class="${player.isCurrent ? 'current-player' : ''}">
          <td class="lb-rank-cell ${rankColors[idx] || 'lb-rank-default'}">${rankMedals[idx] || '#' + (idx + 1)}</td>
          <td>
            <div class="lb-player-cell">
              <div class="lb-avatar-icon" style="background:${player.badgeBg}; color:${player.color}; border: 1.5px solid ${player.color};">
                ${player.avatarBadge}
              </div>
              <div>
                <div style="font-weight:800; color:#fff; display:flex; align-items:center; gap:6px;">
                  ${player.name}
                  ${player.isCurrent ? '<span class="you-badge">YOU</span>' : ''}
                </div>
                <div style="font-size:0.72rem; color:var(--text-muted);">${player.role}</div>
              </div>
            </div>
          </td>
          <td class="lb-score-cell">${player.obbyScore > 0 ? player.obbyScore + ' pts' : '--'}</td>
          <td class="lb-score-cell">${player.goldRushScore > 0 ? player.goldRushScore + ' 🪙' : '--'}</td>
          <td class="lb-score-cell">${player.survivalTime > 0 ? player.survivalTime.toFixed(1) + 's' : '--'}</td>
          <td class="lb-coins-cell">${player.coins.toLocaleString()} ¢</td>
        </tr>
      `;
    }).join('');
  }
}

// Global Lobby Instance
window.BloxLobby = new LobbyManager();
