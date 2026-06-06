import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseHttp } from '../../../core/common/entity/response-http.model';
import { CreateCollaboratorUseCase } from '../../../core/auth/use-cases/create-collaborator.uc';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CollaboratorContext } from '../../decorator/collaborator-context.decorator';
import type { IcollaboratorContext } from '../../../core/auth/entity/collaborator.entity';

@ApiTags('Collaborators')
@Controller('collaborators')
export class CollaboratorController {
  constructor(
    private readonly createCollaboratorUseCase: CreateCollaboratorUseCase,
  ) {}

  @Post('collaborators')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crea un nuevo colaborador dentro del tenant (solo OWNER)',
    description:
      'Permite al colaborador con rol OWNER crear agentes o administradores en su tenant. No se puede asignar el rol OWNER.',
  })
  @ApiResponse({
    status: 201,
    description: 'Colaborador creado exitosamente.',
    schema: {
      example: {
        code: 'CREATED',
        message: 'Recurso creado exitosamente.',
        status: 201,
        data: {
          id: 7,
          tenantId: 1,
          email: 'agente@empresa.com',
          name: 'Juan García',
          role: 'agent',
          status: 'active',
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente o inválido.' })
  @ApiResponse({
    status: 403,
    description:
      'El colaborador autenticado no tiene rol OWNER, o intentó asignar rol OWNER.',
  })
  @ApiResponse({
    status: 404,
    description: 'Ya existe un colaborador con ese email en el tenant.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async createCollaborator(
    @Body() dto: CreateCollaboratorDto,
    @CollaboratorContext() ctx: IcollaboratorContext,
  ): Promise<ResponseHttp> {
    const result = await this.createCollaboratorUseCase.execute({
      tenantId: ctx.tenantId,
      executorRole: ctx.role,
      email: dto.email,
      name: dto.name,
      password: dto.password,
      role: dto.role,
    });
    return new ResponseHttp(result.status, result);
  }
}
