import { EAuthCollaboratorRole } from '../../../commons/enum/auth/collaborator-role.enum';

/**
 * Payload firmado dentro del JWT de un colaborador.
 * El tenantId SIEMPRE viaja dentro del token, nunca por body o query.
 */
export interface IjwtPayload {
  collaboratorId: number;
  tenantId: number;
  role: EAuthCollaboratorRole;
}

/**
 * Contexto del colaborador autenticado, expuesto a controllers tras
 * validar el JWT. Se adjunta al request por el JwtAuthGuard.
 */
export interface IcollaboratorContext {
  collaboratorId: number;
  tenantId: number;
  role: EAuthCollaboratorRole;
}
