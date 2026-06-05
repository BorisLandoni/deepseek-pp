// Floating pet dialogue dictionary.
// Lines translated from the original Chinese to Italian and English.
// Success/error/sleepy lines are original creative additions.

import type { Language } from '../i18n/translations';

export type PetState =
  | 'idle'
  | 'thinking'
  | 'speaking'
  | 'working'
  | 'confused'
  | 'success'
  | 'error'
  | 'sleepy';

const PET_LINES_IT: Record<PetState, readonly string[]> = {
  thinking: [
    'Riflettendo…',
    'Ponderando…',
    'Ci sto pensando',
    'Un attimo…',
    'Meditando…',
    'Valutando…',
    'Concentrato',
    'Analizzando…',
    'Decifrando…',
    'Usando il cervello',
    'Ragionando…',
    'Sintesi in corso',
    'Momento filosofico',
    'Grande riflessione',
    'Valutando opzioni',
    'Decodificando…',
    'Considerando…',
    'Cercando ispirazione',
  ],
  working: [
    'Al lavoro',
    'Rifinendo…',
    'Creando…',
    'Forgiando…',
    'Prendendo forma',
    'Generando…',
    'A pieno ritmo',
    'Scricchiolando…',
    'In funzione…',
    'Lavorando sodo',
    'Manifestando…',
    'Domare il codice',
    'In incubazione…',
    'Lanciando magie',
    'Sistemando…',
    'Mixando…',
    'Ronzando…',
    'Calcolando…',
    'Elaborando…',
    'Processando…',
    'Trasformando…',
    'Spostando dati',
    'Tessendo…',
    'Condensando…',
    'Germogliando…',
    'Cuocendo a fuoco lento',
    'Sobbollendo…',
    'A fiamma bassa',
    'In fermentazione…',
    'Marinando…',
  ],
  speaking: [
    'Comunicando…',
    'Spiegando…',
    'Dispiegando…',
    'Svelando…',
    'Ispirazione!',
    'Immaginando…',
    'Descrivendo…',
    'Oracolando…',
    'Incantando…',
    'Al lavoro…',
  ],
  idle: [
    'In giro',
    'Toccami!',
    'Passeggiando…',
    'Rilassato',
    'Vagabondando',
    'Nel vuoto…',
    'Dondolando…',
    'Contorcendomi',
    'Occupato con niente',
    'Canticchiando…',
  ],
  confused: [
    'Cortocircuito',
    'Riorganizzando…',
    'Blabla…',
    'Oscillando…',
    'Cercando la via',
  ],
  success: [
    'Fatto!',
    'Completato!',
    'Risolto!',
    'Perfetto!',
    'Finito!',
    'Magnifico!',
    'Missione compiuta!',
  ],
  error: [
    'Bloccato…',
    'Ops, errore',
    'Muro colpito',
    'Logica assente',
    'Ribaltato…',
    'Sistema in crash',
  ],
  sleepy: [
    'Zzz…',
    'Sonnolento…',
    'Un pisolino',
    'Sognando…',
    'Sotto le coperte',
  ],
};

const PET_LINES_EN: Record<PetState, readonly string[]> = {
  thinking: [
    'Pondering…',
    'Mulling it over',
    'Deep in thought',
    'Just a moment…',
    'Meditating…',
    'Deliberating…',
    'Focused…',
    'Analysing…',
    'Deciphering…',
    'Brain engaged',
    'Reasoning…',
    'Synthesising…',
    'Philosophical moment',
    'Big thinks…',
    'Weighing options',
    'Decoding…',
    'Considering…',
    'Seeking inspiration',
  ],
  working: [
    'Working…',
    'Crafting…',
    'Creating…',
    'Forging…',
    'Taking shape',
    'Generating…',
    'Full steam ahead',
    'Crunching…',
    'Running…',
    'Hard at work',
    'Manifesting…',
    'Taming the code',
    'Incubating…',
    'Casting spells',
    'Tinkering…',
    'Blending…',
    'Humming along',
    'Calculating…',
    'Computing…',
    'Processing…',
    'Transmuting…',
    'Hauling data',
    'Weaving…',
    'Condensing…',
    'Sprouting…',
    'Baking…',
    'Simmering…',
    'Slow cooking',
    'Brewing…',
    'Marinating…',
  ],
  speaking: [
    'Channelling…',
    'Explaining…',
    'Unfolding…',
    'Unravelling…',
    'Inspiration!',
    'Imagining…',
    'Describing…',
    'Divining…',
    'Casting…',
    'On it…',
  ],
  idle: [
    'Playing…',
    'Poke me!',
    'Strolling…',
    'Taking it easy',
    'Wandering…',
    'Zoning out…',
    'Swaying…',
    'Wiggling…',
    'Doing nothing',
    'Humming…',
  ],
  confused: [
    'Brain glitch',
    'Reorganising…',
    'Babbling…',
    'Swaying…',
    'Finding the way',
  ],
  success: [
    'Done!',
    'Nailed it!',
    'Sorted!',
    'Perfect!',
    'Finished!',
    'Beautiful!',
    'Mission complete!',
  ],
  error: [
    'Stuck…',
    'Oops, error',
    'Hit a wall',
    'Logic escaped',
    'Crashed…',
    'System hiccup',
  ],
  sleepy: [
    'Zzz…',
    'Getting sleepy…',
    'Quick nap',
    'Daydreaming…',
    'Under the covers',
  ],
};

export const PET_LINES_BY_LANG: Record<Language, Record<PetState, readonly string[]>> = {
  it: PET_LINES_IT,
  en: PET_LINES_EN,
};

// Default export for backwards compatibility — uses English
export const PET_LINES: Record<PetState, readonly string[]> = PET_LINES_EN;

/**
 * Pick a random line for the given state and language, avoiding recent repeats.
 * @param state   Current pet state
 * @param lang    UI language ('it' | 'en')
 * @param recent  Recently shown lines (for de-duplication)
 */
export function pickPetLine(state: PetState, lang: Language = 'en', recent: readonly string[] = []): string {
  const pool = PET_LINES_BY_LANG[lang]?.[state] ?? PET_LINES_EN[state];
  if (!pool || pool.length === 0) return '';

  const fresh = pool.filter((line) => !recent.includes(line));
  const candidates = fresh.length > 0 ? fresh : pool;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}
