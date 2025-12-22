# DOH Document Tracking System

A comprehensive document tracking system for the Department of Health (DOH) built with React + TypeScript + Tailwind CSS (frontend) and Django REST Framework (backend).

## Project Structure

```
doh-document-tracking-system/
├── backend/          # Django backend application
│   ├── doh_tracking/ # Django project settings
│   ├── api/          # API endpoints and business logic
│   └── manage.py     # Django management script
├── frontend/         # React + TypeScript frontend
│   └── src/          # React source files
└── README.md         # This file
```

## Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

## Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file in the backend directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and set your `SECRET_KEY`.

6. Run migrations:
   ```bash
   python manage.py migrate
   ```

7. Create a superuser (optional, for admin access):
   ```bash
   python manage.py createsuperuser
   ```

8. Run the development server:
   ```bash
   python manage.py runserver
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
- `python manage.py runserver` - Start the Django development server
- `python manage.py migrate` - Apply database migrations
- `python manage.py createsuperuser` - Create an admin user
- `python manage.py makemigrations` - Create new migrations

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
- **Django 4.2** - Web framework
- **Django REST Framework** - API framework
- **django-cors-headers** - CORS handling
- **python-dotenv** - Environment variable management

## Development Notes

- The backend API is configured to accept requests from `http://localhost:3000`
- CORS is enabled for development
- The backend uses SQLite by default (can be changed to PostgreSQL/MySQL in production)
- Media files are stored in `backend/media/` directory

## Next Steps

1. Define your data models in `backend/api/models.py`
2. Create serializers in `backend/api/serializers.py`
3. Implement API views in `backend/api/views.py`
4. Build React components in `frontend/src/components/`
5. Set up routing and pages in `frontend/src/`

## License

This project is for Department of Health On-Job Training purposes.

