export interface IWaAuthState {
  id: number;
  sessionId: number;
  type: string;
  keyId: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
