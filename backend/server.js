require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // CRA dev server
    'http://localhost',      // Docker / nginx on port 80
    'http://localhost:80'    // Docker / nginx explicit port
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Task Management API is running.' });
});

// API 404 – only for /api/* paths
app.use('/api', (req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Root / non-API paths → helpful info (frontend runs on port 5173)
app.use((req, res) => {
  res.status(200).send(`
    <!DOCTYPE html><html><head><title>TaskFlow API</title>
    <style>body{font-family:sans-serif;max-width:600px;margin:80px auto;padding:0 20px;}
    a{color:#4f46e5;}code{background:#f1f5f9;padding:2px 6px;border-radius:4px;}</style></head>
    <body>
      <h1>✅ TaskFlow API is running</h1>
      <p>The backend server is online on port <strong>5000</strong>.</p>
      <p>👉 Open the application at: <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></p>
      <hr/>
      <h3>Available API routes</h3>
      <ul>
        <li><code>POST /api/auth/register</code> – Register a new user</li>
        <li><code>POST /api/auth/login</code> – Login</li>
        <li><code>GET  /api/auth/me</code> – Get current user (auth required)</li>
        <li><code>GET  /api/tasks</code> – List tasks (auth required)</li>
        <li><code>GET  /api/tasks/stats</code> – Task statistics (auth required)</li>
        <li><code>POST /api/tasks</code> – Create task (auth required)</li>
        <li><code>PUT  /api/tasks/:id</code> – Update task (auth required)</li>
        <li><code>DELETE /api/tasks/:id</code> – Delete task (auth required)</li>
        <li><code>GET  /api/health</code> – Health check</li>
      </ul>
    </body></html>
  `);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;

// Initialize DB first, then start listening
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
