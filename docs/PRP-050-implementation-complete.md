# PRP-050 Extension: Complete Implementation Guide

## Current Implementation Status

### Completed
- [x] react-i18next installed and configured
- [x] LanguageProvider with localStorage persistence
- [x] LanguageSwitcher component in header
- [x] English translations (en.json) - App.tsx strings
- [x] German translations (de.json) - App.tsx strings
- [x] French translations (fr.json) - Legacy format
- [x] German lesson content (levels-de.ts)
- [x] Lesson loader utility (lessonLoader.ts)
- [x] useTranslation in App.tsx

### Missing - Required for Full Localization
- [ ] Italian translations (it.json)
- [ ] Spanish translations (es.json)
- [ ] Portuguese translations (pt.json)
- [ ] Update French translations to new format
- [ ] French lesson content (levels-fr.ts)
- [ ] Italian lesson content (levels-it.ts)
- [ ] Spanish lesson content (levels-es.ts)
- [ ] Portuguese lesson content (levels-pt.ts)
- [ ] Word frequency lists for all languages
- [ ] Remaining App.tsx strings extraction
- [ ] Component-level translations
- [ ] Database schema updates for language tracking

---

## Part 1: Complete UI Translation Files

### 1.1 Italian (it.json)

```json
{
  "header": {
    "title": "TYPEBIT8",
    "subtitle": "PADRONEGGIA LA TASTIERA",
    "challenge": "SFIDA",
    "premium": "PREMIUM",
    "level": "LIVELLO",
    "xp": "PE"
  },
  "hero": {
    "learnWith": "IMPARA A DIGITARE CON",
    "allFingers": "TUTTE E 10 LE DITA",
    "levels": "LIVELLI",
    "cleared": "COMPLETATI",
    "bestCombo": "MIGLIOR COMBO"
  },
  "home": {
    "selectLevel": "SELEZIONA LIVELLO",
    "complete": "COMPLETATO",
    "allTiers": "TUTTI I LIVELLI",
    "yourProgress": "I TUOI PROGRESSI",
    "freeLevels": "LIVELLI GRATUITI",
    "premiumLevels": "LIVELLI PREMIUM",
    "themedLevels": "VELOCITA DEL PENSIERO",
    "freeLabel": "GRATIS",
    "premiumUnlocked": "PREMIUM SBLOCCATO"
  },
  "marketing": {
    "learnTwoSkills": "IMPARA DUE ABILITA INSIEME",
    "masterTypingWhile": "PADRONEGGIA LA VELOCITA DI BATTITURA MENTRE IMPARI:",
    "aiPrompting": "TECNICHE ESPERTE DI PROMPTING IA",
    "codingPatterns": "PATTERN DI CODIFICA PROFESSIONALI",
    "businessComm": "COMUNICAZIONE AZIENDALE",
    "tagline": "DIGITALO. IMPARALO. NON DIMENTICARLO MAI.",
    "unlockSpeed": "SBLOCCA LA DIGITAZIONE VELOCE COME IL PENSIERO"
  },
  "howToPlay": {
    "title": "COME GIOCARE",
    "learn": "IMPARA",
    "learnDesc": "OGNI LIVELLO INSEGNA NUOVI TASTI E POSIZIONI DELLE DITA",
    "battle": "COMBATTI",
    "battleDesc": "DIGITA VELOCEMENTE E COSTRUISCI COMBO PER SCONFIGGERE IL BOSS",
    "victory": "VITTORIA",
    "victoryDesc": "GUADAGNA PE, MONETE E SBLOCCA NUOVI LIVELLI"
  },
  "signup": {
    "unlockLevels": "SBLOCCA PIU LIVELLI!",
    "createFree": "CREA UN ACCOUNT GRATUITO PER CONTINUARE IL TUO VIAGGIO",
    "signUpFree": "REGISTRATI GRATIS",
    "guestAccess": "ACCESSO OSPITE: SOLO LIVELLI 1-2",
    "signUpToUnlock": "REGISTRATI PER SBLOCCARE TUTTI I LIVELLI",
    "wantToTry": "VUOI PROVARE PRIMA?",
    "continueAsGuest": "CONTINUA COME OSPITE",
    "levelsOnly": "(SOLO LIVELLI 1-2)"
  },
  "benefits": {
    "levels": "30 LIVELLI",
    "trackProgress": "TRACCIA PROGRESSI",
    "leaderboards": "CLASSIFICHE",
    "dailyStreaks": "SERIE GIORNALIERE"
  },
  "footer": {
    "copyright": "TYPEBIT8 © 2025",
    "practiceDaily": "PRATICA OGNI GIORNO PER I MIGLIORI RISULTATI",
    "impressum": "IMPRESSUM",
    "privacy": "PRIVACY",
    "terms": "TERMINI",
    "feedback": "HAI FEEDBACK O IDEE?",
    "feedbackDesc": "CI PIACEREBBE SENTIRTI! INVIACI I TUOI SUGGERIMENTI, SEGNALAZIONI BUG O RICHIESTE DI FUNZIONALITA.",
    "operator": "GESTITO DA STEININGER AG, ZUG, SVIZZERA"
  },
  "keyboard": {
    "title": "TASTIERA",
    "change": "CAMBIA"
  },
  "buttons": {
    "startPracticing": "INIZIA A PRATICARE"
  },
  "common": {
    "loading": "Caricamento...",
    "error": "Si e verificato un errore",
    "retry": "Riprova",
    "back": "Indietro",
    "next": "Avanti",
    "save": "Salva",
    "cancel": "Annulla",
    "close": "Chiudi",
    "yes": "Si",
    "no": "No"
  }
}
```

