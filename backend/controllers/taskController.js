const { validationResult } = require('express-validator');
const { db } = require('../config/database');

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
const getAllTasks = (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [req.user.id];

    if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_date DESC';

    const tasks = db.prepare(query).all(...params);
    return res.status(200).json({ tasks });
  } catch (err) {
    console.error('GetAllTasks error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// @route   GET /api/tasks/:id
// @desc    Get a single task by ID
// @access  Private
const getTaskById = (req, res) => {
  try {
    const task = db
      .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({ task });
  } catch (err) {
    console.error('GetTaskById error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
const createTask = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status } = req.body;

  try {
    const stmt = db.prepare(
      'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(title, description || '', status || 'pending', req.user.id);

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ message: 'Task created successfully.', task: newTask });
  } catch (err) {
    console.error('CreateTask error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
const updateTask = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status } = req.body;

  try {
    // Check task exists and belongs to user
    const existingTask = db
      .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const updatedTitle = title ?? existingTask.title;
    const updatedDescription = description ?? existingTask.description;
    const updatedStatus = status ?? existingTask.status;

    db.prepare(
      'UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
    ).run(updatedTitle, updatedDescription, updatedStatus, req.params.id, req.user.id);

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

    return res.status(200).json({ message: 'Task updated successfully.', task: updatedTask });
  } catch (err) {
    console.error('UpdateTask error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
const deleteTask = (req, res) => {
  try {
    const existingTask = db
      .prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);

    return res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('DeleteTask error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// @route   GET /api/tasks/stats
// @desc    Get task statistics for the user
// @access  Private
const getTaskStats = (req, res) => {
  try {
    const stats = db
      .prepare(
        `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) AS inProgress,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
        FROM tasks WHERE user_id = ?`
      )
      .get(req.user.id);

    return res.status(200).json({ stats });
  } catch (err) {
    console.error('GetTaskStats error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask, getTaskStats };
