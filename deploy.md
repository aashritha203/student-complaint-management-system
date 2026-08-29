# Deployment Guide: College Complaint Management System

This document outlines the step-by-step instructions to initialize a Git repository and deploy both parts of the application:
1. **Backend** API service on **Render**
2. **Frontend** web app on **Vercel**

---

## Step 1: Git Repository Setup

First, open your local terminal in the project root (`student managemnt/`) and execute the following commands to initialize Git:

```bash
# Initialize Git repository
git init

# Add all files to staging index (will respect the root .gitignore)
git add .

# Create the initial commit
git commit -m "Initialize project and prepare deployment paths"

# Add your remote GitHub repository address
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# Set default branch to main and push
git branch -M main
git push -u origin main
```

---

## Step 2: Backend API Deployment on Render

1. Log in to [Render](https://render.com/).
2. Select **New** ▸ **Web Service**.
3. Choose **Connect a repository** and select your newly created GitHub repository.
4. Set the following configuration settings:
   - **Name:** `college-complaints-api` (or any custom name)
   - **Region:** Choose a region close to your user base.
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Advanced** to add the following **Environment Variables**:
   - `JWT_SECRET`: `supersecretjwtsecretkeyforcollegesystem12345` *(or generate a secure random secret key)*
   - `MONGO_URI`: `mongodb+srv://aashritha203_db_user:[PASSWORD]@complaintmanagement.ejfeorl.mongodb.net/?appName=complaintmanagement` *(Replace `[PASSWORD]` with your active database password)*
   - `NODE_ENV`: `production`
6. Click **Create Web Service**. Once the build completes, Render will provide a Live URL (e.g., `https://college-complaints-api.onrender.com`). **Copy this URL**.

---

### Step 2b: MongoDB Atlas Whitelist Rule (CRITICAL for Render)

Render web services use dynamic IP addresses. Therefore, you must allow Atlas queries from any IP during deployment:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Navigate to **Network Access** under the Security tab in the sidebar.
3. Click **Add IP Address**.
4. In the dialog, select **Allow Access From Anywhere** (which inputs `0.0.0.0/0`).
5. Click **Confirm** and wait for the status to change to *Active*.

---

## Step 3: Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** ▸ **Project**.
3. Import your GitHub repository.
4. Set the following configure project properties:
5. Under **Framework Preset**, select **Next.js**.
6. Set the **Root Directory** configuration to: `client`
7. Click the **Environment Variables** accordion and add the following variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** Set this to your deployed Render live backend API URL (e.g. `https://college-complaints-api.onrender.com/api`)
8. Click **Deploy**. Vercel will build your client application and produce a live host address.

---

## Step 4: Add FRONTEND_URL to Backend for secure CORS (Production Security)

Once Vercel gives you your deployed frontend address (e.g., `https://student-managemnt.vercel.app`), configure CORS security:
1. Go to your **Render Web Service** dashboard ▸ **Environment**.
2. Click **Add Environment Variable** and enter:
   - **Key:** `FRONTEND_URL`
   - **Value:** Your Vercel frontend address URL (e.g., `https://student-managemnt.vercel.app`)
3. Save changes. Render will automatically redeploy the backend with proper CORS white-listing enabled!

