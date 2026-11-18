export interface PlaybookItem {
  id: string;
  title: string;
  situation: string;
  spanishScript: string;
  englishScript: string;
  tip?: string;
  category: 'gatekeeper' | 'opening' | 'qualify' | 'objections' | 'sell' | 'industries';
  tags?: string[];
}

export interface IndustrySpec {
  id: string;
  title: string;
  targetEquipment: string;
  valueProp: string;
  keySpecs: string;
  brands: string;
  qualifyQuestionEn: string;
  qualifyQuestionEs: string;
  tacticalTip: string;
  questions: string[];
}

export const OPENING_SCRIPTS = {
  reception: {
    en: "Good morning, I am trying to reach the person who takes care of the sales of surplus equipment, such as forklifts or wheel loaders?",
    es: "Buenos días, ¿me podría comunicar con la persona a cargo de la venta de equipos y maquinaria excedente, como montacargas o cargadores?",
    ifAskedDetailsEn: "This is [Name] with JYC Equipment. We buy used heavy machinery directly for cash. I wanted to check if you have any surplus units for sale right now or coming up for replacement?",
    ifAskedDetailsEs: "Le habla [Nombre] de JYC Equipment. Compramos maquinaria pesada usada de contado. Quería verificar si tienen unidades para venta ahora o programadas para renovación."
  },
  decisionMaker: {
    badTimeCheckEn: "Good morning [Name], this is [My Name] with JYC Equipment. Did I catch you at a bad time?",
    badTimeCheckEs: "Buenos días [Nombre], le habla [Mi Nombre] de JYC Equipment. ¿Lo tomo en un mal momento?",
    commercialHookEn: "We buy used heavy equipment across the US and Canada with 100% upfront wire transfer and turnkey logistics. Do you have any units idle or scheduled for renewal?",
    commercialHookEs: "Compramos maquinaria pesada usada en todo EE.UU. con pago 100% por transferencia antes del retiro y flete a nuestro cargo. ¿Tienen unidades paradas o para renovar?"
  }
};