### 1.2 Spanish (es.json)

```json
{
  "header": {
    "title": "TYPEBIT8",
    "subtitle": "DOMINA EL TECLADO",
    "challenge": "DESAFIO",
    "premium": "PREMIUM",
    "level": "NIVEL",
    "xp": "PE"
  },
  "hero": {
    "learnWith": "APRENDE A ESCRIBIR CON",
    "allFingers": "LOS 10 DEDOS",
    "levels": "NIVELES",
    "cleared": "COMPLETADOS",
    "bestCombo": "MEJOR COMBO"
  },
  "home": {
    "selectLevel": "SELECCIONAR NIVEL",
    "complete": "COMPLETADO",
    "allTiers": "TODOS LOS NIVELES",
    "yourProgress": "TU PROGRESO",
    "freeLevels": "NIVELES GRATIS",
    "premiumLevels": "NIVELES PREMIUM",
    "themedLevels": "VELOCIDAD DEL PENSAMIENTO",
    "freeLabel": "GRATIS",
    "premiumUnlocked": "PREMIUM DESBLOQUEADO"
  },
  "marketing": {
    "learnTwoSkills": "APRENDE DOS HABILIDADES A LA VEZ",
    "masterTypingWhile": "DOMINA LA VELOCIDAD DE ESCRITURA MIENTRAS APRENDES:",
    "aiPrompting": "TECNICAS EXPERTAS DE PROMPTING IA",
    "codingPatterns": "PATRONES DE CODIGO PROFESIONALES",
    "businessComm": "COMUNICACION EMPRESARIAL",
    "tagline": "ESCRIBELO. APRENDELO. NUNCA LO OLVIDES.",
    "unlockSpeed": "DESBLOQUEA ESCRITURA VELOZ COMO EL PENSAMIENTO"
  },
  "howToPlay": {
    "title": "COMO JUGAR",
    "learn": "APRENDE",
    "learnDesc": "CADA NIVEL ENSENA NUEVAS TECLAS Y POSICIONES DE DEDOS",
    "battle": "BATALLA",
    "battleDesc": "ESCRIBE RAPIDO Y CONSTRUYE COMBOS PARA DERROTAR AL JEFE",
    "victory": "VICTORIA",
    "victoryDesc": "GANA PE, MONEDAS Y DESBLOQUEA NUEVOS NIVELES"
  },
  "signup": {
    "unlockLevels": "DESBLOQUEA MAS NIVELES!",
    "createFree": "CREA UNA CUENTA GRATIS PARA CONTINUAR TU VIAJE",
    "signUpFree": "REGISTRATE GRATIS",
    "guestAccess": "ACCESO INVITADO: SOLO NIVELES 1-2",
    "signUpToUnlock": "REGISTRATE PARA DESBLOQUEAR TODOS LOS NIVELES",
    "wantToTry": "QUIERES PROBAR PRIMERO?",
    "continueAsGuest": "CONTINUAR COMO INVITADO",
    "levelsOnly": "(SOLO NIVELES 1-2)"
  },
  "benefits": {
    "levels": "30 NIVELES",
    "trackProgress": "SEGUIR PROGRESO",
    "leaderboards": "CLASIFICACIONES",
    "dailyStreaks": "RACHAS DIARIAS"
  },
  "footer": {
    "copyright": "TYPEBIT8 © 2025",
    "practiceDaily": "PRACTICA DIARIAMENTE PARA MEJORES RESULTADOS",
    "impressum": "IMPRESSUM",
    "privacy": "PRIVACIDAD",
    "terms": "TERMINOS",
    "feedback": "TIENES COMENTARIOS O IDEAS?",
    "feedbackDesc": "NOS ENCANTARIA ESCUCHARTE! ENVIANOS TUS SUGERENCIAS, REPORTES DE ERRORES O SOLICITUDES DE FUNCIONES.",
    "operator": "OPERADO POR STEININGER AG, ZUG, SUIZA"
  },
  "keyboard": {
    "title": "TECLADO",
    "change": "CAMBIAR"
  },
  "buttons": {
    "startPracticing": "COMENZAR PRACTICA"
  },
  "common": {
    "loading": "Cargando...",
    "error": "Ocurrio un error",
    "retry": "Reintentar",
    "back": "Atras",
    "next": "Siguiente",
    "save": "Guardar",
    "cancel": "Cancelar",
    "close": "Cerrar",
    "yes": "Si",
    "no": "No"
  }
}
```

### 1.3 Portuguese (pt.json)

