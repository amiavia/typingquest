/**
 * Spanish Language Levels for QWERTY Keyboard Users
 * PRP-050: Localized Lessons - AI Prompts Theme (Levels 31-35)
 *
 * Spanish content with special characters: á, é, í, ó, ú, ü, ñ, ¿, ¡
 * Designed for Spanish QWERTY keyboard layout users.
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

// Spanish keyboard includes accented vowels and ñ
const SPANISH_KEYBOARD = [
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
  "a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ",
  "z", "x", "c", "v", "b", "n", "m", ",", ".", "-",
  "á", "é", "í", "ó", "ú", "ü", "¿", "¡",
  " ",
];

/**
 * Spanish AI Prompts Theme (Levels 31-35)
 * "Velocidad del Pensamiento" - Master AI prompting while building typing speed
 */
export const levelsES: Lesson[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TIER 7: AI PROMPTS THEME - SPANISH (Levels 31-35)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 31,
    title: "Prompts Simples",
    description: "Comandos básicos de IA en español",
    concept: `¡Bienvenido a los prompts de IA en español!

    Aprende los fundamentos del prompting mientras mejoras tu velocidad de escritura.
    Estos ejercicios incluyen los acentos españoles comunes (á, é, í, ó, ú, ñ).

    Escríbelo. Apréndelo. Nunca lo olvides.`,
    keys: SPANISH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Explícame este concepto en términos simples",
      "Escribe un resumen corto de este tema",
      "Crea una lista de cinco ideas para",
      "Traduce el siguiente texto al español",
      "¿Cuáles son las ventajas y desventajas de",
      "Dame tres ejemplos de",
      "Describe la diferencia entre A y B",
      "Explícalo como si tuviera diez años",
      "Resume el texto en una sola frase",
      "Escríbeme una guía simple para",
    ],
    quizWords: ["explícame", "concepto", "simples", "resumen", "tema", "traduce", "ejemplos", "diferencia"],
    minWPM: 25,
    minAccuracy: 88,
  },

  {
    id: 32,
    title: "Prompts Avanzados",
    description: "Formular solicitudes profesionales de IA",
    concept: `¡Ahora los prompts se vuelven más exigentes!

    Los prompts profesionales requieren formulaciones precisas.
    Aprende los patrones utilizados por usuarios experimentados.

    Practica estas estructuras hasta que se vuelvan naturales.`,
    keys: SPANISH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Escribe como ingeniero de software senior una revisión de código",
      "Redacta un correo electrónico profesional en español",
      "Crea un plan de marketing para una startup B2B SaaS",
      "Analiza las fortalezas y debilidades de este enfoque",
      "Formula un rechazo cortés para la reunión",
      "Desarrolla una estrategia para adquirir clientes",
      "Escribe un texto de descripción de producto convincente",
      "Crea una presentación sobre el tema de la sostenibilidad",
      "Redacta un artículo de blog sobre inteligencia artificial",
      "Escribe una solicitud para el puesto de gerente de proyecto",
    ],
    quizWords: ["profesional", "marketing", "fortalezas", "debilidades", "cortés", "convincente", "sostenibilidad", "artificial"],
    minWPM: 28,
    minAccuracy: 88,
  },

  {
    id: 33,
    title: "Prompts de Sistema",
    description: "Configurar los asistentes de IA",
    concept: `Los prompts de sistema definen el comportamiento de la IA.

    Estas instrucciones determinan cómo debe responder la IA.
    Aprende los patrones para configuraciones efectivas.

    ¡La precisión es particularmente importante aquí!`,
    keys: SPANISH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Eres un asistente útil que responde en español",
      "Responde siempre con un tono profesional y amigable",
      "Estructura tus respuestas con viñetas",
      "Razona paso a paso y muestra tu razonamiento",
      "Responde en formato JSON con la siguiente estructura",
      "Eres un experto en gramática y ortografía española",
      "Mantente factual y evita opiniones personales",
      "Pide aclaraciones si la solicitud no está clara",
      "Sé conciso y ve directo al grano",
      "Usa un lenguaje simple sin jerga técnica",
    ],
    quizWords: ["asistente", "profesional", "viñetas", "razonamiento", "estructura", "gramática", "ortografía", "jerga"],
    minWPM: 30,
    minAccuracy: 90,
  },

  {
    id: 34,
    title: "Conversaciones Multi-turno",
    description: "Construir contexto y refinar",
    concept: `¡El uso efectivo de la IA significa diálogo!

    Aprende a construir sobre respuestas anteriores.
    Refina tus solicitudes basándote en el contexto.

    Esta habilidad distingue a los principiantes de los expertos.`,
    keys: SPANISH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Basándome en nuestra discusión anterior sobre",
      "¿Puedes adaptar y completar la respuesta anterior?",
      "Déjame darte más contexto sobre los requisitos",
      "Me gustaría volver a tu última sugerencia",
      "¿Podrías ser más concreto con ejemplos?",
      "Añade por favor los siguientes aspectos",
      "Está bien, pero cambia el tono por favor",
      "Reduce la respuesta a los puntos esenciales",
      "Expande la segunda sección con más detalles",
      "Formatea todo como lista numerada",
    ],
    quizWords: ["anterior", "discusión", "completar", "requisitos", "sugerencia", "concreto", "aspectos", "sección"],
    minWPM: 32,
    minAccuracy: 90,
  },

  {
    id: 35,
    title: "Prompts Expertos",
    description: "Dominar las técnicas avanzadas de prompting",
    concept: `¡La clase magistral del prompting!

    Aquí aprendes las técnicas de los usuarios avanzados:
    - Análisis completos
    - Planes de implementación detallados
    - Código listo para producción

    Con estas habilidades te convertirás en un experto en IA.`,
    keys: SPANISH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Crea un análisis completo con comparación de opciones",
      "Desarrolla un plan de implementación detallado con hitos",
      "Escribe código listo para producción con manejo de errores",
      "Realiza un análisis FODA para este modelo de negocio",
      "Crea un concepto para la escalabilidad de la infraestructura",
      "Escribe documentación técnica para la API",
      "Desarrolla un plan de pruebas con diferentes escenarios",
      "Analiza los riesgos y propón medidas de mitigación",
      "Crea un plan de estructura de proyecto con responsabilidades",
      "Resume el siguiente texto en tres oraciones",
    ],
    quizWords: ["completo", "detallado", "hitos", "producción", "errores", "negocio", "infraestructura", "responsabilidades"],
    minWPM: 35,
    minAccuracy: 92,
  },
];

// Get Spanish level by ID
export function getSpanishLevelById(levelId: number): Lesson | undefined {
  return levelsES.find((level) => level.id === levelId);
}

// Get total Spanish level count
export function getTotalSpanishLevels(): number {
  return levelsES.length;
}
