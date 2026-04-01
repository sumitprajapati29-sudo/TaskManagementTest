import React from 'react';

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed'
};

const STATUS_BADGE = {
  pending: 'badge-pending',
  'in-progress': 'badge-in-progress',
  completed: 'badge-completed'
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const TaskCard = ({ task, onEdit, onDelete }) => {
  return (
    <div className={`task-card ${task.status}`}>
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <div className="task-card-actions">
          <button
            className="btn-icon btn-edit"
            title="Edit task"
            onClick={() => onEdit(task)}
          >
            ✏️
          </button>
          <button
            className="btn-icon btn-delete"
            title="Delete task"
            onClick={() => onDelete(task)}
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <span className={`task-badge ${STATUS_BADGE[task.status]}`}>
          {STATUS_LABELS[task.status]}
        </span>
        <span className="task-date">📅 {formatDate(task.created_date)}</span>
      </div>
    </div>
  );
};

export default TaskCard;
