/**
 * ==========================================================================
 * BLOXVERSE ITBM EDITION - PHASE 4: IN-GAME SHOP MANAGER
 * Handles cosmetic item purchasing, inventory, and avatar cosmetic rendering
 * ==========================================================================
 */

// ── SHOP CATALOG ────────────────────────────────────────────────────────────
const SHOP_CATALOG = [
  {
    id: 'crown_aurelia',
    name: 'Crown of Aurelia',
    price: 150,
    slot: 'hat',
    icon: '👑',
    desc: 'Shimmering golden royal crown with sparkle particle aura',
    gradient: 'linear-gradient(135deg, #2b5876, #4e4376)',
    rarity: 'Rare'
  },
  {
    id: 'neon_trail',
    name: 'Neon Sprint Trail',
    price: 200,
    slot: 'trail',
    icon: '⚡',
    desc: 'Electric cyan ribbon left behind as you move through arenas',
    gradient: 'linear-gradient(135deg, #134e5e, #71b280)',
    rarity: 'Epic'
  },
  {
    id: 'visor_hud',
    name: 'Cyberpunk Visor HUD',
    price: 120,
    slot: 'hat',
    icon: '🥽',
    desc: 'Holographic heads-up display with dynamic neon scanlines',
    gradient: 'linear-gradient(135deg, #4776e6, #8e54e9)',
    rarity: 'Uncommon'
  }
];

// Rarity color map
const RARITY_COLORS = {
  Uncommon: '#06d6a0',
  Rare: '#00a2ff',
  Epic: '#9d4edd'
};

// ── SHOP MANAGER ─────────────────────────────────────────────────────────────
class ShopManager {
  constructor() {
    this.state = window.BloxState;
    this.catalog = SHOP_CATALOG;
  }

  /** Render the full shop grid into #shop-grid-container */
  render() {
    const container = document.getElementById('shop-grid-container');
    if (!container) return;

    const s = this.state.getState();
    const owned = s.unlockedItems || [];
    const equipped = s.activeCosmetics || {};
    const balance = s.balance;

    container.innerHTML = this.catalog.map(item => {
      const isOwned = owned.includes(item.id);
      const isEquipped = (equipped[item.slot] === item.id);
      const canAfford = balance >= item.price;
      const rarityColor = RARITY_COLORS[item.rarity] || '#fff';

      let statusBadge = '';
      if (isEquipped) statusBadge = `<span class="shop-status-badge equipped-badge">✓ Equipped</span>`;
      else if (isOwned) statusBadge = `<span class="shop-status-badge owned-badge">✓ Owned</span>`;

      let actionBtn = '';
      if (isEquipped) {
        actionBtn = `<button class="btn btn-sm btn-secondary" onclick="window.BloxShop.unequipItem('${item.id}','${item.slot}')">Unequip</button>`;
      } else if (isOwned) {
        actionBtn = `<button class="btn btn-sm btn-primary" onclick="window.BloxShop.equipItem('${item.id}','${item.slot}')">Equip</button>`;
      } else if (canAfford) {
        actionBtn = `<button class="btn btn-sm btn-gold" onclick="window.BloxShop.purchaseItem('${item.id}')">Buy ${item.icon}</button>`;
      } else {
        actionBtn = `<button class="btn btn-sm btn-secondary" disabled style="opacity:0.5;cursor:not-allowed;" title="Not enough coins">Need ${item.price} ¢</button>`;
      }

      return `
        <div class="shop-item-card ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}">
          <div class="shop-item-preview" style="background: ${item.gradient};">
            <div class="preview-emoji">${item.icon}</div>
            ${statusBadge}
          </div>
          <div class="shop-item-body">
            <div class="shop-item-name">${item.name}</div>
            <div style="font-size:0.68rem; font-weight:700; color:${rarityColor}; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px;">${item.rarity} · ${item.slot === 'hat' ? 'Headwear' : 'Trail Effect'}</div>
            <div class="shop-item-desc">${item.desc}</div>
            <div class="shop-item-footer">
              <div class="shop-item-price ${isOwned ? 'free' : ''}">
                ${isOwned ? '✓ Collected' : `🪙 ${item.price}`}
              </div>
              ${actionBtn}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /** Purchase an item */
  purchaseItem(itemId) {
    const item = this.catalog.find(i => i.id === itemId);
    if (!item) return;

    const s = this.state.getState();
    if (s.unlockedItems.includes(itemId)) {
      window.BloxLobby.showToast('Already Owned', `You already own ${item.name}!`, 'info', '✓');
      return;
    }

    const success = this.state.spendCoins(item.price, item.name);
    if (!success) {
      window.BloxLobby.showToast('Not Enough Coins', `You need ${item.price} BloxCoins to buy ${item.name}.`, 'info', '🪙');
      return;
    }

    // Unlock the item in state
    this.state.unlockItem(itemId);
    window.BloxLobby.showToast('Item Purchased!', `${item.icon} ${item.name} is now in your wardrobe!`, 'coin', '🛍️');
    this.render();
    // Trigger achievement check
    if (window.BloxAchievements) window.BloxAchievements.check();
  }

  /** Equip a cosmetic */
  equipItem(itemId, slot) {
    const item = this.catalog.find(i => i.id === itemId);
    this.state.setCosmetic(slot, itemId);
    window.BloxLobby.showToast('Cosmetic Equipped!', `${item ? item.icon + ' ' : ''}${item ? item.name : itemId} is now equipped!`, 'info', '✨');
    this.render();
    // Refresh podium avatar
    if (window.BloxLobby) window.BloxLobby.renderAvatarProfile(window.BloxState.getActiveAvatarId());
  }

  /** Unequip a cosmetic slot */
  unequipItem(itemId, slot) {
    this.state.setCosmetic(slot, null);
    window.BloxLobby.showToast('Unequipped', 'Cosmetic removed from your avatar.', 'info', '📦');
    this.render();
    if (window.BloxLobby) window.BloxLobby.renderAvatarProfile(window.BloxState.getActiveAvatarId());
  }

  /** Get catalog item by id */
  getItem(itemId) {
    return this.catalog.find(i => i.id === itemId) || null;
  }
}

// Global Instance
window.BloxShop = new ShopManager();
window.SHOP_CATALOG = SHOP_CATALOG;
