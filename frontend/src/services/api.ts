const BASE = '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401 && token) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getToken()}`;
      const retry = await fetch(`${BASE}${endpoint}`, { ...options, headers });
      return retry.json();
    }
    clearTokens();
    window.location.reload();
  }

  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ── Auth ──

export const authApi = {
  register: (body: { email: string; password: string; firstName: string; lastName: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  logout: () => {
    const refreshToken = getRefreshToken();
    return request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// ── User ──

export const userApi = {
  getProfile: () => request('/users/me'),
  updateProfile: (body: Record<string, any>) =>
    request('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
  getGoals: () => request('/users/me/goals'),
  updateGoals: (body: Record<string, any>) =>
    request('/users/me/goals', { method: 'PUT', body: JSON.stringify(body) }),
  getCalculations: () => request('/users/me/goals/calculated'),
};

// ── Foods ──

export const foodApi = {
  search: (query = '', page = 1, limit = 20) =>
    request(`/foods?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
  getById: (id: string) => request(`/foods/${id}`),
  create: (body: Record<string, any>) =>
    request('/foods', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, any>) =>
    request(`/foods/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request(`/foods/${id}`, { method: 'DELETE' }),
};

// ── Meals ──

export const mealApi = {
  getAll: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return request(`/meals?${params.toString()}`);
  },
  getById: (id: string) => request(`/meals/${id}`),
  create: (body: Record<string, any>) =>
    request('/meals', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id: string) => request(`/meals/${id}`, { method: 'DELETE' }),
  addEntry: (mealId: string, body: Record<string, any>) =>
    request(`/meals/${mealId}/entries`, { method: 'POST', body: JSON.stringify(body) }),
  updateEntry: (mealId: string, entryId: string, body: Record<string, any>) =>
    request(`/meals/${mealId}/entries/${entryId}`, { method: 'PUT', body: JSON.stringify(body) }),
  removeEntry: (mealId: string, entryId: string) =>
    request(`/meals/${mealId}/entries/${entryId}`, { method: 'DELETE' }),
};

// ── Exercises ──

export const exerciseApi = {
  search: (query = '', category = '', page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (query) params.set('query', query);
    if (category) params.set('category', category);
    return request(`/exercises?${params.toString()}`);
  },
  getById: (id: string) => request(`/exercises/${id}`),
  create: (body: Record<string, any>) =>
    request('/exercises', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, any>) =>
    request(`/exercises/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request(`/exercises/${id}`, { method: 'DELETE' }),
};

// ── Workouts ──

export const workoutApi = {
  getAll: (startDate?: string, endDate?: string, workoutType?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (workoutType) params.set('workoutType', workoutType);
    return request(`/workouts?${params.toString()}`);
  },
  getById: (id: string) => request(`/workouts/${id}`),
  create: (body: Record<string, any>) =>
    request('/workouts', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id: string) => request(`/workouts/${id}`, { method: 'DELETE' }),
  addEntry: (workoutId: string, body: Record<string, any>) =>
    request(`/workouts/${workoutId}/entries`, { method: 'POST', body: JSON.stringify(body) }),
  updateEntry: (workoutId: string, entryId: string, body: Record<string, any>) =>
    request(`/workouts/${workoutId}/entries/${entryId}`, { method: 'PUT', body: JSON.stringify(body) }),
  removeEntry: (workoutId: string, entryId: string) =>
    request(`/workouts/${workoutId}/entries/${entryId}`, { method: 'DELETE' }),
};

// ── Progress ──

export const progressApi = {
  getAll: (page = 1, limit = 20) => request(`/progress?page=${page}&limit=${limit}`),
  getStats: () => request('/progress/stats'),
  getById: (id: string) => request(`/progress/${id}`),
  create: (body: Record<string, any>) =>
    request('/progress', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Record<string, any>) =>
    request(`/progress/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request(`/progress/${id}`, { method: 'DELETE' }),
};

// ── Dashboard ──

export const dashboardApi = {
  getToday: () => request('/dashboard/today'),
  getWeekly: () => request('/dashboard/weekly'),
  getDate: (date: string) => request(`/dashboard/${date}`),
};
