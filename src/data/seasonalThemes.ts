import { SeasonKey, ThemeConfig } from '../types/catalog';

export interface SeasonalPreset {
  id: SeasonKey;
  name: string;
  badge: string;
  category?: 'eventos' | 'temporadas' | 'estilo';
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultCoverImage: string;
  theme: ThemeConfig;
  sampleFragrances: string[];
  sampleColors: { name: string; hex: string }[];
  sampleIncludes?: string[];
}

export const SEASONAL_PRESETS: Record<SeasonKey, SeasonalPreset> = {
  navidad: {
    id: 'navidad',
    name: 'Navidad & Fin de Año',
    badge: '🎄 Temporada Navideña',
    category: 'temporadas',
    description: 'Tonos bosque profundo, dorados festivos, especias cálidas y pino silvestre.',
    defaultTitle: 'COLECCIÓN BOTÁNICA NAVIDEÑA',
    defaultSubtitle: 'Velas Aromáticas Vertidas a Mano · Edición Especial Festiva',
    defaultCoverImage: 'https://images.unsplash.com/photo-1637870103286-29728821676b?auto=format&fit=crop&w=1200&q=80',
    theme: {
      season: 'navidad',
      palette: {
        primary: '#1F392B', // Verde Pino
        secondary: '#C29B38', // Dorado Cálido
        accent: '#8C272E', // Rojo Cereza Oscuro
        background: '#F9F8F5', // Lino suave
        cardBackground: '#FFFFFF',
        textPrimary: '#1E2522',
        textSecondary: '#57625B',
        border: '#E3DFD5',
      },
      fontFamily: 'editorial',
      coverLayout: 'minimal-editorial',
      productGridStyle: 'classic-editorial',
      showDimensionsVisual: true,
      showFragrances: true,
      showColorSwatches: true,
      showIncludes: true,
      currencySymbol: '$',
    },
    sampleFragrances: [
      'Pino Silvestre & Ciprés',
      'Canela en Rama & Naranja',
      'Vainilla Bourbon & Nuez',
      'Manzana Asada & Clavo',
      'Madera de Cedro & Ámbar',
      'Galleta de Jengibre',
    ],
    sampleColors: [
      { name: 'Verde Pino', hex: '#1F392B' },
      { name: 'Rojo Carmesí', hex: '#8C272E' },
      { name: 'Oro Champán', hex: '#C29B38' },
      { name: 'Blanco Nieve', hex: '#FAF9F6' },
      { name: 'Terracota Cálida', hex: '#C46845' },
    ],
    sampleIncludes: [
      'Caja de regalo festiva',
      'Tarjeta dedicatoria navideña',
      'Fósforos largos artesanales',
      'Lazo de terciopelo',
      'Tapa de madera grabada',
      'Instrucciones de cuidado y encendido',
    ],
  },
  amor_amistad: {
    id: 'amor_amistad',
    name: 'Amor y Amistad / San Valentín',
    badge: '❤️ Amor & Romance',
    category: 'eventos',
    description: 'Elegancia romántica en rosa empolvado, borgoña, notas florales dulces y luz cálida.',
    defaultTitle: 'AURA ROMÁNTICA',
    defaultSubtitle: 'Edición Especial San Valentín & Amistad',
    defaultCoverImage: 'https://images.unsplash.com/photo-1777107857801-ece87fefbfbe?auto=format&fit=crop&w=1200&q=80',
    theme: {
      season: 'amor_amistad',
      palette: {
        primary: '#681B27', // Borgoña profundo
        secondary: '#BA6D7B', // Rosa empolvado
        accent: '#D4AF37', // Toque dorado
        background: '#FAF6F6', // Crema rosada
        cardBackground: '#FFFFFF',
        textPrimary: '#261719',
        textSecondary: '#6B5458',
        border: '#E8DEDF',
      },
      fontFamily: 'editorial',
      coverLayout: 'lux-framed',
      productGridStyle: 'classic-editorial',
      showDimensionsVisual: true,
      showFragrances: true,
      showColorSwatches: true,
      currencySymbol: '$',
    },
    sampleFragrances: [
      'Rosas Damascenas & Champán',
      'Cereza Negra & Vainilla',
      'Peonía & Almizcle Blanco',
      'Frambuesa & Pimienta Rosa',
      'Chocolate & Avellana Tostada',
    ],
    sampleColors: [
      { name: 'Rosa Empolvado', hex: '#BA6D7B' },
      { name: 'Vino Tinto', hex: '#681B27' },
      { name: 'Marfil Suave', hex: '#FDF9F3' },
      { name: 'Rosa Pastel', hex: '#EACACD' },
      { name: 'Oro Rosa', hex: '#C58F87' },
    ],
  },
  madres: {
    id: 'madres',
    name: 'Día de las Madres',
    badge: '🌸 Día de las Madres',
    category: 'eventos',
    description: 'Armonía floral serena en lilas suaves, salvia y blanco perla con aromas reconfortantes.',
    defaultTitle: 'ESENCIA MATERNAL',
    defaultSubtitle: 'Velas Artesanales para Celebrar a Mamá',
    defaultCoverImage: 'https://images.unsplash.com/photo-1773866003935-c9840b47e139?auto=format&fit=crop&w=1200&q=80',
    theme: {
      season: 'madres',
      palette: {
        primary: '#5C4869', // Lila ciruela suave
        secondary: '#9480A0', // Lavanda pastel
        accent: '#B08D57', // Oro antiguo
        background: '#FAF8F9', // Alabastro suave
        cardBackground: '#FFFFFF',
        textPrimary: '#2B2330',
        textSecondary: '#665C6D',
        border: '#E8E2EC',
      },
      fontFamily: 'editorial',
      coverLayout: 'botanical-split',
      productGridStyle: 'classic-editorial',
      showDimensionsVisual: true,
      showFragrances: true,
      showColorSwatches: true,
      currencySymbol: '$',
    },
    sampleFragrances: [
      'Lavanda Francesa & Manzanilla',
      'Jazmín Silvestre & Té Blanco',
      'Orquídea & Flor de Loto',
      'Algodón Limpio & Talco Suave',
      'Flores de Azahar & Miel',
    ],
    sampleColors: [
      { name: 'Lavanda Suave', hex: '#9480A0' },
      { name: 'Lila Crema', hex: '#DED3E3' },
      { name: 'Salvia Botánica', hex: '#879788' },
      { name: 'Blanco Lirio', hex: '#FAF9F6' },
      { name: 'Durazno Tierno', hex: '#F5CEB8' },
    ],
  },
  baby_shower: {
    id: 'baby_shower',
    name: 'Baby Shower & Nacimiento',
    badge: '👶 Baby Shower & Nacimiento',
    category: 'eventos',
    description: 'Pasteles delicados en azul cielo y rosa tierno con notas a talco infantil, flor de algodón y vainilla pura.',
    defaultTitle: 'DULCE ESPERA & BIENVENIDA',
    defaultSubtitle: 'Velas Artesanales & Recuerdos para Baby Shower',
    defaultCoverImage: 'https://images.unsplash.com/photo-1732904956376-446fcf39214c?auto=format&fit=crop&w=1200&q=80',
    theme: {
      season: 'baby_shower',
      palette: {
        primary: '#3F6B7E', // Azul Nube Sereno
        secondary: '#DB98A5', // Rosa Pastel Suave
        accent: '#D4A373', // Caramelo / Miel tibia
        background: '#FBF9F7', // Nube blanca marfil
        cardBackground: '#FFFFFF',
        textPrimary: '#222F35',
        textSecondary: '#60727B',
        border: '#E6ECF1',
      },
      fontFamily: 'editorial',
      coverLayout: 'minimal-editorial',
      productGridStyle: 'classic-editorial',
      showDimensionsVisual: true,
      showFragrances: true,
      showColorSwatches: true,
      currencySymbol: '$',
    },
    sampleFragrances: [
      'Talco de Bebé & Flor de Algodón',
      'Vainilla Cremosa & Nube Dulce',
      'Lavanda Relajante & Manzanilla',
      'Leche de Almendras & Miel Tibia',
      'Flores de Azahar & Durazno Blanco',
    ],
    sampleColors: [
      { name: 'Azul Cielo Pastel', hex: '#A8CDE2' },
      { name: 'Rosa Rubor Dulce', hex: '#F2C2C9' },
      { name: 'Blanco Nube', hex: '#FCFCFB' },
      { name: 'Amarillo Mantequilla', hex: '#FDF0CD' },
      { name: 'Verde Menta Suave', hex: '#C2E2D8' },
    ],
  },
  graduaciones: {
    id: 'graduaciones',
    name: 'Graduaciones & Logros',
    badge: '🎓 Graduaciones & Triunfos',
    category: 'eventos',
    description: 'Elegancia solemne en azul medianoche imperial, destellos de oro de laurel y aromas de honor y madera de cedro.',
    defaultTitle: 'EDICIÓN GRADUACIONES & ÉXITO',
    defaultSubtitle: 'Velas de Conmemoración, Honor & Reconocimiento Académico',
    defaultCoverImage: 'https://images.unsplash.com/photo-1641753343828-e7a5b75d7539?auto=format&fit=crop&w=1200&q=80',
    theme: {
      season: 'graduaciones',
      palette: {
        primary: '#112240', // Azul Marino Imperial / Medianoche
        secondary: '#C59E47', // Oro de Honor & Laurel
        accent: '#7E1C30', // Granate Académico
        background: '#F8F9FA', // Blanco Pergamino
        cardBackground: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#475569',
        border: '#DCE2E9',
      },
      fontFamily: 'editorial',
      coverLayout: 'lux-framed',
      productGridStyle: 'classic-editorial',
      showDimensionsVisual: true,
      showFragrances: true,
      showColorSwatches: true,
      currencySymbol: '$',
    },
    sampleFragrances: [
      'Laurel Imperial & Cedro Real',
      'Champán Dorado & Bayas Silvestres',
      'Café Bourbon & Vainilla de Éxito',
      'Ámbar Cálido & Maderas Nobles',
      'Té Blanco & Bergamota Triunfal',
    ],
    sampleColors: [
      { name: 'Azul Marino Imperial', hex: '#112240' },
      { name: 'Oro Champán', hex: '#C59E47' },
      { name: 'Granate Honor', hex: '#7E1C30' },
      { name: 'Blanco Diploma', hex: '#F8F9FA' },
      { name: 'Negro Ébano Mate', hex: '#1E232B' },
    ],
  },
  eventos_religiosos: {
    id: 'eventos_religiosos',
    name: 'Eventos Religiosos & Sacramentos',
    badge: '🕊️ Eventos Religiosos & Fe',
    category: 'eventos',
    description: 'Atmósfera de paz y devoción en blanco marfil, resplandor en pan de oro y fragancias sagradas de incienso, mirra y loto.',
    defaultTitle: 'LUZ SAGRADA & SACRAMENTOS',
    defaultSubtitle: 'Cirios & Velas Artesanales para Bautizos, Comuniones y Bodas',
    defaultCoverImage: 'https://images.unsplash.com/photo-1697926156905-c4fcd0504936?auto=format&fit=crop&w=1200&q=80',
    theme: {
      season: 'eventos_religiosos',
      palette: {
        primary: '#38322C', // Bronce Sacro / Café Cálido
        secondary: '#C9A050', // Pan de Oro Sacramental
        accent: '#6E8170', // Verde Olivo de Paz
        background: '#FAF8F4', // Marfil Alabastro
        cardBackground: '#FFFFFF',
        textPrimary: '#221D1A',
        textSecondary: '#615B54',
        border: '#E7E2D8',
      },
      fontFamily: 'editorial',
      coverLayout: 'minimal-editorial',
      productGridStyle: 'classic-editorial',
      showDimensionsVisual: true,
      showFragrances: true,
      showColorSwatches: true,
      currencySymbol: '$',
    },
    sampleFragrances: [
      'Incienso Místico & Mirra Antigua',
      'Cera Pura de Abejas & Miel Sagrada',
      'Flor de Loto & Sándalo Sereno',
      'Madera de Olivo & Lirio Blanco',
      'Azahar & Jazmín Celestial',
    ],
    sampleColors: [
      { name: 'Blanco Sacramento', hex: '#FFFFFF' },
      { name: 'Pan de Oro Sacro', hex: '#C9A050' },
      { name: 'Cera de Abeja Natural', hex: '#F3E5C8' },
      { name: 'Verde Olivo Sagrado', hex: '#6E8170' },
      { name: 'Marfil Catedral', hex: '#F7F2E7' },
    ],
  },
  otono: {
    id: 'otono',
    name: 'Otoño & Cosecha',
    badge: '🍂 Otoño Cálido',
    category: 'temporadas',
    description: 'Calidez envolvente en terracotas, ámbar y especias tostadas para momentos acogedores.',
    defaultTitle: 'CALIDEZ DE OTOÑO',
    defaultSubtitle: 'Velas Esculpidas & Aromas Especiados',
    defaultCoverImage: 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=1200&q=80',
    theme: {
      season: 'otono',
      palette: {
        primary: '#934B28', // Terracota cálida
        secondary: '#C87D38', // Ámbar miel
        accent: '#475338', // Verde musgo
        background: '#FAF6EE', // Papel pergamino
        cardBackground: '#FFFFFF',
        textPrimary: '#261C14',
        textSecondary: '#665444',
        border: '#E6DCC8',
      },
      fontFamily: 'editorial',
      coverLayout: 'minimal-editorial',
      productGridStyle: 'classic-editorial',
      showDimensionsVisual: true,
      showFragrances: true,
      showColorSwatches: true,
      currencySymbol: '$',
    },
    sampleFragrances: [
      'Calabaza Especiada & Vainilla',
      'Higo Maduro & Madera Tostada',
      'Café Avellana & Caramelo',
      'Hojas Secas & Humo de Roble',
    ],
    sampleColors: [
      { name: 'Terracota Rust', hex: '#934B28' },
      { name: 'Ámbar Cálido', hex: '#C87D38' },
      { name: 'Mostaza Suave', hex: '#D4A03D' },
      { name: 'Verde Musgo', hex: '#475338' },
      { name: 'Café Caramelo', hex: '#583822' },
    ],
  },
  minimalista: {
    id: 'minimalista',
    name: 'Editorial Botánico & Minimalista',
    badge: '🌿 Atemporal / Editorial',
    category: 'estilo',
    description: 'Estética nórdica limpia como revista de diseño, inspirada en materias primas naturales.',
    defaultTitle: 'GAOS BOTÁNICA',
    defaultSubtitle: 'Velas de Cera de Soya & Aceites Botánicos',
    defaultCoverImage: 'https://images.unsplash.com/photo-1570823635306-250abb06d4b3?auto=format&fit=crop&w=1200&q=80',
    theme: {
      season: 'minimalista',
      palette: {
        primary: '#2B332B', // Verde oliva oscuro
        secondary: '#697A6B', // Salvia natural
        accent: '#9A825B', // Tierra dorada
        background: '#F7F5F0', // Lino crudo editorial
        cardBackground: '#FFFFFF',
        textPrimary: '#1E211E',
        textSecondary: '#5C635C',
        border: '#E2DED6',
      },
      fontFamily: 'editorial',
      coverLayout: 'minimal-editorial',
      productGridStyle: 'classic-editorial',
      showDimensionsVisual: true,
      showFragrances: true,
      showColorSwatches: true,
      currencySymbol: '$',
    },
    sampleFragrances: [
      'Sándalo Australiano & Sal Marina',
      'Eucalipto Silvestre & Romero',
      'Té Blanco & Bergamota',
      'Copaiba & Flor de Algodón',
    ],
    sampleColors: [
      { name: 'Cera Natural', hex: '#F6F3EB' },
      { name: 'Salvia Herbal', hex: '#697A6B' },
      { name: 'Arcilla Beige', hex: '#D6C8B8' },
      { name: 'Gris Grafito', hex: '#3E423E' },
    ],
  },
  personalizado: {
    id: 'personalizado',
    name: 'Personalizado',
    badge: '✨ Mi Propio Estilo',
    category: 'estilo',
    description: 'Diseño libre con colores y tipografía a tu medida.',
    defaultTitle: 'CATÁLOGO DE PRODUCTOS',
    defaultSubtitle: 'Velas Artesanales Exclusivas',
    defaultCoverImage: 'https://images.unsplash.com/photo-1770924673746-8db86d424148?auto=format&fit=crop&w=1200&q=80',
    theme: {
      season: 'personalizado',
      palette: {
        primary: '#1F2937',
        secondary: '#4B5563',
        accent: '#D97706',
        background: '#F9FAFB',
        cardBackground: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#4B5563',
        border: '#E5E7EB',
      },
      fontFamily: 'editorial',
      coverLayout: 'minimal-editorial',
      productGridStyle: 'classic-editorial',
      showDimensionsVisual: true,
      showFragrances: true,
      showColorSwatches: true,
      currencySymbol: '$',
    },
    sampleFragrances: ['Aroma a Elección'],
    sampleColors: [{ name: 'Personalizado', hex: '#333333' }],
  },
};
