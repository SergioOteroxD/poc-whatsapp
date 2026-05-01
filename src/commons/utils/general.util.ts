/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const rTracer = require('cls-rtracer');
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { CustomException } from '../../core/common/entity/custom-exception.model';
import { RESPONSE_CODE } from '../response-codes/general-codes';

export class GeneralUtils {
  public static get getTraceId(): string {
    return rTracer.id() || '';
  }

  public static async encryptPassword(
    password: string,
    pepper: string,
  ): Promise<string> {
    try {
      // Generamos un salt aleatorio para mejorar la seguridad
      const salt = await bcrypt.genSalt(10);

      // Concatenamos la contraseña y el pepper
      const pepperedPassword = password + pepper;

      // Encriptamos la contraseña con el salt y el pepper
      const hash = await bcrypt.hash(pepperedPassword, salt);

      // Devolvemos la contraseña encriptada
      return hash;
    } catch (error) {
      throw new CustomException(
        RESPONSE_CODE.ERROR,
        'GeneralUtils.encryptPassword',
        'Technical',
        error,
      );
    }
  }

  public static async comparePassword(
    password: string,
    hash: string,
    pepper: string,
  ): Promise<boolean> {
    // Concatenamos la contraseña y el pepper
    const pepperedPassword = password + pepper;

    // Comparamos la contraseña con su versión encriptada con el pepper
    const match = await bcrypt.compare(pepperedPassword, hash);

    // Devolvemos true si las contraseñas coinciden, false en caso contrario
    return match;
  }

  /**
   *
   * @param length
   * @returns
   */
  public static generateHash(length: number, prefix?: string): string {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if (prefix) result = prefix + result;
    return result;
  }

  /**
   *
   * @param length
   * @returns
   */
  public static generateId(length: number, prefix?: string): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if (prefix) result = prefix + result;
    return result;
  }

  static encodeBase64(str: string): string {
    return Buffer.from(str).toString('base64');
  }

  static decodeBase64(encodedStr: string): string {
    return Buffer.from(encodedStr, 'base64').toString('utf-8');
  }

  static determinarSemana(fecha: Date): number {
    const primerDiaMes: Date = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      1,
    );
    const primerDiaSemana: number = primerDiaMes.getDay(); // 0 para domingo, 1 para lunes, ..., 6 para sábado

    const dia: number = fecha.getDate();
    const semana = Math.ceil((dia + primerDiaSemana) / 7);

    return semana;
  }

  static obtenerFechasRelativas(año: number, mes: number): [Date, Date] {
    // Crear una fecha con el año y mes proporcionados por el usuario
    const fechaActual = new Date(año, mes - 1, 0, 23, 59, 59, 59); // Restamos 1 al mes porque los meses en JavaScript son base 0 (enero = 0, febrero = 1, etc.)

    // Crear una fecha con el mismo año y mes, pero un mes atrás
    const fechaAnterior = new Date(año, mes - 2, 1); // Restamos 2 al mes para obtener el mes anterior

    // Devolver ambas fechas en un arreglo
    return [fechaAnterior, fechaActual];
  }

  static kgToTon(kg: number): number {
    return kg / 1000;
  }

  static extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : type;
  }
}
