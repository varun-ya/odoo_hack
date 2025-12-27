# GearGuard - Maintenance Management System

A complete maintenance management system with role-based access control, equipment tracking, and workflow management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- A web server for frontend (Live Server, http-server, etc.)

### Backend Setup

1. **Start MongoDB** (make sure it's running on localhost:27017)

2. **Run the backend setup script:**
   ```bash
   # Double-click start-backend.bat or run in command prompt:
   start-backend.bat
   ```

   This will:
   - Install dependencies
   - Seed the database with initial data
   - Start the server on http://localhost:5000

### Frontend Setup

1. **Serve the frontend files** using any web server:
   ```bash
   # Using Live Server (VS Code extension) - recommended
   # Right-click on frontendd/index.html and select "Open with Live Server"
   
   # OR using http-server (install globally: npm install -g http-server)
   cd frontendd
   http-server -p 3000
   
   # OR using Python
   cd frontendd
   python -m http.server 3000
   ```

2. **Access the application** at http://localhost:3000 (or your server port)

## 👥 Login Credentials

After seeding, use these credentials to test different roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gearguard.com | Admin123! |
| Manager | manager@gearguard.com | Manager123! |
| Technician | technician@gearguard.com | Tech123! |
| User | user@gearguard.com | User123! |

## 🔄 Complete Workflow

### 1. **Application Start & User Entry**
- User opens application → Login/Sign-up page
- Frontend validates credentials via backend API
- Backend creates session/token → User redirected to Dashboard

### 2. **Dashboard Load Flow**
- Dashboard loads user details and allowed modules based on role
- Displays menu bar with Equipment, Maintenance Requests, Test Activity, etc.

### 3. **Navigation via Menu/Dashboard**
- User clicks any option → Frontend changes route and requests module data
- Backend verifies access and fetches required data → Frontend renders page

### 4. **Equipment Module Workflow**
- **Add Equipment**: Admin/Manager creates equipment → Backend assigns default maintenance team
- **View Equipment**: Frontend requests all equipment → Backend fetches from MongoDB
- **Equipment Maintenance Button**: Shows related maintenance requests for specific equipment

### 5. **Maintenance Request Creation**
- **Corrective (Breakdown)**: User creates request → Backend auto-fetches category & team
- **Preventive (Scheduled)**: Manager schedules future maintenance → Appears in Kanban & Calendar

### 6. **Kanban Board Workflow**
- Frontend requests all maintenance requests → Backend groups by status
- Drag & drop updates request status → Backend validates transitions → MongoDB updated

### 7. **Technician Assignment**
- Manager assigns technician → Backend verifies team membership → Request visible to assigned technician

### 8. **Repair Completion**
- Technician marks as repaired → Backend saves duration and completion time → Card moves to Repaired column

### 9. **Overdue Detection**
- Backend automatically compares scheduled vs current date → Sets overdue flag → Frontend shows red indicator

### 10. **Scrap Workflow**
- Request moved to Scrap → Backend marks equipment as scrapped → Blocks new requests

### 11. **Test Activity Workflow**
- User clicks Test Activity → Backend checks test status → Frontend shows appropriate actions
- User starts/continues test → Backend saves progress → Test completion locks test

## 📁 Project Structure

```
odooooo/
├── backendd/                 # Backend API
│   ├── controllers/          # Business logic
│   ├── models/              # Database schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Authentication & authorization
│   ├── server.js            # Main server file
│   ├── seed.js              # Database seeding
│   └── .env                 # Environment variables
├── frontendd/               # Frontend application
│   ├── js/api.js            # API service layer
│   ├── signin/              # Login page
│   ├── signup/              # Registration page
│   ├── equipment/           # Equipment management
│   ├── testactivity/        # Maintenance request form
│   ├── index.html           # Main dashboard
│   └── kanban.html          # Kanban board
└── start-backend.bat        # Backend startup script
```

## 🔧 Key Features

- **Role-based Access Control**: Admin, Manager, Technician, User roles
- **Equipment Management**: Track equipment with maintenance teams
- **Maintenance Workflows**: Corrective and preventive maintenance
- **Kanban Board**: Visual workflow management
- **Test Activities**: Interactive maintenance training/testing
- **Overdue Detection**: Automatic identification of delayed maintenance
- **Scrap Management**: Equipment lifecycle management

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Maintenance Requests
- `GET /api/maintenance` - Get all requests (role-filtered)
- `POST /api/maintenance` - Create new request
- `PUT /api/maintenance/:id` - Update request
- `GET /api/maintenance/kanban` - Get kanban board data

### Equipment
- `GET /api/equipment` - Get all equipment
- `POST /api/equipment` - Create equipment (admin/manager)
- `PUT /api/equipment/:id` - Update equipment

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team

### Test Activities
- `GET /api/test-activity` - Get user test activities
- `POST /api/test-activity/start` - Start test activity
- `PUT /api/test-activity/:id/complete` - Complete test

## 🔒 Security Features

- JWT-based authentication
- Role-based authorization
- Password complexity validation
- Protected API endpoints
- Input validation and sanitization

## 🚨 Troubleshooting

1. **Backend won't start**: Ensure MongoDB is running on localhost:27017
2. **Login fails**: Check if database was seeded properly (run `node seed.js`)
3. **CORS errors**: Make sure backend is running on port 5000
4. **Frontend not loading**: Ensure you're serving the frontend files via a web server

## 📝 Development Notes

- Backend runs on port 5000
- Frontend should be served on port 3000 (or any other port)
- MongoDB database name: `hack`
- JWT secret can be changed in `.env` file

## 🎯 Usage Flow Summary

**User clicks → Frontend sends request → Backend validates → Database updates → Backend responds → Frontend updates UI**

This covers the entire project workflow from user authentication to maintenance completion!