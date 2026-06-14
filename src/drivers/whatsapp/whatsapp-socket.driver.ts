/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Injectable, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  WAMessage,
  WASocket,
  fetchLatestBaileysVersion,
  getContentType,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';
import pino from 'pino';
import { EWhatsappMessageDirection } from '../../commons/enum/whatsapp/whatsapp-message-direction.enum';
import { EWhatsappMessageStatus } from '../../commons/enum/whatsapp/whatsapp-message-status.enum';
import { EWhatsappMessageType } from '../../commons/enum/whatsapp/whatsapp-message-type.enum';
import { EWhatsappSessionStatus } from '../../commons/enum/whatsapp/whatsapp-session-status.enum';
import { EWhatsappWebhookEvent } from '../../commons/enum/whatsapp/whatsapp-webhook-event.enum';
import { WhatsappSession } from './models/whatsapp-session.model';
import { WhatsappAuthDriver } from './whatsapp-auth.driver';
import { WhatsappMessageDriver } from './whatsapp-message.driver';
import { WhatsappSessionDriver } from './whatsapp-session.driver';
import { WhatsappWebhookDriver } from './whatsapp-webhook.driver';
import { randomInt } from 'crypto';

@Injectable()
export class WhatsappSocketDriver implements OnModuleInit {
  private readonly sockets = new Map<number, WASocket>();
  private readonly logger = pino({ level: 'silent' });

  constructor(
    private readonly authDriver: WhatsappAuthDriver,
    private readonly sessionDriver: WhatsappSessionDriver,
    private readonly messageDriver: WhatsappMessageDriver,
    private readonly webhookDriver: WhatsappWebhookDriver,
  ) {}

  async onModuleInit(): Promise<void> {
    const sessions = await this.sessionDriver.findAllConnected();
    await Promise.allSettled(sessions.map((s) => this.restoreSocket(s)));
  }

  private async restoreSocket(session: WhatsappSession): Promise<void> {
    const sessionId = Number(session.id);

    const onQR = async (): Promise<void> => {
      // Las creds guardadas expiraron — el usuario deberá escanear de nuevo
      await this.sessionDriver.updateStatus(
        sessionId,
        EWhatsappSessionStatus.DISCONNECTED,
        { disconnectReason: 'session_expired' },
      );
    };

    const onFatal = (err: Error): void => {
      void this.sessionDriver.updateStatus(
        sessionId,
        EWhatsappSessionStatus.DISCONNECTED,
        { disconnectReason: err.message },
      );
    };

    void this.spawnSocket(session, onQR, onFatal).catch(onFatal);
  }

