# ✅ TaskFlow – Task Management Application

A full-stack task management web application built with **React.js**, **Node.js/Express**, and **SQLite**.

---

## 📁 Project Structure

```
TaskManagementTestProject/
├── backend/                      # Node.js + Express API
│   ├── config/
│   │   └── database.js           # SQLite connection & table initialization
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, GetMe
│   │   └── taskController.js     # CRUD + Stats for tasks
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js               # /api/auth routes with validation
│   │   └── tasks.js              # /api/tasks routes with validation
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express app entry point
│   ├── database.sqlite           # Auto-created SQLite database file
│   └── package.json
│
├── frontend/                     # React.js + Vite SPA
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top navigation bar
│   │   │   ├── TaskCard.jsx      # Individual task card
│   │   │   └── TaskModal.jsx     # Create / Edit task modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state (React Context)
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page with validation
│   │   │   ├── Register.jsx      # Register page with validation
│   │   │   └── Dashboard.jsx     # Main dashboard with task management
│   │   ├── App.jsx               # Router & route guards
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🗄️ Database Schema

### `users` table
| Column      | Type     | Description                  |
|-------------|----------|------------------------------|
| id          | INTEGER  | Primary key (auto-increment) |
| name        | TEXT     | Full name                    |
| email       | TEXT     | Unique email address         |
| password    | TEXT     | Bcrypt-hashed password       |
| created_at  | DATETIME | Account creation timestamp   |

### `tasks` table
| Column       | Type     | Description                                         |
|--------------|----------|-----------------------------------------------------|
| id           | INTEGER  | Primary key (auto-increment)                        |
| title        | TEXT     | Task title (required)                               |
| description  | TEXT     | Task description (optional)                         |
| status       | TEXT     | `pending` \| `in-progress` \| `completed`           |
| user_id      | INTEGER  | Foreign key → users.id                              |
| created_date | DATETIME | Task creation timestamp                             |
| updated_at   | DATETIME | Last update timestamp                               |

---

## 🔌 API Endpoints

### Auth Endpoints
| Method | Route               | Access  | Description            |
|--------|---------------------|---------|------------------------|
| POST   | `/api/auth/register` | Public  | Register a new user    |
| POST   | `/api/auth/login`   | Public  | Login & receive JWT    |
| GET    | `/api/auth/me`      | Private | Get current user info  |

#### POST `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password1"
}
```

#### POST `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "Password1"
}
```

---

### Task Endpoints *(All require `Authorization: Bearer <token>` header)*
| Method | Route              | Description                          |
|--------|--------------------|--------------------------------------|
| GET    | `/api/tasks`       | Get all tasks (supports `?status=` & `?search=`) |
| GET    | `/api/tasks/stats` | Get task count statistics            |
| GET    | `/api/tasks/:id`   | Get a single task by ID              |
| POST   | `/api/tasks`       | Create a new task                    |
| PUT    | `/api/tasks/:id`   | Update an existing task              |
| DELETE | `/api/tasks/:id`   | Delete a task                        |

#### POST / PUT `/api/tasks`
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending"
}
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)

---

## 🚀 Getting Started

### 1. Clone / Open the project

```bash
cd "d:\Testing Projects\TaskManagementTestProject"
```

### 2. Setup & Run the Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the development server (with auto-reload)
npm run dev

# OR start without auto-reload
npm start
```

The backend will run on **http://localhost:5000**

> The SQLite database file (`database.sqlite`) is created automatically on first run.

---

### 3. Setup & Run the Frontend

Open a **new terminal window/tab**, then:

```bash
# Navigate to frontend folder
cd "d:\Testing Projects\TaskManagementTestProject\frontend"

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on **http://localhost:5173**

---

### 4. Open the Application

Open your browser and go to:

```
http://localhost:5173
```

- Register a new account or log in
- Start creating and managing your tasks!

---

## 🏗️ Build for Production

### Backend
The backend is already production-ready. Deploy `server.js` to any Node.js host (Railway, Render, Heroku, etc.).

```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The output will be in `frontend/dist/`. Serve it with any static host (Vercel, Netlify, AWS S3, etc.), or use the built-in Vite preview:

```bash
npm run preview
```

---

## 🔐 Security Features

- JWT-based stateless authentication (7-day expiry)
- Passwords hashed with **bcryptjs** (10 salt rounds)
- All task routes protected by authentication middleware
- Users can only access their own tasks (user-scoped queries)
- Input validation on both frontend and backend
- CORS configured for development origins

---

## ✨ Application Features

| Feature                    | Description                                           |
|----------------------------|-------------------------------------------------------|
| 🔑 User Registration        | Create account with name, email, strong password      |
| 🔐 User Login               | JWT-based session management                          |
| 📋 Task Dashboard           | View all tasks with statistics overview               |
| ➕ Create Task              | Add tasks with title, description, and status         |
| ✏️ Edit Task                | Modify any task details inline via modal              |
| 🗑️ Delete Task              | Remove tasks with confirmation dialog                 |
| 🔍 Search Tasks             | Real-time search by title or description              |
| 🏷️ Filter by Status         | Filter tasks: All / Pending / In Progress / Completed |
| 📊 Task Statistics          | Visual counters for each task status                  |
| 📱 Responsive Design        | Works on desktop and mobile screens                   |
| 🔔 Toast Notifications      | Feedback messages for all user actions                |

---

## 🛠️ Tech Stack

### Frontend
| Technology        | Version  | Purpose                       |
|------------------|----------|-------------------------------|
| React.js          | 18.x     | UI framework                  |
| Vite              | 5.x      | Build tool & dev server       |
| React Router DOM  | 6.x      | Client-side routing           |
| Axios             | 1.x      | HTTP client                   |
| react-hot-toast   | 2.x      | Toast notifications           |

### Backend
| Technology        | Version  | Purpose                       |
|------------------|----------|-------------------------------|
| Node.js           | 18+      | JavaScript runtime            |
| Express           | 4.x      | Web framework                 |
| better-sqlite3    | 9.x      | SQLite database driver        |
| bcryptjs          | 2.x      | Password hashing              |
| jsonwebtoken      | 9.x      | JWT authentication            |
| express-validator | 7.x      | Request validation            |
| cors              | 2.x      | Cross-Origin Resource Sharing |
| dotenv            | 16.x     | Environment variables         |

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill the process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**`better-sqlite3` build error?**
```bash
npm install --build-from-source better-sqlite3
```

**Frontend cannot reach backend?**
- Make sure the backend is running on port `5000`
- The Vite proxy in `vite.config.js` forwards `/api` requests to `http://localhost:5000`

---

## 📝 Environment Variables

The backend uses a `.env` file located at `backend/.env`:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

> ⚠️ Change `JWT_SECRET` to a long, random string in production!
