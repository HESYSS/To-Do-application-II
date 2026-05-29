export interface AuthResponse {
  token: string;
  email: string;
  name: string;
}

export interface Category {
  id?: number;
  name: string;
  color: string;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  createdAt?: string;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
