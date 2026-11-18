import React, { useState, useEffect, useMemo } from 'react';
import { UserStats, api, getAuthHeaders } from '../services/api';
import { HistoryItem } from '../types';
import { 
  getStreakWithFreeze, 
  calculateWeeklyXP, 
  getWeeklyDivision, 
  getCertifications 
} from '../utils/gamification';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  ShieldCheck, Trophy, TrendingUp, TrendingDown, Minus, 
  Users, AlertTriangle, Flame, PhoneCall, RefreshCw, Key, 
  UserPlus, CheckCircle2, ChevronRight, BarChart3, Clock, Sparkles, Award
} from 'lucide-react';
import AdminUserManager from '../AdminUserManager';

interface AdminBossViewProps {
  onNavigateToPractice?: () => void;
}

export default function AdminBossView({ onNavigateToPractice }: AdminBossViewProps) {
  const { t, language: uiLang } = useLanguage();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAccountManager, setShowAccountManager] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, historyRes] = await Promise.all([
        api.fetchUserList().catch(() => []),
        fetch('/api/history?role=admin', { 
          headers: getAuthHeaders(), 
          credentials: 'same-origin' 
        }).then(r => r.ok ? r.json() : { history: [] }).catch(() => ({ history: [] }))
      ]);

      setUsers(usersData || []);
      if (Array.isArray(historyRes.history)) {
        setHistory(historyRes.history);
      }
    } catch (err) {
      console.error('Error loading boss view data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute team analytics & gamification leaderboard
  const teamMetrics = useMemo(() => {
    const trainees = users.filter(u => u.role !== 'admin');
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Calls within last 7 days
    const weekCalls = history.filter(h => (h.timestamp || 0) >= sevenDaysAgo);

    // Reps weekly activity, XP, streak and certifications
    const repsSummary = trainees.map(trainee => {
      const repHistory = history.filter(h => h.userId === trainee.id || h.userName === trainee.name);
      const repWeekCalls = repHistory.filter(h => (h.timestamp || 0) >= sevenDaysAgo);
      
      const repAvgScore = repHistory.length > 0 
        ? Math.round(repHistory.reduce((acc, h) => acc + (h.score || 0), 0) / repHistory.length)
        : trainee.avgScore || 0;

      // Determine trend: compare last 2 calls vs previous 2
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (repHistory.length >= 4) {
        const recentAvg = (repHistory[0].score + repHistory[1].score) / 2;
        const prevAvg = (repHistory[2].score + repHistory[3].score) / 2;
        if (recentAvg >= prevAvg + 4) trend = 'up';
        else if (recentAvg <= prevAvg - 4) trend = 'down';
      } else if (repHistory.length >= 2) {
        if (repHistory[0].score > repHistory[1].score + 3) trend = 'up';
        else if (repHistory[0].score < repHistory[1].score - 3) trend = 'down';
      }

      // Gamification stats per rep
      const weeklyXP = calculateWeeklyXP(repHistory);
      const division = getWeeklyDivision(weeklyXP, uiLang);
      const streakData = getStreakWithFreeze(repHistory);
      const certs = getCertifications(repHistory);

      return {
        id: trainee.id,
        name: trainee.name || trainee.username,
        username: trainee.username,
        weekCallsCount: repWeekCalls.length,
        totalCalls: repHistory.length || trainee.callCount || 0,
        avgScore: repAvgScore,
        bestScore: trainee.bestScore || Math.max(...repHistory.map(h => h.score || 0), 0),
        trend,
        lastActive: trainee.lastActive,
        blocked: trainee.blocked,
        weeklyXP,
        division,
        streak: streakData.streak,
        freezesRemaining: streakData.freezesRemaining,
        certs
      };
    });

    // Sort by weekly XP descending, then by avgScore descending (Podio)
    repsSummary.sort((a, b) => b.weeklyXP - a.weeklyXP || b.avgScore - a.avgScore || b.weekCallsCount - a.weekCallsCount);

    // Calculate team average
    const teamAvgScore = repsSummary.length > 0 
      ? Math.round(repsSummary.reduce((acc, r) => acc + r.avgScore, 0) / repsSummary.length)
      : 0;

    // Detect team's weakest criterion across evaluations
    const criteriaFailureCount: Record<string, number> = {
      'Gatekeeper: Evasión y desvío hacia decisión': 0,
      'Evitar cotización a ciegas (no dar precio primero)': 0,
      'Calificación técnica completa (horómetro, modelo, condición)': 0,
      'Manejo de objeción: "No estamos vendiendo nada"': 0,
      'Cierre formal: Agendar inspección o envío de fotos': 0,
    };

    history.forEach(item => {
      const evalData = item.evaluation;
      if (!evalData) return;
      
      const checkArray = Array.isArray(evalData.checklist) ? evalData.checklist : [];
      checkArray.forEach((c: any) => {
        const itemText = (c.item || c.name || '').toLowerCase();
        const passed = c.passed || c.status === 'pass' || c.met;
        if (!passed) {
          if (itemText.includes('gatekeeper') || itemText.includes('recep')) {
            criteriaFailureCount['Gatekeeper: Evasión y desvío hacia decisión']++;
          } else if (itemText.includes('precio') || itemText.includes('cotiz')) {
            criteriaFailureCount['Evitar cotización a ciegas (no dar precio primero)']++;
          } else if (itemText.includes('calif') || itemText.includes('tecnic') || itemText.includes('hor')) {
            criteriaFailureCount['Calificación técnica completa (horómetro, modelo, condición)']++;
          } else if (itemText.includes('objec') || itemText.includes('vend')) {
            criteriaFailureCount['Manejo de objeción: "No estamos vendiendo nada"']++;
          } else if (itemText.includes('cierre') || itemText.includes('foto') || itemText.includes('cita')) {
            criteriaFailureCount['Cierre formal: Agendar inspección o envío de fotos']++;
          }
        }
      });
    });

    let weakestCritName = uiLang === 'en' 
      ? 'Avoid blind quoting (do not state price first)' 
      : 'Evitar cotización a ciegas (no dar precio primero)';
    let maxFailures = 0;

    Object.entries(criteriaFailureCount).forEach(([name, count]) => {
      if (count > maxFailures) {
        maxFailures = count;
        weakestCritName = name;
      }
    });

    return {
      reps: repsSummary,
      totalWeekCalls: weekCalls.length,
      teamAvgScore,
      weakestCriterion: weakestCritName,
      failuresInWeakest: maxFailures,
      topRep: repsSummary[0] || null
    };
  }, [users, history, uiLang]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] text-left">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Superior - Resumen para el Jefe */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('admin_badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              {t('admin_title')}
            </h1>
            <p className="text-sm text-slate-600">
              {t('admin_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs transition-all cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">{t('admin_refresh')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAccountManager(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('admin_accounts')}</span>
            </button>
          </div>
        </div>

        {/* 4 Indicadores Clave Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin_kpi_practices')}</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                {teamMetrics.totalWeekCalls}
              </div>
              <span className="text-xs text-slate-500 font-medium">{uiLang === 'en' ? 'Simulations & audio audits' : 'Llamadas simuladas y audios'}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin_kpi_score')}</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                {teamMetrics.teamAvgScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {teamMetrics.teamAvgScore >= 75 ? (uiLang === 'en' ? '🟢 Optimal level' : '🟢 Nivel óptimo') : (uiLang === 'en' ? '🟡 Reinforcement required' : '🟡 Requiere refuerzo')}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin_kpi_leader')}</span>
              <div className="text-lg sm:text-xl font-bold font-display text-slate-900 truncate max-w-[140px]">
                {teamMetrics.topRep ? teamMetrics.topRep.name.split(' ')[0] : (uiLang === 'en' ? 'No data' : 'Sin datos')}
              </div>
              <span className="text-xs text-amber-700 font-semibold">
                {teamMetrics.topRep ? `${teamMetrics.topRep.weeklyXP} XP · ${teamMetrics.topRep.avgScore} pts` : '—'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('admin_kpi_active')}</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                {teamMetrics.reps.filter(r => !r.blocked).length}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {teamMetrics.reps.filter(r => r.weekCallsCount > 0).length} {uiLang === 'en' ? 'practiced this week' : 'practicaron esta semana'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* ALERTA CLAVE: El Criterio Más Débil del Equipo */}
        <div className="bg-white rounded-2xl p-6 border-l-4 border-l-amber-500 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{t('admin_alert_title')}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900">
                {teamMetrics.weakestCriterion}
              </h2>
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                {uiLang === 'en' 
                  ? 'This is the stage where the sales team loses the most points during cold simulations. Buyers detect when pricing is given before qualifying meter hours or when gatekeepers are not bypassed with authority.' 
                  : 'Este es el paso donde el equipo pierde más puntos en las simulaciones. Los compradores simulados detectan cuando se da precio antes de calificar horómetro o cuando no se esquiva a la recepcionista con aplomo.'}
              </p>
            </div>
            <div className="shrink-0 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-900 block">{uiLang === 'en' ? 'Recommended Action' : 'Acción recomendada'}</span>
              <span className="text-sm font-extrabold text-amber-800">{uiLang === 'en' ? 'Guided Practice on Playbook' : 'Práctica guiada en Playbook'}</span>
            </div>
          </div>
        </div>

        {/* Competencia Semanal y Podio del Equipo (Estilo Duolingo B2B) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <span>{t('admin_podium_title')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('admin_podium_sub')}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {teamMetrics.reps.length} {uiLang === 'en' ? 'reps in competition' : 'vendedores en competencia'}
            </span>
          </div>

          <div className="space-y-3">
            {teamMetrics.reps.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                {uiLang === 'en' ? 'No sales reps registered at this moment.' : 'No hay vendedores registrados en este momento.'}
              </div>
            ) : (
              teamMetrics.reps.map((rep, index) => {
                const isPodiumGold = index === 0 && rep.weekCallsCount > 0;
                const isPodiumSilver = index === 1 && rep.weekCallsCount > 0;
                const isPodiumBronze = index === 2 && rep.weekCallsCount > 0;

                const rankBadge = isPodiumGold 
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold' 
                  : isPodiumSilver 
                  ? 'bg-slate-200 text-slate-800 border-slate-400 font-extrabold' 
                  : isPodiumBronze 
                  ? 'bg-amber-200/60 text-amber-900 border-amber-400 font-extrabold' 
                  : 'bg-slate-50 text-slate-600 border-slate-200';

                return (
                  <div 
                    key={rep.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isPodiumGold 
                        ? 'bg-amber-50/40 border-amber-300/80 shadow-xs' 
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Posición, Nombre y División */}
                    <div className="flex items-center gap-3.5 min-w-[220px]">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 text-sm ${rankBadge}`}>
                        {isPodiumGold ? '🥇' : isPodiumSilver ? '🥈' : isPodiumBronze ? '🥉' : `#${index + 1}`}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <span>{rep.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${rep.division.color}`}>
                            {rep.division.name}
                          </span>
                          {rep.blocked && (
                            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              {uiLang === 'en' ? 'Blocked' : 'Bloqueado'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>@{rep.username}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-800 font-semibold">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{rep.streak}d {uiLang === 'en' ? 'streak' : 'racha'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Certificaciones JYC */}
                    <div className="flex items-center gap-1.5 shrink-0 text-xs">
                      <span className="text-slate-400 font-medium mr-1 hidden lg:inline">{uiLang === 'en' ? 'Cert:' : 'Habilitación:'}</span>
                      <span className={`px-2 py-0.5 rounded font-bold border ${
                        rep.certs.level1 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-slate-50 text-slate-300 border-slate-200'
                      }`}>
                        N1
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold border ${
                        rep.certs.level2 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-slate-50 text-slate-300 border-slate-200'
                      }`}>
                        N2
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold border ${
                        rep.certs.level3 
                          ? 'bg-purple-50 text-purple-800 border-purple-300' 
                          : 'bg-slate-50 text-slate-300 border-slate-200'
                      }`}>
                        Master
                      </span>
                    </div>

                    {/* Métricas: XP Semanal, Llamadas, Score y Tendencia */}
                    <div className="flex items-center gap-5 sm:gap-7 justify-between md:justify-end text-sm">
                      {/* XP Semanal */}
                      <div className="text-center md:text-right min-w-[70px]">
                        <span className="text-xs text-slate-500 block">{uiLang === 'en' ? 'Weekly XP' : 'XP Semanal'}</span>
                        <span className="font-extrabold text-amber-700 font-mono text-base">
                          {rep.weeklyXP} XP
                        </span>
                      </div>

                      {/* Prácticas Semana */}
                      <div className="text-center md:text-right min-w-[75px]">
                        <span className="text-xs text-slate-500 block">{uiLang === 'en' ? 'Practices' : 'Prácticas'}</span>
                        <span className="font-bold text-slate-900">
                          {rep.weekCallsCount}
                        </span>
                      </div>

                      {/* Score Promedio */}
                      <div className="text-center md:text-right min-w-[80px]">
                        <span className="text-xs text-slate-500 block">{uiLang === 'en' ? 'Avg Score' : 'Score Promedio'}</span>
                        <span className="font-extrabold text-base text-slate-900">
                          {rep.avgScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                        </span>
                      </div>

                      {/* Tendencia */}
                      <div className="text-center md:text-right min-w-[80px]">
                        <span className="text-xs text-slate-500 block">{uiLang === 'en' ? 'Trend' : 'Tendencia'}</span>
                        {rep.trend === 'up' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                            <TrendingUp className="w-3.5 h-3.5" /> {uiLang === 'en' ? 'Up' : 'Sube'}
                          </span>
                        )}
                        {rep.trend === 'down' && (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs">
                            <TrendingDown className="w-3.5 h-3.5" /> {uiLang === 'en' ? 'Down' : 'Baja'}
                          </span>
                        )}
                        {rep.trend === 'stable' && (
                          <span className="inline-flex items-center gap-1 text-slate-600 font-bold text-xs">
                            <Minus className="w-3.5 h-3.5" /> {uiLang === 'en' ? 'Stable' : 'Estable'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Modal de Administración de Usuarios (si el jefe necesita cambiar claves o crear reps) */}
      {showAccountManager && (
        <AdminUserManager 
          onClose={() => {
            setShowAccountManager(false);
            loadData();
          }} 
        />
      )}
    </div>
  );
}
