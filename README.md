# Task Manager

A full-stack Task Management Application built using Laravel, React, and MySQL. It allows users to manage their tasks with authentication, role-based access control, filtering, and pagination.

## Features

- User registration and login
- Secure password hashing
- Laravel Sanctum API authentication
- Create, read, update, and delete tasks
- Filter tasks by status
- Search tasks by title
- Task pagination
- Task ownership and role-based access
- Admin can view all users' tasks
- Form validation and API error handling
- MySQL indexes and optimized SQL queries

## Technology Stack

- **Backend:** PHP, Laravel
- **Frontend:** React.js, Vite
- **Database:** MySQL
- **Authentication:** Laravel Sanctum
- **HTTP Client:** Axios
- **Tools:** VS Code, MySQL Workbench, Git, GitHub

## Project Structure

```text
TaskManager/
├── backend/
├── frontend/
└── README.md
```

## Requirements

- PHP
- Composer
- Node.js and npm
- MySQL
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd TaskManager
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Configure the Laravel Backend

```bash
cd backend
composer install
```

Create the environment file if it does not already exist:

```bash
copy .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

Configure the database settings in `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_manager
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

Create the database in MySQL Workbench:

```sql
CREATE DATABASE task_manager;
```

Run the migrations:

```bash
php artisan migrate
```

Start the backend server:

```bash
php artisan serve
```

Backend URL: `http://127.0.0.1:8000`

### 3. Configure the React Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create or update `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Start the frontend:

```bash
npm run dev
```

Open the URL displayed in the terminal, usually `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Authenticate a user |
| GET | `/api/tasks` | Retrieve tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

Protected endpoints require authentication.

## Database Design

### Users Table

- `id` — Primary key
- `name` — User name
- `email` — Unique email address
- `role` — User role
- `password` — Hashed password
- `created_at` and `updated_at` — Timestamps

### Tasks Table

- `id` — Primary key
- `user_id` — Foreign key referencing `users.id`
- `title` — Task title
- `description` — Task description
- `status` — Task status
- `priority` — Task priority
- `due_date` — Task due date
- `created_at` and `updated_at` — Timestamps

**Relationship:** One user can have multiple tasks. The `tasks.user_id` foreign key uses `ON DELETE CASCADE`.

## Database Indexes

The following indexes already exist in the database:

| Index | Purpose |
|---|---|
| `users.PRIMARY (id)` | Identifies users by ID |
| `users_email_unique (email)` | Ensures unique emails and supports email lookup |
| `tasks.PRIMARY (id)` | Identifies tasks by ID |
| `tasks_user_id_status_index (user_id, status)` | Supports filtering tasks by user and status |

The existing composite index is reused instead of creating a duplicate index.

## Optimized SQL Queries

### 1. Retrieve Tasks by User and Status

```sql
SELECT id, title, status, priority, due_date
FROM tasks
WHERE user_id = 1
  AND status = 'todo'
ORDER BY id DESC
LIMIT 10;
```

**Optimization:** Uses the existing `(user_id, status)` composite index to support filtering. `LIMIT 10` restricts the result size. Verify the execution plan with `EXPLAIN`.

### 2. Retrieve Tasks with User Details

```sql
SELECT t.id, t.title, t.status, t.priority,
       u.name, u.email
FROM tasks AS t
INNER JOIN users AS u
    ON u.id = t.user_id
ORDER BY t.id DESC
LIMIT 20;
```

**Optimization:** Joins tasks to users through their IDs. The existing index beginning with `tasks.user_id` can support the join. `LIMIT 20` restricts the number of returned rows.

### 3. Count Tasks for Each User

```sql
SELECT u.id, u.name,
       COUNT(t.id) AS total_tasks
FROM users AS u
LEFT JOIN tasks AS t
    ON t.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total_tasks DESC;
```

**Optimization:** The existing index beginning with `tasks.user_id` can help locate each user's tasks. `LEFT JOIN` includes users who have no tasks.

## Query Execution Plan

Use `EXPLAIN` in MySQL Workbench to inspect query execution.

Example:

```sql
EXPLAIN
SELECT id, title, status, priority, due_date
FROM tasks
WHERE user_id = 1
  AND status = 'todo'
ORDER BY id DESC
LIMIT 10;
```

Review the `key`, `type`, `rows`, and `Extra` columns to understand index selection and query execution.

Actual index usage depends on the query plan and database statistics.

## Security and Authorization

- Passwords are stored as hashes.
- Protected API endpoints require authentication.
- Regular users should access only their own tasks.
- Admin users can access all tasks.
- Invalid requests should return appropriate validation errors.
- Unauthorized requests should return appropriate HTTP status codes.

## Running Tests

Run backend tests from the backend directory:

```bash
php artisan test
```

Verify the frontend by starting the Vite development server and testing registration, login, and task operations.

## Future Improvements

- Automated API tests
- Password reset functionality
- Refresh token handling if required by the authentication design
- Additional database performance testing
- Deployment configuration

## Author

**Sharad Chavan**

Full-Stack Web Development Project — Laravel, React, and MySQL
