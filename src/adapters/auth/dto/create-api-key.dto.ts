import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { EAuthApikeyScope } from '../../../commons/enum/auth/apikey-scope.enum';

export class CreateApiKeyDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  tenantId!: number;

  @ApiProperty({ example: 'Production key' })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiPropertyOptional({
    enum: EAuthApikeyScope,
    isArray: true,
    example: [
      EAuthApikeyScope.SESSION_SEND_MESSAGE,
      EAuthApikeyScope.SESSION_READ,
    ],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EAuthApikeyScope, { each: true })
  scopes?: EAuthApikeyScope[];
}
