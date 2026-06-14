// ---- Cauciones ----
export interface CaucionesData {
  min: number;
  avg: number;
  max: number;
  lastClose: number;
  plazo: string; // e.g. '1 día', '7 días'
  ultimaActualizacion?: string;
}

// ---- CEDEARs / Mercado USA ----
export interface MarketAsset {
  ticker: string;        // e.g. 'NVDA', 'TSLA'
  nombre?: string;
  variacion: number;     // % change
  precio: number;
  tipo: 'CEDEAR' | 'USA' | 'INDEX' | 'LOCAL';
}

export interface MarketData {
  topGainers: MarketAsset[];
  topLosers: MarketAsset[];
  etfs?: MarketAsset[];
  ultimaActualizacion?: string;
}

// ---- Radar de Oportunidades ----
export type OpportunityType = 'caucion' | 'arbitraje' | 'dividendo' | 'alerta' | 'news';

export interface RadarOpportunity {
  id: string;
  tipo: OpportunityType;
  titulo: string;
  descripcion: string;
  timestamp: string;      // ISO
  prioridad: 'alta' | 'media' | 'baja';
  icon?: string;          // emoji or material symbol
}

// ---- Dashboard All Payload ----
export interface DashboardPayload {
  dolar: import('./dolar.model').DolarPayload | null;
  cryptos: import('./crypto.model').CryptoPayload;
  cauciones: CaucionesData;
  market: MarketData | null;
  radar: RadarOpportunity[];
  serverTime: string;
  isStale?: boolean;
}
