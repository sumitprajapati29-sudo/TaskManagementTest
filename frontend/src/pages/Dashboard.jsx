import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import api from '../api/axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [savingTask, setSavingTask] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
    } catch {
      toast.error('Failed to load tasks.');
    }
  }, [statusFilter, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data.stats);
    } catch {
      // silently fail for stats
    }
  }, []);

  // Initial load + filter changes (status)
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, [statusFilter, fetchStats]); // statusFilter triggers reload; search handled separately

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSaveTask = async (formData) => {
    setSavingTask(true);
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, formData);
        toast.success('Task updated successfully!');
      } else {
        await api.post('/tasks', formData);
        toast.success('Task created successfully!');
      }
      setModalOpen(false);
      setEditTask(null);
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save task.';
      toast.error(msg);
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/tasks/${deleteTarget.id}`);
      toast.success('Task deleted.');
      setDeleteTarget(null);
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch {
      toast.error('Failed to delete task.');
    } finally {
      setDeleting(false);
    }
  };

  const openCreateModal = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  return (
    <>
      <Navbar />

      <main className="dashboard">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">📋</div>
            <div className="stat-info">
              <h4>{stats.total ?? 0}</h4>
              <p>Total Tasks</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <h4>{stats.pending ?? 0}</h4>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon progress">🔄</div>
            <div className="stat-info">
              <h4>{stats.inProgress ?? 0}</h4>
              <p>In Progress</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">✅</div>
            <div className="stat-info">
              <h4>{stats.completed ?? 0}</h4>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="dashboard-header">
          <h2>My Tasks</h2>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreateModal}>
            + New Task
          </button>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }}>
            <option value="">All Statuses</option>
            <option value="pending">⏳ Pending</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="loading-screen" style={{ minHeight: 300 }}>
            <div className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
            <span>Loading tasks...</span>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No tasks found</h3>
                <p>
                  {search || statusFilter
                    ? 'Try adjusting your filters.'
                    : 'Click "New Task" to create your first task!'}
                </p>
                {!search && !statusFilter && (
                  <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreateModal}>
                    + Create Task
                  </button>
                )}
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEditModal}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        task={editTask}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSave={handleSaveTask}
        loading={savingTask}
      />

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="confirm-dialog">
              <div className="confirm-icon">🗑️</div>
              <h3>Delete Task</h3>
              <p>
                Are you sure you want to delete{' '}
                <strong>"{deleteTarget.title}"</strong>? This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? <span className="spinner" /> : null}
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
