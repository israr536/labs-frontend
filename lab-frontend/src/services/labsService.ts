import { request } from './api';
import { DEFAULT_SETTINGS, type LabSettings } from '../data/samples';

export function getSettings() {
  return request('lab/settings').then(mapLabSettings);
}

export function updateSettings(body: Partial<LabSettings>) {
  return request('lab/settings', {
    method: 'PATCH',
    body: JSON.stringify({
      name: body.labName,
      mobile: body.phone,
      email: body.email,
      address: body.address,
    }),
  }).then((data) => mapLabSettings(data, body));
}

function mapLabSettings(data: any, previous?: Partial<LabSettings>): LabSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...previous,
    labName: data?.name ?? previous?.labName ?? DEFAULT_SETTINGS.labName,
    address: data?.address ?? previous?.address ?? DEFAULT_SETTINGS.address,
    phone: data?.mobile ?? previous?.phone ?? DEFAULT_SETTINGS.phone,
    email: data?.email ?? previous?.email ?? DEFAULT_SETTINGS.email,
  };
}

export default { getSettings, updateSettings };
