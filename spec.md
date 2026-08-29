# Project Overview

Build a full-stack **College Complaint Management System (CampusResolve)** that lets students report problems or complaints related to campus facilities — classrooms, laboratories, hostels, Wi-Fi, infrastructure, transportation, cleanliness, and other services — and track those complaints through a defined resolution lifecycle. The system must route complaints to the correct department/admin, allow status updates and staff assignment, support attachments and priority levels, and provide both a student-facing tracking experience and an admin-facing management console. The goal is to replace a manual, informal complaint process with a centralized, auditable, digital complaint tracking system.

**Example Workflow:**
Student → Submit Complaint → Admin Reviews → Assign Department / Staff → Complaint In Progress → Issue Resolved → Student Views Resolution

---

# Tech Stack

**Frontend:** Next.js (Pages Router), React, Tailwind CSS, Zustand, Axios, react-hot-toast (notifications), Chart.js or Recharts (statistics), lucide-react icons.

**Backend:** Node.js, Express, MongoDB, Mongoose, JSON Web Tokens, bcryptjs, express-validator, multer (file/image uploads), helmet, morgan, compression, cors, express-rate-limit.

**File Storage:** Local `/uploads` directory for development, with Cloudinary (or AWS S3) support for production image/file attachments.

**Deployment:** Frontend on Vercel, backend on Render/Railway, MongoDB Atlas for the database. The final application must be a working, publicly accessible deployed link for both frontend and backend.

---

# Authentication & Roles

The authentication system must support:

- Student registration and login (name, email/college ID, password, department, year).
- Admin login (admins are seeded or created by a super-admin; no public admin self-registration).
- JWT-based session handling with access token issued on login.
- Protected routes on both frontend (route guards) and backend (auth middleware).
- A `/auth/me` endpoint to fetch the logged-in user's profile.
- Role separation: `student` and `admin` (optionally a third role `staff` for department-level handlers).
- Password hashing with bcrypt at cost factor 12.
- Persistent login state on the client via Zustand (with token stored securely and rehydrated on refresh).
- Logout functionality that clears client-side session state.

---

# Core Features (Must-Have)

## Student-Facing Features
- **Student Dashboard** — Summary of the student's own complaints (counts by status), quick "New Complaint" action, recent activity.
- **Complaint Submission** — Form to submit a new complaint with category, description, location, and optional attachment.
- **Complaint Categories** — Predefined categories: Classroom, Laboratory, Hostel, Wi-Fi/Network, Infrastructure, Transportation, Cleanliness, Other.
- **Complaint Description** — Rich text or plain text field capturing full issue details.
- **Location of Issue** — Free-text or structured field (building, floor/room, block).
- **Image/File Attachment** — Upload up to a defined limit (e.g., 3 files, 5MB each) as evidence of the issue.
- **Complaint Status Tracking** — Visual tracker through: `Submitted → Under Review → Assigned → In Progress → Resolved → Closed`.
- **Complaint History** — List of all complaints the student has ever submitted, with filters by status/category.
- **Complaint Details Page** — Full view of a single complaint: description, attachments, status timeline, admin comments, assigned department/staff, resolution details.

## Admin-Facing Features
- **Admin Dashboard** — Overview of all complaints across the college with counts by status, category, and priority; recent submissions feed.
- **Admin Complaint Management** — View, search, and manage every complaint submitted by any student.
- **Department/Staff Assignment** — Assign a complaint to a specific department (e.g., Hostel Office, IT Cell, Facilities) and/or a named staff member.
- **Admin Comments and Updates** — Add internal or student-visible comments/notes to a complaint as it progresses.
- **Complaint Status Management** — Update complaint status through the defined lifecycle.
- **Complaint Priority** — Set priority: Low / Medium / High / Critical, editable by admin.
- **Resolution Details** — A dedicated field/section capturing how and when the issue was resolved.
- **Search and Filter Complaints** — By status, category, priority, department, date range, and keyword (description/location).
- **Basic Complaint Statistics** — Charts/summary cards showing complaint volume by category, status distribution, average resolution time, and complaints by department.

