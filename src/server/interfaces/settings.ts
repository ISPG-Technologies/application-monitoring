import { SMSSettingsDto, EmailSettingsDto } from '../view-models';

export interface IAppSettings {
  timezone: string;
  sms: SMSSettingsDto;
  email: EmailSettingsDto;
}
