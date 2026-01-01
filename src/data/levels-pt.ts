/**
 * Portuguese Language Levels for QWERTY Keyboard Users
 * PRP-050: Localized Lessons - AI Prompts Theme (Levels 31-35)
 *
 * Portuguese content with special characters: á, à, â, ã, é, ê, í, ó, ô, õ, ú, ç
 * Designed for Portuguese QWERTY keyboard layout users.
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

// Portuguese keyboard includes accented vowels and cedilla
const PORTUGUESE_KEYBOARD = [
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
  "a", "s", "d", "f", "g", "h", "j", "k", "l",
  "z", "x", "c", "v", "b", "n", "m", ",", ".", "-",
  "á", "à", "â", "ã", "é", "ê", "í", "ó", "ô", "õ", "ú", "ç",
  " ",
];

/**
 * Portuguese AI Prompts Theme (Levels 31-35)
 * "Velocidade do Pensamento" - Master AI prompting while building typing speed
 */
export const levelsPT: Lesson[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TIER 7: AI PROMPTS THEME - PORTUGUESE (Levels 31-35)
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 31,
    title: "Prompts Simples",
    description: "Comandos básicos de IA em português",
    concept: `Bem-vindo aos prompts de IA em português!

    Aprenda os fundamentos do prompting enquanto melhora sua velocidade de digitação.
    Estes exercícios incluem os acentos portugueses comuns (á, ã, é, ê, ç).

    Digite. Aprenda. Nunca esqueça.`,
    keys: PORTUGUESE_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Explique-me este conceito em termos simples",
      "Escreva um resumo curto deste tema",
      "Crie uma lista de cinco ideias para",
      "Traduza o seguinte texto para português",
      "Quais são as vantagens e desvantagens de",
      "Dê-me três exemplos de",
      "Descreva a diferença entre A e B",
      "Explique isso como se eu tivesse dez anos",
      "Resuma o texto em uma única frase",
      "Escreva-me um guia simples para",
    ],
    quizWords: ["explique", "conceito", "simples", "resumo", "tema", "traduza", "exemplos", "diferença"],
    minWPM: 25,
    minAccuracy: 88,
  },

  {
    id: 32,
    title: "Prompts Avançados",
    description: "Formular solicitações profissionais de IA",
    concept: `Agora os prompts ficam mais exigentes!

    Os prompts profissionais requerem formulações precisas.
    Aprenda os padrões utilizados por usuários experientes.

    Pratique estas estruturas até que se tornem naturais.`,
    keys: PORTUGUESE_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Escreva como engenheiro de software sênior uma revisão de código",
      "Redija um email profissional em português",
      "Crie um plano de marketing para uma startup B2B SaaS",
      "Analise os pontos fortes e fracos desta abordagem",
      "Formule uma recusa educada para a reunião",
      "Desenvolva uma estratégia para adquirir clientes",
      "Escreva um texto de descrição de produto convincente",
      "Crie uma apresentação sobre o tema sustentabilidade",
      "Redija um artigo de blog sobre inteligência artificial",
      "Escreva uma candidatura para a posição de gerente de projeto",
    ],
    quizWords: ["profissional", "marketing", "fortes", "fracos", "educada", "convincente", "sustentabilidade", "artificial"],
    minWPM: 28,
    minAccuracy: 88,
  },

  {
    id: 33,
    title: "Prompts de Sistema",
    description: "Configurar os assistentes de IA",
    concept: `Os prompts de sistema definem o comportamento da IA.

    Estas instruções determinam como a IA deve responder.
    Aprenda os padrões para configurações eficazes.

    A precisão é particularmente importante aqui!`,
    keys: PORTUGUESE_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Você é um assistente útil que responde em português",
      "Responda sempre com um tom profissional e amigável",
      "Estruture suas respostas com marcadores",
      "Raciocine passo a passo e mostre seu raciocínio",
      "Responda em formato JSON com a seguinte estrutura",
      "Você é um especialista em gramática e ortografia portuguesa",
      "Mantenha-se factual e evite opiniões pessoais",
      "Peça esclarecimentos se a solicitação não estiver clara",
      "Seja conciso e vá direto ao ponto",
      "Use linguagem simples sem jargão técnico",
    ],
    quizWords: ["assistente", "profissional", "marcadores", "raciocínio", "estrutura", "gramática", "ortografia", "jargão"],
    minWPM: 30,
    minAccuracy: 90,
  },

  {
    id: 34,
    title: "Conversas Multi-turno",
    description: "Construir contexto e refinar",
    concept: `O uso eficaz da IA significa diálogo!

    Aprenda a construir sobre respostas anteriores.
    Refine suas solicitações com base no contexto.

    Esta habilidade distingue iniciantes de especialistas.`,
    keys: PORTUGUESE_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Com base na nossa discussão anterior sobre",
      "Você pode adaptar e completar a resposta anterior",
      "Deixe-me dar mais contexto sobre os requisitos",
      "Gostaria de voltar à sua última sugestão",
      "Poderia ser mais concreto com exemplos",
      "Adicione por favor os seguintes aspectos",
      "Está bom, mas mude o tom por favor",
      "Reduza a resposta aos pontos essenciais",
      "Expanda a segunda seção com mais detalhes",
      "Formate tudo como lista numerada",
    ],
    quizWords: ["anterior", "discussão", "completar", "requisitos", "sugestão", "concreto", "aspectos", "seção"],
    minWPM: 32,
    minAccuracy: 90,
  },

  {
    id: 35,
    title: "Prompts Especialistas",
    description: "Dominar técnicas avançadas de prompting",
    concept: `A masterclass do prompting!

    Aqui você aprende as técnicas dos usuários avançados:
    - Análises completas
    - Planos de implementação detalhados
    - Código pronto para produção

    Com estas habilidades você se tornará um especialista em IA.`,
    keys: PORTUGUESE_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Crie uma análise completa com comparação de opções",
      "Desenvolva um plano de implementação detalhado com marcos",
      "Escreva código pronto para produção com tratamento de erros",
      "Realize uma análise SWOT para este modelo de negócio",
      "Crie um conceito para a escalabilidade da infraestrutura",
      "Escreva documentação técnica para a API",
      "Desenvolva um plano de testes com diferentes cenários",
      "Analise os riscos e proponha medidas de mitigação",
      "Crie um plano de estrutura de projeto com responsabilidades",
      "Resuma o seguinte texto em três frases",
    ],
    quizWords: ["completa", "detalhado", "marcos", "produção", "erros", "negócio", "infraestrutura", "responsabilidades"],
    minWPM: 35,
    minAccuracy: 92,
  },
];

// Get Portuguese level by ID
export function getPortugueseLevelById(levelId: number): Lesson | undefined {
  return levelsPT.find((level) => level.id === levelId);
}

// Get total Portuguese level count
export function getTotalPortugueseLevels(): number {
  return levelsPT.length;
}
