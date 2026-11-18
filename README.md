# CIS 3339 Homework 1 – Student Records (Vue 3 + Express + MongoDB)

A full-stack student, course, and enrollment management system.

- **Frontend:** Vue 3 (Composition API, `<script setup>`), Vue Router, Pinia, built with Vite
- **Backend:** Node.js + Express 5 REST API
- **Database:** MongoDB Community Edition (local) via Mongoose

The original assignment instructions are kept in [`docs/ASSIGNMENT.md`](docs/ASSIGNMENT.md) and the reference screenshots in [`images/`](images/).

---

## Required software

| Software | Version |
| --- | --- |
| Node.js | 20.19 or newer (22 LTS recommended) |
| npm | 10 or newer (included with Node.js) |
| MongoDB Community Edition | 6.0 or newer, running locally on port 27017 |
| A modern web browser | Chrome, Edge, Firefox, or Safari |

## Environment variables

The real `.env` file is committed at the **repository root**. It contains no passwords or secrets:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
PORT=3000
```

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Local MongoDB connection string. The `cis3339_homework1` database does not need to exist yet. |
| `PORT` | Port for the Express server (default `3000`). |

## Start MongoDB Community Edition

Start the local MongoDB service before starting the app.

- **Windows:** MongoDB normally runs as the `MongoDB` service. If it is stopped, open *Services* and start **MongoDB Server**, or run `net start MongoDB` in an Administrator terminal.
- **macOS (Homebrew):** `brew services start mongodb-community`
- **Linux (systemd):** `sudo systemctl start mongod`

Check that it is running with `mongosh --eval "db.runCommand({ ping: 1 })"`.

No database setup is needed. On startup the server creates the `students`, `courses`, and `enrollments` collections and their indexes automatically, even if the database is empty or does not exist.

## Install, build, and run

Run these commands from the **repository root**:

```bash
npm install      # installs backend and frontend dependencies (npm workspaces)
npm run build    # builds the Vue app into frontend/dist
npm start        # starts Express, which serves the API and the built app
```

Then open **http://localhost:3000**.

You should see `Server is running at http://localhost:3000` and `Connected to MongoDB database "cis3339_homework1"` in the terminal. If MongoDB is not running yet, the server keeps running and retries every 5 seconds. API requests return a clear `503` error until the database is available.

### Development mode (optional)

Run these in two terminals for hot reload:

```bash
npm run dev:backend    # Express on http://localhost:3000 (restarts on change)
npm run dev:frontend   # Vite on http://localhost:5173 (proxies /api to :3000)
```

---

## Features

| Area | What you can do |
| --- | --- |
| **Students** (`/students`) | Add a student (name, student ID, phone, ZIP), search by part of a name or an exact ID, show all students, and delete a student. Deleting a student also removes their enrollments. |
| **Courses** (`/courses`) | Add a course (course ID, name), list all courses with their enrollment counts, and delete a course. Deleting a course also removes its enrollments. |
| **Enrollments** (`/enrollments`) | Pick an existing student and course from lists loaded from the API, enroll the student, view any course's roster, and remove a single enrollment. The selected course is kept in the URL (`?course=CIS%203339`), so refreshing keeps the roster open. |

Validation and integrity rules:

- All fields are required. Student ID must be 1–10 digits. Phone must contain 7–15 digits. ZIP must be `12345` or `12345-6789`.
- Course IDs are normalized (trimmed, single spaces, uppercase), so `cis  3339` and `CIS 3339` count as the same course.
- Duplicate student IDs, course IDs, and enrollments are rejected with `409 Conflict`. Unique MongoDB indexes also enforce this, so simultaneous requests cannot create duplicates.
- An enrollment can only reference a student and course that exist (`404` otherwise).
- The UI shows loading, empty, success (toast), validation, and error states, and asks for confirmation before deleting anything.

---

## Project structure

```
.
├── .env                      # committed local MongoDB configuration
├── package.json              # root scripts + npm workspaces (backend, frontend)
├── backend/
│   ├── server.js             # entry point: starts HTTP server, connects to MongoDB
│   └── src/
│       ├── app.js            # Express app: API routes, static files, SPA fallback
│       ├── config/           # env loading, MongoDB connection + auto-initialization
│       ├── middleware/       # error handler, database-ready guard
│       ├── models/           # Mongoose schemas: Student, Course, Enrollment
│       ├── routes/           # students, courses, enrollments routers
│       └── utils/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.js           # creates app, installs Pinia + Router
│       ├── App.vue           # layout shell
│       ├── router/           # Vue Router (history mode)
│       ├── stores/           # Pinia: students, courses, enrollments, notifications, confirm
│       ├── services/api.js   # fetch wrapper for the REST API
│       ├── utils/validators.js
│       ├── components/       # base/ (inputs, table, buttons…), layout/, students/, courses/, enrollments/
│       └── views/            # StudentsView, CoursesView, EnrollmentsView, NotFoundView
├── docs/ASSIGNMENT.md
└── images/                   # reference screenshots from the assignment
```

## REST API

All responses are JSON. Errors have the shape `{ "error": "message", "details"?: { field: message } }`.

| Method | Endpoint | Description | Success |
| --- | --- | --- | --- |
| GET | `/api/health` | Server and database status | 200 |
| GET | `/api/students?search=text` | All students, or a name/ID search | 200 |
| GET | `/api/students/:studentId` | One student | 200 / 404 |
| POST | `/api/students` | Body: `{ studentId, name, phone, zip }` | 201 / 400 / 409 |
| DELETE | `/api/students/:studentId` | Delete a student and their enrollments | 200 / 404 |
| GET | `/api/courses` | All courses with `enrollmentCount` | 200 |
| POST | `/api/courses` | Body: `{ courseId, name }` | 201 / 400 / 409 |
| DELETE | `/api/courses/:courseId` | Delete a course and its enrollments | 200 / 404 |
| GET | `/api/courses/:courseId/students` | Course roster | 200 / 404 |
| DELETE | `/api/courses/:courseId/students/:studentId` | Remove one enrollment | 200 / 404 |
| POST | `/api/enrollments` | Body: `{ studentId, courseId }` | 201 / 400 / 404 / 409 |

If MongoDB is unreachable, every `/api` route except `/api/health` returns `503`.

## Data model

- **students**: `studentId` (unique), `name`, `phone`, `zip`, timestamps
- **courses**: `courseId` (unique, normalized), `name`, timestamps
- **enrollments**: `student` (ObjectId → students), `course` (ObjectId → courses), timestamps. A unique compound index on `{ student, course }` prevents duplicate enrollments.

## Troubleshooting

- **"MongoDB connection failed … ECONNREFUSED":** MongoDB is not running. Start it (see above); the server reconnects automatically.
- **"Frontend build not found":** run `npm run build`, then restart with `npm start`.
- **"Port 3000 is already in use":** stop the other process or change `PORT` in `.env`.
