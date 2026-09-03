const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
import logger from '../utils/logger';

interface RequestOptions extends RequestInit {
  retry?: number;
  timeout?: number;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function getStoredTokens() {
  return {
    accessToken: localStorage.getItem('lab_access_token'),
    refreshToken: localStorage.getItem('lab_refresh_token'),
  };
}

export function setTokens(tokens: { accessToken?: string; refreshToken?: string }) {
  if (tokens.accessToken) localStorage.setItem('lab_access_token', tokens.accessToken);
  if (tokens.refreshToken) localStorage.setItem('lab_refresh_token', tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('lab_access_token');
  localStorage.removeItem('lab_refresh_token');
}

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;
    const data = await response.json();
    if (!data?.accessToken || !data?.refreshToken) return false;

    setTokens(data);
    return true;
  } catch {
    return false;
  }
}

function buildHeaders(options: RequestInit): Headers {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const { accessToken } = getStoredTokens();
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  return headers;
}

function isRetryableMethod(method?: string) {
  return ['GET', 'HEAD', 'OPTIONS'].includes((method ?? 'GET').toUpperCase());
}

async function fetchWithAuth(path: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let response = await fetch(`${API_BASE}/${path.replace(/^\/+/, '')}`, {
      ...options,
      headers: buildHeaders(options),
      signal: controller.signal,
    });

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        response = await fetch(`${API_BASE}/${path.replace(/^\/+/, '')}`, {
          ...options,
          headers: buildHeaders(options),
          signal: controller.signal,
        });
      }

      if (response.status === 401) {
        clearTokens();
        throw new ApiError('Unauthorized. Please login again.', 401);
      }
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const maxRetries = options.retry ?? (isRetryableMethod(method) ? 1 : 0);
  const timeout = options.timeout ?? 30000;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetchWithAuth(path, options, timeout);
      const data = await parseResponse(response);

      if (!response.ok) {
        const message = typeof data === 'object' && data && 'message' in data
          ? String((data as { message?: unknown }).message)
          : response.statusText || 'API request failed';
        const error = new ApiError(message, response.status, data);
        try { logger.error(error); } catch { /* logging must never break requests */ }
        throw error;
      }

      return data as T;
    } catch (error) {
      if (attempt >= maxRetries || error instanceof ApiError || !isRetryableMethod(method)) {
        throw error;
      }
    }
  }

  throw new Error('API request failed');
}

export async function requestBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
  const method = (options.method ?? 'GET').toUpperCase();
  const response = await fetchWithAuth(path, options, options.timeout ?? 60000);

  if (!response.ok) {
    const data = await parseResponse(response);
    const message = typeof data === 'object' && data && 'message' in data
      ? String((data as { message?: unknown }).message)
      : response.statusText || 'API request failed';
    throw new ApiError(message, response.status, data);
  }

  if (method !== 'GET') throw new Error('Blob requests currently support GET only');
  return response.blob();
}

export { API_BASE };
export default { API_BASE, request, requestBlob, setTokens, clearTokens };
