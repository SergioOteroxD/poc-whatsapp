import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralUtils } from '../../../commons/utils/general.util';
import { ResponseBase } from './response-base.model';
import type { IresponseBase } from './response-base.model';

export interface ImetaResponse {
  readonly traceId: string;
  readonly requestId?: string;
}

/**
 * Clase que contiene metadatos de trazabilidad de la petición HTTP
 */
export class MetaResponse implements ImetaResponse {
  @ApiProperty({
    description:
      'ID de trazabilidad único para seguimiento de la petición en logs',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  readonly traceId!: string;

  @ApiPropertyOptional({
    description: 'ID de la petición HTTP (opcional)',
    example: 'req-123456',
    required: false,
  })
  readonly requestId?: string;
}

export interface IresponseHttp<T = any> extends IresponseBase<T> {
  meta: ImetaResponse;
  status: HttpStatus;
}

/**
 * Clase de respuesta HTTP que envuelve ResponseBase/ResponseQuery y agrega metadatos de trazabilidad
 */
export class ResponseHttp implements IresponseHttp {
  @ApiProperty({
    description: 'Código de respuesta interno del sistema',
    example: 'CREATED',
  })
  code!: string;

  @ApiProperty({
    description: 'Mensaje descriptivo de la operación realizada',
    example: 'Recurso creado exitosamente',
  })
  message!: string;

  @ApiProperty({
    description: 'Código de estado HTTP de la respuesta',
    example: 201,
    enum: HttpStatus,
  })
  status: HttpStatus;

  @ApiProperty({
    description: 'Metadatos de trazabilidad de la petición',
  })
  meta: ImetaResponse;

  constructor(
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    result: IresponseBase = new ResponseBase(),
  ) {
    this.meta = { traceId: GeneralUtils.getTraceId };
    this.status = status;
    this.result = result;
  }

  /**
   *
   */
  public set result(result: IresponseBase) {
    Object.assign(this, result);
  }
}