## Shared / System Features
- **Complaint Data Storage** — All complaint data persisted in MongoDB with full history.
- **CRUD/API Functionality** — Full REST API for complaints, users, and comments.
- **Frontend–Backend Integration** — Axios-based API service layer with JWT-authenticated requests.
- **Notifications (recommended enhancement)** — In-app notification when a complaint's status changes, visible to the student who filed it.
- **Working Deployed Application** — Publicly accessible, deployed frontend and backend.

---

# Complaint Lifecycle & Status Flow

Every complaint must move through the following statuses, stored as an enum, with each transition timestamped and logged:

`Submitted → Under Review → Assigned → In Progress → Resolved → Closed`

- **Submitted** — Default status on creation.
- **Under Review** — Admin has opened/viewed the complaint.
- **Assigned** — A department and/or staff member has been assigned.
- **In Progress** — Assigned party is actively working on it.
- **Resolved** — Issue fixed; resolution details recorded.
- **Closed** — Student (or admin, after a timeout) confirms closure; no further action expected.

A complaint may also be marked **Rejected/Invalid** by an admin with a mandatory reason, as an alternate terminal state.

Every status change must create a `StatusLog` / timeline entry (who changed it, from what to what, when, optional comment) so the full history is auditable — mirroring an execution-log style audit trail.

---

# Backend Architecture

- **Routes** — Handle HTTP routing, request validation via `express-validator`, and middleware composition (auth, role-check, file upload, error handler).
- **Controllers** — Request parsing and response shaping only; controllers never talk directly to MongoDB.
- **Services** — Own all business logic: complaint CRUD, status-transition rules, assignment logic, comment creation, statistics aggregation, notification creation.
- **Middleware** — `authMiddleware` (JWT verification), `roleMiddleware` (student/admin/staff gating), `uploadMiddleware` (multer config + file-type/size validation), `errorHandler` (centralized error responses).
- **Models Layer** — Mongoose schemas for Users, Complaints, Departments, Comments, Notifications.
- **Config Layer** — Centralizes environment variables, MongoDB connection, and file-upload/storage configuration.

**Rules for the coding agent:** keep controllers thin, push all logic into services, never query MongoDB from a controller, never let a route bypass validation middleware, and treat every secret/config value as `process.env`.

---

# Database Collections

**Users**
`name, email/collegeId, password (select: false), role: student | admin | staff, department, year, phone, createdAt`

**Complaints**
`title, description, category: classroom | laboratory | hostel | wifi | infrastructure | transportation | cleanliness | other, location, priority: low | medium | high | critical, status: submitted | under_review | assigned | in_progress | resolved | closed | rejected, submittedBy (ref User), assignedDepartment, assignedStaff (ref User), attachments: [ {url, fileName, fileType} ], resolutionDetails, createdAt, updatedAt`

**StatusLogs** (complaint audit timeline)
`complaintId (ref), changedBy (ref User), fromStatus, toStatus, comment, timestamp`

**Comments**
`complaintId (ref), author (ref User), authorRole, message, isInternal (admin-only note vs student-visible), createdAt`

**Departments**
`name, description, contactEmail, staffMembers: [ref User]`

**Notifications**
`owner (ref User), complaintId (ref), type: status_change | comment | assignment, title, message, isRead, createdAt`

---

# API Endpoints

## Auth
- `POST /api/auth/register` — Register a new student account.
- `POST /api/auth/login` — Authenticate user, issue JWT.
- `GET /api/auth/me` — Fetch current user profile.

