import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { KeyboardLayoutType } from '../data/keyboardLayouts';

// ==================== PRP-034 + PRP-035: INTELLIGENT LAYOUT DETECTION ====================

type DetectionState = 'detecting' | 'detected' | 'locked';
type LayoutFamily = 'qwerty' | 'qwertz' | 'azerty';

interface KeyboardLayoutContextValue {
  // Current state
  layout: KeyboardLayoutType;
  detectionState: DetectionState;
  isLocked: boolean;
  layoutFamily: LayoutFamily;

  // Detection methods
  processKeystroke: (code: string, key: string) => void;
  resetDetection: () => void;

  // Manual override
  setLayout: (layout: KeyboardLayoutType) => void;
  lockLayout: (layout: KeyboardLayoutType) => void;

  // Pause detection (for SpeedTest to run its own detection)
  pauseDetection: () => void;
  resumeDetection: () => void;
  isDetectionPaused: boolean;

  // For UI feedback
  lastDetectedKey: string | null;
  confidence: Record<LayoutFamily, number>;
}

const KeyboardLayoutContext = createContext<KeyboardLayoutContextValue | null>(null);

export function useKeyboardLayout() {
  const context = useContext(KeyboardLayoutContext);
  if (!context) {
    throw new Error('useKeyboardLayout must be used within KeyboardLayoutProvider');
  }
  return context;
}

// ==================== DETECTION LOGIC (from PRP-034) ====================

// DEFINITIVE KEYS: These immediately lock the layout (100% confidence)
const definitiveKeys: Record<string, Record<string, LayoutFamily>> = {
  // Y/Z position - definitively distinguishes QWERTY from QWERTZ
  'KeyY': { 'z': 'qwertz' },
  'KeyZ': { 'y': 'qwertz', 'w': 'azerty' },

  // German umlauts - DEFINITIVELY indicate QWERTZ
  'Semicolon': { 'ö': 'qwertz', 'm': 'azerty' },
  'Quote': { 'ä': 'qwertz' },
  'BracketLeft': { 'ü': 'qwertz' },
  'Minus': { 'ß': 'qwertz' },

  // AZERTY-specific positions
  'KeyQ': { 'a': 'azerty' },
  'KeyA': { 'q': 'azerty' },
  'KeyW': { 'z': 'azerty' },
  'KeyM': { ',': 'azerty' },
};

// Character-only definitive (for compose keys, etc.)
const charOnlyDefinitive: Record<string, LayoutFamily> = {
  'ö': 'qwertz',
  'ä': 'qwertz',
  'ü': 'qwertz',
  'ß': 'qwertz',
};

// CONFIRMATORY KEYS: Add confidence but don't lock alone
const confirmatoryKeys: Record<string, Record<string, LayoutFamily>> = {
  'KeyY': { 'y': 'qwerty' },
  'KeyZ': { 'z': 'qwerty' },
  'Semicolon': { ';': 'qwerty' },
  'Quote': { "'": 'qwerty' },
  'BracketLeft': { '[': 'qwerty' },
  'Slash': { '/': 'qwerty', '-': 'qwertz' },
};

// NEUTRAL KEYS: Same across QWERTY and QWERTZ - ignored for detection
const neutralKeys = new Set([
  'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG', 'KeyH',
  'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN', 'KeyO', 'KeyP',
  'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU', 'KeyV', 'KeyW', 'KeyX',
]);

const CONFIDENCE_THRESHOLD = 2;
const STORAGE_KEY = 'typingQuestLayout';

// ==================== LOCALE-AWARE VARIANT SELECTION ====================
// Maps browser locale to specific keyboard layout variant within a family

