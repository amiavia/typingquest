/**
 * PRP-047: Funny Default Nicknames
 *
 * Generates deterministic funny nicknames for users without a set nickname.
 * Same user always gets the same nickname based on their ID.
 */

const FUNNY_NICKNAMES = [
  // Keyboard puns
  'KeySmasher',
  'QwertyNinja',
  'HomeRowHero',
  'CapsLockCadet',
  'BackspaceBandit',
  'ShiftHappens',
  'CtrlFreak',
  'TabTapper',

  // Self-deprecating (encourages setting real name)
  'HuntAndPecker',
  'TwoFingerTyrant',
  'TypingPadawan',
  'KeyboardRookie',
  'SlowPokeTyper',
  'BufferingBob',

  // Retro themed
  'PixelPecker',
  'RetroFingers',
];

/**
 * Get a deterministic funny nickname based on user ID
 * Same user always gets the same nickname
 */
export function getFunnyNickname(userId: string): string {
  // Simple hash: sum of character codes
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash += userId.charCodeAt(i);
  }
  return FUNNY_NICKNAMES[hash % FUNNY_NICKNAMES.length];
}

/**
 * Get display name for a user
 * Priority: nickname > autoNickname > funny nickname (never "Anonymous")
 */
export function getDisplayName(
  nickname: string | undefined,
  autoNickname: string | undefined,
  userId: string
): string {
  if (nickname && nickname.trim()) {
    return nickname;
  }
  if (autoNickname && autoNickname.trim()) {
    return autoNickname;
  }
  return getFunnyNickname(userId);
}
