import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IcollaboratorContext } from '../../core/auth/entity/collaborator.entity';

export const CollaboratorContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IcollaboratorContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<Record<string, IcollaboratorContext>>();
    return request['collaboratorContext'];
  },
);
