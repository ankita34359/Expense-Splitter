# Trip Expense Settlement Calculator

A full-stack application built with Laravel (REST API) and React (Vite + Tailwind CSS).

## Prerequisites
- PHP >= 8.1
- Composer
- Node.js & npm

## Backend Setup (Laravel)
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies (once Composer is installed):
   ```bash
   composer install
   ```
3. Generate application key:
   ```bash
   php artisan key:generate
   ```
4. Configure database:
   - The `.env` is pre-configured for SQLite.
   - Create the database file: `touch database/database.sqlite` (or create it manually in the `database` folder).
5. Run migrations:
   ```bash
   php artisan migrate
   ```
6. Start the server:
   ```bash
   php artisan serve
   ```
   The API will be available at `http://127.0.0.1:8000/api`.

## Frontend Setup (React)
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## Features
- **Trip Management**: Create trips and add friends.
- **Dynamic Expenses**: Add expenses and select participating members.
- **Optimized Settlements**: Automated "who-pays-whom" calculation based on actual participation.
- **Premium UI**: Clean, responsive interface built with Tailwind CSS and Lucide icons.
