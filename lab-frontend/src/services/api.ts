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
    const { refreshToken } = getStoredTokens();
    if (!refreshToken) return false;

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    if (!data?.accessToken || !data?.refreshToken) return false;

    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  } catch {
    return false;
  }
}

export async function request(path: string, opts: RequestOptions = {}) {
  const url = `${API_BASE}/${path.replace(/^\/+/, '')}`;
  const maxRetries = opts.retry ?? 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const tokens = getStoredTokens();
      const headers = new Headers(opts.headers);
      if (!headers.has('Content-Type') && opts.body) headers.set('Content-Type', 'application/json');
      if (tokens.accessToken) headers.set('Authorization', `Bearer ${tokens.accessToken}`);

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), opts.timeout ?? 30000);
      const res = await fetch(url, { ...opts, headers, signal: controller.signal });

      if (res.status === 401 && attempt < maxRetries) {
        const refreshed = await refreshAccessToken();
        if (refreshed) continue;
        clearTokens();
        const error = new Error('Unauthorized. Please login again.');
        (error as any).status = 401;
        throw error;
      }

      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }

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
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}

export default { API_BASE, request, setTokens, clearTokens };
