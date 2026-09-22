/**
 * ==========================================================================
 * BLOXVERSE ITBM EDITION - AVATAR REGISTRY & SVG VECTOR ENGINE
 * Defines Aahaan, Hetvi, and Sanvi with Roblox-style blocky geometry
 * ==========================================================================
 */

const AVATAR_REGISTRY = {
  aahaan: {
    id: 'aahaan',
    name: 'Aahaan',
    title: 'Tech Adventurer',
    tagline: 'Master of Cyber Coordinates & Platform Agility',
    bio: 'A high-energy coder and parkour specialist equipped with an augmented cyber visor and neon-circuit streetwear.',
    colors: {
      skin: '#FCD5B4',
      headwear: '#00E5FF',
      torso: '#17223B',
      torsoAccent: '#00A2FF',
      limbs: '#253456',
      pants: '#0F1626',
      shoes: '#00E5FF',
      visorGlow: 'rgba(0, 229, 255, 0.7)'
    },
    traits: {
      speed: 88,
      agility: 92,
      strategy: 85
    },
    gearName: 'Cyber Visor & Circuit Hoodie'
  },

  hetvi: {
    id: 'hetvi',
    name: 'Hetvi',
    title: 'Creative Strategist',
    tagline: 'Visionary Explorer & Resource Optimization Specialist',
    bio: 'A brilliant tactician who masters in-game economies and strategic navigation, adorned with a golden crown.',
    colors: {
      skin: '#F7C6A3',
      headwear: '#FFD166',
      torso: '#5A189A',
      torsoAccent: '#9D4EDD',
      limbs: '#3C096C',
      pants: '#240046',
      shoes: '#FFD166',
      crownGlow: 'rgba(255, 209, 102, 0.7)'
    },
    traits: {
      speed: 84,
      agility: 86,
      strategy: 98
    },
    gearName: 'Crown of Radiance & Velvet Coat'
  },

  sanvi: {
    id: 'sanvi',
    name: 'Sanvi',
    title: 'Speed Champion',
    tagline: 'Adrenaline Trailblazer & Obstacle Sprint Record Holder',
    bio: 'A lightning-fast athlete who shatters platformer records with unmatched agility and an iconic blaze bandana.',
    colors: {
      skin: '#E8B68F',
      headwear: '#FF5E57',
      torso: '#0B3B2B',
      torsoAccent: '#06D6A0',
      limbs: '#135E46',
      pants: '#07241A',
      shoes: '#FF5E57',
      auraGlow: 'rgba(6, 214, 160, 0.7)'
    },
    traits: {
      speed: 98,
      agility: 94,
      strategy: 82
    },
    gearName: 'Blaze Bandana & Aero Kicks'
  }
};

/**
 * Procedural Roblox Blocky Character SVG Generator
 * @param {string} avatarId - 'aahaan' | 'hetvi' | 'sanvi'
 * @param {object} options - { badgeMode: boolean }
 * @returns {string} Clean SVG markup string
 */
function renderAvatarSVG(avatarId, options = {}) {
  const avatar = AVATAR_REGISTRY[avatarId] || AVATAR_REGISTRY.aahaan;
  const c = avatar.colors;
  const isBadge = options.badgeMode === true;

  if (isBadge) {
    // Compact head-only badge icon
    return `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="badge-bg-${avatar.id}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${c.torsoAccent}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#121620"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#badge-bg-${avatar.id})" stroke="${c.torsoAccent}" stroke-width="3"/>
        
        <!-- Classic Roblox Block Head -->
        <rect x="26" y="24" width="48" height="48" rx="6" fill="${c.skin}" stroke="#1e2230" stroke-width="2"/>
        
        <!-- Head Stud on Top -->
        <rect x="42" y="16" width="16" height="8" rx="3" fill="${c.skin}" stroke="#1e2230" stroke-width="1.5"/>
        
        ${renderAvatarHeadgear(avatar.id, c, true)}
      </svg>
    `;
  }

  // Full-body classic Roblox blocky proportions (head, torso, arms, legs, accessories)
  return `
    <svg viewBox="0 0 240 320" fill="none" xmlns="http://www.w3.org/2000/svg" class="roblox-character-svg">
      <defs>
        <!-- Drop Shadow Filter -->
        <filter id="char-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
        <linearGradient id="torso-grad-${avatar.id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c.torsoAccent}"/>
          <stop offset="100%" stop-color="${c.torso}"/>
        </linearGradient>
      </defs>

      <!-- Floor Contact Shadow -->
      <ellipse cx="120" cy="304" rx="65" ry="12" fill="rgba(0, 0, 0, 0.45)"/>

      <g filter="url(#char-shadow)">
        <!-- LEFT LEG -->
        <g id="leg-left">
          <rect x="74" y="200" width="42" height="96" rx="4" fill="${c.pants}" stroke="#111624" stroke-width="2"/>
          <rect x="74" y="278" width="42" height="18" rx="3" fill="${c.shoes}"/>
        </g>

        <!-- RIGHT LEG -->
        <g id="leg-right">
          <rect x="124" y="200" width="42" height="96" rx="4" fill="${c.pants}" stroke="#111624" stroke-width="2"/>
          <rect x="124" y="278" width="42" height="18" rx="3" fill="${c.shoes}"/>
        </g>

        <!-- TORSO (Classic Roblox Trapezoid/Block) -->
        <g id="torso">
          <rect x="68" y="100" width="104" height="100" rx="6" fill="url(#torso-grad-${avatar.id})" stroke="#111624" stroke-width="2.5"/>
          <!-- Torso Graphic / Emblem -->
          ${renderTorsoGraphic(avatar.id, c)}
          <!-- Collar Trim -->
          <path d="M102 100 L120 116 L138 100 Z" fill="${c.skin}"/>
        </g>

        <!-- LEFT ARM -->
        <g id="arm-left">
          <rect x="22" y="100" width="40" height="95" rx="5" fill="${c.limbs}" stroke="#111624" stroke-width="2"/>
          <!-- Hand -->
          <rect x="24" y="180" width="36" height="15" rx="3" fill="${c.skin}"/>
        </g>

        <!-- RIGHT ARM -->
        <g id="arm-right">
          <rect x="178" y="100" width="40" height="95" rx="5" fill="${c.limbs}" stroke="#111624" stroke-width="2"/>
          <!-- Hand -->
          <rect x="180" y="180" width="36" height="15" rx="3" fill="${c.skin}"/>
        </g>

        <!-- HEAD STUD (Roblox cylindrical connector) -->
        <rect x="106" y="22" width="28" height="14" rx="4" fill="${c.skin}" stroke="#111624" stroke-width="2"/>

        <!-- HEAD (Blocky Cube) -->
        <g id="head">
          <rect x="80" y="34" width="80" height="66" rx="8" fill="${c.skin}" stroke="#111624" stroke-width="2.5"/>
          
          <!-- Classic Roblox Face Features -->
          ${renderAvatarFaceAndGear(avatar.id, c, false)}
        </g>
      </g>
    </svg>
  `;
}

