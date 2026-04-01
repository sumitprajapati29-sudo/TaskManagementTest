# Project Requirements Document

**Project Name:** TaskFlow – Task Management Application  
**Document Version:** 1.0  
**Date:** March 4, 2026  
**Status:** Final  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Stakeholders & Roles](#2-stakeholders--roles)
3. [Scope](#3-scope)
4. [Functional Requirements](#4-functional-requirements)
   - 4.1 [User Authentication](#41-user-authentication)
   - 4.2 [Task Management](#42-task-management)
   - 4.3 [Dashboard & Statistics](#43-dashboard--statistics)
   - 4.4 [Search & Filtering](#44-search--filtering)
   - 4.5 [Notifications](#45-notifications)
5. [Non-Functional Requirements](#5-non-functional-requirements)
   - 5.1 [Performance](#51-performance)
   - 5.2 [Security](#52-security)
   - 5.3 [Usability](#53-usability)
   - 5.4 [Reliability & Availability](#54-reliability--availability)
   - 5.5 [Maintainability](#55-maintainability)
   - 5.6 [Portability](#56-portability)
6. [System Architecture](#6-system-architecture)
7. [Database Schema](#7-database-schema)
8. [API Specification](#8-api-specification)
   - 8.1 [Authentication Endpoints](#81-authentication-endpoints)
   - 8.2 [Task Endpoints](#82-task-endpoints)
   - 8.3 [Utility Endpoints](#83-utility-endpoints)
9. [Input Validation Rules](#9-input-validation-rules)
10. [Error Handling](#10-error-handling)
11. [Technology Stack](#11-technology-stack)
12. [Environment Configuration](#12-environment-configuration)
13. [Deployment Requirements](#13-deployment-requirements)
14. [Constraints & Assumptions](#14-constraints--assumptions)
15. [Glossary](#15-glossary)

---

## 1. Project Overview

TaskFlow is a full-stack, single-page web application that enables authenticated users to create, view, update, delete, search, and filter personal tasks. The system follows a client-server architecture with a React.js frontend communicating exclusively through a RESTful JSON API served by a Node.js/Express backend, persisting data in an embedded SQLite database.

### 1.1 Purpose

The purpose of this document is to formally define the functional and non-functional requirements of the TaskFlow application to serve as a reference for development, testing, and future maintenance.

### 1.2 Goals

| Goal | Description |
|------|-------------|
| G-01 | Provide secure, user-scoped task management via JWT-based authentication |
| G-02 | Deliver a responsive, intuitive single-page dashboard for all task operations |
| G-03 | Support real-time search and status-based filtering without full page reloads |
| G-04 | Expose a well-defined RESTful API that can be consumed by any HTTP client |
| G-05 | Minimize operational overhead by using an embedded database with no external server dependency |

---

## 2. Stakeholders & Roles

| Role | Responsibility |
|------|---------------|
| End User | Registers an account, manages personal tasks via the web interface |
| Developer | Implements, maintains, and extends backend and frontend code |
| System Administrator | Deploys and configures the application environment |

---

## 3. Scope

### 3.1 In Scope

- User registration and login with JWT-based session management
- Full CRUD operations on tasks scoped to the authenticated user
- Task status lifecycle: `pending` → `in-progress` → `completed`
- Real-time search across task title and description
- Status-based task filtering
- Aggregated task statistics (totals by status)
- Responsive web interface supporting desktop and mobile browsers
- Docker-based containerised deployment via Docker Compose
- RESTful JSON API with validation and structured error responses

### 3.2 Out of Scope

- Multi-user collaboration or task sharing
- Role-based access control (RBAC) or admin panel
- File attachments on tasks
- Email notifications or third-party integrations
- OAuth / social login providers
- Offline / Progressive Web App (PWA) support

---

## 4. Functional Requirements

### 4.1 User Authentication

#### FR-AUTH-01 — User Registration

- The system **shall** allow an anonymous visitor to register a new account by providing a full name, email address, and password.
- Upon successful registration, the system **shall** return a signed JWT and the user profile object.
- The system **shall** reject registration if the email address is already associated with an existing account, returning HTTP `409 Conflict`.
- Passwords **shall** be hashed using bcryptjs (10 salt rounds) before persistence; plaintext passwords **shall never** be stored.

#### FR-AUTH-02 — User Login

- The system **shall** allow a registered user to authenticate using their email address and password.
- Upon successful authentication, the system **shall** return a signed JWT valid for 7 days and the user profile object.
- The system **shall** return HTTP `401 Unauthorized` for unrecognised email addresses or incorrect passwords. The error message **shall not** distinguish between the two cases.

#### FR-AUTH-03 — Current User Retrieval

- The system **shall** expose an authenticated endpoint that returns the profile (`id`, `name`, `email`, `created_at`) of the currently authenticated user.

#### FR-AUTH-04 — Session Management

- The frontend **shall** store the JWT token and serialised user object in `localStorage` after a successful login or registration.
- The frontend **shall** attach the JWT as a `Bearer` token in the `Authorization` header of every subsequent API request.
- The frontend **shall** clear `localStorage` and redirect the user to the login page upon logout or receipt of an HTTP `401` response.
- JWT tokens **shall** have a 7-day expiry.

---

### 4.2 Task Management

#### FR-TASK-01 — Create Task

- An authenticated user **shall** be able to create a task by supplying a title, an optional description, and an optional initial status.
- If no status is provided, the system **shall** default the status to `pending`.
- The system **shall** associate the task with the authenticated user's account (user-scoped).
- On success, the system **shall** return HTTP `201 Created` along with the complete new task object.

#### FR-TASK-02 — Read Tasks (List)

- An authenticated user **shall** be able to retrieve all tasks belonging to their account.
- Tasks **shall** be returned in descending order by creation date (`created_date DESC`).
- The endpoint **shall** support optional query parameters:
  - `status` — filter by `pending`, `in-progress`, or `completed`
  - `search` — full-text substring match across `title` and `description`

#### FR-TASK-03 — Read Task (Single)

- An authenticated user **shall** be able to retrieve a single task by its ID.
- The system **shall** return HTTP `404 Not Found` if the task does not exist or does not belong to the requesting user.

#### FR-TASK-04 — Update Task

- An authenticated user **shall** be able to update the `title`, `description`, and/or `status` of any task they own.
- The request body fields **shall** be optional; unspecified fields **shall** retain their current values (partial update / PATCH-style behaviour over PUT).
- The system **shall** update the `updated_at` timestamp on every successful update.
- The system **shall** return HTTP `404 Not Found` if the task does not belong to the requesting user.

#### FR-TASK-05 — Delete Task

- An authenticated user **shall** be able to permanently delete a task they own.
- The system **shall** return HTTP `404 Not Found` if the task does not exist or does not belong to the requesting user.
- The frontend **shall** present a confirmation dialog before sending the delete request.

#### FR-TASK-06 — Task Ownership Enforcement

- The system **shall** enforce that users can only read, update, or delete tasks they own. Cross-user access **shall** be prevented at the database query level by including `AND user_id = ?` in all task queries.

---

### 4.3 Dashboard & Statistics

#### FR-DASH-01 — Statistics Overview

- The dashboard **shall** display four counters: **Total**, **Pending**, **In Progress**, and **Completed** tasks.
- Statistics **shall** reflect the current filter state and be refreshed after every create, update, or delete operation.

#### FR-DASH-02 — Task Cards

- Each task **shall** be rendered as a card displaying its `title`, `description`, `status` (as a styled badge), and `created_date`.
- Each card **shall** expose an **Edit** action that opens a pre-populated modal.
- Each card **shall** expose a **Delete** action that triggers a confirmation dialog.

#### FR-DASH-03 — Create Task Entry Point

- The dashboard **shall** provide a prominent button to open the task creation modal.

#### FR-DASH-04 — Empty State

- When no tasks match the current filters, the dashboard **shall** display an appropriate empty-state message.

---

### 4.4 Search & Filtering

#### FR-SF-01 — Real-Time Search

- The dashboard **shall** include a text input that triggers a search API call with a 400 ms debounce.
- The search **shall** perform a case-insensitive substring match against both `title` and `description` fields simultaneously.

#### FR-SF-02 — Status Filter

- The dashboard **shall** provide filter controls to restrict the task list to one of: **All**, **Pending**, **In Progress**, or **Completed**.
- Changing the status filter **shall** immediately reload the task list and refresh statistics.

---

### 4.5 Notifications

#### FR-NOTIF-01 — Toast Feedback

- The frontend **shall** display non-blocking toast notifications for the following events:

| Event | Type | Message |
|-------|------|---------|
| Task created | Success | "Task created successfully!" |
| Task updated | Success | "Task updated successfully!" |
| Task deleted | Success | "Task deleted." |
| Task load failure | Error | "Failed to load tasks." |
| Task save failure | Error | API error message or "Failed to save task." |
| Task delete failure | Error | "Failed to delete task." |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-P-01 | API endpoints **shall** respond within 500 ms for typical payloads under low concurrency (≤ 10 simultaneous users). |
| NFR-P-02 | The frontend search debounce **shall** be set to 400 ms to prevent excessive API calls during rapid typing. |
| NFR-P-03 | The dashboard **shall** load initial tasks and statistics in parallel (`Promise.all`) to minimise perceived load time. |

### 5.2 Security

| ID | Requirement |
|----|-------------|
| NFR-S-01 | All passwords **shall** be hashed with bcryptjs using a minimum of 10 salt rounds. Plaintext passwords **shall** never be logged or stored. |
| NFR-S-02 | JWT tokens **shall** be signed with a secret loaded from the `JWT_SECRET` environment variable. The secret **shall** never be hard-coded or committed to source control. |
| NFR-S-03 | All task-modification routes **shall** be protected by the `authenticate` middleware, which validates the JWT and attaches the decoded user to `req.user`. |
| NFR-S-04 | CORS **shall** restrict allowed origins to known frontend origins: `http://localhost:5173`, `http://localhost:3000`, and `http://localhost`. |
| NFR-S-05 | SQL queries **shall** use parameterised statements exclusively to prevent SQL injection. |
| NFR-S-06 | The `.env` file containing secrets **shall** be excluded from version control via `.gitignore`. |
| NFR-S-07 | JWT tokens **shall** expire after 7 days. The expiry duration **shall** be configurable via the `JWT_EXPIRES_IN` environment variable. |

### 5.3 Usability

| ID | Requirement |
|----|-------------|
| NFR-U-01 | The application **shall** be responsive and usable on screens from 375 px (mobile) to 1920 px (desktop) width. |
| NFR-U-02 | All form fields **shall** display inline validation error messages before submission. |
| NFR-U-03 | Destructive actions (delete) **shall** require explicit user confirmation. |
| NFR-U-04 | Loading states **shall** be indicated visually when data is being fetched or an action is in progress. |

### 5.4 Reliability & Availability

| ID | Requirement |
|----|-------------|
| NFR-R-01 | The backend **shall** expose a `/api/health` endpoint returning HTTP `200` to support health-check probes. |
| NFR-R-02 | All API controllers **shall** wrap database operations in try/catch blocks and return HTTP `500` with a generic message on unexpected errors; raw stack traces **shall** not be exposed to clients. |
| NFR-R-03 | The SQLite database file **shall** be created automatically on first startup if it does not exist. |
| NFR-R-04 | The database **shall** be persisted to disk after every write operation to prevent data loss on process restart. |

### 5.5 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-M-01 | The codebase **shall** follow a layered architecture: routes → controllers → database, with concerns clearly separated. |
| NFR-M-02 | Validation logic **shall** reside in route definitions using `express-validator` and **shall** not be duplicated in controllers. |
| NFR-M-03 | Environment-specific configuration **shall** be managed exclusively through environment variables loaded via `dotenv`. |
| NFR-M-04 | The frontend Axios instance **shall** be centralised in a single file (`src/api/axios.js`) to ensure all requests share the same base URL, token injection, and error-interception logic. |

### 5.6 Portability

| ID | Requirement |
|----|-------------|
| NFR-PO-01 | The application **shall** be containerisable using Docker; both frontend and backend **shall** have corresponding `Dockerfile` definitions. |
| NFR-PO-02 | A `docker-compose.yml` **shall** be provided to orchestrate both services in a single command. |
| NFR-PO-03 | The frontend Vite dev server **shall** be configured to proxy `/api/*` requests to `http://localhost:5000` to avoid CORS issues during local development. |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React.js SPA (Vite, Port 5173)         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │   │
│  │  │  Pages   │  │Components│  │  AuthContext    │    │   │
│  │  │ Dashboard│  │ TaskCard │  │ (Global State) │    │   │
│  │  │  Login   │  │TaskModal │  └────────────────┘    │   │
│  │  │ Register │  │  Navbar  │                         │   │
│  │  └──────────┘  └──────────┘                         │   │
│  │              Axios HTTP Client                        │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/JSON  (JWT Bearer Token)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               Node.js / Express API (Port 5000)             │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │  Auth Routes │   │  Task Routes │   │  Health Route │  │
│  │  /api/auth   │   │  /api/tasks  │   │  /api/health  │  │
│  └──────┬───────┘   └──────┬───────┘   └───────────────┘  │
│         │                  │                                │
│  ┌──────▼───────┐   ┌──────▼───────┐                       │
│  │authController│   │taskController│                       │
│  └──────┬───────┘   └──────┬───────┘                       │
│         │   JWT Middleware  │                               │
│         │   (authenticate) │                               │
│  ┌──────▼──────────────────▼────┐                          │
│  │      sql.js  (SQLite WASM)   │                          │
│  │      database.sqlite (disk)  │                          │
│  └──────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### 6.1 Component Descriptions

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| React SPA | React 18 + Vite 5 | Renders UI, manages client-side routing and auth state |
| AuthContext | React Context API | Provides global user state, login/logout/register functions |
| Axios Instance | Axios 1.x | Centralised HTTP client with base URL and Authorization header injection |
| Express Server | Express 4.x | Handles HTTP routing, middleware composition, and error handling |
| Auth Middleware | jsonwebtoken | Validates Bearer token and attaches decoded user to `req.user` |
| Auth Controller | bcryptjs + jwt | Implements register, login, and getMe business logic |
| Task Controller | sql.js | Implements CRUD and statistics queries scoped by `user_id` |
| Database Layer | sql.js (SQLite WASM) | In-process SQLite engine; persists data to `database.sqlite` on disk |

---

## 7. Database Schema

### 7.1 `users` Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  name       TEXT     NOT NULL,
  email      TEXT     NOT NULL UNIQUE,
  password   TEXT     NOT NULL,              -- bcrypt hash
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Unique user identifier |
| `name` | TEXT | NOT NULL | Full display name |
| `email` | TEXT | NOT NULL, UNIQUE | Login email address |
| `password` | TEXT | NOT NULL | bcrypt-hashed password |
| `created_at` | DATETIME | DEFAULT NOW | Account creation timestamp |

### 7.2 `tasks` Table

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  title        TEXT     NOT NULL,
  description  TEXT,
  status       TEXT     NOT NULL DEFAULT 'pending'
               CHECK(status IN ('pending', 'in-progress', 'completed')),
  user_id      INTEGER  NOT NULL,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AUTOINCREMENT | Unique task identifier |
| `title` | TEXT | NOT NULL | Short task title |
| `description` | TEXT | NULLABLE | Extended task details |
| `status` | TEXT | CHECK constraint | Lifecycle state: `pending` \| `in-progress` \| `completed` |
| `user_id` | INTEGER | FK → users.id | Owning user; cascades on delete |
| `created_date` | DATETIME | DEFAULT NOW | Task creation timestamp |
| `updated_at` | DATETIME | DEFAULT NOW | Last modification timestamp |

### 7.3 Referential Integrity

- `PRAGMA foreign_keys = ON` is executed on every database connection.
- Deleting a user cascades and removes all associated tasks (`ON DELETE CASCADE`).

---

## 8. API Specification

**Base URL (development):** `http://localhost:5000`  
**Content-Type:** `application/json` for all request and response bodies  
**Authentication:** `Authorization: Bearer <JWT>` header required on all private endpoints

---

### 8.1 Authentication Endpoints

#### POST `/api/auth/register`

**Access:** Public

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password1"
}
```

**Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| `201 Created` | Registration successful | `{ message, token, user: { id, name, email } }` |
| `400 Bad Request` | Validation failure | `{ errors: [{ msg, path }] }` |
| `409 Conflict` | Email already registered | `{ message }` |
| `500 Internal Server Error` | Unexpected server error | `{ message }` |

---

#### POST `/api/auth/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "jane@example.com",
  "password": "Password1"
}
```

**Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Login successful | `{ message, token, user: { id, name, email } }` |
| `400 Bad Request` | Validation failure | `{ errors: [{ msg, path }] }` |
| `401 Unauthorized` | Invalid credentials | `{ message }` |
| `500 Internal Server Error` | Unexpected server error | `{ message }` |

---

#### GET `/api/auth/me`

**Access:** Private (JWT required)

**Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Success | `{ user: { id, name, email, created_at } }` |
| `401 Unauthorized` | Missing/invalid token | `{ message }` |
| `404 Not Found` | User no longer exists | `{ message }` |

---

### 8.2 Task Endpoints

All task endpoints require a valid `Authorization: Bearer <JWT>` header.

#### GET `/api/tasks`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by `pending`, `in-progress`, or `completed` |
| `search` | string | No | Substring search across `title` and `description` |

**Responses:**

| Status | Body |
|--------|------|
| `200 OK` | `{ tasks: [ { id, title, description, status, user_id, created_date, updated_at } ] }` |
| `401 Unauthorized` | `{ message }` |

---

#### GET `/api/tasks/stats`

**Responses:**

| Status | Body |
|--------|------|
| `200 OK` | `{ stats: { total, pending, inProgress, completed } }` |
| `401 Unauthorized` | `{ message }` |

---

#### GET `/api/tasks/:id`

**Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Task found and owned by user | `{ task: { ... } }` |
| `401 Unauthorized` | Missing/invalid token | `{ message }` |
| `404 Not Found` | Task not found or not owned | `{ message }` |

---

#### POST `/api/tasks`

**Request Body:**

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending"
}
```

**Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| `201 Created` | Task created | `{ message, task: { ... } }` |
| `400 Bad Request` | Validation failure | `{ errors: [{ msg, path }] }` |
| `401 Unauthorized` | Missing/invalid token | `{ message }` |

---

#### PUT `/api/tasks/:id`

**Request Body** (all fields optional):

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress"
}
```

**Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Task updated | `{ message, task: { ... } }` |
| `400 Bad Request` | Validation failure | `{ errors: [{ msg, path }] }` |
| `401 Unauthorized` | Missing/invalid token | `{ message }` |
| `404 Not Found` | Task not found or not owned | `{ message }` |

---

#### DELETE `/api/tasks/:id`

**Responses:**

| Status | Condition | Body |
|--------|-----------|------|
| `200 OK` | Task deleted | `{ message }` |
| `401 Unauthorized` | Missing/invalid token | `{ message }` |
| `404 Not Found` | Task not found or not owned | `{ message }` |

---

### 8.3 Utility Endpoints

#### GET `/api/health`

**Access:** Public

**Response:**

```json
{
  "status": "OK",
  "message": "Task Management API is running."
}
```

---

## 9. Input Validation Rules

### 9.1 Registration (`POST /api/auth/register`)

| Field | Rules |
|-------|-------|
| `name` | Required. Min 2, max 100 characters. Leading/trailing whitespace trimmed. |
| `email` | Required. Must be a valid email format. Normalised to lowercase. |
| `password` | Required. Min 6 characters. Must contain at least one uppercase letter, one lowercase letter, and one digit. |

### 9.2 Login (`POST /api/auth/login`)

| Field | Rules |
|-------|-------|
| `email` | Required. Must be a valid email format. Normalised to lowercase. |
| `password` | Required. Not empty. |

### 9.3 Create Task (`POST /api/tasks`)

| Field | Rules |
|-------|-------|
| `title` | Required. Min 2, max 200 characters. Leading/trailing whitespace trimmed. |
| `description` | Optional. Max 1000 characters. Leading/trailing whitespace trimmed. |
| `status` | Optional. Must be one of: `pending`, `in-progress`, `completed`. Defaults to `pending`. |

### 9.4 Update Task (`PUT /api/tasks/:id`)

| Field | Rules |
|-------|-------|
| `title` | Optional. If provided, must not be empty; min 2, max 200 characters. |
| `description` | Optional. Max 1000 characters. |
| `status` | Optional. Must be one of: `pending`, `in-progress`, `completed`. |

---

## 10. Error Handling

### 10.1 Backend Error Responses

| Scenario | HTTP Status | Response Format |
|----------|-------------|-----------------|
| Validation failure | `400` | `{ errors: [{ msg: string, path: string }] }` |
| Unauthenticated request | `401` | `{ message: string }` |
| Resource not found or access denied | `404` | `{ message: string }` |
| Duplicate resource (e.g., email) | `409` | `{ message: string }` |
| Unknown API route | `404` | `{ message: "API route not found: METHOD /path" }` |
| Unhandled server error | `500` | `{ message: "Internal server error." }` |

### 10.2 Frontend Error Handling

- Axios response interceptors **shall** detect `401` responses and automatically log the user out by clearing `localStorage` and redirecting to `/login`.
- Components **shall** display error toast notifications for failed API calls.
- Form pages **shall** display field-level validation messages returned in the `errors` array.
- Server error messages returned in `response.data.message` **shall** be surfaced directly in toast notifications.

---

## 11. Technology Stack

### 11.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 18.x | Component-based UI framework |
| Vite | 5.x | Build tool and development server with HMR |
| React Router DOM | 6.x | Declarative client-side routing and route guards |
| Axios | 1.x | Promise-based HTTP client with interceptors |
| react-hot-toast | 2.x | Non-blocking toast notification system |

### 11.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript server runtime |
| Express | 4.x | HTTP routing and middleware framework |
| sql.js | 1.x | WebAssembly SQLite engine (no native compilation required) |
| bcryptjs | 2.x | Secure password hashing |
| jsonwebtoken | 9.x | JWT generation and verification |
| express-validator | 7.x | Declarative request validation middleware |
| cors | 2.x | Cross-Origin Resource Sharing configuration |
| dotenv | 16.x | Environment variable loading from `.env` file |
| nodemon | 3.x | Development auto-reload (dev dependency) |

### 11.3 Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerisation of frontend and backend services |
| Docker Compose | Multi-container orchestration |
| Nginx | Static file serving for the production frontend build |
| SQLite (via sql.js) | Embedded relational database; file: `backend/database.sqlite` |

---

## 12. Environment Configuration

The backend reads configuration from `backend/.env`. This file **must not** be committed to version control.

### 12.1 Required Variables

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `PORT` | `5000` | TCP port for the Express server |
| `JWT_SECRET` | `change_me_in_production_abc123` | Secret key used to sign/verify JWTs. Must be a long, random string in production. |
| `JWT_EXPIRES_IN` | `7d` | JWT expiration duration (e.g., `7d`, `24h`, `3600`) |

### 12.2 Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PATH` | `<backendDir>/database.sqlite` | Absolute path to the SQLite file; useful when mounting a Docker volume |

### 12.3 Frontend Proxy Configuration (`vite.config.js`)

The Vite development server proxies `/api/*` requests to `http://localhost:5000`, enabling the frontend to call `/api/tasks` without specifying the full backend URL and avoiding CORS issues during development.

---

## 13. Deployment Requirements

### 13.1 Local Development Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | 18.x |
| npm | 9.x |

### 13.2 Local Setup Steps

**Backend:**
```bash
cd backend
npm install
npm run dev          # starts with nodemon on port 5000
```

**Frontend (separate terminal):**
```bash
cd frontend
npm install
npm run dev          # starts Vite dev server on port 5173
```

### 13.3 Production Build

**Frontend:**
```bash
cd frontend
npm run build        # outputs to frontend/dist/
```

The `dist/` directory can be served by any static file host (Nginx, Vercel, Netlify, AWS S3 + CloudFront) or via the Vite preview server (`npm run preview`).

**Backend:**
```bash
cd backend
npm start            # runs node server.js
```

### 13.4 Docker Deployment

```bash
docker compose up --build
```

This command builds both images and starts the services. The frontend (Nginx) proxies API traffic to the backend container.

| Service | Container Port | Host Port |
|---------|---------------|-----------|
| Backend (Node.js) | 5000 | 5000 |
| Frontend (Nginx) | 80 | 80 |

---

## 14. Constraints & Assumptions

| ID | Category | Statement |
|----|----------|-----------|
| C-01 | Database | The application uses an embedded SQLite database. It is not designed for concurrent write-heavy workloads exceeding the single-writer characteristics of SQLite. |
| C-02 | Scalability | The application is architected for single-instance deployment. Horizontal scaling is not supported without switching to a client-server database (e.g., PostgreSQL). |
| C-03 | Authentication | Tokens are stateless JWTs; there is no token revocation mechanism. Compromised tokens remain valid until expiry. |
| C-04 | Browser Support | The frontend targets modern browsers (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+). Internet Explorer is not supported. |
| C-05 | Data Isolation | Task data is strictly user-scoped. There is no mechanism for sharing tasks between accounts. |
| A-01 | Assumption | A valid `backend/.env` file with all required variables is present before starting the backend. |
| A-02 | Assumption | The developer/operator has appropriate permissions to write files in the backend directory (for `database.sqlite` creation). |
| A-03 | Assumption | Ports `5000` and `5173` (or `80` in Docker) are available on the host machine. |

---

## 15. Glossary

| Term | Definition |
|------|-----------|
| **JWT** | JSON Web Token — a compact, URL-safe token format used for stateless authentication. |
| **SPA** | Single-Page Application — a web application that loads a single HTML page and dynamically updates content without full page reloads. |
| **REST** | Representational State Transfer — an architectural style for designing networked APIs using standard HTTP methods. |
| **CRUD** | Create, Read, Update, Delete — the four basic operations for persistent data management. |
| **SQLite** | A lightweight, file-based relational database engine embedded directly in the application process. |
| **sql.js** | A WebAssembly-compiled port of SQLite that runs in Node.js without native binaries. |
| **Bcrypt** | A password-hashing algorithm designed to be computationally expensive to resist brute-force attacks. |
| **CORS** | Cross-Origin Resource Sharing — a browser security mechanism that restricts HTTP requests from one origin to another. |
| **Vite** | A modern frontend build tool providing fast Hot Module Replacement (HMR) during development. |
| **HMR** | Hot Module Replacement — a Vite/webpack feature that updates changed modules in the browser without a full page reload. |
| **Middleware** | A function in Express that has access to the request and response objects and the `next` function in the request-response cycle. |
| **Debounce** | A technique that delays executing a function until a specified time has passed since the last call, used here to limit search API calls. |
| **Bearer Token** | An access token sent in the HTTP `Authorization` header with the format `Bearer <token>`. |

---

*End of Document*

---

> **Document Control**
> | Field | Value |
> |-------|-------|
> | Prepared by | GitHub Copilot (AI Assistant) |
> | Project | TaskFlow – Task Management Application |
> | Version | 1.0 |
> | Date | March 4, 2026 |
> | Classification | Internal / Development Reference |
