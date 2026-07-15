import { authStorage } from './auth'

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = await authStorage.getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { headers, ...options })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    signup: (email: string, password: string, name?: string) =>
      request<{ token: string; user: any }>('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
    me: () => request<{ user: any }>('/auth/me'),
  },

  searchCards: (q: string, sport?: string) =>
    request<any[]>(`/search?q=${encodeURIComponent(q)}${sport ? `&sport=${sport}` : ''}`),

  getCard: (id: string) => request<any>(`/cards/${id}`),
  getCardEbayListings: (id: string) => request<any[]>(`/cards/${id}/ebay`),
  refreshEbayListings: (id: string) =>
    request<any[]>(`/cards/${id}/ebay/refresh`, { method: 'POST' }),
  getCardGrades: (id: string) => request<any[]>(`/cards/${id}/grades`),
  getGradeAnalysis: (id: string) => request<any>(`/cards/${id}/grade-analysis`),
  getCardsBySet: (setId: string) => request<any[]>(`/cards/set/${setId}`),
  upsertCard: (data: any) =>
    request<any>('/cards/upsert', { method: 'POST', body: JSON.stringify(data) }),

  getBinders: () => request<any[]>('/binders'),
  getBinder: (id: string) => request<any>(`/binders/${id}`),
  createBinder: (data: { name: string; description?: string }) =>
    request<any>('/binders', { method: 'POST', body: JSON.stringify(data) }),
  addCardToBinder: (binderId: string, cardId: string, data?: any) =>
    request<any>(`/binders/${binderId}/cards`, { method: 'POST', body: JSON.stringify({ cardId, ...data }) }),
  removeCardFromBinder: (binderId: string, cardId: string) =>
    request<any>(`/binders/${binderId}/cards/${cardId}`, { method: 'DELETE' }),
  getBinderValue: (id: string) =>
    request<{ total: number; cardCount: number }>(`/binders/${id}/value`),
  updateBinderItem: (itemId: string, data: any) =>
    request<any>(`/binders/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  identifyByImage: (image: string) =>
    request<any>('/identify/image', { method: 'POST', body: JSON.stringify({ image }) }),
  identifyByText: (text: string) =>
    request<any>('/identify/text', { method: 'POST', body: JSON.stringify({ text }) }),
  identifyBySetNumber: (setName: string, cardNumber: string) =>
    request<any>('/identify/set-number', { method: 'POST', body: JSON.stringify({ setName, cardNumber }) }),
}
