export type Language = 'en' | 'es';

export interface Translations {
  // Navigation & General
  nav_home: string;
  nav_practice: string;
  nav_my_calls: string;
  nav_audit: string;
  nav_library: string;
  nav_admin: string;
  nav_logout: string;
  nav_tagline: string;
  btn_practice_call: string;
  btn_credits: string;

  // Home View
  home_greeting_pre: string;
  home_greeting_post: string;
  home_subtitle: string;
  home_real_streak: string;
  home_streak_start: string;
  home_freeze_ready: string;
  home_freeze_used: string;
  home_daily_goal_title: string;
  home_daily_goal_sub: string;
  home_daily_goal_done: string;
  home_daily_goal_pending: string;
  home_daily_goal_calls: string;
  home_cta_practice: string;

  // Home 3 Blocks
  home_block1_tag: string;
  home_block1_badge: string;
  home_block1_machinery: string;
  home_block1_why: string;
  home_block1_objective: string;
  home_block1_btn: string;

  home_block2_tag: string;
  home_block2_empty_title: string;
  home_block2_empty_desc: string;
  home_block2_view_history: string;
  home_block2_view_playbook: string;

  home_block3_tag: string;
  home_block3_period: string;
  home_block3_calls: string;
  home_block3_avg: string;
  home_block3_trend: string;
  home_block3_trend_up: string;
  home_block3_trend_down: string;
  home_block3_trend_stable: string;
  home_block3_cert: string;

  // Industry Path Roadmap
  roadmap_title: string;
  roadmap_subtitle: string;
  roadmap_progress: string;
  roadmap_mastered: string;
  roadmap_train_btn: string;

  // Wizard Steps
  wizard_header_badge: string;
  wizard_header_title: string;
  wizard_header_subtitle: string;
  wizard_step1_label: string;
  wizard_step1_title: string;
  wizard_step1_subtitle: string;
  wizard_step1_next: string;
  wizard_step2_label: string;
  wizard_step2_title: string;
  wizard_step2_subtitle: string;
  wizard_step2_back: string;
  wizard_step2_next: string;
  wizard_step3_label: string;
  wizard_step3_title: string;
  wizard_step3_subtitle: string;
  wizard_step3_start: string;
  wizard_step3_connecting: string;

  // Difficulty Levels
  diff_level1_name: string;
  diff_level1_tag: string;
  diff_level1_desc: string;
  diff_level2_name: string;
  diff_level2_tag: string;
  diff_level2_desc: string;
  diff_level3_name: string;
  diff_level3_tag: string;
  diff_level3_desc: string;
  diff_level4_name: string;
  diff_level4_tag: string;
  diff_level4_desc: string;

  // Languages
  lang_call_heading: string;
  lang_en_label: string;
  lang_en_sub: string;
  lang_es_label: string;
  lang_es_sub: string;

  // Client Details
  client_summary_badge: string;
  client_patience_label: string;
  client_industry_label: string;
  client_contact_label: string;
  client_behavior_label: string;
  client_custom_btn: string;
  client_custom_hide: string;
  client_company_name: string;
  client_contact_name: string;

  // Active Call
  call_in_progress: string;
  call_connecting: string;
  call_interrupted: string;
  call_time_label: string;
  call_patience_label: string;
  call_open_playbook: string;
  call_close_playbook: string;
  call_hang_up: string;
  call_status_listening: string;
  call_status_speaking: string;
  call_status_muted: string;
  call_status_standby: string;

  // Scorecard
  score_title: string;
  score_pass: string;
  score_fail: string;
  score_btn_pdf: string;
  score_btn_retry: string;
  score_overall_label: string;
  score_priority_tag: string;
  score_priority_sub: string;
  score_ai_diag: string;
  score_retry_sub: string;
  score_audio_title: string;
  score_audio_sub: string;
  score_criteria_title: string;
  score_criteria_sub: string;

  // Objective Metrics
  metrics_title: string;
  metrics_sub: string;
  metrics_ratio_label: string;
  metrics_pacing_label: string;
  metrics_fillers_label: string;
  metrics_turns_label: string;
  metrics_wpm_unit: string;
  metrics_found_unit: string;
  metrics_zero_fillers: string;

