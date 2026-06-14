import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DolarController } from './dolar.controller';
import { DolarService } from './dolar.service';
import { DolarApiProvider } from './providers/dolar-api.provider';
import { BluelyticsProvider } from './providers/bluelytics.provider';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [DolarController],
  providers: [DolarService, DolarApiProvider, BluelyticsProvider],
  exports: [DolarService],
})
export class DolarModule {}
