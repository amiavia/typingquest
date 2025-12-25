/**
 * PRP-029: Nickname Privacy System
 * Word banks for generating random gaming-themed nicknames
 * Format: {Adjective}{Noun}{Number}
 */

export const ADJECTIVES = [
  // Speed-related
  'Swift', 'Quick', 'Rapid', 'Flash', 'Turbo', 'Sonic', 'Hyper', 'Nitro',
  // Tech-related
  'Cyber', 'Pixel', 'Neon', 'Digital', 'Binary', 'Quantum', 'Laser', 'Plasma',
  // Gaming-related
  'Elite', 'Pro', 'Epic', 'Mega', 'Ultra', 'Super', 'Power', 'Alpha',
  // Nature-inspired
  'Storm', 'Thunder', 'Fire', 'Ice', 'Shadow', 'Dark', 'Light', 'Crystal',
  // Cool adjectives
  'Stealth', 'Silent', 'Phantom', 'Ghost', 'Mystic', 'Cosmic', 'Stellar', 'Nova',
  // Retro gaming
  'Arcade', 'Retro', 'Classic', 'Vintage', 'Glitch', 'Chip', 'Byte', 'Data',
  // Positive traits
  'Brave', 'Bold', 'Fierce', 'Mighty', 'Royal', 'Noble', 'Iron', 'Golden',
  // Fun additions
  'Lucky', 'Wild', 'Crazy', 'Mad', 'Funky', 'Groovy', 'Astro', 'Zen',
];

export const NOUNS = [
  // Animals
  'Falcon', 'Wolf', 'Dragon', 'Phoenix', 'Tiger', 'Eagle', 'Panther', 'Fox',
  'Hawk', 'Viper', 'Cobra', 'Bear', 'Lion', 'Shark', 'Raven', 'Owl',
  // Gaming roles
  'Ninja', 'Knight', 'Wizard', 'Warrior', 'Ranger', 'Mage', 'Rogue', 'Paladin',
  'Hunter', 'Archer', 'Samurai', 'Viking', 'Pirate', 'Hero', 'Champion', 'Legend',
  // Tech terms
  'Coder', 'Hacker', 'Typer', 'Bot', 'Droid', 'Runner', 'Glider', 'Pilot',
  // Objects/Forces
  'Blade', 'Storm', 'Strike', 'Bolt', 'Spark', 'Flame', 'Star', 'Comet',
  // Fantasy
  'Specter', 'Wraith', 'Spirit', 'Golem', 'Titan', 'Giant', 'Demon', 'Angel',
  // Misc gaming
  'Gamer', 'Player', 'Master', 'Chief', 'Boss', 'King', 'Queen', 'Duke',
];

// Words that should not appear in nicknames (basic filter)
export const BANNED_WORDS = [
  'admin', 'mod', 'moderator', 'staff', 'official', 'support', 'help',
  'system', 'convex', 'clerk', 'typebit', 'typingquest',
];

/**
 * Generate a random number for nickname suffix
 * Weighted toward memorable numbers
 */
export function generateNicknameNumber(): number {
  const random = Math.random();

  // 30% chance of "lucky" numbers
  if (random < 0.3) {
    const luckyNumbers = [7, 11, 13, 21, 42, 77, 88, 99, 100, 111, 123, 777];
    return luckyNumbers[Math.floor(Math.random() * luckyNumbers.length)];
  }

  // 70% chance of random 1-999
  return Math.floor(Math.random() * 999) + 1;
}

/**
 * Generate a random nickname
 */
export function generateRandomNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = generateNicknameNumber();

  return `${adjective}${noun}${number}`;
}

/**
 * Validate a custom nickname
 */
export function validateNickname(nickname: string): { valid: boolean; reason?: string } {
  const trimmed = nickname.trim();

  // Length check
  if (trimmed.length < 3) {
    return { valid: false, reason: 'Nickname must be at least 3 characters' };
  }
  if (trimmed.length > 20) {
    return { valid: false, reason: 'Nickname must be 20 characters or less' };
  }

  // Character check (alphanumeric + underscore only)
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, reason: 'Only letters, numbers, and underscores allowed' };
  }

  // Banned words check
  const lowerNickname = trimmed.toLowerCase();
  for (const banned of BANNED_WORDS) {
    if (lowerNickname.includes(banned)) {
      return { valid: false, reason: 'This nickname is not allowed' };
    }
  }

  return { valid: true };
}
