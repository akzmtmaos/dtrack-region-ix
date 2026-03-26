# DOH Document Tracking System

A comprehensive document tracking system for the Department of Health (DOH) built with React + TypeScript + Tailwind CSS (frontend) and Laravel (backend).

## Project Structure

```
doh-document-tracking-system/
├── backend/          # Laravel API (MySQL via XAMPP)
├── frontend/         # React + TypeScript frontend
└── README.md         # This file
```

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- PHP + Composer for Laravel

## Backend Setup (Laravel)

1. Navigate to the Laravel API directory:
   ```bash
   cd backend
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Configure your database in `.env`, then run migrations:
   ```bash
   php artisan migrate
   ```
4. Start the backend:
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```

The backend API will be available at `http://localhost:8000`

## Frontend Setup (React + TypeScript)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Available Scripts

### Backend
- `php artisan serve` - Start the Laravel development server
- `php artisan migrate` - Apply database migrations
- `php artisan key:generate` - Generate app key (if needed)
- `php artisan make:migration` - Create a new migration

### Frontend
- `npm run dev` - Start the Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Laravel** - API framework
- **MySQL** - Database (via XAMPP)

## Development Notes

- The frontend proxies API calls to the Laravel backend at `http://localhost:8000`.

## Next Steps

1. Define your data models in `backend/app/Models/`
2. Implement controllers in `backend/app/Http/Controllers/`
3. Update API routes in `backend/routes/api.php`
4. Build React components in `frontend/src/components/`
5. Set up routing and pages in `frontend/src/`

## License

This project is for Department of Health On-Job Training purposes.