export const GATEKEEPER_REBUTTALS = [
  {
    id: 1,
    objection: "¿De parte de quién o de qué empresa?",
    objectionEs: "¿De parte de quién o de qué empresa?",
    objectionEn: "Who is calling and with what company?",
    responseEn: "This is [Name] with JYC Equipment. We buy surplus heavy machinery directly for cash.",
    responseEs: "Le habla [Nombre] de JYC Equipment. Compramos maquinaria pesada directamente de contado."
  },
  {
    id: 2,
    objection: "No sé quién se encarga de eso",
    objectionEs: "No sé quién se encarga de eso",
    objectionEn: "I don't know who is in charge of that",
    responseEn: "Usually it's the Plant Manager, Operations Director, or Fleet Lead. Could you transfer me to either of them?",
    responseEs: "Por lo general es el Jefe de Planta, Director de Operaciones o Mantenimiento. ¿Me comunica con alguno de ellos?"
  },
  {
    id: 3,
    objection: "No se encuentra disponible en este momento",
    objectionEs: "No se encuentra disponible en este momento",
    objectionEn: "They are not available right now",
    responseEn: "May I have their name and direct extension or email so I can send our acquisition sheet and call back?",
    responseEs: "¿Me podría confirmar su nombre y correo directo para enviarle la información de compra y llamarlo luego?"
  },
  {
    id: 4,
    objection: "Nosotros no vendemos maquinaria",
    objectionEs: "Nosotros no vendemos maquinaria",
    objectionEn: "We don't sell machinery",
    responseEn: "Understood. When equipment reaches its replacement hour limit, do you trade it in or auction it off?",
    responseEs: "Entiendo. Cuando los equipos cumplen su ciclo de horas, ¿suelen hacer trade-in o los mandan a subasta?"
  },
  {
    id: 5,
    objection: "Mándenos un correo con la presentación",
    objectionEs: "Mándenos un correo con la presentación",
    objectionEn: "Send us an email with your presentation",
    responseEn: "Happy to do so. To make sure I send relevant past acquisitions, what tonnages or brands do you operate in the yard?",
    responseEs: "Con gusto. Para no enviarle un folleto genérico, ¿qué marcas y tonelajes operan en patio habitualmente?"
  },
  {
    id: 6,
    objection: "Todo lo vendemos exclusivamente por subasta",
    objectionEs: "Todo lo vendemos exclusivamente por subasta",
    objectionEn: "We sell everything exclusively through auction",
    responseEn: "We buy direct with zero commissions and wire 100% payment in 24h before pickup. Who coordinates the units going to auction?",
    responseEs: "Nosotros compramos directo sin comisiones y transferimos en 24h antes de retirar. ¿Quién prepara los lotes para subasta?"
  },
  {
    id: 7,
    objection: "No tenemos nada a la venta hoy",
    objectionEs: "No tenemos nada a la venta hoy",
    objectionEn: "We have nothing for sale today",
    responseEn: "Totally fine. Do you expect any fleet rotation or replacements scheduled for later this year?",
    responseEs: "Comprendo. ¿Tienen proyectada alguna rotación o renovación de flota para los próximos meses?"
  },
  {
    id: 8,
    objection: "Solo trabajamos con proveedores registrados",
    objectionEs: "Solo trabajamos con proveedores registrados",
    objectionEn: "We only work with approved vendors",
    responseEn: "We are buyers with direct funds, not vendors charging fees. We pay you via wire before lifting any machine.",
    responseEs: "Nosotros no cobramos ni vendemos suministros; somos compradores directos que pagan por transferencia bancaria."
  },
  {
    id: 9,
    objection: "Deje su mensaje en el buzón de voz",
    objectionEs: "Deje su mensaje en el buzón de voz",
    objectionEn: "Please leave a message on voicemail",
    responseEn: "Understood. Could you confirm the first name of the operations manager so I leave a personalized note?",
    responseEs: "Entendido. ¿Me confirma el nombre del jefe de operaciones para dejarle el mensaje a su atención?"
  },
  {
    id: 10,
    objection: "¿De dónde obtuvo nuestro número telefónico?",
    objectionEs: "¿De dónde obtuvo nuestro número telefónico?",
    objectionEn: "Where did you get our phone number?",
    responseEn: "We research industrial operations with active heavy machinery fleets across your state.",
    responseEs: "Investigamos plantas industriales con flotas activas de maquinaria en su estado."
  },
  {
    id: 11,
    objection: "Solo el corporativo toma esas decisiones",
    objectionEs: "Solo el corporativo toma esas decisiones",
    objectionEn: "Only corporate makes those decisions",
    responseEn: "Understood. Who at corporate manages fleet lifecycle or capital equipment disposal?",
    responseEs: "Entendido. ¿Quién en corporativo gestiona la desincorporación de activos y maquinaria?"
  },
  {
    id: 12,
    objection: "Estamos en reunión de planta",
    objectionEs: "Estamos en reunión de planta",
    objectionEn: "We are in a plant meeting",
    responseEn: "I will make this brief. What time this afternoon is the plant manager back at their desk?",
    responseEs: "No le quito tiempo. ¿A qué hora de la tarde suele estar de vuelta en su escritorio?"
  },
  {
    id: 13,
    objection: "¿Tienen oficina local en nuestra ciudad?",
    objectionEs: "¿Tienen oficina local en nuestra ciudad?",
    objectionEn: "Do you have a local office in our city?",
    responseEn: "Our logistics team picks up nationwide; we coordinate local lowboy carriers and crane rigging in your area.",
    responseEs: "Nuestra red logística cubre todo el país; enviamos grúa y transporte especializado directamente a sus instalaciones."
  },
  {
    id: 14,
    objection: "El encargado casi nunca está en oficina",
    objectionEs: "El encargado casi nunca está en oficina",
    objectionEn: "The manager is rarely at their desk",
    responseEn: "Makes sense, they are on the field. Do you know if they prefer a quick text or email with our purchase offer?",
    responseEs: "Totalmente comprensible, está en faena. ¿Prefiere que le enviemos un WhatsApp o un correo directo?"
  }
];

