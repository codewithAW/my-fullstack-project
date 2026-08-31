# Backend Boilerplate

This is the backend for the MERN boilerplate project. It uses Node.js, Express.js, and MongoDB (via Mongoose).

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure you have MongoDB running locally (default URI `mongodb://localhost:27017/hackathon-boilerplate`), or update `MONGO_URI` to your MongoDB Atlas connection string. Make sure to choose a secure string for `JWT_SECRET`.

### 3. Start the server
To start the backend server in development mode:
```bash
npm run dev
```
To start it normally:
```bash
node src/server.js
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login a user and get JWT
- `GET /api/auth/me` - Get current authenticated user (Requires Authorization header: `Bearer <token>`)

### Projects
All project endpoints require the `Authorization: Bearer <token>` header.
- `GET /api/projects` - Get all projects for logged-in user
- `POST /api/projects` - Create a project
- `GET /api/projects/:id` - Get a single project by ID
- `PUT /api/projects/:id` - Update a project by ID
- `DELETE /api/projects/:id` - Delete a project by ID

## Project Structure
- `src/config/db.js` - MongoDB connection logic
- `src/controllers/` - Route handlers
- `src/middleware/` - Custom middleware for error handling and authentication validation
- `src/models/` - Mongoose schemas (User, Project)
- `src/routes/` - Express routers
- `src/server.js` - Entry point
