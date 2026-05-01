import { HttpStatus } from '@nestjs/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RESPONSE_CODE } from '../../../commons/response-codes/general-codes';
import { Paginator } from './paginator.model';
import type { Ipaginator } from './paginator.model';
import type { IresponseCode } from './response-code.interface';

export interface IresponseBase<T = any> {
  code: string;
  message: string;
  status: HttpStatus;
  data?: T;
  pagination?: Ipaginator;
}

/**
 * Clase base para respuestas de operaciones individuales (crear, actualizar, obtener por ID)
 * @template T Tipo de datos que contiene la respuesta
 */
export class ResponseBase<T = any> implements IresponseBase<T> {
  @ApiProperty({
    description: 'Código de respuesta interno del sistema',
    example: 'CREATED',
  })
  public code!: string;

  @ApiProperty({
    description: 'Mensaje descriptivo de la operación realizada',
    example: 'Recurso creado exitosamente',
  })
  public message!: string;

  @ApiProperty({
    description: 'Código de estado HTTP de la respuesta',
    example: 201,
    type: Number,
  })
  public status!: number;

  @ApiPropertyOptional({
    description: 'Datos de la respuesta (tipo genérico según la operación)',
    required: false,
  })
  public data?: T;

  constructor(responseCode: IresponseCode = RESPONSE_CODE.ERROR, data?: T) {
    Object.assign(this, responseCode);
    this.data = data;
  }
}

/**
 * Clase base para respuestas de listados con paginación
 * @template T Tipo de datos del array que contiene la respuesta
 */
export class ResponseQuery<T = any> implements IresponseBase<T> {
  @ApiProperty({
    description: 'Código de respuesta interno del sistema',
    example: 'QUERY_OK',
  })
  public code!: string;

  @ApiProperty({
    description: 'Mensaje descriptivo de la operación realizada',
    example: 'Consulta ejecutada exitosamente',
  })
  public message!: string;

  @ApiProperty({
    description: 'Código de estado HTTP de la respuesta',
    example: 200,
    type: Number,
  })
  public status!: number;

  @ApiPropertyOptional({
    description: 'Información de paginación del listado',
    required: false,
  })
  public pagination?: Ipaginator;

  @ApiProperty({
    description:
      'Array de datos de la respuesta (tipo genérico según la operación)',
    isArray: true,
  })
  public data: T;

  constructor(
    responseCode: IresponseCode = RESPONSE_CODE.ERROR,
    data: T,
    page: number,
    limit: number,
    total: number,
  ) {
    Object.assign(this, responseCode);
    this.data = data;
    this.pagination = new Paginator(total, page, limit);
  }
}
