/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */

const moment = require('moment-timezone');
import { DurationInputArg2, unitOfTime } from 'moment';

/**
 * Módulo con utilidades generales
 */
export class DateUtils {
  public static isFormatDateValid(date: string, format: string): boolean {
    return moment(date, format, true).isValid();
  }

  /**
   * Obtiene la fecha del último día del mes anterior
   * @param options Opciones de formato y zona horaria
   * @returns Fecha del último día del mes anterior en el formato especificado
   */
  public static getLastDayOfPreviousMonth(
    options: {
      format?:
        | 'YYYY-MM-DD'
        | 'YYYY-MM-DDTHH:mm'
        | 'YYYY-MM-DDTHH:mm:ss'
        | string;
      tz?: string;
    } = {},
  ): string {
    return moment()
      .tz(options?.tz ?? process.env.TZ ?? 'America/Bogota')
      .subtract(1, 'month') // Retrocede un mes
      .endOf('month') // Obtiene el último día de ese mes
      .format(options?.format ?? 'YYYY-MM-DD');
  }

  /**
   *
   * @param options
   * @returns
   */
  public static getDate(
    options: {
      format?:
        | 'YYYY-MM-DD'
        | 'YYYY-MM-DDTHH:mm'
        | 'YYYY-MM-DDTHH:mm:ss'
        | string;
      date?: string;
      unit?: DurationInputArg2;
      amount?: number;
      tz?: string;
    } = {
      date: moment().format(),
      unit: 'days',
      amount: 0,
      tz: process.env.TZ,
    },
  ): string {
    return moment(options?.date ?? moment().format())
      .add(options?.amount ?? 0, options?.unit ?? 'days')
      .tz(options?.tz ?? process.env.TZ ?? 'America/Bogota')
      .format(options?.format);
  }

  /**
   *
   * @param finalDate
   * @param initialDate
   * @param unitOfTime
   * @param precise
   * @returns
   */
  public static getDiff(
    finalDate: string,
    initialDate?: string,
    unitOfTime: unitOfTime.Diff = 'days',
    precise: boolean = true,
  ): number {
    const _initialDate = moment(initialDate);
    const _finalDate = moment(finalDate);

    return _finalDate.diff(_initialDate, unitOfTime, precise);
  }

  /**
   *
   * @param date
   * @returns
   */
  public static getDateTZ(date: string): any {
    if (!date) {
      return;
    }
    return DateUtils.getDate({
      date,
    });
  }
}