```json
{
  "header": {
    "title": "TYPEBIT8",
    "subtitle": "DOMINE O TECLADO",
    "challenge": "DESAFIO",
    "premium": "PREMIUM",
    "level": "NIVEL",
    "xp": "PE"
  },
  "hero": {
    "learnWith": "APRENDA A DIGITAR COM",
    "allFingers": "TODOS OS 10 DEDOS",
    "levels": "NIVEIS",
    "cleared": "CONCLUIDOS",
    "bestCombo": "MELHOR COMBO"
  },
  "home": {
    "selectLevel": "SELECIONAR NIVEL",
    "complete": "COMPLETO",
    "allTiers": "TODOS OS NIVEIS",
    "yourProgress": "SEU PROGRESSO",
    "freeLevels": "NIVEIS GRATIS",
    "premiumLevels": "NIVEIS PREMIUM",
    "themedLevels": "VELOCIDADE DO PENSAMENTO",
    "freeLabel": "GRATIS",
    "premiumUnlocked": "PREMIUM DESBLOQUEADO"
  },
  "marketing": {
    "learnTwoSkills": "APRENDA DUAS HABILIDADES DE UMA VEZ",
    "masterTypingWhile": "DOMINE A VELOCIDADE DE DIGITACAO ENQUANTO APRENDE:",
    "aiPrompting": "TECNICAS AVANCADAS DE PROMPTING IA",
    "codingPatterns": "PADROES PROFISSIONAIS DE CODIGO",
    "businessComm": "COMUNICACAO EMPRESARIAL",
    "tagline": "DIGITE. APRENDA. NUNCA ESQUECA.",
    "unlockSpeed": "DESBLOQUEIE DIGITACAO RAPIDA COMO O PENSAMENTO"
  },
  "howToPlay": {
    "title": "COMO JOGAR",
    "learn": "APRENDA",
    "learnDesc": "CADA NIVEL ENSINA NOVAS TECLAS E POSICOES DOS DEDOS",
    "battle": "BATALHE",
    "battleDesc": "DIGITE RAPIDO E CONSTRUA COMBOS PARA DERROTAR O CHEFE",
    "victory": "VITORIA",
    "victoryDesc": "GANHE PE, MOEDAS E DESBLOQUEIE NOVOS NIVEIS"
  },
  "signup": {
    "unlockLevels": "DESBLOQUEIE MAIS NIVEIS!",
    "createFree": "CRIE UMA CONTA GRATIS PARA CONTINUAR SUA JORNADA",
    "signUpFree": "CADASTRE-SE GRATIS",
    "guestAccess": "ACESSO CONVIDADO: APENAS NIVEIS 1-2",
    "signUpToUnlock": "CADASTRE-SE PARA DESBLOQUEAR TODOS OS NIVEIS",
    "wantToTry": "QUER EXPERIMENTAR PRIMEIRO?",
    "continueAsGuest": "CONTINUAR COMO CONVIDADO",
    "levelsOnly": "(APENAS NIVEIS 1-2)"
  },
  "benefits": {
    "levels": "30 NIVEIS",
    "trackProgress": "ACOMPANHAR PROGRESSO",
    "leaderboards": "CLASSIFICACOES",
    "dailyStreaks": "SEQUENCIAS DIARIAS"
  },
  "footer": {
    "copyright": "TYPEBIT8 © 2025",
    "practiceDaily": "PRATIQUE DIARIAMENTE PARA MELHORES RESULTADOS",
    "impressum": "IMPRESSUM",
    "privacy": "PRIVACIDADE",
    "terms": "TERMOS",
    "feedback": "TEM FEEDBACK OU IDEIAS?",
    "feedbackDesc": "ADORARIAMOS OUVIR VOCE! ENVIE SUAS SUGESTOES, RELATORIOS DE BUGS OU SOLICITACOES DE RECURSOS.",
    "operator": "OPERADO POR STEININGER AG, ZUG, SUICA"
  },
  "keyboard": {
    "title": "TECLADO",
    "change": "ALTERAR"
  },
  "buttons": {
    "startPracticing": "COMECAR PRATICA"
  },
  "common": {
    "loading": "Carregando...",
    "error": "Ocorreu um erro",
    "retry": "Tentar novamente",
    "back": "Voltar",
    "next": "Proximo",
    "save": "Salvar",
    "cancel": "Cancelar",
    "close": "Fechar",
    "yes": "Sim",
    "no": "Nao"
  }
}
```

---

## Part 2: Word Frequency Lists

### 2.1 Directory Structure

```
src/data/wordLists/
├── index.ts           # Word list loader
├── en.ts              # English words
├── de.ts              # German words
├── fr.ts              # French words
├── it.ts              # Italian words
├── es.ts              # Spanish words
└── pt.ts              # Portuguese words
```

### 2.2 Word List Format

Each word list contains:
- **tier1**: 100 most common words (beginner)
- **tier2**: 101-500 most common (intermediate)
- **tier3**: 501-1000 most common (advanced)
- **specialChars**: Words with language-specific characters

### 2.3 German Word List (de.ts)

