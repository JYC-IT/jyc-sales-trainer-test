import React, { useState, useEffect } from 'react';
import { SCENARIOS, ScenarioConfig } from '../data/scenarios';
import { HistoryItem, User as UserType } from '../types';
import { 
  LEVEL_STAGES, 
  LevelStage, 
  getStreakWithFreeze, 
  getDailyGoalStatus, 
  getIndustryPathProgress 
} from '../utils/gamification';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  PhoneCall, ShieldCheck, Flame, ChevronRight, ChevronLeft, 
  Settings, Building2, User, Globe, Gauge, CheckCircle2, Lock, Unlock, 
  Award, Trophy, AlertCircle, Sparkles, Clock, Target
} from 'lucide-react';

export type CallDifficulty = 'friendly' | 'challenging' | 'hardcore' | 'jefe_final';

interface CallSetupWizardProps {
  currentUser?: UserType | null;
  recentHistory?: HistoryItem[];
  industry: string;
  setIndustry: (id: string) => void;
  difficulty: CallDifficulty;
  setDifficulty: (diff: CallDifficulty) => void;
  language: 'English' | 'Spanish';
  setLanguage: (lang: 'English' | 'Spanish') => void;
  companyName: string;
  setCompanyName: (company: string) => void;
  contactName: string;
  setContactName: (contact: string) => void;
  noiseSuppressionEnabled: boolean;
  setNoiseSuppressionEnabled: (enabled: boolean) => void;
  onStartCall: () => void;
  isConnecting: boolean;
  connectionError: string | null;
}

