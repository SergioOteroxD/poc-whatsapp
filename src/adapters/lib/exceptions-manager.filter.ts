/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '../../core/common/entity/custom-exception.model';
import { RESPONSE_CODE } from '../../commons/response-codes/general-codes';
import { CustomLogger } from 'src/commons/utils/logger';
import {
  IresponseHttp,
  ResponseHttp,
} from '../../core/common/entity/response-http.model';

@Catch()
export class ExceptionManager implements ExceptionFilter {
  // ...
  catch(exception, host: ArgumentsHost) {
    console.debug('ExceptionManager - exception:', exception);
    const logger = CustomLogger.getInstance();

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const result: IresponseHttp = new ResponseHttp();

    if (exception instanceof CustomException) {
      result.status = HttpStatus.BAD_GATEWAY;
    }

    if (exception instanceof HttpException) {
      if (exception.getStatus() != 500) {
        result.status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const exceptionMessage =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exceptionResponse['message'];

        result.code =
          exceptionResponse['code'] ??
          RESPONSE_CODE[result.status]?.code ??
          result.code;
        result.message =
          exceptionMessage ??
          RESPONSE_CODE[result.status]?.message ??
          result.message;

        if (result.status == HttpStatus.BAD_REQUEST)
          result.data = exceptionResponse['message'];
      }
    }

    logger.error(
      `Execution finished with exception. ${exception.message}`,
      exception,
    );
    response.status(result.status).json(result);
  }
}
