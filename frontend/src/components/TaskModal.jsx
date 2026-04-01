import React, { useState, useEffect } from 'react';

const INITIAL_FORM = { title: '', description: '', status: 'pending' };

const TaskModal = ({ isOpen, task, onClose, onSave, loading }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(task);

  useEffect(() => {
    if (isOpen) {
      setForm(
        task
          ? { title: task.title, description: task.description || '', status: task.status }
          : INITIAL_FORM
      );
      setErrors({});
    }
  }, [isOpen, task]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) {
      errs.title = 'Title is required.';
    } else if (form.title.trim().length < 2) {
      errs.title = 'Title must be at least 2 characters.';
    } else if (form.title.trim().length > 200) {
      errs.title = 'Title cannot exceed 200 characters.';
    }
    if (form.description.length > 1000) {
      errs.description = 'Description cannot exceed 1000 characters.';
    }
    if (!['pending', 'in-progress', 'completed'].includes(form.status)) {
      errs.status = 'Please select a valid status.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({ title: form.title.trim(), description: form.description.trim(), status: form.status });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Task' : 'Create New Task'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              name="title"
              placeholder="Enter task title"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              autoFocus
            />
            {errors.title && <span className="error-msg">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              name="description"
              placeholder="Add more details about this task (optional)"
              value={form.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              rows={4}
            />
            {errors.description && <span className="error-msg">{errors.description}</span>}
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{form.description.length}/1000</span>
          </div>

          <div className="form-group">
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={errors.status ? 'error' : ''}
            >
              <option value="pending">⏳ Pending</option>
              <option value="in-progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
            {errors.status && <span className="error-msg">{errors.status}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
