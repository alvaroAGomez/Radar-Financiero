export interface DolarRate {
  compra: number;
  venta: number;
  variacion?: number; // porcentaje vs cierre anterior
  fechaActualizacion?: string; // ISO timestamp
}

export interface DolarRates {
  oficial: DolarRate;
  blue: DolarRate;
  mep: DolarRate;
  ccl: DolarRate;
  tarjeta: DolarRate;
}

export interface DolarPayload {
  rates: DolarRates;
  brecha: number;          // % gap blue vs oficial
  ultimaActualizacion: string;
  isStale?: boolean;       // true si los datos son de caché antigua
}
