import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoMarketDto } from './dto/crypto-market.dto';

@Controller('api/crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('prices')
  async getPrices(@Query('ids') ids?: string): Promise<CryptoMarketDto[]> {
    return this.cryptoService.getPrices(ids);
  }

  @Get('search')
  async search(@Query('query') query: string): Promise<any[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Query parameter cannot be empty');
    }
    return this.cryptoService.search(query);
  }
}
