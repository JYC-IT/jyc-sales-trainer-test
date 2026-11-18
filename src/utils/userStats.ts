import { HistoryItem } from '../types';

/**
 * Calculates the current active streak in consecutive days of practice.
 * Returns 0 if there are no practices or if the user hasn't practiced today or yesterday.
 */
export function calculateStreak(history: HistoryItem[]): number {
  if (!history || history.length === 0) return 0;

  // Extract unique valid calendar dates (YYYY-MM-DD)
  const dateSet = new Set<string>();
  for (const item of history) {
    let d: Date | null = null;
    if (item.timestamp) {
      d = new Date(item.timestamp);
    } else if (item.date) {
      const parsed = Date.parse(item.date);
      if (!isNaN(parsed)) d = new Date(parsed);
    }
    if (d && !isNaN(d.getTime())) {
      dateSet.add(d.toISOString().split('T')[0]);
    }
  }

  const sortedDates = Array.from(dateSet).sort().reverse();
  if (sortedDates.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If the last practice was before yesterday, streak is broken
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Analyzes weekly statistics (current week Monday-Sunday).
 */
export function getWeeklyProgress(history: HistoryItem[]) {
  if (!history || history.length === 0) {
    return {
      totalThisWeek: 0,
      avgScoreThisWeek: 0,
      scoreTrend: 'stable' as const,
      weakestArea: 'Apertura y presentación',
      totalAllTime: 0
    };
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = (now.getDay() + 6) % 7; // Monday = 0
  startOfWeek.setDate(now.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const thisWeekItems = history.filter(item => {
    const t = item.timestamp || (item.date ? Date.parse(item.date) : 0);
    return t >= startOfWeek.getTime();
  });

  const lastWeekItems = history.filter(item => {
    const t = item.timestamp || (item.date ? Date.parse(item.date) : 0);
    return t >= startOfLastWeek.getTime() && t < startOfWeek.getTime();
  });

  const avgThisWeek = thisWeekItems.length > 0
    ? Math.round(thisWeekItems.reduce((acc, cur) => acc + (cur.score || 0), 0) / thisWeekItems.length)
    : 0;

  const avgLastWeek = lastWeekItems.length > 0
    ? Math.round(lastWeekItems.reduce((acc, cur) => acc + (cur.score || 0), 0) / lastWeekItems.length)
    : 0;

  let scoreTrend: 'up' | 'down' | 'stable' = 'stable';
  if (thisWeekItems.length > 0 && lastWeekItems.length > 0) {
    if (avgThisWeek > avgLastWeek + 2) scoreTrend = 'up';
    else if (avgThisWeek < avgLastWeek - 2) scoreTrend = 'down';
  } else if (thisWeekItems.length >= 2) {
    const sorted = [...thisWeekItems].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    const first = sorted[0].score || 0;
    const last = sorted[sorted.length - 1].score || 0;
    if (last > first + 3) scoreTrend = 'up';
    else if (last < first - 3) scoreTrend = 'down';
  }

  // Find weakest evaluation criteria across all evaluations
  const checklistFails: Record<string, number> = {
    'Apertura y gancho': 0,
    'Evasión de precio ciego': 0,
    'Diferenciadores JYC (maniobra y pago 24h)': 0,
    'Compromiso de fotos y horómetro': 0,
    'Manejo de objeciones': 0
  };

  history.forEach(item => {
    const ch = item.evaluation?.checklist;
    if (ch) {
      if (ch.openingAndPresentation === false || ch.kpOpening === false) checklistFails['Apertura y gancho']++;
      if (ch.needsIdentification === false || ch.equipmentQualification === false) checklistFails['Evasión de precio ciego']++;
      if (ch.commercialValueArgumentation === false || ch.proposalClarity === false) checklistFails['Diferenciadores JYC (maniobra y pago 24h)']++;
      if (ch.closingAndNextStep === false || ch.nextStepsSecure === false) checklistFails['Compromiso de fotos y horómetro']++;
      if (ch.objectionHandling === false) checklistFails['Manejo de objeciones']++;
    }
  });

  let weakestArea = 'Evasión de precio ciego (pedir fotos de placa)';
  let maxFails = -1;
  for (const [area, fails] of Object.entries(checklistFails)) {
    if (fails > maxFails) {
      maxFails = fails;
      weakestArea = area;
    }
  }

  return {
    totalThisWeek: thisWeekItems.length,
    avgScoreThisWeek: avgThisWeek,
    scoreTrend,
    weakestArea,
    totalAllTime: history.length
  };
}

/**
 * Suggests the next practice scenario based on trainee performance.
 */
export function getSuggestedScenario(history: HistoryItem[], scenarios: Array<{ id: string; title: string; objective: string }>) {
  if (!scenarios || scenarios.length === 0) return null;

  if (!history || history.length === 0) {
    return {
      scenario: scenarios[0],
      reason: 'Recomendado para comenzar: aprende la estructura base de contacto con jefe de planta.'
    };
  }

  // Look for scenarios never practiced yet
  const practicedIds = new Set(history.map(h => {
    const title = (h.companyName || '') + (h.evaluation?.companyName || '');
    const matched = scenarios.find(s => title.toLowerCase().includes(s.title.toLowerCase()) || title.toLowerCase().includes(s.id.toLowerCase()));
    return matched ? matched.id : null;
  }));

  const unpracticed = scenarios.find(s => !practicedIds.has(s.id));
  if (unpracticed) {
    return {
      scenario: unpracticed,
      reason: 'Aún no has practicado este sector. Amplía tu repertorio industrial.'
    };
  }

  // Look for scenario with the lowest average score
  const scoreMap: Record<string, { total: number; count: number }> = {};
  history.forEach(item => {
    const matched = scenarios.find(s => 
      item.companyName?.toLowerCase().includes(s.title.toLowerCase()) || 
      item.contactName?.toLowerCase().includes(s.title.toLowerCase())
    ) || scenarios[0];

    if (!scoreMap[matched.id]) scoreMap[matched.id] = { total: 0, count: 0 };
    scoreMap[matched.id].total += (item.score || 0);
    scoreMap[matched.id].count++;
  });

  let lowestScenarioId = scenarios[0].id;
  let lowestAvg = 101;

  for (const [id, data] of Object.entries(scoreMap)) {
    const avg = data.total / data.count;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      lowestScenarioId = id;
    }
  }

  const targetScenario = scenarios.find(s => s.id === lowestScenarioId) || scenarios[0];
  return {
    scenario: targetScenario,
    reason: `Tu promedio aquí fue de ${Math.round(lowestAvg)}/100. Repite para consolidar tu cierre.`
  };
}
