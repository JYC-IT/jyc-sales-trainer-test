import React, { useState, useRef, useEffect } from 'react';
import { 
  PhoneOff, Mic, MicOff, Volume2, ShieldCheck, 
  BookOpen, X, AlertCircle, ChevronRight, CheckCircle2, 
  User, Building2, Flame, Copy, Check
} from 'lucide-react';
import SiriWaveVisualizer from './SiriWaveVisualizer';
import { QUICK_CALL_CHEATSHEET } from '../data/playbookContent';
import { useLanguage } from '../i18n/LanguageContext';

interface TranscriptItem {
  id: number;
  role: 'user' | 'agent' | 'ai';
  text: string;
}

interface ActiveCallViewProps {
  contactName: string;
  companyName: string;
  roleTitle: string;
  scenarioTitle: string;
  objective: string;
  difficulty: 'friendly' | 'challenging' | 'hardcore' | 'jefe_final';
  language: 'English' | 'Spanish';
  callDuration: number;
  formatDuration: (sec: number) => string;
  interestScore: number;
  isConnected: boolean;
  isConnecting: boolean;
  unexpectedDisconnect: boolean;
  isSpeaking: boolean;
  isListening?: boolean;
  isMuted: boolean;
  setMuted?: (muted: boolean) => void;
  onToggleMute: () => void;
  onEndCall: () => void;
  onForceTurn: () => void;
  transcripts: TranscriptItem[];
  whisperAlert: string | null;
  aiVolume: number;
  onVolumeChange: (vol: number) => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  micVolume?: number;
}