// Comprehensive locale-to-layout mapping
// Format: 'language-region' or 'language' → KeyboardLayoutType
const LOCALE_TO_LAYOUT: Record<string, KeyboardLayoutType> = {
  // QWERTZ family - German-speaking countries
  'de-de': 'qwertz-de',
  'de-at': 'qwertz-de',  // Austria uses German layout
  'de-ch': 'qwertz-ch',  // Swiss German
  'de': 'qwertz-de',     // Generic German → Germany

  // AZERTY family - French-speaking countries
  'fr-fr': 'azerty-fr',
  'fr-be': 'azerty-be',  // Belgian French
  'fr-ch': 'qwertz-ch',  // Swiss French uses QWERTZ!
  'fr-ca': 'qwerty-ca',  // Canadian French uses QWERTY
  'fr': 'azerty-fr',     // Generic French → France
  'nl-be': 'azerty-be',  // Belgian Dutch also uses AZERTY

  // QWERTY - English variants
  'en-us': 'qwerty-us',
  'en-gb': 'qwerty-uk',
  'en-au': 'qwerty-uk',  // Australia uses UK layout
  'en-nz': 'qwerty-uk',  // New Zealand uses UK layout
  'en-ie': 'qwerty-uk',  // Ireland uses UK layout
  'en-in': 'qwerty-in',  // India
  'en-ca': 'qwerty-ca',  // Canadian English
  'en': 'qwerty-us',     // Generic English → US

  // QWERTY - Portuguese variants
  'pt-br': 'qwerty-br',  // Brazil ABNT2
  'pt-pt': 'qwerty-pt',  // Portugal
  'pt': 'qwerty-pt',     // Generic Portuguese → Portugal

  // QWERTY - Spanish variants
  'es-es': 'qwerty-es',  // Spain
  'es-mx': 'qwerty-latam',
  'es-ar': 'qwerty-latam',
  'es-co': 'qwerty-latam',
  'es-cl': 'qwerty-latam',
  'es-pe': 'qwerty-latam',
  'es-ve': 'qwerty-latam',
  'es': 'qwerty-latam',  // Generic Spanish → LatAm (more common)

  // QWERTY - Other European
  'it-it': 'qwerty-it',
  'it-ch': 'qwertz-ch',  // Swiss Italian uses QWERTZ!
  'it': 'qwerty-it',
  'nl-nl': 'qwerty-nl',
  'nl': 'qwerty-nl',

  // QWERTY - Nordic
  'sv-se': 'qwerty-nordic',
  'sv': 'qwerty-nordic',
  'fi-fi': 'qwerty-nordic',
  'fi': 'qwerty-nordic',
  'nb-no': 'qwerty-nordic',
  'nn-no': 'qwerty-nordic',
  'no': 'qwerty-nordic',
  'da-dk': 'qwerty-nordic',
  'da': 'qwerty-nordic',

  // QWERTY - Eastern European
  'pl-pl': 'qwerty-pl',
  'pl': 'qwerty-pl',
  'tr-tr': 'qwerty-tr',
  'tr': 'qwerty-tr',
};

// Family defaults (fallback when locale doesn't give specific variant)
const FAMILY_DEFAULTS: Record<LayoutFamily, KeyboardLayoutType> = {
  'qwerty': 'qwerty-us',
  'qwertz': 'qwertz-de',
  'azerty': 'azerty-fr',
};

// Get layout family from layout type
function getLayoutFamily(layout: KeyboardLayoutType): LayoutFamily {
  if (layout.startsWith('qwertz')) return 'qwertz';
  if (layout.startsWith('azerty')) return 'azerty';
  return 'qwerty';
}

// Get browser locale
function getBrowserLocale(): string {
  return navigator.language.toLowerCase();
}

// Get layout from locale (used for initial hint and variant selection)
function getLayoutFromLocale(locale: string): KeyboardLayoutType | null {
  const lowerLocale = locale.toLowerCase();

  // Try exact match first (e.g., 'de-ch')
  if (LOCALE_TO_LAYOUT[lowerLocale]) {
    return LOCALE_TO_LAYOUT[lowerLocale];
  }

  // Try language-only match (e.g., 'de')
  const lang = lowerLocale.split('-')[0];
  if (LOCALE_TO_LAYOUT[lang]) {
    return LOCALE_TO_LAYOUT[lang];
  }

  return null;
}

// Get browser locale hint for initial layout
function getLayoutHint(): KeyboardLayoutType {
  const locale = getBrowserLocale();
  return getLayoutFromLocale(locale) || 'qwerty-us';
}

// Get variant within a detected family using locale
function getVariantForFamily(family: LayoutFamily): KeyboardLayoutType {
  const locale = getBrowserLocale();
  const localeLayout = getLayoutFromLocale(locale);

  // If locale suggests a layout in this family, use it
  if (localeLayout && getLayoutFamily(localeLayout) === family) {
    return localeLayout;
  }

  // Otherwise use family default
  return FAMILY_DEFAULTS[family];
}

interface KeyboardLayoutProviderProps {
  children: ReactNode;
}

