/**
 * Deterministic, code-calculated call analytics directly from the conversation transcript.
 * Zero token cost, 100% predictable and reproducible.
 */

export interface TranscriptLine {
  role: 'user' | 'agent' | 'ai' | 'prospect' | string;
  text: string;
}

export interface CallAnalyticsResult {
  durationSeconds: number;
  totalWords: number;
  userWords: number;
  prospectWords: number;
  userSpeechRatio: number; // percentage (0-100)
  prospectSpeechRatio: number; // percentage (0-100)
  userWpm: number; // words per minute
  fillerWordsCount: number;
  fillerWordsFound: Array<{ word: string; count: number }>;
  interruptionsEstimated: number;
  pacingFeedback: {
    status: 'optimal' | 'fast' | 'slow';
    label: string;
    description: string;
  };
  balanceFeedback: {
    status: 'optimal' | 'talkative' | 'passive';
    label: string;
    description: string;
  };
}

// Common filler words in sales calls (Spanish and English)
const FILLER_PATTERNS: Array<{ regex: RegExp; display: string }> = [
  // Spanish
  { regex: /\b(eh+|ehh+)\b/gi, display: 'eh / ehh' },
  { regex: /\b(este+|estee+)\b/gi, display: 'este...' },
  { regex: /\b(o sea|osea)\b/gi, display: 'o sea' },
  { regex: /\b(digamos)\b/gi, display: 'digamos' },
  { regex: /\b(b[aá]sicamente)\b/gi, display: 'básicamente' },
  { regex: /\b(me entiendes|si me entiendes)\b/gi, display: '¿me entiendes?' },
  { regex: /\b(la verdad|la verdad es que)\b/gi, display: 'la verdad...' },
  { regex: /\b(como que)\b/gi, display: 'como que' },
  // English
  { regex: /\b(um+|uh+)\b/gi, display: 'um / uh' },
  { regex: /\b(you know)\b/gi, display: 'you know' },
  { regex: /\b(like)\b/gi, display: 'like' },
  { regex: /\b(sort of|kind of)\b/gi, display: 'kind of' },
];

/**
 * Calculates objective metrics from transcript lines and call duration.
 */
export function calculateTranscriptMetrics(
  transcripts: TranscriptLine[],
  durationSeconds: number = 60
): CallAnalyticsResult {
  const safeDuration = Math.max(durationSeconds, 1);
  const minutes = safeDuration / 60;

  let userWords = 0;
  let prospectWords = 0;
  let userTurns = 0;
  let prospectTurns = 0;
  let interruptions = 0;

  const fillerCounts: Record<string, number> = {};

  transcripts.forEach((line, idx) => {
    const isUser = line.role === 'user';
    const text = (line.text || '').trim();
    if (!text) return;

    // Word count by splitting whitespace
    const words = text.split(/\s+/).filter(Boolean);
    const count = words.length;

    if (isUser) {
      userWords += count;
      userTurns++;

      // Scan for filler words in rep's turns
      FILLER_PATTERNS.forEach(({ regex, display }) => {
        const matches = text.match(regex);
        if (matches) {
          fillerCounts[display] = (fillerCounts[display] || 0) + matches.length;
        }
      });

      // Quick interrupt heuristic: very short turn (< 3 words) immediately following prospect turn
      if (count <= 3 && idx > 0 && transcripts[idx - 1].role !== 'user') {
        const prevText = transcripts[idx - 1].text || '';
        if (prevText.length > 20) {
          interruptions++;
        }
      }
    } else {
      prospectWords += count;
      prospectTurns++;
    }
  });

  const totalWords = userWords + prospectWords;
  const userSpeechRatio = totalWords > 0 ? Math.round((userWords / totalWords) * 100) : 50;
  const prospectSpeechRatio = 100 - userSpeechRatio;

  // Words per minute for rep
  const userWpm = Math.round(userWords / minutes);

  // Pacing diagnosis (sales standard: 130 - 165 WPM is ideal)
  let pacingFeedback: CallAnalyticsResult['pacingFeedback'] = {
    status: 'optimal',
    label: 'Ritmo adecuado',
    description: `${userWpm} PPM: Hablas con cadencia clara y profesional.`
  };

  if (userWpm > 175) {
    pacingFeedback = {
      status: 'fast',
      label: 'Ritmo acelerado',
      description: `${userWpm} PPM: Hablas demasiado rápido; dale espacio al comprador para responder.`
    };
  } else if (userWpm < 110 && userWords > 15) {
    pacingFeedback = {
      status: 'slow',
      label: 'Ritmo pausado',
      description: `${userWpm} PPM: Pausas algo prolongadas. Proyecta mayor dinamismo comercial.`
    };
  }

  // Talk/Listen ratio diagnosis (ideal acquisition: 40-50% rep, 50-60% prospect listening)
  let balanceFeedback: CallAnalyticsResult['balanceFeedback'] = {
    status: 'optimal',
    label: 'Balance óptimo',
    description: `${userSpeechRatio}% tú / ${prospectSpeechRatio}% cliente: Escucha activa balanceada.`
  };

  if (userSpeechRatio > 65) {
    balanceFeedback = {
      status: 'talkative',
      label: 'Monopolio de palabra',
      description: `${userSpeechRatio}% tú: Hablaste de más; haz preguntas cortas y deja que el cliente explique su flota.`
    };
  } else if (userSpeechRatio < 30 && totalWords > 20) {
    balanceFeedback = {
      status: 'passive',
      label: 'Poca argumentación',
      description: `${userSpeechRatio}% tú: Faltó presentar los diferenciadores JYC (pago en 24h y maniobra técnica).`
    };
  }

  // Format filler words array
  const fillerWordsFound = Object.entries(fillerCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const totalFillers = fillerWordsFound.reduce((sum, item) => sum + item.count, 0);

  return {
    durationSeconds: safeDuration,
    totalWords,
    userWords,
    prospectWords,
    userSpeechRatio,
    prospectSpeechRatio,
    userWpm,
    fillerWordsCount: totalFillers,
    fillerWordsFound,
    interruptionsEstimated: interruptions,
    pacingFeedback,
    balanceFeedback
  };
}