export default function ActiveCallView({
  contactName,
  companyName,
  roleTitle,
  scenarioTitle,
  objective,
  difficulty,
  language: callLanguage,
  callDuration,
  formatDuration,
  interestScore,
  isConnected,
  isConnecting,
  unexpectedDisconnect,
  isSpeaking,
  isListening,
  isMuted,
  setMuted,
  onToggleMute,
  onEndCall,
  onForceTurn,
  transcripts,
  whisperAlert,
  aiVolume,
  onVolumeChange,
  sfxEnabled,
  onToggleSfx,
  micVolume = 0
}: ActiveCallViewProps) {
  const { t, language: uiLang } = useLanguage();
  const [showHelperDrawer, setShowHelperDrawer] = useState(false);
  const [helperTab, setHelperTab] = useState<'opening' | 'qualify' | 'objections'>('opening');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Push-to-Talk (Modo Oficina) state
  const [isPttMode, setIsPttMode] = useState<boolean>(false);
  const [isPttPressed, setIsPttPressed] = useState<boolean>(false);

  // When PTT mode is toggled
  const handleTogglePttMode = () => {
    const next = !isPttMode;
    setIsPttMode(next);
    if (next) {
      setMuted?.(true);
    } else {
      setMuted?.(false);
    }
  };

  // Keyboard Spacebar listener for PTT
  useEffect(() => {
    if (!isConnected || !isPttMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        if (!e.repeat) {
          setIsPttPressed(true);
          setMuted?.(false);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        setIsPttPressed(false);
        setMuted?.(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isConnected, isPttMode, setMuted, onForceTurn]);

  const handlePttDown = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isConnected || !isPttMode) return;
    setIsPttPressed(true);
    setMuted?.(false);
  };

  const handlePttUp = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isConnected || !isPttMode) return;
    setIsPttPressed(false);
    setMuted?.(true);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const difficultyLabel = difficulty === 'friendly' 
    ? (uiLang === 'en' ? 'Easy (Receptive)' : 'Fácil (Receptivo)')
    : difficulty === 'challenging' 
      ? (uiLang === 'en' ? 'Medium (Busy)' : 'Medio (Ocupado)')
      : difficulty === 'hardcore'
        ? (uiLang === 'en' ? 'Hard (Skeptical)' : 'Difícil (Escéptico)')
        : (uiLang === 'en' ? 'Final Boss' : 'Jefe Final');

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#F8F9FA] p-3 sm:p-5 gap-3 max-w-7xl mx-auto w-full text-left">
      
      {/* 1. Barra de Control de la Llamada (Estilo Claro y Ejecutivo per DESIGN.md) */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        
        {/* Izquierda: Estado de la llamada y Cronómetro */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
            unexpectedDisconnect 
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : isConnecting
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              unexpectedDisconnect 
                ? 'bg-rose-500' 
                : isConnecting 
                ? 'bg-amber-500 animate-ping' 
                : 'bg-emerald-500 animate-pulse'
            }`} />
            <span>
              {unexpectedDisconnect ? t('call_interrupted') : isConnecting ? t('call_connecting') : t('call_in_progress')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 font-mono text-slate-900 text-sm font-bold">
            <span className="text-xs text-slate-500 font-sans font-medium uppercase">{t('call_time_label')}</span>
            <span>{formatDuration(callDuration)}</span>
          </div>
        </div>

        {/* Centro: Medidor Visible de Paciencia / Interés del Cliente */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase font-bold text-slate-500">{t('call_patience_label')}</span>
            <span className={`text-sm font-extrabold font-mono ${
              interestScore >= 70 ? 'text-emerald-700' :
              interestScore >= 45 ? 'text-amber-700' : 'text-rose-700'
            }`}>
              {interestScore}%
            </span>
          </div>
          <div className="w-20 sm:w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                interestScore >= 70 ? 'bg-emerald-500' :
                interestScore >= 45 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(8, Math.min(100, interestScore))}%` }}
            />
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md transition-colors ${
            interestScore >= 70 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
            interestScore >= 45 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            interestScore > 20 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
            'bg-rose-600 text-white font-extrabold animate-pulse'
          }`}>
            {interestScore >= 70 
              ? (uiLang === 'en' ? '🟢 Receptive' : '🟢 Receptivo') :
             interestScore >= 45 
              ? (uiLang === 'en' ? '🟡 Rushed / Impatient' : '🟡 Con Afán (Impaciente)') :
             interestScore > 20 
              ? (uiLang === 'en' ? '🟠 Annoyed / Skeptical' : '🟠 Molesto / Escéptico') :
                (uiLang === 'en' ? '🔴 Hanging up soon!' : '🔴 ¡A punto de colgar!')}
          </span>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            · {difficultyLabel}
          </span>
        </div>

        {/* Derecha: Botón de Ayudas y Colgar */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowHelperDrawer(!showHelperDrawer)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              showHelperDrawer 
                ? 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-500/20' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">{showHelperDrawer ? t('call_close_playbook') : t('call_open_playbook')}</span>
          </button>

          <button
            type="button"
            onClick={onEndCall}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{t('call_hang_up')}</span>
          </button>
        </div>
      </div>

      {/* 2. Cuerpo Principal de la Llamada: Tarjeta Cliente + Visualizador Siri + Transcripción */}
      <div className="flex-1 flex min-h-0 gap-4 overflow-hidden relative">
        
        {/* Panel Central: Llamada Limpia */}
        <div className="flex-1 flex flex-col min-h-0 gap-3 overflow-hidden">
          
          {/* Tarjeta del Prospecto (Cliente) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-display font-bold text-base shrink-0">
                {contactName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{contactName}</span>
                  <span className="text-slate-500 font-normal">· {companyName}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {roleTitle}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  <strong className="text-amber-800 font-semibold">{uiLang === 'en' ? 'Call Goal:' : 'Meta de la llamada:'}</strong> {objective}
                </p>
              </div>
            </div>

            {/* Estado de Voz Interactivo */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border self-start sm:self-center shrink-0 transition-all ${
              isListening
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20 shadow-2xs'
                : isSpeaking
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                isListening ? 'bg-emerald-500 animate-ping' :
                isSpeaking ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
              }`} />
              <span className="text-xs font-bold">
                {isListening ? t('call_status_listening') :
                 isSpeaking ? t('call_status_speaking') : 
                 isMuted ? t('call_status_muted') : t('call_status_standby')}
              </span>
            </div>
          </div>

          {/* Alerta de Whisper AI si surge objeción de precio */}
          {whisperAlert && (
            <div className="bg-amber-50 border-l-4 border-l-amber-500 border border-amber-200 rounded-xl p-3 text-sm text-amber-900 flex items-center gap-2.5 shadow-2xs shrink-0 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="font-semibold">{whisperAlert}</span>
            </div>
          )}

          {/* Tarjeta de Estación de Llamada de Voz Real */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col min-h-0 overflow-hidden">
            {/* Header de la Estación: Modo Llamada Real */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {uiLang === 'en' ? 'Real Phone Call Mode · Active Listening' : 'Modo Llamada Telefónica Real · Escucha Activa'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="hidden sm:inline bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-600">
                  {uiLang === 'en' ? 'Subtitles hidden to train real ear' : 'Subtítulos ocultos para entrenar oído real'}
                </span>
                <span className="font-bold text-amber-700">
                  {transcripts.length} {transcripts.length === 1 ? (uiLang === 'en' ? 'turn' : 'intervención') : (uiLang === 'en' ? 'turns' : 'intervenciones')}
                </span>
              </div>
            </div>

            {/* Visualizador Siri Inteligente Central a Pantalla Completa */}
            <div className="flex-1 min-h-[260px] overflow-hidden relative">
              <SiriWaveVisualizer
                isSpeaking={isSpeaking}
                isListening={!isSpeaking && isConnected}
                isMuted={isMuted}
                contactName={contactName}
                onForceTurn={onForceTurn}
                micVolume={micVolume}
              />
            </div>

            {/* Banner de Consejos Clave de Escucha Activa */}
            <div className="px-4 py-2.5 bg-amber-50/80 border-t border-amber-200/60 flex items-center justify-between gap-3 text-xs text-amber-950 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-800 shrink-0">💡 {uiLang === 'en' ? 'Focus reminder:' : 'Clave comercial:'}</span>
                <span className="text-slate-700 leading-snug">
                  {uiLang === 'en'
                    ? 'Identify surplus equipment, machine hours, and decision maker. The full transcript is being recorded for your Scorecard.'
                    : 'Identifica maquinaria parada, horómetro y quién decide la venta. La transcripción completa se está guardando para tu Scorecard.'}
                </span>
              </div>
            </div>

            {/* Barra Inferior de Audio, Micrófono y SFX */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleMute}
                  disabled={!isConnected || isPttMode}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isMuted 
                      ? 'bg-rose-50 text-rose-800 border border-rose-300' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  } ${isPttMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isMuted ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4 text-slate-700" />}
                  <span>{isMuted ? (uiLang === 'en' ? 'Muted' : 'Silenciado') : (uiLang === 'en' ? 'Mute' : 'Silenciar')}</span>
                </button>

                {/* Switch Modo Oficina / Push to Talk */}
                <button
                  type="button"
                  onClick={handleTogglePttMode}
                  disabled={!isConnected}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                    isPttMode
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-300/60'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title={uiLang === 'en' ? 'Office Mode: Push-to-Talk (Hold Spacebar to speak)' : 'Modo Oficina: Pulsar para hablar (Mantén Espacio para hablar)'}
                >
                  <span className="text-sm">🏢</span>
                  <span className="hidden sm:inline">{uiLang === 'en' ? 'Office Mode (PTT)' : 'Modo Oficina (PTT)'}</span>
                  <span className="sm:hidden">{uiLang === 'en' ? 'PTT' : 'PTT'}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${isPttMode ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {isPttMode ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* Botón Central Grande: Mantener presionado para hablar (solo en Modo Oficina) */}
              {isPttMode && (
                <div className="flex-1 max-w-sm flex justify-center order-last sm:order-none w-full sm:w-auto">
                  <button
                    type="button"
                    onMouseDown={handlePttDown}
                    onMouseUp={handlePttUp}
                    onMouseLeave={handlePttUp}
                    onTouchStart={handlePttDown}
                    onTouchEnd={handlePttUp}
                    className={`w-full py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm select-none cursor-pointer ${
                      isPttPressed
                        ? 'bg-emerald-600 text-white scale-[0.98] ring-4 ring-emerald-300 animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                    }`}
                  >
                    {isPttPressed ? (
                      <>
                        <Mic className="w-4 h-4 text-white animate-bounce" />
                        <span>{uiLang === 'en' ? 'TRANSMITTING (Release to send)...' : 'TRANSMITIENDO (Suelta para enviar)...'}</span>
                      </>
                    ) : (
                      <>
                        <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono tracking-wider">ESPACIO</span>
                        <span>{uiLang === 'en' ? 'Hold Spacebar or Click to Talk' : 'Mantén Espacio o Clic para hablar'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">{uiLang === 'en' ? 'AI Volume:' : 'Volumen IA:'}</span>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={aiVolume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={onToggleSfx}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-colors ${
                    sfxEnabled ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-slate-200 text-slate-500'
                  }`}
                  title="Phone ringing sound effects"
                >
                  📞 SFX {sfxEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Panel Lateral Deslizable de Ayudas / Playbook durante la llamada */}
        {showHelperDrawer && (
          <div className="w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col min-h-0 overflow-hidden shrink-0 animate-fadeIn">
            {/* Header del Panel Lateral */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900 text-sm">{uiLang === 'en' ? 'Live Playbook Aids' : 'Ayudas en Vivo'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelperDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pestañas del Drawer */}
            <div className="grid grid-cols-3 p-2 bg-slate-100 gap-1 border-b border-slate-200 shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => setHelperTab('opening')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  helperTab === 'opening' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {uiLang === 'en' ? 'Opener' : 'Apertura'}
              </button>
              <button
                type="button"
                onClick={() => setHelperTab('qualify')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  helperTab === 'qualify' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {uiLang === 'en' ? 'Qualify' : 'Calificación'}
              </button>
              <button
                type="button"
                onClick={() => setHelperTab('objections')}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  helperTab === 'objections' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {uiLang === 'en' ? 'Objections' : 'Objeciones'}
              </button>
            </div>

            {/* Contenido del Drawer alimentado de QUICK_CALL_CHEATSHEET */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
              
              {/* Pestaña: Apertura */}
              {helperTab === 'opening' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 uppercase">English Opener (Gatekeeper):</span>
                      <button
                        onClick={() => handleCopy(QUICK_CALL_CHEATSHEET.openingEn, 'op-en')}
                        className="text-xs text-amber-700 hover:text-amber-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'op-en' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'op-en' ? (uiLang === 'en' ? 'Copied' : 'Copiado') : (uiLang === 'en' ? 'Copy' : 'Copiar')}</span>
                      </button>
                    </div>
                    <p className="text-slate-900 font-semibold italic text-sm leading-snug">
                      "{QUICK_CALL_CHEATSHEET.openingEn}"
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">En Español:</span>
                    <p className="text-slate-700 italic text-sm leading-snug">
                      "{QUICK_CALL_CHEATSHEET.openingEs}"
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 text-white space-y-1">
                    <span className="text-xs font-bold text-amber-400 block uppercase">{uiLang === 'en' ? 'If they ask what company:' : 'Si preguntan qué empresa:'}</span>
                    <p className="text-xs text-slate-200 italic leading-snug">
                      "{QUICK_CALL_CHEATSHEET.ifAskedWhoEn}"
                    </p>
                  </div>
                </div>
              )}

              {/* Pestaña: Calificación */}
              {helperTab === 'qualify' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    {uiLang === 'en' ? '4 Technical Qualification Questions' : '4 Preguntas de Calificación Técnica'}
                  </span>

                  {QUICK_CALL_CHEATSHEET.qualifyChecklist.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800">{uiLang === 'en' ? `Question #${idx + 1}` : `Pregunta #${idx + 1}`}</span>
                        <button
                          onClick={() => handleCopy(q.en, `q-${idx}`)}
                          className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          {copiedKey === `q-${idx}` ? (uiLang === 'en' ? 'Copied' : 'Copiado') : (uiLang === 'en' ? 'Copy' : 'Copiar')}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 italic">"{q.en}"</p>
                      <p className="text-xs text-slate-600 italic">"{q.es}"</p>
                    </div>
                  ))}

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <strong className="block mb-1">{uiLang === 'en' ? 'The 6 Mandatory Photos:' : 'Las 6 Fotos Obligatorias:'}</strong>
                    {uiLang === 'en' 
                      ? 'Serial plate, hour meter, front, rear, left side, right side.' 
                      : 'Placa técnica, horómetro, frente, atrás, lado izq, lado der.'}
                  </div>
                </div>
              )}

              {/* Pestaña: Objeciones */}
              {helperTab === 'objections' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    {uiLang === 'en' ? 'Instant Answers to Friction' : 'Respuestas Inmediatas a Fricciones'}
                  </span>

                  {QUICK_CALL_CHEATSHEET.topObjections.map((obj, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="text-xs font-bold text-rose-800 block">"{obj.objection}"</span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 italic">"{obj.sayEn}"</p>
                      <p className="text-xs text-slate-600 italic">"{obj.sayEs}"</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
