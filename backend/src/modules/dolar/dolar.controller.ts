import { Controller, Get } from '@nestjs/common';
import { DolarService } from './dolar.service';
import { DolarResponseDto } from './dto/dolar-response.dto';

@Controller('api/dolar')
export class DolarController {
  constructor(private readonly dolarService: DolarService) {}

  @Get()
  async getPrices(): Promise<DolarResponseDto> {
    return this.dolarService.getPrices();
  }
}