export const QUALIFICATION_STEPS = [
  {
    step: 1,
    title: "Marca y Modelo Exacto",
    titleEs: "Marca y Modelo Exacto",
    titleEn: "Exact Make and Model Series",
    purpose: "Determinar valor de mercado y liquidez de exportación",
    purposeEs: "Determinar valor de mercado y liquidez de exportación",
    purposeEn: "Determine market value and export liquidity",
    questionEn: "What is the exact make, model series, and approximate year of the unit?",
    questionEs: "¿Cuál es la marca, serie de modelo exacta y año aproximado del equipo?"
  },
  {
    step: 2,
    title: "Horómetro y Condición Mecánica",
    titleEs: "Horómetro y Condición Mecánica",
    titleEn: "Hour Meter and Mechanical Condition",
    purpose: "Evaluar desgaste operativo",
    purposeEs: "Evaluar desgaste operativo",
    purposeEn: "Assess operating wear and tear",
    questionEn: "How many hours are currently recorded on the meter, and are there any active leaks or transmission issues?",
    questionEs: "¿Cuántas horas marca el horómetro y cómo está de motor, transmisión o fugas hidráulicas?"
  },
  {
    step: 3,
    title: "Especificaciones Críticas",
    titleEs: "Especificaciones Críticas",
    titleEn: "Critical Specifications",
    purpose: "Capacidad de carga, mástil, llantas o husillo",
    purposeEs: "Capacidad de carga, mástil, llantas o husillo",
    purposeEn: "Lift capacity, mast type, tires or screw diameter",
    questionEn: "What is the rated capacity, tire type (cushion or pneumatic), and mast stages?",
    questionEs: "¿Qué capacidad de carga tiene, qué tipo de llantas (cushion o neumático) y cuántas etapas de mástil?"
  },
  {
    step: 4,
    title: "Fotos de Placa y Horómetro (Compromiso)",
    titleEs: "Fotos de Placa y Horómetro (Compromiso)",
    titleEn: "Data Plate and Hour Meter Photos (Commitment)",
    purpose: "Evitar cotización a ciegas y asegurar oferta formal en 24h",
    purposeEs: "Evitar cotización a ciegas y asegurar oferta formal en 24h",
    purposeEn: "Avoid blind estimates and guarantee a formal 24h cash offer",
    questionEn: "Can you share clear photos of the serial data plate and active meter? With that, our desk issues a firm cash wire offer within 24 hours.",
    questionEs: "¿Podría enviarme fotos claras de la placa técnica del fabricante y del horómetro? Con eso le emitimos una oferta formal por transferencia en 24h."
  }
];

export const PHOTO_ANGLES = [
  { id: 1, nameEs: "Vista Frontal", nameEn: "Front view" },
  { id: 2, nameEs: "Costado Izquierdo", nameEn: "Left side view" },
  { id: 3, nameEs: "Costado Derecho", nameEn: "Right side view" },
  { id: 4, nameEs: "Vista Trasera", nameEn: "Rear view / counterweight" },
  { id: 5, nameEs: "Placa Técnica del Fabricante", nameEn: "Manufacturer serial data plate" },
  { id: 6, nameEs: "Horómetro Prendido y Cabina", nameEn: "Active hour meter & cab controls" }
];

