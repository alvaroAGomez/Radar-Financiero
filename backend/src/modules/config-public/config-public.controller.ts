import { Controller, Get } from '@nestjs/common';
import { ConfigPublicService } from './config-public.service';
import { PublicConfigDto } from './dto/public-config.dto';

/**
 * Expone variables de entorno seleccionadas al cliente Angular.
 * Solo se exponen valores seguros (URLs públicas), NUNCA secrets.
 * Ruta: GET /api/config
 */
@Controller('api/config')
export class ConfigPublicController {
  constructor(private readonly configPublicService: ConfigPublicService) {}

  @Get()
  getPublicConfig(): PublicConfigDto {
    return this.configPublicService.getPublicConfig();
  }
}
