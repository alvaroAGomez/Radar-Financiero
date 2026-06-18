import { Injectable } from '@nestjs/common';

/**
 * Servicio que determina si el mercado argentino (BYMA/IOL) está operativo.
 * Horario: Lunes a Viernes de 10:30 a 17:30 (hora Argentina, UTC-3).
 */
@Injectable()
export class MarketHoursService {
  private readonly OPEN_HOUR = 10;
  private readonly OPEN_MINUTE = 30;
  private readonly CLOSE_HOUR = 17;
  private readonly CLOSE_MINUTE = 30;
  private readonly TZ = 'America/Argentina/Buenos_Aires';

  /**
   * Devuelve true si el mercado está abierto en este momento.
   */
  isMarketOpen(): boolean {
    const now = this.getNowInArgentina();
    const day = now.getDay(); // 0=Dom, 1=Lun, ..., 5=Vie, 6=Sab
    if (day === 0 || day === 6) return false; // fin de semana

    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const openAt = this.OPEN_HOUR * 60 + this.OPEN_MINUTE;
    const closeAt = this.CLOSE_HOUR * 60 + this.CLOSE_MINUTE;

    return minutesNow >= openAt && minutesNow < closeAt;
  }

  /**
   * Devuelve la fecha del próximo horario de apertura del mercado (en ISO string).
   * Útil para mostrar "Reabre a las HH:MM" en la UI.
   */
  getNextOpenTime(): Date {
    const now = this.getNowInArgentina();
    const candidate = new Date(now);

    // Intentar apertura de hoy
    candidate.setHours(this.OPEN_HOUR, this.OPEN_MINUTE, 0, 0);
    if (candidate > now && now.getDay() !== 0 && now.getDay() !== 6) {
      return candidate;
    }

    // Avanzar días hasta el próximo día hábil
    candidate.setDate(candidate.getDate() + 1);
    while (candidate.getDay() === 0 || candidate.getDay() === 6) {
      candidate.setDate(candidate.getDate() + 1);
    }
    candidate.setHours(this.OPEN_HOUR, this.OPEN_MINUTE, 0, 0);
    return candidate;
  }

  /**
   * Retorna la hora actual en Argentina como objeto Date local.
   * Técnica: convierte via toLocaleString con la timezone correcta.
   */
  private getNowInArgentina(): Date {
    const nowStr = new Date().toLocaleString('en-US', { timeZone: this.TZ });
    return new Date(nowStr);
  }
}
