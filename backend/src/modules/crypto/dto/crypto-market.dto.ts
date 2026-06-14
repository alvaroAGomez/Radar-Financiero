import { IsString, IsNumber } from 'class-validator';

export class CryptoMarketDto {
  @IsString()
  id: string;

  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @IsString()
  image: string;

  @IsNumber()
  priceUsd: number;

  @IsNumber()
  priceArs: number;

  @IsNumber()
  change24h: number;

  @IsString()
  lastUpdated: string;

  sparkline?: number[];
}
