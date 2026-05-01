import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: '573001234567@s.whatsapp.net',
    description: 'JID de WhatsApp del destinatario',
  })
  @IsString()
  jid: string;

  @ApiProperty({ example: 'Hola desde BizzChat!', description: 'Texto del mensaje' })
  @IsString()
  @MinLength(1)
  message: string;
}
