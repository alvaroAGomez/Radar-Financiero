import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DolarService } from '../dolar/dolar.service';
import { CryptoService } from '../crypto/crypto.service';
import { MarketService } from '../market/market.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly dolarService: DolarService,
    private readonly cryptoService: CryptoService,
    private readonly marketService: MarketService
  ) {}

  // Run Cron job every 2 minutes
  @Cron('*/2 * * * *')
  async handleMarketUpdates(): Promise<void> {
    this.logger.log('Starting scheduled background update for financial quotes...');
    const startTime = Date.now();

    try {
      const results = await Promise.allSettled([
        this.dolarService.updateCache(),
        this.cryptoService.updateCache(),
        this.marketService.updateCache(),
      ]);

      const failedCount = results.filter((r) => r.status === 'rejected').length;
      const durationMs = Date.now() - startTime;

      if (failedCount > 0) {
        this.logger.warn(
          `Background updates finished in ${durationMs}ms with ${failedCount} failure(s).`
        );
        results.forEach((res, index) => {
          if (res.status === 'rejected') {
            const moduleName = ['Dolar', 'Crypto', 'Market'][index];
            this.logger.error(`Module ${moduleName} update failed:`, res.reason);
          }
        });
      } else {
        this.logger.log(`Successfully completed all background updates in ${durationMs}ms.`);
      }
    } catch (err) {
      this.logger.error('Failed to run scheduled updates:', err);
    }
  }
}
