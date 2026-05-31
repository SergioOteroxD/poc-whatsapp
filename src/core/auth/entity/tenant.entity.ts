import { EAuthTenantStatus } from '../../../commons/enum/auth/tenant-status.enum';

export interface ITenant {
  id: number;
  name: string;
  email: string;
  status: EAuthTenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItenantFilter {
  page?: number;
  limit?: number;
}

export interface IcreateTenant {
  name: string;
  email: string;
  referenceId: string;
}