## Complaints
- `GET /api/complaints` — List complaints (student: own only; admin: all, with filters/pagination).
- `POST /api/complaints` — Submit a new complaint (with attachment upload).
- `GET /api/complaints/:id` — Fetch full complaint details including timeline and comments.
- `PUT /api/complaints/:id` — Update complaint (edit by owner while still `Submitted`, or admin fields).
- `PATCH /api/complaints/:id/status` — Admin updates complaint status (creates a StatusLog entry).
- `PATCH /api/complaints/:id/assign` — Admin assigns department/staff.
- `PATCH /api/complaints/:id/priority` — Admin sets/updates priority.
- `DELETE /api/complaints/:id` — Delete/withdraw a complaint (owner, while still `Submitted`).

## Comments
- `GET /api/complaints/:id/comments` — List comments/updates on a complaint.
- `POST /api/complaints/:id/comments` — Add a comment/update (admin or student).

## Departments
- `GET /api/departments` — List departments for assignment dropdowns.
- `POST /api/departments` — Create a department (admin only).

## Statistics
- `GET /api/stats/dashboard` — Aggregated counts by status/category/priority, average resolution time.

## Notifications
- `GET /api/notifications` — List current user's notifications.
- `PATCH /api/notifications/:id/read` — Mark a notification as read.

## Health
- `GET /api/health` — System heartbeat and status check.

---

# Frontend Pages

The application uses the Next.js Pages Router. The root `/` redirects authenticated users to their role-appropriate dashboard and unauthenticated users to `/login`.

- `/` — Landing page introducing the platform, how it works, CTA to login/register.
- `/login` — Email/password login form with JWT handling and Zustand persistence.
- `/register` — Student registration form with validation.
- `/dashboard` — Student dashboard: complaint summary cards, "New Complaint" button, recent complaints list.
- `/complaints/new` — Complaint submission form (category, description, location, attachment upload).
- `/complaints` — Student's complaint history list with status filters.
- `/complaints/[id]` — Complaint details page: description, attachments, status timeline, comments, resolution info.
- `/admin/dashboard` — Admin overview: stats cards, charts, recent complaints feed.
- `/admin/complaints` — Full complaint management table: search, filter (status/category/priority/department), pagination, bulk view.
- `/admin/complaints/[id]` — Admin complaint detail/management view: status update, assignment, priority, comments, resolution entry.
- `/admin/departments` — Manage departments and staff.
- `/settings` — Profile management, password change, role details.

---

# Folder Structure

## Frontend Structure
```
client/
└── src/
    ├── components/
    │   ├── AppShell/
    │   ├── ComplaintCard/
    │   ├── ComplaintForm/
    │   ├── StatusTracker/
    │   ├── StatusBadge/
    │   ├── AttachmentUploader/
    │   ├── StatsCards/
    │   └── ProtectedRoute/
    ├── pages/
    │   ├── _app.js
    │   ├── index.js
    │   ├── login.js
    │   ├── register.js
    │   ├── dashboard.js
    │   ├── settings.js
    │   ├── complaints/
    │   │   ├── index.js
    │   │   ├── new.js
    │   │   └── [id].js
    │   └── admin/
    │       ├── dashboard.js
    │       ├── departments.js
    │       └── complaints/
    │           ├── index.js
    │           └── [id].js
    ├── store/
    │   ├── authStore.js
    │   └── complaintStore.js
    └── services/
        └── api.js
```

## Backend Structure
```
server/
└── src/
    ├── config/
    │   ├── env.js
    │   ├── db.js
    │   └── upload.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── complaintRoutes.js
    │   ├── commentRoutes.js
    │   ├── departmentRoutes.js
    │   ├── statsRoutes.js
    │   └── notificationRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── complaintController.js
    │   ├── commentController.js
    │   ├── departmentController.js
    │   └── statsController.js
    ├── services/
    │   ├── authService.js
    │   ├── complaintService.js
    │   ├── commentService.js
    │   ├── notificationService.js
    │   └── statsService.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── roleMiddleware.js
    │   ├── uploadMiddleware.js
    │   └── errorHandler.js
    └── models/
        ├── User.js
        ├── Complaint.js
        ├── StatusLog.js
        ├── Comment.js
        ├── Department.js
        └── Notification.js
```

