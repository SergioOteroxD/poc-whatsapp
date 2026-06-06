import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class LogoutCollaboratorDto {
  @ApiProperty({
    example: 42,
    description: 'ID de la sesión activa que se desea revocar (logout)',
  })
  @IsNumber()
  @Min(1)
  sessionId!: number;
}
