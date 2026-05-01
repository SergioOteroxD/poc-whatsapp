/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { GeneralUtils } from '../../commons/utils/general.util';
import { CustomLogger } from 'src/commons/utils/logger';
import { IresponseHttp } from '../../core/common/entity/response-http.model';

/**
 * Intercepta todas la solicitudes http que llegen al servicio para formatear la respuesta
 */
@Injectable()
export class RequestHttpInterceptor implements NestInterceptor<IresponseHttp> {
  private readonly logger = CustomLogger.getInstance();

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IresponseHttp> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;

    const requestMetada = {
      requestIp: req?.headers?.['X-Forwarded-For'] ?? req?.headers?.['host'],
      requestAgent:
        req?.headers?.['User-Agent'] ?? req?.headers?.['user-agent'],
    };

    //Inicia traza
    const traceId = GeneralUtils.getTraceId;

    // Set tracing data
    // Set tracing data
    this.logger.setTracerLog({
      traceId,
      requestData: { url, method },
      requestMetada,
    });

    return next.handle().pipe(
      tap((_result: IresponseHttp) => {
        const { status, code } = _result;
        context.switchToHttp().getResponse().status(status);
        this.logger.info('Execution finished.', { code, status });
      }),
    );
  }
}
