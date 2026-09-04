import { request, setTokens, clearTokens } from './api';

export async function login(body: { email: string; password: string }) {
  const data = await request('auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (data?.accessToken) setTokens({ accessToken: data.accessToken });
  return data;
}

export async function requestSignupOtp(body: {
  labName: string;
  labCode?: string;
  mobile: string;
  email: string;
  address?: string;
  password: string;
}) {
  return request('auth/signup/request-otp', {
    method: 'POST',
    body: JSON.stringify({
      code: body.labCode || undefined,
      name: body.labName,
      mobile: body.mobile,
      email: body.email,
      address: body.address || undefined,
      admin: {
        mobile: body.mobile,
        email: body.email,
        password: body.password,
      },
    }),
  });
}

export async function verifySignupOtp(body: { requestId: string; otp: string }) {
  return request('auth/signup/verify-otp', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function logout() {
  try {
    await request('auth/logout', { method: 'POST' });
  } catch {
    // The local session should still be cleared if the server is unavailable.
  }
  clearTokens();
}

export async function me() {
  return request('auth/me');
}

export default { login, logout, me, requestSignupOtp, verifySignupOtp };