  // Admin Boss View
  admin_badge: string;
  admin_title: string;
  admin_subtitle: string;
  admin_refresh: string;
  admin_accounts: string;
  admin_kpi_practices: string;
  admin_kpi_score: string;
  admin_kpi_leader: string;
  admin_kpi_active: string;
  admin_alert_title: string;
  admin_alert_sub: string;
  admin_podium_title: string;
  admin_podium_sub: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_practice: 'Practice Call',
    nav_my_calls: 'My Calls',
    nav_audit: 'Audit Real Recording',
    nav_library: 'Library & Playbook',
    nav_admin: 'Administration',
    nav_logout: 'Sign Out',
    nav_tagline: 'JYC Equipment · AI Sales Trainer',
    btn_practice_call: 'Practice Call',
    btn_credits: 'AI Credits',

    // Home View
    home_greeting_pre: 'Hello',
    home_greeting_post: 'Ready for today\'s practice?',
    home_subtitle: 'Practice heavy machinery acquisition calls with simulated buyers in real time. Level up, earn weekly XP, and climb the commercial team league.',
    home_real_streak: 'days streak',
    home_streak_start: 'Start your streak',
    home_freeze_ready: 'Streak Freeze ready',
    home_freeze_used: 'Streak Freeze used',
    home_daily_goal_title: 'Daily Goal: 1 call of at least 3 minutes',
    home_daily_goal_sub: 'Completing your daily goal keeps your streak alive and grants consistency XP.',
    home_daily_goal_done: 'Completed today',
    home_daily_goal_pending: 'Pending today',
    home_daily_goal_calls: 'calls today',
    home_cta_practice: 'Practice Now',

    // Home 3 Blocks
    home_block1_tag: '1. Recommended Practice',
    home_block1_badge: 'Personalized for you',
    home_block1_machinery: 'Target Machinery',
    home_block1_why: 'Why this scenario?',
    home_block1_objective: 'Script Objective',
    home_block1_btn: 'Start This Scenario',

    home_block2_tag: '2. Your Last Score',
    home_block2_empty_title: 'No practice calls recorded yet',
    home_block2_empty_desc: 'Complete your first simulated call to see your score and personalized coaching tips here.',
    home_block2_view_history: 'View all my calls',
    home_block2_view_playbook: 'Open playbook',

    home_block3_tag: '3. Weekly Progress',
    home_block3_period: 'Monday to Sunday',
    home_block3_calls: 'Calls',
    home_block3_avg: 'Average',
    home_block3_trend: 'Trend',
    home_block3_trend_up: 'Rising',
    home_block3_trend_down: 'Falling',
    home_block3_trend_stable: 'Stable',
    home_block3_cert: 'JYC Certification',

    // Industry Path Roadmap
    roadmap_title: 'Industrial Pathway Roadmap',
    roadmap_subtitle: 'Every industry has 4 challenges: Easy ➔ Medium ➔ Hard ➔ Final Boss. Pass with score ≥ 70.',
    roadmap_progress: 'industries completed',
    roadmap_mastered: 'Mastered',
    roadmap_train_btn: 'Train',

    // Wizard Steps
    wizard_header_badge: 'JYC Commercial Acquisition Simulator',
    wizard_header_title: 'Call Preparation',
    wizard_header_subtitle: 'Advance through your level path, handle prospect friction, and earn XP for the weekly league.',
    wizard_step1_label: 'Step 1',
    wizard_step1_title: 'Industry & Sector',
    wizard_step1_subtitle: 'Select the prospect\'s industry. Each sector has specific heavy equipment and unique buyer profiles.',
    wizard_step1_next: 'Continue to Level & Language',
    wizard_step2_label: 'Step 2',
    wizard_step2_title: 'Level & Language',
    wizard_step2_subtitle: 'Progress from receptive plant owners to the feared Final Boss. Unlimited practice attempts.',
    wizard_step2_back: 'Back to Industry',
    wizard_step2_next: 'Review Profile & Confirm',
    wizard_step3_label: 'Step 3',
    wizard_step3_title: 'Buyer Profile & Start',
    wizard_step3_subtitle: 'Review the buyer details and conversation parameters before placing the virtual call.',
    wizard_step3_start: 'Start Call Now',
    wizard_step3_connecting: 'Connecting to buyer...',

    // Difficulty Levels
    diff_level1_name: 'Level 1: Easy',
    diff_level1_tag: 'Receptive Owner',
    diff_level1_desc: 'Friendly, collaborative owner. Listens attentively and answers your qualification questions.',
    diff_level2_name: 'Level 2: Medium',
    diff_level2_tag: 'Strict Gatekeeper',
    diff_level2_desc: 'Tough gatekeeper. Deflects your call asking you to send an email or says the manager is unavailable.',
    diff_level3_name: 'Level 3: Hard',
    diff_level3_tag: 'Hurried Buyer',
    diff_level3_desc: 'Demands blind ballpark pricing immediately: "Give me a price or I\'m hanging up". Avoid blind quotes.',
    diff_level4_name: 'Level 4: Final Boss',
    diff_level4_tag: 'Skeptical Director',
    diff_level4_desc: 'Has exclusive competitor contracts and distrusts brokers. Demands certified rigging and 24h wire payment proof.',

