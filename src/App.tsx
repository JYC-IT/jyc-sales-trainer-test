import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Mode, HistoryItem, User as UserType } from './types';
import Header from './components/Header';
import Sidebar, { MODES_LIST } from './components/Sidebar';
import CoachView from './pages/CoachView';
import HomeView from './pages/HomeView';
import AdminBossView from './pages/AdminBossView';
import LoginModal from './LoginModal';
import { clearAllAudios } from './audioDb';
import { api } from './services/api';
import { SCENARIOS } from './data/scenarios';
import { Loader2 } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

// Code-split views
const LiveCall = lazy(() => import('./LiveCall'));
const RealCallAudit = lazy(() => import('./RealCallAudit'));
const HistoryDashboard = lazy(() => import('./HistoryDashboard'));

const MODE_TO_HASH: Record<Mode, string> = {
  'Inicio': '#inicio',
  'Live Call Simulation': '#practicar',
  'History': '#mis-llamadas',
  'Real Call Audit': '#auditar',
  'Coach': '#biblioteca',
  'Admin': '#admin',
};

const HASH_TO_MODE: Record<string, Mode> = {
  '#inicio': 'Inicio',
  '#practicar': 'Live Call Simulation',
  '#live-call': 'Live Call Simulation',
  '#mis-llamadas': 'History',
  '#history': 'History',
  '#auditar': 'Real Call Audit',
  '#audit': 'Real Call Audit',
  '#biblioteca': 'Coach',
  '#coach': 'Coach',
  '#admin': 'Admin',
};

function getModeFromHash(): Mode {
  const hash = window.location.hash.toLowerCase();
  return HASH_TO_MODE[hash] || 'Inicio';
}

