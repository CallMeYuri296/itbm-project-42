/**
 * ==========================================================================
 * BLOXVERSE ITBM EDITION - MAIN BOOTSTRAPPER
 * Initializes application modules when DOM is ready
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c BloxVerse ITBM Platform %c v1.0 (Phase 1)', 
    'background: #00a2ff; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;', 
    'background: #171a23; color: #00e676; font-weight: bold; padding: 4px 8px; border-radius: 0 4px 4px 0;'
  );

  // Initialize Lobby UI & State hooks
  if (window.BloxLobby) {
    window.BloxLobby.init();
  }

  // Developer & Presenter quick helpers in browser console
  window.BloxPlatform = {
    state: window.BloxState,
    lobby: window.BloxLobby,
    avatars: window.AVATAR_REGISTRY,
    addCoins: (n) => window.BloxState.addCoins(n, 'Console Command'),
    setAvatar: (id) => window.BloxState.setActiveAvatar(id),
    reset: () => window.BloxState.resetData()
  };

  console.log('🎮 Platform ready! Active character:', window.BloxState.getActiveAvatarId());
});
