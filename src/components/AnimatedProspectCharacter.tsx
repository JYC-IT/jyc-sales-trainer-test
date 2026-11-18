import React from 'react';
import { Sparkles, Brain, Clock, CheckCircle2, AlertTriangle, ThumbsUp } from 'lucide-react';

export type CharacterMood = 'listening' | 'speaking' | 'skeptical' | 'impatient' | 'impressed' | 'neutral';

interface AnimatedProspectCharacterProps {
  scenarioId: string;
  contactName: string;
  roleTitle: string;
  companyName: string;
  isSpeaking: boolean;
  userIsSpeaking?: boolean;
  userSpeechDuration?: number; // seconds talking continuously
  customMood?: CharacterMood;
  lastObjection?: string;
  interestScore?: number; // 0 to 100
  onAdjustInterest?: (delta: number) => void;
}

export const AnimatedProspectCharacter: React.FC<AnimatedProspectCharacterProps> = ({
  scenarioId,
  contactName,
  roleTitle,
  companyName,
  isSpeaking,
  userIsSpeaking = false,
  userSpeechDuration = 0,
  customMood,
  lastObjection,
  interestScore = 75,
  onAdjustInterest,
}) => {
  // Determine dynamic mood based on call state
  let mood: CharacterMood = customMood || 'listening';
  if (!customMood) {
    if (isSpeaking) {
      mood = 'speaking';
    } else if (userSpeechDuration > 30) {
      mood = 'impatient';
    } else if (userIsSpeaking) {
      mood = 'listening';
    } else {
      mood = 'neutral';
    }
  }

  // Industry-specific persona customization
  const isMedical = scenarioId === 'medical';
  const isPorts = scenarioId === 'ports';
  const isPlastics = scenarioId === 'plastic';
  const isHeavyMachinery = !isMedical && !isPorts && !isPlastics;

  // Dynamic Thought Bubble Text & Icon
  const getThoughtContent = () => {
    switch (mood) {
      case 'speaking':
        return {
          icon: <Brain className="w-3.5 h-3.5 text-amber-500 animate-pulse" />,
          text: `Respondiendo a tu propuesta...`,
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        };
      case 'impatient':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-rose-500 animate-spin" />,
          text: `Llevas más de 30s hablando. ¡Haz una pregunta!`,
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        };
      case 'skeptical':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          text: lastObjection ? `Dudando: "${lastObjection.slice(0, 32)}..."` : `¿Por qué debería confiar en JYC?`,
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        };
      case 'impressed':
        return {
          icon: <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />,
          text: `¡Buen argumento! Me interesa el flete y pago 24h.`,
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
        };
      case 'listening':
      default:
        return {
          icon: <Brain className="w-3.5 h-3.5 text-cyan-400" />,
          text: `Evaluando propuesta comercial...`,
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
        };
    }
  };

  const thought = getThoughtContent();

  return (
    <div className="relative flex flex-col items-center justify-between h-full w-full max-w-sm mx-auto p-4 select-none">
      {/* Top Floating Thought Bubble */}
      <div className={`w-full mb-3 px-3.5 py-2.5 rounded-2xl border backdrop-blur-md transition-all duration-300 shadow-lg ${thought.bg}`}>
        <div className="flex items-center gap-2">
          {thought.icon}
          <span className="text-xs font-medium tracking-wide leading-tight line-clamp-2">
            {thought.text}
          </span>
        </div>
      </div>

      {/* Main 3D / Vector Illustrated Character Container */}
      <div className="relative w-48 h-60 sm:w-56 sm:h-68 flex items-center justify-center my-auto">
        {/* Glow halo behind character */}
        <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 transition-colors duration-500 ${
          mood === 'impressed' ? 'bg-emerald-500' :
          mood === 'impatient' ? 'bg-rose-500' :
          mood === 'speaking' ? 'bg-amber-500' : 'bg-blue-500'
        }`} />

        {/* SVG Illustrated Dynamic Mascot (Don Roberto / Dra. Elena / Marcus) */}
        <svg viewBox="0 0 240 300" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDDEC0" />
              <stop offset="100%" stopColor="#E2A779" />
            </linearGradient>
            <linearGradient id="hardHatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="vestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id="labCoatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <linearGradient id="clipboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
          </defs>

          {/* Body / Torso */}
          <g className="transition-transform duration-300">
            {/* Clothing base */}
            <path
              d="M 60 210 Q 120 190 180 210 L 195 300 L 45 300 Z"
              fill={isMedical ? "url(#labCoatGrad)" : isPorts ? "#1E3A8A" : "#1E293B"}
            />

            {/* Industrial Safety High-Vis Vest (For machinery, quarries, ports) */}
            {!isMedical && (
              <g>
                <path d="M 65 210 L 95 210 L 90 300 L 55 300 Z" fill="url(#vestGrad)" />
                <path d="M 175 210 L 145 210 L 150 300 L 185 300 Z" fill="url(#vestGrad)" />
                {/* Silver reflective stripes */}
                <rect x="67" y="240" width="26" height="12" fill="#E2E8F0" rx="2" />
                <rect x="147" y="240" width="26" height="12" fill="#E2E8F0" rx="2" />
                <rect x="60" y="275" width="30" height="10" fill="#E2E8F0" rx="2" />
                <rect x="150" y="275" width="30" height="10" fill="#E2E8F0" rx="2" />
              </g>
            )}

            {/* Doctor Stethoscope for Medical Vertical */}
            {isMedical && (
              <path
                d="M 95 210 Q 120 260 145 210"
                fill="none"
                stroke="#0284C7"
                strokeWidth="5"
                strokeLinecap="round"
              />
            )}
          </g>

          {/* Neck */}
          <rect x="105" y="150" width="30" height="40" rx="8" fill="url(#skinGrad)" />

          {/* Head & Face */}
          <g className={`transition-transform duration-300 ${
            mood === 'skeptical' ? 'rotate-[-4deg] origin-[120px_130px]' :
            mood === 'impressed' ? 'translate-y-[-2px]' : ''
          }`}>
            {/* Head oval */}
            <ellipse cx="120" cy="125" rx="46" ry="52" fill="url(#skinGrad)" />

            {/* Ears */}
            <circle cx="74" cy="125" r="10" fill="url(#skinGrad)" />
            <circle cx="166" cy="125" r="10" fill="url(#skinGrad)" />

            {/* Hair under hat */}
            <path d="M 75 110 Q 120 80 165 110 L 165 125 Q 120 100 75 125 Z" fill="#334155" />

            {/* Safety Glasses (Industrial) or Executive Glasses */}
            <g>
              <rect x="80" y="108" width="34" height="24" rx="7" fill="rgba(226, 232, 240, 0.45)" stroke="#64748B" strokeWidth="2.5" />
              <rect x="126" y="108" width="34" height="24" rx="7" fill="rgba(226, 232, 240, 0.45)" stroke="#64748B" strokeWidth="2.5" />
              <line x1="114" y1="120" x2="126" y2="120" stroke="#64748B" strokeWidth="3" />
            </g>

            {/* Eyes */}
            <g>
              {/* Left Eye */}
              <ellipse cx="97" cy="120" rx="5" ry="6" fill="#0F172A" />
              <circle cx="95" cy="118" r="2" fill="#FFFFFF" />

              {/* Right Eye (Winks or Raises Eyebrow when skeptical) */}
              <ellipse cx="143" cy="120" rx="5" ry={mood === 'skeptical' ? "7" : "6"} fill="#0F172A" />
              <circle cx="141" cy="118" r="2" fill="#FFFFFF" />

              {/* Eyebrows */}
              {mood === 'skeptical' ? (
                // One eyebrow raised in doubt
                <g>
                  <path d="M 86 104 Q 97 101 108 104" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M 132 96 Q 143 92 154 99" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              ) : mood === 'impatient' ? (
                // Stern, furrowed eyebrows
                <g>
                  <path d="M 88 102 L 108 107" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M 152 102 L 132 107" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              ) : (
                // Friendly attentive eyebrows
                <g>
                  <path d="M 86 102 Q 97 97 108 102" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M 132 102 Q 143 97 154 102" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              )}
            </g>

            {/* Nose */}
            <path d="M 120 120 Q 124 133 118 136" stroke="#C2825B" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Mouth (Animates while speaking) */}
            {mood === 'speaking' ? (
              <g className="animate-pulse">
                <ellipse cx="120" cy="154" rx="11" ry="8" fill="#7F1D1D" />
                <path d="M 112 150 Q 120 154 128 150" fill="#FFFFFF" />
              </g>
            ) : mood === 'impressed' ? (
              // Confident approving smile
              <path d="M 108 148 Q 120 162 132 148" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            ) : mood === 'impatient' ? (
              // Flat unimpressed line
              <line x1="110" y1="152" x2="130" y2="152" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            ) : (
              // Thoughtful listening curve
              <path d="M 111 150 Q 120 156 129 150" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}

            {/* Hat / Headgear */}
            {!isMedical ? (
              // Industrial Yellow Hard Hat for Don Roberto
              <g>
                <path d="M 68 85 Q 120 50 172 85 L 180 95 Q 120 85 60 95 Z" fill="url(#hardHatGrad)" stroke="#A16207" strokeWidth="2" />
                <ellipse cx="120" cy="92" rx="64" ry="12" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" />
                <rect x="108" y="72" width="24" height="8" rx="3" fill="#CA8A04" />
              </g>
            ) : (
              // Medical Hairnet / Cleanroom Cap
              <path d="M 72 85 Q 120 60 168 85 Q 175 105 165 110 Q 120 95 75 110 Z" fill="#0284C7" opacity="0.85" />
            )}
          </g>

          {/* Arms & Hands (Holding Clipboard with Notes) */}
          <g>
            {/* Clipboard */}
            <rect x="45" y="215" width="60" height="78" rx="6" fill="url(#clipboardGrad)" stroke="#270F03" strokeWidth="2" />
            <rect x="52" y="224" width="46" height="62" rx="3" fill="#F8FAFC" />
            {/* Paper checklist lines */}
            <line x1="58" y1="235" x2="88" y2="235" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="245" x2="84" y2="245" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="255" x2="90" y2="255" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="265" x2="76" y2="265" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            {/* Top metallic clip */}
            <rect x="62" y="210" width="26" height="10" rx="3" fill="#64748B" />

            {/* Hand holding clipboard */}
            <ellipse cx="46" cy="255" rx="8" ry="14" fill="url(#skinGrad)" />
            <ellipse cx="48" cy="245" rx="6" ry="6" fill="url(#skinGrad)" />

            {/* Right hand gesturing or holding pen */}
            {mood === 'skeptical' ? (
              // Hand on chin (evaluating posture)
              <g className="transition-transform duration-300">
                <ellipse cx="142" cy="165" rx="10" ry="10" fill="url(#skinGrad)" />
                <path d="M 136 155 Q 146 152 144 165" stroke="url(#skinGrad)" strokeWidth="6" strokeLinecap="round" />
              </g>
            ) : mood === 'impressed' ? (
              // Thumbs up gesture
              <g className="transition-transform duration-300">
                <ellipse cx="180" cy="225" rx="10" ry="10" fill="url(#skinGrad)" />
                <path d="M 180 225 L 180 205" stroke="url(#skinGrad)" strokeWidth="8" strokeLinecap="round" />
              </g>
            ) : (
              // Holding industrial pen
              <g>
                <ellipse cx="165" cy="240" rx="9" ry="9" fill="url(#skinGrad)" />
                <line x1="155" y1="246" x2="178" y2="215" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Bottom Prospect Identity & Live Patience/Interest Bar */}
      <div className="w-full mt-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md">
        <div className="flex items-center justify-between mb-1.5">
          <div className="truncate pr-2">
            <h4 className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
              <span>{contactName}</span>
              <span className="text-[10px] text-amber-400 font-normal px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                {roleTitle}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 truncate">{companyName}</p>
          </div>
          <div className="text-right shrink-0 flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-medium text-slate-300">
              Interés: <span className={interestScore >= 75 ? 'text-emerald-400 font-bold' : interestScore >= 50 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>{interestScore}%</span>
            </span>
            {onAdjustInterest && (
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => onAdjustInterest(-5)}
                  className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center font-bold transition-colors cursor-pointer"
                  title="Reducir interés (-5%)"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustInterest(5)}
                  className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center font-bold transition-colors cursor-pointer"
                  title="Aumentar interés (+5%)"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Patience / Receptivity Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              interestScore >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
              interestScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
              'bg-gradient-to-r from-rose-500 to-red-400'
            }`}
            style={{ width: `${Math.max(10, Math.min(100, interestScore))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedProspectCharacter;
