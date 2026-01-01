/**
 * French Language Levels for AZERTY Keyboard Users
 * PRP-050: Localized Lessons - AI Prompts Theme (Levels 31-35)
 *
 * French content with special characters: é, è, ê, ë, à, â, ù, û, ç, œ, æ
 * Designed for AZERTY keyboard layout users.
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

// French AZERTY keyboard
const FRENCH_KEYBOARD = [
  "a", "z", "e", "r", "t", "y", "u", "i", "o", "p",
  "q", "s", "d", "f", "g", "h", "j", "k", "l", "m",
  "w", "x", "c", "v", "b", "n", ",", ";", ":", "!",
  "é", "è", "ê", "à", "ù", "ç",
  " ",
];

/**
 * French AI Prompts Theme (Levels 31-35)
 * "Vitesse de Pensée" - Master AI prompting while building typing speed
 */
export const levelsFR: Lesson[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TIER 7: AI PROMPTS THEME - FRENCH (Levels 31-35)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 31,
    title: "Prompts Simples",
    description: "Commandes IA de base en français",
    concept: `Bienvenue dans les prompts IA en français!

    Apprenez les bases du prompting tout en améliorant votre vitesse de frappe.
    Ces exercices incluent les accents français courants (é, è, ê, à, ù, ç).

    Tapez-le. Apprenez-le. Ne l'oubliez jamais.`,
    keys: FRENCH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Explique-moi ce concept en termes simples",
      "Écris un résumé court de ce sujet",
      "Crée une liste de cinq idées pour",
      "Traduis le texte suivant en français",
      "Quels sont les avantages et inconvénients de",
      "Donne-moi trois exemples de",
      "Décris la différence entre A et B",
      "Explique cela comme si je avais dix ans",
      "Résume le texte en une seule phrase",
      "Écris-moi un guide simple pour",
    ],
    quizWords: ["explique", "concept", "simples", "résumé", "sujet", "traduis", "exemples", "différence"],
    minWPM: 25,
    minAccuracy: 88,
  },

  {
    id: 32,
    title: "Prompts Avancés",
    description: "Formuler des requêtes IA professionnelles",
    concept: `Maintenant les prompts deviennent plus exigeants!

    Les prompts professionnels nécessitent des formulations précises.
    Apprenez les patterns utilisés par les utilisateurs expérimentés.

    Pratiquez ces structures jusqu'à ce qu'elles deviennent naturelles.`,
    keys: FRENCH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Écris en tant que ingénieur logiciel senior une revue de code",
      "Rédige un email professionnel en français",
      "Crée un plan marketing pour une startup B2B SaaS",
      "Analyse les forces et faiblesses de cette approche",
      "Formule un refus poli pour la réunion",
      "Développe une stratégie pour acquérir des clients",
      "Écris un texte de description de produit convaincant",
      "Crée une présentation sur le thème du développement durable",
      "Rédige un article de blog sur intelligence artificielle",
      "Écris une candidature pour le poste de chef de projet",
    ],
    quizWords: ["professionnel", "marketing", "forces", "faiblesses", "poli", "convaincant", "durable", "artificielle"],
    minWPM: 28,
    minAccuracy: 88,
  },

  {
    id: 33,
    title: "Prompts Système",
    description: "Configurer les assistants IA",
    concept: `Les prompts système définissent le comportement de l'IA.

    Ces instructions déterminent comment l'IA doit répondre.
    Apprenez les patterns pour des configurations efficaces.

    La précision est particulièrement importante ici!`,
    keys: FRENCH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Tu es un assistant utile qui répond en français",
      "Réponds toujours sur un ton professionnel et amical",
      "Structure tes réponses avec des puces",
      "Réfléchis étape par étape et montre ton raisonnement",
      "Réponds au format JSON avec la structure suivante",
      "Tu es un expert en grammaire et orthographe française",
      "Reste factuel et évite les opinions personnelles",
      "Demande des précisions si la requête est floue",
      "Sois concis et va droit au but",
      "Utilise un langage simple sans jargon technique",
    ],
    quizWords: ["assistant", "professionnel", "puces", "raisonnement", "structure", "grammaire", "orthographe", "jargon"],
    minWPM: 30,
    minAccuracy: 90,
  },

  {
    id: 34,
    title: "Conversations Multi-tours",
    description: "Construire le contexte et affiner",
    concept: `L'utilisation efficace de l'IA signifie dialogue!

    Apprenez à construire sur les réponses précédentes.
    Affinez vos demandes en fonction du contexte.

    Cette compétence distingue les débutants des experts.`,
    keys: FRENCH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "En me basant sur notre discussion précédente à propos de",
      "Peux-tu adapter et compléter la réponse précédente",
      "Laisse-moi donner plus de contexte sur les exigences",
      "Je voudrais revenir sur ta dernière suggestion",
      "Pourrais-tu être plus concret avec des exemples",
      "Ajoute s'il te plaît les aspects suivants",
      "C'est bien, mais change le ton s'il te plaît",
      "Réduis la réponse aux points essentiels",
      "Développe la deuxième section avec plus de détails",
      "Formate le tout sous forme de liste numérotée",
    ],
    quizWords: ["précédente", "discussion", "compléter", "exigences", "suggestion", "concret", "aspects", "section"],
    minWPM: 32,
    minAccuracy: 90,
  },

  {
    id: 35,
    title: "Prompts Experts",
    description: "Maîtriser les techniques de prompting avancées",
    concept: `La classe de maître du prompting!

    Ici vous apprenez les techniques des utilisateurs avancés:
    - Analyses complètes
    - Plans de mise en œuvre détaillés
    - Code prêt pour la production

    Avec ces compétences vous deviendrez un expert IA.`,
    keys: FRENCH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Crée une analyse complète avec comparaison des options",
      "Développe un plan de mise en œuvre détaillé avec jalons",
      "Écris du code prêt pour la production avec gestion des erreurs",
      "Effectue une analyse SWOT pour ce modèle d'affaires",
      "Crée un concept pour la mise à l'échelle de l'infrastructure",
      "Écris une documentation technique pour l'API",
      "Développe un plan de test avec différents scénarios",
      "Analyse les risques et propose des mesures d'atténuation",
      "Crée un plan de structure de projet avec responsabilités",
      "Résume le texte suivant en trois phrases",
    ],
    quizWords: ["complète", "détaillé", "jalons", "production", "erreurs", "affaires", "infrastructure", "responsabilités"],
    minWPM: 35,
    minAccuracy: 92,
  },
];

// Get French level by ID
export function getFrenchLevelById(levelId: number): Lesson | undefined {
  return levelsFR.find((level) => level.id === levelId);
}

// Get total French level count
export function getTotalFrenchLevels(): number {
  return levelsFR.length;
}
