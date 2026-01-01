/**
 * Italian Language Levels for QWERTY Keyboard Users
 * PRP-050: Localized Lessons - AI Prompts Theme (Levels 31-35)
 *
 * Italian content with special characters: à, è, é, ì, ò, ù
 * Designed for Italian QWERTY keyboard layout users.
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

// Italian keyboard includes accented vowels
const ITALIAN_KEYBOARD = [
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
  "a", "s", "d", "f", "g", "h", "j", "k", "l",
  "z", "x", "c", "v", "b", "n", "m", ",", ".", "-",
  "à", "è", "é", "ì", "ò", "ù",
  " ",
];

/**
 * Italian AI Prompts Theme (Levels 31-35)
 * "Velocità del Pensiero" - Master AI prompting while building typing speed
 */
export const levelsIT: Lesson[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TIER 7: AI PROMPTS THEME - ITALIAN (Levels 31-35)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 31,
    title: "Prompt Semplici",
    description: "Comandi IA di base in italiano",
    concept: `Benvenuto nei prompt IA in italiano!

    Impara le basi del prompting mentre migliori la tua velocità di digitazione.
    Questi esercizi includono gli accenti italiani comuni (à, è, é, ì, ò, ù).

    Digitalo. Imparalo. Non dimenticarlo mai.`,
    keys: ITALIAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Spiegami questo concetto in termini semplici",
      "Scrivi un breve riassunto di questo argomento",
      "Crea una lista di cinque idee per",
      "Traduci il seguente testo in italiano",
      "Quali sono i vantaggi e gli svantaggi di",
      "Dammi tre esempi di",
      "Descrivi la differenza tra A e B",
      "Spiegalo come se avessi dieci anni",
      "Riassumi il testo in una sola frase",
      "Scrivimi una guida semplice per",
    ],
    quizWords: ["spiegami", "concetto", "semplici", "riassunto", "argomento", "traduci", "esempi", "differenza"],
    minWPM: 25,
    minAccuracy: 88,
  },

  {
    id: 32,
    title: "Prompt Avanzati",
    description: "Formulare richieste IA professionali",
    concept: `Ora i prompt diventano più impegnativi!

    I prompt professionali richiedono formulazioni precise.
    Impara i pattern utilizzati dagli utenti esperti.

    Pratica queste strutture finché non diventano naturali.`,
    keys: ITALIAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Scrivi come ingegnere software senior una revisione del codice",
      "Redigi una email professionale in italiano",
      "Crea un piano marketing per una startup B2B SaaS",
      "Analizza i punti di forza e debolezza di questo approccio",
      "Formula un rifiuto cortese per la riunione",
      "Sviluppa una strategia per acquisire clienti",
      "Scrivi un testo di descrizione prodotto convincente",
      "Crea una presentazione sul tema della sostenibilità",
      "Redigi un articolo di blog sull'intelligenza artificiale",
      "Scrivi una candidatura per la posizione di project manager",
    ],
    quizWords: ["professionale", "marketing", "forza", "debolezza", "cortese", "convincente", "sostenibilità", "artificiale"],
    minWPM: 28,
    minAccuracy: 88,
  },

  {
    id: 33,
    title: "Prompt di Sistema",
    description: "Configurare gli assistenti IA",
    concept: `I prompt di sistema definiscono il comportamento dell'IA.

    Queste istruzioni determinano come l'IA deve rispondere.
    Impara i pattern per configurazioni efficaci.

    La precisione è particolarmente importante qui!`,
    keys: ITALIAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Sei un assistente utile che risponde in italiano",
      "Rispondi sempre con un tono professionale e amichevole",
      "Struttura le tue risposte con punti elenco",
      "Ragiona passo dopo passo e mostra il tuo ragionamento",
      "Rispondi in formato JSON con la seguente struttura",
      "Sei un esperto di grammatica e ortografia italiana",
      "Rimani fattuale ed evita opinioni personali",
      "Chiedi chiarimenti se la richiesta è poco chiara",
      "Sii conciso e vai dritto al punto",
      "Usa un linguaggio semplice senza gergo tecnico",
    ],
    quizWords: ["assistente", "professionale", "elenco", "ragionamento", "struttura", "grammatica", "ortografia", "gergo"],
    minWPM: 30,
    minAccuracy: 90,
  },

  {
    id: 34,
    title: "Conversazioni Multi-turno",
    description: "Costruire il contesto e raffinare",
    concept: `L'uso efficace dell'IA significa dialogo!

    Impara a costruire sulle risposte precedenti.
    Raffina le tue richieste in base al contesto.

    Questa competenza distingue i principianti dagli esperti.`,
    keys: ITALIAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Basandomi sulla nostra discussione precedente riguardo",
      "Puoi adattare e completare la risposta precedente",
      "Lasciami dare più contesto sui requisiti",
      "Vorrei tornare sul tuo ultimo suggerimento",
      "Potresti essere più concreto con degli esempi",
      "Aggiungi per favore i seguenti aspetti",
      "Va bene, ma cambia il tono per favore",
      "Riduci la risposta ai punti essenziali",
      "Espandi la seconda sezione con più dettagli",
      "Formatta il tutto come lista numerata",
    ],
    quizWords: ["precedente", "discussione", "completare", "requisiti", "suggerimento", "concreto", "aspetti", "sezione"],
    minWPM: 32,
    minAccuracy: 90,
  },

  {
    id: 35,
    title: "Prompt Esperti",
    description: "Padroneggiare le tecniche di prompting avanzate",
    concept: `La masterclass del prompting!

    Qui impari le tecniche degli utenti avanzati:
    - Analisi complete
    - Piani di implementazione dettagliati
    - Codice pronto per la produzione

    Con queste competenze diventerai un esperto di IA.`,
    keys: ITALIAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Crea un'analisi completa con confronto delle opzioni",
      "Sviluppa un piano di implementazione dettagliato con milestone",
      "Scrivi codice pronto per la produzione con gestione degli errori",
      "Esegui un'analisi SWOT per questo modello di business",
      "Crea un concetto per la scalabilità dell'infrastruttura",
      "Scrivi documentazione tecnica per l'API",
      "Sviluppa un piano di test con diversi scenari",
      "Analizza i rischi e proponi misure di mitigazione",
      "Crea un piano di struttura del progetto con responsabilità",
      "Riassumi il seguente testo in tre frasi",
    ],
    quizWords: ["completa", "dettagliato", "milestone", "produzione", "errori", "business", "infrastruttura", "responsabilità"],
    minWPM: 35,
    minAccuracy: 92,
  },
];

// Get Italian level by ID
export function getItalianLevelById(levelId: number): Lesson | undefined {
  return levelsIT.find((level) => level.id === levelId);
}

// Get total Italian level count
export function getTotalItalianLevels(): number {
  return levelsIT.length;
}
