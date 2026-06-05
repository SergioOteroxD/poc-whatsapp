import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { EAuthCollaboratorRole } from '../../../commons/enum/auth/collaborator-role.enum';

export class CreateCollaboratorDto {
  @ApiProperty({ description: 'Email del colaborador', example: 'agente@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nombre completo del colaborador', example: 'Juan García' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: 'Contraseña del colaborador', example: 'Str0ngP@ssw0rd', minLength: 8 })
  @IsString()
  @Length(8, 128)
  password: string;

  @ApiProperty({
    description: 'Rol asignable: admin o agent (no se permite owner)',
    enum: [EAuthCollaboratorRole.ADMIN, EAuthCollaboratorRole.AGENT],
    example: EAuthCollaboratorRole.AGENT,
  })
  @IsEnum(EAuthCollaboratorRole)
  role: EAuthCollaboratorRole;
}
