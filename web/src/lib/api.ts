import type { Event, CreateEventPayload, UpdateEventPayload } from '../types/event';

// Reason: Using relative path so nginx proxy handles routing in production
// and vite dev server proxy handles it in development.
const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('em_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  /**
   * Generic fetch wrapper that throws on non-2xx responses.
   * Automatically injects the JWT bearer token if present.
   *
   * Args:
   *   path (string): API path relative to /api.
   *   options (RequestInit): Fetch options.
   *
   * Returns:
   *   Promise<T>: Parsed JSON response.
   */
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export const eventsApi = {
  list: (status?: string): Promise<Event[]> => {
    const qs = status ? `?status=${status}` : '';
    return request<Event[]>(`/events${qs}`);
  },

  get: (id: string): Promise<Event> =>
    request<Event>(`/events/${id}`),

  create: (payload: CreateEventPayload): Promise<Event> =>
    request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateEventPayload): Promise<Event> =>
    request<Event>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: string): Promise<void> =>
    request<void>(`/events/${id}`, { method: 'DELETE' }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  signup: (name: string, email: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (): Promise<AuthUser> =>
    request<AuthUser>('/auth/me'),
};

// ─── CMS ──────────────────────────────────────────────────────────────────────

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface CmsPost {
  id: string;
  title: string;
  content: string;
  category: string | null;
  status: PostStatus;
  authorId: string | null;
  author: AuthUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCmsPostPayload {
  title: string;
  content: string;
  category?: string;
  status?: PostStatus;
}

export const cmsApi = {
  list: (): Promise<CmsPost[]> =>
    request<CmsPost[]>('/cms/posts'),

  get: (id: string): Promise<CmsPost> =>
    request<CmsPost>(`/cms/posts/${id}`),

  create: (payload: CreateCmsPostPayload): Promise<CmsPost> =>
    request<CmsPost>('/cms/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<CreateCmsPostPayload>): Promise<CmsPost> =>
    request<CmsPost>(`/cms/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  remove: (id: string): Promise<void> =>
    request<void>(`/cms/posts/${id}`, { method: 'DELETE' }),
};
