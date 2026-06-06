import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Token de refresco opaco emitido durante el login',
  })
  @IsString()
  @Length(1, 255)
  refreshToken!: string;
}
