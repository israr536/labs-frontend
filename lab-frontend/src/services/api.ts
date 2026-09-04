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
  return { accessToken: localStorage.getItem('lab_access_token') };
}

export function setTokens(tokens: { accessToken?: string }) {
  if (tokens.accessToken) localStorage.setItem('lab_access_token', tokens.accessToken);
}

export function clearTokens() {
  localStorage.removeItem('lab_access_token');
  // Remove the legacy refresh token if an older deployment stored one.
  localStorage.removeItem('lab_refresh_token');
}

// Refresh tokens are now HttpOnly cookies. The single-flight lock prevents
// concurrent 401 responses from racing the server's one-time token rotation.
let refreshInFlight: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) return false;
      const data = await response.json();
      if (!data?.accessToken) return false;

      setTokens({ accessToken: data.accessToken });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
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
  const url = `${API_BASE}/${path.replace(/^\/+/, '')}`;

  const performFetch = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    let callerAbortHandler: (() => void) | undefined;

    if (options.signal) {
      if (options.signal.aborted) controller.abort(options.signal.reason);
      else {
        callerAbortHandler = () => controller.abort(options.signal?.reason);
        options.signal.addEventListener('abort', callerAbortHandler, { once: true });
      }
    }

    try {
      return await fetch(url, {
        ...options,
        credentials: options.credentials ?? 'include',
        headers: buildHeaders(options),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
      if (callerAbortHandler) options.signal?.removeEventListener('abort', callerAbortHandler);
    }
  };

  let response = await performFetch();

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await performFetch();
    }

    if (response.status === 401) {
      clearTokens();
      throw new ApiError('Unauthorized. Please login again.', 401);
    }
  }

  return response;
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
        try {
          logger.error(error);
        } catch {
          // Logging must never break requests.
        }
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
  if (method !== 'GET') throw new Error('Blob requests currently support GET only');

  const response = await fetchWithAuth(path, options, options.timeout ?? 60000);

  if (!response.ok) {
    const data = await parseResponse(response);
    const message = typeof data === 'object' && data && 'message' in data
      ? String((data as { message?: unknown }).message)
      : response.statusText || 'API request failed';
    throw new ApiError(message, response.status, data);
  }

  return response.blob();
}

export { API_BASE };
export default { API_BASE, request, requestBlob, setTokens, clearTokens };
