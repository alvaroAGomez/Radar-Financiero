/**
 * DTO que define la forma exacta del objeto JSON devuelto por GET /api/config.
 * Solo contiene URLs públicas — NUNCA claves secretas ni passwords.
 */
export class PublicConfigDto {
  botCaucionesUrl: string;
  botDividendosUrl: string;
}