export const ADVANCED_OBJECTIONS = [
  {
    id: 1,
    objection: "Dígame su precio u oferta ahora mismo por teléfono",
    objectionEs: "Dígame su precio u oferta ahora mismo por teléfono",
    objectionEn: "Give me your price or ballpark offer right now on the phone",
    answerEn: "To protect your equipment value and give an exact written cash offer, our valuation desk requires photos of the data plate and hour meter. With that, we wire an offer within 24 hours.",
    answerEs: "Para no desvalorizar su máquina ni darle una cifra irresponsable al aire, nuestro tasador necesita revisar las fotos de la placa y horómetro. Con eso le enviamos oferta formal por transferencia en menos de 24 horas."
  },
  {
    id: 2,
    objection: "Siempre vendemos a través de subastas (Ritchie Bros / IronPlanet)",
    objectionEs: "Siempre vendemos a través de subastas (Ritchie Bros / IronPlanet)",
    objectionEn: "We always sell through auctions (Ritchie Bros / IronPlanet)",
    answerEn: "Auctions charge up to 15% commissions, offer no price guarantee, and leave transport on you. JYC buys direct, wires 100% upfront, and assumes all freight and rigging.",
    answerEs: "En subasta usted arriesga el precio final, paga hasta un 15% de comisión y tiene que cubrir la logística. JYC le compra directo, le transfiere el 100% acordado antes de tocar la máquina y asume todo el flete y maniobras."
  },
  {
    id: 3,
    objection: "¿Cómo compran si están en Miami / fuera del estado?",
    objectionEs: "¿Cómo compran si están en Miami / fuera del estado?",
    objectionEn: "How can you buy if you're in Miami / out of state?",
    answerEn: "We buy nationwide across the US and Canada. Once agreed, we wire funds directly to your bank account. Only after funds clear do our specialized carriers pick up the unit.",
    answerEs: "Compramos en todo Estados Unidos y Canadá. El proceso es seguro: acordamos el valor con las fotos, le transferimos los fondos por cable bancario y, una vez confirmado en su cuenta, nuestra grúa retira el equipo."
  },
  {
    id: 4,
    objection: "Vengan a verlo e inspeccionarlo en persona primero",
    objectionEs: "Vengan a verlo e inspeccionarlo en persona primero",
    objectionEn: "Come see and inspect it in person first",
    answerEn: "Our technical desk issues firm written offers within 24 hours based on data plate and meter photos. Once agreed on price, we coordinate physical verification and extraction.",
    answerEs: "Nuestra mesa técnica centraliza las compras en 24 horas. Con las 6 fotos le enviamos la oferta formal por escrito hoy mismo. Una vez acordado el valor, coordinamos la visita técnica y retiro."
  },
  {
    id: 5,
    objection: "El concesionario nos hace trade-in por equipo nuevo",
    objectionEs: "El concesionario nos hace trade-in por equipo nuevo",
    objectionEn: "The dealer gives us trade-in credit for new machines",
    answerEn: "Dealers typically offer wholesale trade-in values to protect their margin. We frequently beat trade-in appraisals by 10% to 20% in direct cash.",
    answerEs: "Los concesionarios suelen castigar el precio de toma para proteger su margen de venta. Con frecuencia superamos los valores de trade-in entre un 10% y 20% en efectivo directo."
  },
  {
    id: 6,
    objection: "El equipo está bajo contrato de leasing",
    objectionEs: "El equipo está bajo contrato de leasing",
    objectionEn: "The equipment is currently under a lease agreement",
    answerEn: "We work directly with leasing institutions to wire the buyout balance and remit any positive equity directly to your company.",
    answerEs: "Trabajamos con las entidades de leasing para pagar el saldo restante por transferencia y girar el remanente a favor de su empresa."
  },
  {
    id: 7,
    objection: "Está parado por falla mecánica o motor dañado",
    objectionEs: "Está parado por falla mecánica o motor dañado",
    objectionEn: "It is sitting idle due to a mechanical issue or damaged engine",
    answerEn: "We purchase units in as-is condition, including machines requiring overhaul. Send us the plate and hours and we will quote it accordingly.",
    answerEs: "Compramos maquinaria en el estado en que se encuentre, incluso con fallas mayores. Mándenos placa y horas y le cotizamos la compra as-is."
  },
  {
    id: 8,
    objection: "Queremos venderlo por consignación",
    objectionEs: "Queremos venderlo por consignación",
    objectionEn: "We prefer to sell it on consignment",
    answerEn: "Consignment leaves your yard occupied and ties up capital for months. JYC provides an immediate cash exit in 24 hours.",
    answerEs: "La consignación deja su patio ocupado y congela su capital durante meses. JYC le ofrece salida inmediata en efectivo en 24 horas."
  },
  {
    id: 9,
    objection: "¿Cuánto cobran de comisión?",
    objectionEs: "¿Cuánto cobran de comisión?",
    objectionEn: "How much commission do you charge?",
    answerEn: "Zero commission. We are direct principal buyers with our own balance sheet, not brokers.",
    answerEs: "Cero comisión. Somos compradores directos con capital propio, no intermediarios ni comisionistas."
  },
  {
    id: 10,
    objection: "No tenemos tiempo de atender tasadores ni visitas",
    objectionEs: "No tenemos tiempo de atender tasadores ni visitas",
    objectionEn: "We don't have time to host appraisers or on-site visits",
    answerEn: "That is exactly why clients work with us: you only take 6 photos from your phone and we take care of the entire rigging and extraction.",
    answerEs: "Precisamente por eso los clientes prefieren nuestro modelo: solo toma 6 fotos con su celular y nosotros resolvemos el 100% de la logística."
  }
];

