import { HistoryItem } from '../types';
import { SCENARIOS } from '../data/scenarios';

export type LevelStage = 'facil' | 'medio' | 'dificil' | 'jefe_final';

export interface LevelStageConfig {
  id: LevelStage;
  label: string;
  tag: string;
  personaType: string;
  description: string;
  minScoreToUnlock: number;
}

export const LEVEL_STAGES: LevelStageConfig[] = [
  {
    id: 'facil',
    label: 'Nivel 1: Fácil',
    tag: 'Receptivo',
    personaType: 'Dueño amable y colaborador',
    description: 'El cliente tiene tiempo para hablar, escucha con atención y responde a tus preguntas de calificación.',
    minScoreToUnlock: 0,
  },
  {
    id: 'medio',
    label: 'Nivel 2: Medio',
    tag: 'Filtro / Ocupado',
    personaType: 'Secretaria o recepcionista (Gatekeeper difícil)',
    description: 'Intenta filtrar tu llamada diciendo que no hay nadie disponible o que mandes un correo.',
    minScoreToUnlock: 70,
  },
  {
    id: 'dificil',
    label: 'Nivel 3: Difícil',
    tag: 'Escéptico / Apurado',
    personaType: 'Comprador apurado que exige precio inmediato',
    description: 'Te presiona: "Dime cuánto pagas o cuelgo". Debes desviar al valor técnico sin dar precio a ciegas.',
    minScoreToUnlock: 70,
  },
  {
    id: 'jefe_final',
    label: 'Nivel 4: Jefe Final',
    tag: 'Desafío Maestro',
    personaType: 'Gerente escéptico con contrato cerrado',
    description: 'Tiene proveedor fijo y desconfía de pagos rápidos. Requiere maniobra técnica, pago 24h y fotos de placa.',
    minScoreToUnlock: 70,
  },
];

/**
 * Calculates XP earned in a single call based on score quality and duration.
 * Rule: Calls < 45 seconds award 0 XP to prevent spam clicks.
 */
export function calculateCallXP(score: number, durationSeconds: number = 60): { xp: number; reason: string } {
  if (durationSeconds > 0 && durationSeconds < 45) {
    return {
      xp: 0,
      reason: 'Llamada muy corta (< 45s): práctica registrada pero sin XP para asegurar calidad.',
    };
  }

  if (score >= 90) {
    return {
      xp: 150,
      reason: '¡Llamada sobresaliente (Score ≥ 90)! +150 XP de maestría comercial.',
    };
  }

  if (score >= 70) {
    return {
      xp: 80,
      reason: 'Llamada aprobada exitosamente (Score ≥ 70): +80 XP.',
    };
  }

  return {
    xp: 30,
    reason: 'Práctica completada con puntos a mejorar (Score < 70): +30 XP por constancia.',
  };
}

/**
 * Calculates user's all-time XP from their history.
 */
export function calculateTotalXP(history: HistoryItem[]): number {
  if (!history || history.length === 0) return 0;
  return history.reduce((sum, item) => {
    // If xp is explicitly stored, use it; otherwise compute from score
    if (typeof (item as any).xpEarned === 'number') {
      return sum + (item as any).xpEarned;
    }
    const { xp } = calculateCallXP(item.score || 0, (item as any).durationSeconds || 60);
    return sum + xp;
  }, 0);
}

/**
 * Calculates XP earned during the current weekly cycle (Monday 00:00 to Sunday 23:59).
 */
