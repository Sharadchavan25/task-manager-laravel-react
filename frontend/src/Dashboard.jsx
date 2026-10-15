
import { useCallback, useEffect, useState } from 'react'
import api from './api'
import './App.css'

const emptyForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
}

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [formData, setFormData] = useState({ ...emptyForm })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  })

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      Accept: 'application/json',
    },
  })

  const handleUnauthorized = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.reload()
      return true
    }

    return false
  }

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/tasks', {
        ...authConfig(),
        params: {
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          page,
        },
      })

      const result = response.data.data || []

      setTasks(result)
      setPagination(
        response.data.pagination || {
          current_page: page,
          last_page: 1,
          total: result.length,
          per_page: 10,
        }
      )
    } catch (err) {
      if (!handleUnauthorized(err)) {
        setError(
          err.response?.data?.message ||
          'Unable to load tasks. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const resetForm = () => {
    setFormData({ ...emptyForm })
    setEditingTaskId(null)
    setFormError('')
  }

  const closeForm = () => {
    setShowForm(false)
    resetForm()
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const getErrorMessage = (err, fallback) => {
    const errors = err.response?.data?.errors
    const firstError = errors
      ? Object.values(errors).flat()[0]
      : null

    return (
      firstError ||
      err.response?.data?.message ||
      fallback
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    setNotice('')

    const wasEditing = editingTaskId !== null

    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        due_date: formData.due_date || null,
      }

      if (wasEditing) {
        await api.put(
          `/tasks/${editingTaskId}`,
          payload,
          authConfig()
        )
      } else {
        await api.post('/tasks', payload, authConfig())
      }

      setNotice(
        wasEditing
          ? 'Task updated successfully.'
          : 'Task created successfully.'
      )

      closeForm()

      if (page !== 1) {
        setPage(1)
      } else {
        await fetchTasks()
      }
    } catch (err) {
      if (!handleUnauthorized(err)) {
        setFormError(
          getErrorMessage(err, 'Unable to save task.')
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (task) => {
    setEditingTaskId(task.id)

    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.due_date
        ? task.due_date.substring(0, 10)
        : '',
    })

    setFormError('')
    setNotice('')
    setShowForm(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    )

    if (!confirmed) return

    setError('')
    setNotice('')

    try {
      await api.delete(`/tasks/${task.id}`, authConfig())
      setNotice('Task deleted successfully.')

      if (tasks.length === 1 && page > 1) {
        setPage((current) => current - 1)
      } else {
        await fetchTasks()
      }
    } catch (err) {
      if (!handleUnauthorized(err)) {
        setError(
          err.response?.data?.message ||
          'Unable to delete task.'
        )
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    window.location.reload()
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value)
    setPage(1)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand-block">
          <div className="brand-logo">TM</div>
          <div>
            <h1>Task Manager</h1>
            <p>Manage your work. Stay productive.</p>
          </div>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="task-section">
        <div className="task-actions">
          <div>
            <h2>All Tasks</h2>
            <p className="task-count">
              {pagination.total} total tasks
            </p>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              if (showForm) {
                closeForm()
              } else {
                resetForm()
                setNotice('')
                setShowForm(true)
              }
            }}
          >
            {showForm ? 'Cancel' : '+ Add New Task'}
          </button>
        </div>

        {notice && (
          <div className="success-message" role="status">
            {notice}
          </div>
        )}

        {showForm && (
          <form className="task-form" onSubmit={handleSubmit}>
            <h2>
              {editingTaskId !== null
                ? 'Edit Task'
                : 'Create New Task'}
            </h2>

            {formError && (
              <div className="form-error" role="alert">
                {formError}
              </div>
            )}

            <label htmlFor="title">Task Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              maxLength={255}
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your task"
              rows={3}
            />

            <div className="form-row">
              <div>
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <label htmlFor="due_date">Due Date</label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleChange}
            />

            <div className="form-buttons">
              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingTaskId !== null
                    ? 'Update Task'
                    : 'Create Task'}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="task-filters">
          <input
            type="search"
            aria-label="Search tasks"
            placeholder="Search tasks by title..."
            value={search}
            onChange={handleSearchChange}
          />

          <select
            aria-label="Filter tasks by status"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {error && (
          <div className="form-error" role="alert">
            <span>{error}</span>
            <button
              type="button"
              className="retry-btn"
              onClick={fetchTasks}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-message">
            <span className="loader" />
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">☰</div>
            <h3>No tasks found</h3>
            <p>
              Try changing your search or create a new task.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Task Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="id-cell">#{task.id}</td>

                    <td className="task-title-cell">
                      {task.title}
                    </td>

                    <td className="description-cell">
                      {task.description || '—'}
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${task.status}`}
                      >
                        {statusLabels[task.status] || task.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`priority-badge priority-${task.priority}`}
                      >
                        {task.priority || 'medium'}
                      </span>
                    </td>

                    <td className="date-cell">
                      {task.due_date
                        ? task.due_date.substring(0, 10)
                        : '—'}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="edit-task-btn"
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-task-btn"
                          onClick={() => handleDelete(task)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.last_page > 1 && (
          <nav
            className="pagination"
            aria-label="Task pages"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              ← Previous
            </button>

            <span>
              Page {pagination.current_page} of {pagination.last_page}
            </span>

            <button
              type="button"
              disabled={page >= pagination.last_page}
              onClick={() => setPage((current) => current + 1)}
            >
              Next →
            </button>
          </nav>
        )}
      </main>

      <footer className="dashboard-footer">
        Task Manager <span>•</span> Stay organized, stay productive.
      </footer>
    </div>
  )
}

export default Dashboard
