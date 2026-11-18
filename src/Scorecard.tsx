import React, { useState, useEffect } from 'react';
import { 
  Award, ChevronUp, ChevronDown, Check, X, 
  AlertTriangle, ThumbsUp, ThumbsDown, RotateCcw, FileText, Printer, ShieldCheck,
  Headphones, Download, ExternalLink, Gauge, Target, Sparkles, HelpCircle, Trophy, Flame
} from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { calculateCallXP, getCoachReaction, getIndustryPathProgress } from './utils/gamification';
import { calculateTranscriptMetrics } from './utils/callAnalytics';
import { useLanguage } from './i18n/LanguageContext';

interface ScorecardProps {
  evaluation: {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    checklist: {
      openingAndPresentation?: boolean;
      attentionGrabbing?: boolean;
      needsIdentification?: boolean;
      activeListeningAndQuestions?: boolean;
      proposalClarity?: boolean;
      commercialValueArgumentation?: boolean;
      objectionHandling?: boolean;
      negotiationWithoutPressure?: boolean;
      unexpectedOpportunities?: boolean;
      closingAndNextStep?: boolean;
      gatekeeperBypass?: boolean;
      kpOpening?: boolean;
      equipmentQualification?: boolean;
      futureReference?: boolean;
      priceAndAssets?: boolean;
      nextStepsSecure?: boolean;
    };
    objectionsHandled: { objection: string; handledWell: boolean; feedback: string }[];
    recommendations: string[];
    transcript?: { role: string; text: string }[];
    difficulty?: string;
  };
  onReset: () => void;
  customTranscripts?: { id: number | string; role: string; text: string }[];
  audioId?: string;
  audioBlob?: Blob | null;
  audioUrl?: string;
  conversationId?: string;
  scenarioTitle?: string;
  difficulty?: string;
  durationSeconds?: number;
  industry?: string;
  recentHistory?: any[];
}

