# Equipment Management System API

## Setup
1. Install dependencies: `npm install`
2. Create `.env` file with MongoDB connection string and JWT secret
3. Start server: `npm start`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user

### Equipment
- GET `/api/equipment` - Get all equipment
- GET `/api/equipment/:id` - Get equipment by ID
- POST `/api/equipment` - Create equipment
- PUT `/api/equipment/:id` - Update equipment
- DELETE `/api/equipment/:id` - Delete equipment

### Maintenance Requests
- GET `/api/maintenance` - Get all maintenance requests
- GET `/api/maintenance/:id` - Get maintenance request by ID
- POST `/api/maintenance` - Create maintenance request
- PUT `/api/maintenance/:id` - Update maintenance request
- DELETE `/api/maintenance/:id` - Delete maintenance request

### Teams
- GET `/api/teams` - Get all teams
- GET `/api/teams/:id` - Get team by ID
- POST `/api/teams` - Create team
- PUT `/api/teams/:id` - Update team
- DELETE `/api/teams/:id` - Delete team

All endpoints except auth require JWT token in Authorization header.