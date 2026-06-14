import { Controller, Get } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketSummaryDto } from './dto/market-summary.dto';
import { CaucionRateDto } from './dto/caucion-rate.dto';

@Controller('api/market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('summary')
  async getSummary(): Promise<MarketSummaryDto> {
    return this.marketService.getSummary();
  }

  @Get('cauciones')
  async getCauciones(): Promise<CaucionRateDto[]> {
    return this.marketService.getCauciones();
  }
}