```typescript
export const germanWords = {
  tier1: [
    'der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich',
    'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als',
    'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach',
    'wird', 'bei', 'einer', 'um', 'am', 'sind', 'noch', 'wie', 'einem', 'über',
    'einen', 'so', 'zum', 'kann', 'war', 'nur', 'bis', 'zur', 'durch', 'ihr',
    'seine', 'alle', 'oder', 'wenn', 'mehr', 'aber', 'schon', 'vor', 'dieser',
    'diesen', 'haben', 'habe', 'diese', 'zwischen', 'wurden', 'worden', 'wurde',
    'immer', 'wieder', 'seit', 'unter', 'während', 'andere', 'seiner', 'wir',
    'gegen', 'selbst', 'allem', 'zwei', 'sehr', 'hat', 'sein', 'muss', 'mich',
    'doch', 'Jahr', 'Jahren', 'heute', 'jedoch', 'ersten', 'Menschen', 'Teil'
  ],
  tier2: [
    'Stadt', 'Zeit', 'Leben', 'Seite', 'Land', 'Tag', 'Welt', 'Fall', 'Weg',
    'Frage', 'Ende', 'Hand', 'Bild', 'Arbeit', 'Grund', 'Frau', 'Mann', 'Kind',
    'Kopf', 'Stelle', 'Wort', 'Form', 'Problem', 'Beispiel', 'Punkt', 'Art',
    'Politik', 'Geschichte', 'Entwicklung', 'Prozent', 'Million', 'Euro',
    'System', 'Staat', 'Unternehmen', 'Gesellschaft', 'Regierung', 'Bereich',
    // ... add 400+ words
  ],
  umlauts: {
    ä: ['für', 'wäre', 'hätte', 'während', 'später', 'Länder', 'Männer', 'Wörter', 'Städte'],
    ö: ['können', 'möglich', 'schön', 'größer', 'hören', 'König', 'Völker', 'Töchter'],
    ü: ['für', 'über', 'würde', 'müssen', 'führen', 'natürlich', 'Glück', 'Brücke', 'Schlüssel'],
    ß: ['dass', 'groß', 'weiß', 'heißt', 'Straße', 'schließen', 'außen', 'Maß', 'Fuß']
  }
};
```

### 2.4 French Word List (fr.ts)

```typescript
export const frenchWords = {
  tier1: [
    'de', 'la', 'le', 'et', 'les', 'des', 'en', 'un', 'du', 'une',
    'que', 'est', 'pour', 'qui', 'dans', 'ce', 'il', 'pas', 'plus', 'par',
    'sur', 'ne', 'se', 'son', 'au', 'avec', 'tout', 'mais', 'nous', 'sa',
    'ou', 'comme', 'faire', 'lui', 'bien', 'ont', 'cette', 'leur', 'alors',
    'entre', 'sans', 'ans', 'aussi', 'peut', 'deux', 'ces', 'moi', 'donc',
    'je', 'vous', 'elle', 'tous', 'si', 'où', 'même', 'ses', 'fait', 'très',
    'ici', 'sont', 'été', 'dont', 'quand', 'autre', 'peu', 'après', 'temps',
    'avoir', 'être', 'ça', 'encore', 'là', 'rien', 'monde', 'toujours',
    'trop', 'sous', 'celui', 'dire', 'voir', 'jour', 'jamais', 'vie', 'vers'
  ],
  tier2: [
    'homme', 'femme', 'pays', 'travail', 'chose', 'ville', 'main', 'place',
    'moment', 'cas', 'point', 'partie', 'problème', 'question', 'politique',
    'histoire', 'développement', 'exemple', 'système', 'groupe', 'façon',
    // ... add 400+ words
  ],
  accents: {
    é: ['été', 'même', 'après', 'première', 'années', 'général', 'idée', 'vérité'],
    è: ['père', 'mère', 'très', 'après', 'problème', 'système', 'siècle', 'espère'],
    ê: ['être', 'même', 'tête', 'fête', 'forêt', 'fenêtre', 'bête', 'prêt'],
    à: ['à', 'là', 'déjà', 'voilà', 'au-delà', 'çà'],
    ç: ['ça', 'français', 'façon', 'reçu', 'leçon', 'garçon', 'commençant'],
    ù: ['où', 'coût', 'goût', 'août'],
    î: ['île', 'maître', 'naître', 'connaître', 'paraître'],
    ô: ['hôtel', 'côté', 'rôle', 'bientôt', 'plutôt']
  }
};
```

### 2.5 Spanish Word List (es.ts)

```typescript
export const spanishWords = {
  tier1: [
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'se', 'del',
    'las', 'un', 'por', 'con', 'no', 'una', 'su', 'para', 'es', 'al',
    'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'si',
    'porque', 'esta', 'entre', 'cuando', 'muy', 'sin', 'sobre', 'también',
    'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante',
    'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante',
    'ellos', 'e', 'esto', 'mi', 'antes', 'algunos', 'qué', 'unos', 'yo',
    'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes'
  ],
  tier2: [
    'tiempo', 'vida', 'día', 'mundo', 'caso', 'parte', 'gobierno', 'país',
    'lugar', 'mismo', 'años', 'forma', 'trabajo', 'hombre', 'momento',
    'punto', 'ciudad', 'ejemplo', 'grupo', 'agua', 'casa', 'estado',
    // ... add 400+ words
  ],
  special: {
    ñ: ['año', 'niño', 'España', 'español', 'señor', 'pequeño', 'mañana', 'sueño'],
    á: ['más', 'está', 'también', 'así', 'días', 'todavía', 'aquí', 'podrá'],
    é: ['qué', 'también', 'después', 'interés', 'través', 'José', 'sé'],
    í: ['así', 'aquí', 'mí', 'país', 'allí', 'todavía', 'día', 'había'],
    ó: ['sólo', 'cómo', 'político', 'económico', 'información', 'comunicación'],
    ú: ['según', 'único', 'común', 'algún', 'ningún', 'público', 'música']
  }
};
```

