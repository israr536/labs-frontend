import { request } from './api';

export type ContactInquiry = {
  name: string;
  email: string;
  topic: 'support' | 'onboarding' | 'sales' | 'feedback';
  message: string;
};

export function submitContactInquiry(body: ContactInquiry) {
  return request<{ success: boolean; inquiryId: string; createdAt: string }>('contact/inquiries', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