  async initSocket(session: WhatsappSession): Promise<string> {
    this.closeExisting(Number(session.id));
    await this.authDriver.clearAuthState(BigInt(session.id));
    await this.sessionDriver.updateStatus(
      Number(session.id),
      EWhatsappSessionStatus.CONNECTING,
    );

    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.closeExisting(Number(session.id));
        reject(new Error('Timeout esperando QR (60s)'));
      }, 60_000);

      let settled = false;

      const onQR = async (qr: string): Promise<void> => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try {
          const buffer = await QRCode.toBuffer(qr);
          resolve(buffer.toString('base64'));
        } catch (e) {
          reject(e as Error);
        }
      };

      const onFatal = (err: Error): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      };

      void this.spawnSocket(session, onQR, onFatal).catch(onFatal);
    });
  }

  // Crea el socket y lo reabre en desconexiones temporales (incluyendo el cierre
  // natural que ocurre justo después de escanear el QR).
  private async spawnSocket(
    session: WhatsappSession,
    onQR: (qr: string) => Promise<void>,
    onFatal: (err: Error) => void,
  ): Promise<void> {
    const { state, saveCreds } = await this.authDriver.getAuthState(
      BigInt(session.id),
    );
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: this.logger,
      browser: Browsers.ubuntu('Chrome'),
    });

    const sessionId = Number(session.id);
    this.sockets.set(sessionId, sock);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on(
      'connection.update',
      async ({ qr, connection, lastDisconnect }) => {
        if (qr) {
          void onQR(qr);
          return;
        }

        if (connection === 'open') {
          await this.sessionDriver.updateStatus(
            sessionId,
            EWhatsappSessionStatus.CONNECTED,
            {
              lastConnectedAt: new Date(),
              disconnectReason: null,
            },
          );
          return;
        }

        if (connection === 'close') {
          this.sockets.delete(sessionId);

          const statusCode = (lastDisconnect?.error as Boom)?.output
            ?.statusCode;
          const isLoggedOut = statusCode === DisconnectReason.loggedOut;
          const isForbidden = statusCode === DisconnectReason.forbidden;

          if (isLoggedOut || isForbidden) {
            await this.sessionDriver.updateStatus(
              sessionId,
              isLoggedOut
                ? EWhatsappSessionStatus.LOGGED_OUT
                : EWhatsappSessionStatus.DISCONNECTED,
              { disconnectReason: String(statusCode) },
            );
            onFatal(
              new Error(
                `Sesión cerrada permanentemente: código ${String(statusCode)}`,
              ),
            );
            return;
          }

          // Desconexión temporal: reconectar. Esto cubre el cierre que hace
          // Baileys justo después de escanear el QR antes de abrir la sesión autenticada.
          await this.sessionDriver.updateStatus(
            sessionId,
            EWhatsappSessionStatus.CONNECTING,
            {
              disconnectReason: null,
            },
          );
          void this.spawnSocket(session, onQR, onFatal).catch(onFatal);
        }
      },
    );

    sock.ev.on('messages.upsert', ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        if (!msg.key.remoteJid || !msg.key.id) continue;
        void this.handleIncomingMessage(sessionId, msg).catch(() => {});
      }
    });
  }

  private async handleIncomingMessage(
    sessionId: number,
    msg: WAMessage,
  ): Promise<void> {
    const fromMe = msg.key.fromMe ?? false;
    const contentType = getContentType(msg.message ?? {});
    const messageType = this.mapMessageType(contentType);
    const body = this.extractBody(msg.message ?? null);

    if (fromMe) return;

    const saved = await this.messageDriver.saveIfNotExists({
      sessionId,
      waMessageId: msg.key.id!,
      remoteJid: msg.key.remoteJid!,
      fromMe,
      participant: msg.key.participant ?? null,
      direction: fromMe
        ? EWhatsappMessageDirection.OUTBOUND
        : EWhatsappMessageDirection.INBOUND,
      messageType,
      status: fromMe
        ? EWhatsappMessageStatus.SENT
        : EWhatsappMessageStatus.DELIVERED,
      body,
      rawPayload: msg as unknown as Record<string, unknown>,
      timestampWa: new Date(Number(msg.messageTimestamp ?? 0) * 1000),
    });

    const webhooks = await this.webhookDriver.findActiveBySessionAndEvent(
      sessionId,
      EWhatsappWebhookEvent.MESSAGE_RECEIVED,
    );

    if (webhooks.length === 0) return;

    const payload: Record<string, unknown> = {
      event: EWhatsappWebhookEvent.MESSAGE_RECEIVED,
      sessionId,
      messageId: saved.id,
      remoteJid: saved.remoteJid,
      participant: saved.participant,
      messageType: saved.messageType,
      body: saved.body,
      jid: saved.remoteJid,
      message: saved.body,
      timestamp: saved.timestampWa,
    };

    await Promise.allSettled(
      webhooks.map((wh) =>
        this.webhookDriver.dispatch(
          wh,
          saved.id,
          EWhatsappWebhookEvent.MESSAGE_RECEIVED,
          payload,
        ),
      ),
    );
  }

  private mapMessageType(
    contentType: ReturnType<typeof getContentType> | undefined,
  ): EWhatsappMessageType {
    switch (contentType) {
      case 'imageMessage':
        return EWhatsappMessageType.IMAGE;
      case 'videoMessage':
        return EWhatsappMessageType.VIDEO;
      case 'audioMessage':
        return EWhatsappMessageType.AUDIO;
      case 'documentMessage':
        return EWhatsappMessageType.DOCUMENT;
      case 'stickerMessage':
        return EWhatsappMessageType.STICKER;
      case 'locationMessage':
        return EWhatsappMessageType.LOCATION;
      case 'reactionMessage':
        return EWhatsappMessageType.REACTION;
      case 'pollCreationMessage':
        return EWhatsappMessageType.POLL;
      default:
        return EWhatsappMessageType.TEXT;
    }
  }

  private extractBody(message: WAMessage['message']): string | null {
    if (!message) return null;
    return (
      message.conversation ??
      message.extendedTextMessage?.text ??
      message.imageMessage?.caption ??
      message.videoMessage?.caption ??
      message.documentMessage?.caption ??
      null
    );
  }

  private closeExisting(sessionId: number): void {
    const existing = this.sockets.get(sessionId);
    if (existing) {
      existing.end(undefined);
      this.sockets.delete(sessionId);
    }
  }

  async sendMessage(
    sessionId: number,
    jid: string,
    text: string,
  ): Promise<void> {
    const sock = this.sockets.get(Number(sessionId));
    if (!sock) {
      throw new Error(`No hay socket activo para la sesión ${sessionId}`);
    }

    await sock.presenceSubscribe(jid);
    await sock.sendPresenceUpdate('composing', jid);
    await new Promise((resolve) => setTimeout(resolve, randomInt(1000, 5000)));
    await sock.sendPresenceUpdate('paused', jid);

    await sock.sendMessage(jid, { text });
  }

  isConnected(sessionId: number): boolean {
    return this.sockets.has(sessionId);
  }
}