### 2.6 Italian Word List (it.ts)

```typescript
export const italianWords = {
  tier1: [
    'di', 'che', 'e', 'la', 'il', 'un', 'a', 'è', 'per', 'in',
    'una', 'mi', 'sono', 'ho', 'non', 'ma', 'lo', 'ha', 'le', 'si',
    'con', 'cosa', 'come', 'io', 'questo', 'ti', 'da', 'se', 'no', 'più',
    'ci', 'qui', 'lei', 'lui', 'al', 'del', 'bene', 'tutto', 'della', 'dei',
    'solo', 'anche', 'quando', 'ora', 'stato', 'così', 'sì', 'mio', 'chi',
    'suo', 'tu', 'fatto', 'loro', 'poi', 'essere', 'dove', 'fare', 'perché',
    'anni', 'ancora', 'detto', 'quella', 'quello', 'mai', 'molto', 'tempo',
    'dopo', 'prima', 'quella', 'grande', 'stesso', 'vita', 'può', 'sempre'
  ],
  tier2: [
    'casa', 'mondo', 'uomo', 'donna', 'anno', 'giorno', 'volta', 'parte',
    'modo', 'mano', 'occhi', 'momento', 'paese', 'lavoro', 'storia', 'punto',
    // ... add 400+ words
  ],
  accents: {
    à: ['già', 'città', 'là', 'metà', 'verità', 'qualità', 'libertà', 'realtà'],
    è: ['è', 'perché', 'cioè', 'caffè', 'però', 'piè', 'ahimè'],
    é: ['perché', 'poiché', 'affinché', 'né', 'sé', 'ventitré'],
    ì: ['così', 'lì', 'sì', 'lunedì', 'martedì', 'mercoledì'],
    ò: ['però', 'ciò', 'può', 'falò', 'rococò'],
    ù: ['più', 'già', 'su', 'laggiù', 'quaggiù', 'gioventù']
  }
};
```

### 2.7 Portuguese Word List (pt.ts)

```typescript
export const portugueseWords = {
  tier1: [
    'de', 'que', 'e', 'o', 'a', 'do', 'da', 'em', 'um', 'para',
    'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais',
    'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à',
    'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está',
    'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre',
    'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas',
    'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num',
    'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas'
  ],
  tier2: [
    'tempo', 'anos', 'governo', 'dia', 'país', 'mundo', 'vez', 'parte',
    'caso', 'cidade', 'lugar', 'trabalho', 'pessoa', 'vida', 'momento',
    // ... add 400+ words
  ],
  special: {
    ã: ['não', 'então', 'são', 'mão', 'irmã', 'manhã', 'alemã', 'cidadã'],
    õ: ['não', 'ações', 'milhões', 'opções', 'relações', 'informações'],
    á: ['já', 'está', 'será', 'água', 'família', 'política', 'história'],
    é: ['é', 'até', 'você', 'também', 'café', 'além', 'através', 'porém'],
    í: ['aí', 'país', 'saí', 'raíz', 'saúde', 'contribuí'],
    ó: ['só', 'nós', 'avó', 'pó', 'cipó', 'dominó'],
    ú: ['saúde', 'último', 'único', 'número', 'público', 'músicas'],
    ç: ['ação', 'coração', 'informação', 'situação', 'comunicação', 'educação']
  }
};
```

---

## Part 3: Localized Lesson Content

### 3.1 French Lessons (levels-fr.ts)

```typescript
import type { Lesson, FingerType } from "../types";

const ALL_FINGERS: FingerType[] = [
  "left-pinky", "left-ring", "left-middle", "left-index",
  "right-index", "right-middle", "right-ring", "right-pinky", "thumb"
];

const FRENCH_KEYBOARD = [
  "a", "z", "e", "r", "t", "y", "u", "i", "o", "p",
  "q", "s", "d", "f", "g", "h", "j", "k", "l", "m",
  "w", "x", "c", "v", "b", "n", ",", ";", ":", "!",
  " ", "é", "è", "à", "ç", "ù"
];

export const levelsFR: Lesson[] = [
  {
    id: 31,
    title: "Prompts IA Simples",
    description: "Prompts IA de base en français",
    concept: `Bienvenue dans les prompts IA en français!

    Apprenez les bases du prompting tout en améliorant votre vitesse de frappe.
    Ces exercices contiennent les accents français typiques (é, è, ê, à, ç).

    Tapez-le. Apprenez-le. Ne l'oubliez jamais.`,
    keys: FRENCH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Explique-moi ce concept en mots simples",
      "Écris un court résumé sur ce sujet",
      "Crée une liste de cinq idées pour",
      "Traduis le texte suivant en français",
      "Quels sont les avantages et inconvénients de",
      "Donne-moi trois exemples de",
      "Décris la différence entre A et B",
      "Explique cela comme à un enfant",
      "Résume le texte en une phrase",
      "Écris-moi un guide simple pour"
    ],
    quizWords: ["explique", "concept", "résumé", "sujet", "traduis", "exemples", "différence"],
    minWPM: 25,
    minAccuracy: 88
  },
  {
    id: 32,
    title: "Prompts Avancés",
    description: "Formuler des requêtes IA professionnelles",
    concept: `Maintenant les prompts deviennent plus complexes!

    Les prompts professionnels nécessitent des formulations précises.
    Apprenez les modèles utilisés par les experts en IA.`,
    keys: FRENCH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Écris en tant qu'ingénieur logiciel senior une revue de code",
      "Rédige un email professionnel en français",
      "Crée un plan marketing pour une startup SaaS B2B",
      "Analyse les forces et faiblesses de cette approche",
      "Formule un refus poli pour la réunion",
      "Développe une stratégie d'acquisition client",
      "Rédige un texte de description produit convaincant",
      "Crée une présentation sur le développement durable",
      "Écris un article de blog sur l'intelligence artificielle",
      "Rédige une candidature pour le poste de chef de projet"
    ],
    quizWords: ["professionnel", "marketing", "forces", "faiblesses", "stratégie", "convaincant", "artificielle"],
    minWPM: 28,
    minAccuracy: 88
  }
];
```

### 3.2 Spanish Lessons (levels-es.ts)

```typescript
import type { Lesson, FingerType } from "../types";

