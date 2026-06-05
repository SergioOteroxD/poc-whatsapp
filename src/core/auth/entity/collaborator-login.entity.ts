export interface IloginCollaboratorDeviceInfo {
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  [key: string]: unknown;
}

export interface IloginCollaborator {
  tenantId: number;
  email: string;
  password: string;
  deviceInfo?: IloginCollaboratorDeviceInfo | null;
  ipAddress?: string | null;
}

export interface IloginCollaboratorResult {
  accessToken: string;
  refreshToken: string;
}