export default function CallSetupWizard({
  currentUser,
  recentHistory = [],
  industry,
  setIndustry,
  difficulty,
  setDifficulty,
  language: callLanguage,
  setLanguage: setCallLanguage,
  companyName,
  setCompanyName,
  contactName,
  setContactName,
  noiseSuppressionEnabled,
  setNoiseSuppressionEnabled,
  onStartCall,
  isConnecting,
  connectionError
}: CallSetupWizardProps) {
  const { t, language: uiLang } = useLanguage();

  // Wizard step: 1 = Industry, 2 = Level & Language, 3 = Summary & Start
  const [step, setStep] = useState<1 | 2 | 3>(() => (connectionError ? 3 : 1));
  const [showCustomContact, setShowCustomContact] = useState(false);

  useEffect(() => {
    if (connectionError) {
      setStep(3);
    }
  }, [connectionError]);

  // Gamification stats
  const streakData = getStreakWithFreeze(recentHistory);
  const dailyGoal = getDailyGoalStatus(recentHistory);
  const industryProgress = getIndustryPathProgress(recentHistory, industry);

  const activeScenario = SCENARIOS.find(s => s.id === industry) || SCENARIOS[0];

  // Map difficulty to LevelStage
  const currentStage: LevelStage = 
    difficulty === 'jefe_final' ? 'jefe_final' :
    difficulty === 'hardcore' ? 'dificil' :
    difficulty === 'challenging' ? 'medio' : 'facil';

  // Patience based on difficulty
  const patiencePercentage = 
    difficulty === 'friendly' ? 85 : 
    difficulty === 'challenging' ? 65 : 
    difficulty === 'hardcore' ? 45 : 30;

  // Persona name and behavior based on difficulty
  const personaDetails = {
    friendly: {
      role: uiLang === 'en' ? 'Receptive Owner / Partner' : 'Dueño / Socio Receptivo',
      behavior: uiLang === 'en' 
        ? 'Listens with patience, has yard machinery, and answers technical questions.' 
        : 'Escucha con paciencia, tiene unidades en patio y responde a preguntas técnicas.',
      tag: t('diff_level1_name'),
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    challenging: {
      role: uiLang === 'en' ? 'Strict Gatekeeper' : 'Recepcionista / Gatekeeper Estricto',
      behavior: uiLang === 'en'
        ? 'Attempts to deflect the call, asks you to send an email, or queries who is calling.'
        : 'Intenta filtrar la llamada, pide que envíes un correo o pregunta de parte de quién.',
      tag: t('diff_level2_name'),
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    hardcore: {
      role: uiLang === 'en' ? 'Hurried / Demanding Buyer' : 'Comprador Apurado / Exigente',
      behavior: uiLang === 'en'
        ? 'Demands immediate blind ballpark pricing: "Give me a price or I\'m hanging up". Avoid blind quotes.'
        : 'Exige precio inmediato sin enviar fotos: "Dime cuánto pagas o cuelgo".',
      tag: t('diff_level3_name'),
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
    },
    jefe_final: {
      role: uiLang === 'en' ? 'Skeptical General Director (Final Boss)' : 'Gerente General Escéptico (Jefe Final)',
      behavior: uiLang === 'en'
        ? 'Locked into competitor contracts and distrusts brokers. Demands certified rigging and 24h wire transfer proof.'
        : 'Tiene contrato cerrado con la competencia y desconfía de brokers. Exige maniobra y pago 24h comprobable.',
      tag: t('diff_level4_name'),
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
    }
  }[difficulty];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] text-left">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Encabezado Superior con Gamificación: Racha Real, Congelador y Meta Diaria */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <span>{t('wizard_header_badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              {t('wizard_header_title')}
            </h1>
            <p className="text-sm text-slate-600">
              {t('wizard_header_subtitle')}
            </p>
          </div>

          {/* Widgets de Racha, Congelador y Meta */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Racha */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-bold shadow-2xs">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>
                {streakData.streak > 0 
                  ? `${streakData.streak} ${t('home_real_streak')}` 
                  : t('home_streak_start')}
              </span>
            </div>

            {/* Congelador semanal */}
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold shadow-2xs ${
              streakData.freezesRemaining > 0 
                ? 'bg-sky-50 border-sky-200 text-sky-900' 
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>{streakData.freezesRemaining > 0 ? t('home_freeze_ready') : t('home_freeze_used')}</span>
            </div>

            {/* Meta diaria de 3 minutos */}
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-semibold shadow-2xs ${
              dailyGoal.met 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{dailyGoal.met ? (uiLang === 'en' ? 'Goal met (3m)' : 'Meta cumplida (3m)') : (uiLang === 'en' ? 'Daily goal: 3 min' : 'Meta diaria: 3 min')}</span>
            </div>
          </div>
        </div>

        {/* Banner de Aviso de Error de Conexión */}
        {connectionError && (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="text-sm font-bold text-rose-900">
                {uiLang === 'en' ? 'Voice Connection Notice' : 'Aviso de Conexión de Voz'}
              </h2>
              <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
                {connectionError}
              </p>
            </div>
          </div>
        )}

        {/* Indicador de 3 Pasos */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
            
            {/* Paso 1 */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2.5 ${
                step === 1 
                  ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20' 
                  : step > 1 
                    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' 
                    : 'border-slate-200 bg-white opacity-70'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                step === 1 ? 'bg-amber-600 text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">{t('wizard_step1_label')}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">{t('wizard_step1_title')}</span>
              </div>
            </button>

            {/* Paso 2 */}
            <button
              type="button"
              onClick={() => setStep(2)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2.5 ${
                step === 2 
                  ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20' 
                  : step > 2 
                    ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' 
                    : 'border-slate-200 bg-white opacity-70'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                step === 2 ? 'bg-amber-600 text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">{t('wizard_step2_label')}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">{t('wizard_step2_title')}</span>
              </div>
            </button>

            {/* Paso 3 */}
            <button
              type="button"
              onClick={() => setStep(3)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-2.5 ${
                step === 3 
                  ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20' 
                  : 'border-slate-200 bg-white opacity-70'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                step === 3 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                3
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">{t('wizard_step3_label')}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">{t('wizard_step3_title')}</span>
              </div>
            </button>

          </div>
        </div>

        {/* CONTENIDO DEL PASO 1: Elegir Industria con Progreso de Niveles */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900">
                  {t('wizard_step1_label')}: {t('wizard_step1_title')}
                </h2>
                <p className="text-sm text-slate-600">
                  {t('wizard_step1_subtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {SCENARIOS.map((scen) => {
                const isSelected = scen.id === industry;
                const pathProgress = getIndustryPathProgress(recentHistory, scen.id);
                const levelsPassed = pathProgress.completedLevels.length;

                return (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => {
                      setIndustry(scen.id);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                      isSelected 
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-base font-display">
                        {uiLang === 'en' ? (scen.titleEn || scen.title) : scen.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {pathProgress.isCompleted ? (
                          <span className="text-xs font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-purple-600" />
                            <span>{t('roadmap_mastered')}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            {levelsPassed}/4 {uiLang === 'en' ? 'levels' : 'niveles'}
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                            {uiLang === 'en' ? 'Active' : 'Activa'}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                      <strong className="text-slate-800 font-semibold">{uiLang === 'en' ? 'Equipment:' : 'Equipos:'}</strong> {uiLang === 'en' ? (scen.machineryEn || scen.machinery) : scen.machinery}
                    </p>

                    {/* Barra de progreso de niveles por industria */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        {['facil', 'medio', 'dificil', 'jefe_final'].map((stg, idx) => {
                          const done = pathProgress.completedLevels.includes(stg as LevelStage);
                          return (
                            <div 
                              key={idx}
                              title={`${stg}: ${done ? '≥70' : 'Pending'}`}
                              className={`w-6 h-2 rounded-full ${
                                done ? 'bg-emerald-500' : 'bg-slate-200'
                              }`} 
                            />
                          );
                        })}
                      </div>
                      <span className="text-slate-500 truncate max-w-[200px]">
                        {uiLang === 'en' ? 'Next: ' : 'Siguiente: '}{pathProgress.nextLevel.toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>{t('wizard_step1_next')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO DEL PASO 2: Los 4 Niveles de la Industria + Idioma */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-display text-slate-900">
                  {t('wizard_step2_title')}: {uiLang === 'en' ? (activeScenario.titleEn || activeScenario.title) : activeScenario.title}
                </h2>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                  {uiLang === 'en' ? 'Passing: Score ≥ 70' : 'Aprobación: Score ≥ 70'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {t('wizard_step2_subtitle')}
              </p>
            </div>

            {/* Los 4 Niveles de Dificultad (Duolingo Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Nivel 1: Fácil */}
              <button
                type="button"
                onClick={() => setDifficulty('friendly')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 relative ${
                  difficulty === 'friendly'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">{t('diff_level1_name')}</span>
                    {industryProgress.completedLevels.includes('facil') && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {t('diff_level1_tag')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                  {t('diff_level1_desc')}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{uiLang === 'en' ? 'Initial patience: 85%' : 'Paciencia inicial: 85%'}</span>
                  <span>{uiLang === 'en' ? 'Best score: ' : 'Mejor nota: '}{industryProgress.bestScores.facil || 0} pts</span>
                </div>
              </button>

              {/* Nivel 2: Medio */}
              <button
                type="button"
                onClick={() => setDifficulty('challenging')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 relative ${
                  difficulty === 'challenging'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">{t('diff_level2_name')}</span>
                    {industryProgress.completedLevels.includes('medio') && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {t('diff_level2_tag')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                  {t('diff_level2_desc')}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{uiLang === 'en' ? 'Initial patience: 65%' : 'Paciencia inicial: 65%'}</span>
                  <span>{uiLang === 'en' ? 'Best score: ' : 'Mejor nota: '}{industryProgress.bestScores.medio || 0} pts</span>
                </div>
              </button>

              {/* Nivel 3: Difícil */}
              <button
                type="button"
                onClick={() => setDifficulty('hardcore')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 relative ${
                  difficulty === 'hardcore'
                    ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">{t('diff_level3_name')}</span>
                    {industryProgress.completedLevels.includes('dificil') && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                    {t('diff_level3_tag')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                  {t('diff_level3_desc')}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{uiLang === 'en' ? 'Initial patience: 45%' : 'Paciencia inicial: 45%'}</span>
                  <span>{uiLang === 'en' ? 'Best score: ' : 'Mejor nota: '}{industryProgress.bestScores.dificil || 0} pts</span>
                </div>
              </button>

              {/* Nivel 4: Jefe Final */}
              <button
                type="button"
                onClick={() => setDifficulty('jefe_final')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 relative ${
                  difficulty === 'jefe_final'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">{t('diff_level4_name')}</span>
                    {industryProgress.completedLevels.includes('jefe_final') && (
                      <Trophy className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    {t('diff_level4_tag')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                  {t('diff_level4_desc')}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{uiLang === 'en' ? 'Initial patience: 30%' : 'Paciencia inicial: 30%'}</span>
                  <span>{uiLang === 'en' ? 'Best score: ' : 'Mejor nota: '}{industryProgress.bestScores.jefe_final || 0} pts</span>
                </div>
              </button>

            </div>

            {/* Selector de Idioma de la LLamada */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {t('lang_call_heading')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCallLanguage('English')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    callLanguage === 'English'
                      ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{t('lang_en_label')}</span>
                    <span className="text-xs text-slate-500">{t('lang_en_sub')}</span>
                  </div>
                  <Globe className={`w-5 h-5 ${callLanguage === 'English' ? 'text-amber-600' : 'text-slate-400'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setCallLanguage('Spanish')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    callLanguage === 'Spanish'
                      ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{t('lang_es_label')}</span>
                    <span className="text-xs text-slate-500">{t('lang_es_sub')}</span>
                  </div>
                  <Globe className={`w-5 h-5 ${callLanguage === 'Spanish' ? 'text-amber-600' : 'text-slate-400'}`} />
                </button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('wizard_step2_back')}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                <span>{t('wizard_step2_next')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO DEL PASO 3: Resumen y Botón Grande "Iniciar Llamada" */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">
                {t('wizard_step3_title')}
              </h2>
              <p className="text-sm text-slate-600">
                {t('wizard_step3_subtitle')}
              </p>
            </div>

            {/* Ficha Resumen del Cliente y Persona */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              
              {/* Badge de Personalidad del Cliente */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${personaDetails.badgeColor}`}>
                    {personaDetails.tag}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{personaDetails.role}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {t('client_patience_label')}: <strong className="text-slate-900 font-mono">{patiencePercentage}%</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block uppercase">{t('client_industry_label')}:</span>
                  <span className="font-bold text-slate-900 text-base">{uiLang === 'en' ? (activeScenario.titleEn || activeScenario.title) : activeScenario.title}</span>
                  <p className="text-xs text-slate-600 mt-0.5">{uiLang === 'en' ? (activeScenario.machineryEn || activeScenario.machinery) : activeScenario.machinery}</p>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-semibold block uppercase">{t('client_contact_label')}:</span>
                  <span className="font-bold text-slate-900 text-base">{companyName}</span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {uiLang === 'en' ? 'Contact: ' : 'Contacto: '}<strong className="text-slate-800">{contactName}</strong> ({activeScenario.defaults[callLanguage].roleTitle})
                  </p>
                </div>

                <div className="sm:col-span-2 p-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">{t('client_behavior_label')}:</span>
                  <p className="text-slate-600 leading-relaxed">{personaDetails.behavior}</p>
                </div>
              </div>

              {/* Botón Discreto para Personalizar Cliente */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCustomContact(!showCustomContact)}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{showCustomContact ? t('client_custom_hide') : t('client_custom_btn')}</span>
                </button>

                {showCustomContact && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/80">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">{t('client_company_name')}</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">{t('client_contact_name')}</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error de Conexión si hubo */}
            {connectionError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                <strong>{uiLang === 'en' ? 'Connection error:' : 'Error de conexión:'}</strong> {connectionError}
              </div>
            )}

            {/* Controles de Navegación y Botón Gigante */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('wizard_step2_back')}</span>
              </button>

              <button
                type="button"
                onClick={onStartCall}
                disabled={isConnecting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold text-base shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <PhoneCall className="w-5 h-5" />
                <span>{isConnecting ? t('wizard_step3_connecting') : t('wizard_step3_start')}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
