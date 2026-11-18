import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  authenticate,
  getHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearHistory,
  getRegisteredTrainees,
  saveAudioFile,
  getAudioFile,
  initDatabase,
  getDatabaseStatus,
  updateUserPassword,
  getAllUsers,
  createUser,
  deleteUser,
  getAllUsersWithStats,
  toggleUserBlock
} from "./server/db";

dotenv.config();

// Session secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function getElevenLabsApiKey(): string | undefined {
  if (process.env.ELEVENLABS_API_KEY?.trim()) return process.env.ELEVENLABS_API_KEY.trim();
  for (const [k, v] of Object.entries(process.env)) {
    const norm = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if ((norm === 'ELEVENLABSAPIKEY' || norm === 'ELEVENLABSKEY' || norm === 'ELEVENLABS') && v && v.trim()) {
      return v.trim();
    }
  }
  return undefined;
}

function getElevenLabsAgentId(): string {
  if (process.env.ELEVENLABS_AGENT_ID?.trim()) return process.env.ELEVENLABS_AGENT_ID.trim();
  for (const [k, v] of Object.entries(process.env)) {
    const norm = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if ((norm === 'ELEVENLABSAGENTID' || norm === 'ELEVENLABSAGENT') && v && v.trim()) {
      return v.trim();
    }
  }
  return "agent_8601m7r2anere3ma4t5804vgc8zm";
}

// Light in-memory Rate Limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

function createRateLimiter(options: { windowMs: number; maxRequests: number; message: string }) {
  const hits = new Map<string, RateLimitRecord>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = (req as any).user?.id || req.ip || 'anonymous';
    const record = hits.get(key);

    if (!record || now > record.resetAt) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (record.count >= options.maxRequests) {
      return res.status(429).json({ error: options.message });
    }

    record.count++;
    next();
  };
}

// Supported audio MIME types and size limit validation
const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/aac',
  'audio/webm',
  'audio/ogg'
];
const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15 MB

function validateAudioPayload(base64Data: string, mimeType: string): { valid: boolean; error?: string } {
  if (!mimeType || !ALLOWED_AUDIO_MIMES.includes(mimeType.toLowerCase())) {
    return { 
      valid: false, 
      error: `Formato de audio '${mimeType}' no soportado. Formatos válidos: .mp3, .wav, .m4a, .webm.` 
    };
  }

  // Rough calculation of byte size from base64 string length
  const approxBytes = Math.ceil((base64Data.length * 3) / 4);
  if (approxBytes > MAX_AUDIO_BYTES) {
    return { 
      valid: false, 
      error: `El archivo de audio excede el límite permitido de 15 MB (tamaño aproximado: ${(approxBytes / (1024 * 1024)).toFixed(1)} MB).` 
    };
  }

  return { valid: true };
}

// Auth Token Helpers
interface TokenPayload {
  id: string;
  username: string;
  name: string;
  role: 'trainee' | 'admin';
}

function generateToken(user: TokenPayload): string {
  return jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function extractToken(req: Request): string | null {
  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.jyc_session) {
    return req.cookies.jyc_session;
  }
  // 2. Check Authorization Header Bearer
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

// Middleware: Require Valid Authenticated Session
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Sesión no autenticada. Por favor inicia sesión." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesión inválida o expirada. Vuelve a iniciar sesión." });
  }
}

// Middleware: Optional Authenticated Session (permits guest simulator sessions)
function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      (req as any).user = decoded;
    } catch {}
  }
  next();
}

// Middleware: Require Admin Role
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user as TokenPayload;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: "Acceso denegado. Se requieren permisos de administrador." });
    }
    next();
  });
}

