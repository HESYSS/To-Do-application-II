import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Edit2,
  LogOut,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react';
import {
  clearAuth,
  deleteCategory,
  deleteTask,
  fetchCategories,
  fetchTasks,
  getToken,
  getUserName,
  login,
  persistAuth,
  register,
  saveCategory,
  saveTask
} from './api';
import type { Category, Task } from './types';

const emptyTask: Task = { title: '', description: '', completed: false };

export function App() {
  const [token, setToken] = useState(() => getToken());

  if (!token) {
    return <AuthScreen onAuthenticated={setToken} />;
  }

  return <TaskScreen onLogout={() => {
    clearAuth();
    setToken(null);
  }} />;
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = mode === 'login'
        ? await login(email, password)
        : await register(name || 'Demo User', email, password);
      persistAuth(response);
      onAuthenticated(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <section className="surface p-4 p-md-5">
              <div className="mb-4">
                <div className="brand-mark mb-3"><Check size={24} /></div>
                <h1 className="h2 fw-bold mb-2">To-Do Workspace</h1>
                <p className="text-secondary mb-0">Sign in to manage tasks, categories, filters, and due dates.</p>
              </div>

              <div className="btn-group w-100 mb-4" role="group" aria-label="Authentication mode">
                <button type="button" className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMode('login')}>Log in</button>
                <button type="button" className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setMode('register')}>Register</button>
              </div>

              <form onSubmit={handleSubmit}>
                {mode === 'register' ? (
                  <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="name">Name</label>
                    <input id="name" className="form-control" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                  </div>
                ) : null}
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="email">Email</label>
                  <input id="email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold" htmlFor="password">Password</label>
                  <input id="password" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
                </div>
                {error ? <div className="alert alert-danger py-2">{error}</div> : null}
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function TaskScreen({ onLogout }: { onLogout: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState<Task>(emptyTask);
  const [categoryDraft, setCategoryDraft] = useState<Category>({ name: '', color: '#2563eb' });
  const [editingCategoryId, setEditingCategoryId] = useState<number>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [completed, setCompleted] = useState('');
  const [loading, setLoading] = useState(false);

  const size = 8;
  const selectedCategoryId = useMemo(() => categoryId ? Number(categoryId) : undefined, [categoryId]);

  const loadCategories = useCallback(async () => {
    setCategories(await fetchCategories());
  }, []);

  const loadTasks = useCallback(async (nextPage = page, overrides?: {
    search?: string;
    categoryId?: number | null;
    completed?: string;
  }) => {
    setLoading(true);
    try {
      const result = await fetchTasks({
        page: nextPage,
        size,
        search: overrides?.search ?? search,
        categoryId: overrides && 'categoryId' in overrides ? overrides.categoryId ?? undefined : selectedCategoryId,
        completed: overrides?.completed ?? completed
      });
      setTasks(result.content);
      setPage(result.number);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } finally {
      setLoading(false);
    }
  }, [completed, page, search, selectedCategoryId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadTasks(0);
  }, [completed, selectedCategoryId]);

  async function handleSaveTask(event: FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    await saveTask({ ...draft, categoryId: draft.categoryId || undefined });
    setDraft(emptyTask);
    await loadTasks(0);
  }

  async function handleToggleTask(task: Task) {
    await saveTask({ ...task, completed: !task.completed });
    await loadTasks();
  }

  async function handleDeleteTask(task: Task) {
    if (!task.id) return;
    await deleteTask(task.id);
    await loadTasks(tasks.length === 1 ? Math.max(page - 1, 0) : page);
  }

  async function handleSaveCategory(event: FormEvent) {
    event.preventDefault();
    if (!categoryDraft.name.trim()) return;
    await saveCategory({ ...categoryDraft, id: editingCategoryId });
    setCategoryDraft({ name: '', color: '#2563eb' });
    setEditingCategoryId(undefined);
    await loadCategories();
  }

  async function handleDeleteCategory(category: Category) {
    if (!category.id) return;
    await deleteCategory(category.id);
    const wasSelected = categoryId === String(category.id);
    if (wasSelected) setCategoryId('');
    await loadCategories();
    await loadTasks(0, wasSelected ? { categoryId: null } : undefined);
  }

  function clearFilters() {
    setSearch('');
    setCategoryId('');
    setCompleted('');
    void loadTasks(0, { search: '', categoryId: null, completed: '' });
  }

  return (
    <main className="app-shell">
      <nav className="bg-white border-bottom">
        <div className="container py-3 d-flex align-items-center justify-content-between gap-3">
          <div>
            <h1 className="h4 fw-bold mb-0">My To-Do</h1>
            <div className="small text-secondary">Signed in as {getUserName()}</div>
          </div>
          <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" type="button" onClick={onLogout}>
            <LogOut size={17} /> Log out
          </button>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-4">
          <aside className="col-12 col-lg-4">
            <section className="surface p-4 mb-4">
              <h2 className="h5 fw-bold mb-3">{draft.id ? 'Edit task' : 'Create task'}</h2>
              <form onSubmit={handleSaveTask}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="title">Title</label>
                  <input id="title" className="form-control" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="description">Description</label>
                  <textarea id="description" className="form-control" rows={3} value={draft.description ?? ''} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold" htmlFor="dueDate">Due date</label>
                    <input id="dueDate" className="form-control" type="date" value={draft.dueDate ?? ''} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold" htmlFor="taskCategory">Category</label>
                    <select id="taskCategory" className="form-select" value={draft.categoryId ?? ''} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value ? Number(event.target.value) : undefined })}>
                      <option value="">No category</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-check mb-4">
                  <input id="taskCompleted" className="form-check-input" type="checkbox" checked={draft.completed} onChange={(event) => setDraft({ ...draft, completed: event.target.checked })} />
                  <label className="form-check-label" htmlFor="taskCompleted">Completed</label>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary flex-grow-1 d-inline-flex justify-content-center align-items-center gap-2" type="submit">
                    <Plus size={17} /> {draft.id ? 'Save changes' : 'Add task'}
                  </button>
                  {draft.id ? <button className="btn btn-outline-secondary" type="button" onClick={() => setDraft(emptyTask)}>Cancel</button> : null}
                </div>
              </form>
            </section>

            <section className="surface p-4">
              <h2 className="h5 fw-bold mb-3">Categories</h2>
              <form className="d-flex gap-2 mb-3" onSubmit={handleSaveCategory}>
                <input className="form-control" placeholder="Category name" value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} />
                <input className="form-control form-control-color" type="color" value={categoryDraft.color} onChange={(event) => setCategoryDraft({ ...categoryDraft, color: event.target.value })} aria-label="Category color" />
                <button className="btn btn-primary" type="submit">{editingCategoryId ? 'Save' : 'Add'}</button>
              </form>
              <div className="d-grid gap-2">
                {categories.map((category) => (
                  <div className="d-flex align-items-center justify-content-between gap-2" key={category.id}>
                    <span className="d-flex align-items-center gap-2 text-truncate">
                      <span className="category-dot" style={{ background: category.color }} />
                      <span className="text-truncate">{category.name}</span>
                    </span>
                    <span className="d-flex gap-1">
                      <button className="icon-btn" type="button" title="Edit category" onClick={() => {
                        setCategoryDraft({ name: category.name, color: category.color });
                        setEditingCategoryId(category.id);
                      }}><Edit2 size={16} /></button>
                      <button className="icon-btn" type="button" title="Delete category" onClick={() => void handleDeleteCategory(category)}><Trash2 size={16} /></button>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="col-12 col-lg-8">
            <div className="surface p-4">
              <div className="row g-3 align-items-end mb-4">
                <div className="col-12 col-md-5">
                  <label className="form-label fw-semibold" htmlFor="search">Search</label>
                  <input id="search" className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => {
                    if (event.key === 'Enter') void loadTasks(0);
                  }} placeholder="Title or description" />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label fw-semibold" htmlFor="filterCategory">Category</label>
                  <select id="filterCategory" className="form-select" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                    <option value="">All</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div className="col-6 col-md-2">
                  <label className="form-label fw-semibold" htmlFor="status">Status</label>
                  <select id="status" className="form-select" value={completed} onChange={(event) => setCompleted(event.target.value)}>
                    <option value="">All</option>
                    <option value="false">Active</option>
                    <option value="true">Done</option>
                  </select>
                </div>
                <div className="col-12 col-md-2 d-flex gap-2">
                  <button className="btn btn-primary w-100 d-inline-flex justify-content-center align-items-center gap-2" type="button" onClick={() => void loadTasks(0)}>
                    <Search size={16} /> Find
                  </button>
                  <button className="btn btn-outline-secondary" type="button" title="Clear filters" onClick={clearFilters}><X size={17} /></button>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-2">
                <h2 className="h5 fw-bold mb-0">Tasks</h2>
                <span className="text-secondary small">{totalElements} total</span>
              </div>

              {loading ? <div className="text-secondary py-4">Loading tasks...</div> : null}
              {!loading && tasks.length === 0 ? <div className="text-secondary py-4">No tasks found.</div> : null}

              {tasks.map((task) => (
                <article className="task-row" key={task.id}>
                  <button className="icon-btn" type="button" title="Toggle task" onClick={() => void handleToggleTask(task)}>
                    {task.completed ? <Check size={18} /> : null}
                  </button>
                  <div className="min-w-0">
                    <div className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</div>
                    {task.description ? <p className="text-secondary mb-2">{task.description}</p> : null}
                    <div className="d-flex flex-wrap gap-3 small text-secondary">
                      {task.dueDate ? <span>Due {task.dueDate}</span> : null}
                      {task.categoryName ? (
                        <span className="d-flex align-items-center gap-2">
                          <span className="category-dot" style={{ background: task.categoryColor }} />{task.categoryName}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="task-actions d-flex gap-2">
                    <button className="icon-btn" type="button" title="Edit task" onClick={() => setDraft({ ...task })}><Edit2 size={16} /></button>
                    <button className="icon-btn" type="button" title="Delete task" onClick={() => void handleDeleteTask(task)}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}

              {totalPages > 1 ? (
                <div className="d-flex align-items-center justify-content-between mt-4">
                  <button className="btn btn-outline-secondary" type="button" disabled={page === 0} onClick={() => void loadTasks(page - 1)}>Previous</button>
                  <span className="small text-secondary">Page {page + 1} of {totalPages}</span>
                  <button className="btn btn-outline-secondary" type="button" disabled={page + 1 >= totalPages} onClick={() => void loadTasks(page + 1)}>Next</button>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
