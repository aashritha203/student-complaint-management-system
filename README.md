# College Complaint Management System — CampusVoice

CampusVoice is a fully responsive, secure full-stack platform built with **Next.js**, **Express**, **Zustand**, and **MongoDB** mapping role-based complaint reporting, triage, workload delegation, and resolution logs.

---

## Project Architecture

```
student managemnt/
├── client/          # Next.js React Frontend App
│   ├── src/
│   │   ├── components/  # Layout, StatusBadges, FileUpload preview loaders
│   │   ├── pages/       # Login, Register, Dashboards, incidents triage
│   │   ├── store/       # Zustand auth persistence slices
│   │   └── utils/       # Custom instance Axios API
├── server/          # Node.js + Express REST API Server
│   ├── uploads/     # Local static attachments storage directory
│   ├── src/
│   │   ├── config/      # Database connect wrappers & Cloudinary setup
│   │   ├── controllers/ # Auth, Complaints, and Admin metrics logic
│   │   ├── models/      # Mongoose schemas: User, Complaint, Comment
│   │   ├── routes/      # Express endpoint mappings
│   │   └── services/    # Business rules handlers
```

---

## Deployment & Setup Instructions

### 1. Prerequisite Environments
- **Node.js** (v18+ recommended)
- **MongoDB** Instance (Atlas Cluster URI or local daemon)

### 2. Backend Config & Boot
1. Navigate to the backend directory:
   ```bash
   cd server
   ```
2. Configure your environment properties in standard format inside **`server/.env`**:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://aashritha203_db_user:lY1tF6esMzVIvS78@complaintmanagement.ejfeorl.mongodb.net/?appName=complaintmanagement
   JWT_SECRET=supersecretjwtsecretkeyforcollegesystem12345
   ```
3. Boot the backend server instance locally:
   ```bash
   npm run dev
   ```
   *Expected outcome: `Server listening on port 5000` & `MongoDB Connected: <cluster_host>`*

### 3. Frontend Client Setup & Boot
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```
2. Launch the Next.js development client server:
   ```bash
   npm run dev
   ```
   *The application will boot at **`http://localhost:3000`***

---

## Workflow Guide

### Role Accounts Designation
1. **Admin User:** The system checks credentials role inputs. Open `/register` to create your master administrator or staff account.
2. **Student Account:** Sign up as a `student` to file complaint logs, attach images/PDF proofs, view track timelines, and post comments.
3. **Staff Triage:** Staff or admin logs in to see the overview graphs, search/filter tickets, assign personnel to cases, edit severity, and append resolution summaries.
