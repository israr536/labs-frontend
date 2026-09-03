import { request, setTokens } from './api';

export async function login(body: { email: string; password: string }) {
  const data = await request('auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (data?.accessToken && data?.refreshToken) {
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  }

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
  const tokens = { refreshToken: localStorage.getItem('lab_refresh_token') };
  try {
    await request('auth/logout', { method: 'POST', body: JSON.stringify(tokens) });
  } catch (e) {
    // ignore
  }
  localStorage.removeItem('lab_access_token');
  localStorage.removeItem('lab_refresh_token');
}

export async function me() {
  return request('auth/me');
}

export default { login, logout, me, requestSignupOtp, verifySignupOtp };
