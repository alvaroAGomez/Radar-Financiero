export interface CryptoRate {
  id: string;            // e.g. 'bitcoin'
  symbol: string;        // e.g. 'BTC'
  name: string;          // e.g. 'Bitcoin'
  priceUsd: number;
  change24h: number;     // porcentaje
  icon?: string;         // material symbol name
  sparkline?: number[];
  ultimaActualizacion?: string;
}

export interface CryptoPayload {
  cryptos: CryptoRate[];
  ultimaActualizacion: string;
  isStale?: boolean;
}