export default function App() {
  const { language } = useLanguage();
  const [mode, setMode] = useState<Mode>(getModeFromHash);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem('jyc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(!currentUser);

  // Sales Evaluation History
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('jyc_sales_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const coachResetRef = useRef<(() => void) | null>(null);

  // Sync mode with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.toLowerCase();
      const targetMode = HASH_TO_MODE[currentHash];
      if (targetMode) {
        setMode(targetMode);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectMode = (newMode: Mode) => {
    setMode(newMode);
    const targetHash = MODE_TO_HASH[newMode] || '#inicio';
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  // Sync history with backend database
  const syncHistoryWithBackend = async (user: UserType) => {
    try {
      const items = await api.fetchHistory(user);
      if (Array.isArray(items)) {
        setHistory(items);
        localStorage.setItem('jyc_sales_history', JSON.stringify(items));
      }
    } catch (err) {
      console.warn("Could not sync history with backend:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      syncHistoryWithBackend(currentUser);
    }
  }, [currentUser]);

  // Voice synthesis cancellation when leaving Live Call
  useEffect(() => {
    if (mode === 'Live Call Simulation') {
      setVoiceEnabled(true);
    } else {
      window.speechSynthesis.cancel();
    }
  }, [mode]);

  const appendToHistory = async (
    score: number, 
    evaluation: any, 
    contactName: string, 
    companyName: string, 
    type: 'Live Call' | 'Audio Upload',
    options?: { 
      id?: string; 
      hasAudio?: boolean; 
      conversationId?: string; 
      audioUrl?: string; 
      difficulty?: string;
      durationSeconds?: number;
      xpEarned?: number;
      industry?: string;
      levelStage?: string;
    }
  ) => {
    const newItem: HistoryItem = {
      id: options?.id || (Date.now().toString() + Math.random().toString().substring(2, 6)),
      userId: currentUser?.id || 'trainee_default',
      userName: currentUser?.name || 'Sales Rep',
      date: new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: Date.now(),
      type,
      contactName,
      companyName,
      score,
      evaluation,
      hasAudio: options?.hasAudio ?? true,
      conversationId: options?.conversationId,
      audioUrl: options?.audioUrl,
      difficulty: options?.difficulty || evaluation?.difficulty,
      durationSeconds: options?.durationSeconds,
      xpEarned: options?.xpEarned,
      industry: options?.industry,
      levelStage: options?.levelStage
    };

    setHistory(prev => {
      const updated = [newItem, ...prev.filter(h => h.id !== newItem.id)];
      localStorage.setItem('jyc_sales_history', JSON.stringify(updated));
      return updated;
    });

    try {
      await api.saveHistoryItem(newItem, currentUser?.role || 'trainee');
    } catch (err) {
      console.warn("Could not save history to central database:", err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearHistory(currentUser?.role || 'trainee', currentUser?.id);
    } catch (err) {
      console.warn("Could not clear history on server:", err);
    }
    localStorage.removeItem('jyc_sales_history');
    clearAllAudios().catch(console.error);
    setHistory([]);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await api.deleteHistoryItem(id);
    } catch (err) {
      console.warn("Could not delete item on server:", err);
    }
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem('jyc_sales_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('jyc_user');
    setCurrentUser(null);
    setShowLoginModal(true);
  };

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('jyc_user', JSON.stringify(user));
    setShowLoginModal(false);
    syncHistoryWithBackend(user);
  };

  const currentModeInfo = MODES_LIST.find(m => m.id === mode);
  const modeDescription = currentModeInfo?.description || 'Entrenamiento de llamadas de adquisición de maquinaria pesada para JYC Equipment';

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentMode={mode}
        onSelectMode={handleSelectMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onResetCoach={() => coachResetRef.current?.()}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Header Bar */}
        <Header
          mode={mode}
          currentUser={currentUser}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            if (!next) window.speechSynthesis.cancel();
          }}
          onOpenSidebar={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          modeDescription={modeDescription}
          onSelectMode={handleSelectMode}
        />

        {/* View Router */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          
          {mode === 'Inicio' && (
            <HomeView
              currentUser={currentUser}
              history={history}
              scenarios={SCENARIOS}
              onStartPractice={(scenarioId) => {
                handleSelectMode('Live Call Simulation');
              }}
              onViewHistory={() => handleSelectMode('History')}
              onViewPlaybook={() => handleSelectMode('Coach')}
            />
          )}

          {mode === 'Live Call Simulation' && (
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-[#F8F9FA]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                <span className="text-sm font-semibold text-slate-700">Preparando escenario de llamada...</span>
              </div>
            }>
              <LiveCall 
                currentUser={currentUser}
                recentHistory={history}
                onNavigate={handleSelectMode}
                onEvaluationComplete={(score, evalData, contact, company, opts) => 
                  appendToHistory(score, evalData, contact, company, 'Live Call', opts)
                } 
              />
            </Suspense>
          )}

          {mode === 'History' && (
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-[#F8F9FA]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {language === 'en' ? 'Loading call history...' : 'Cargando historial de llamadas...'}
                </span>
              </div>
            }>
              <HistoryDashboard 
                history={history} 
                currentUser={currentUser}
                onClearHistory={handleClearHistory} 
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onNavigateToMode={(targetMode) => handleSelectMode(targetMode)} 
              />
            </Suspense>
          )}

          {mode === 'Real Call Audit' && (
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 bg-[#F8F9FA]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {language === 'en' ? 'Loading audio evaluator...' : 'Cargando evaluador de grabaciones...'}
                </span>
              </div>
            }>
              <RealCallAudit 
                onEvaluationComplete={(score, evalData, contact, company, opts) => 
                  appendToHistory(score, evalData, contact, company, 'Audio Upload', opts)
                } 
              />
            </Suspense>
          )}

          {mode === 'Coach' && (
            <CoachView
              voiceEnabled={voiceEnabled}
              onResetRef={coachResetRef}
            />
          )}

          {mode === 'Admin' && (
            <AdminBossView
              onNavigateToPractice={() => handleSelectMode('Live Call Simulation')}
            />
          )}

        </div>

      </div>

      {/* Authentication Modal */}
      {showLoginModal && (
        <LoginModal onLogin={handleLogin} />
      )}
    </div>
  );
}
