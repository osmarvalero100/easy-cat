export type SeasonKey = 
  | 'navidad' 
  | 'amor_amistad' 
  | 'madres' 
  | 'baby_shower'
  | 'graduaciones'
  | 'eventos_religiosos'
  | 'otono' 
  | 'minimalista' 
  | 'personalizado';

export interface CandleColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  currency: string;
  description: string;
  heightCm: number;
  widthCm: number;
  fragrances: string[];
  colors: CandleColor[];
  includes?: string[];
  image: string;
  burnTimeHours?: number;
  waxType?: string;
  isSeasonalSpecial?: boolean;
  sortOrder?: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

export interface ThemeConfig {
  season: SeasonKey;
  palette: ThemeColors;
  fontFamily: 'editorial' | 'serif' | 'modern';
  coverLayout: 'minimal-editorial' | 'botanical-split' | 'lux-framed';
  productGridStyle: 'classic-editorial' | 'modern-magazine' | 'compact-cards';
  showDimensionsVisual: boolean;
  showFragrances: boolean;
  showColorSwatches: boolean;
  showIncludes?: boolean;
  currencySymbol: string;
}

export interface CustomSocialLink {
  id: string;
  name: string;
  url: string;
}

export interface ContactInfo {
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  pinterest?: string;
  website?: string;
  customSocials?: CustomSocialLink[];
  location?: string;
  deliveryNotes?: string;
}

export interface Project {
  id: string;
  userId: number;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  defaultCurrency?: string;
  defaultContact?: ContactInfo;
  createdAt?: string;
  updatedAt?: string;
  catalogCount?: number;
}

export interface Catalog {
  id: string;
  projectId: string;
  userId?: number;
  slug: string;
  title: string;
  subtitle: string;
  seasonTag: string;
  editionYear: string;
  brandName: string;
  brandLogo?: string;
  coverImage: string;
  introText: string;
  featuredSectionTitle?: string;
  regularSectionTitle?: string;
  footerText?: string;
  products: Product[];
  theme: ThemeConfig;
  contact: ContactInfo;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  createdAt?: string;
}

export type AIProvider = 'openai' | 'gemini' | 'anthropic' | 'openrouter';

export interface UserAISettings {
  id?: number;
  userId: number;
  provider: AIProvider;
  apiKey: string;
  modelName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
