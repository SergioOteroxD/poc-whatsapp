import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @ApiProperty({ example: 1, description: 'ID del tenant' })
  @IsNumber()
  @Type(() => Number)
  tenantId: number;

  @ApiProperty({ example: '573001234567', description: 'Número de teléfono con código de país' })
  @IsString()
  @Length(7, 20)
  phoneNumber: string;
}