    // Languages
    lang_call_heading: 'Simulation Language',
    lang_en_label: 'English (US & Canada)',
    lang_en_sub: 'Practice with native North American conversational cadence',
    lang_es_label: 'Spanish (Latin America)',
    lang_es_sub: 'Practice with Latin American industrial sales terminology',

    // Client Details
    client_summary_badge: 'Buyer Profile',
    client_patience_label: 'Estimated Patience',
    client_industry_label: 'Industry & Machinery',
    client_contact_label: 'Target Company & Contact',
    client_behavior_label: 'Expected Prospect Behavior',
    client_custom_btn: 'Customize client (name & company)',
    client_custom_hide: 'Hide customization',
    client_company_name: 'Company Name',
    client_contact_name: 'Contact Name',

    // Active Call
    call_in_progress: 'Call in Progress',
    call_connecting: 'Dialing...',
    call_interrupted: 'Call Disconnected',
    call_time_label: 'Duration:',
    call_patience_label: 'Prospect Patience:',
    call_open_playbook: 'Open Playbook',
    call_close_playbook: 'Close Playbook',
    call_hang_up: 'Hang Up',
    call_status_listening: '🎤 Capturing your voice...',
    call_status_speaking: '🔊 Prospect speaking...',
    call_status_muted: 'Microphone muted',
    call_status_standby: 'Listening to your mic',

    // Scorecard
    score_title: 'Call Evaluation',
    score_pass: 'Objective Met',
    score_fail: 'Improvement Opportunity',
    score_btn_pdf: 'Download PDF',
    score_btn_retry: 'Practice Again',
    score_overall_label: 'Overall Score',
    score_priority_tag: '#1 Priority Improvement for Next Time',
    score_priority_sub: 'Top focal point for your next simulation',
    score_ai_diag: 'AI Coach Diagnosis:',
    score_retry_sub: 'Apply this priority improvement right away while it\'s fresh.',
    score_audio_title: 'Simulated Call Audio Recording',
    score_audio_sub: 'Listen to your tone, pacing, and handling of cold call objections',
    score_criteria_title: 'Call Stages & Key Criteria',
    score_criteria_sub: 'Systematic check of each sales protocol milestone',

    // Objective Metrics
    metrics_title: 'Objective Conversation Metrics',
    metrics_sub: 'Computed directly from audio duration and transcript without AI bias (zero token cost)',
    metrics_ratio_label: 'Talk / Listen Ratio',
    metrics_pacing_label: 'Speaking Cadence',
    metrics_fillers_label: 'Filler Words Detected',
    metrics_turns_label: 'Turn Control & Overlaps',
    metrics_wpm_unit: 'words/min',
    metrics_found_unit: 'found',
    metrics_zero_fillers: 'Zero filler words',

