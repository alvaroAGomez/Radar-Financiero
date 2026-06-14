import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { CoinGeckoProvider } from './providers/coingecko.provider';
import { DolarModule } from '../dolar/dolar.module';

@Module({
  imports: [HttpModule, ConfigModule, DolarModule],
  controllers: [CryptoController],
  providers: [CryptoService, CoinGeckoProvider],
  exports: [CryptoService],
})
export class CryptoModule {}
