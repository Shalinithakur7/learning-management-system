# LMS Frontend

Angular frontend for the Learning Management System (LMS) project.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

3. **Build for Production**
   ```bash
   npm run build
   ```

## Backend Connection

The frontend is configured to connect to the backend API at:
- **API Base URL**: `http://localhost:5012/api`

Make sure the backend is running on port 5012 before starting the frontend.

I have used .net 8

  credentials

- Email: admin@lms.com
- Password: Admin@123

  
## Features

### Authentication
- User login with JWT authentication
- User registration with role selection (Student, Instructor, Admin)
- Role-based access control
- Protected routes with AuthGuard

### Modules

1. **Dashboard**
   - Overview statistics
   - Course progress tracking
   - My courses list

2. **Courses**
   - Course catalog/list
   - Course details
   - My courses (enrolled courses)
   - Course creation (Instructor role)

3. **Enrollment**
   - Enroll in courses (Student role)
   - View my enrollments
   - Approve enrollments (Admin role)

4. **Assignments**
   - View assignments by course
   - Submit assignments (Student role)
   - View my submissions

5. **Reports**
   - Course enrollment reports
   - Student progress reports
   - Assignment submission reports
   - (Available for Admin and Instructor roles)

6. **Admin Panel**
   - Manage courses
   - Manage users
   - (Available for Admin role only)

## Technology Stack

- Angular 21
- Angular Material
- TypeScript
- RxJS
- HTTP Client with Interceptors

## Project Structure

```
src/app/
├── auth/              # Authentication components (login, register)
├── core/              # Core services (auth, guards, interceptors)
├── shared/            # Shared components and modules
├── layout/            # Layout components (sidebar, main-layout)
├── dashboard/         # Dashboard module
├── courses/           # Courses module
├── enrollment/        # Enrollment module
├── assignments/       # Assignments module
├── reports/           # Reports module
├── admin/             # Admin module
└── progress/          # Progress service
```

## API Endpoints Used

- `POST /api/Auth/login` - User login
- `POST /api/Auth/register` - User registration
- `GET /api/Courses` - Get all courses
- `GET /api/Courses/:id` - Get course by ID
- `POST /api/Courses` - Create course (Instructor)
- `DELETE /api/Courses/:id` - Delete course (Instructor)
- `POST /api/Enrollments` - Enroll in course (Student)
- `GET /api/Enrollments/my` - Get my enrollments (Student)
- `GET /api/Enrollments/pending` - Get pending enrollments (Admin)
- `PUT /api/Enrollments/approve/:id` - Approve enrollment (Admin)
- `GET /api/Assignments/:courseId` - Get assignments by course
- `POST /api/Submissions` - Submit assignment (Student)
- `GET /api/Submissions/my` - Get my submissions (Student)
- `POST /api/Progress/update` - Update progress (Student)
- `GET /api/Progress/my` - Get my progress (Student)
- `GET /api/Reports/course-enrollments` - Course enrollment report
- `GET /api/Reports/student-progress` - Student progress report
- `GET /api/Reports/assignment-submissions` - Assignment submission report

## Notes

- The application uses JWT tokens stored in localStorage
- All API requests include the JWT token via HTTP interceptor
- Role-based UI elements are shown/hidden based on user role
- The default route redirects to `/login` if not authenticated
- After login, users are redirected to `/dashboard`

