import { IresponseCode } from './response-code.interface';

export class CustomException {
  public details?: any;

  constructor(
    public readonly error: IresponseCode,
    public readonly context: string,
    public readonly type: 'Business' | 'Technical',
    details?: any,
  ) {
    this.details = details;
  }
}