export const CROSS_SELL_SCRIPTS = {
  whenProspectWantsToBuy: {
    en: "We maintain an active inventory of certified, late-model heavy equipment with low hours, ready for immediate nationwide delivery with warranty. What exact model or capacity are you looking to acquire?",
    es: "Mantenemos un inventario activo de maquinaria certificada con pocas horas, lista para entrega inmediata con garantía y logística resuelta. ¿Qué modelo o capacidad exacta están buscando incorporar?"
  },
  referralAsk: {
    en: "Thank you for your time, [Name]. Do you know of any other facility, quarry, or contractor in your area that might be rotating heavy equipment right now?",
    es: "Muchísimas gracias por su tiempo, [Nombre]. ¿Conoce alguna otra planta, contratista o cantera en su zona que esté renovando maquinaria pesada en este momento?"
  }
};

export const INDUSTRY_GUIDES: Record<string, IndustrySpec> = {
  concrete: {
    id: 'concrete',
    title: 'Canteras, Agregados y Concreto',
    targetEquipment: 'Cargadores frontales CAT (988, 966, 980), excavadoras y montacargas pesados',
    valueProp: 'Pago inmediato en 24h y retiro en cama baja con grúa propia para cargadores pesados.',
    keySpecs: 'Cargadores frontales CAT (988, 966, 980), excavadoras y montacargas de patio pesado.',
    brands: 'Caterpillar, Komatsu, Volvo, Kawasaki.',
    qualifyQuestionEn: "Do you have CAT 988 or 966 wheel loaders coming up for rotation, and how many hours are on the meter?",
    qualifyQuestionEs: "¿Tienen cargadores CAT 988 o 966 próximos a rotación y cuántas horas marcan en horómetro?",
    tacticalTip: 'Enfatiza que JYC asume todo el flete en cama baja lowboy.',
    questions: [
      '¿Tienen cargadores CAT de la serie 988 o 966 próximos a rotación?',
      '¿Cuántas horas registran en horómetro los equipos de extracción?',
      '¿Cuentan con montacargas pesados de patio para movimiento de bloques o prefabricados?'
    ]
  },
  plastics: {
    id: 'plastics',
    title: 'Plásticos y Moldeo por Inyección',
    targetEquipment: 'Inyectoras 500T a 2,000T, extrusoras, chillers y periféricos',
    valueProp: 'Maniobra pesada, desconexión y flete 100% asumidos por JYC. Evita costos de desarmado de prensas de 100 toneladas.',
    keySpecs: 'Inyectoras de 500 a 2.000 toneladas. Shot size en onzas (20, 50, 100 oz) y diámetro de husillo en mm (50, 70, 135 mm).',
    brands: 'Engel, Krauss Maffei, Husky, Cincinnati Milacron, Arburg, Sumitomo, Nissei, JSW.',
    qualifyQuestionEn: "What is the clamping tonnage, shot size in ounces, and screw diameter in millimeters?",
    qualifyQuestionEs: "¿Cuál es el tonelaje de cierre, tamaño de disparo en onzas y diámetro de husillo en mm?",
    tacticalTip: 'Menciona que nos encargamos del desarme técnico y retiro.',
    questions: [
      '¿Tienen inyectoras de gran tonelaje (500T a 2.000T) que vayan a dar de baja?',
      '¿Cuál es el shot size en onzas y diámetro de husillo?',
      '¿Cuentan con periféricos excedentes: secadores, molinos o chillers industriales?'
    ]
  },
  ports: {
    id: 'ports',
    title: 'Puertos y Terminales Marítimas',
    targetEquipment: 'Reach Stackers 45T, manipuladores de contenedores y tractores de patio',
    valueProp: 'Desarmado de pluma telescópica, lowboy RGN y permisos de puerto coordinados y cubiertos por JYC.',
    keySpecs: 'Reach Stackers de 45 toneladas, manipuladores de contenedores vacíos y tractores de patio (spotters).',
    brands: 'Kalmar, Konecranes, Taylor, Hyster, Ottawa, Terberg. (Nota: CAT no fabrica reach stackers).',
    qualifyQuestionEn: "Do you have 45T Kalmar or Konecranes Reach Stackers scheduled for replacement?",
    qualifyQuestionEs: "¿Tienen Reach Stackers de 45T Kalmar o Konecranes programados para renovación?",
    tacticalTip: 'Resalta que coordinamos permisos portuarios TWIC y grúa telescópica.',
    questions: [
      '¿Tienen Reach Stackers de 45T Kalmar o Konecranes por renovar?',
      '¿Cuántas horas registran en horómetro los manipuladores de vacíos?',
      '¿Tienen tractores de patio Ottawa o Terberg en desuso?'
    ]
  },
  metal: {
    id: 'metal',
    title: 'Acero y Metalmecánica Pesada',
    targetEquipment: 'Montacargas pesados de 30,000 a 90,000 lbs y manipuladores de bobinas',
    valueProp: 'Compra directa de montacargas pesados de 30.000 a 90.000 lbs con pago antes de retiro.',
    keySpecs: 'Montacargas de gran capacidad con mástil duplex/triplex, posicionador de horquillas y pinzas para bobinas.',
    brands: 'Taylor, Hyster, Kalmar, Svetruck.',
    qualifyQuestionEn: "Do you have heavy-duty forklifts above 30,000 lbs with coil rams or positioners in surplus?",
    qualifyQuestionEs: "¿Tienen montacargas pesados de más de 30,000 lbs con pinza de bobina en desuso?",
    tacticalTip: 'Asegura que el pago se realiza por cable bancario antes del retiro.',
    questions: [
      '¿Tienen montacargas pesados de más de 30.000 lbs en patio?',
      '¿Qué aditamentos tienen (desplazador lateral, pinza de bobina)?',
      '¿El motor es diésel o GLP?'
    ]
  },
  medical: {
    id: 'medical',
    title: 'Equipos Médicos (JYC Medical)',
    targetEquipment: 'Resonadores magnéticos MRI (1.5T/3.0T), Tomógrafos CT y PET/CT',
    valueProp: 'Ramp-down criogénico especializado y extracción técnica en clínicas activas sin costo para el hospital.',
    keySpecs: 'Resonancia Magnética (1.5T y 3.0T), Tomografía Computarizada (64, 128, 256 cortes).',
    brands: 'GE Healthcare, Siemens Healthineers, Philips, Canon/Toshiba.',
    qualifyQuestionEn: "Are you planning the de-installation or replacement of your 1.5T or 3.0T MRI system?",
    qualifyQuestionEs: "¿Tienen programada la desinstalación o reemplazo de su resonador 1.5T o 3.0T?",
    tacticalTip: 'Ofrece rampa criogénica y desinstalación certificada sin costo para el centro médico.',
    questions: [
      '¿Tienen programada la renovación de su resonador magnético de 1.5T o 3.0T?',
      '¿Cuántos cortes tiene el tomógrafo computarizado a desinstalar?',
      '¿En qué fecha tienen planificada la llegada del nuevo equipo?'
    ]
  }
};

