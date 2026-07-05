# Student Information Management System (SIMS)

An enterprise-grade, full-stack, Role-Based Access Control (RBAC) portal engineered with a unified React 19 frontend, Express backend, interactive API sandbox, and relational database visualizers. SIMS is designed to provide academic institutions with a unified interface to streamline student directories, course catalogs, grade ledger publishing, and faculty assignments.

---

## 🚀 Key Modules & Capabilities

### 1. Unified Dashboard
- **Dynamic Metrics**: Tracking Active Students, Course Counts, Faculty Lecturers, and Total Semester Enrollments.
- **Data Visualizations**: Built-in visual metrics mapping students per department, enrollment trends across academic semesters, and letter-grade distributions.

### 2. Student & Lecturer Directories
- **Comprehensive Listings**: Advanced directory structures with support for pagination, search, sorting, and multi-field status filtering.
- **RBAC Guardrails**:
  - **Admins & Lecturers**: Retain full CRUD access to student dossiers and lecturer registrations.
  - **Students**: Scoped to view and edit only their personal profile details.

### 3. Course Catalog & Enrollments Ledger
- **Academic Syllabi**: Comprehensive cataloging specifying course codes, credit hours, semesters, and lecturing professor assignments.
- **Registration Workflows**:
  - Students can self-enroll in active courses or process course drops (which archives their progress).
  - Instructors can publish official academic grade awards (A through F scale) and update enrollment completions.

### 4. Interactive Database ER Diagram
- **SVG Canvas**: Interactive, high-contrast, clickable entity-relationship layout mapping out the 3rd Normal Form (3NF) MySQL schema.
- **Metadata Inspector**: Click any diagram table node (e.g., `USER`, `STUDENT`, `COURSE`, `ENROLLMENT`) to instantly load its column constraints, data types, and primary/foreign key relationships.

### 5. Interactive REST API Playground
- **Live Sandbox**: Integrated API playground displaying all supported backend endpoints (Auth, Students, Courses, Departments, Enrollments).
- **Execution Engine**: Configure real-time parameters and request payloads, send live HTTP requests, and inspect raw JSON output along with network latency/HTTP status codes.

### 6. Spring Boot 3 Blueprint Explorer
- **Production Blueprints**: Native file explorer containing Java 17 + Spring Boot 3 enterprise code.
- **Architecture Mockup**: Showcases standard Java design patterns, including JPA Entity Associations, Spring Security Web Filters, Controller REST layers, and Global Exception Handlers.

---

## 🛠️ Technology Stack & Architecture

### Frontend (Single Page Application)
- **Framework**: React 19 (Functional components, hooks, local persistence)
- **Bundler & Tooling**: Vite 6, TypeScript 5.8
- **Styling**: Tailwind CSS (with highly customized color themes and responsive desktop-first grids)
- **Icons**: Lucide React

### Backend (Full-Stack Express)
- **API Server**: Express (Node.js) mounted alongside Vite in development via middleware integration
- **Security & Session**: Simulated Stateless JWT Authentication with secure Base64-encoded tokens, role authorization filters, and plain-text verify hooks
- **Bundler**: Esbuild (Bundles `server.ts` into a single, optimized `dist/server.cjs` file to bypass strict ESModule relative pathing)

---

## 🔄 Project Workflows

### Authentication & Authorization Flow
```
[User Login Screen] 
       │
       ▼ (Sends Credentials)
[POST /api/auth/login] ──► (Validates password & role mapping)
       │
       ▼ (Issues Secure base64 JWT)
[Local Storage Session] ──► (Saves Token and Scoped User State)
       │
       ▼ (Appends Authorization: Bearer <Token> to all headers)
[Scoped API Request Routing] ──► [RequireRoles(ADMIN, LECTURER) Middleware Check]
```

### Academic Enrollment & Grading Workflow
```
[Student Interface] ──► (Enrolls in Course) ──► [POST /api/enrollments] (Initializes: "ENROLLED")
                                                              │
[Lecturer Interface] ──► (Reviews Active Class) ──────────────┤
                                                              ▼
[Lecturer Assigns Grade] ──► [PUT /api/enrollments/:id] (Updates Letter Grade & completed status)
```

---

## 💻 Developer Guide & Commands

### 1. Installation
Clone the workspace and install standard NPM packages:
```bash
npm install
```

### 2. Development Mode
Launches the full-stack system in development. This boots `tsx` to run the Express backend on port `3000` and configures Vite in middleware mode with Hot Module Replacement (HMR) bypass:
```bash
npm run dev
```

### 3. Production Build
Compiles frontend static assets inside `dist/` and bundles the Express server into `dist/server.cjs` via `esbuild`:
```bash
npm run build
```

### 4. Production Start
Spins up the compiled application server in standalone production mode:
```bash
npm run start
```

---

## 🗄️ Database Schema Blueprint

The architecture is built on a clean 3rd Normal Form (3NF) relational schema:

1. **`ROLE`**: `id` (PK), `name` (Admin, Lecturer, Student)
2. **`USER`**: `id` (PK), `username`, `password`, `email`, `role_id` (FK), `associated_id` (Nullable student/lecturer link)
3. **`DEPARTMENT`**: `id` (PK), `name`, `code` (Unique), `description`
4. **`STUDENT`**: `id` (PK), `student_number` (Unique), `first_name`, `last_name`, `gender`, `date_of_birth`, `phone_number`, `email`, `address`, `admission_date`, `status`, `department_id` (FK)
5. **`LECTURER`**: `id` (PK), `staff_number` (Unique), `first_name`, `last_name`, `email`, `phone_number`, `office`, `department_id` (FK)
6. **`COURSE`**: `id` (PK), `course_code` (Unique), `course_name`, `credit_hours`, `semester`, `academic_year`, `department_id` (FK), `lecturer_id` (FK, Nullable)
7. **`ENROLLMENT`**: `id` (PK), `student_id` (FK), `course_id` (FK), `semester`, `academic_year`, `enrollment_date`, `grade` (Nullable letter), `status` (ENROLLED, COMPLETED, DROPPED)
