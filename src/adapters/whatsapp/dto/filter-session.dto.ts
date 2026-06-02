import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { EWhatsappSessionStatus } from '../../../commons/enum/whatsapp/whatsapp-session-status.enum';

export class FilterSessionDto {
  @ApiPropertyOptional({ example: '573001234567', description: 'Número de teléfono con código de país' })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  phoneNumber?: string;

  @ApiPropertyOptional({ enum: EWhatsappSessionStatus, description: 'Estado de la sesión' })
  @IsOptional()
  @IsEnum(EWhatsappSessionStatus)
  status?: EWhatsappSessionStatus;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Número de página (base 1)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Elementos por página (máx. 100)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
