Problem Statement

Colleges often rely on manual, informal channels — paper forms, WhatsApp groups, or word-of-mouth — to handle student complaints about campus facilities like classrooms, hostels, Wi-Fi, cleanliness, and transportation. This makes it hard for students to track progress and for administrators to prioritize, assign, and resolve issues efficiently. CampusVoice replaces this manual process with a centralized digital platform where students can submit complaints with evidence, track their status in real time, and administrators can review, assign, prioritize, and resolve issues — all with a full audit trail.

Features

Core Features

Student registration and login with JWT-based authentication
Complaint submission with category, location, detailed description, and file/image attachment
Complaint status tracking: Submitted → Under Review → Assigned → In Progress → Resolved → Closed
Student dashboard showing complaint history and current status
Admin console to view, search, and filter all complaints
Department/staff assignment for each complaint
Priority levels: Low / Medium / High / Critical
Admin comments and resolution details
Full CRUD API for complaints
Basic complaint statistics (total, pending, resolved)

Bonus Features

Role-based access (Student / Admin)
Responsive, dark-themed operator-console UI
Search and filter by status, category, and priority
Local file upload support for complaint attachments
Technology Stack

Frontend: Next.js, React, Tailwind CSS, Axios Backend: Node.js, Express.js Database: MongoDB (MongoDB Atlas) Authentication: JSON Web Tokens (JWT), bcrypt for password hashing File Uploads: Multer (local storage; Cloudinary-ready) Deployment: Vercel (frontend), Render (backend), MongoDB Atlas (database)

Screenshots

Add screenshots below by dragging images into this section on GitHub, or referencing an /screenshots folder in the repo.

Login Page
Student Dashboard
Complaint Submission Form
Admin Console (Complaint Management)
Complaint Details / Status Timeline
Live Demo

Frontend (Vercel): https://student-complaint-management-system-delta.vercel.app

Backend

Backend API (Render): https://student-complaint-management-system-0bca.onrender.com

Note: The backend is hosted on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take 30–60 seconds to respond.

Setup Instructions

To run this project locally:

1. Clone the repository
bash
git clone https://github.com/aashritha203/student-complaint-management-system.git
cd student-complaint-management-system
2. Install backend dependencies
bash
cd server
npm install
3. Install frontend dependencies
bash
cd ../client
npm install
4. Configure environment variables

Create a .env file inside server/ and a .env.local file inside client/ (see the Environment Variables section below for required keys).

5. Run the backend
bash
cd server
npm run dev

Server runs at http://localhost:5000

6. Run the frontend

In a separate terminal:

bash
cd client
npm run dev

Frontend runs at http://localhost:3000

Environment Variables
Backend (server/.env)
PORT
MONGO_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FRONTEND_URL
Frontend (client/.env.local)
NEXT_PUBLIC_API_URL