const ALL_FINGERS: FingerType[] = [
  "left-pinky", "left-ring", "left-middle", "left-index",
  "right-index", "right-middle", "right-ring", "right-pinky", "thumb"
];

const SPANISH_KEYBOARD = [
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
  "a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ",
  "z", "x", "c", "v", "b", "n", "m", ",", ".", "-",
  " ", "á", "é", "í", "ó", "ú", "ü"
];

export const levelsES: Lesson[] = [
  {
    id: 31,
    title: "Prompts IA Simples",
    description: "Prompts básicos de IA en español",
    concept: `¡Bienvenido a los prompts de IA en español!

    Aprende los fundamentos del prompting mientras mejoras tu velocidad de escritura.
    Estos ejercicios incluyen caracteres especiales del español (ñ, á, é, í, ó, ú).

    Escríbelo. Apréndelo. Nunca lo olvides.`,
    keys: SPANISH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Explícame este concepto en palabras simples",
      "Escribe un breve resumen sobre este tema",
      "Crea una lista de cinco ideas para",
      "Traduce el siguiente texto al español",
      "¿Cuáles son las ventajas y desventajas de?",
      "Dame tres ejemplos de",
      "Describe la diferencia entre A y B",
      "Explica esto como si fuera para un niño",
      "Resume el texto en una oración",
      "Escríbeme una guía simple para"
    ],
    quizWords: ["explícame", "concepto", "resumen", "tema", "ventajas", "ejemplos", "diferencia"],
    minWPM: 25,
    minAccuracy: 88
  },
  {
    id: 32,
    title: "Prompts Avanzados",
    description: "Formular solicitudes profesionales de IA",
    concept: `¡Ahora los prompts se vuelven más complejos!

    Los prompts profesionales requieren formulaciones precisas.
    Aprende los patrones que usan los expertos en IA.`,
    keys: SPANISH_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Escribe como ingeniero de software senior una revisión de código",
      "Redacta un correo electrónico profesional en español",
      "Crea un plan de marketing para una startup SaaS B2B",
      "Analiza las fortalezas y debilidades de este enfoque",
      "Formula un rechazo cortés para la reunión",
      "Desarrolla una estrategia de adquisición de clientes",
      "Escribe un texto de descripción de producto convincente",
      "Crea una presentación sobre sostenibilidad",
      "Escribe un artículo de blog sobre inteligencia artificial",
      "Redacta una solicitud para el puesto de gerente de proyecto"
    ],
    quizWords: ["profesional", "marketing", "fortalezas", "debilidades", "estrategia", "convincente", "artificial"],
    minWPM: 28,
    minAccuracy: 88
  }
];
```

### 3.3 Italian Lessons (levels-it.ts)

```typescript
import type { Lesson, FingerType } from "../types";

const ALL_FINGERS: FingerType[] = [
  "left-pinky", "left-ring", "left-middle", "left-index",
  "right-index", "right-middle", "right-ring", "right-pinky", "thumb"
];

const ITALIAN_KEYBOARD = [
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
  "a", "s", "d", "f", "g", "h", "j", "k", "l", "ò",
  "z", "x", "c", "v", "b", "n", "m", ",", ".", "-",
  " ", "à", "è", "é", "ì", "ù"
];

