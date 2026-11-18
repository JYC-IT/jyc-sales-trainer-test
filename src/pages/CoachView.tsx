import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getSystemInstruction } from '../instructions';
import { api } from '../services/api';
import Playbook from '../Playbook';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Send, User, Bot, Loader2, Mic, MicOff, BookOpen, MessageSquare
} from 'lucide-react';

interface CoachViewProps {
  voiceEnabled: boolean;
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

const INITIAL_MESSAGE_ES: Message = {
  role: 'model',
  content: `### Entrenador Comercial JYC Equipment

Estoy aquí para ayudarte a preparar tus llamadas de prospección y adquisición de maquinaria pesada.

Puedes consultarme sobre:
- **Cómo desviar a la recepcionista (gatekeeper)** y lograr que te comuniquen directamente con el jefe de planta u operaciones.
- **Aperturas y ganchos comerciales** según el sector (plásticos, puertos, concreto, metalmecánica, equipos médicos).
- **Las preguntas de calificación técnica** para inyectoras, montacargas pesados o reach stackers.
- **Cómo responder objeciones** de precio a ciegas, subastas, consignación o leasing.

Elige una consulta rápida o escribe tu pregunta:`
};

const INITIAL_MESSAGE_EN: Message = {
  role: 'model',
  content: `### JYC Equipment Sales Coach

I am here to help you prepare your cold outreach and heavy machinery acquisition calls.

You can ask me about:
- **How to bypass gatekeepers** and get routed directly to the plant or operations manager.
- **Commercial hooks and cold openers** tailored to each sector (plastics, ports, concrete, steel, medical).
- **Technical qualification questions** for injection molders, heavy forklifts, or reach stackers.
- **How to handle objections** regarding blind pricing, auctions, consignment, or leasing.

Select a quick prompt or type your question:`
};

const SCENARIO_CHIPS_ES = [
  "¿Qué respondo si dicen 'Solo vendemos por subasta'?",
  "Dame el guion para desviar a recepción en una planta de inyección de plástico",
  "¿Cómo pido las fotos de placa técnica y horómetro sin parecer invasivo?",
  "El cliente dice 'Dame tu oferta primero'. ¿Qué le respondo?",
  "Si no tienen maquinaria en venta hoy, ¿qué preguntas clave debo hacer?"
];

const SCENARIO_CHIPS_EN = [
  "What do I say if they say 'We only sell at auction'?",
  "Give me the script to bypass reception at a plastic molding plant",
  "How do I request serial plate photos without sounding invasive?",
  "Prospect says 'Give me your offer first'. How do I respond?",
  "If they have no machinery for sale today, what key questions should I ask?"
];

export default function CoachView({ voiceEnabled, onResetRef }: CoachViewProps) {
  const { language } = useLanguage();
  const initialMsg = language === 'en' ? INITIAL_MESSAGE_EN : INITIAL_MESSAGE_ES;
  const scenarioChips = language === 'en' ? SCENARIO_CHIPS_EN : SCENARIO_CHIPS_ES;

  const [messages, setMessages] = useState<Message[]>([initialMsg]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showPlaybookMobile, setShowPlaybookMobile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Update initial message when language toggles if user hasn't sent custom messages
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [language === 'en' ? INITIAL_MESSAGE_EN : INITIAL_MESSAGE_ES];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = () => {
        setMessages([language === 'en' ? INITIAL_MESSAGE_EN : INITIAL_MESSAGE_ES]);
        setInput('');
      };
    }
  }, [onResetRef, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_~`#\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'en' ? 'en-US' : 'es-ES';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'en' ? "Your browser does not support voice dictation." : "Tu navegador no soporta dictado por voz.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = language === 'en' ? 'en-US' : 'es-ES';

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognitionRef.current.onerror = () => setIsRecording(false);
    recognitionRef.current.onend = () => setIsRecording(false);

    recognitionRef.current.start();
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: promptText.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = newMessages.filter((m, idx) => {
        if (idx === 0 && m.role === 'model') return false;
        return true;
      });

      const systemInstruction = getSystemInstruction('Coach');
      const botResponse = await api.sendChatMessage(apiMessages, systemInstruction);

      const updated = [...newMessages, { role: 'model' as const, content: botResponse }];
      setMessages(updated);
      speakText(botResponse);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        { 
          role: 'model', 
          content: language === 'en'
            ? `Could not connect to the coach right now: ${err.message || 'Please try again.'}`
            : `No fue posible conectar con el coach en este momento: ${err.message || 'Intenta de nuevo.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt(input);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full overflow-hidden bg-[#F8F9FA]">
      
      {/* Selector Móvil */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">
          {showPlaybookMobile 
            ? (language === 'en' ? 'Commercial Playbook' : 'Playbook Comercial') 
            : (language === 'en' ? 'AI Coach' : 'Coach IA')}
        </span>
        <button
          onClick={() => setShowPlaybookMobile(!showPlaybookMobile)}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer"
        >
          {showPlaybookMobile ? (
            <>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Go to Coach Chat' : 'Ir al Chat con el Coach'}</span>
            </>
          ) : (
            <>
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'View Full Playbook' : 'Ver Playbook Completo'}</span>
            </>
          )}
        </button>
      </div>

      {/* Panel Izquierdo: Conversación con el Coach */}
      <div className={`flex-1 flex flex-col min-w-0 h-full ${
        showPlaybookMobile ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Barra de Preguntas Frecuentes */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
            {language === 'en' ? 'Quick questions:' : 'Preguntas rápidas:'}
          </span>
          {scenarioChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(chip)}
              disabled={loading}
              className="text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Flujo de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div 
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                  msg.role === 'user' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-slate-900 text-amber-400'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`min-w-0 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div 
                  className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-white text-left'
                      : 'bg-white border border-slate-200 text-slate-900'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="markdown-body max-w-none text-slate-800">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-2xl mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-sm font-medium text-slate-600 flex items-center gap-2 shadow-2xs">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>{language === 'en' ? 'The coach is crafting a tactical response...' : 'El coach está preparando la respuesta táctica...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Inferior */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={language === 'en' ? (isRecording ? 'Stop dictation' : 'Voice dictation') : (isRecording ? 'Detener dictado' : 'Dictar por voz')}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={language === 'en' ? 'Ask the coach about scripts, objections, or qualification...' : 'Pregúntale al coach sobre guiones, objeciones o calificación...'}
                rows={1}
                className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>

            <button
              onClick={() => handleSendPrompt(input)}
              disabled={!input.trim() || loading}
              className="p-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Panel Derecho: Playbook Completo */}
      <div className={`w-full lg:w-[480px] xl:w-[540px] border-t lg:border-t-0 lg:border-l border-slate-200 h-full p-4 overflow-hidden ${
        showPlaybookMobile ? 'flex flex-col' : 'hidden lg:flex flex-col'
      }`}>
        <Playbook />
      </div>

    </div>
  );
}
