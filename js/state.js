/**
 * ==========================================================================
 * BLOXVERSE ITBM EDITION - STATE MANAGEMENT ENGINE
 * Handles LocalStorage persistence, coin balances, scores & avatar choices
 * ==========================================================================
 */

const STORAGE_KEY = 'bloxverse_itbm_state_v1';

// Initial state for fresh sessions
const DEFAULT_STATE = {
  activeAvatarId: 'aahaan', // 'aahaan' | 'hetvi' | 'sanvi'
  balance: 100,             // Starting welcome bonus for immediate testing
  stats: {
    totalCoinsEarned: 100,
    gamesPlayed: 0,
    obbyHighScore: 0,
    coinRushHighScore: 0,
    survivalHighScore: 0
  },
  unlockedItems: ['starter_badge'],
  activeCosmetics: {
    hat: null,
    trail: null
  },
  achievements: [],         // Phase 4: array of unlocked achievement IDs
  settings: {
    sfxEnabled: true
  }
};

class StateManager {
  constructor() {
    this.listeners = {
      balanceChanged: [],
      avatarChanged: [],
      statsChanged: [],
      stateReset: [],
      inventoryChanged: [],   // Phase 4: shop purchase / unlock
      achievementUnlocked: [] // Phase 4: milestone reached
    };
    this.state = this.loadState();
  }

