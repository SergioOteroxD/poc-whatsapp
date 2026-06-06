import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { EWhatsappWebhookEvent } from '../../../../commons/enum/whatsapp/whatsapp-webhook-event.enum';

export class CreateWebhookDto {
  @ApiProperty({
    example: 'https://mi-servidor.com/webhook',
    description: 'URL que recibirá los eventos vía POST',
  })
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiPropertyOptional({
    example: 'mi-secreto-hmac',
    description: 'Secreto para firma HMAC-SHA256 en la cabecera X-Webhook-Signature',
  })
  @IsOptional()
  @IsString()
  @Length(8, 255)
  secret?: string;

  @ApiProperty({
    enum: EWhatsappWebhookEvent,
    isArray: true,
    example: [EWhatsappWebhookEvent.MESSAGE_RECEIVED],
    description: 'Eventos que disparará este webhook',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(EWhatsappWebhookEvent, { each: true })
  events!: EWhatsappWebhookEvent[];
}
