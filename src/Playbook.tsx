import React, { useState } from 'react';
import { 
  BookOpen, UserCheck, ShieldAlert, FileText, ClipboardList, 
  Briefcase, Zap, Anchor, HeartPulse, CheckCircle2, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import { 
  GATEKEEPER_REBUTTALS, 
  OPENING_SCRIPTS, 
  QUALIFICATION_STEPS, 
  PHOTO_ANGLES, 
  ADVANCED_OBJECTIONS, 
  CROSS_SELL_SCRIPTS, 
  INDUSTRY_GUIDES, 
  WHAT_WE_BUY 
} from './data/playbookContent';
import { useLanguage } from './i18n/LanguageContext';

export default function Playbook() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'bypass' | 'qualify' | 'objections' | 'sell' | 'industries' | 'catalog'>('bypass');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs = [
    { 
      id: 'bypass', 
      label: language === 'en' ? 'Reception & Opening' : 'Recepción y Apertura', 
      count: language === 'en' ? '14 objections' : '14 objeciones', 
      icon: <UserCheck className="w-4 h-4" /> 
    },
    { 
      id: 'qualify', 
      label: language === 'en' ? 'Technical Qualification' : 'Calificación Técnica', 
      count: language === 'en' ? '4 steps' : '4 pasos', 
      icon: <ClipboardList className="w-4 h-4" /> 
    },
    { 
      id: 'objections', 
      label: language === 'en' ? 'Key Objections' : 'Objeciones Clave', 
      count: language === 'en' ? '10 responses' : '10 respuestas', 
      icon: <ShieldAlert className="w-4 h-4 text-amber-600" /> 
    },
    { 
      id: 'sell', 
      label: language === 'en' ? 'When They Want to Buy' : 'Cuando Quieren Comprar', 
      count: language === 'en' ? 'Cross-selling' : 'Venta cruzada', 
      icon: <Briefcase className="w-4 h-4 text-emerald-600" /> 
    },
    { 
      id: 'industries', 
      label: language === 'en' ? 'Sector Guides' : 'Guías por Sector', 
      count: language === 'en' ? '5 industries' : '5 industrias', 
      icon: <Zap className="w-4 h-4 text-amber-600" /> 
    },
    { 
      id: 'catalog', 
      label: language === 'en' ? 'What We Buy' : 'Qué Compramos', 
      count: language === 'en' ? 'Target fleet' : 'Flota objetivo', 
      icon: <BookOpen className="w-4 h-4" /> 
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs h-full flex flex-col min-h-[500px] max-h-full overflow-hidden text-left">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-900 text-base sm:text-lg">
              {language === 'en' ? 'Commercial Library & Playbook' : 'Biblioteca y Playbook Comercial'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {language === 'en' 
                ? 'Word-for-word scripts in English and Spanish to bypass gatekeepers, qualify, and close.'
                : 'Guiones textuales en inglés y español para desviar recepcionistas, calificar y cerrar.'}
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex border-b border-slate-100 mt-3 gap-1.5 overflow-x-auto shrink-0 pb-2 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Área de Contenido con Scroll */}
      <div className="flex-1 overflow-y-auto pt-4 text-left space-y-5 text-sm leading-relaxed text-slate-700">
        
        {/* PESTAÑA: RECEPCIÓN Y APERTURA */}
        {activeTab === 'bypass' && (
          <div className="space-y-5">
            
            {/* Apertura Verbatim */}
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {language === 'en' ? 'Master Opening Script (Reception)' : 'Guion Maestro de Apertura (Recepción)'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'en' ? 'Read with natural and confident cadence' : 'Léelo con tono natural y seguro'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {language === 'en' ? 'English (US Call):' : 'Inglés (Llamada a EE.UU.):'}
                    </span>
                    <button
                      onClick={() => handleCopy(OPENING_SCRIPTS.reception.en, 'rec-en')}
                      className="text-xs text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'rec-en' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'rec-en' ? (language === 'en' ? 'Copied' : 'Copiado') : (language === 'en' ? 'Copy' : 'Copiar')}</span>
                    </button>
                  </div>
                  <p className="text-slate-900 font-medium italic text-sm">
                    "{OPENING_SCRIPTS.reception.en}"
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {language === 'en' ? 'Spanish:' : 'Español:'}
                    </span>
                    <button
                      onClick={() => handleCopy(OPENING_SCRIPTS.reception.es, 'rec-es')}
                      className="text-xs text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'rec-es' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === 'rec-es' ? (language === 'en' ? 'Copied' : 'Copiado') : (language === 'en' ? 'Copy' : 'Copiar')}</span>
                    </button>
                  </div>
                  <p className="text-slate-800 italic text-sm">
                    "{OPENING_SCRIPTS.reception.es}"
                  </p>
                </div>
              </div>

              {/* Si preguntan de qué se trata */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-amber-400 block uppercase">
                  {language === 'en' ? 'If the receptionist asks: "What is the call regarding?"' : 'Si la recepcionista pregunta: "¿De qué se trata la llamada?"'}
                </span>
                <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                  "{OPENING_SCRIPTS.reception.ifAskedDetailsEn}"
                </p>
              </div>
            </div>

            {/* 14 Escenarios de Respuesta a la Recepcionista */}
            <div className="space-y-3">
              <h3 className="text-base font-bold font-display text-slate-900">
                {language === 'en' ? '14 Gatekeeper Bypass Scenarios' : '14 Escenarios de Desvío de Recepcionista (Gatekeeper)'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {GATEKEEPER_REBUTTALS.map((item: any) => (
                  <div key={item.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                        {language === 'en' ? `Objection #${item.id}` : `Objeción #${item.id}`}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        "{language === 'en' ? (item.objectionEn || item.objection) : (item.objectionEs || item.objection)}"
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-slate-500 font-medium block">
                        {language === 'en' ? 'English Response:' : 'Respuesta en Inglés:'}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 italic">
                        "{item.responseEn}"
                      </p>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-medium block">
                        {language === 'en' ? 'In Spanish:' : 'En Español:'}
                      </span>
                      <p className="text-sm text-slate-700 italic">
                        "{item.responseEs}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA: CALIFICACIÓN TÉCNICA */}
        {activeTab === 'qualify' && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {language === 'en' ? 'Qualification Protocol' : 'Protocolo de Calificación'}
              </span>
              <p className="text-sm text-slate-700">
                {language === 'en'
                  ? 'Never state pricing before completing these 4 steps. The phone goal is to secure equipment data so our valuation desk can issue a formal cash purchase offer in 24 hours.'
                  : 'Nunca hables de precio antes de conseguir estos 4 pasos. El objetivo de la llamada es asegurar los datos para que el equipo de tasación emita una oferta formal en 24 horas.'}
              </p>
            </div>

            <div className="space-y-4">
              {QUALIFICATION_STEPS.map((step: any) => (
                <div key={step.step} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                        {step.step}
                      </span>
                      <h3 className="font-bold font-display text-slate-900 text-base">
                        {language === 'en' ? (step.titleEn || step.title) : (step.titleEs || step.title)}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {language === 'en' ? 'Purpose: ' : 'Propósito: '}
                      {language === 'en' ? (step.purposeEn || step.purpose) : (step.purposeEs || step.purpose)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-xs font-bold text-slate-600 block">
                        {language === 'en' ? 'In English:' : 'En Inglés:'}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 italic leading-snug">"{step.questionEn}"</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-xs font-bold text-slate-600 block">
                        {language === 'en' ? 'In Spanish:' : 'En Español:'}
                      </span>
                      <p className="text-sm text-slate-800 italic leading-snug">"{step.questionEs}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Los 6 Ángulos de Foto */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  {language === 'en' 
                    ? 'The 6 Essential Photo Angles for Valuation' 
                    : 'Los 6 Ángulos de Fotografía Indispensables para la Oferta'}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {language === 'en'
                  ? 'Request these 6 photos so formal purchase pricing can be delivered within 24 hours without wasting client time on preliminary in-person walk-throughs:'
                  : 'Pide estas 6 fotos para que la cotización formal se entregue en 24 horas sin necesidad de que el cliente gaste tiempo recibiendo visitas preliminares:'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {PHOTO_ANGLES.map((angle) => (
                  <div key={angle.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                    <span className="text-xs font-bold text-amber-700 block">
                      {language === 'en' ? `Photo #${angle.id}` : `Foto #${angle.id}`}
                    </span>
                    <span className="font-semibold text-slate-900">{language === 'en' ? angle.nameEn : angle.nameEs}</span>
                    <span className="text-xs text-slate-500 block">({language === 'en' ? angle.nameEs : angle.nameEn})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: OBJECIONES CLAVE */}
        {activeTab === 'objections' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {language === 'en' ? 'Golden Rule for Objections' : 'Regla de Oro en Objeciones'}
              </span>
              <p className="text-sm text-slate-800">
                {language === 'en'
                  ? 'Never argue with prospects. Validate their position, clarify that we purchase equipment directly via wire transfer (we are direct cash buyers, not listing brokers), and offer to evaluate their machinery with zero obligation.'
                  : 'No discutas con el cliente. Valida su postura, aclara que nosotros compramos directamente por transferencia bancaria (no somos comisionistas ni intermediarios) y ofrece evaluar su máquina sin compromiso.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ADVANCED_OBJECTIONS.map((obj: any) => (
                <div key={obj.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-rose-800 block">
                      {language === 'en' ? 'OBJECTION:' : 'OBJECIÓN:'} "{language === 'en' ? (obj.objectionEn || obj.objection) : (obj.objectionEs || obj.objection)}"
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-medium block">
                      {language === 'en' ? 'Response in English:' : 'Respuesta en Inglés:'}
                    </span>
                    <p className="text-sm font-semibold text-slate-900 italic leading-snug">
                      "{obj.responseEn}"
                    </p>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-medium block">
                      {language === 'en' ? 'In Spanish:' : 'En Español:'}
                    </span>
                    <p className="text-sm text-slate-700 italic leading-snug">
                      "{obj.responseEs}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA: CUANDO QUIEREN COMPRAR */}
        {activeTab === 'sell' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                {language === 'en' ? 'Cross-Selling Script' : 'Guion de Venta Cruzada'}
              </span>
              <p className="text-sm text-emerald-800">
                {language === 'en'
                  ? 'If a prospect responds they are looking to buy equipment rather than sell surplus, use our cross-selling script to capture their exact machinery requirements and pass the lead to the sales desk.'
                  : 'Si el cliente responde que más bien está buscando comprar maquinaria, utiliza nuestro guion de venta cruzada para registrar su requerimiento exacto y pasarlo a la mesa comercial.'}
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'en' ? 'When the Prospect Needs to Acquire Machinery' : 'Cuando el prospecto necesita adquirir equipos'}
              </h3>
              <div className="space-y-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {language === 'en' ? 'English:' : 'En Inglés:'}
                  </span>
                  <p className="text-sm font-semibold text-slate-900 italic">
                    "{CROSS_SELL_SCRIPTS.en}"
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {language === 'en' ? 'Spanish:' : 'En Español:'}
                  </span>
                  <p className="text-sm text-slate-700 italic">
                    "{CROSS_SELL_SCRIPTS.es}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: GUÍAS POR SECTOR */}
        {activeTab === 'industries' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(INDUSTRY_GUIDES).map((ind: any) => (
              <div key={ind.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-base">{ind.title || ind.name}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  <strong className="text-slate-800">{language === 'en' ? 'Key machinery: ' : 'Equipos clave: '}</strong>
                  {ind.targetEquipment || ind.machinery}
                </p>
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900 space-y-1">
                  <strong className="block">{language === 'en' ? 'Killer qualifying question: ' : 'Pregunta fulminante de apertura: '}</strong>
                  <p className="italic">
                    "{language === 'en' ? (ind.qualifyQuestionEn || ind.killerQuestion) : (ind.qualifyQuestionEs || ind.killerQuestion)}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PESTAÑA: QUÉ COMPRAMOS */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {language === 'en' ? 'Target Acquisition Catalog' : 'Catálogo Objetivo de Adquisición JYC'}
              </span>
              <p className="text-sm text-slate-700">
                {language === 'en'
                  ? 'Target equipment categories we acquire immediately with fast wire transfer payment and free pickup:'
                  : 'Equipos prioritarios que compramos de inmediato con pago por transferencia y retiro a nuestro cargo:'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {WHAT_WE_BUY.map((cat: any, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {language === 'en' ? (cat.categoryEn || cat.category) : (cat.categoryEs || cat.category)}
                  </h4>
                  <p className="text-xs text-slate-600">{cat.models}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
