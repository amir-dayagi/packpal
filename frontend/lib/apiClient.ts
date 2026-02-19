"use client"

import { createClient } from '@/lib/supabase/client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest(endpoint: string, options: RequestInit = {}, isStream = false) {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 3. Execute fetch
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Global error handling
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'API Request Failed');
  }

  return isStream ? response : await response.json();
}

export const apiClient = {
  get: (url: string) => apiRequest(url, { method: 'GET' }),
  post: (url: string, body: any) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: any) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url: string) => apiRequest(url, { method: 'DELETE' }),
  stream: (url: string, body: any) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }, true),
};