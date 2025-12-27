/**
 * German Language Levels for QWERTZ Keyboard Users
 * PRP-041: Themed Levels - AI Prompts Theme (Levels 31-35)
 *
 * German content with special characters: ä, ö, ü, ß
 * Designed for QWERTZ keyboard layout users.
 */

import type { Lesson, FingerType } from "../types";

// All fingers used in lessons
const ALL_FINGERS: FingerType[] = [
  "left-pinky",
  "left-ring",
  "left-middle",
  "left-index",
  "right-index",
  "right-middle",
  "right-ring",
  "right-pinky",
  "thumb",
];

// German keyboard includes umlauts and eszett
const GERMAN_KEYBOARD = [
  "q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "ü",
  "a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä",
  "y", "x", "c", "v", "b", "n", "m", ",", ".", "-", "ß",
  " ",
];

/**
 * German AI Prompts Theme (Levels 31-35)
 * "Speed of Thought" - Master AI prompting while building typing speed
 */
export const levelsDE: Lesson[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TIER 7: AI PROMPTS THEME - GERMAN (Levels 31-35)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 31,
    title: "Einfache Prompts",
    description: "Grundlegende KI-Prompts auf Deutsch",
    concept: `Willkommen bei den KI-Prompts auf Deutsch!

    Lerne die Grundlagen des Promptings, während du deine Tippgeschwindigkeit verbesserst.
    Diese Übungen enthalten typische deutsche Umlaute (ä, ö, ü) und das Eszett (ß).

    Tippe es. Lerne es. Vergiss es nie.`,
    keys: GERMAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Erkläre mir dieses Konzept in einfachen Worten",
      "Schreibe eine kurze Zusammenfassung zu diesem Thema",
      "Erstelle eine Liste mit 5 Ideen für",
      "Übersetze den folgenden Text ins Deutsche",
      "Was sind die Vor- und Nachteile von",
      "Gib mir drei Beispiele für",
      "Beschreibe den Unterschied zwischen A und B",
      "Erkläre das so, dass ein Kind es verstehen würde",
      "Fasse den Text in einem Satz zusammen",
      "Schreibe mir eine einfache Anleitung für",
    ],
    quizWords: ["erkläre", "Konzept", "einfachen", "Zusammenfassung", "Thema", "Übersetzt", "Beispiele", "Unterschied"],
    minWPM: 25,
    minAccuracy: 88,
  },

  {
    id: 32,
    title: "Fortgeschrittene Prompts",
    description: "Professionelle KI-Anfragen formulieren",
    concept: `Jetzt werden die Prompts anspruchsvoller!

    Professionelle Prompts erfordern präzise Formulierungen.
    Lerne die Muster, die erfahrene KI-Nutzer verwenden.

    Übe diese Strukturen, bis sie in Fleisch und Blut übergehen.`,
    keys: GERMAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Schreibe als Senior Software Ingenieur eine Code-Review",
      "Schreibe eine professionelle E-Mail auf Deutsch",
      "Erstelle einen Marketingplan für ein B2B SaaS Startup",
      "Analysiere die Stärken und Schwächen dieses Ansatzes",
      "Formuliere eine höfliche Absage für das Meeting",
      "Entwickle eine Strategie für die Kundenakquise",
      "Schreibe einen überzeugenden Produktbeschreibungstext",
      "Erstelle eine Präsentation zum Thema Nachhaltigkeit",
      "Verfasse einen Blogbeitrag über künstliche Intelligenz",
      "Schreibe eine Bewerbung für die Stelle als Projektmanager",
    ],
    quizWords: ["professionelle", "Marketingplan", "Stärken", "Schwächen", "höfliche", "überzeugenden", "Nachhaltigkeit", "künstliche"],
    minWPM: 28,
    minAccuracy: 88,
  },

  {
    id: 33,
    title: "System-Prompts",
    description: "KI-Assistenten konfigurieren",
    concept: `System-Prompts definieren das Verhalten der KI.

    Diese Anweisungen legen fest, wie die KI antworten soll.
    Lerne die Muster für effektive Systemkonfigurationen.

    Präzision ist hier besonders wichtig!`,
    keys: GERMAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Du bist ein hilfreicher Assistent, der auf Deutsch antwortet",
      "Antworte immer in einem professionellen und freundlichen Ton",
      "Strukturiere deine Antworten mit Aufzählungspunkten",
      "Denke Schritt für Schritt und zeige deine Überlegungen",
      "Antworte im JSON-Format mit der folgenden Struktur",
      "Du bist ein Experte für deutsche Grammatik und Rechtschreibung",
      "Bleibe sachlich und vermeide persönliche Meinungen",
      "Frage nach, wenn die Anfrage unklar ist",
      "Fasse dich kurz und komme direkt zum Punkt",
      "Verwende einfache Sprache ohne Fachbegriffe",
    ],
    quizWords: ["Assistent", "professionellen", "Aufzählungspunkten", "Überlegungen", "Struktur", "Grammatik", "Rechtschreibung", "Fachbegriffe"],
    minWPM: 30,
    minAccuracy: 90,
  },

  {
    id: 34,
    title: "Mehrstufige Gespräche",
    description: "Kontext aufbauen und verfeinern",
    concept: `Effektive KI-Nutzung bedeutet Dialog!

    Lerne, wie du auf vorherige Antworten aufbaust.
    Verfeinere deine Anfragen basierend auf dem Kontext.

    Diese Fähigkeit unterscheidet Anfänger von Experten.`,
    keys: GERMAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Basierend auf unserer vorherigen Diskussion über",
      "Kannst du die vorherige Antwort anpassen und ergänzen",
      "Lass mich mehr Kontext zu den Anforderungen geben",
      "Ich möchte auf deinen letzten Vorschlag eingehen",
      "Könntest du das konkreter formulieren mit Beispielen",
      "Füge bitte noch folgende Aspekte hinzu",
      "Das ist gut, aber ändere bitte den Tonfall",
      "Kürze die Antwort auf die wichtigsten Punkte",
      "Erweitere den zweiten Abschnitt mit mehr Details",
      "Formatiere das Ganze als nummerierte Liste",
    ],
    quizWords: ["vorherigen", "Diskussion", "ergänzen", "Anforderungen", "Vorschlag", "konkreter", "Aspekte", "Abschnitt"],
    minWPM: 32,
    minAccuracy: 90,
  },

  {
    id: 35,
    title: "Experten-Prompts",
    description: "Fortgeschrittene Prompting-Techniken meistern",
    concept: `Die Meisterklasse des Promptings!

    Hier lernst du die Techniken der Power-User:
    - Umfassende Analysen
    - Detaillierte Implementierungspläne
    - Produktionsreifer Code

    Mit diesen Fähigkeiten wirst du zum KI-Experten.`,
    keys: GERMAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Erstelle eine umfassende Analyse mit Vergleich der Optionen",
      "Entwickle einen detaillierten Implementierungsplan mit Meilensteinen",
      "Schreibe produktionsreifen Code mit Fehlerbehandlung für",
      "Führe eine SWOT-Analyse für dieses Geschäftsmodell durch",
      "Erstelle ein Konzept für die Skalierung der Infrastruktur",
      "Schreibe eine technische Dokumentation für die API",
      "Entwickle einen Testplan mit verschiedenen Szenarien",
      "Analysiere die Risiken und schlage Maßnahmen zur Minderung vor",
      "Erstelle einen Projektstrukturplan mit Verantwortlichkeiten",
      "Fasse den folgenden Text in drei Sätzen zusammen",
    ],
    quizWords: ["umfassende", "detaillierten", "Meilensteinen", "produktionsreifen", "Fehlerbehandlung", "Geschäftsmodell", "Infrastruktur", "Verantwortlichkeiten"],
    minWPM: 35,
    minAccuracy: 92,
  },
];

// Get German level by ID
export function getGermanLevelById(levelId: number): Lesson | undefined {
  return levelsDE.find((level) => level.id === levelId);
}

// Get total German level count
export function getTotalGermanLevels(): number {
  return levelsDE.length;
}