export const WHAT_WE_BUY = [
  { category: 'Montacargas Pesados', categoryEs: 'Montacargas Pesados', categoryEn: 'Heavy-Duty Forklifts', brands: 'Taylor, Hyster, CAT, Toyota, Kalmar', models: '15,000 to 90,000 lbs (Duplex / Triplex Mast)' },
  { category: 'Cargadores Frontales', categoryEs: 'Cargadores Frontales', categoryEn: 'Wheel Loaders', brands: 'Caterpillar, Komatsu, Volvo, Kawasaki', models: 'CAT 988, 980, 966, 950 series' },
  { category: 'Reach Stackers & Portuarios', categoryEs: 'Reach Stackers & Portuarios', categoryEn: 'Reach Stackers & Port Equipment', brands: 'Kalmar, Konecranes, Taylor, Hyster', models: '45 Metric Tons, empty container handlers' },
  { category: 'Inyectoras de Plástico', categoryEs: 'Inyectoras de Plástico', categoryEn: 'Plastic Injection Molders', brands: 'Engel, Krauss Maffei, Husky, Milacron', models: '500T to 2,000T (Hydraulic and Electric)' },
  { category: 'Resonadores y Tomógrafos', categoryEs: 'Resonadores y Tomógrafos', categoryEn: 'MRI & CT Scanners', brands: 'GE, Siemens, Philips, Canon', models: 'MRI 1.5T and 3.0T · CT 64, 128, 256 slices' },
  { category: 'Excavadoras de Gran Tonelaje', categoryEs: 'Excavadoras de Gran Tonelaje', categoryEn: 'Large Excavators', brands: 'CAT, Komatsu, Hitachi', models: '30 to 90 Metric Tons' }
];

