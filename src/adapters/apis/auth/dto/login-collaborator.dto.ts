import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, Length, Min } from 'class-validator';

export class LoginCollaboratorDto {
  @ApiProperty({ example: 1, description: 'ID del tenant al que pertenece el colaborador' })
  @IsNumber()
  @Min(1)
  tenantId!: number;

  @ApiProperty({ example: 'john@example.com', description: 'Email del colaborador' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MySecurePassword123!', description: 'Contraseña del colaborador' })
  @IsString()
  @Length(1, 255)
  password!: string;
}