export function calculateWeeklyXP(history: HistoryItem[]): number {
  if (!history || history.length === 0) return 0;

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = (now.getDay() + 6) % 7; // Monday = 0
  startOfWeek.setDate(now.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekItems = history.filter(item => {
    const t = item.timestamp || (item.date ? Date.parse(item.date) : 0);
    return t >= startOfWeek.getTime();
  });

  return calculateTotalXP(weekItems);
}

/**
 * Determines the user's weekly division based on current weekly XP.
 */
export function getWeeklyDivision(weeklyXP: number, lang: 'en' | 'es' = 'es'): {
  id: 'bronce' | 'plata' | 'oro';
  name: string;
  badge: string;
  color: string;
  nextTierXP: number | null;
} {
  if (weeklyXP >= 500) {
    return {
      id: 'oro',
      name: lang === 'en' ? 'Gold League' : 'Liga Oro',
      badge: '🏆',
      color: 'text-amber-500 bg-amber-50 border-amber-300',
      nextTierXP: null,
    };
  }

  if (weeklyXP >= 250) {
    return {
      id: 'plata',
      name: lang === 'en' ? 'Silver League' : 'Liga Plata',
      badge: '🥈',
      color: 'text-slate-600 bg-slate-100 border-slate-300',
      nextTierXP: 500,
    };
  }

  return {
    id: 'bronce',
    name: lang === 'en' ? 'Bronze League' : 'Liga Bronce',
    badge: '🥉',
    color: 'text-amber-800 bg-amber-100/60 border-amber-300/80',
    nextTierXP: 250,
  };
}

/**
 * Daily goal tracker: 1 call of at least 3 minutes (180s) or score >= 70 today.
 */
export function getDailyGoalStatus(history: HistoryItem[]): {
  met: boolean;
  todaySeconds: number;
  targetSeconds: number;
  todayCallsCount: number;
} {
  const targetSeconds = 180; // 3 minutes
  if (!history || history.length === 0) {
    return { met: false, todaySeconds: 0, targetSeconds, todayCallsCount: 0 };
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const todayItems = history.filter(item => {
    let d: Date | null = null;
    if (item.timestamp) d = new Date(item.timestamp);
    else if (item.date) {
      const parsed = Date.parse(item.date);
      if (!isNaN(parsed)) d = new Date(parsed);
    }
    return d ? d.toISOString().split('T')[0] === todayStr : false;
  });

  let totalSeconds = 0;
  let met = false;

  for (const item of todayItems) {
    const dur = (item as any).durationSeconds || 60;
    totalSeconds += dur;
    if (dur >= targetSeconds || (item.score || 0) >= 70) {
      met = true;
    }
  }

  if (totalSeconds >= targetSeconds) {
    met = true;
  }

  return {
    met,
    todaySeconds: totalSeconds,
    targetSeconds,
    todayCallsCount: todayItems.length,
  };
}

/**
 * Real streak calculation with 1 weekly freeze for weekend/emergency protection.
 */
export function getStreakWithFreeze(history: HistoryItem[]): {
  streak: number;
  freezeUsedThisWeek: boolean;
  freezesRemaining: number;
  dailyGoalDoneToday: boolean;
} {
  const dailyGoal = getDailyGoalStatus(history);
  if (!history || history.length === 0) {
    return {
      streak: 0,
      freezeUsedThisWeek: false,
      freezesRemaining: 1,
      dailyGoalDoneToday: false,
    };
  }

  // Map dates to practice status
  const datesPracticed = new Set<string>();
  for (const item of history) {
    let d: Date | null = null;
    if (item.timestamp) d = new Date(item.timestamp);
    else if (item.date) {
      const parsed = Date.parse(item.date);
      if (!isNaN(parsed)) d = new Date(parsed);
    }
    if (d && !isNaN(d.getTime())) {
      datesPracticed.add(d.toISOString().split('T')[0]);
    }
  }

  const today = new Date();
  let checkDate = new Date(today);
  const todayStr = checkDate.toISOString().split('T')[0];

  let streak = 0;
  let freezesRemaining = 1;
  let freezeUsedThisWeek = false;

  // If practiced today, increment streak
  if (datesPracticed.has(todayStr)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If not yet practiced today, check if yesterday was practiced
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (datesPracticed.has(yesterdayStr)) {
      // User can still practice today to preserve streak
      checkDate = yesterday;
    } else {
      // Neither today nor yesterday; check if weekend freeze applies
      const isWeekend = today.getDay() === 0 || today.getDay() === 6;
      if (isWeekend && freezesRemaining > 0) {
        freezesRemaining = 0;
        freezeUsedThisWeek = true;
        checkDate = yesterday;
      } else {
        return {
          streak: 0,
          freezeUsedThisWeek: false,
          freezesRemaining: 1,
          dailyGoalDoneToday: dailyGoal.met,
        };
      }
    }
  }

  // Count backwards day by day
  for (let i = 0; i < 365; i++) {
    const curStr = checkDate.toISOString().split('T')[0];
    if (datesPracticed.has(curStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Check if we can apply the 1 weekly freeze (e.g. for a Sunday or Saturday)
      const dayOfWeek = checkDate.getDay();
      const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekendDay && freezesRemaining > 0) {
        freezesRemaining = 0;
        freezeUsedThisWeek = true;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    streak,
    freezeUsedThisWeek,
    freezesRemaining,
    dailyGoalDoneToday: dailyGoal.met,
  };
}

/**
 * Returns progression for a specific industry path: Fácil -> Medio -> Difícil -> Jefe Final
 * Rule: Level N+1 unlocks when Level N has at least one attempt with score >= 70.
 */
export function getIndustryPathProgress(history: HistoryItem[], industryId: string): {
  unlockedLevels: LevelStage[];
  completedLevels: LevelStage[];
  nextLevel: LevelStage;
  bestScores: Record<LevelStage, number>;
  isCompleted: boolean;
} {
  const industryHistory = history.filter(h => {
    const ind = (h as any).industry || (h.companyName ? h.companyName.toLowerCase() : '');
    return ind.includes(industryId) || ind.includes(industryId.replace('_', ' '));
  });

  const bestScores: Record<LevelStage, number> = {
    facil: 0,
    medio: 0,
    dificil: 0,
    jefe_final: 0,
  };

  industryHistory.forEach(item => {
    const diff = ((item as any).levelStage || item.difficulty || 'friendly').toLowerCase();
    let stage: LevelStage = 'facil';
    if (diff.includes('jefe') || diff.includes('final')) stage = 'jefe_final';
    else if (diff.includes('hard') || diff.includes('dificil')) stage = 'dificil';
    else if (diff.includes('chal') || diff.includes('medio')) stage = 'medio';
    else stage = 'facil';

    if ((item.score || 0) > bestScores[stage]) {
      bestScores[stage] = item.score || 0;
    }
  });

  const unlockedLevels: LevelStage[] = ['facil'];
  const completedLevels: LevelStage[] = [];

  // Fácil unlocks Medio if score >= 70
  if (bestScores.facil >= 70) {
    unlockedLevels.push('medio');
    completedLevels.push('facil');
  }

  // Medio unlocks Difícil if score >= 70
  if (bestScores.medio >= 70) {
    unlockedLevels.push('dificil');
    completedLevels.push('medio');
  }

  // Difícil unlocks Jefe Final if score >= 70
  if (bestScores.dificil >= 70) {
    unlockedLevels.push('jefe_final');
    completedLevels.push('dificil');
  }

  if (bestScores.jefe_final >= 70) {
    completedLevels.push('jefe_final');
  }

  // Next level to tackle
  let nextLevel: LevelStage = 'facil';
  if (!completedLevels.includes('facil')) nextLevel = 'facil';
  else if (!completedLevels.includes('medio')) nextLevel = 'medio';
  else if (!completedLevels.includes('dificil')) nextLevel = 'dificil';
  else nextLevel = 'jefe_final';

  return {
    unlockedLevels,
    completedLevels,
    nextLevel,
    bestScores,
    isCompleted: completedLevels.includes('jefe_final'),
  };
}

/**
 * Calculates certifications for the trainee based on approved scenarios (Score >= 70).
 */
export function getCertifications(history: HistoryItem[]): {
  level1: boolean; // 3+ industries approved (score >= 70)
  level2: boolean; // 5+ industries approved in Medio or Difícil
  level3: boolean; // All 7 industries approved including Jefe Final
  approvedCount: number;
  totalIndustries: number;
} {
  const totalIndustries = SCENARIOS.length;
  let approvedCount = 0;
  let mediumOrHardApprovedCount = 0;
  let bossDefeatedCount = 0;

  SCENARIOS.forEach(sc => {
    const progress = getIndustryPathProgress(history, sc.id);
    if (progress.completedLevels.length > 0) {
      approvedCount++;
    }
    if (progress.completedLevels.includes('medio') || progress.completedLevels.includes('dificil')) {
      mediumOrHardApprovedCount++;
    }
    if (progress.completedLevels.includes('jefe_final')) {
      bossDefeatedCount++;
    }
  });

  return {
    level1: approvedCount >= 3,
    level2: mediumOrHardApprovedCount >= 5,
    level3: bossDefeatedCount >= totalIndustries,
    approvedCount,
    totalIndustries,
  };
}

/**
 * Short, motivating coach message upon completing a call.
 */
export function getCoachReaction(score: number, xp: number, streak: number): {
  title: string;
  message: string;
  badge: string;
} {
  if (score >= 90) {
    return {
      badge: '🎯 Experto Comercial',
      title: '¡Llamada impecable!',
      message: `Dominaste la conversación sin dar precios ciegos y aseguraste el próximo paso formal. Has ganado +${xp} XP.`,
    };
  }

  if (score >= 75) {
    return {
      badge: '💪 Muy Buen Avance',
      title: '¡Muy bien negociado!',
      message: `Supiste sortear las trabas del cliente y mantuviste el control. Ganaste +${xp} XP para tu ranking semanal.`,
    };
  }

  if (score >= 60) {
    return {
      badge: '⚡ En Camino',
      title: 'Buen intento, sigue puliendo',
      message: `Estás cerca del estándar de 70 puntos. Revisa el tip prioritario y repite este escenario para desbloquear el siguiente nivel.`,
    };
  }

  return {
    badge: '🔄 Práctica de Resistencia',
    title: 'Cada llamada te hace más fuerte',
    message: `Los clientes difíciles en frío son así. Enfócate en tu apertura y en ofrecer desarme sin costo. Sigue adelante: +${xp} XP.`,
  };
}
