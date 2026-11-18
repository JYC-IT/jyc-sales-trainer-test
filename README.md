<div align="center">

# 🏗️ JYC Equipment AI Sales Trainer

**Enterprise-Grade Real-Time AI Simulation & Call Coaching Platform for Heavy Machinery & Medical Equipment Sales Teams**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Conversational_Voice-FF6B00?style=flat-square)](https://elevenlabs.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%2F_Cloud_Sync-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Deployment](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com/)

[Overview](#-overview) • [Core Features](#-core-features) • [Industrial Verticals](#-industrial-verticals) • [Architecture](#-repository-architecture) • [Getting Started](#-getting-started) • [Deployment](#-deployment)

---

</div>

## 📌 Overview

**JYC Equipment AI Sales Trainer** is a mission-critical simulation and coaching platform built specifically for industrial sales representatives (SDRs, AEs, and Acquisition Specialists). It provides high-fidelity, real-time voice call roleplaying against authentic industrial prospect personas, accompanied by instant multimodal AI call auditing, dynamic difficulty scaling, and executive performance scorecards.

Trained on real commercial sales playbooks, objection matrices, and gatekeeper deflection protocols, the platform empowers reps to master both **Surplus Equipment Acquisitions** (purchasing idle machinery) and **JYC Fleet Sourcing** (selling verified ready-to-work units).

---

## ⚡ Core Features

### 🎙️ 1. Ultra-Low-Latency Conversational Voice Simulation
* Direct **ElevenLabs Conversational AI WebSocket** integration with sub-second voice response times.
* Bidirectional audio streaming with dynamic conversational interruption, allowing natural over-the-phone cadence.
* Real-time automated WebSocket keep-alive pings preventing connection dropouts during silent pauses.
* Live Web Audio API spectrogram visualizer with interactive status indicators.

### 🎯 2. Dual Commercial Modes
* **Surplus Equipment Acquisition (Buying Mode):** Reps deflect blind telephone ballparks, position JYC’s 100% turnkey de-installation/rigging and nationwide freight coverage, and secure data plate and hour meter photos for formal 24-hour wire purchase agreements.
* **JYC Fleet Sourcing (Selling Mode):** Reps qualify client operational demands, match certified equipment from JYC’s active inventory, and present financing and logistics packages.

### 🎮 3. Adaptive Duolingo-Style Gamification & Level Paths
* **4-Stage Industry Pathways:** Every sector features a progression path:
  1. *Nivel 1 (Fácil):* Receptive plant owner with surplus machinery.
  2. *Nivel 2 (Medio):* Strict receptionist or gatekeeper filtering calls.
  3. *Nivel 3 (Difícil):* Hurried buyer demanding immediate telephone pricing.
  4. *Nivel 4 (Jefe Final):* Skeptical director with locked competitor contracts and broker mistrust.
* **Unlocking Threshold:** Score ≥ 70 unlocks the next level. Zero practice blocking: reps have unlimited practice attempts with no artificial "lives".
* **Daily Goal & Streak Freeze:** 1 daily call of at least 3 minutes keeps the real practice streak alive; includes 1 automated weekly freeze shield for weekends/emergencies.
* **Quality-First XP Engine:** High scores earn greater XP (≥90: +150 XP, 70-89: +80 XP, <70: +30 XP, <45s: 0 XP to prevent spam).
* **Weekly Team Leaderboard & Divisions:** Reps compete in weekly tiers (Liga Bronce, Liga Plata, Liga Oro) with an executive podium (🥇 Oro, 🥈 Plata, 🥉 Bronce).
* **Commercial Certificaciones JYC:** Reps earn Level 1 (Basic Qualification), Level 2 (Machinery Negotiator), and Level 3 (Master Closer) badges as they conquer sectors.

### ⚡ 4. Deterministic Code Analytics & Fast Gemini Flash Rubrics
* **Pure Algorithmic Metrics (Zero Token Cost):**
  - *Talk/Listen Ratio:* Exact speaking percentages between rep and prospect (Target: 40-50% rep / 50-60% buyer).
  - *Speaking Pacing (WPM):* Words per minute cadence analysis (optimal: 130-165 WPM).
  - *Filler Word Detector:* Automatic scanning of common verbal crutches (*"ehh"*, *"este"*, *"o sea"*, *"you know"*, *"like"*).
  - *Turn & Interruption Counter:* Detection of rushed speaker overlaps.
* **Guaranteed JSON Rubric via Gemini Flash:** Fast multimodal evaluation using `responseMimeType: "application/json"` with fixed heavy equipment appraisal rubrics.
* **Abstract `IVoiceProvider` Architecture:** Speech synthesis is decoupled through an extensible interface, allowing seamless switching between ElevenLabs Conversational AI, local mock environments, and future WebRTC backends.

### 🔒 5. Enterprise Security & Session Management
* **Bcrypt Password Security:** Automatic cryptographic hashing with seamless migration for legacy plain text users. Passwords are never returned in API payloads.
* **Hardened JWT Sessions:** Secure token and HTTP-only cookie authentication (`jyc_session`) with server-side role validation.
* **Endpoint Protection:** Rate limiting on `/api/chat` (30/min), `/api/audit-audio` (10/min), and `/api/elevenlabs/signed-url` (15/min), with a 10-minute maximum call safety limit and 15 MB audio payload validation.

### 📊 5. Instant AI Call Auditing & Executive PDF Scorecards
* **Multimodal Audio Evaluation:** Upload live call recordings (`.mp3`, `.wav`, `.m4a`) or evaluate completed voice simulations using **Google Gemini 2.5 Flash**.
* **10 Objective Evaluation Criteria:**
  1. Opening & Professional Introduction
  2. Needs Discovery & Equipment Qualification
  3. Deflection of Blind Phone Ballparks
  4. Turnkey Commercial Differentiators (0% Auction Fees, Wire Payment, Rigging)
  5. Objection Handling & De-escalation
  6. Closing & Concrete Next Steps (Photo/Hour Meter Commitment)
  7. Tone, Cadence & Executive Presence
  8. Listening vs. Speaking Ratio
  9. Procedural Script Adherence
  10. Follow-up Timeline & CRM Data Completeness
* **Actionable Coaching Feedback:** Exact timestamps of strengths, critical mistakes, and executive summary recommendations, exportable to printable PDF scorecards.

### 🗄️ 6. Cloud Persistence & Local Fallback
* Dual-mode data persistence adapter supporting **PostgreSQL** (Render PostgreSQL, Supabase, Neon) with automated schema migrations.
* Seamless automatic fallback to local atomic JSON storage (`data/database.json`) when operating in offline or isolated environments.

---

## 🏭 Industrial Verticals

The simulation engine models authentic equipment terminology, operational bottlenecks, and financial stakes across 7 industrial sectors:

| Sector | Primary Equipment Focus | Typical Objections & Challenges |
| :--- | :--- | :--- |
| **🚢 Ports, Maritime & Stevedoring** | Reach stackers, empty container handlers, port cranes, terminal tractors | Strict port authority safety certifications, heavy wear/salt corrosion, union labor de-rigging rules. |
| **🏥 Medical Diagnostic Imaging** | MRI scanners, CT systems, C-Arms, Cath Labs, Ultrasound | Rigorous de-installation liability, OEM service contracts, trade-in pressures from hospital networks. |
| **🧪 Plastics & Polymers** | Injection molders (Toshiba, Nissei, Engel), extruders, chillers, granulators | *Strict Rule:* Zero trade-in on Matrix units. Facility footprint pressure, hydraulic vs. electric machine values. |
| **🏗️ Concrete, Cement & Quarries** | Batch plants, mixers, pugmills, heavy dumpers, silos | Remote job site access, environmental permits, concrete build-up wear condition assessments. |
| **⛏️ Sand, Gravel & Aggregate** | Crushing plants, screening equipment, wash plants, conveyors | Equipment obsolescence, heavy mechanical wear, appraisal difficulty without physical run tests. |
| **🌲 Forestry, Lumber & Sawmills** | Log loaders, feller bunchers, debarkers, chippers | Extreme operating hours, remote timber terrain logistics, seasonal cash flow cycles. |
| **⚙️ Steel Fabrication & Metalworking** | CNC machine centers, press brakes, shears, laser/plasma cutters | High precision tolerance checks, tooling inclusion negotiations, rigging heavy stamping presses. |

---

## 📂 Repository Architecture

```text
jyc-equipment-ai-sales-trainer/
├── .agents/                      # Agent system skills & visual styling rules
│   └── skills/frontend-design/   # Anthropic frontend design system principles
├── data/                         # Local database storage & call recordings
│   ├── audios/                   # Uploaded audio recordings for AI call auditing
│   └── database.json             # Local JSON fallback store (users, sessions, reviews)
├── docs/                         # Architecture, UI specs & training resources
│   ├── DESIGN.md                 # Design system tokens, color palettes & typography specs
│   └── training-materials/       # Original industrial training manuals & reference scripts
│       ├── README.md             # Materials index and industrial scope catalog
│       ├── Medical Script.pdf    # Healthcare imaging diagnostic sales script
│       ├── Plastic Script.pdf    # Plastics & polymer injection molding script
│       ├── PORTS INDUSTRY Script .pdf # Maritime & port machinery script
│       ├── Multi Industry Script - Material.pdf # Cross-sector heavy equipment script
│       ├── brochure de metal.pdf # Metalworking & CNC machinery catalog
│       └── jyc_training_knowledge_base.txt # Raw verbatim objection handling knowledge base
├── server/                       # Backend database adapters & migration utilities
│   ├── db.ts                     # Unified persistence router (Postgres with JSON fallback)
│   ├── postgresAdapter.ts        # Direct PostgreSQL driver integration & connection pool
│   └── postgresMigration.ts      # Automated relational schema bootstrap & migrations
├── src/                          # Frontend Application (React 19 + TypeScript)
│   ├── components/               # Componentes modulares y reutilizables
│   │   ├── ActiveCallView.tsx    # Vista limpia de llamada en vivo con panel lateral de playbook
│   │   ├── AnimatedProspectCharacter.tsx # Mascota animada del comprador simulado
│   │   ├── CallSetupWizard.tsx   # Asistente de preparación en 3 pasos (Industria, Dificultad, Resumen)
│   │   ├── Header.tsx            # Barra superior con estado de red, usuario y selector rápido
│   │   ├── Sidebar.tsx           # Menú lateral con orden unificado y roles (Admin protegido)
│   │   └── SiriWaveVisualizer.tsx # Animación visual estilo Siri durante el diálogo por voz
│   ├── data/                     # Fuente única de verdad para guiones y escenarios
│   │   ├── playbookContent.ts    # Guiones textuales (apertura, calificación, objeciones y venta)
│   │   └── scenarios.ts          # Configuración de los 7 sectores industriales y personajes
│   ├── pages/                    # Vistas principales de la aplicación
│   │   ├── AdminBossView.tsx     # Vista ejecutiva para el jefe (<30s lectura, ranking, debilidad del equipo)
│   │   ├── CoachView.tsx         # Entrenador interactivo IA con chat táctico y playbook integrado
│   │   └── HomeView.tsx          # Pantalla de inicio (próxima práctica sugerida, último score, progreso semanal)
│   ├── services/                 # Servicios de comunicación con el backend
│   │   └── api.ts                # API client (autenticación, chat, auditoría, historial y usuarios)
│   ├── utils/                    # Utilidades analíticas y efectos de sonido
│   │   ├── audioEffects.ts       # Motor de efectos telefónicos (timbre, descolgado, chimes)
│   │   └── userStats.ts          # Cálculo de racha real, métricas semanales y escenario sugerido
│   ├── AdminUserManager.tsx     # Modal de administración de usuarios y cambio de contraseñas
│   ├── App.tsx                   # Enrutador principal por hash (#inicio, #practicar, #mis-llamadas, etc.)
│   ├── AudioPlayer.tsx           # Reproductor interactivo de grabaciones de llamadas
│   ├── HistoryDashboard.tsx      # Historial de llamadas, análisis de progresión y scorecards
│   ├── instructions.ts           # Prompts del sistema para Gemini y ElevenLabs
│   ├── LiveCall.tsx              # Orquestador de llamada en vivo por WebRTC con ElevenLabs
│   ├── LoginModal.tsx            # Modal de inicio de sesión con roles (vendedor / administrador)
│   ├── Playbook.tsx              # Vista completa de la biblioteca de ventas
│   ├── RealCallAudit.tsx         # Auditoría de archivos de audio reales con IA
│   ├── Scorecard.tsx             # Evaluación post-llamada con nota global, punto crítico y acordeón
│   └── types.ts                  # Definiciones de tipos TypeScript
├── .env.example                  # Environment variable template with documentation
├── .gitignore                    # Git tracking exemptions (logs, node_modules, .env)
├── index.html                    # Application entry point & Google Fonts configuration
├── metadata.json                 # AI Studio & extension capability descriptors
├── package.json                  # NPM dependencies, metadata & build scripts
├── server.ts                     # Production Express server, Gemini API proxy & WebSocket signers
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite bundler configuration & React compiler plugins
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: Version `18.0.0` or higher
* **NPM**: Version `9.0.0` or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/nicotitopp/jyc-equipment-ai-sales-trainer.git
cd jyc-equipment-ai-sales-trainer
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:
```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:
```env
# Required for AI Call Auditing & Coaching Feedback
GEMINI_API_KEY="your_google_gemini_api_key"

# Required for Real-Time Conversational Voice Simulation
ELEVENLABS_API_KEY="your_elevenlabs_api_key"
ELEVENLABS_AGENT_ID="your_elevenlabs_agent_id"

# Optional: Cloud PostgreSQL persistence (Supabase, Neon, Render)
# If left empty, system automatically uses local data/database.json
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Application host URL (defaults to localhost:3000 in dev)
APP_URL="http://localhost:3000"
```

### 3. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000` with hot-module reloading enabled for both the Vite client and Express API proxy.

### 4. Build for Production
```bash
npm run build
npm start
```
This builds the client assets with Vite into `dist/` and bundles `server.ts` into an optimized Node.js bundle via `esbuild`.

---

## 🌐 Deployment

### Render Deployment Configuration

This repository is optimized for zero-config deployment on **[Render.com](https://render.com/)**:

| Setting | Value |
| :--- | :--- |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Auto-Deploy** | Yes (`main` branch) |

#### Required Environment Variables in Render Dashboard:
1. `GEMINI_API_KEY` — Google AI Studio Gemini API Key.
2. `ELEVENLABS_API_KEY` — ElevenLabs API Key for voice generation.
3. `ELEVENLABS_AGENT_ID` — Conversational AI Agent ID configured with JYC system prompts.
4. `DATABASE_URL` — *(Optional)* Connection string for Render Managed PostgreSQL or external cloud database.
5. `NODE_ENV` — `production`

---

## 🔒 Confidentiality & Intellectual Property

All sales scripts, qualification formulas, gatekeeper deflection matrices, and industrial customer personas contained within this repository are proprietary assets of **JYC Equipment** and **JYC Medical**. Unauthorized distribution, reproduction, or commercial extraction is strictly prohibited.

---

<div align="center">
<sub>Built with precision for JYC Equipment Sales Operations.</sub>
</div>
