export interface ScenarioConfig {
  id: string;
  title: string;
  titleEn?: string;
  machinery: string;
  machineryEn?: string;
  context: string;
  objective: string;
  objectiveEn?: string;
  defaults: {
    English: { company: string; contact: string; roleTitle: string; voiceId?: string };
    Spanish: { company: string; contact: string; roleTitle: string; voiceId?: string };
  };
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'concrete',
    title: 'Concreto y Canteras',
    titleEn: 'Concrete & Quarries',
    machinery: 'CAT Wheel Loaders (988, 966) y montacargas pesados',
    machineryEn: 'CAT Wheel Loaders (988, 966) & heavy forklifts',
    context: 'Planta de prefabricados y agregados con renovación periódica de flota pesada.',
    objective: 'Desviar a recepción, hablar con el jefe de planta y calificar cargadores o montacargas en desuso.',
    objectiveEn: 'Bypass receptionist, connect with the plant manager, and qualify surplus loaders or heavy forklifts.',
    defaults: {
      English: { company: 'Northern Quarries', contact: 'Charles', roleTitle: 'Plant Manager', voiceId: 'nPczCjzI2devNBz1zQrb' },
      Spanish: { company: 'Canteras del Norte', contact: 'Carlos', roleTitle: 'Jefe de Planta', voiceId: 'cjVigY5qzO86Huf0OWal' }
    }
  },
  {
    id: 'plastic',
    title: 'Plásticos e Inyección',
    titleEn: 'Plastics & Injection Molding',
    machinery: 'Inyectoras 500–2,000T (Disparo: 20/50/100 oz · Husillo: 50/70/135 mm), extrusoras y chillers',
    machineryEn: 'Injection Molders 500–2,000T (Shot: 20/50/100 oz · Screw: 50/70/135 mm), extruders & chillers',
    context: 'Planta de moldeo por inyección actualizando maquinaria de gran tonelaje (Engel, Krauss Maffei, Husky, Milacron).',
    objective: 'Llegar al director de operaciones, calificar tonelaje, tamaño de disparo y husillo, y ofrecer desarme técnico completo.',
    objectiveEn: 'Reach Operations Director, qualify clamp tonnage, shot size, and screw diameter, and offer full turnkey dismantling.',
    defaults: {
      English: { company: 'Matrix Plastics', contact: 'Sophie', roleTitle: 'Operations Director', voiceId: 'EXAVITQu4vr4xnSDxMaL' },
      Spanish: { company: 'Plásticos y Polímeros', contact: 'Sofía', roleTitle: 'Directora de Operaciones', voiceId: 'FGY2WhTYpPnrIDTdsKH5' }
    }
  },
  {
    id: 'ports',
    title: 'Puertos y Terminales',
    titleEn: 'Ports & Marine Terminals',
    machinery: 'Reach Stackers 45T, manipuladores de contenedores y tractocamiones de patio',
    machineryEn: 'Reach Stackers 45T, loaded container handlers & terminal yard trucks',
    context: 'Terminal marítima e intermodal con rotación de equipos portuarios pesados.',
    objective: 'Hablar con mantenimiento de flota y calificar Reach Stackers disponibles (Kalmar, Konecranes, Taylor, Hyster).',
    objectiveEn: 'Connect with fleet maintenance and qualify available Reach Stackers (Kalmar, Konecranes, Taylor, Hyster).',
    defaults: {
      English: { company: 'Pacific Port Terminals', contact: 'Frank', roleTitle: 'Fleet Manager', voiceId: 'CwhRBWXzGAHq8TQ4Fs17' },
      Spanish: { company: 'Terminal Portuaria del Pacífico', contact: 'Francisco', roleTitle: 'Jefe de Flota', voiceId: 'IKne3meq5aSn9XLyUdCD' }
    }
  },
  {
    id: 'metal',
    title: 'Aceros y Metalmecánica',
    titleEn: 'Steel & Heavy Manufacturing',
    machinery: 'Montacargas pesados de 30,000 a 90,000 lbs y manipuladores de bobinas',
    machineryEn: 'Heavy duty forklifts (30,000 to 90,000 lbs) & coil handlers',
    context: 'Fábrica de tuberías y procesamiento de bobinas que opera equipos de carga extra pesada.',
    objective: 'Llegar al gerente de equipos o planta para identificar montacargas de alta capacidad en retiro.',
    objectiveEn: 'Reach the plant equipment superintendent to identify high-capacity forklifts being retired.',
    defaults: {
      English: { company: 'Apex Steel Tubing', contact: 'Edward', roleTitle: 'Maintenance Manager', voiceId: 'JBFqnCBsd6RMkjVDRZzb' },
      Spanish: { company: 'Aceros Industriales', contact: 'Eduardo', roleTitle: 'Jefe de Mantenimiento', voiceId: 'onwK4e9ZLuTAKqWW03F9' }
    }
  },
  {
    id: 'sand_gravel',
    title: 'Áridos, Arena y Grava',
    titleEn: 'Sand, Gravel & Aggregates',
    machinery: 'Cargadores frontales, excavadoras y camiones articulados',
    machineryEn: 'Front wheel loaders, excavators & articulated haul trucks',
    context: 'Cantera de arena y agregados con maquinaria de alto horómetro.',
    objective: 'Detectar unidades paradas o en renovación; coordinar fotos de placa técnica y estado general.',
    objectiveEn: 'Identify idle units or fleet upgrades; coordinate photos of serial plate and overall operating condition.',
    defaults: {
      English: { company: 'Pioneer Sand & Gravel', contact: 'Tyler', roleTitle: 'Site Operations Lead', voiceId: 'TxGEqnHWrfWFTfGW9XjX' },
      Spanish: { company: 'Áridos y Gravas del Norte', contact: 'Mateo', roleTitle: 'Encargado de Operaciones', voiceId: 'VR6AewLTigWG4xSOukaG' }
    }
  },
  {
    id: 'lumber',
    title: 'Madera y Aserraderos',
    titleEn: 'Timber & Sawmills',
    machinery: 'Cargadores forestales y montacargas de patio rudo',
    machineryEn: 'Forestry log loaders & rough-terrain yard forklifts',
    context: 'Aserradero industrial con patio de acopio y líneas de corte activas.',
    objective: 'Calificar maquinaria disponible hoy o perfilar la cuenta con las 6 preguntas clave para compra futura.',
    objectiveEn: 'Qualify machinery available today or profile account with the 6 key qualifying questions for future acquisition.',
    defaults: {
      English: { company: 'Timberlands Sawmill', contact: 'Robert', roleTitle: 'Yard Superintendent' },
      Spanish: { company: 'Maderas del Bosque', contact: 'Roberto', roleTitle: 'Superintendente de Planta' }
    }
  },
  {
    id: 'medical',
    title: 'Equipos Médicos (JYC Medical)',
    titleEn: 'Medical Imaging (JYC Medical)',
    machinery: 'Resonadores magnéticos MRI (1.5T y 3.0T), Tomógrafos CT y PET/CT',
    machineryEn: 'MRI Scanners (1.5T & 3.0T), CT Scanners & PET/CT units',
    context: 'Red hospitalaria o centro de diagnóstico por imágenes en proceso de recambio de escáner.',
    objective: 'Hablar con dirección de imagenología, ofrecer rampa criogénica y desinstalación certificada sin costo para ellos.',
    objectiveEn: 'Connect with Radiology Director, offer cryogenic cold-rampdown and turnkey rigging at zero net cost to them.',
    defaults: {
      English: { company: 'BioPharma Diagnostics', contact: 'Sarah', roleTitle: 'Imaging Director' },
      Spanish: { company: 'Centro Diagnóstico Nacional', contact: 'Elena', roleTitle: 'Directora de Imagenología' }
    }
  }
];
