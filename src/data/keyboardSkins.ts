// Keyboard skin definitions with CSS variables
// These map to shop item IDs and define key appearance

export interface KeyboardSkin {
  id: string;
  name: string;
  cssVariables: Record<string, string>;
}

// Default skin (current keyboard appearance)
const defaultSkin: KeyboardSkin = {
  id: 'default',
  name: 'Default',
  cssVariables: {
    '--skin-key-bg': '#1a1a2e',
    '--skin-key-bg-hover': '#2a2a3e',
    '--skin-key-bg-active': '#3a3a4e',
    '--skin-key-border': '#3bceac',
    '--skin-key-border-width': '2px',
    '--skin-key-text': '#eef5db',
    '--skin-key-shadow': '2px 2px 0 #0f0f1b',
    '--skin-key-highlight-bg': '#ffd93d',
    '--skin-key-highlight-border': '#ffd93d',
    '--skin-key-correct-bg': '#0ead69',
    '--skin-key-incorrect-bg': '#e63946',
    '--skin-key-glow': 'none',
    '--skin-key-border-radius': '4px',
  },
};

// Wooden Keys (Common - 100 coins)
const woodenKeysSkin: KeyboardSkin = {
  id: 'wooden-keys',
  name: 'Wooden Keys',
  cssVariables: {
    '--skin-key-bg': '#8B4513',
    '--skin-key-bg-hover': '#A0522D',
    '--skin-key-bg-active': '#CD853F',
    '--skin-key-border': '#5D3A1A',
    '--skin-key-border-width': '3px',
    '--skin-key-text': '#FFF8DC',
    '--skin-key-shadow': '3px 3px 0 #3D2314',
    '--skin-key-highlight-bg': '#DAA520',
    '--skin-key-highlight-border': '#B8860B',
    '--skin-key-correct-bg': '#228B22',
    '--skin-key-incorrect-bg': '#8B0000',
    '--skin-key-glow': 'none',
    '--skin-key-border-radius': '6px',
  },
};

// Neon Glow (Rare - 250 coins)
const neonGlowSkin: KeyboardSkin = {
  id: 'neon-glow',
  name: 'Neon Glow',
  cssVariables: {
    '--skin-key-bg': '#0a0a0f',
    '--skin-key-bg-hover': '#1a1a2f',
    '--skin-key-bg-active': '#2a2a3f',
    '--skin-key-border': '#00ffff',
    '--skin-key-border-width': '2px',
    '--skin-key-text': '#00ffff',
    '--skin-key-shadow': '0 0 10px #00ffff, 0 0 20px #00ffff',
    '--skin-key-highlight-bg': '#ff00ff',
    '--skin-key-highlight-border': '#ff00ff',
    '--skin-key-correct-bg': '#00ff00',
    '--skin-key-incorrect-bg': '#ff0066',
    '--skin-key-glow': '0 0 15px currentColor',
    '--skin-key-border-radius': '4px',
  },
};

// Holographic (Epic - 550 coins)
const holographicSkin: KeyboardSkin = {
  id: 'holographic',
  name: 'Holographic',
  cssVariables: {
    '--skin-key-bg': 'linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #ff6b6b 100%)',
    '--skin-key-bg-hover': 'linear-gradient(135deg, #feca57 0%, #48dbfb 25%, #ff9ff3 50%, #ff6b6b 75%, #feca57 100%)',
    '--skin-key-bg-active': 'linear-gradient(135deg, #48dbfb 0%, #ff9ff3 25%, #ff6b6b 50%, #feca57 75%, #48dbfb 100%)',
    '--skin-key-border': '#ffffff',
    '--skin-key-border-width': '2px',
    '--skin-key-text': '#ffffff',
    '--skin-key-shadow': '0 0 10px rgba(255,255,255,0.5)',
    '--skin-key-highlight-bg': '#ffffff',
    '--skin-key-highlight-border': '#ffffff',
    '--skin-key-correct-bg': '#00ff88',
    '--skin-key-incorrect-bg': '#ff4444',
    '--skin-key-glow': '0 0 20px rgba(255,255,255,0.3)',
    '--skin-key-border-radius': '8px',
  },
};

// Mechanical RGB (Legendary - 400 coins, Premium)
const mechanicalRgbSkin: KeyboardSkin = {
  id: 'mechanical-rgb',
  name: 'Mechanical RGB',
  cssVariables: {
    '--skin-key-bg': '#1a1a1a',
    '--skin-key-bg-hover': '#2a2a2a',
    '--skin-key-bg-active': '#3a3a3a',
    '--skin-key-border': '#ff00ff',
    '--skin-key-border-width': '2px',
    '--skin-key-text': '#ffffff',
    '--skin-key-shadow': '0 4px 0 #000000, 0 0 15px rgba(255,0,255,0.5)',
    '--skin-key-highlight-bg': '#ff00ff',
    '--skin-key-highlight-border': '#ff00ff',
    '--skin-key-correct-bg': '#00ff00',
    '--skin-key-incorrect-bg': '#ff0000',
    '--skin-key-glow': '0 0 20px currentColor, inset 0 -5px 10px rgba(255,0,255,0.3)',
    '--skin-key-border-radius': '4px',
  },
};

// Skin registry mapping shop itemId to skin
export const KEYBOARD_SKINS: Record<string, KeyboardSkin> = {
  'default': defaultSkin,
  'wooden-keys': woodenKeysSkin,
  'neon-glow': neonGlowSkin,
  'holographic': holographicSkin,
  'mechanical-rgb': mechanicalRgbSkin,
};

// Get a skin by ID (falls back to default)
export function getKeyboardSkin(skinId: string | undefined): KeyboardSkin {
  if (!skinId || !KEYBOARD_SKINS[skinId]) {
    return KEYBOARD_SKINS['default'];
  }
  return KEYBOARD_SKINS[skinId];
}

// Apply skin CSS variables to an element
export function applySkinToElement(skin: KeyboardSkin, element: HTMLElement): void {
  Object.entries(skin.cssVariables).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}