export default function Scorecard({ 
  evaluation, 
  onReset, 
  customTranscripts,
  audioId,
  audioBlob,
  audioUrl,
  conversationId,
  scenarioTitle,
  difficulty,
  durationSeconds = 60,
  industry,
  recentHistory = []
}: ScorecardProps) {
  const { t, language: uiLang } = useLanguage();
  const [showTranscript, setShowTranscript] = useState(false);
  const [openSections, setOpenSections] = useState({
    criteria: true,
    strengthsWeaknesses: true,
    objections: true,
    recommendations: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev [section] }));
  };

  const transcriptLines = evaluation.transcript || customTranscripts?.map(t => ({
    role: t.role,
    text: t.text
  })) || [];

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const relativeAudioPath = audioUrl 
    || (conversationId ? `/api/elevenlabs/conversation-audio/${conversationId}` : undefined)
    || (audioId ? `/api/audios/${audioId}` : undefined);

  const effectiveAudioUrl = relativeAudioPath;
  const fullAudioDownloadUrl = relativeAudioPath 
    ? (relativeAudioPath.startsWith('http') ? relativeAudioPath : `${origin}${relativeAudioPath}`)
    : undefined;

  const isPassing = evaluation.score >= 70;
  const effectiveDifficulty = difficulty || (evaluation as any)?.difficulty;

  const difficultyConfig = effectiveDifficulty === 'hardcore'
    ? { label: uiLang === 'en' ? 'Hard' : 'Difícil', desc: uiLang === 'en' ? 'Skeptical and blunt prospect' : 'Cliente escéptico y cortante', badge: 'bg-rose-50 text-rose-800 border-rose-200' }
    : effectiveDifficulty === 'challenging'
      ? { label: uiLang === 'en' ? 'Medium' : 'Medio', desc: uiLang === 'en' ? 'Busy prospect, gets straight to the point' : 'Cliente ocupado, va directo al grano', badge: 'bg-amber-50 text-amber-800 border-amber-200' }
      : { label: uiLang === 'en' ? 'Easy' : 'Fácil', desc: uiLang === 'en' ? 'Receptive and friendly owner' : 'Cliente receptivo y amable', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };

  // Prioridad #1: "Lo único que debes mejorar la próxima vez"
  const singlePriorityImprovement = 
    (evaluation.recommendations && evaluation.recommendations.length > 0)
      ? evaluation.recommendations[0]
      : (evaluation.weaknesses && evaluation.weaknesses.length > 0)
        ? evaluation.weaknesses[0]
        : (uiLang === 'en' 
            ? 'Keep control of pacing: qualify meter hours and condition before discussing pricing.' 
            : 'Mantén el control del ritmo: califica primero horas y modelo antes de hablar de números.');

  const handleDownloadPdf = () => {
    setShowTranscript(true);
    setOpenSections({
      criteria: true,
      strengthsWeaknesses: true,
      objections: true,
      recommendations: true,
    });
    document.body.classList.add('is-printing-pdf');

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('is-printing-pdf');
      }, 1000);
    }, 150);
  };

  useEffect(() => {
    const onBefore = () => {
      setShowTranscript(true);
      document.body.classList.add('is-printing-pdf');
    };
    const onAfter = () => {
      document.body.classList.remove('is-printing-pdf');
    };

    window.addEventListener('beforeprint', onBefore);
    window.addEventListener('afterprint', onAfter);
    return () => {
      window.removeEventListener('beforeprint', onBefore);
      window.removeEventListener('afterprint', onAfter);
    };
  }, []);

  const xpInfo = calculateCallXP(evaluation.score, durationSeconds);
  const coachReaction = getCoachReaction(evaluation.score, xpInfo.xp, 1);
  const analytics = calculateTranscriptMetrics(transcriptLines, durationSeconds);

  return (
    <div id="scorecard-print-area" className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left text-slate-900 bg-[#F8F9FA]">
      
      {/* 1. Encabezado de Evaluación */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print-avoid-break">
        <div className="flex items-start sm:items-center gap-4">
          <div className={`p-3.5 rounded-2xl shrink-0 border ${
            isPassing 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 tracking-tight">
                {t('score_title')}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isPassing 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isPassing ? t('score_pass') : t('score_fail')}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${difficultyConfig.badge}`}>
                <Gauge className="w-3.5 h-3.5" />
                <span>{uiLang === 'en' ? 'Difficulty: ' : 'Dificultad: '}{difficultyConfig.label}</span>
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-1">
              {scenarioTitle 
                ? (uiLang === 'en' ? `Practiced scenario: ${scenarioTitle}` : `Escenario practicado: ${scenarioTitle}`)
                : (uiLang === 'en' 
                    ? 'Sales diagnosis of cold opening, gatekeeper deflection, qualification and closing'
                    : 'Diagnóstico comercial de apertura, desvío de gatekeeper, calificación y cierre')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 no-print shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>{t('score_btn_pdf')}</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('score_btn_retry')}</span>
          </button>
        </div>
      </div>

      {/* Recompensa XP & Feedback de Coach (Estilo Duolingo B2B) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {coachReaction.badge}
              </span>
              {isPassing && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{uiLang === 'en' ? '✓ Passed Level (≥ 70 pts)!' : '¡Nivel Aprobado (≥ 70 pts)!'}</span>
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {coachReaction.title}
            </h2>
            <p className="text-sm text-slate-600">
              {coachReaction.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shrink-0 self-stretch sm:self-auto justify-center">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="font-extrabold text-base font-mono">+{xpInfo.xp} XP</span>
        </div>
      </div>

      {/* 2. REQUISITO FASE 2: Nota Global + "Lo único que debes mejorar la próxima vez" + Botón Principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Nota Global (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            {t('score_overall_label')}
          </span>

          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="58"
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="58"
                strokeWidth="10"
                strokeDasharray={364}
                strokeDashoffset={364 - (364 * Math.min(Math.max(evaluation.score, 0), 100)) / 100}
                strokeLinecap="round"
                stroke={
                  evaluation.score >= 80 
                    ? "#059669" 
                    : evaluation.score >= 60 
                      ? "#D97706" 
                      : "#DC2626"
                }
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-display font-extrabold text-slate-900 font-mono">
                {evaluation.score}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{uiLang === 'en' ? 'of 100' : 'de 100'}</span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              evaluation.score >= 80 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : evaluation.score >= 60 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {evaluation.score >= 80 ? (uiLang === 'en' ? 'Passed' : 'Nivel Aprobado') : evaluation.score >= 60 ? (uiLang === 'en' ? 'Reinforcement Recommended' : 'Refuerzo Recomendado') : (uiLang === 'en' ? 'Practice Needed' : 'Práctica Necesaria')}
            </span>
          </div>
        </div>

        {/* Bloque Destacado: "Lo único que debes mejorar la próxima vez" + CTA (8 cols) */}
        <div className="md:col-span-8 bg-white rounded-2xl p-6 sm:p-7 border-2 border-amber-500/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('score_priority_tag')}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t('score_priority_sub')}
              </span>
            </div>

            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              "{singlePriorityImprovement}"
            </p>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-700 block mb-1">{t('score_ai_diag')}</span>
              <p className="text-sm text-slate-600 leading-relaxed">
                {evaluation.summary}
              </p>
            </div>
          </div>

          {/* Botón Principal: Practicar de nuevo este escenario */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('score_btn_retry')}</span>
            </button>
            <span className="text-xs text-slate-500">
              {t('score_retry_sub')}
            </span>
          </div>
        </div>

      </div>

      {/* Reproductor de Audio si existe grabación */}
      {(audioId || audioBlob || effectiveAudioUrl) && (
        <div className="no-print">
          <AudioPlayer 
            audioId={audioId}
            audioBlob={audioBlob}
            audioUrl={effectiveAudioUrl}
            title={t('score_audio_title')}
            subtitle={t('score_audio_sub')}
          />
        </div>
      )}

      {/* 3. MÉTRICAS OBJETIVAS POR CÓDIGO (Sin IA, Deterministas) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('metrics_title')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {t('metrics_sub')}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {uiLang === 'en' ? 'Duration: ' : 'Duración: '}{Math.floor(analytics.durationSeconds / 60)}m {analytics.durationSeconds % 60}s
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Proporción de Habla */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t('metrics_ratio_label')}
            </span>
            <div className="text-lg font-extrabold font-display text-slate-900">
              {analytics.userSpeechRatio}% {uiLang === 'en' ? 'you' : 'tú'} / {analytics.prospectSpeechRatio}% {uiLang === 'en' ? 'prospect' : 'cliente'}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
              <div className="bg-amber-500 h-full" style={{ width: `${analytics.userSpeechRatio}%` }} />
              <div className="bg-slate-400 h-full" style={{ width: `${analytics.prospectSpeechRatio}%` }} />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${
              analytics.balanceFeedback.status === 'optimal'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {analytics.balanceFeedback.label}
            </span>
          </div>

          {/* Ritmo de Habla (WPM) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t('metrics_pacing_label')}
            </span>
            <div className="text-lg font-extrabold font-display text-slate-900">
              {analytics.userWpm} <span className="text-xs font-normal text-slate-500">{t('metrics_wpm_unit')}</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-1">
              {analytics.pacingFeedback.description}
            </p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${
              analytics.pacingFeedback.status === 'optimal'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {analytics.pacingFeedback.label}
            </span>
          </div>

          {/* Muletillas Detectadas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t('metrics_fillers_label')}
            </span>
            <div className="text-lg font-extrabold font-display text-slate-900">
              {analytics.fillerWordsCount} <span className="text-xs font-normal text-slate-500">{t('metrics_found_unit')}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analytics.fillerWordsFound.length > 0 ? (
                analytics.fillerWordsFound.slice(0, 3).map((f, i) => (
                  <span key={i} className="text-xs font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                    "{f.word}" ({f.count})
                  </span>
                ))
              ) : (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {t('metrics_zero_fillers')}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 block">
              {analytics.fillerWordsCount > 5 ? (uiLang === 'en' ? 'Use silent pauses' : 'Haz pausas silenciosas') : (uiLang === 'en' ? 'Clean cadence' : 'Dicción limpia')}
            </span>
          </div>

          {/* Interrupciones */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              {t('metrics_turns_label')}
            </span>
            <div className="text-lg font-extrabold font-display text-slate-900">
              {analytics.interruptionsEstimated} <span className="text-xs font-normal text-slate-500">{uiLang === 'en' ? 'overlaps' : 'interrupciones'}</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-1">
              {analytics.totalWords} {uiLang === 'en' ? 'words spoken' : 'palabras en diálogo'}
            </p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${
              analytics.interruptionsEstimated <= 1
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {analytics.interruptionsEstimated <= 1 ? (uiLang === 'en' ? 'Respectful listening' : 'Escucha respetuosa') : (uiLang === 'en' ? 'Avoid cutting prospect off' : 'Evita cortar al cliente')}
            </span>
          </div>

        </div>
      </div>

      {/* Detalle por Criterios en Secciones Plegables (Acordeón) */}
      <div className="space-y-4">
        
        {/* SECCIÓN 1 PLEGABLE: Etapas de la Llamada y Criterios Evaluados */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('criteria')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  {t('score_criteria_title')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('score_criteria_sub')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                {openSections.criteria ? (uiLang === 'en' ? 'Collapse' : 'Plegar') : (uiLang === 'en' ? 'Expand' : 'Desplegar')}
              </span>
              {openSections.criteria ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </div>
          </button>

          {openSections.criteria && (
            <div className="p-5 pt-0 border-t border-slate-100 space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3">
                {((evaluation.checklist as any)?.openingAndPresentation !== undefined
                  ? [
                      { key: 'openingAndPresentation', label: uiLang === 'en' ? '1. Professional opening & gatekeeper deflection' : '1. Apertura profesional y desvío de recepcionista' },
                      { key: 'attentionGrabbing', label: uiLang === 'en' ? '2. Commercial hook & immediate hook' : '2. Gancho comercial e impacto inicial' },
                      { key: 'needsIdentification', label: uiLang === 'en' ? '3. Surplus fleet identification' : '3. Detección de flota en desuso o renovación' },
                      { key: 'activeListeningAndQuestions', label: uiLang === 'en' ? '4. Key technical qualification (hours, model, condition)' : '4. Preguntas técnicas clave (horómetro, modelo, condición)' },
                      { key: 'proposalClarity', label: uiLang === 'en' ? '5. Proposal clarity (wire transfer / free pickup)' : '5. Claridad de propuesta (pago por transferencia / retiro)' },
                      { key: 'commercialValueArgumentation', label: uiLang === 'en' ? '6. Zero friction value (0% commission for owner)' : '6. Valor sin fricción (0% comisión para el cliente)' },
                      { key: 'objectionHandling', label: uiLang === 'en' ? '7. Crisp objection handling (Miami yard / photos)' : '7. Manejo ágil de objeciones (bodega Miami / fotos)' },
                      { key: 'negotiationWithoutPressure', label: uiLang === 'en' ? '8. Fluid consultative negotiation without pressure' : '8. Negociación fluida sin presionar de más' },
                      { key: 'unexpectedOpportunities', label: uiLang === 'en' ? '9. Future referral / cross-industry pipeline' : '9. Venta cruzada o referencia a futuro si no vende hoy' },
                      { key: 'closingAndNextStep', label: uiLang === 'en' ? '10. Agreed closing (photo commitment of serial plate)' : '10. Cierre acordado (compromiso de fotos de placa técnica)' }
                    ]
                  : [
                      { key: 'gatekeeperBypass', label: uiLang === 'en' ? 'Gatekeeper bypass with name and role' : 'Desvío de recepcionista con nombre y cargo' },
                      { key: 'kpOpening', label: uiLang === 'en' ? 'Clear introduction and goal with key decision maker' : 'Presentación y objetivo claro con la persona que decide' },
                      { key: 'equipmentQualification', label: uiLang === 'en' ? 'Qualification questions (make, model, year, hours)' : 'Preguntas de calificación (marca, modelo, año, horas)' },
                      { key: 'futureReference', label: uiLang === 'en' ? 'Future reference questions if not selling today' : 'Preguntas de referencia futura si no vende hoy' },
                      { key: 'priceAndAssets', label: uiLang === 'en' ? 'Request for photos and 24h formal purchase offer' : 'Solicitud de fotos y proceso de oferta formal en 24h' },
                      { key: 'objectionHandling', label: uiLang === 'en' ? 'Confident objection response' : 'Respuesta sin titubeos a objeciones' },
                      { key: 'nextStepsSecure', label: uiLang === 'en' ? 'Agreed next step and direct contact saved' : 'Cierre de siguiente paso o contacto directo pactado' }
                    ]
                ).map((item) => {
                  const checked = (evaluation.checklist as any)?.[item.key] === true;
                  return (
                    <div 
                      key={item.key} 
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                        checked ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-slate-800 font-medium pr-3 leading-snug">{item.label}</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 ${
                        checked 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {checked ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{uiLang === 'en' ? 'Passed' : 'Cumplido'}</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{uiLang === 'en' ? 'Missed' : 'Omitido'}</span>
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN 2 PLEGABLE: Fortalezas y Aspectos por Mejorar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('strengthsWeaknesses')}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <ThumbsUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">
                  {uiLang === 'en' ? 'Strengths & Areas to Improve' : 'Fortalezas y aspectos por corregir'}
                </h2>
                <p className="text-xs text-slate-500">
                  {uiLang === 'en' ? 'Key call milestones vs observed weaknesses' : 'Puntos destacados de tu llamada frente a debilidades observadas'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                {openSections.strengthsWeaknesses ? (uiLang === 'en' ? 'Collapse' : 'Plegar') : (uiLang === 'en' ? 'Expand' : 'Desplegar')}
              </span>
              {openSections.strengthsWeaknesses ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </div>
          </button>

          {openSections.strengthsWeaknesses && (
            <div className="p-5 pt-0 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                {/* Fortalezas */}
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <ThumbsUp className="w-4 h-4 text-emerald-700" />
                    <span>{uiLang === 'en' ? 'Observed Strengths' : 'Aciertos observados'}</span>
                  </div>
                  <ul className="space-y-2">
                    {evaluation.strengths?.map((str: string, idx: number) => (
                      <li key={idx} className="text-slate-800 text-sm flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-700 font-bold mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                    {(!evaluation.strengths || evaluation.strengths.length === 0) && (
                      <li className="text-slate-500 text-sm italic">{uiLang === 'en' ? 'No specific strengths recorded.' : 'No se registraron fortalezas específicas.'}</li>
                    )}
                  </ul>
                </div>

                {/* Aspectos por corregir */}
                <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <ThumbsDown className="w-4 h-4 text-amber-700" />
                    <span>{uiLang === 'en' ? 'Areas to Improve' : 'Aspectos por corregir'}</span>
                  </div>
                  <ul className="space-y-2">
                    {evaluation.weaknesses?.map((weak: string, idx: number) => (
                      <li key={idx} className="text-slate-800 text-sm flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-700 font-bold mt-0.5">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                    {(!evaluation.weaknesses || evaluation.weaknesses.length === 0) && (
                      <li className="text-slate-500 text-sm italic">{uiLang === 'en' ? 'No critical weaknesses in this session.' : 'Sin debilidades críticas en esta sesión.'}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECCIÓN 3 PLEGABLE: Manejo de Objeciones del Cliente */}
        {evaluation.objectionsHandled && evaluation.objectionsHandled.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('objections')}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-slate-900">
                    {uiLang === 'en' ? `Objection Handling (${evaluation.objectionsHandled.length})` : `Manejo de objeciones (${evaluation.objectionsHandled.length})`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {uiLang === 'en' ? 'How you responded to buyer friction and hesitation' : 'Cómo respondiste ante los frenos y dudas del prospecto'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  {openSections.objections ? (uiLang === 'en' ? 'Collapse' : 'Plegar') : (uiLang === 'en' ? 'Expand' : 'Desplegar')}
                </span>
                {openSections.objections ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </div>
            </button>

            {openSections.objections && (
              <div className="p-5 pt-0 border-t border-slate-100 space-y-3 pt-3">
                {evaluation.objectionsHandled.map((obj: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-slate-900 text-sm">"{obj.objection}"</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        obj.handledWell 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {obj.handledWell ? <Check className="w-3 h-3 stroke-[2.5]" /> : <AlertTriangle className="w-3 h-3" />}
                        {obj.handledWell ? (uiLang === 'en' ? 'Well Handled' : 'Bien resuelta') : (uiLang === 'en' ? 'Needs Adjustment' : 'Requiere ajuste')}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{obj.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 4 PLEGABLE: Todas las Recomendaciones */}
        {evaluation.recommendations && evaluation.recommendations.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('recommendations')}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-slate-900">
                    {uiLang === 'en' ? 'Action Plan for Next Call' : 'Plan de acción para la próxima llamada'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {uiLang === 'en' ? 'Tactical coach advice for your next simulated session' : 'Consejos tácticos del coach para tu siguiente intento'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  {openSections.recommendations ? (uiLang === 'en' ? 'Collapse' : 'Plegar') : (uiLang === 'en' ? 'Expand' : 'Desplegar')}
                </span>
                {openSections.recommendations ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </div>
            </button>

            {openSections.recommendations && (
              <div className="p-5 pt-0 border-t border-slate-100 space-y-2.5 pt-3">
                {evaluation.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-sm">
                    <div className="shrink-0 w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 5 PLEGABLE: Transcripción Completa */}
        {transcriptLines.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print-break-before">
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-slate-900">
                    {uiLang === 'en' 
                      ? `Full Dialogue Transcript (${transcriptLines.length} turns)` 
                      : `Transcripción completa del diálogo (${transcriptLines.length} intervenciones)`}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {uiLang === 'en' ? 'Review exactly what you said and how the buyer responded' : 'Revisa exactamente qué dijiste y qué respondió el prospecto'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {showTranscript ? (uiLang === 'en' ? 'Hide' : 'Ocultar') : (uiLang === 'en' ? 'View transcript' : 'Ver transcripción')}
                </span>
                {showTranscript ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </div>
            </button>

            <div className={`p-5 pt-0 border-t border-slate-100 space-y-3 max-h-[480px] overflow-y-auto ${showTranscript ? 'block' : 'hidden print:block'}`}>
              <div className="space-y-3 pt-3">
                {transcriptLines.map((msg: any, idx: number) => {
                  const isUser = msg.role === 'user' || msg.role === 'Trainee' || msg.role === 'Trainee (Sales Rep)' || msg.role === 'agent';
                  const roleLabel = isUser 
                    ? (uiLang === 'en' ? 'You (Sales Rep)' : 'Tú (Vendedor JYC)') 
                    : (uiLang === 'en' ? 'Simulated Prospect' : 'Cliente Simulador');
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                        isUser 
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                          : 'bg-slate-100 text-slate-900 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/20">
                          <span className={`text-xs font-bold ${isUser ? 'text-amber-100' : 'text-slate-600'}`}>
                            {roleLabel}
                          </span>
                          <span className="text-xs opacity-75 font-mono">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