export const levelsIT: Lesson[] = [
  {
    id: 31,
    title: "Prompt IA Semplici",
    description: "Prompt IA di base in italiano",
    concept: `Benvenuto nei prompt IA in italiano!

    Impara le basi del prompting mentre migliori la tua velocità di battitura.
    Questi esercizi contengono gli accenti italiani tipici (à, è, é, ì, ò, ù).

    Digitalo. Imparalo. Non dimenticarlo mai.`,
    keys: ITALIAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Spiegami questo concetto in parole semplici",
      "Scrivi un breve riassunto su questo argomento",
      "Crea una lista di cinque idee per",
      "Traduci il seguente testo in italiano",
      "Quali sono i vantaggi e gli svantaggi di",
      "Dammi tre esempi di",
      "Descrivi la differenza tra A e B",
      "Spiega questo come se fosse per un bambino",
      "Riassumi il testo in una frase",
      "Scrivimi una guida semplice per"
    ],
    quizWords: ["spiegami", "concetto", "riassunto", "argomento", "vantaggi", "esempi", "differenza"],
    minWPM: 25,
    minAccuracy: 88
  },
  {
    id: 32,
    title: "Prompt Avanzati",
    description: "Formulare richieste IA professionali",
    concept: `Ora i prompt diventano più complessi!

    I prompt professionali richiedono formulazioni precise.
    Impara i modelli usati dagli esperti di IA.`,
    keys: ITALIAN_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Scrivi come ingegnere software senior una revisione del codice",
      "Redigi un'email professionale in italiano",
      "Crea un piano marketing per una startup SaaS B2B",
      "Analizza i punti di forza e debolezza di questo approccio",
      "Formula un rifiuto cortese per la riunione",
      "Sviluppa una strategia di acquisizione clienti",
      "Scrivi un testo di descrizione prodotto convincente",
      "Crea una presentazione sulla sostenibilità",
      "Scrivi un articolo di blog sull'intelligenza artificiale",
      "Redigi una candidatura per la posizione di project manager"
    ],
    quizWords: ["professionale", "marketing", "forza", "debolezza", "strategia", "convincente", "artificiale"],
    minWPM: 28,
    minAccuracy: 88
  }
];
```

### 3.4 Portuguese Lessons (levels-pt.ts)

```typescript
import type { Lesson, FingerType } from "../types";

const ALL_FINGERS: FingerType[] = [
  "left-pinky", "left-ring", "left-middle", "left-index",
  "right-index", "right-middle", "right-ring", "right-pinky", "thumb"
];

const PORTUGUESE_KEYBOARD = [
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
  "a", "s", "d", "f", "g", "h", "j", "k", "l", "ç",
  "z", "x", "c", "v", "b", "n", "m", ",", ".", "-",
  " ", "á", "é", "í", "ó", "ú", "ã", "õ", "â", "ê", "ô"
];

export const levelsPT: Lesson[] = [
  {
    id: 31,
    title: "Prompts IA Simples",
    description: "Prompts básicos de IA em português",
    concept: `Bem-vindo aos prompts de IA em português!

    Aprenda os fundamentos do prompting enquanto melhora sua velocidade de digitação.
    Estes exercícios contêm caracteres especiais do português (ç, ã, õ, á, é, í, ó, ú).

    Digite. Aprenda. Nunca esqueça.`,
    keys: PORTUGUESE_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Explique-me este conceito em palavras simples",
      "Escreva um breve resumo sobre este tema",
      "Crie uma lista de cinco ideias para",
      "Traduza o seguinte texto para português",
      "Quais são as vantagens e desvantagens de",
      "Dê-me três exemplos de",
      "Descreva a diferença entre A e B",
      "Explique isso como se fosse para uma criança",
      "Resuma o texto em uma frase",
      "Escreva-me um guia simples para"
    ],
    quizWords: ["explique", "conceito", "resumo", "tema", "vantagens", "exemplos", "diferença"],
    minWPM: 25,
    minAccuracy: 88
  },
  {
    id: 32,
    title: "Prompts Avançados",
    description: "Formular solicitações profissionais de IA",
    concept: `Agora os prompts ficam mais complexos!

    Prompts profissionais requerem formulações precisas.
    Aprenda os padrões usados pelos especialistas em IA.`,
    keys: PORTUGUESE_KEYBOARD,
    fingers: ALL_FINGERS,
    exercises: [
      "Escreva como engenheiro de software sênior uma revisão de código",
      "Redija um e-mail profissional em português",
      "Crie um plano de marketing para uma startup SaaS B2B",
      "Analise os pontos fortes e fracos desta abordagem",
      "Formule uma recusa educada para a reunião",
      "Desenvolva uma estratégia de aquisição de clientes",
      "Escreva um texto de descrição de produto convincente",
      "Crie uma apresentação sobre sustentabilidade",
      "Escreva um artigo de blog sobre inteligência artificial",
      "Redija uma candidatura para o cargo de gerente de projetos"
    ],
    quizWords: ["profissional", "marketing", "fortes", "fracos", "estratégia", "convincente", "artificial"],
    minWPM: 28,
    minAccuracy: 88
  }
];
```

---

## Part 4: Updated Lesson Loader

### 4.1 Enhanced lessonLoader.ts

```typescript
/**
 * PRP-050: Comprehensive Localized Lesson Loader
 *
 * Loads lesson content based on the user's selected language.
 * Supports: EN, DE, FR, IT, ES, PT
 */

import { levels as levelsEN } from './levels';
import { levelsDE } from './levels-de';
import { levelsFR } from './levels-fr';
import { levelsIT } from './levels-it';
import { levelsES } from './levels-es';
import { levelsPT } from './levels-pt';
import type { Lesson } from '../types';
import type { SupportedLanguage } from '../i18n/constants';

// Map of available lesson content by language
const lessonsByLanguage: Record<SupportedLanguage, Lesson[]> = {
  en: levelsEN,
  de: levelsDE,
  fr: levelsFR,
  it: levelsIT,
  es: levelsES,
  pt: levelsPT,
};

/**
 * Get lessons for the specified language.
 * Falls back to English if no translations available.
 */
