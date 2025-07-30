# Employee Attendance Management System

A MERN stack application for managing employee attendance with CRUD operations.

## Features
- Employee account management
- Attendance marking (check-in/check-out)
- View attendance records
- Employee dashboard

## Tech Stack
- Frontend: React with TypeScript
- Backend: Node.js with Express and TypeScript
- Database: MongoDB
- Authentication: JWT

## Project Structure
```
├── backend/          # Node.js TypeScript API
├── frontend/         # React TypeScript app
└── README.md
```

## Setup Instructions

### Local Development

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

### Docker Setup

#### Production (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

#### Development with Docker
```bash
# Start only MongoDB with Docker
docker-compose -f docker-compose.dev.yml up mongodb -d

# Then run backend and frontend locally
cd backend && npm run dev
cd frontend && npm start
```

#### Individual Container Builds
```bash
# Build backend image
docker build -t attendance-backend ./backend

# Build frontend image
docker build -t attendance-frontend ./frontend

# Run backend container
docker run -p 5001:5001 --env-file backend/.env.production attendance-backend

# Run frontend container
docker run -p 3001:80 attendance-frontend
```

### Environment Variables
Create a `.env` file in the backend directory:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=your_jwt_secret_key_here
```

## API Endpoints
- POST /api/auth/register - Register employee
- POST /api/auth/login - Login employee
- GET /api/employees - Get all employees
- POST /api/attendance/checkin - Check in
- POST /api/attendance/checkout - Check out
- GET /api/attendance/:employeeId - Get attendance records