export function KeyboardLayoutProvider({ children }: KeyboardLayoutProviderProps) {
  // Load saved layout or use hint
  const [layout, setLayoutState] = useState<KeyboardLayoutType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as KeyboardLayoutType | null;
    return saved || getLayoutHint();
  });

  const [detectionState, setDetectionState] = useState<DetectionState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? 'locked' : 'detecting';
  });

  const [isLocked, setIsLocked] = useState(() => {
    return !!localStorage.getItem(STORAGE_KEY);
  });

  const [confidence, setConfidence] = useState<Record<LayoutFamily, number>>({
    qwerty: 0,
    qwertz: 0,
    azerty: 0,
  });

  const [lastDetectedKey, setLastDetectedKey] = useState<string | null>(null);
  const [isDetectionPaused, setIsDetectionPaused] = useState(false);

  // Pause/resume detection (for SpeedTest)
  const pauseDetection = useCallback(() => {
    setIsDetectionPaused(true);
  }, []);

  const resumeDetection = useCallback(() => {
    setIsDetectionPaused(false);
  }, []);

  // Lock and save layout
  const lockLayout = useCallback((newLayout: KeyboardLayoutType) => {
    setLayoutState(newLayout);
    setIsLocked(true);
    setDetectionState('locked');
    localStorage.setItem(STORAGE_KEY, newLayout);
  }, []);

  // Process keystroke for detection
  const processKeystroke = useCallback((code: string, key: string) => {
    // Skip if detection is paused (SpeedTest is running its own detection)
    if (isDetectionPaused) return;

    const keyLower = key.toLowerCase();

    // If layout is locked, only check for CONTRADICTING definitive keys
    if (isLocked) {
      const definitive = definitiveKeys[code];
      if (definitive && definitive[keyLower]) {
        const newFamily = definitive[keyLower];
        const currentFamily = getLayoutFamily(layout);

        // Only unlock if this is a DIFFERENT family
        if (newFamily !== currentFamily) {
          console.log(`Layout contradiction detected: ${currentFamily} -> ${newFamily}`);
          const newLayout = getVariantForFamily(newFamily);
          lockLayout(newLayout);
          setLastDetectedKey(keyLower);
        }
      }
      return;
    }

    // Check if this is a neutral key (same across QWERTY/QWERTZ)
    if (neutralKeys.has(code) && !definitiveKeys[code]?.[keyLower]) {
      return; // Ignore neutral keys
    }

    // Check for DEFINITIVE key match - immediately lock
    const definitive = definitiveKeys[code];
    if (definitive && definitive[keyLower]) {
      const family = definitive[keyLower];
      const newLayout = getVariantForFamily(family);
      console.log(`Layout LOCKED: ${newLayout} (definitive key: ${code}=${keyLower})`);
      lockLayout(newLayout);
      setLastDetectedKey(keyLower);
      return;
    }

    // Check for character-only definitive (for compose keys)
    if (charOnlyDefinitive[keyLower]) {
      const family = charOnlyDefinitive[keyLower];
      const newLayout = getVariantForFamily(family);
      console.log(`Layout LOCKED: ${newLayout} (character: ${keyLower})`);
      lockLayout(newLayout);
      setLastDetectedKey(keyLower);
      return;
    }

    // Check for CONFIRMATORY key match - add confidence
    const confirmatory = confirmatoryKeys[code];
    if (confirmatory && confirmatory[keyLower]) {
      const family = confirmatory[keyLower];
      setConfidence(prev => {
        const newConfidence = { ...prev, [family]: prev[family] + 1 };
        console.log(`Layout confidence: ${family} +1 (now ${newConfidence[family]})`);

        // Check if we've reached threshold
        if (newConfidence[family] >= CONFIDENCE_THRESHOLD) {
          const newLayout = getVariantForFamily(family);
          setDetectionState('detected');
          setLayoutState(newLayout);
          // Don't fully lock yet, but update display
          localStorage.setItem(STORAGE_KEY, newLayout);
        }

        return newConfidence;
      });
      setLastDetectedKey(keyLower);
    }
  }, [isDetectionPaused, isLocked, layout, lockLayout]);

  // Reset detection
  const resetDetection = useCallback(() => {
    setIsLocked(false);
    setDetectionState('detecting');
    setConfidence({ qwerty: 0, qwertz: 0, azerty: 0 });
    setLastDetectedKey(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Set layout manually
  const setLayout = useCallback((newLayout: KeyboardLayoutType) => {
    setLayoutState(newLayout);
  }, []);

  // Global keyboard listener for detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't process if in an input/textarea (let TryItOut handle it)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Still process for detection
        processKeystroke(e.code, e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processKeystroke]);

  const layoutFamily = useMemo(() => getLayoutFamily(layout), [layout]);

  const value = useMemo(() => ({
    layout,
    detectionState,
    isLocked,
    layoutFamily,
    processKeystroke,
    resetDetection,
    setLayout,
    lockLayout,
    pauseDetection,
    resumeDetection,
    isDetectionPaused,
    lastDetectedKey,
    confidence,
  }), [
    layout,
    detectionState,
    isLocked,
    layoutFamily,
    processKeystroke,
    resetDetection,
    setLayout,
    lockLayout,
    pauseDetection,
    resumeDetection,
    isDetectionPaused,
    lastDetectedKey,
    confidence,
  ]);

  return (
    <KeyboardLayoutContext.Provider value={value}>
      {children}
    </KeyboardLayoutContext.Provider>
  );
}

// ==================== EXPORTED UTILITIES ====================
// These can be used in Settings and other components for consistent locale handling

export {
  getLayoutFromLocale,
  getLayoutHint,
  getVariantForFamily,
  getBrowserLocale,
  getLayoutFamily,
  LOCALE_TO_LAYOUT,
  FAMILY_DEFAULTS,
};
