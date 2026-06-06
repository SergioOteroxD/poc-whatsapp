import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ItenantContext } from '../../core/auth/entity/api-key.entity';

export const TenantContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ItenantContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<Record<string, ItenantContext>>();
    return request['tenantContext'];
  },
);
