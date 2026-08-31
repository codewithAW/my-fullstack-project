# Frontend Boilerplate

This is the React frontend for the MERN boilerplate project, built with Vite.

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` or `.env`:
```bash
cp .env.example .env.local
```
Make sure `VITE_API_URL` points to your running backend (e.g., `http://localhost:5000/api`).

### 3. Start the dev server
```bash
npm run dev
```

## Features
- React Router setup (`react-router-dom`)
- Centralized Context API for Authentication (`src/context/AuthContext.jsx`)
- Axios interceptor configured for JWT (`src/services/api.js`)
- Basic protected routes (`App.jsx`)
- Pre-built Login, Signup, and Dashboard components for immediate extension

## Project Structure
- `src/components/` - Reusable UI components
- `src/context/` - React Context files
- `src/pages/` - Main view components (Dashboard, Login, Signup)
- `src/services/` - API communication (Axios)
- `src/App.jsx` - Routing and main layout
- `src/index.css` - Global styles
