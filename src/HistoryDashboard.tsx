import React, { useState, useMemo } from 'react';
import { HistoryItem, User as UserType } from './types';
import Scorecard from './Scorecard';
import AdminUserManager from './AdminUserManager';
import { useLanguage } from './i18n/LanguageContext';
import { 
  BarChart, Calendar, Award, User, 
  Trash2, ArrowRight, Play, Upload, Check, Headphones,
  Shield, Filter, Users, ChevronRight, PhoneCall, ArrowLeft
} from 'lucide-react';

interface HistoryDashboardProps {
  history: HistoryItem[];
  currentUser?: UserType | null;
  onClearHistory: () => void;
  onDeleteHistoryItem?: (id: string) => void;
  onNavigateToMode: (mode: 'Live Call Simulation' | 'Real Call Audit') => void;
}

export default function HistoryDashboard({ 
  history, 
  currentUser, 
  onClearHistory, 
  onDeleteHistoryItem,
  onNavigateToMode 
}: HistoryDashboardProps) {
  const { language, t } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [selectedTraineeFilter, setSelectedTraineeFilter] = useState<string>('ALL');
  const [showManageUsers, setShowManageUsers] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const traineesList = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalScore: number }>();
    for (const item of history) {
      const name = item.userName || (language === 'en' ? 'Sales Rep' : 'Vendedor');
      const existing = map.get(name) || { name, count: 0, totalScore: 0 };
      existing.count += 1;
      existing.totalScore += (item.score || 0);
      map.set(name, existing);
    }
    return Array.from(map.values()).map(t => ({
      name: t.name,
      count: t.count,
      avgScore: Math.round(t.totalScore / t.count)
    }));
  }, [history, language]);

  const filteredHistory = useMemo(() => {
    if (!isAdmin || selectedTraineeFilter === 'ALL') {
      return history;
    }
    return history.filter(item => (item.userName || (language === 'en' ? 'Sales Rep' : 'Vendedor')) === selectedTraineeFilter);
  }, [history, isAdmin, selectedTraineeFilter, language]);

  if (selectedItem) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between no-print">
          <button 
            onClick={() => setSelectedItem(null)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'en' ? 'Back to My Calls' : 'Volver a Mis llamadas'}</span>
          </button>
          <div className="flex items-center gap-2">
            {selectedItem.userName && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold">
                {selectedItem.userName}
              </span>
            )}
            <span className="text-xs text-slate-500 hidden sm:inline">
              {selectedItem.type === 'Live Call' 
                ? (language === 'en' ? 'Simulated Practice' : 'Práctica Simulada') 
                : (language === 'en' ? 'Audited Recording' : 'Grabación Auditada')} · {selectedItem.date}
            </span>
          </div>
        </div>
        <Scorecard 
          evaluation={selectedItem.evaluation} 
          onReset={() => setSelectedItem(null)} 
          audioId={selectedItem.id}
          audioUrl={selectedItem.audioUrl}
          conversationId={selectedItem.conversationId}
          scenarioTitle={`${selectedItem.companyName} (${selectedItem.contactName})`}
          difficulty={selectedItem.difficulty || selectedItem.evaluation?.difficulty}
        />
      </div>
    );
  }

  const totalCalls = filteredHistory.length;
  const averageScore = totalCalls > 0 
    ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.score, 0) / totalCalls) 
    : 0;
  const passedCalls = filteredHistory.filter(item => item.score >= 70).length;
  const passRate = totalCalls > 0 
    ? Math.round((passedCalls / totalCalls) * 100) 
    : 0;

  // 10 most recent calls ordered chronologically
  const chartItems = [...filteredHistory].slice(0, 10).reverse();

  const handleClear = () => {
    const confirmMsg = language === 'en'
      ? "Do you want to permanently delete all call history?"
      : "¿Deseas eliminar permanentemente todo el historial de llamadas?";
    if (window.confirm(confirmMsg)) {
      onClearHistory();
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmMsg = language === 'en'
      ? "Delete this call log record?"
      : "¿Eliminar este registro de llamada?";
    if (window.confirm(confirmMsg)) {
      onDeleteHistoryItem?.(id);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] overflow-y-auto space-y-6 text-left text-slate-900">
      
      {/* Banner Principal */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-amber-600" /> {language === 'en' ? 'Commercial Supervision' : 'Supervisión Comercial'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-amber-600" /> {language === 'en' ? 'My Practice History' : 'Mi Historial de Prácticas'}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            {isAdmin 
              ? (language === 'en' ? 'Team Practice History' : 'Historial de Prácticas del Equipo') 
              : (language === 'en' ? 'My Calls & Evaluations' : 'Mis Llamadas y Evaluaciones')}
          </h1>
          <p className="text-slate-600 text-sm">
            {isAdmin 
              ? (language === 'en'
                  ? 'Review recorded calls for each sales rep, listen to audio files, and evaluate team progress.'
                  : 'Revisa las llamadas grabadas de cada vendedor, escucha los audios y evalúa su progreso.')
              : (language === 'en'
                  ? 'Review your past scorecards, listen to voice recordings, and apply key coaching improvements.'
                  : 'Revisa tus scorecards pasados, escucha las grabaciones de voz y aplica los puntos de mejora.')}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowManageUsers(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>{language === 'en' ? 'Manage Sales Reps' : 'Gestionar Vendedores'}</span>
            </button>
            {totalCalls > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl font-semibold text-sm border border-slate-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'en' ? 'Clear History' : 'Limpiar Historial'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filtro por Vendedor (Admin) */}
      {isAdmin && traineesList.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>{language === 'en' ? 'Filter by sales rep:' : 'Filtrar por vendedor:'}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTraineeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedTraineeFilter === 'ALL'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {language === 'en' ? 'All' : 'Todos'} ({history.length})
            </button>
            {traineesList.map(tItem => (
              <button
                key={tItem.name}
                onClick={() => setSelectedTraineeFilter(tItem.name)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTraineeFilter === tItem.name
                    ? 'bg-amber-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{tItem.name}</span>
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${
                  selectedTraineeFilter === tItem.name ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {tItem.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {totalCalls === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 flex flex-col items-center shadow-xs">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
            <PhoneCall className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h2 className="text-lg font-display font-bold text-slate-900">
              {language === 'en' ? 'No calls recorded yet' : 'Aún no hay llamadas registradas'}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {language === 'en'
                ? 'Start your first voice call simulation or upload a real audio file to see evaluations and listen to recordings.'
                : 'Inicia tu primera simulación de llamada por voz o sube un audio real para ver tus evaluaciones y escuchar tus grabaciones.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2">
            <button
              onClick={() => onNavigateToMode('Live Call Simulation')}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'en' ? 'Practice Call' : 'Practicar Llamada'}</span>
            </button>
            <button
              onClick={() => onNavigateToMode('Real Call Audit')}
              className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{language === 'en' ? 'Audit Recording' : 'Auditar Grabación'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Indicadores Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  {selectedTraineeFilter === 'ALL' 
                    ? (language === 'en' ? 'Average Score' : 'Score Promedio') 
                    : (language === 'en' ? 'Rep Average' : 'Promedio Vendedor')}
                </p>
                <div className="text-2xl font-display font-extrabold font-mono text-slate-900 mt-0.5">
                  {averageScore} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  {language === 'en' ? 'Completed Calls' : 'Llamadas Realizadas'}
                </p>
                <div className="text-2xl font-display font-extrabold font-mono text-slate-900 mt-0.5">
                  {totalCalls} <span className="text-xs text-slate-500 font-sans font-normal">
                    {totalCalls === 1 
                      ? (language === 'en' ? 'practice' : 'práctica') 
                      : (language === 'en' ? 'practices' : 'prácticas')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 shadow-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  {language === 'en' ? 'Pass Rate (≥70)' : 'Tasa de Aprobación (≥70)'}
                </p>
                <div className="text-2xl font-display font-extrabold font-mono text-slate-900 mt-0.5">
                  {passRate}% <span className="text-xs text-slate-500 font-sans font-normal">({passedCalls} {language === 'en' ? 'of' : 'de'} {totalCalls})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de Progresión */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="font-display font-bold text-slate-900 text-sm">
                {language === 'en' ? 'Score Progression (Last 10 sessions)' : 'Progresión de Puntajes (Últimas 10 sesiones)'}
              </h2>
              {selectedTraineeFilter !== 'ALL' && (
                <span className="text-xs font-semibold text-amber-800">
                  {language === 'en' ? 'Sales rep:' : 'Vendedor:'} {selectedTraineeFilter}
                </span>
              )}
            </div>
            
            <div className="h-40 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-slate-200 px-3">
              {chartItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="flex-1 flex flex-col items-center group h-full justify-end cursor-pointer" 
                  onClick={() => setSelectedItem(item)}
                  title={`${language === 'en' ? 'View call with' : 'Ver llamada con'} ${item.companyName} (${item.score}/100)`}
                >
                  <span className="text-xs font-mono font-bold text-slate-800 mb-1">
                    {item.score}
                  </span>
                  <div 
                    className="w-full max-w-[44px] rounded-t-lg transition-all duration-200 group-hover:opacity-85"
                    style={{ 
                      height: `${Math.max(item.score, 10)}%`,
                      backgroundColor: item.score >= 80 ? '#059669' : item.score >= 60 ? '#D97706' : '#DC2626'
                    }}
                  />
                  <span className="text-xs font-mono text-slate-400 mt-2 truncate w-full text-center">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Sesiones */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-display font-bold text-slate-900 text-sm">
                {language === 'en' ? 'Recorded Calls' : 'Llamadas Grabadas'}
              </h2>
              <span className="text-xs text-slate-500">
                {language === 'en' ? 'Click any session to open its evaluation and audio recording' : 'Haz clic en cualquier sesión para abrir su evaluación y audio'}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {[...filteredHistory].map((item) => {
                const diffLabel = item.difficulty === 'hardcore' || item.evaluation?.difficulty === 'hardcore'
                  ? (language === 'en' ? 'Hard' : 'Difícil')
                  : item.difficulty === 'challenging' || item.evaluation?.difficulty === 'challenging'
                    ? (language === 'en' ? 'Medium' : 'Medio')
                    : (language === 'en' ? 'Easy' : 'Fácil');

                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-xl shrink-0 bg-amber-50 text-amber-700 border border-amber-200">
                        {item.type === 'Live Call' ? <PhoneCall className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display font-bold text-slate-900 text-sm sm:text-base truncate group-hover:text-amber-700 transition-colors">
                            {item.companyName}
                          </span>

                          {item.userName && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {item.userName}
                            </span>
                          )}

                          <span className="text-xs text-slate-500">
                            · {item.type === 'Live Call' 
                                ? (language === 'en' ? 'Live call' : 'Llamada en vivo') 
                                : (language === 'en' ? 'Uploaded audio' : 'Audio subido')}
                          </span>

                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {diffLabel}
                          </span>

                          {(item.hasAudio ?? true) && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Headphones className="w-3 h-3" /> {language === 'en' ? 'Audio available' : 'Audio disponible'}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {language === 'en' ? 'Contact:' : 'Contacto:'} {item.contactName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {item.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                      <span 
                        className={`text-sm font-mono font-extrabold px-3 py-1 rounded-full ${
                          item.score >= 80 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.score >= 60 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.score} / 100
                      </span>

                      {isAdmin && onDeleteHistoryItem && (
                        <button
                          onClick={(e) => handleDeleteItem(e, item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={language === 'en' ? 'Delete record' : 'Eliminar registro'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {showManageUsers && (
        <AdminUserManager onClose={() => setShowManageUsers(false)} />
      )}

    </div>
  );
}