  /**
   * Safely load state from browser LocalStorage
   */
  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge with defaults to ensure all properties exist
        return {
          ...DEFAULT_STATE,
          ...parsed,
          stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) },
          settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
          activeCosmetics: { ...DEFAULT_STATE.activeCosmetics, ...(parsed.activeCosmetics || {}) },
          // Phase 4: preserve arrays from saved state; fall back to empty arrays
          unlockedItems: parsed.unlockedItems || DEFAULT_STATE.unlockedItems,
          achievements: parsed.achievements || DEFAULT_STATE.achievements
        };
      }
    } catch (e) {
      console.warn('[BloxState] LocalStorage access failed or unavailable, fallback to in-memory state', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  /**
   * Save current state snapshot to LocalStorage
   */
  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('[BloxState] Failed to save state to LocalStorage', e);
    }
  }

  /**
   * Subscribe to state change events
   * @param {'balanceChanged' | 'avatarChanged' | 'statsChanged' | 'stateReset'} event 
   * @param {Function} callback 
   */
  subscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Notify subscribers of an event
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => {
        try {
          fn(data);
        } catch (err) {
          console.error(`[BloxState] Error in listener for ${event}:`, err);
        }
      });
    }
  }

  /**
   * Returns a copy of the current state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Get currently active avatar ID ('aahaan' | 'hetvi' | 'sanvi')
   */
  getActiveAvatarId() {
    return this.state.activeAvatarId;
  }

  /**
   * Switch the active avatar
   */
  setActiveAvatar(avatarId) {
    if (this.state.activeAvatarId === avatarId) return;
    this.state.activeAvatarId = avatarId;
    this.saveState();
    this.emit('avatarChanged', { avatarId });
  }

  /**
   * Get current coin balance
   */
  getBalance() {
    return this.state.balance;
  }

  /**
   * Add coins to player's balance (e.g., from mini-games or demo controls)
   * @param {number} amount 
   * @param {string} reason 
   */
  addCoins(amount, reason = 'Reward') {
    if (typeof amount !== 'number' || amount <= 0) return false;
    this.state.balance += amount;
    this.state.stats.totalCoinsEarned += amount;
    this.saveState();
    this.emit('balanceChanged', { 
      balance: this.state.balance, 
      diff: amount, 
      type: 'add', 
      reason 
    });
    this.emit('statsChanged', { stats: this.state.stats });
    return true;
  }

  /**
   * Spend coins (for Phase 4 shop unlocks)
   * @param {number} amount 
   * @param {string} item 
   */
  spendCoins(amount, item = 'Item Purchase') {
    if (typeof amount !== 'number' || amount <= 0) return false;
    if (this.state.balance < amount) {
      return false; // Insufficient funds
    }
    this.state.balance -= amount;
    this.saveState();
    this.emit('balanceChanged', { 
      balance: this.state.balance, 
      diff: -amount, 
      type: 'spend', 
      reason: item 
    });
    return true;
  }

  /**
   * Record mini-game high score and session play
   */
  recordScore(gameKey, score) {
    this.state.stats.gamesPlayed += 1;
    let isHighScore = false;

    if (gameKey === 'obby' && score > this.state.stats.obbyHighScore) {
      this.state.stats.obbyHighScore = score;
      isHighScore = true;
    } else if (gameKey === 'coins' && score > this.state.stats.coinRushHighScore) {
      this.state.stats.coinRushHighScore = score;
      isHighScore = true;
    } else if (gameKey === 'survival' && score > this.state.stats.survivalHighScore) {
      this.state.stats.survivalHighScore = score;
      isHighScore = true;
    }

    this.saveState();
    this.emit('statsChanged', { stats: this.state.stats, isHighScore, gameKey, score });
    return isHighScore;
  }

  /**
   * Reset all data back to factory defaults (useful for presentation demos)
   */
  resetData() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
    this.emit('stateReset', this.state);
    this.emit('balanceChanged', { balance: this.state.balance, diff: 0, type: 'reset', reason: 'System Reset' });
    this.emit('avatarChanged', { avatarId: this.state.activeAvatarId });
    this.emit('statsChanged', { stats: this.state.stats });
    this.emit('inventoryChanged', { unlockedItems: this.state.unlockedItems, activeCosmetics: this.state.activeCosmetics });
  }

  // ── Phase 4: Inventory Methods ──────────────────────────────────────────

  /**
   * Returns array of unlocked item IDs
   */
  getUnlockedItems() {
    return [...(this.state.unlockedItems || [])];
  }

  /**
   * Mark an item as unlocked/purchased in inventory
   * @param {string} itemId
   */
  unlockItem(itemId) {
    if (!this.state.unlockedItems) this.state.unlockedItems = ['starter_badge'];
    if (this.state.unlockedItems.includes(itemId)) return false;
    this.state.unlockedItems.push(itemId);
    this.saveState();
    this.emit('inventoryChanged', {
      unlockedItems: this.state.unlockedItems,
      activeCosmetics: this.state.activeCosmetics
    });
    return true;
  }

  // ── Phase 4: Cosmetics Methods ──────────────────────────────────────────

  /**
   * Returns a copy of activeCosmetics { hat, trail }
   */
  getActiveCosmetics() {
    return { ...(this.state.activeCosmetics || { hat: null, trail: null }) };
  }

  /**
   * Equip or clear a cosmetic slot
   * @param {'hat' | 'trail'} slot
   * @param {string | null} itemId
   */
  setCosmetic(slot, itemId) {
    if (!this.state.activeCosmetics) this.state.activeCosmetics = { hat: null, trail: null };
    this.state.activeCosmetics[slot] = itemId;
    this.saveState();
    this.emit('inventoryChanged', {
      unlockedItems: this.state.unlockedItems,
      activeCosmetics: this.state.activeCosmetics
    });
  }

  // ── Phase 4: Achievement Methods ────────────────────────────────────────

  /**
   * Returns array of unlocked achievement IDs
   */
  getAchievements() {
    return [...(this.state.achievements || [])];
  }

  /**
   * Unlock an achievement (idempotent — safe to call multiple times)
   * @param {string} achievementId
   */
  unlockAchievement(achievementId) {
    if (!this.state.achievements) this.state.achievements = [];
    if (this.state.achievements.includes(achievementId)) return false;
    this.state.achievements.push(achievementId);
    this.saveState();
    this.emit('achievementUnlocked', { achievementId, achievements: this.state.achievements });
    return true;
  }
}

// Global Singleton Instance
window.BloxState = new StateManager();
