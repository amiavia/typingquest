/**
 * PRP-003: Predefined Avatar Selection System
 *
 * 10 unique 8-bit pixel art avatars for user selection.
 */

export interface Avatar {
  id: string;
  name: string;
  description: string;
  src: string; // Path to SVG/PNG
  emoji: string; // Fallback display
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  unlockLevel: number;
}

export const AVATARS: Avatar[] = [
  {
    id: 'pixel-knight',
    name: 'Pixel Knight',
    description: 'Armored warrior with a keyboard shield',
    src: '/avatars/pixel-knight.svg',
    emoji: '🛡️',
    colors: { primary: '#ffd93d', secondary: '#1a1a2e', accent: '#eef5db' },
    unlockLevel: 1,
  },
  {
    id: 'code-wizard',
    name: 'Code Wizard',
    description: 'Mystical mage wielding keyboard magic',
    src: '/avatars/code-wizard.svg',
    emoji: '🧙',
    colors: { primary: '#3bceac', secondary: '#1a1a2e', accent: '#ffd93d' },
    unlockLevel: 1,
  },
  {
    id: 'speed-ninja',
    name: 'Speed Ninja',
    description: 'Lightning-fast typing warrior',
    src: '/avatars/speed-ninja.svg',
    emoji: '🥷',
    colors: { primary: '#ff6b9d', secondary: '#1a1a2e', accent: '#eef5db' },
    unlockLevel: 3,
  },
  {
    id: 'robo-typer',
    name: 'Robo Typer',
    description: 'Friendly robot built for typing',
    src: '/avatars/robo-typer.svg',
    emoji: '🤖',
    colors: { primary: '#0ead69', secondary: '#1a1a2e', accent: '#ffd93d' },
    unlockLevel: 1,
  },
  {
    id: 'keyboard-cat',
    name: 'Keyboard Cat',
    description: 'The coolest cat on the keyboard',
    src: '/avatars/keyboard-cat.svg',
    emoji: '🐱',
    colors: { primary: '#ffd93d', secondary: '#ff6b9d', accent: '#3bceac' },
    unlockLevel: 5,
  },
  {
    id: 'bit-hero',
    name: '8-Bit Hero',
    description: 'Classic gaming champion',
    src: '/avatars/bit-hero.svg',
    emoji: '🦸',
    colors: { primary: '#3bceac', secondary: '#ffd93d', accent: '#1a1a2e' },
    unlockLevel: 1,
  },
  {
    id: 'arcade-ghost',
    name: 'Arcade Ghost',
    description: 'Friendly phantom from the arcade',
    src: '/avatars/arcade-ghost.svg',
    emoji: '👻',
    colors: { primary: '#ff6b9d', secondary: '#eef5db', accent: '#3bceac' },
    unlockLevel: 7,
  },
  {
    id: 'dragon-coder',
    name: 'Dragon Coder',
    description: 'Breathes code instead of fire',
    src: '/avatars/dragon-coder.svg',
    emoji: '🐉',
    colors: { primary: '#0ead69', secondary: '#ffd93d', accent: '#ff6b9d' },
    unlockLevel: 10,
  },
  {
    id: 'cyber-fox',
    name: 'Cyber Fox',
    description: 'Sly hacker with lightning reflexes',
    src: '/avatars/cyber-fox.svg',
    emoji: '🦊',
    colors: { primary: '#ff6b9d', secondary: '#ffd93d', accent: '#3bceac' },
    unlockLevel: 15,
  },
  {
    id: 'star-captain',
    name: 'Star Captain',
    description: 'Commander of the keyboard fleet',
    src: '/avatars/star-captain.svg',
    emoji: '⭐',
    colors: { primary: '#ffd93d', secondary: '#3bceac', accent: '#ff6b9d' },
    unlockLevel: 20,
  },
];

export const DEFAULT_AVATAR_ID = 'pixel-knight';

export function getAvatarById(id: string): Avatar | undefined {
  return AVATARS.find(a => a.id === id);
}

export function getUnlockedAvatars(userLevel: number): Avatar[] {
  return AVATARS.filter(a => a.unlockLevel <= userLevel);
}

export function getLockedAvatars(userLevel: number): Avatar[] {
  return AVATARS.filter(a => a.unlockLevel > userLevel);
}