/**
 * Renders custom face & headgear based on the character identity
 */
function renderAvatarFaceAndGear(avatarId, colors, isMini) {
  if (avatarId === 'aahaan') {
    // Aahaan: Cyber Visor with high-tech reflection & confident smirk
    return `
      <!-- Cyber Visor -->
      <rect x="86" y="50" width="68" height="24" rx="5" fill="#0b1320" stroke="${colors.headwear}" stroke-width="2.5"/>
      <rect x="90" y="54" width="60" height="16" rx="3" fill="${colors.headwear}" opacity="0.85"/>
      <line x1="94" y1="58" x2="146" y2="58" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
      <circle cx="142" cy="62" r="2.5" fill="#ffffff"/>
      <!-- Audio Headphones on side of head -->
      <rect x="74" y="46" width="7" height="32" rx="3" fill="${colors.headwear}"/>
      <rect x="159" y="46" width="7" height="32" rx="3" fill="${colors.headwear}"/>
      <!-- Friendly Smirk -->
      <path d="M110 84 Q120 90 130 84" stroke="#4a3b32" stroke-width="3" stroke-linecap="round" fill="none"/>
    `;
  }

  if (avatarId === 'hetvi') {
    // Hetvi: Golden Star Crown, sparkling anime-style expressive eyes, regal smile
    return `
      <!-- Golden Crown atop head -->
      <path d="M82 36 L94 20 L108 30 L120 14 L132 30 L146 20 L158 36 Z" fill="${colors.headwear}" stroke="#997300" stroke-width="2"/>
      <circle cx="120" cy="18" r="4" fill="#ffffff" stroke="#997300" stroke-width="1.5"/>
      <circle cx="94" cy="24" r="3" fill="#ffffff"/>
      <circle cx="146" cy="24" r="3" fill="#ffffff"/>

      <!-- Expressive Stylized Eyes -->
      <ellipse cx="102" cy="62" rx="7" ry="9" fill="#2d1305"/>
      <circle cx="100" cy="59" r="2.5" fill="#ffffff"/>
      <circle cx="104" cy="65" r="1" fill="#ffffff"/>
      <ellipse cx="138" cy="62" rx="7" ry="9" fill="#2d1305"/>
      <circle cx="136" cy="59" r="2.5" fill="#ffffff"/>
      <circle cx="140" cy="65" r="1" fill="#ffffff"/>

      <!-- Sweet Smile -->
      <path d="M112 82 Q120 89 128 82" stroke="#4a3b32" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Rosy Cheeks -->
      <ellipse cx="94" cy="74" rx="5" ry="3" fill="#ff70a6" opacity="0.5"/>
      <ellipse cx="146" cy="74" rx="5" ry="3" fill="#ff70a6" opacity="0.5"/>
    `;
  }

  // Sanvi: Blaze Crimson Headband, bold energetic eyes, confident open smile
  return `
    <!-- Athletic Blaze Bandana -->
    <rect x="79" y="44" width="82" height="15" rx="3" fill="${colors.headwear}" stroke="#991b1b" stroke-width="2"/>
    <!-- Headband trailing knot ties -->
    <path d="M79 50 L65 42 L68 56 Z" fill="${colors.headwear}"/>
    <circle cx="120" cy="51.5" r="4" fill="#ffffff"/>

    <!-- Sharp Confident Eyes -->
    <path d="M96 66 L108 64" stroke="#111624" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="103" cy="68" rx="6" ry="7" fill="#1b2a22"/>
    <circle cx="101" cy="66" r="2" fill="#ffffff"/>

    <path d="M144 66 L132 64" stroke="#111624" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="137" cy="68" rx="6" ry="7" fill="#1b2a22"/>
    <circle cx="135" cy="66" r="2" fill="#ffffff"/>

    <!-- Energetic Open Smile -->
    <path d="M110 82 Q120 92 130 82 Z" fill="#991b1b"/>
    <path d="M113 83 Q120 86 127 83" stroke="#ffffff" stroke-width="2" fill="none"/>
  `;
}

