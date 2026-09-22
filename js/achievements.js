/**
 * ==========================================================================
 * BLOXVERSE ITBM EDITION - PHASE 4: ACHIEVEMENTS SYSTEM
 * Tracks player milestones and unlocks badge notifications
 * ==========================================================================
 */

// ── ACHIEVEMENT REGISTRY ────────────────────────────────────────────────────
const ACHIEVEMENT_REGISTRY = [
  {
    id: 'first_win',
    title: 'First Victory',
    desc: 'Complete any mini-game for the first time',
    icon: '🏅',
    color: 'gold',
    check: (s) => s.stats.gamesPlayed >= 1
  },
  {
    id: 'obby_master',
    title: 'Obby Master',
    desc: 'Complete the Tower of Obby and earn a score',
    icon: '🧗',
    color: 'blue',
    check: (s) => s.stats.obbyHighScore > 0
  },
  {
    id: 'coin_collector',
    title: 'Coin Collector',
    desc: 'Earn a total of 500 BloxCoins across all sessions',
    icon: '🪙',
    color: 'gold',
    check: (s) => s.stats.totalCoinsEarned >= 500
  },
  {
    id: 'coin_master',
    title: 'Coin Master',
    desc: 'Accumulate 1,000 total BloxCoins earned',
    icon: '💰',
    color: 'gold',
    check: (s) => s.stats.totalCoinsEarned >= 1000
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    desc: 'Survive 30 seconds in Hazard Dodge',
    icon: '⚡',
    color: 'red',
    check: (s) => s.stats.survivalHighScore >= 30
  },
  {
    id: 'survival_expert',
    title: 'Survival Expert',
    desc: 'Survive 45 seconds in Hazard Dodge',
    icon: '🛡️',
    color: 'purple',
    check: (s) => s.stats.survivalHighScore >= 45
  },
  {
    id: 'gold_rush_pro',
    title: 'Gold Rush Pro',
    desc: 'Score 100 coins in a single Gold Rush arena run',
    icon: '💎',
    color: 'blue',
    check: (s) => s.stats.coinRushHighScore >= 100
  },
  {
    id: 'hat_collector',
    title: 'Hat Collector',
    desc: 'Own 2 or more cosmetic items from the shop',
    icon: '👑',
    color: 'purple',
    check: (s) => {
      const cosmetics = ['crown_aurelia', 'neon_trail', 'visor_hud'];
      return cosmetics.filter(id => (s.unlockedItems || []).includes(id)).length >= 2;
    }
  },
  {
    id: 'fully_loaded',
    title: 'Fully Loaded',
    desc: 'Own all cosmetic items in the shop',
    icon: '🌟',
    color: 'gold',
    check: (s) => {
      const cosmetics = ['crown_aurelia', 'neon_trail', 'visor_hud'];
      return cosmetics.every(id => (s.unlockedItems || []).includes(id));
    }
  }
];

// ── ACHIEVEMENTS MANAGER ─────────────────────────────────────────────────────
class AchievementsManager {
  constructor() {
    this.state = window.BloxState;
    this.registry = ACHIEVEMENT_REGISTRY;
  }

  /** Run all achievement checks — call after any game exit or item purchase */
  check() {
    const s = this.state.getState();
    const alreadyUnlocked = s.achievements || [];

    this.registry.forEach(achievement => {
      if (alreadyUnlocked.includes(achievement.id)) return; // Already done
      if (achievement.check(s)) {
        this.unlock(achievement);
      }
    });
  }

  /** Unlock a single achievement and show toast */
  unlock(achievement) {
    this.state.unlockAchievement(achievement.id);
    // Show toast notification
    if (window.BloxLobby) {
      window.BloxLobby.showToast(
        `🏆 Achievement Unlocked!`,
        `${achievement.icon} ${achievement.title} — ${achievement.desc}`,
        'coin',
        achievement.icon
      );
    }
    // Re-render achievements panel if visible
    this.renderGrid();
  }

  /** Render the achievements grid into #achievements-grid-container */
  renderGrid() {
    const container = document.getElementById('achievements-grid-container');
    if (!container) return;

    const s = this.state.getState();
    const unlocked = s.achievements || [];

    // Sort: unlocked first
    const sorted = [...this.registry].sort((a, b) => {
      const aU = unlocked.includes(a.id) ? 0 : 1;
      const bU = unlocked.includes(b.id) ? 0 : 1;
      return aU - bU;
    });

    container.innerHTML = sorted.map(ach => {
      const isUnlocked = unlocked.includes(ach.id);
      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon-box ${ach.color}">${ach.icon}</div>
          <div class="achievement-info">
            <div class="achievement-title">${ach.title}</div>
            <div class="achievement-desc">${ach.desc}</div>
          </div>
          ${isUnlocked ? '<div class="achievement-unlocked-stamp">✓ Unlocked</div>' : ''}
        </div>
      `;
    }).join('');
  }

  /** Get summary — count unlocked vs total */
  getSummary() {
    const s = this.state.getState();
    const unlocked = (s.achievements || []).length;
    return { unlocked, total: this.registry.length };
  }
}

// Global Instance
window.BloxAchievements = new AchievementsManager();
window.ACHIEVEMENT_REGISTRY = ACHIEVEMENT_REGISTRY;
