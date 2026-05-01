export interface IWaAuthCreds {
  id: number;
  sessionId: number;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