async function startServer() {
  await initDatabase();
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Reduced request body limit from 50 MB to 15 MB
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));
  app.use(cookieParser());

  // Rate limiters
  const chatLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: "Has superado el límite de 30 consultas por minuto con el coach. Espera un momento."
  });

  const auditLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: "Has superado el límite de auditorías de audio por minuto. Espera un momento antes de subir otro archivo."
  });

  const signedUrlLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 120, // Amplio margen para pruebas y reinicios frecuentes de llamadas en entrenamiento
    message: "Demasiadas llamadas iniciadas en poco tiempo. Espera 60 segundos antes de comenzar otra llamada."
  });

  // ==========================================
  // Public Status Endpoint
  // ==========================================
  app.get("/api/status", async (req, res) => {
    try {
      const dbStatus = await getDatabaseStatus();
      const apiKey = getElevenLabsApiKey();
      const detectedEnvKeys = Object.keys(process.env)
        .map(k => k.trim())
        .filter(k => {
          const upper = k.toUpperCase();
          return upper.includes('ELEVEN') || upper.includes('GEMINI') || upper.includes('DATABASE') || upper.includes('NODE_ENV');
        });

      res.json({
        status: "ok",
        service: "JYC Equipment Sales Trainer",
        timestamp: new Date().toISOString(),
        database: dbStatus,
        elevenlabs: {
          keyConfigured: Boolean(apiKey),
          agentId: getElevenLabsAgentId()
        },
        detectedEnvKeys
      });
    } catch (err: any) {
      res.status(500).json({ status: "error", error: err.message });
    }
  });

  // ==========================================
  // Authentication & Session Endpoints
  // ==========================================
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, customName } = req.body;
      if (!username || !password || !password.trim()) {
        return res.status(400).json({ error: "El usuario y la contraseña son obligatorios." });
      }

      const user = await authenticate(username, password, customName);
      if (!user) {
        return res.status(401).json({ error: "Credenciales incorrectas. Verifica tu usuario y contraseña." });
      }

      if (user.blocked) {
        return res.status(403).json({ error: "Tu cuenta ha sido suspendida por el Administrador. Contacta a supervisión." });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });

      // Set secure HTTP-only cookie
      res.cookie('jyc_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Return user info WITHOUT password, plus bearer token for client flexibility
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        },
        token
      });
    } catch (error: any) {
      console.error("Error authenticating user:", error);
      res.status(500).json({ error: "Error interno del servidor durante la autenticación." });
    }
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    res.json({ success: true, user: (req as any).user });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('jyc_session', { path: '/' });
    res.json({ success: true, message: "Sesión cerrada correctamente." });
  });

  // ==========================================
  // AI Coach Chat (Rate Limit + Optional Auth for Practice & Evaluation)
  // ==========================================
  app.post("/api/chat", optionalAuth, chatLimiter, async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "GEMINI_API_KEY no está configurada en el servidor." });
      }
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const contents = (messages || []).map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const isJson = Boolean(
        req.body.responseFormat === 'json' ||
        (systemInstruction && systemInstruction.toLowerCase().includes('json'))
      );

      const fallbackModels = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];
      let response;
      let lastError;

      for (const modelName of fallbackModels) {
        try {
          const config: any = {
            systemInstruction: systemInstruction,
            temperature: isJson ? 0.1 : 0.2,
          };
          if (isJson) {
            config.responseMimeType = "application/json";
          }

          response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: config
          });
          if (response && response.text) {
            break;
          }
        } catch (error: any) {
          console.warn(`Model ${modelName} chat attempt failed:`, error.message);
          lastError = error;
          await new Promise(r => setTimeout(r, 800));
        }
      }

      if (!response) {
        throw lastError || new Error("No fue posible obtener respuesta del coach.");
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error from Gemini API:", error);
      res.status(500).json({ error: error.message || "Error al generar respuesta." });
    }
  });

  // ==========================================
  // Protected Call Audit (Requires Auth + Rate Limit + Audio Validation)
  // ==========================================
  app.post("/api/audit-audio", requireAuth, auditLimiter, async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;

      if (!audioBase64 || !mimeType) {
        return res.status(400).json({ error: "Faltan los datos de audio o el tipo de archivo." });
      }

      const validation = validateAudioPayload(audioBase64, mimeType);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY no está configurada en el servidor." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const contents = [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBase64
              }
            },
            {
              text: `Por favor escucha y evalúa esta grabación de llamada comercial para JYC Equipment / JYC Medical.
El vendedor (Trainee) habla con un tomador de decisiones industrial (Prospect) sobre compra/venta de maquinaria pesada o sistemas médicos.

Transcribe el diálogo identificando quién habla y evalúa estrictamente los 10 criterios comerciales de JYC con retroalimentación constructiva y ejemplos de la llamada.
Devuelve ÚNICAMENTE un objeto JSON válido con este esquema:
{
  "score": number, // 0 a 100
  "contactName": "Nombre del contacto",
  "companyName": "Nombre de la empresa",
  "summary": "Resumen ejecutivo en español citando ejemplos...",
  "strengths": ["Fortaleza 1 en español con ejemplo", "Fortaleza 2 en español con ejemplo"],
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
    { "objection": "Nombre de objeción", "handledWell": boolean, "feedback": "Retroalimentación táctica" }
  ],
  "recommendations": ["Recomendación 1", "Recomendación 2"],
  "transcript": [
    { "role": "user", "text": "Línea del vendedor..." },
    { "role": "prospect", "text": "Línea del cliente..." }
  ]
}`
            }
          ]
        }
      ];

      const fallbackModels = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];
      let response;
      let lastError;

      for (const modelName of fallbackModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: "Eres un auditor comercial de élite de maquinaria pesada. Devuelve ÚNICAMENTE un JSON válido sin bloques markdown ni texto extra.",
              temperature: 0.1,
              responseMimeType: "application/json"
            }
          });
          if (response && response.text) {
            break;
          }
        } catch (error: any) {
          console.warn(`Model ${modelName} audio audit attempt failed:`, error.message);
          lastError = error;
          await new Promise(r => setTimeout(r, 800));
        }
      }

      if (!response) {
        throw lastError || new Error("No fue posible auditar el audio.");
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error auditing call audio:", error);
      res.status(500).json({ error: error.message || "Error al auditar la llamada." });
    }
  });

  // ==========================================
  // ElevenLabs Signed URL (Rate Limit + Optional Auth for Voice Practice)
  // ==========================================
  app.get("/api/elevenlabs/signed-url", optionalAuth, signedUrlLimiter, async (req, res) => {
    try {
      const apiKey = getElevenLabsApiKey();
      if (!apiKey) {
        return res.status(500).json({ error: "ELEVENLABS_API_KEY no está configurada en el servidor." });
      }
      const agentId = getElevenLabsAgentId();
      const branchId = (req.query.branchId as string) || process.env.ELEVENLABS_BRANCH_ID || undefined;

      const urlParams = new URLSearchParams({ agent_id: agentId });
      if (branchId) {
        urlParams.set("branch_id", branchId);
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?${urlParams.toString()}`, {
        headers: {
          "xi-api-key": apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API error:", response.status, errorText);
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json();
      
      // Maximum call session duration enforced: 10 minutes (600 seconds)
      res.json({ 
        signedUrl: data.signed_url, 
        agentId, 
        branchId,
        maxDurationSeconds: 600 
      });
    } catch (error: any) {
      console.error("Error generating ElevenLabs signed URL:", error);
      res.status(500).json({ error: error.message || "Error al generar la URL firmada de voz." });
    }
  });

  let cachedCredits: { data: any; timestamp: number } | null = null;
  const CREDITS_CACHE_TTL_MS = 60 * 1000;

  app.get("/api/elevenlabs/credits", optionalAuth, async (req, res) => {
    try {
      if (cachedCredits && (Date.now() - cachedCredits.timestamp < CREDITS_CACHE_TTL_MS)) {
        return res.json(cachedCredits.data);
      }

      const apiKey = getElevenLabsApiKey();
      if (!apiKey) {
        return res.status(500).json({ error: "ELEVENLABS_API_KEY no está configurada." });
      }
      const response = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
        headers: {
          "xi-api-key": apiKey
        }
      });

      if (!response.ok) {
        if (cachedCredits) {
          return res.json(cachedCredits.data);
        }
        const errorText = await response.text();
        return res.status(response.status).json({ error: errorText });
      }

      const data = await response.json();
      const used = Number(data.character_count || 0);
      const limit = Number(data.character_limit || 0);
      const remaining = Math.max(0, limit - used);
      const percentUsed = limit > 0 ? Math.min(100, Math.round((used / limit) * 1000) / 10) : 0;
      const percentRemaining = limit > 0 ? Math.max(0, Math.round((remaining / limit) * 1000) / 10) : 0;

      const result = {
        tier: data.tier || "standard",
        status: data.status || "active",
        used,
        limit,
        remaining,
        percentUsed,
        percentRemaining,
        nextResetUnix: data.next_character_count_reset_unix || null
      };
      cachedCredits = { data: result, timestamp: Date.now() };
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching ElevenLabs credits:", error);
      res.status(500).json({ error: error.message || "Error al consultar créditos de ElevenLabs." });
    }
  });

  app.get("/api/elevenlabs/conversation-audio/:conversationId", requireAuth, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const apiKey = getElevenLabsApiKey();
      if (!apiKey) {
        return res.status(500).json({ error: "ELEVENLABS_API_KEY no está configurada." });
      }

      let retries = 4;
      let lastResponse;

      while (retries > 0) {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`, {
          headers: {
            "xi-api-key": apiKey,
            "Accept": "audio/mpeg"
          }
        });

        if (response.ok) {
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Content-Disposition", `attachment; filename="call_recording_${conversationId}.mp3"`);
          const arrayBuffer = await response.arrayBuffer();
          return res.send(Buffer.from(arrayBuffer));
        }

        lastResponse = response;
        retries--;
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }

      const errorText = await lastResponse?.text();
      return res.status(lastResponse?.status || 500).json({ error: errorText || "No fue posible obtener el audio de la llamada." });
    } catch (error: any) {
      console.error("Error fetching conversation audio:", error);
      res.status(500).json({ error: error.message || "Error al descargar el audio." });
    }
  });

  // ==========================================
  // Protected User Management (Admin Only - Validated on Server)
  // ==========================================
  app.get("/api/users/list", requireAdmin, async (req, res) => {
    try {
      const users = await getAllUsersWithStats();
      res.json({ users });
    } catch (error: any) {
      console.error("Error fetching user list:", error);
      res.status(500).json({ error: "Error al cargar la lista de vendedores." });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { username, password, name } = req.body;
      const result = await createUser(username, password, name);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, user: result.user });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Error interno al crear usuario." });
    }
  });

  app.delete("/api/admin/users/:username", requireAdmin, async (req, res) => {
    try {
      const { username } = req.params;
      const result = await deleteUser(username);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, message: `Usuario '${username}' eliminado correctamente.` });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Error interno al eliminar usuario." });
    }
  });

  app.put("/api/admin/users/:userId/password", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      if (!newPassword || !newPassword.trim()) {
        return res.status(400).json({ error: "La nueva contraseña es requerida." });
      }

      const updated = await updateUserPassword(userId, newPassword);
      if (!updated) {
        return res.status(404).json({ error: `Usuario no encontrado.` });
      }

      res.json({ success: true, message: "Contraseña actualizada exitosamente con cifrado seguro." });
    } catch (error: any) {
      console.error("Error updating user password:", error);
      res.status(500).json({ error: "Error interno al actualizar la contraseña." });
    }
  });

  app.put("/api/admin/users/:userId/block", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await toggleUserBlock(userId);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, blocked: result.blocked });
    } catch (error: any) {
      console.error("Error toggling user block:", error);
      res.status(500).json({ error: "Error interno al cambiar estado de acceso." });
    }
  });

  // ==========================================
  // Protected / Optional History & Evaluation Endpoints (Permite visualización fluida de datos Neon)
  // ==========================================
  app.get("/api/history", optionalAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user as TokenPayload | undefined;
      let filter: { role?: string; userId?: string; userName?: string } = {};

      if (!currentUser || currentUser.role === 'admin') {
        // Admin o vista general: puede ver todo o filtrar
        const { role, userId, userName } = req.query;
        filter = {
          role: role as string,
          userId: userId as string,
          userName: userName as string
        };
      } else {
        // Trainees autenticados ven su propio historial
        filter = {
          role: 'trainee',
          userId: currentUser.id,
          userName: currentUser.name
        };
      }

      const history = await getHistory(filter);
      res.json({ history });
    } catch (error: any) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Error al cargar historial de llamadas." });
    }
  });

  app.post("/api/history", requireAuth, async (req, res) => {
    try {
      const item = req.body;
      const currentUser = (req as any).user as TokenPayload;

      if (!item || item.score === undefined) {
        return res.status(400).json({ error: "Datos de evaluación inválidos." });
      }

      // Enforce author identity from server session token (never trust client)
      const secureItem = {
        ...item,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role
      };

      const saved = await saveHistoryItem(secureItem);
      res.json({ success: true, item: saved });
    } catch (error: any) {
      console.error("Error saving history item:", error);
      res.status(500).json({ error: "Error al guardar registro en la base de datos." });
    }
  });

  app.delete("/api/history/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user as TokenPayload;

      // Only admins or the owner can delete a call record
      const historyList = await getHistory();
      const existing = historyList.find(h => h.id === id);
      if (existing && currentUser.role !== 'admin' && existing.userId !== currentUser.id) {
        return res.status(403).json({ error: "No tienes permiso para eliminar este registro." });
      }

      const deleted = await deleteHistoryItem(id);
      res.json({ success: deleted });
    } catch (error: any) {
      console.error("Error deleting history item:", error);
      res.status(500).json({ error: "Error al eliminar registro." });
    }
  });

  app.post("/api/history/clear", requireAuth, async (req, res) => {
    try {
      const currentUser = (req as any).user as TokenPayload;

      if (currentUser.role === 'admin') {
        const { userId } = req.body;
        await clearHistory(userId ? { userId } : undefined);
      } else {
        // Trainee can only clear their own history
        await clearHistory({ userId: currentUser.id });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error clearing history:", error);
      res.status(500).json({ error: "Error al limpiar historial." });
    }
  });

  app.get("/api/trainees", optionalAuth, async (req, res) => {
    try {
      const trainees = await getRegisteredTrainees();
      res.json({ trainees });
    } catch (error: any) {
      console.error("Error fetching trainees:", error);
      res.status(500).json({ error: "Error al consultar lista de practicantes." });
    }
  });

  // ==========================================
  // Protected Audio Persistence API
  // ==========================================
  app.post("/api/audios/upload", requireAuth, async (req, res) => {
    try {
      const { id, audioBase64, mimeType } = req.body;
      if (!id || !audioBase64) {
        return res.status(400).json({ error: "Faltan los datos o ID de audio." });
      }

      const validation = validateAudioPayload(audioBase64, mimeType || 'audio/mpeg');
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const audioUrl = await saveAudioFile(id, audioBase64, mimeType || 'audio/mpeg');
      res.json({ success: true, audioUrl });
    } catch (error: any) {
      console.error("Error saving audio file:", error);
      res.status(500).json({ error: "Error al guardar archivo de audio." });
    }
  });

  app.get("/api/audios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const audio = await getAudioFile(id);
      if (!audio) {
        return res.status(404).json({ error: "Archivo de audio no encontrado." });
      }

      const ext = audio.mimeType?.includes("wav") ? "wav" : audio.mimeType?.includes("webm") ? "webm" : "mp3";
      res.setHeader("Content-Type", audio.mimeType || "audio/mpeg");
      res.setHeader("Content-Length", audio.buffer.length);
      res.setHeader("Content-Disposition", `attachment; filename="call_recording_${id}.${ext}"`);
      res.send(audio.buffer);
    } catch (error: any) {
      console.error("Error retrieving audio file:", error);
      res.status(500).json({ error: "Error al reproducir archivo de audio." });
    }
  });

  // Vite development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running securely on http://localhost:${PORT}`);
  });
}

startServer();
