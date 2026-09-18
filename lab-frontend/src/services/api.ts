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
  if (tokens.accessToken) {
    localStorage.setItem('lab_access_token', tokens.accessToken);
    scheduleTokenExpiry(tokens.accessToken);
  }
}

let tokenExpiryTimer: number | undefined;

export function clearTokens() {
  localStorage.removeItem('lab_access_token');
  // Remove the legacy refresh token if an older deployment stored one.
  localStorage.removeItem('lab_refresh_token');
  if (tokenExpiryTimer !== undefined) window.clearTimeout(tokenExpiryTimer);
  tokenExpiryTimer = undefined;
}

function notifyAuthExpired() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('lab:auth-expired'));
}

function scheduleTokenExpiry(token: string) {
  if (typeof window === 'undefined') return;
  if (tokenExpiryTimer !== undefined) window.clearTimeout(tokenExpiryTimer);
  try {
    const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const expiresAt = Number(payload.exp) * 1000;
    if (!Number.isFinite(expiresAt)) return;
    const delay = Math.max(0, expiresAt - Date.now());
    tokenExpiryTimer = window.setTimeout(() => {
      if (getStoredTokens().accessToken !== token) return;
      clearTokens();
      notifyAuthExpired();
    }, delay);
  } catch {
    // If a token cannot be decoded, the server-side 401 path still logs out safely.
  }
}

const initialAccessToken = localStorage.getItem('lab_access_token');
if (initialAccessToken) scheduleTokenExpiry(initialAccessToken);

// The loader tracks one logical request, not every internal fetch/retry.
// This prevents token refreshes and retry attempts from making the loader flicker.
let activeApiRequests = 0;
function emitApiActivity(type: 'start' | 'end') {
  if (typeof window === 'undefined') return;
  if (type === 'start') activeApiRequests += 1;
  else activeApiRequests = Math.max(0, activeApiRequests - 1);
  window.dispatchEvent(new CustomEvent('lab:api-activity', { detail: { active: activeApiRequests } }));
}

// Refresh tokens are now HttpOnly cookies. The single-flight lock prevents
// concurrent 401 responses from racing the server's one-time token rotation.
let refreshInFlight: Promise<boolean> | null = null;
const REFRESH_LOCK_KEY = 'lab_refresh_lock';
const REFRESH_LOCK_TTL_MS = 8000;
const REFRESH_WAIT_TIMEOUT_MS = 10000;

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

async function waitForAnotherTabToRefresh(initialAccessToken: string | null) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < REFRESH_WAIT_TIMEOUT_MS) {
    if (getStoredTokens().accessToken !== initialAccessToken) return true;
    await sleep(100);
    const lock = localStorage.getItem(REFRESH_LOCK_KEY);
    if (!lock) return false;
    try {
      if (JSON.parse(lock).expiresAt <= Date.now()) return false;
    } catch {
      return false;
    }
  }
  return getStoredTokens().accessToken !== initialAccessToken;
}

function refreshAccessToken(initialAccessToken: string | null): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const owner = Math.random().toString(36).slice(2, 12);
    try {
      const existingLock = localStorage.getItem(REFRESH_LOCK_KEY);
      if (existingLock) {
        try {
          const lock = JSON.parse(existingLock) as { expiresAt?: number };
          if (lock.expiresAt && lock.expiresAt > Date.now()) return waitForAnotherTabToRefresh(initialAccessToken);
        } catch {
          // Replace malformed stale locks.
        }
      }
      localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ owner, expiresAt: Date.now() + REFRESH_LOCK_TTL_MS }));
      try {
        const acquired = JSON.parse(localStorage.getItem(REFRESH_LOCK_KEY) ?? '{}') as { owner?: string; expiresAt?: number };
        if (acquired.owner !== owner) return waitForAnotherTabToRefresh(initialAccessToken);
      } catch {
        return waitForAnotherTabToRefresh(initialAccessToken);
      }
      if (getStoredTokens().accessToken !== initialAccessToken) return true;
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
      try {
        const lock = JSON.parse(localStorage.getItem(REFRESH_LOCK_KEY) ?? '{}') as { owner?: string };
        if (lock.owner === owner) localStorage.removeItem(REFRESH_LOCK_KEY);
      } catch {
        localStorage.removeItem(REFRESH_LOCK_KEY);
      }
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
  const accessTokenAtStart = getStoredTokens().accessToken;

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
    let retriedWithNewToken = false;
    if (getStoredTokens().accessToken !== accessTokenAtStart) {
      response = await performFetch();
      retriedWithNewToken = true;
    }
    const refreshed = response.ok ? true : await refreshAccessToken(accessTokenAtStart);
    if (refreshed && !retriedWithNewToken) {
      response = await performFetch();
    }

    if (response.status === 401) {
      clearTokens();
      notifyAuthExpired();
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
  emitApiActivity('start');

  try {
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
  } finally {
    emitApiActivity('end');
  }
}

export async function requestBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
  const method = (options.method ?? 'GET').toUpperCase();
  if (method !== 'GET') throw new Error('Blob requests currently support GET only');
  emitApiActivity('start');

  try {
    const response = await fetchWithAuth(path, options, options.timeout ?? 60000);

    if (!response.ok) {
      const data = await parseResponse(response);
      const message = typeof data === 'object' && data && 'message' in data
        ? String((data as { message?: unknown }).message)
        : response.statusText || 'API request failed';
      throw new ApiError(message, response.status, data);
    }

    return response.blob();
  } finally {
    emitApiActivity('end');
  }
}

export { API_BASE };
export default { API_BASE, request, requestBlob, setTokens, clearTokens };
