const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
import logger from '../utils/logger';

interface RequestOptions extends RequestInit {
  retry?: number;
  timeout?: number;
}

function getStoredTokens() {
  return {
    accessToken: localStorage.getItem('lab_access_token'),
    refreshToken: localStorage.getItem('lab_refresh_token'),
  };
}

export function setTokens({ accessToken, refreshToken }: { accessToken?: string; refreshToken?: string }) {
  if (accessToken) localStorage.setItem('lab_access_token', accessToken);
  if (refreshToken) localStorage.setItem('lab_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('lab_access_token');
  localStorage.removeItem('lab_refresh_token');
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const tokens = getStoredTokens();
    if (!tokens.refreshToken) return false;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data?.accessToken) {
      setTokens({ accessToken: data.accessToken });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function request(path: string, opts: RequestOptions = {}) {
  const url = `${API_BASE}/${path.replace(/^\/+/, '')}`;
  const tokens = getStoredTokens();
  const maxRetries = opts.retry ?? 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(opts.headers as Record<string, string> || {}),
      };

      if (tokens.accessToken) {
        headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }

      const controller = new AbortController();
      const timeout = opts.timeout || 30000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        ...opts,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

      if (res.status === 401 && attempt < maxRetries) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          const newTokens = getStoredTokens();
          headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
          continue;
        }
        clearTokens();
        const error = new Error('Unauthorized. Please login again.');
        (error as any).status = 401;
        throw error;
      }

      if (!res.ok) {
        const error = new Error(data?.message || res.statusText || 'API error');
        (error as any).status = res.status;
        (error as any).body = data;
        try { logger.error(error); } catch {}
        throw error;
      }

      return data;
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
}

export default {
  API_BASE,
  request,
  setTokens,
  clearTokens,
};