/**
 * Headgear helper for small badge icon view
 */
function renderAvatarHeadgear(avatarId, colors, isBadge) {
  if (avatarId === 'aahaan') {
    return `
      <rect x="30" y="38" width="40" height="16" rx="3" fill="#0b1320" stroke="${colors.headwear}" stroke-width="1.5"/>
      <rect x="33" y="41" width="34" height="10" rx="2" fill="${colors.headwear}" opacity="0.85"/>
      <line x1="36" y1="44" x2="64" y2="44" stroke="#fff" stroke-width="1.5"/>
      <path d="M44 60 Q50 64 56 60" stroke="#4a3b32" stroke-width="2" stroke-linecap="round" fill="none"/>
    `;
  }
  if (avatarId === 'hetvi') {
    return `
      <path d="M28 26 L36 14 L44 22 L50 10 L56 22 L64 14 L72 26 Z" fill="${colors.headwear}" stroke="#997300" stroke-width="1.5"/>
      <ellipse cx="42" cy="46" rx="4" ry="5" fill="#2d1305"/>
      <ellipse cx="58" cy="46" rx="4" ry="5" fill="#2d1305"/>
      <path d="M45 58 Q50 63 55 58" stroke="#4a3b32" stroke-width="2" stroke-linecap="round" fill="none"/>
    `;
  }
  return `
    <rect x="25" y="32" width="50" height="11" rx="2" fill="${colors.headwear}"/>
    <circle cx="50" cy="37.5" r="3" fill="#ffffff"/>
    <ellipse cx="42" cy="50" rx="4" ry="5" fill="#1b2a22"/>
    <ellipse cx="58" cy="50" rx="4" ry="5" fill="#1b2a22"/>
    <path d="M44 60 Q50 66 56 60" stroke="#991b1b" stroke-width="2.5" fill="none"/>
  `;
}

/**
 * Renders custom graphics on the torso
 */
function renderTorsoGraphic(avatarId, colors) {
  if (avatarId === 'aahaan') {
    // Tech circuit lines
    return `
      <path d="M80 140 H100 L110 155 H130 L140 140 H160" stroke="#00E5FF" stroke-width="2.5" fill="none" opacity="0.9"/>
      <circle cx="100" cy="140" r="3" fill="#00E5FF"/>
      <circle cx="140" cy="140" r="3" fill="#00E5FF"/>
      <circle cx="120" cy="170" r="10" fill="none" stroke="#00E5FF" stroke-width="2"/>
      <text x="120" y="174" fill="#00E5FF" font-size="10" font-weight="900" text-anchor="middle" font-family="monospace">AH</text>
    `;
  }

  if (avatarId === 'hetvi') {
    // Royal Star & Crest
    return `
      <path d="M120 125 L125 140 L140 145 L125 150 L120 165 L115 150 L100 145 L115 140 Z" fill="#FFD166" opacity="0.95"/>
      <circle cx="120" cy="145" r="4" fill="#ffffff"/>
      <path d="M85 175 C100 160 140 160 155 175" stroke="#FFD166" stroke-width="2" fill="none"/>
      <text x="120" y="188" fill="#FFD166" font-size="9" font-weight="800" text-anchor="middle">HV</text>
    `;
  }

  // Sanvi: Lightning bolt & athletic crest
  return `
    <polygon points="124,120 108,148 120,148 114,178 134,142 122,142" fill="#FF5E57" stroke="#ffffff" stroke-width="1.5"/>
    <line x1="85" y1="130" x2="85" y2="170" stroke="#06D6A0" stroke-width="3" stroke-linecap="round"/>
    <line x1="155" y1="130" x2="155" y2="170" stroke="#06D6A0" stroke-width="3" stroke-linecap="round"/>
    <text x="120" y="192" fill="#06D6A0" font-size="9" font-weight="900" text-anchor="middle">SV-42</text>
  `;
}

// Global Avatar Registry
window.AVATAR_REGISTRY = AVATAR_REGISTRY;
window.renderAvatarSVG = renderAvatarSVG;
