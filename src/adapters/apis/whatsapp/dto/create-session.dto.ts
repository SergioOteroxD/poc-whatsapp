import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    example: '573001234567',
    description: 'Número de teléfono con código de país',
  })
  @IsString()
  @Length(7, 20)
  phoneNumber!: string;
}
