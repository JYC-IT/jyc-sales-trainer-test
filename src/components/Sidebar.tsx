import React, { useState, useEffect, useCallback } from 'react';
import { Mode, User as UserType } from '../types';
import { getAuthHeaders } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Home, PhoneCall, BookOpen, UploadCloud, BarChart3, 
  RefreshCw, X, Shield, User, LogOut, Zap, AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  currentMode: Mode;
  onSelectMode: (mode: Mode) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onLogout: () => void;
  onResetCoach: () => void;
}

export interface NavItemConfig {
  id: Mode;
  label: string;
  shortTitle: string;
  description: string;
  adminOnly?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export const MODES_LIST: NavItemConfig[] = [
  { 
    id: 'Inicio', 
    label: 'Inicio', 
    shortTitle: 'Panel de Inicio',
    description: 'Próxima práctica sugerida, score reciente y progreso semanal',
    icon: Home,
  },
  { 
    id: 'Live Call Simulation', 
    label: 'Practicar', 
    shortTitle: 'Simulador de Llamadas',
    description: 'Simula llamadas en frío con compradores de maquinaria pesada',
    icon: PhoneCall,
  },
  { 
    id: 'History', 
    label: 'Mis llamadas', 
    shortTitle: 'Historial y Evaluaciones',
    description: 'Revisa tus llamadas grabadas, scorecards y notas',
    icon: BarChart3,
  },
  { 
    id: 'Real Call Audit', 
    label: 'Auditar grabación real', 
    shortTitle: 'Auditoría de Audio Real',
    description: 'Sube audios reales de prospectos para evaluar fortalezas',
    icon: UploadCloud,
  },
  { 
    id: 'Coach', 
    label: 'Biblioteca', 
    shortTitle: 'Biblioteca y Playbook',
    description: 'Guiones paso a paso, manejo de objeciones y entrenador IA',
    icon: BookOpen,
  },
  { 
    id: 'Admin', 
    label: 'Administración', 
    shortTitle: 'Vista para el Jefe',
    description: 'Ranking del equipo, métricas de práctica y usuarios',
    adminOnly: true,
    icon: Shield,
  },
];

const itemTranslations: Record<string, { en: { label: string; shortTitle: string; desc: string }; es: { label: string; shortTitle: string; desc: string } }> = {
  'Inicio': {
    en: { label: 'Home', shortTitle: 'Home Dashboard', desc: 'Recommended practice, recent score, and weekly progress' },
    es: { label: 'Inicio', shortTitle: 'Panel de Inicio', desc: 'Próxima práctica sugerida, score reciente y progreso semanal' }
  },
  'Live Call Simulation': {
    en: { label: 'Practice Call', shortTitle: 'Call Simulator', desc: 'Simulate cold calls with heavy equipment buyers' },
    es: { label: 'Practicar', shortTitle: 'Simulador de Llamadas', desc: 'Simula llamadas en frío con compradores de maquinaria pesada' }
  },
  'History': {
    en: { label: 'My Calls', shortTitle: 'Call History & Scores', desc: 'Review recorded calls, scorecards, and coaching notes' },
    es: { label: 'Mis llamadas', shortTitle: 'Historial y Evaluaciones', desc: 'Revisa tus llamadas grabadas, scorecards y notas' }
  },
  'Real Call Audit': {
    en: { label: 'Audit Real Recording', shortTitle: 'Real Call Audit', desc: 'Upload real prospect call audio to evaluate performance' },
    es: { label: 'Auditar grabación real', shortTitle: 'Auditoría de Audio Real', desc: 'Sube audios reales de prospectos para evaluar fortalezas' }
  },
  'Coach': {
    en: { label: 'Library & Playbook', shortTitle: 'Library & Playbook', desc: 'Step-by-step objection handling, battlecards, and AI coach' },
    es: { label: 'Biblioteca y Playbook', shortTitle: 'Biblioteca y Playbook', desc: 'Guiones paso a paso, manejo de objeciones y entrenador IA' }
  },
  'Admin': {
    en: { label: 'Administration', shortTitle: 'Executive Suite', desc: 'Executive podium, weekly XP rankings, and user accounts' },
    es: { label: 'Administración', shortTitle: 'Vista para el Jefe', desc: 'Ranking del equipo, métricas de práctica y usuarios' }
  }
};

export function getModeInfo(mode: Mode, lang: 'en' | 'es') {
  const trans = itemTranslations[mode]?.[lang];
  const item = MODES_LIST.find(m => m.id === mode);
  return {
    label: trans?.label || item?.label || mode,
    shortTitle: trans?.shortTitle || (lang === 'en' ? (trans?.label || mode) : item?.shortTitle || mode),
    description: trans?.desc || item?.description || ''
  };
}

export default function Sidebar({
  currentMode,
  onSelectMode,
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onResetCoach,
}: SidebarProps) {
  const { language, setLanguage, t } = useLanguage();
  const isAdmin = currentUser?.role === 'admin';
  const visibleModes = MODES_LIST.filter(m => !m.adminOnly || isAdmin);

  const [credits, setCredits] = useState<{
    tier: string;
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
    percentRemaining: number;
    nextResetUnix: number | null;
  } | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);