---

# Development Phases

**Phase 1:** Project setup — Next.js, Express, MongoDB connection, JWT authentication, Zustand auth store, AppShell layout, role-based route protection.

**Phase 2:** Complaint CRUD — submission form with category/location/attachment, complaint listing (student view), complaint details page, status timeline UI.

**Phase 3:** Admin console — admin complaint management table, search/filter/pagination, status update, priority setting, department/staff assignment.

**Phase 4:** Comments & resolution flow — admin/student comment threads, resolution details capture, status-transition audit logging (StatusLog).

**Phase 5:** Statistics & notifications — dashboard charts (by status/category/department), average resolution time calculation, in-app notification drawer on status change.

**Phase 6:** Polish, security hardening, and deployment — responsive UI pass, rate limiting, input validation audit, deploy frontend (Vercel) and backend (Render/Railway) with MongoDB Atlas.

---

# UI/UX Requirements

- Clean, accessible, responsive design using Tailwind, usable on mobile (students filing complaints from hostels) and desktop (admin console).
- Loading states and skeleton loaders for lists and detail pages.
- Color-coded status badges (e.g., grey = Submitted, blue = Under Review, yellow = Assigned, orange = In Progress, green = Resolved, dark grey = Closed).
- A visual step-tracker component on the complaint details page showing progress through the lifecycle.
- Priority indicated with color and icon (Low/Medium/High/Critical).
- Drag-and-drop or click-to-upload attachment component with image preview and file-type/size validation feedback.
- Admin table with sticky headers, sortable columns, and inline status/priority quick actions.
- Notification bell/drawer in the AppShell showing unread status-change alerts.
- Empty states for "no complaints yet" and "no results for this filter."

---

# Security Requirements

- Hash passwords with bcrypt at cost 12.
- Sign and verify JWTs with a `JWT_SECRET` environment variable; tokens expire and require re-login.
- Set HTTP security headers via `helmet`.
- Apply CORS limited to the deployed `CLIENT_URL`.
- Rate-limit auth endpoints (and complaint submission) via `express-rate-limit` to prevent spam/abuse.
- Validate every request body with `express-validator` (server-side, never trust client-side validation alone).
- Enforce role checks on every admin-only route (`roleMiddleware`) — a student token must never be able to hit admin endpoints.
- Validate uploaded file types/sizes server-side (not just in the UI) to prevent malicious uploads.
- Ensure students can only view/edit their own complaints; admins can view all but actions are logged with `changedBy`.
- Never expose password hashes in any API response (`select: false` on the field).

---

# Final Expected Outcome

The completed platform must let a student log in, describe a campus issue with category, location, and optional photo evidence, submit it, and track its progress in real time through a clear visual status tracker. An admin must be able to log in to a dedicated console, see every complaint across campus, filter and search them, assign the right department or staff member, update priority and status, leave comments, and record how the issue was ultimately resolved — with every change captured in an auditable timeline. The final application should feel like a lightweight, purpose-built help-desk/ticketing system tailored specifically to a college campus, replacing informal complaint channels (paper forms, WhatsApp groups, word-of-mouth) with a transparent, trackable digital system — and must be fully deployed and publicly accessible.

---

# Codex & AI Agent Implementation Instructions

The AI coding agent must build the application phase by phase, following the folder structure strictly. Controllers must stay thin and push all logic into services. The agent must never call MongoDB directly from a controller, must wrap every file upload through the `uploadMiddleware`, must treat every secret and config value as `process.env`, must create a `StatusLog` entry for every complaint status change (no silent status updates), must enforce role middleware on every admin-only route, must validate every incoming request body with `express-validator`, must keep student and admin views/permissions strictly separated at the API layer (not just hidden in the UI), and must report the list of files created or changed at the end of every development phase.