    // Admin Boss View
    admin_badge: 'Commercial Executive Suite',
    admin_title: 'Executive Team Dashboard',
    admin_subtitle: 'Read in under 30 seconds: weekly podium, XP leagues, rep consistency, and critical team bottlenecks.',
    admin_refresh: 'Refresh',
    admin_accounts: 'Manage Accounts',
    admin_kpi_practices: 'Practices This Week',
    admin_kpi_score: 'Team Avg Score',
    admin_kpi_leader: 'Weekly Leader (#1)',
    admin_kpi_active: 'Active Reps',
    admin_alert_title: 'Critical Team Bottleneck · For Upcoming Sales Meeting',
    admin_alert_sub: 'Recommended Action: Guided practice on Playbook',
    admin_podium_title: 'Weekly Podium & Commercial Divisions',
    admin_podium_sub: 'Ranked by weekly XP. Leagues: Bronze (<250 XP), Silver (250-499 XP), Gold (500+ XP).'
  },

  es: {
    // Navigation
    nav_home: 'Inicio',
    nav_practice: 'Practicar',
    nav_my_calls: 'Mis llamadas',
    nav_audit: 'Auditar grabación real',
    nav_library: 'Biblioteca',
    nav_admin: 'Administración',
    nav_logout: 'Cerrar sesión',
    nav_tagline: 'JYC Equipment · Entrenador Comercial IA',
    btn_practice_call: 'Practicar llamada',
    btn_credits: 'Créditos IA',

    // Home View
    home_greeting_pre: 'Hola',
    home_greeting_post: '¿Listo para tu práctica de hoy?',
    home_subtitle: 'Practica llamadas de adquisición de maquinaria pesada. Avanza por niveles, acumula XP semanal y sube de división en el equipo comercial.',
    home_real_streak: 'días en racha',
    home_streak_start: 'Inicia tu racha',
    home_freeze_ready: 'Congelador listo',
    home_freeze_used: 'Congelador usado',
    home_daily_goal_title: 'Meta diaria: 1 llamada de al menos 3 minutos',
    home_daily_goal_sub: 'Cumplir tu meta diaria asegura que mantengas tu racha activa y otorga XP de constancia.',
    home_daily_goal_done: 'Completada hoy',
    home_daily_goal_pending: 'Pendiente hoy',
    home_daily_goal_calls: 'llamadas hoy',
    home_cta_practice: 'Practicar ahora',

    // Home 3 Blocks
    home_block1_tag: '1. Próxima práctica sugerida',
    home_block1_badge: 'Basado en tu historial',
    home_block1_machinery: 'Maquinaria objetivo',
    home_block1_why: '¿Por qué este escenario?',
    home_block1_objective: 'Objetivo del guion',
    home_block1_btn: 'Iniciar este escenario',

    home_block2_tag: '2. Tu último score',
    home_block2_empty_title: 'Aún no tienes llamadas registradas',
    home_block2_empty_desc: 'Completa tu primera llamada simulada para ver aquí tu puntaje y recomendaciones personalizadas.',
    home_block2_view_history: 'Ver todas mis llamadas',
    home_block2_view_playbook: 'Consultar playbook',

    home_block3_tag: '3. Tu progreso esta semana',
    home_block3_period: 'Lunes a Domingo',
    home_block3_calls: 'Llamadas',
    home_block3_avg: 'Promedio',
    home_block3_trend: 'Tendencia',
    home_block3_trend_up: 'Sube',
    home_block3_trend_down: 'Baja',
    home_block3_trend_stable: 'Estable',
    home_block3_cert: 'Habilitación JYC',

    // Industry Path Roadmap
    roadmap_title: 'Ruta Comercial por Industrias',
    roadmap_subtitle: 'Cada industria tiene 4 desafíos: Fácil ➔ Medio ➔ Difícil ➔ Jefe Final. Se aprueba con 70 o más puntos.',
    roadmap_progress: 'industrias aprobadas',
    roadmap_mastered: 'Dominada',
    roadmap_train_btn: 'Entrenar',

    // Wizard Steps
    wizard_header_badge: 'Simulador Comercial de Adquisición JYC',
    wizard_header_title: 'Preparación de la Llamada',
    wizard_header_subtitle: 'Avanza en tu ruta por niveles, supera las trabas del comprador y acumula XP para la liga semanal.',
    wizard_step1_label: 'Paso 1',
    wizard_step1_title: 'Industria & Ruta',
    wizard_step1_subtitle: 'Selecciona la industria del prospecto. Cada sector tiene maquinaria específica y compradores únicos.',
    wizard_step1_next: 'Continuar a Nivel & Idioma',
    wizard_step2_label: 'Paso 2',
    wizard_step2_title: 'Nivel & Idioma',
    wizard_step2_subtitle: 'Avanza del prospecto receptivo al temido Jefe Final. Puedes practicar cualquier nivel sin restricciones de vidas.',
    wizard_step2_back: 'Volver a Industria',
    wizard_step2_next: 'Revisar Ficha y Confirmar',
    wizard_step3_label: 'Paso 3',
    wizard_step3_title: 'Ficha & Iniciar',
    wizard_step3_subtitle: 'Todo está listo. Revisa el perfil del comprador antes de iniciar la llamada virtual.',
    wizard_step3_start: 'Iniciar llamada ahora',
    wizard_step3_connecting: 'Conectando con el comprador...',

    // Difficulty Levels
    diff_level1_name: 'Nivel 1: Fácil',
    diff_level1_tag: 'Receptivo',
    diff_level1_desc: 'Dueño amable y colaborador. Escucha tu presentación y responde con fluidez a la calificación técnica.',
    diff_level2_name: 'Nivel 2: Medio',
    diff_level2_tag: 'Filtro / Ocupado',
    diff_level2_desc: 'Recepcionista difícil (Gatekeeper). Intenta frenarte diciendo que mandes un correo o que el jefe no está.',
    diff_level3_name: 'Nivel 3: Difícil',
    diff_level3_tag: 'Comprador Apurado',
    diff_level3_desc: 'Exige precio inmediato a ciegas: "Dime cuánto pagas o cuelgo". Pon a prueba la regla de oro de tasación.',
    diff_level4_name: 'Nivel 4: Jefe Final',
    diff_level4_tag: 'Gerente Escéptico',
    diff_level4_desc: 'Tiene proveedor exclusivo y desconfía de brokers. Solo cede con maniobra técnica y retiro garantizado en 24h.',

    // Languages
    lang_call_heading: 'Idioma de la Llamada Simulada',
    lang_en_label: 'Inglés (EE.UU. / Canadá)',
    lang_en_sub: 'Práctica con acento norteamericano nativo',
    lang_es_label: 'Español (Latinoamérica)',
    lang_es_sub: 'Práctica con lenguaje técnico hispano',

    // Client Details
    client_summary_badge: 'Ficha del Cliente',
    client_patience_label: 'Paciencia estimada',
    client_industry_label: 'Industria & Maquinaria',
    client_contact_label: 'Empresa & Contacto Objetivo',
    client_behavior_label: 'Comportamiento esperado del prospecto',
    client_custom_btn: 'Personalizar cliente (nombre y empresa)',
    client_custom_hide: 'Ocultar personalización',
    client_company_name: 'Nombre de la Empresa',
    client_contact_name: 'Nombre del Contacto',

    // Active Call
    call_in_progress: 'Llamada en Curso',
    call_connecting: 'Marcando...',
    call_interrupted: 'Línea Interrumpida',
    call_time_label: 'Tiempo:',
    call_patience_label: 'Paciencia del Cliente:',
    call_open_playbook: 'Abrir Playbook',
    call_close_playbook: 'Cerrar Playbook',
    call_hang_up: 'Colgar',
    call_status_listening: '🎤 Captando tu voz...',
    call_status_speaking: '🔊 Prospecto hablando...',
    call_status_muted: 'Micrófono silenciado',
    call_status_standby: 'Escuchando tu micro',

    // Scorecard
    score_title: 'Evaluación de Llamada',
    score_pass: 'Objetivo Cumplido',
    score_fail: 'Oportunidad de Mejora',
    score_btn_pdf: 'Descargar PDF',
    score_btn_retry: 'Practicar de nuevo',
    score_overall_label: 'Puntaje Global',
    score_priority_tag: 'Lo único que debes mejorar la próxima vez',
    score_priority_sub: 'Prioridad #1 para tu próxima llamada',
    score_ai_diag: 'Diagnóstico del Evaluador IA:',
    score_retry_sub: 'Aplica el punto de mejora inmediatamente mientras lo tienes fresco.',
    score_audio_title: 'Grabación de la llamada simulada',
    score_audio_sub: 'Escucha cómo sonó tu tono, ritmo y manejo de respuestas en frío',
    score_criteria_title: 'Etapas de la llamada y criterios clave',
    score_criteria_sub: 'Verificación de cada paso del protocolo comercial',

    // Objective Metrics
    metrics_title: 'Métricas Objetivas de la Conversación',
    metrics_sub: 'Calculadas directamente de la transcripción y tiempos de habla sin sesgo de IA',
    metrics_ratio_label: 'Proporción de Habla',
    metrics_pacing_label: 'Ritmo de Habla',
    metrics_fillers_label: 'Muletillas Detectadas',
    metrics_turns_label: 'Control de Turnos',
    metrics_wpm_unit: 'palabras/min',
    metrics_found_unit: 'encontradas',
    metrics_zero_fillers: 'Cero muletillas',

    // Admin Boss View
    admin_badge: 'Panel de Dirección Comercial',
    admin_title: 'Vista Ejecutiva del Equipo',
    admin_subtitle: 'Lectura rápida en 30 segundos: podio semanal, liga por XP, actividad y punto crítico de mejora del equipo.',
    admin_refresh: 'Actualizar',
    admin_accounts: 'Gestionar Cuentas',
    admin_kpi_practices: 'Prácticas esta semana',
    admin_kpi_score: 'Score promedio equipo',
    admin_kpi_leader: 'Líder semanal (Podio #1)',
    admin_kpi_active: 'Vendedores activos',
    admin_alert_title: 'Punto Crítico del Equipo · Para la Próxima Reunión Comercial',
    admin_alert_sub: 'Acción recomendada: Práctica guiada en Playbook',
    admin_podium_title: 'Podio Semanal & Divisiones Comerciales',
    admin_podium_sub: 'Clasificación basada en XP semanal por calidad de llamadas. Ligas: Bronce (<250 XP), Plata (250-499 XP), Oro (500+ XP).'
  }
};
