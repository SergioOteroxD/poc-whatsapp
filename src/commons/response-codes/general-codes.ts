import { IresponseCode } from '../../core/common/entity/response-code.interface';

export type TreponseCode =
  | '400'
  | 'QUERY_OK'
  | 'QUERY_ERROR'
  | 'NOT_FOUND'
  | 'ERROR'
  | 'EXIST'
  | 'CONFLICT'
  | 'UPDATE_OK'
  | 'CREATED'
  | 'CREATE_OK'
  | 'FORBIDDEN';

export const RESPONSE_CODE: Record<TreponseCode, IresponseCode> = {
  400: {
    code: 'BAD_REQUEST',
    message: 'Los datos de la solicitud no tienen el formato esperado.',
    status: 400,
  },
  QUERY_OK: {
    code: 'QUERY_OK',
    message: 'Consulta ejecutada correctamente.',
    status: 200,
  },
  QUERY_ERROR: {
    code: 'QUERY_ERROR',
    message: 'Error ejecutando la consulta.',
    status: 500,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'No se encontró la información solicitada.',
    status: 204,
  },
  ERROR: {
    code: 'ERROR',
    message: 'Se presentó un error interno. Por favor, intente nuevamente.',
    status: 500,
  },
  EXIST: {
    code: 'EXIST',
    message: 'Ya existe el registro que se intenta crear.',
    status: 404,
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: 'Conflicto en la operación solicitada.',
    status: 409,
  },
  UPDATE_OK: {
    code: 'UPDATE_OK',
    message: 'Actualización ejecutada correctamente.',
    status: 200,
  },
  CREATED: {
    code: 'CREATED',
    message: 'Recurso creado exitosamente.',
    status: 201,
  },
  CREATE_OK: {
    code: 'CREATE_OK',
    message: 'Recurso creado correctamente.',
    status: 201,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'No tiene permisos para realizar esta operación.',
    status: 403,
  },
};
