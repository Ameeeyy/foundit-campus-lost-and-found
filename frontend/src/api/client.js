const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

export const api = {
  health: () => request('/health'),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  getListings: (params = {}) => request(`/listings?${new URLSearchParams(params).toString()}`),
  getListing: (id) => request(`/listings/${id}`),
  createListing: (payload) => request('/listings', { method: 'POST', body: JSON.stringify(payload) }),
  getDashboard: () => request('/listings/dashboard'),
  getMatches: (id) => request(`/listings/${id}/matches`),
  submitClaim: (payload) => request('/claims', { method: 'POST', body: JSON.stringify(payload) }),
  getClaims: () => request('/claims'),
  reviewClaim: (id, payload) => request(`/claims/${id}/review`, { method: 'PATCH', body: JSON.stringify(payload) }),
  confirmReturn: (payload) => request('/claims/confirm-return', { method: 'POST', body: JSON.stringify(payload) }),
  getNotifications: () => request('/notifications'),
  markNotificationsRead: () => request('/notifications/read', { method: 'PATCH' }),
};
