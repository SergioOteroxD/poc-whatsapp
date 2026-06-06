import { EAuthCollaboratorRole } from '../../../commons/enum/auth/collaborator-role.enum';
import { EAuthCollaboratorStatus } from '../../../commons/enum/auth/collaborator-status.enum';

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

export interface IcreateCollaborator {
  tenantId: number;
  executorRole: EAuthCollaboratorRole;
  email: string;
  name: string;
  password: string;
  role: EAuthCollaboratorRole;
}

export interface IcollaboratorPublic {
  id: number;
  tenantId: number;
  email: string;
  name: string;
  role: EAuthCollaboratorRole;
  status: EAuthCollaboratorStatus;
  createdAt: Date;
  updatedAt: Date;
}
