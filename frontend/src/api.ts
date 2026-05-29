import type { AuthResponse, Category, Page, Task } from './types';

const API_URL = 'http://localhost:8080/api';
const TOKEN_KEY = 'todo_token';
const NAME_KEY = 'todo_name';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserName() {
  return localStorage.getItem(NAME_KEY) ?? 'User';
}

export function persistAuth(response: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(NAME_KEY, response.name);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function register(name: string, email: string, password: string) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

export function fetchCategories() {
  return request<Category[]>('/categories');
}

export function saveCategory(category: Category) {
  return request<Category>(category.id ? `/categories/${category.id}` : '/categories', {
    method: category.id ? 'PUT' : 'POST',
    body: JSON.stringify(category)
  });
}

export function deleteCategory(id: number) {
  return request<void>(`/categories/${id}`, { method: 'DELETE' });
}

export function fetchTasks(filters: {
  page: number;
  size: number;
  search?: string;
  categoryId?: number;
  completed?: string;
}) {
  const params = new URLSearchParams({
    page: String(filters.page),
    size: String(filters.size),
    sort: 'createdAt,desc'
  });
  if (filters.search) params.set('search', filters.search);
  if (filters.categoryId) params.set('categoryId', String(filters.categoryId));
  if (filters.completed) params.set('completed', filters.completed);
  return request<Page<Task>>(`/tasks?${params.toString()}`);
}

export function saveTask(task: Task) {
  return request<Task>(task.id ? `/tasks/${task.id}` : '/tasks', {
    method: task.id ? 'PUT' : 'POST',
    body: JSON.stringify(task)
  });
}

export function deleteTask(id: number) {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' });
}
