/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import {
  AuthenticationCreds,
  AuthenticationState,
  BufferJSON,
  initAuthCreds,
  SignalDataTypeMap,
} from '@whiskeysockets/baileys';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { WaAuthCreds } from './models/wa-auth-creds.model';
import { WaAuthState } from './models/wa-auth-state.model';

@Injectable()
export class WhatsappAuthDriver {
  private readonly waAuthCredsRepo: Repository<WaAuthCreds>;
  private readonly waAuthStateRepo: Repository<WaAuthState>;

  constructor(private readonly connection: DataSource) {
    this.waAuthCredsRepo = this.connection.getRepository(WaAuthCreds);
    this.waAuthStateRepo = this.connection.getRepository(WaAuthState);
  }

  async getAuthState(sessionId: bigint): Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
  }> {
    let creds = await this.loadCreds(sessionId);
    if (!creds) {
      creds = initAuthCreds();
      await this.persistCreds(sessionId, creds);
    }

    const state: AuthenticationState = {
      creds,
      keys: {
        get: async <T extends keyof SignalDataTypeMap>(
          type: T,
          ids: string[],
        ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
          if (ids.length === 0) return {};

          const rows = await this.waAuthStateRepo
            .createQueryBuilder('s')
            .where('s.sessionId = :sessionId', { sessionId: Number(sessionId) })
            .andWhere('s.type = :type', { type })
            .andWhere('s.keyId IN (:...ids)', { ids })
            .getMany();

          const result: { [id: string]: SignalDataTypeMap[T] } = {};
          for (const row of rows) {
            result[row.keyId] = JSON.parse(
              JSON.stringify(row.data),
              BufferJSON.reviver,
            ) as SignalDataTypeMap[T];
          }
          return result;
        },

        set: async (data: {
          [T in keyof SignalDataTypeMap]?: {
            [id: string]: SignalDataTypeMap[T] | null;
          };
        }): Promise<void> => {
          const entries = Object.entries(data) as [
            keyof SignalDataTypeMap,
            { [id: string]: SignalDataTypeMap[keyof SignalDataTypeMap] | null },
          ][];

          if (entries.length === 0) return;

          const queryRunner = this.connection.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            for (const [type, typeData] of entries) {
              for (const [keyId, value] of Object.entries(typeData)) {
                if (value == null) {
                  await queryRunner.manager.delete(WaAuthState, {
                    sessionId: Number(sessionId),
                    type,
                    keyId,
                  });
                } else {
                  await this.upsertAuthState(
                    queryRunner,
                    Number(sessionId),
                    type as string,
                    keyId,
                    value,
                  );
                }
              }
            }
            await queryRunner.commitTransaction();
          } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
          } finally {
            await queryRunner.release();
          }
        },
      },
    };

    return {
      state,
      saveCreds: () => this.persistCreds(sessionId, state.creds),
    };
  }

  private async loadCreds(
    sessionId: bigint,
  ): Promise<AuthenticationCreds | null> {
    const row = await this.waAuthCredsRepo.findOne({
      where: { sessionId: Number(sessionId) },
    });
    if (!row) return null;
    return JSON.parse(
      JSON.stringify(row.data),
      BufferJSON.reviver,
    ) as AuthenticationCreds;
  }

  private async persistCreds(
    sessionId: bigint,
    creds: AuthenticationCreds,
  ): Promise<void> {
    const serialized = JSON.stringify(creds, BufferJSON.replacer);
    await this.connection.query(
      `INSERT INTO wa_auth_creds (session_id, data, created_at, updated_at)
       VALUES ($1, $2::jsonb, NOW(), NOW())
       ON CONFLICT (session_id) DO UPDATE SET data = $2::jsonb, updated_at = NOW()`,
      [Number(sessionId), serialized],
    );
  }

  async clearAuthState(sessionId: bigint): Promise<void> {
    await this.connection.query(
      'DELETE FROM wa_auth_creds WHERE session_id = $1',
      [Number(sessionId)],
    );
    await this.connection.query(
      'DELETE FROM wa_auth_state WHERE session_id = $1',
      [Number(sessionId)],
    );
  }

  private async upsertAuthState(
    queryRunner: QueryRunner,
    sessionId: number,
    type: string,
    keyId: string,
    value: unknown,
  ): Promise<void> {
    const serialized = JSON.stringify(value, BufferJSON.replacer);
    await queryRunner.query(
      `INSERT INTO wa_auth_state (session_id, type, key_id, data, created_at, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW())
       ON CONFLICT (session_id, type, key_id) DO UPDATE SET data = $4::jsonb, updated_at = NOW()`,
      [sessionId, type, keyId, serialized],
    );
  }
}
