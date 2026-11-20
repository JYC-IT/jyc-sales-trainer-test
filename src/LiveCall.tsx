import React, { useState, useRef, useEffect } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { Mode, HistoryItem, User as UserType } from './types';
import { Loader2 } from 'lucide-react';
import Scorecard from './Scorecard';
import { saveAudio } from './audioDb';
import { sfx } from './utils/audioEffects';
import { SCENARIOS } from './data/scenarios';
import CallSetupWizard, { CallDifficulty } from './components/CallSetupWizard';
import ActiveCallView from './components/ActiveCallView';
import { calculateCallXP } from './utils/gamification';
import { useLanguage } from './i18n/LanguageContext';
import { getAuthHeaders } from './services/api';

interface TranscriptItem {
  id: number;
  role: 'user' | 'agent' | 'ai';
  text: string;
}

interface LiveCallProps {
  currentUser?: UserType | null;
  recentHistory?: HistoryItem[];
  onNavigate?: (mode: Mode) => void;
  onEvaluationComplete?: (
    score: number, 
    evaluation: any, 
    contactName: string, 
    companyName: string, 
    opts?: { 
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
  ) => void;
}

const ElevenLabsCallView = ({ 
  currentUser,
  recentHistory = [],
  onNavigate,
  onEvaluationComplete 
}: LiveCallProps) => {
  const { language: uiLang } = useLanguage();
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [micVolume, setMicVolume] = useState<number>(0);

  // Audio Recording States
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Configuration States
  const [difficulty, setDifficulty] = useState<CallDifficulty>('friendly');
  const [language, setLanguage] = useState<'English' | 'Spanish'>('English');
  const [industry, setIndustry] = useState<string>('concrete');
  const [contactName, setContactName] = useState('Charles');
  const [companyName, setCompanyName] = useState('Northern Quarries');
  const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const activeScenario = SCENARIOS.find(s => s.id === industry) || SCENARIOS[0];

  useEffect(() => {
    const defaults = activeScenario.defaults[language];
    setCompanyName(defaults.company);
    setContactName(defaults.contact);
  }, [industry, language]);

  // Evaluation & Disconnection States
  const [unexpectedDisconnect, setUnexpectedDisconnect] = useState(false);
  const userEndedCallRef = useRef(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);

  // Call timer state
  const [callDuration, setCallDuration] = useState(0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamic Interest Score (Paciencia inicial calibrada por nivel de dificultad)
  const getInitialPatience = (diff: CallDifficulty) => {
    if (diff === 'friendly') return 90;
    if (diff === 'challenging') return 70;
    if (diff === 'hardcore') return 55;
    return 45; // jefe_final
  };

  // Umbral de Cuelgue por Desinterés según Dificultad (si baja más de este límite, el cliente cuelga)
  const getHangupThreshold = (diff: CallDifficulty) => {
    if (diff === 'friendly') return 20;
    if (diff === 'challenging') return 30; // Cuelga al llegar a 30%
    if (diff === 'hardcore') return 35;   // Cuelga al llegar a 35%
    return 40;                            // jefe_final: Cuelga al llegar a 40%
  };

  const [interestScore, setInterestScore] = useState(() => getInitialPatience(difficulty));
  const [whisperAlert, setWhisperAlert] = useState<string | null>(null);
  const lastActivityTimeRef = useRef(Date.now());

  // Sound Effects & Volume
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [aiVolume, setAiVolume] = useState(1);

  const handleVolumeChange = (newVol: number) => {
    setAiVolume(newVol);
    try {
      (conversation as any).setVolume?.({ volume: newVol });
    } catch {}
  };

  // Sync interest score when difficulty changes
  useEffect(() => {
    setInterestScore(getInitialPatience(difficulty));
  }, [difficulty]);

  const conversation = useConversation({
    onConnect: ({ conversationId }: { conversationId?: string } = {}) => {
      setConnectionError(null);
      setUnexpectedDisconnect(false);
      lastActivityTimeRef.current = Date.now();
      sfx.playPickupClick();
      if (conversationId) {
        setCurrentConversationId(conversationId);
      }
    },
    onMessage: (msg) => {
      const text = (msg.message || '').trim();
      const role = msg.role || msg.source;
      if (!text || text === '...' || text === 'null' || text === '…') {
        return;
      }
      setTranscripts(prev => [...prev, {
        id: Date.now() + Math.random(),
        role: role,
        text: text
      }]);

      lastActivityTimeRef.current = Date.now();
      const lower = text.toLowerCase();

      if (role !== 'user') {
        // Prospect speaking -> analyze objections and trigger Whisper AI
        if (lower.includes('cuanto') || lower.includes('cuánto') || lower.includes('precio') || lower.includes('ballpark') || lower.includes('how much')) {
          setWhisperAlert('⚠️ Alerta de Precio Ciego: Solicita foto de placa y horómetro antes de cotizar.');
          const penalty = difficulty === 'jefe_final' ? 16 : difficulty === 'hardcore' ? 12 : 8;
          setInterestScore(prev => Math.max(5, prev - penalty));
          sfx.playObjectionAlert();
        } else if (lower.includes('subasta') || lower.includes('auction') || lower.includes('ritchie') || lower.includes('dealer') || lower.includes('trade-in')) {
          setWhisperAlert('💡 Argumento JYC: 0% comisiones, pago transferido en 24h y logística 100% asumida.');
          const penalty = difficulty === 'jefe_final' ? 14 : difficulty === 'hardcore' ? 10 : 6;
          setInterestScore(prev => Math.max(5, prev - penalty));
          sfx.playObjectionAlert();
        } else if (lower.includes('no me interesa') || lower.includes('no tenemos tiempo') || lower.includes('busy') || lower.includes('correo') || lower.includes('afán') || lower.includes('prisa') || lower.includes('perder el tiempo')) {
          setWhisperAlert('💡 Gancho rápido: "Solo le robo 30 segundos; si no tiene unidades paradas no le quito más tiempo".');
          const penalty = difficulty === 'jefe_final' ? 18 : difficulty === 'hardcore' ? 14 : 9;
          setInterestScore(prev => Math.max(5, prev - penalty));
          sfx.playObjectionAlert();
        }
        // La paciencia NUNCA sube de forma pasiva; solo sube con buenas respuestas del vendedor
      } else {
        // Trainee speaking -> detect weak/hesitant answers vs professional sales arguments
        const isWeakAnswer = 
          lower.includes('no recuerdo') || 
          lower.includes('no sé') || 
          lower.includes('no se') || 
          lower.includes('no me acuerdo') || 
          lower.includes('no tengo idea') || 
          lower.includes('no se de que') ||
          lower.includes('no estoy seguro') ||
          lower.includes('no recuerdo mi cuenta') ||
          lower.includes('no sé qué equipo') ||
          lower.includes('tal vez') ||
          lower.includes('quizás') ||
          lower.includes('creo que') ||
          lower.includes('i don\'t know') ||
          lower.includes('not sure');

        const isGoodArgument = 
          lower.includes('flete') || 
          lower.includes('maniobra') || 
          lower.includes('24 hora') || 
          lower.includes('placa') || 
          lower.includes('horometro') || 
          lower.includes('horómetro') || 
          lower.includes('desmontaje') || 
          lower.includes('cama baja') || 
          lower.includes('wire') || 
          lower.includes('efectivo') || 
          lower.includes('cash') || 
          lower.includes('de contado') || 
          lower.includes('transferencia') || 
          lower.includes('directo') || 
          lower.includes('comprador directo') || 
          lower.includes('sin comision') || 
          lower.includes('sin comisión') ||
          lower.includes('no somos intermediarios') ||
          lower.includes('subasta') ||
          lower.includes('30 segundo') ||
          lower.includes('unidades paradas') ||
          lower.includes('número de serie') ||
          lower.includes('condición de operación');

        const isStammerOrIncomplete = 
          text.trim().endsWith('-') || 
          lower.endsWith(' para') || 
          lower.endsWith(' con') || 
          lower.endsWith(' de') || 
          lower.includes('eh, muy buenas') ||
          lower.includes('con, con') ||
          lower === 'ah, sí.' ||
          lower === 'ah sí' ||
          lower === 'hello?' ||
          lower === 'hola?';

        if (isWeakAnswer) {
          // Penalización severa por mostrar ignorancia o duda frente al tomador de decisión
          const penalty = difficulty === 'jefe_final' ? 26 : difficulty === 'hardcore' ? 20 : 14;
          setInterestScore(prev => Math.max(0, prev - penalty));
          setWhisperAlert('⚠️ Respuesta Débil: Nunca digas que no sabes o no recuerdas frente a un director.');
          sfx.playObjectionAlert();
        } else if (isStammerOrIncomplete) {
          // Penalización por tartamudeo o frase incompleta
          const penalty = difficulty === 'jefe_final' ? 20 : difficulty === 'hardcore' ? 15 : 10;
          setInterestScore(prev => Math.max(0, prev - penalty));
          setWhisperAlert('⚠️ Inseguridad / Vacilación: Habla con frases directas y completas.');
          sfx.playObjectionAlert();
        } else if (isGoodArgument) {
          const reward = difficulty === 'jefe_final' ? 8 : difficulty === 'hardcore' ? 10 : 14;
          setInterestScore(prev => Math.min(100, prev + reward));
          setWhisperAlert(null);
          sfx.playMilestoneChime();
        } else if (text.split(/\s+/).length < 3 && !lower.includes('buenos') && !lower.includes('buen') && !lower.includes('hola') && !lower.includes('carlos')) {
          // Monosílabos vacíos sin valor ni propuesta
          const penalty = difficulty === 'jefe_final' ? 12 : 8;
          setInterestScore(prev => Math.max(0, prev - penalty));
        }
      }
    },
    onError: (err: any) => {
      sfx.stopPhoneRinging();
      console.error("ElevenLabs conversation error:", err);
      setConnectionError(typeof err === 'string' ? err : (err?.message || "La conexión de voz se interrumpió. Verifica tu micrófono e intenta de nuevo."));
    },
    onDisconnect: (details: any) => {
      sfx.stopPhoneRinging();
      console.warn("ElevenLabs disconnected:", details);
      const closeReason = details?.closeReason || details?.message || details?.context?.closeReason;
      if (details?.closeCode === 3000 || (typeof closeReason === 'string' && closeReason.includes('not available'))) {
        const errorMsg = language === 'English'
          ? "The ElevenLabs voice agent is currently unavailable ('The AI agent you are trying to reach is not available' - error 3000). This occurs when the ElevenLabs account exhausts its free quota or the agent is paused. Please configure your ELEVENLABS_API_KEY in .env."
          : "El agente de voz de ElevenLabs no está disponible en este momento ('The AI agent you are trying to reach is not available' - error 3000). Esto ocurre cuando la cuenta de ElevenLabs agotó su cuota de minutos o el agente está inactivo. Por favor configura tu ELEVENLABS_API_KEY en .env.";
        setConnectionError(errorMsg);
      } else if (details?.reason === "agent") {
        setConnectionError(language === 'English' ? "Call ended by prospect." : "Llamada finalizada por el prospecto.");
      } else if (details?.reason === "error") {
        setConnectionError(`Error: ${details?.message || "La conexión de voz se interrumpió."}`);
      }
    }
  });

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";

  // Call timer effect
  useEffect(() => {
    let interval: any;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isConnected, unexpectedDisconnect]);

  // Live Microphone Level Monitoring (Lectura pasiva para el vúmetro, 100% segura)
  useEffect(() => {
    if (!isConnected) {
      setMicVolume(0);
      return;
    }

    const interval = setInterval(() => {
      try {
        const vol = conversation.getInputVolume?.() || 0;
        setMicVolume(vol);
      } catch {}
    }, 100);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleForceTurn = () => {
    try {
      (conversation as any).sendContextualUpdate?.(
        language === 'English'
          ? "The user has paused. Please respond promptly and naturally."
          : "El vendedor ha pausado su respuesta. Responde de inmediato de forma natural."
      );
    } catch (e) {
      console.warn("Force turn error:", e);
    }
  };

  // Inactivity / Hesitation Patience Decay Effect
  // Si el vendedor tarda en responder o se queda en blanco, la paciencia baja de acuerdo a la dificultad
  useEffect(() => {
    if (!isConnected || conversation.isSpeaking) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const silentSecs = (now - lastActivityTimeRef.current) / 1000;

      // Umbrales de tolerancia de silencio según dificultad
      let graceThreshold = 8;
      let decayStep = 2;
      if (difficulty === 'jefe_final') {
        graceThreshold = 2.5;
        decayStep = 8;
      } else if (difficulty === 'hardcore') {
        graceThreshold = 4.0;
        decayStep = 5;
      } else if (difficulty === 'challenging') {
        graceThreshold = 6.0;
        decayStep = 3;
      }

      if (silentSecs > graceThreshold) {
        setInterestScore(prev => Math.max(0, prev - decayStep));
        if (silentSecs > graceThreshold + 2 && !whisperAlert) {
          setWhisperAlert(language === 'English'
            ? '⚠️ The prospect is getting impatient with your silence. Respond now!'
            : '⚠️ El cliente se está impacientando por tu vacilación. ¡Respóndele ya!');
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isConnected, conversation.isSpeaking, difficulty, language, whisperAlert]);

  // Automatic Hang-Up when Patience / Quality drops below threshold (Cuelgue por desinterés)
  useEffect(() => {
    const threshold = getHangupThreshold(difficulty);
    if (isConnected && interestScore <= threshold && !userEndedCallRef.current) {
      userEndedCallRef.current = true;
      sfx.playHangupBeeps();
      const hangupReason = language === 'English'
        ? `The prospect lost all interest (patience fell to ${interestScore}%) and hung up on you due to hesitations or lack of a clear offer!`
        : `¡El cliente perdió el interés (la paciencia cayó al ${interestScore}%) y te ha colgado por falta de claridad o vacilación!`;
      setConnectionError(hangupReason);
      try {
        const p = conversation.endSession?.();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      } catch {}
      triggerEvaluation();
    }
  }, [isConnected, interestScore, difficulty, language]);

  // Session ending drop detection
  useEffect(() => {
    if (isConnected) {
      userEndedCallRef.current = false;
      setUnexpectedDisconnect(false);
    } else if (conversation.status === 'disconnected') {
      sfx.stopPhoneRinging();
      if (!userEndedCallRef.current && (transcripts.length > 0 || callDuration >= 4) && !showEvaluation) {
        setUnexpectedDisconnect(true);
        triggerEvaluation();
      }
    }
  }, [isConnected, conversation.status, transcripts.length, callDuration, showEvaluation]);

  const handleStartCall = async () => {
    try {
      userEndedCallRef.current = false;
      setUnexpectedDisconnect(false);
      setConnectionError(null);
      setTranscripts([]);
      setInterestScore(getInitialPatience(difficulty));
      lastActivityTimeRef.current = Date.now();
      const callId = Date.now().toString() + Math.random().toString().substring(2, 6);
      setCurrentCallId(callId);
      setCurrentConversationId(null);
      audioChunksRef.current = [];

      if (sfxEnabled) {
        sfx.startPhoneRinging();
      }

      const greeting = language === 'English'
        ? `Good morning, thank you for calling ${companyName || "the facility"}. How can I help you?`
        : `Buenos días, gracias por llamar a ${companyName || "la planta"}. ¿En qué le puedo ayudar?`;

      const dynamicVariables = {
        difficulty: difficulty,
        language: language,
        first_message: greeting,
        contact_name: contactName || "Carlos",
        company_name: companyName || "Canteras del Norte",
        industry: industry
      };

      // Obtener sesión segura autenticada mediante signed-url
      const res = await fetch(`/api/elevenlabs/signed-url`, {
        headers: getAuthHeaders(),
        credentials: 'same-origin'
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `No se pudo obtener la conexión de voz segura (${res.status}).`);
      }

      const data = await res.json();
      if (!data?.signedUrl) {
        throw new Error("El servidor no generó una URL de conexión válida.");
      }

      const sessionConfig = {
        signedUrl: data.signedUrl,
        connectionType: "websocket" as const,
        dynamicVariables
      };

      await conversation.startSession(sessionConfig);
    } catch (err: any) {
      sfx.stopPhoneRinging();
      console.error("Start call error:", err);
      setConnectionError(err.message || 'Verifica tu conexión y los permisos de micrófono.');
    }
  };

  const handleEndCall = async () => {
    try {
      userEndedCallRef.current = true;
      setUnexpectedDisconnect(false);
      sfx.stopPhoneRinging();
      if (sfxEnabled) {
        sfx.playHangupBeeps();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      await conversation.endSession();
      triggerEvaluation();
    } catch (err) {
      sfx.stopPhoneRinging();
      console.error("End call error:", err);
      triggerEvaluation();
    }
  };

  const handleResetCall = () => {
    userEndedCallRef.current = false;
    setUnexpectedDisconnect(false);
    setShowEvaluation(false);
    setEvaluation(null);
    setTranscripts([]);
    setCurrentCallId(null);
    setCurrentConversationId(null);
  };

  const triggerEvaluation = async () => {
    setShowEvaluation(true);
    setEvaluating(true);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {}
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    let hasSavedAudio = false;
    if (currentCallId) {
      if (audioChunksRef.current.length > 0) {
        try {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const localBlob = new Blob(audioChunksRef.current, { type: mimeType });
          await saveAudio(currentCallId, localBlob);
          hasSavedAudio = true;

          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = (reader.result as string)?.split(',')[1];
            if (base64data) {
              fetch('/api/audios/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: currentCallId,
                  audioBase64: base64data,
                  mimeType: localBlob.type || 'audio/webm'
                })
              }).catch(() => {});
            }
          };
          reader.readAsDataURL(localBlob);
        } catch (err) {
          console.error("Failed to save local audio:", err);
        }
      }

      if (currentConversationId) {
        hasSavedAudio = true;
        (async () => {
          for (let attempt = 0; attempt < 5; attempt++) {
            await new Promise(r => setTimeout(r, 3000));
            try {
              const res = await fetch(`/api/elevenlabs/conversation-audio/${currentConversationId}`);
              if (res.ok) {
                const fullBlob = await res.blob();
                if (fullBlob.size > 1000) {
                  await saveAudio(currentCallId, fullBlob);
                  break;
                }
              }
            } catch (e) {
              console.warn("Attempt to fetch full ElevenLabs audio failed:", e);
            }
          }
        })();
      }
    }

    try {
      const dialogueText = transcripts.map(t => `${t.role === 'user' ? 'Vendedor (Trainee)' : 'Prospecto (Cliente)'}: ${t.text}`).join('\n');

      const prompt = `Eres un auditor comercial de élite especializado en adquisición y venta de maquinaria pesada industrial para JYC Equipment / JYC Medical.
Audita la siguiente llamada de ventas entre nuestro vendedor (Vendedor) y un tomador de decisión industrial (Prospecto).

Idioma hablado en la llamada: ${language}
Empresa contactada: ${companyName}
Contacto clave: ${contactName}
Dificultad: ${difficulty}

Transcripción del diálogo:
${dialogueText}

REGLAS CRÍTICAS PARA LA EVALUACIÓN:
1. EVALUACIÓN BASADA EN EVIDENCIA:
   - Todo puntaje, fortaleza, debilidad y recomendación DEBE estar respaldado por ejemplos observables de la conversación.
2. REGLA DE ORO DE PRECIO:
   - Al comprar maquinaria, el vendedor NUNCA debe dar una cotización o "ballpark" a ciegas por teléfono sin antes pedir foto de placa técnica y horómetro para una tasación formal en 24 horas.
3. 10 CRITERIOS COMERCIALES (CHECKLIST):
   - openingAndPresentation: Apertura profesional y desvío de recepcionista con aplomo.
   - attentionGrabbing: Gancho comercial e impacto inicial (compradores directos en efectivo).
   - needsIdentification: Detección metódica de flota parada o en renovación.
   - activeListeningAndQuestions: Preguntas técnicas precisas (marca, modelo, horas, aditamentos).
   - proposalClarity: Claridad de propuesta (pago transferido en 24h antes del retiro, logística asumida).
   - commercialValueArgumentation: Argumentación de valor sin comisiones.
   - objectionHandling: Manejo solvente de objeciones (subasta, precio, Miami).
   - negotiationWithoutPressure: Negociación profesional sin desesperación.
   - unexpectedOpportunities: Detección de oportunidades si el cliente quiere comprar o dar referidos.
   - closingAndNextStep: Cierre acordado (compromiso de envío de las 6 fotos obligatorias de placa técnica).

Por favor redacta todos los campos de retroalimentación (summary, strengths, weaknesses, objections feedback, recommendations) en español profesional, citando ejemplos de la llamada.

Devuelve estrictamente un JSON válido con este esquema:
{
  "score": number, // 0 a 100
  "contactName": "${contactName}",
  "companyName": "${companyName}",
  "summary": "Resumen ejecutivo en español citando ejemplos de la llamada...",
  "strengths": ["Fortaleza 1 con ejemplo", "Fortaleza 2 con ejemplo"],
  "weaknesses": ["Aspecto a mejorar 1 con ejemplo", "Aspecto a mejorar 2 con ejemplo"],
  "checklist": {
    "openingAndPresentation": boolean,
    "attentionGrabbing": boolean,
    "needsIdentification": boolean,
    "activeListeningAndQuestions": boolean,
    "proposalClarity": boolean,
    "commercialValueArgumentation": boolean,
    "objectionHandling": boolean,
    "negotiationWithoutPressure": boolean,
    "unexpectedOpportunities": boolean,
    "closingAndNextStep": boolean
  },
  "objectionsHandled": [
    { "objection": "Objeción presentada", "handledWell": boolean, "feedback": "Retroalimentación táctica" }
  ],
  "recommendations": ["Recomendación prioritaria 1", "Recomendación táctica 2"]
}`;

      let response;
      let retries = 3;
      let lastErr: any;

      while (retries > 0) {
        try {
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            },
            credentials: 'same-origin',
            body: JSON.stringify({
              messages: [{ role: 'user', content: prompt }],
              systemInstruction: "Eres un auditor comercial estricto de maquinaria pesada. Devuelve ÚNICAMENTE un objeto JSON válido según el esquema solicitado. Sin texto adicional ni formato markdown."
            })
          });
          if (response.ok) break;
          retries--;
          await new Promise(r => setTimeout(r, 2000));
        } catch (fetchErr) {
          lastErr = fetchErr;
          retries--;
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (!response || !response.ok) {
        const errJson = response ? await response.json().catch(() => null) : null;
        throw new Error(errJson?.error || lastErr?.message || "No fue posible comunicarse con el servicio evaluador.");
      }

      const data = await response.json();
      const text = data.text || '';

      let parsedData;
      try {
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanText);
      } catch {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          parsedData = JSON.parse(text.substring(start, end + 1));
        } else {
          // Fallback seguro si Gemini no formateó JSON puro
          parsedData = {
            score: transcripts.length > 3 ? 65 : 40,
            contactName,
            companyName,
            summary: text || "Simulación de llamada finalizada. Se recomienda continuar practicando la calificación técnica.",
            strengths: ["Intento de contacto inicial", "Apertura de conversación"],
            weaknesses: ["Mayor duración requerida para calificar maquinaria", "Asegurar las 6 fotos obligatorias de placa técnica"],
            checklist: {
              openingAndPresentation: true,
              attentionGrabbing: true,
              needsIdentification: false,
              activeListeningAndQuestions: false,
              proposalClarity: false,
              commercialValueArgumentation: false,
              objectionHandling: false,
              negotiationWithoutPressure: false,
              unexpectedOpportunities: false,
              closingAndNextStep: false
            },
            objectionsHandled: [],
            recommendations: ["Completar al menos 3 minutos para evaluar las 4 etapas de calificación técnica."]
          };
        }
      }

      const normalizedTranscript = transcripts.map(t => ({
        role: t.role === 'user' ? 'user' : 'prospect',
        text: t.text
      }));

      const fullEvaluation = {
        ...parsedData,
        difficulty: difficulty,
        transcript: parsedData.transcript || normalizedTranscript
      };

      const { xp } = calculateCallXP(fullEvaluation.score, callDuration);
      const stage = 
        difficulty === 'jefe_final' ? 'jefe_final' :
        difficulty === 'hardcore' ? 'dificil' :
        difficulty === 'challenging' ? 'medio' : 'facil';

      setEvaluation(fullEvaluation);
      onEvaluationComplete?.(
        fullEvaluation.score,
        fullEvaluation,
        contactName,
        companyName,
        {
          id: currentCallId || undefined,
          hasAudio: hasSavedAudio,
          conversationId: currentConversationId || undefined,
          audioUrl: currentConversationId ? `/api/elevenlabs/conversation-audio/${currentConversationId}` : undefined,
          difficulty: difficulty,
          durationSeconds: callDuration,
          xpEarned: xp,
          industry: industry,
          levelStage: stage
        }
      );
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setEvaluation({
        score: 0,
        summary: "No fue posible generar la evaluación automática: " + err.message,
        strengths: [],
        weaknesses: [err.message],
        checklist: {
          openingAndPresentation: false,
          attentionGrabbing: false,
          needsIdentification: false,
          activeListeningAndQuestions: false,
          proposalClarity: false,
          commercialValueArgumentation: false,
          objectionHandling: false,
          negotiationWithoutPressure: false,
          unexpectedOpportunities: false,
          closingAndNextStep: false
        },
        objectionsHandled: [],
        recommendations: ["Verifica tu conexión a internet e intenta repetir la llamada de práctica."]
      });
    } finally {
      setEvaluating(false);
    }
  };

