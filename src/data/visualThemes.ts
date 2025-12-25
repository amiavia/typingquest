// Visual theme definitions with CSS variables
// These map to shop item IDs and define the color scheme

export interface VisualTheme {
  id: string;
  name: string;
  cssVariables: Record<string, string>;
}

// Default theme (current app colors)
const defaultTheme: VisualTheme = {
  id: 'default',
  name: 'Default',
  cssVariables: {
    '--bg-primary': '#0f0f1b',
    '--bg-secondary': '#1a1a2e',
    '--bg-tertiary': '#2a2a3e',
    '--text-primary': '#eef5db',
    '--text-secondary': '#3bceac',
    '--text-muted': '#4a4a6e',
    '--accent-yellow': '#ffd93d',
    '--accent-cyan': '#3bceac',
    '--accent-green': '#0ead69',
    '--accent-pink': '#ff6b9d',
    '--accent-red': '#e63946',
    '--border-color': '#3bceac',
    '--key-bg': '#1a1a2e',
    '--key-border': '#3bceac',
    '--key-text': '#eef5db',
    '--key-highlight': '#ffd93d',
  },
};

// Retro Green - Classic CRT terminal
const retroGreenTheme: VisualTheme = {
  id: 'retro-green',
  name: 'Retro Green',
  cssVariables: {
    '--bg-primary': '#0a0f0a',
    '--bg-secondary': '#0d1a0d',
    '--bg-tertiary': '#122612',
    '--text-primary': '#33ff33',
    '--text-secondary': '#29cc29',
    '--text-muted': '#1a801a',
    '--accent-yellow': '#66ff66',
    '--accent-cyan': '#33ff33',
    '--accent-green': '#44ff44',
    '--accent-pink': '#99ff99',
    '--accent-red': '#ffff33',
    '--border-color': '#33ff33',
    '--key-bg': '#0d1a0d',
    '--key-border': '#33ff33',
    '--key-text': '#33ff33',
    '--key-highlight': '#66ff66',
  },
};

// Synthwave - 80s retro-futuristic
const synthwaveTheme: VisualTheme = {
  id: 'synthwave',
  name: 'Synthwave',
  cssVariables: {
    '--bg-primary': '#1a0a2e',
    '--bg-secondary': '#2d1b4e',
    '--bg-tertiary': '#3d2b5e',
    '--text-primary': '#ff71ce',
    '--text-secondary': '#01cdfe',
    '--text-muted': '#7b5ea7',
    '--accent-yellow': '#fffb96',
    '--accent-cyan': '#01cdfe',
    '--accent-green': '#05ffa1',
    '--accent-pink': '#ff71ce',
    '--accent-red': '#ff3864',
    '--border-color': '#b967ff',
    '--key-bg': '#2d1b4e',
    '--key-border': '#b967ff',
    '--key-text': '#ff71ce',
    '--key-highlight': '#fffb96',
  },
};

// Cyberpunk - Neon dystopia
const cyberpunkTheme: VisualTheme = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  cssVariables: {
    '--bg-primary': '#0d0221',
    '--bg-secondary': '#1a0533',
    '--bg-tertiary': '#2a0845',
    '--text-primary': '#fcee0a',
    '--text-secondary': '#00f0ff',
    '--text-muted': '#6b4984',
    '--accent-yellow': '#fcee0a',
    '--accent-cyan': '#00f0ff',
    '--accent-green': '#39ff14',
    '--accent-pink': '#ff00ff',
    '--accent-red': '#ff2a6d',
    '--border-color': '#00f0ff',
    '--key-bg': '#1a0533',
    '--key-border': '#ff00ff',
    '--key-text': '#fcee0a',
    '--key-highlight': '#00f0ff',
  },
};

// Ocean Depths - Calming underwater
const oceanDepthsTheme: VisualTheme = {
  id: 'ocean-depths',
  name: 'Ocean Depths',
  cssVariables: {
    '--bg-primary': '#001f3f',
    '--bg-secondary': '#003366',
    '--bg-tertiary': '#004080',
    '--text-primary': '#e6f7ff',
    '--text-secondary': '#00ccff',
    '--text-muted': '#4d94b3',
    '--accent-yellow': '#ffd93d',
    '--accent-cyan': '#00ccff',
    '--accent-green': '#00e6ac',
    '--accent-pink': '#ff6b9d',
    '--accent-red': '#ff6b6b',
    '--border-color': '#0099cc',
    '--key-bg': '#003366',
    '--key-border': '#00ccff',
    '--key-text': '#e6f7ff',
    '--key-highlight': '#00e6ac',
  },
};

// Forest Zen - Natural calm
const forestZenTheme: VisualTheme = {
  id: 'forest-zen',
  name: 'Forest Zen',
  cssVariables: {
    '--bg-primary': '#1a2e1a',
    '--bg-secondary': '#2d4a2d',
    '--bg-tertiary': '#3d5a3d',
    '--text-primary': '#d4e6c3',
    '--text-secondary': '#8fbc8f',
    '--text-muted': '#5a7a5a',
    '--accent-yellow': '#f0e68c',
    '--accent-cyan': '#8fbc8f',
    '--accent-green': '#90ee90',
    '--accent-pink': '#dda0dd',
    '--accent-red': '#cd5c5c',
    '--border-color': '#6b8e6b',
    '--key-bg': '#2d4a2d',
    '--key-border': '#8fbc8f',
    '--key-text': '#d4e6c3',
    '--key-highlight': '#90ee90',
  },
};

// Neon Nights - Electric city
const neonNightsTheme: VisualTheme = {
  id: 'neon-nights',
  name: 'Neon Nights',
  cssVariables: {
    '--bg-primary': '#0a0a0f',
    '--bg-secondary': '#12121a',
    '--bg-tertiary': '#1a1a25',
    '--text-primary': '#00ffff',
    '--text-secondary': '#ff00ff',
    '--text-muted': '#4a4a6e',
    '--accent-yellow': '#ffff00',
    '--accent-cyan': '#00ffff',
    '--accent-green': '#00ff00',
    '--accent-pink': '#ff00ff',
    '--accent-red': '#ff0066',
    '--border-color': '#00ffff',
    '--key-bg': '#12121a',
    '--key-border': '#ff00ff',
    '--key-text': '#00ffff',
    '--key-highlight': '#ffff00',
  },
};

// Theme registry mapping shop itemId to theme
export const VISUAL_THEMES: Record<string, VisualTheme> = {
  'default': defaultTheme,
  'retro-green': retroGreenTheme,
  'synthwave': synthwaveTheme,
  'cyberpunk': cyberpunkTheme,
  'ocean-depths': oceanDepthsTheme,
  'forest-zen': forestZenTheme,
  'neon-nights': neonNightsTheme,
};

// Get a theme by ID (falls back to default)
export function getVisualTheme(themeId: string | undefined): VisualTheme {
  if (!themeId || !VISUAL_THEMES[themeId]) {
    return VISUAL_THEMES['default'];
  }
  return VISUAL_THEMES[themeId];
}

// Apply theme CSS variables to document
export function applyTheme(theme: VisualTheme): void {
  const root = document.documentElement;
  Object.entries(theme.cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// Apply theme by ID
export function applyThemeById(themeId: string | undefined): void {
  const theme = getVisualTheme(themeId);
  applyTheme(theme);
}