  const fetchCredits = useCallback(async () => {
    try {
      setLoadingCredits(true);
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
      setLoadingCredits(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, [fetchCredits, currentMode]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Navigation Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-100 flex flex-col border-r border-slate-800 transform transition-transform duration-200 ease-out md:relative md:translate-x-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Encabezado de Marca */}
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div 
            onClick={() => {
              onSelectMode('Inicio');
              onClose();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-display font-extrabold text-base tracking-tight shadow-sm group-hover:bg-amber-400 transition-colors">
              JYC
            </div>
            <div>
              <div className="font-display font-bold text-base text-white tracking-tight leading-tight">
                JYC Equipment
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {language === 'en' ? 'AI Sales Trainer' : 'Entrenador Comercial IA'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Navegación Principal */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-2">
          <nav className="space-y-1.5" aria-label="Menú principal">
            {visibleModes.map((item) => {
              const Icon = item.icon;
              const isActive = currentMode === item.id;
              const isCallItem = item.id === 'Live Call Simulation';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectMode(item.id);
                    onClose();
                  }}
                  className={`w-full text-left px-3.5 py-3 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : isCallItem
                        ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                        : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${
                    isActive 
                      ? 'text-slate-950' 
                      : isCallItem 
                        ? 'text-amber-400' 
                        : 'text-slate-400'
                  }`} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight">
                      {itemTranslations[item.id]?.[language]?.label || item.label}
                    </div>
                    <p className={`text-xs leading-normal mt-1 line-clamp-2 ${
                      isActive 
                        ? 'text-slate-900/90 font-medium' 
                        : 'text-slate-400 font-normal'
                    }`}>
                      {itemTranslations[item.id]?.[language]?.desc || item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Consulta nueva si está en Coach */}
          {currentMode === 'Coach' && (
            <div className="pt-3 border-t border-slate-800/80 px-1">
              <button
                onClick={onResetCoach}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'en' ? 'New Coach Consultation' : 'Nueva consulta al Coach'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Medidor de Créditos de Voz (ElevenLabs) */}
        {credits && (
          <div className="px-3.5 pb-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Zap className={`w-4 h-4 shrink-0 ${
                    credits.percentUsed >= 95
                      ? 'text-rose-400'
                      : credits.percentUsed >= 75
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                  }`} />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    Créditos de Voz IA
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    credits.percentUsed >= 95
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : credits.percentUsed >= 75
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {credits.percentUsed}%
                  </span>
                  <button
                    type="button"
                    onClick={fetchCredits}
                    title="Actualizar consumo de créditos"
                    className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingCredits ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    credits.percentUsed >= 95
                      ? 'bg-rose-500'
                      : credits.percentUsed >= 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, credits.percentUsed))}%` }}
                />
              </div>

              {/* Detalle numérico */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{credits.used.toLocaleString()} usados</span>
                <span className={credits.remaining === 0 ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                  {credits.remaining.toLocaleString()} disp.
                </span>
              </div>

              {credits.remaining === 0 && (
                <div className="flex items-center gap-1.5 pt-1 text-xs text-rose-300 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Sin créditos — recarga en ElevenLabs</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selector de Idioma en el Menú Lateral */}
        <div className="px-3.5 pb-3">
          <div className="bg-slate-800/90 rounded-xl p-1.5 flex items-center justify-between border border-slate-700/60 shadow-2xs">
            <span className="text-xs font-semibold text-slate-300 pl-2">
              {language === 'en' ? 'Language:' : 'Idioma:'}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'es'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Cambiar a Español"
              >
                <span>🇪🇸</span>
                <span>ES</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                <span>🇺🇸</span>
                <span>EN</span>
              </button>
            </div>
          </div>
        </div>

        {/* Perfil de Usuario en el Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/80">
          {currentUser && (
            <div className="flex items-center justify-between gap-2 px-2 py-1">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${
                  isAdmin 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    {isAdmin ? (
                      <>
                        <Shield className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'en' ? 'Administrator' : 'Administrador'}</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'en' ? 'Sales Rep' : 'Vendedor'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                title={t('nav_logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