export const QUICK_CALL_CHEATSHEET = {
  openingEn: "Good morning, I am trying to reach the person who takes care of the sales of surplus equipment, such as forklifts or wheel loaders?",
  openingEs: "Buenos días, ¿me podría comunicar con la persona a cargo de la venta de maquinaria excedente, como montacargas o cargadores?",
  ifAskedWhoEn: "This is [Name] with JYC Equipment. We buy used heavy machinery directly for cash.",
  ifAskedWhoEs: "Le habla [Nombre] de JYC Equipment. Compramos maquinaria pesada directamente de contado.",
  qualifyChecklist: [
    { en: "What is the exact make and model of the unit?", es: "¿Cuál es la marca y modelo exacto del equipo?" },
    { en: "How many hours are currently recorded on the meter?", es: "¿Cuántas horas marca el horómetro?" },
    { en: "Is it running condition with any leaks or engine issues?", es: "¿Está operativo o tiene alguna falla mecánica?" },
    { en: "Can you send photos of the serial data plate and hour meter?", es: "¿Puede enviarme fotos de la placa técnica y del horómetro?" }
  ],
  topObjections: [
    {
      objection: "Dígame el precio ahora mismo",
      sayEn: "To give an accurate formal wire offer, our valuation desk needs photos of the data plate and meter.",
      sayEs: "Para darle una oferta formal por transferencia en 24h, nuestro tasador necesita revisar las fotos de la placa y horómetro."
    },
    {
      objection: "Vendemos por subasta",
      sayEn: "We buy direct with zero fees and wire payment before pickup. No waiting or auction risk.",
      sayEs: "Nosotros compramos directo sin comisiones y le transferimos el 100% antes de retirar. Cero riesgo."
    },
    {
      objection: "No tenemos tiempo",
      sayEn: "I only need 30 seconds. If you have nothing surplus in the yard, I will not take more of your time.",
      sayEs: "Solo le robo 30 segundos. Si no tiene maquinaria parada en patio no le quito más tiempo."
    }
  ]
};
