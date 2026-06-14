/**
 * Tipado de la respuesta de GET /api/config.
 * Refleja exactamente el PublicConfigDto del backend.
 */
export interface AppConfig {
  botCaucionesUrl: string;
  botDividendosUrl: string;
}
