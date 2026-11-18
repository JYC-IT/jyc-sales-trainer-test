import React, { useState, useEffect, useCallback } from 'react';
import { User as UserType, Mode } from '../types';
import { MODES_LIST, getModeInfo } from './Sidebar';
import { Menu, Volume2, VolumeX, PhoneCall, Zap, RefreshCw } from 'lucide-react';

import { getAuthHeaders } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  mode: Mode;
  currentUser: UserType | null;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenSidebar: () => void;
  onLogout: () => void;
  modeDescription: string;
  onSelectMode?: (mode: Mode) => void;
}

export default function Header({
  mode,
  voiceEnabled,
  onToggleVoice,
  onOpenSidebar,
  modeDescription,
  onSelectMode,
}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const modeMeta = getModeInfo(mode, language);
  const title = modeMeta.shortTitle;
  const effectiveDescription = modeMeta.description || modeDescription;

  const [credits, setCredits] = useState<{
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadCredits = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/elevenlabs/credits', {
        headers: getAuthHeaders(),
        credentials: 'same-origin'
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data);
      }
    } catch {
      // Ignorar errores silenciosos
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCredits();
    const timer = setInterval(loadCredits, 60000);
    return () => clearInterval(timer);
  }, [loadCredits, mode]);

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-20">
      
      {/* Izquierda: Menú móvil y título de la vista */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-display font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          <p className="text-sm text-slate-600 truncate hidden sm:block">
            {effectiveDescription}
          </p>
        </div>
      </div>

      {/* Derecha: Acciones contextuales */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Selector Global de Idioma (EN / ES) */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-0.5 text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              language === 'en'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="English interface"
          >
            <span>🇺🇸</span>
            <span>EN</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('es')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              language === 'es'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Interfaz en Español"
          >
            <span>🇪🇸</span>
            <span>ES</span>
          </button>
        </div>

        {/* Créditos de voz ElevenLabs */}
        {credits && (
          <button
            type="button"
            onClick={loadCredits}
            title={`Créditos IA: ${credits.used.toLocaleString()} / ${credits.limit.toLocaleString()} usados (${credits.remaining.toLocaleString()} restantes). Clic para actualizar.`}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
              credits.percentUsed >= 95
                ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                : credits.percentUsed >= 75
                  ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Zap className={`w-4 h-4 shrink-0 ${
              credits.percentUsed >= 95
                ? 'text-rose-600'
                : credits.percentUsed >= 75
                  ? 'text-amber-600'
                  : 'text-emerald-600'
            }`} />
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline text-slate-600 font-medium">
                {language === 'en' ? 'Credits:' : 'Créditos:'}
              </span>
              <span className="font-mono font-bold text-sm">{credits.percentUsed}%</span>
              <div className="hidden sm:block w-14 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    credits.percentUsed >= 95
                      ? 'bg-rose-600'
                      : credits.percentUsed >= 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, credits.percentUsed))}%` }}
                />
              </div>
              <span className="hidden md:inline font-mono text-xs opacity-75">
                ({credits.remaining.toLocaleString()} {language === 'en' ? 'left' : 'disp.'})
              </span>
            </div>
            <RefreshCw className={`w-3.5 h-3.5 opacity-60 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
        
        {/* Botón rápido a Practicar llamada cuando estás en otra sección */}
        {mode !== 'Live Call Simulation' && onSelectMode && (
          <button
            onClick={() => onSelectMode('Live Call Simulation')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t('btn_practice_call')}</span>
          </button>
        )}

        {/* Toggle de voz del coach cuando está en Biblioteca */}
        {mode === 'Coach' && (
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Silenciar voz del coach' : 'Escuchar respuestas con voz'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
              voiceEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {voiceEnabled 
                ? (language === 'en' ? 'Voice active' : 'Voz activada') 
                : (language === 'en' ? 'Voice muted' : 'Voz silenciada')}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
