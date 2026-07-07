# Harry Potter API Clone

**🔗 Live App:** https://hp-api-clone-1.onrender.com

A full-stack CRUD application inspired by the Harry Potter universe, built as a MERN stack training project.

## Live Demo

- **Frontend:** https://hp-api-clone-1.onrender.com
- **Backend API:** https://hp-api-clone.onrender.com/api

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Atlas), Mongoose, JWT Authentication, Cloudinary, Resend, Google Apps Script (Sheets webhook)
**Frontend:** React (Vite), Tailwind CSS, React Router, Axios

## Features

- Full CRUD for Characters, Houses, Students, and Staff
- JWT-based authentication (register/login)
- Search characters by name
- Filter characters by house
- Pagination on list endpoints
- Character image upload via Cloudinary
- Email notification (Resend) on new character creation
- Automatic logging of submissions to a Google Sheet
- Admin-only view of all submissions

## Folder Structure

hp-api-clone/
├── backend/     # Express API, MongoDB models, auth, controllers
└── frontend/    # React app (Vite + Tailwind)

## Setup

### 1. Clone the repo
git clone https://github.com/Abhinaykomera/hp-api-clone.git
cd hp-api-clone

### 2. Backend setup
cd backend
npm install

Create a `.env` file based on `.env.example` with:
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
NOTIFY_EMAIL=
GOOGLE_SHEETS_WEBHOOK_URL=
FRONTEND_URL=
PORT=5000
NODE_ENV=development

Run the server:
npm run dev

### 3. Frontend setup
cd frontend
npm install

Create a `.env` file with:
VITE_API_URL=http://localhost:5000/api

Run the app:
npm run dev

App runs at http://localhost:5173, backend at http://localhost:5000.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login, returns JWT |
| GET/POST/PUT/DELETE | /api/houses | House CRUD |
| GET/POST/PUT/DELETE | /api/characters | Character CRUD (supports ?name=, ?house=, ?page=, ?limit=) |
| GET/POST/PUT/DELETE | /api/students | Student CRUD |
| GET/POST/PUT/DELETE | /api/staff | Staff CRUD |
| POST | /api/characters/:id/image | Upload character image |
| GET | /api/submissions | Admin-only view of logged submissions |

## Deployment

Both frontend and backend are deployed on Render:
- Backend as a Web Service (Root Directory: `backend`, Build: `npm install`, Start: `npm start`)
- Frontend as a Static Site (Root Directory: `frontend`, Build: `npm install && npm run build`, Publish Directory: `dist`)

## Postman Collection

Available at `backend/postman/hp-api-clone.postman_collection.json`