  // 1. VISTA POST-LLAMADA: Scorecard o Loader
  if (showEvaluation) {
    if (evaluating) {
      return (
        <div className="flex-1 w-full p-6 flex items-center justify-center bg-[#F8F9FA]">
          <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-4 max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-display font-bold text-slate-900">
                Analizando tu conversación
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Evaluando desvío de recepcionista, control del diálogo con {contactName}, calificación de horómetro y manejo de objeciones.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return evaluation && (
      <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
        <Scorecard 
          evaluation={evaluation} 
          onReset={handleResetCall} 
          customTranscripts={transcripts} 
          audioId={currentCallId || undefined}
          conversationId={currentConversationId || undefined}
          scenarioTitle={activeScenario.title}
          difficulty={difficulty}
          durationSeconds={callDuration}
          industry={industry}
          recentHistory={recentHistory}
        />
      </div>
    );
  }

  // 2. VISTA DE LLAMADA ACTIVA
  if (isConnected || isConnecting || unexpectedDisconnect) {
    return (
      <ActiveCallView
        contactName={contactName}
        companyName={companyName}
        roleTitle={activeScenario.defaults[language].roleTitle}
        scenarioTitle={uiLang === 'en' && activeScenario.titleEn ? activeScenario.titleEn : activeScenario.title}
        objective={uiLang === 'en' && activeScenario.objectiveEn ? activeScenario.objectiveEn : activeScenario.objective}
        difficulty={difficulty}
        language={language}
        callDuration={callDuration}
        formatDuration={formatDuration}
        interestScore={interestScore}
        isConnected={isConnected}
        isConnecting={isConnecting}
        unexpectedDisconnect={unexpectedDisconnect}
        isSpeaking={conversation.isSpeaking}
        isListening={conversation.isListening}
        isMuted={conversation.isMuted}
        setMuted={(muted: boolean) => {
          try {
            if (isConnected && typeof conversation.setMuted === 'function') {
              conversation.setMuted(muted);
            }
          } catch (e) {
            console.error("Set mute error:", e);
          }
        }}
        onToggleMute={() => {
          try {
            if (isConnected && typeof conversation.setMuted === 'function') {
              conversation.setMuted(!conversation.isMuted);
            }
          } catch (e) {
            console.error("Toggle mute error:", e);
          }
        }}
        onEndCall={handleEndCall}
        onForceTurn={handleForceTurn}
        micVolume={micVolume}
        transcripts={transcripts}
        whisperAlert={whisperAlert}
        aiVolume={aiVolume}
        onVolumeChange={handleVolumeChange}
        sfxEnabled={sfxEnabled}
        onToggleSfx={() => {
          const next = !sfxEnabled;
          setSfxEnabled(next);
          sfx.enabled = next;
          if (!next) sfx.stopPhoneRinging();
        }}
      />
    );
  }

  // 3. VISTA DE PREPARACIÓN EN 3 PASOS (CallSetupWizard)
  return (
    <CallSetupWizard
      currentUser={currentUser}
      recentHistory={recentHistory}
      industry={industry}
      setIndustry={setIndustry}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      language={language}
      setLanguage={setLanguage}
      companyName={companyName}
      setCompanyName={setCompanyName}
      contactName={contactName}
      setContactName={setContactName}
      noiseSuppressionEnabled={noiseSuppressionEnabled}
      setNoiseSuppressionEnabled={setNoiseSuppressionEnabled}
      onStartCall={handleStartCall}
      isConnecting={isConnecting}
      connectionError={connectionError}
    />
  );
};

export default function LiveCall(props: LiveCallProps) {
  return (
    <ConversationProvider>
      <ElevenLabsCallView {...props} />
    </ConversationProvider>
  );
}
