import { request, setTokens, clearTokens } from './api';

export interface AuthUser { id: string; username: string; email: string; mobile: string; role: 'ADMIN' | 'RECEPTIONIST' | 'TECHNICIAN' | 'PATHOLOGIST'; isActive: boolean; }
export interface AuthSession { user: AuthUser; lab: Record<string, unknown>; accessToken: string; expiresIn: number; }
export interface SignupOtpResponse { requestId: string; expiresAt: string; delivery: string; devOtp?: string; }
export interface SignupCompleteResponse { success: boolean; user: AuthUser; lab: Record<string, unknown>; message: string; }
export interface PasswordResetOtpResponse { requestId: string; expiresAt: string; message: string; devOtp?: string; }
export interface PasswordResetVerifyResponse { requestId: string; resetToken: string; expiresAt: string; }

export async function login(body: { email: string; password: string }) {
  const data = await request<Omit<AuthSession, 'refreshToken'>>('auth/login', { method: 'POST', body: JSON.stringify(body) });
  if (data?.accessToken) setTokens({ accessToken: data.accessToken });
  return data;
}
export function requestSignupOtp(body: { labName: string; labCode?: string; mobile: string; email: string; address?: string; password: string }) { return request<SignupOtpResponse>('auth/signup/request-otp', { method: 'POST', body: JSON.stringify({ code: body.labCode || undefined, name: body.labName, mobile: body.mobile, email: body.email, address: body.address || undefined, admin: { mobile: body.mobile, email: body.email, password: body.password } }) }); }
export function resendSignupOtp(requestId: string) { return request<SignupOtpResponse>('auth/signup/resend-otp', { method: 'POST', body: JSON.stringify({ requestId }) }); }
export async function verifySignupOtp(body: { requestId: string; otp: string }) { const data = await request<SignupCompleteResponse & { accessToken?: string }>('auth/signup/verify-otp', { method: 'POST', body: JSON.stringify(body) }); if (data?.accessToken) setTokens({ accessToken: data.accessToken }); return data; }
export function requestPasswordResetOtp(body: { mobile: string }) { return request<PasswordResetOtpResponse>('auth/forgot-password/request-otp', { method: 'POST', body: JSON.stringify(body) }); }
export function resendPasswordResetOtp(requestId: string) { return request<PasswordResetOtpResponse>('auth/forgot-password/resend-otp', { method: 'POST', body: JSON.stringify({ requestId }) }); }
export function verifyPasswordResetOtp(body: { requestId: string; otp: string }) { return request<PasswordResetVerifyResponse>('auth/forgot-password/verify-otp', { method: 'POST', body: JSON.stringify(body) }); }
export function resetPassword(body: { requestId: string; resetToken: string; password: string }) { return request<{ success: boolean; message: string }>('auth/forgot-password/reset', { method: 'POST', body: JSON.stringify(body) }); }
export async function logout() { try { await request('auth/logout', { method: 'POST' }); } catch {} clearTokens(); }
export function me() { return request<{ user: AuthUser; lab: Record<string, unknown> }>('auth/me'); }

export default { login, logout, me, requestSignupOtp, resendSignupOtp, verifySignupOtp, requestPasswordResetOtp, resendPasswordResetOtp, verifyPasswordResetOtp, resetPassword };
