import React, { useEffect, useState } from 'react';
import { Mic, Volume2, Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface SiriWaveVisualizerProps {
  isSpeaking: boolean;
  isListening: boolean;
  isMuted?: boolean;
  onForceTurn?: () => void;
  contactName: string;
  micVolume?: number;
}

export const SiriWaveVisualizer: React.FC<SiriWaveVisualizerProps> = ({
  isSpeaking,
  isListening,
  isMuted = false,
  onForceTurn,
  contactName,
  micVolume = 0,
}) => {
  const { language } = useLanguage();
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[340px] p-6 select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#0B0F19] border border-slate-800 shadow-2xl">
      
      {/* Background ambient liquid glow */}
      <div 
        className={`absolute w-72 h-72 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none ${
          isSpeaking 
            ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 scale-125' 
            : isListening && !isMuted
            ? 'bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-500 scale-110'
            : 'bg-slate-700 scale-90'
        }`}
      />

      {/* Main Siri / Apple Intelligence Morphing Orb */}
      <div className="relative flex items-center justify-center w-52 h-52 my-auto">
        
        {/* Outer pulsating wave rings when active */}
        {(isSpeaking || (isListening && !isMuted)) && (
          <>
            <div 
              className={`absolute inset-0 rounded-full border border-cyan-400/30 animate-ping opacity-25 ${
                isSpeaking ? 'border-amber-400/40' : 'border-cyan-400/30'
              }`}
              style={{ animationDuration: isSpeaking ? '1.8s' : '2.4s' }}
            />
            <div 
              className={`absolute -inset-4 rounded-full border border-purple-500/20 animate-pulse opacity-40`}
              style={{ animationDuration: '3s' }}
            />
            <div 
              className={`absolute -inset-8 rounded-full border border-indigo-500/10 opacity-20`}
            />
          </>
        )}

        {/* Central Siri Liquid Glowing Orb */}
        <div 
          className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 ${
            isSpeaking ? 'scale-110' : isListening && !isMuted ? 'scale-105' : 'scale-95'
          }`}
          style={{
            background: isSpeaking
              ? 'radial-gradient(circle at 35% 35%, #F59E0B 0%, #EF4444 45%, #7C3AED 85%, #0F172A 100%)'
              : isListening && !isMuted
              ? 'radial-gradient(circle at 35% 35%, #38BDF8 0%, #3B82F6 40%, #8B5CF6 80%, #0F172A 100%)'
              : 'radial-gradient(circle at 35% 35%, #475569 0%, #334155 50%, #1E293B 100%)',
            boxShadow: isSpeaking
              ? '0 0 50px rgba(245, 158, 11, 0.45), 0 0 100px rgba(239, 68, 68, 0.25)'
              : isListening && !isMuted
              ? '0 0 50px rgba(56, 189, 248, 0.45), 0 0 90px rgba(139, 92, 246, 0.25)'
              : '0 0 20px rgba(71, 85, 105, 0.2)'
          }}
        >
          {/* Internal rotating fluid reflection */}
          <div 
            className="absolute inset-1.5 rounded-full opacity-60 mix-blend-overlay filter blur-[1px]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 60%)',
              transform: `rotate(${pulsePhase * 3.6}deg)`
            }}
          />

          {/* Center Icon */}
          <div className="relative z-10 flex items-center justify-center text-white drop-shadow-md">
            {isSpeaking ? (
              <Volume2 className="w-10 h-10 animate-bounce text-amber-100" />
            ) : isListening && !isMuted ? (
              <Mic className="w-10 h-10 animate-pulse text-cyan-100" />
            ) : (
              <Sparkles className="w-8 h-8 text-slate-400 opacity-60" />
            )}
          </div>
        </div>

        {/* Dynamic Voice Waveform Lines across the Orb */}
        <div className="absolute inset-x-[-15%] top-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 pointer-events-none z-20">
          {[40, 70, 100, 75, 45, 85, 110, 60, 30].map((h, i) => {
            const dynamicMicScale = micVolume > 0.03 ? Math.min(2.5, 1 + micVolume * 8) : 1;
            const activeHeight = isSpeaking 
              ? Math.max(12, Math.sin((pulsePhase + i * 15) * 0.15) * h * 0.5 + h * 0.4)
              : isListening && !isMuted
              ? Math.max(8, (Math.sin((pulsePhase + i * 20) * 0.12) * h * 0.35 + h * 0.25) * dynamicMicScale)
              : 4;

            return (
              <span
                key={i}
                className="w-1.5 rounded-full transition-all duration-75"
                style={{
                  height: `${activeHeight}px`,
                  backgroundColor: isSpeaking
                    ? '#FBBF24'
                    : isListening && !isMuted
                    ? (micVolume > 0.04 ? '#34D399' : '#38BDF8')
                    : '#475569',
                  boxShadow: isSpeaking
                    ? '0 0 8px #F59E0B'
                    : isListening && !isMuted
                    ? (micVolume > 0.04 ? '0 0 10px #34D399' : '0 0 8px #38BDF8')
                    : 'none'
                }}
              />
            );
          })}
        </div>

      </div>

      {/* Voice Status Subtitle */}
      <div className="relative z-10 text-center mt-3 mb-2 space-y-1">
        <h4 className="text-sm font-semibold tracking-wide text-white flex items-center justify-center gap-2">
          {isSpeaking ? (
            <span className="text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              {contactName} {language === 'en' ? 'is speaking...' : 'está hablando...'}
            </span>
          ) : isMuted ? (
            <span className="text-rose-400">{language === 'en' ? 'Microphone muted' : 'Micrófono silenciado'}</span>
          ) : (
            <span className="text-cyan-300 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${micVolume > 0.03 ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
              {micVolume > 0.03 
                ? (language === 'en' ? 'Capturing your voice...' : 'Detectando tu voz...') 
                : (language === 'en' ? 'Listening... Speak naturally' : 'Escuchando tu voz... Habla con naturalidad')}
            </span>
          )}
        </h4>

        {/* Real-time VU Audio Meter */}
        {!isSpeaking && !isMuted && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-400">
              {language === 'en' ? 'Mic Level:' : 'Nivel Micrófono:'}
            </span>
            <div className="w-32 h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/80 p-0.5 flex items-center">
              <div 
                className={`h-full rounded-full transition-all duration-75 ${
                  micVolume > 0.03 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(6, micVolume * 240))}%` }}
              />
            </div>
            <span className={`text-xs font-mono font-bold ${
              micVolume > 0.03 ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {micVolume > 0.03 
                ? (language === 'en' ? 'Active' : 'Activo') 
                : (language === 'en' ? 'Silence' : 'Silencio')}
            </span>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          {isSpeaking 
            ? (language === 'en' ? 'Listen carefully to their technical or price objection.' : 'Escucha con atención su objeción técnica o comercial.') 
            : (language === 'en' ? 'State your hook, qualify the machinery, or ask for photos.' : 'Plantea tu gancho, califica el equipo o pide las fotos.')}
        </p>
      </div>

      {/* Quick Force Turn Button (Soluciona la espera larga) */}
      {!isSpeaking && onForceTurn && (
        <div className="relative z-10 mt-3 flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onForceTurn}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer group active:scale-95"
            title={language === 'en' ? 'Click when finished speaking for instant response' : 'Haz clic apenas termines de hablar para respuesta inmediata'}
          >
            <Zap className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>{language === 'en' ? 'Finished Speaking (Respond Now)' : 'Terminé de hablar (Responder ya)'}</span>
          </button>
          <span className="text-[11px] text-slate-400">
            {language === 'en' ? 'Click for instant response or pause naturally' : 'Haz clic para respuesta inmediata o pausa con naturalidad'}
          </span>
        </div>
      )}

    </div>
  );
};

export default SiriWaveVisualizer;
