import { IsString, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DolarRate {
  @IsNumber()
  compra: number;

  @IsNumber()
  venta: number;

  @IsString()
  fecha: string;
}

export class DolarResponseDto {
  @ValidateNested()
  @Type(() => DolarRate)
  oficial: DolarRate;

  @ValidateNested()
  @Type(() => DolarRate)
  blue: DolarRate;

  @ValidateNested()
  @Type(() => DolarRate)
  mep: DolarRate;

  @ValidateNested()
  @Type(() => DolarRate)
  ccl: DolarRate;

  @ValidateNested()
  @Type(() => DolarRate)
  tarjeta: DolarRate;

  @IsString()
  lastUpdated: string;

  @IsString()
  source: string;

  @IsBoolean()
  stale: boolean;
}
