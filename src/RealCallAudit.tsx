import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileAudio, Loader2, AlertCircle, FileCheck, ShieldCheck
} from 'lucide-react';
import Scorecard from './Scorecard';
import { saveAudio } from './audioDb';
import { useLanguage } from './i18n/LanguageContext';

export default function RealCallAudit({ 
  onEvaluationComplete, 
  onSaveToHistory 
}: { 
  onEvaluationComplete?: (score: number, evaluation: any, contact: string, company: string, opts?: { id?: string; hasAudio?: boolean; audioUrl?: string }) => void;
  onSaveToHistory?: (item: any) => void;
}) {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/') || droppedFile.name.endsWith('.mp3') || droppedFile.name.endsWith('.wav') || droppedFile.name.endsWith('.m4a')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError(language === 'en' 
          ? "Please select a valid audio file (.mp3, .wav or .m4a)." 
          : "Por favor selecciona un archivo de audio válido (.mp3, .wav o .m4a).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFile(null);
    setEvaluation(null);
    setError(null);
    setLoading(false);
    setCurrentId(null);
  };

  const handleAudit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setLoadingMessage(language === 'en' ? "Preparing audio file..." : "Preparando archivo de audio...");

    try {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const resultString = reader.result as string;
          const base64Data = resultString.split(',')[1];
          const mimeType = file.type || 'audio/mp3';

          setLoadingMessage(language === 'en' 
            ? "Transcribing and auditing with JYC Commercial Criteria..." 
            : "Transcribiendo y auditando llamada con Criterios Comerciales JYC...");

          const token = localStorage.getItem('jyc_token');
          const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) {
            authHeaders['Authorization'] = `Bearer ${token}`;
          }

          let response: Response;
          try {
            response = await fetch('/api/audit-audio', {
              method: 'POST',
              headers: authHeaders,
              credentials: 'same-origin',
              body: JSON.stringify({
                audioBase64: base64Data,
                mimeType: mimeType,
                fileName: file.name
              })
            });
          } catch (fetchErr: any) {
            console.warn("Direct fetch error:", fetchErr);
            throw new Error(language === 'en' 
              ? "Connection error to audit server. Please try again." 
              : "Error de conexión con el servidor de auditoría. Por favor intenta de nuevo.");
          }

          if (!response.ok) {
            let errorMsg = language === 'en' 
              ? 'Could not audit call audio.' 
              : 'No fue posible auditar el audio de la llamada.';
            try {
              const errData = await response.json();
              if (errData && errData.error) errorMsg = errData.error;
            } catch (e) {
              const textErr = await response.text().catch(() => "");
              if (textErr) errorMsg = textErr;
            }
            throw new Error(errorMsg);
          }

          const data = await response.json();
          let parsedData = data;

          if (typeof data.text === 'string') {
            try {
              let cleaned = data.text.trim();
              if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
              else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
              parsedData = JSON.parse(cleaned.trim());
            } catch {
              throw new Error(language === 'en' 
                ? 'Evaluation result format was invalid.' 
                : 'El formato de resultado de evaluación no fue válido.');
            }
          }

          if (!parsedData || typeof parsedData.score === 'undefined') {
            throw new Error(data.error || (language === 'en' ? 'Could not audit call audio.' : 'No fue posible auditar el audio de la llamada.'));
          }

          let serverAudioUrl: string | undefined = undefined;
          if (data.audioUrl) {
            serverAudioUrl = data.audioUrl;
          } else if (data.audioId) {
            serverAudioUrl = `/api/audios/${data.audioId}`;
          }

          try {
            if (data.audioId) {
              await saveAudio(data.audioId, file);
            }
          } catch (dbErr) {
            console.warn("IndexedDB storage note:", dbErr);
          }

          const auditId = Date.now().toString() + Math.random().toString().substring(2, 6);
          setCurrentId(auditId);

          if (onSaveToHistory) {
            onSaveToHistory({
              id: auditId,
              date: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES'),
              score: parsedData.score,
              type: 'Real Call Audit',
              companyName: parsedData.companyName || (language === 'en' ? 'Client Company' : 'Empresa Cliente'),
              contactName: parsedData.contactName || (language === 'en' ? 'Decision Maker' : 'Tomador de decisión'),
              evaluation: parsedData,
              hasAudio: true,
              audioUrl: serverAudioUrl
            });
          }

          setEvaluation(parsedData);
          onEvaluationComplete?.(
            parsedData.score, 
            parsedData, 
            parsedData.contactName || (language === 'en' ? "Unidentified" : "No identificado"), 
            parsedData.companyName || (language === 'en' ? "Client Company" : "Empresa Cliente"), 
            { id: auditId, hasAudio: true, audioUrl: serverAudioUrl }
          );
          setLoading(false);

        } catch (err: any) {
          console.error("Audit error:", err);
          setError(err.message || (language === 'en' 
            ? "Could not process audio. Please try again." 
            : "No fue posible procesar el audio. Por favor intenta de nuevo."));
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError(language === 'en' ? "Error reading audio file." : "Error al leer el archivo de audio.");
        setLoading(false);
      };

      reader.readAsDataURL(file);

    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === 'en' ? "An unexpected error occurred." : "Ocurrió un error inesperado."));
      setLoading(false);
    }
  };

  if (evaluation) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
        <Scorecard 
          evaluation={evaluation} 
          onReset={handleReset} 
          audioBlob={file}
          audioId={currentId || undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 bg-[#F8F9FA] overflow-y-auto text-left">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* Encabezado */}
        <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center shrink-0 border border-amber-200">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
              {language === 'en' ? 'Audit Real Call Recording' : 'Auditar Grabación de Llamada Real'}
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              {language === 'en'
                ? 'Upload a real phone call recording with a US or Latin American prospect to audit gatekeeper bypass, qualification questions, and objection handling.'
                : 'Sube la grabación de una llamada telefónica real con un cliente de EE.UU. o Latinoamérica para auditar desvío de recepcionista, preguntas de calificación y manejo de objeciones.'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h2 className="text-base font-display font-bold text-slate-900">{loadingMessage}</h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                {language === 'en' 
                  ? 'This may take a few seconds depending on audio length.' 
                  : 'Esto puede tomar unos segundos según la duración del audio.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Zona Dropzone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerUploadClick}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                dragActive 
                  ? 'border-amber-500 bg-amber-50/40' 
                  : file 
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="audio/*"
                onChange={handleFileChange}
              />
              
              <div className={`p-3.5 rounded-xl ${
                file ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-200 text-slate-500'
              }`}>
                {file ? <FileCheck className="w-6 h-6" /> : <FileAudio className="w-6 h-6" />}
              </div>
              
              {file ? (
                <div className="text-center space-y-1">
                  <p className="font-bold text-slate-900 text-sm">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · {language === 'en' ? 'Click to select another file' : 'Clic para seleccionar otro archivo'}
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="font-bold text-slate-800 text-sm">
                    {language === 'en' 
                      ? 'Drag your audio file here, or click to browse' 
                      : 'Arrastra aquí tu archivo de audio, o haz clic para buscarlo'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {language === 'en'
                      ? 'Supported formats: .mp3, .wav, .m4a (up to 25 MB)'
                      : 'Formatos soportados: .mp3, .wav, .m4a (hasta 25 MB)'}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAudit}
              disabled={!file}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{language === 'en' ? 'Analyze & Audit Call' : 'Analizar y Auditar Llamada'}</span>
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>
                {language === 'en'
                  ? 'Audited against JYC Equipment\'s 10 commercial criteria'
                  : 'Auditoría con los 10 criterios comerciales de JYC Equipment'}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
