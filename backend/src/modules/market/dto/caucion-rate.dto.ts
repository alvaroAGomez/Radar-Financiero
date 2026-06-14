import { IsString, IsNumber } from 'class-validator';

export class CaucionRateDto {
  @IsString()
  tenor: string; // e.g. '1d', '7d', '14d', '30d'

  @IsNumber()
  tasa: number; // TNA in percentage e.g. 68.5

  @IsNumber()
  monto: number; // Volume in ARS

  @IsString()
  fecha: string;
}
