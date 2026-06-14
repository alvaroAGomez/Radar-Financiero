import { IsString, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MarketInstrument {
  @IsString()
  symbol: string; // e.g. 'AAPL', 'MELI'

  @IsString()
  name: string; // e.g. 'Apple Inc.'

  @IsNumber()
  price: number; // in ARS or USD depending on panel

  @IsNumber()
  change: number; // 24h percentage change e.g. 1.25

  @IsNumber()
  volume: number; // daily volume

  @IsBoolean()
  isCedear: boolean;
}

export class MarketSummaryDto {
  @ValidateNested({ each: true })
  @Type(() => MarketInstrument)
  gainers: MarketInstrument[];

  @ValidateNested({ each: true })
  @Type(() => MarketInstrument)
  losers: MarketInstrument[];

  @ValidateNested({ each: true })
  @Type(() => MarketInstrument)
  etfs: MarketInstrument[];

  @IsString()
  lastUpdated: string;
}
