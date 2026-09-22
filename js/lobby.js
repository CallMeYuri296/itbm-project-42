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
    });

    this.state.subscribe('avatarChanged', ({ avatarId }) => {
      this.renderAvatarProfile(avatarId);
      this.updateAvatarModalSelection(avatarId);
    });

    this.state.subscribe('statsChanged', ({ stats }) => {
      this.renderStats(stats);
    });

    this.state.subscribe('stateReset', () => {
      this.renderAll();
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
    if (this.dom.statSurvivalBest) this.dom.statSurvivalBest.textContent = stats.survivalHighScore > 0 ? `${stats.survivalHighScore}s` : '--';
  }

  renderAvatarProfile(avatarId) {
    const avatar = window.AVATAR_REGISTRY[avatarId] || window.AVATAR_REGISTRY.aahaan;

    // Topbar Pill
    if (this.dom.topbarAvatarMini) {
      this.dom.topbarAvatarMini.innerHTML = window.renderAvatarSVG(avatar.id, { badgeMode: true });
    }
    if (this.dom.topbarUserName) this.dom.topbarUserName.textContent = avatar.name;
    if (this.dom.topbarUserRole) this.dom.topbarUserRole.textContent = avatar.title;

    // Podium Showcase
    if (this.dom.podiumAvatar) {
      this.dom.podiumAvatar.innerHTML = window.renderAvatarSVG(avatar.id, { badgeMode: false });
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
    const gamesTab = document.querySelector('[data-view="view-games"]');
    if (gamesTab) {
      this.switchTab('view-games', gamesTab);
    }
  }
}

// Global Lobby Instance
window.BloxLobby = new LobbyManager();
