import React from 'react';
import { HistoryItem, User as UserType } from '../types';
import { calculateStreak, getWeeklyProgress, getSuggestedScenario } from '../utils/userStats';
import { 
  getStreakWithFreeze, 
  getDailyGoalStatus, 
  calculateWeeklyXP, 
  calculateTotalXP, 
  getWeeklyDivision, 
  getCertifications, 
  getIndustryPathProgress,
  LevelStage
} from '../utils/gamification';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  PhoneCall, Award, TrendingUp, TrendingDown, Minus, 
  Flame, Target, ArrowRight, BookOpen, Clock, AlertCircle, 
  CheckCircle2, ShieldCheck, Trophy, Sparkles, Check, Lock, ChevronRight
} from 'lucide-react';

interface HomeViewProps {
  currentUser: UserType | null;
  history: HistoryItem[];
  scenarios: Array<{
    id: string;
    title: string;
    titleEn?: string;
    machinery: string;
    machineryEn?: string;
    context: string;
    objective: string;
    objectiveEn?: string;
  }>;
  onStartPractice: (scenarioId?: string) => void;
  onViewHistory: () => void;
  onViewPlaybook: () => void;
}

export default function HomeView({
  currentUser,
  history,
  scenarios,
  onStartPractice,
  onViewHistory,
  onViewPlaybook,
}: HomeViewProps) {
  const { t, language } = useLanguage();
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : (language === 'en' ? 'Sales Rep' : 'Vendedor');
  const weekly = getWeeklyProgress(history);
  const lastCall = history.length > 0 ? history[0] : null;
  const suggestion = getSuggestedScenario(history, scenarios);

  const suggestedScenario = suggestion?.scenario || scenarios[0];
  const suggestedReason = language === 'en'
    ? 'Recommended scenario to strengthen your cold open, gatekeeper deflection, and fleet qualification.'
    : (suggestion?.reason || 'Comienza practicando tu apertura y desvío de gatekeeper.');

  // Gamification metrics
  const streakData = getStreakWithFreeze(history);
  const dailyGoal = getDailyGoalStatus(history);
  const weeklyXP = calculateWeeklyXP(history);
  const totalXP = calculateTotalXP(history);
  const division = getWeeklyDivision(weeklyXP, language);
  const certs = getCertifications(history);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] text-left">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Encabezado Principal con Indicadores de Gamificación Duolingo B2B */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <span>{t('nav_tagline')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              {t('home_greeting_pre')}, {firstName}. {t('home_greeting_post')}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {t('home_subtitle')}
            </p>
          </div>

          {/* Badges de Gamificación: Racha, Congelador, Liga y XP */}
          <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
            {/* Racha Real con Congelador */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm font-bold shadow-2xs">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
              <span>{streakData.streak > 0 ? `${streakData.streak} ${t('home_real_streak')}` : t('home_streak_start')}</span>
            </div>

            {/* Escudo de Congelador Semanal */}
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold shadow-2xs ${
              streakData.freezesRemaining > 0 
                ? 'bg-sky-50 border-sky-200 text-sky-900' 
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>{streakData.freezesRemaining > 0 ? t('home_freeze_ready') : t('home_freeze_used')}</span>
            </div>

            {/* División Semanal */}
            <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold shadow-2xs ${division.color}`}>
              <span>{division.badge}</span>
              <span>{division.name}</span>
              <span className="text-xs font-mono font-semibold ml-1">({weeklyXP} XP)</span>
            </div>

            {/* Botón Principal CTA */}
            <button
              type="button"
              onClick={() => onStartPractice(suggestedScenario.id)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('home_cta_practice')}</span>
            </button>
          </div>
        </div>

        {/* Barra de Meta Diaria (1 llamada de 3 minutos) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              dailyGoal.met ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {dailyGoal.met ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{t('home_daily_goal_title')}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  dailyGoal.met ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {dailyGoal.met ? t('home_daily_goal_done') : t('home_daily_goal_pending')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('home_daily_goal_sub')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>{dailyGoal.todayCallsCount} {t('home_daily_goal_calls')}</span>
            <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all ${dailyGoal.met ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, Math.round((dailyGoal.todaySeconds / dailyGoal.targetSeconds) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Los 3 Bloques Principales de Inicio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* Bloque 1: Tu Próxima Práctica Sugerida (6 columnas) */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-6 border-2 border-amber-500/80 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  {t('home_block1_tag')}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {t('home_block1_badge')}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 leading-tight">
                  {language === 'en' ? (suggestedScenario.titleEn || suggestedScenario.title) : suggestedScenario.title}
                </h2>
                <p className="text-sm font-medium text-amber-800 mt-1">
                  {t('home_block1_machinery')}: {language === 'en' ? (suggestedScenario.machineryEn || suggestedScenario.machinery) : suggestedScenario.machinery}
                </p>
              </div>

              {/* Razón de la sugerencia */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 text-xs">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('home_block1_why')}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {suggestedReason}
                </p>
              </div>

              {/* Meta operativa */}
              <div className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700">{t('home_block1_objective')}: </span>
                {language === 'en' ? (suggestedScenario.objectiveEn || suggestedScenario.objective) : suggestedScenario.objective}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onStartPractice(suggestedScenario.id)}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t('home_block1_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bloque 2 y 3: Último Score y Progreso de la Semana (6 columnas) */}
          <div className="lg:col-span-6 flex flex-col gap-6">

            {/* Tarjeta Último Score */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('home_block2_tag')}
                </span>
                {lastCall && (
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lastCall.date}</span>
                  </span>
                )}
              </div>

              {lastCall ? (
                <div className="py-3 flex items-center gap-5">
                  <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-display font-extrabold text-2xl shadow-xs shrink-0 ${
                    lastCall.score >= 80 
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300'
                      : lastCall.score >= 65
                      ? 'bg-amber-50 text-amber-700 border-2 border-amber-300'
                      : 'bg-rose-50 text-rose-700 border-2 border-rose-300'
                  }`}>
                    <span>{lastCall.score}</span>
                    <span className="text-xs font-sans font-bold uppercase opacity-80">{language === 'en' ? 'of 100' : 'de 100'}</span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h3 className="font-display font-bold text-base text-slate-900 truncate">
                      {lastCall.companyName || (language === 'en' ? 'Simulated Company' : 'Empresa simulada')}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {language === 'en' ? 'Contact: ' : 'Contacto: '}{lastCall.contactName || (language === 'en' ? 'Decision Maker' : 'Tomador de decisión')}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      "{lastCall.evaluation?.summary || (language === 'en' ? 'Evaluation recorded in system.' : 'Evaluación registrada en el sistema.')}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{t('home_block2_empty_title')}</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {t('home_block2_empty_desc')}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onViewHistory}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('home_block2_view_history')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onViewPlaybook}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t('home_block2_view_playbook')}</span>
                </button>
              </div>
            </div>

            {/* Bloque 3: Tu Progreso de la Semana y Certificados */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('home_block3_tag')}
                </span>
                <span className="text-xs text-slate-500 font-medium">{t('home_block3_period')}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 py-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                  <span className="text-xs text-slate-500 font-medium block">{t('home_block3_calls')}</span>
                  <span className="text-xl font-display font-extrabold text-slate-900 block">
                    {weekly.totalThisWeek}
                  </span>
                  <span className="text-xs text-slate-400">{language === 'en' ? 'this week' : 'esta semana'}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                  <span className="text-xs text-slate-500 font-medium block">{t('home_block3_avg')}</span>
                  <span className="text-xl font-display font-extrabold text-slate-900 block">
                    {weekly.avgScoreThisWeek > 0 ? `${weekly.avgScoreThisWeek}` : '—'}
                  </span>
                  <span className="text-xs text-slate-400">{language === 'en' ? 'points' : 'puntos'}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                  <span className="text-xs text-slate-500 font-medium block">{t('home_block3_trend')}</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {weekly.scoreTrend === 'up' && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" /> {t('home_block3_trend_up')}
                      </span>
                    )}
                    {weekly.scoreTrend === 'down' && (
                      <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <TrendingDown className="w-3.5 h-3.5" /> {t('home_block3_trend_down')}
                      </span>
                    )}
                    {weekly.scoreTrend === 'stable' && (
                      <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <Minus className="w-3.5 h-3.5" /> {t('home_block3_trend_stable')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{language === 'en' ? 'vs prev. week' : 'vs semana ant.'}</span>
                </div>
              </div>

              {/* Certificaciones Comerciales JYC */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{t('home_block3_cert')}:</span>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    certs.level1 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {certs.level1 ? '✓ ' + (language === 'en' ? 'Level 1' : 'Nivel 1') : (language === 'en' ? 'Level 1' : 'Nivel 1')}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    certs.level2 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {certs.level2 ? '✓ ' + (language === 'en' ? 'Level 2' : 'Nivel 2') : (language === 'en' ? 'Level 2' : 'Nivel 2')}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    certs.level3 
                      ? 'bg-purple-50 text-purple-800 border-purple-300' 
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    {certs.level3 ? '★ Master' : 'Master'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SECCIÓN DUOLINGO B2B: Rutas por Niveles de las 7 Industrias */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                {t('roadmap_title')}
              </h2>
              <p className="text-sm text-slate-600">
                {t('roadmap_subtitle')}
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shrink-0">
              {certs.approvedCount} / {certs.totalIndustries} {t('roadmap_progress')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scen) => {
              const path = getIndustryPathProgress(history, scen.id);

              return (
                <div 
                  key={scen.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm font-display truncate">
                        {language === 'en' ? (scen.titleEn || scen.title) : scen.title}
                      </h3>
                      {path.isCompleted ? (
                        <span className="text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-purple-600" />
                          <span>{t('roadmap_mastered')}</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          {path.completedLevels.length}/4
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {language === 'en' ? (scen.machineryEn || scen.machinery) : scen.machinery}
                    </p>
                  </div>

                  {/* 4 Nodos de Nivel Estilo Duolingo */}
                  <div className="grid grid-cols-4 gap-1.5 py-1">
                    {[
                      { key: 'facil', label: language === 'en' ? 'Easy' : 'Fácil', score: path.bestScores.facil },
                      { key: 'medio', label: language === 'en' ? 'Med' : 'Medio', score: path.bestScores.medio },
                      { key: 'dificil', label: language === 'en' ? 'Hard' : 'Difícil', score: path.bestScores.dificil },
                      { key: 'jefe_final', label: language === 'en' ? 'Boss' : 'Jefe', score: path.bestScores.jefe_final }
                    ].map((stg) => {
                      const isDone = path.completedLevels.includes(stg.key as LevelStage);
                      const isNext = path.nextLevel === stg.key;

                      return (
                        <div 
                          key={stg.key}
                          className={`p-2 rounded-lg text-center border transition-all ${
                            isDone 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                              : isNext
                              ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/20'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="text-[11px] font-bold block">{stg.label}</span>
                          <span className="text-xs font-mono font-semibold block mt-0.5">
                            {stg.score > 0 ? `${stg.score}` : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartPractice(scen.id)}
                    className="w-full py-2 px-3 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{t('roadmap_train_btn')} {language === 'en' ? (scen.titleEn || scen.title) : scen.title}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