export function getLessonsForLanguage(language: SupportedLanguage): Lesson[] {
  const lessons = lessonsByLanguage[language];

  if (lessons && lessons.length > 0) {
    return lessons;
  }

  // Fallback to English
  return levelsEN;
}

/**
 * Get a specific lesson by ID for the given language.
 */
export function getLessonById(id: number, language: SupportedLanguage): Lesson | undefined {
  const lessons = getLessonsForLanguage(language);
  let lesson = lessons.find(l => l.id === id);

  // Fallback to English if not found
  if (!lesson) {
    lesson = levelsEN.find(l => l.id === id);
  }

  return lesson;
}

/**
 * Get themed lessons (31-50) for a specific language.
 */
export function getThemedLessons(language: SupportedLanguage): Lesson[] {
  const lessons = getLessonsForLanguage(language);
  return lessons.filter(l => l.id >= 31);
}

/**
 * Check if a lesson has native content for the given language.
 */
export function hasNativeContent(id: number, language: SupportedLanguage): boolean {
  const lessons = lessonsByLanguage[language];
  if (!lessons) return false;
  return lessons.some(l => l.id === id);
}

/**
 * Get available languages that have lesson content.
 */
export function getLanguagesWithContent(): SupportedLanguage[] {
  return Object.entries(lessonsByLanguage)
    .filter(([_, lessons]) => lessons && lessons.length > 0)
    .map(([lang]) => lang as SupportedLanguage);
}
```

---

## Part 5: Component Updates Required

### 5.1 Files Requiring Translation Integration

| File | Priority | Strings to Extract |
|------|----------|-------------------|
| `src/components/LessonCard.tsx` | High | Level names, status |
| `src/components/LessonView.tsx` | High | Instructions, feedback |
| `src/components/SpeedTest.tsx` | High | Instructions, results |
| `src/components/CollapsedHero.tsx` | High | CTA text |
| `src/components/Shop.tsx` | Medium | Item names, prices |
| `src/components/PremiumPage.tsx` | Medium | Features, pricing |
| `src/components/Leaderboard.tsx` | Medium | Headers, ranks |
| `src/components/DailyChallengeView.tsx` | Medium | Instructions |
| `src/components/GuestBanner.tsx` | Low | CTA text |
| `src/components/CookieConsent.tsx` | Low | Consent text |

### 5.2 Pattern for Component Translation

```tsx
// Before
function MyComponent() {
  return <h1>Welcome to the Game!</h1>;
}

// After
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
}
```

---

## Part 6: Implementation Checklist

### Phase 1: Translation Files (Day 1-2)
- [ ] Create `it.json` with all keys
- [ ] Create `es.json` with all keys
- [ ] Create `pt.json` with all keys
- [ ] Update `fr.json` to match new format
- [ ] Add remaining App.tsx strings to all files
- [ ] Update LanguageSwitcher to show all 5 languages

### Phase 2: Word Lists (Day 3-4)
- [ ] Create `src/data/wordLists/` directory
- [ ] Create `en.ts` with English word list
- [ ] Create `de.ts` with German word list
- [ ] Create `fr.ts` with French word list
- [ ] Create `it.ts` with Italian word list
- [ ] Create `es.ts` with Spanish word list
- [ ] Create `pt.ts` with Portuguese word list
- [ ] Create `index.ts` loader

### Phase 3: Lesson Content (Day 5-7)
- [ ] Create `levels-fr.ts` with French lessons
- [ ] Create `levels-it.ts` with Italian lessons
- [ ] Create `levels-es.ts` with Spanish lessons
- [ ] Create `levels-pt.ts` with Portuguese lessons
- [ ] Update `lessonLoader.ts` to include all languages
- [ ] Test lesson loading for each language

### Phase 4: Component Updates (Day 8-10)
- [ ] Add translations to LessonCard
- [ ] Add translations to LessonView
- [ ] Add translations to SpeedTest
- [ ] Add translations to CollapsedHero
- [ ] Add translations to Shop
- [ ] Add translations to PremiumPage
- [ ] Add translations to remaining components

### Phase 5: Testing & Polish (Day 11-12)
- [ ] Test all 5 languages end-to-end
- [ ] Verify special characters display correctly
- [ ] Test keyboard layout suggestions per language
- [ ] Fix any missing/broken translations
- [ ] Performance testing with lazy loading

---

## Part 7: Quality Checklist

### For Each Language
- [ ] All UI strings translated
- [ ] Translations reviewed by native speaker
- [ ] Special characters display correctly
- [ ] Typing exercises use common words
- [ ] Keyboard layout correctly suggested
- [ ] Progress persists across sessions
- [ ] Lessons load without errors

### Technical Requirements
- [ ] No console errors in any language
- [ ] Translation files < 50KB each
- [ ] Lazy loading working for lesson files
- [ ] localStorage persistence working
- [ ] Fallback to English working

---

## Summary

This extension provides everything needed for a **fully professional multilingual typing application**:

1. **Complete UI Translations** for EN, DE, FR, IT, ES, PT
2. **Word Frequency Lists** with special characters for each language
3. **Localized Lesson Content** for themed levels (31-50)
4. **Enhanced Lesson Loader** with fallback support
5. **Detailed Implementation Checklist** with priorities

The hybrid approach ensures:
- Native speakers get natural content
- Development effort is minimized
- Quality is maintained across all languages
- The app feels professional in every language
