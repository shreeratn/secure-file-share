# Secure File Share

Secure File Share is a modern full‑stack application for securely managing, sharing, and tracking files. Built with Django (using Django REST Framework) on the backend and a Vite‑powered React/TypeScript frontend, this platform provides robust user authentication (with MFA), role‑based access, secure file uploads with encryption metadata, sharing capabilities with expiry links, and more.

---

## Table of Contents

- [Features](#features)
- [Architecture and Design](#architecture-and-design)
- [Implementation Details](#implementation-details)
    - [Backend](#backend)
    - [Frontend](#frontend)
- [Running the Application](#running-the-application)
- [Completed Requirements](#completed-requirements)
- [TODO / Future Improvements](#todo--future-improvements)
- [Acknowledgements](#acknowledgements)

---

## Features

- **User Authentication and MFA**
    - Custom user model with email as the username.
    - Registration and login endpoints secured with JWT tokens.
    - Multi‑factor authentication (using pyotp) with MFA setup and verification endpoints.
- **Role‑Based Access Control and Upgrade Requests**
    - Three user types: Guest, Regular, and Admin.
    - Endpoints to request, approve, and manage role upgrades.
    - Admin‑only views for user management.
- **File Upload, Storage, and Sharing**
    - File upload endpoints that verify file size against user‑allocated storage limits.
    - Metadata capture for file encryption (storing key and IV values for later decryption procedures).
    - Automatic generation of unique download links (via UUIDs) for public/shared files.
    - File download with expiry check based on a configurable expiration date.
- **User Storage Management**
    - Tracking of used storage per user with properties to compute allocated storage (varies by user role).
- **Creative and Responsive Frontend UI**
    - Built using React with Vite and TypeScript.
    - Uses Tailwind CSS, shadcn/ui components, and Radix‑UI primitives for a modern, responsive layout.
    - Creative animated text components (e.g., HyperText, AuroraText, Line‑Shadow Text) that use motion libraries to provide a dynamic user experience.
    - Protected routes managed via React hooks and axios interceptors that validate JWT tokens stored in local storage.

---

## Architecture and Design

### Backend

- **Framework \& API Architecture**
  The backend is developed using Django and Django REST Framework following a clear MVC structure. Two sub‑applications have been implemented:
    - **authentication**: Manages user registration, login, MFA setup, and role management.
    - **files**: Handles file uploads, metadata (including encryption key/IV), sharing functionality, file expiry, and storage tracking.
- **Design Patterns \& Algorithms**
    - A custom user model (extending AbstractUser) implements user types with an enum-like “TextChoices” for clarity and type‑safety.
    - The file model leverages UUID generation (using Python’s built‑in uuid module) for generating download links.
    - MFA uses a time‑based one‑time password (TOTP) algorithm from pyotp.
    - The “Fat Model, Skinny View” philosophy can be observed where business logic (like calculating allocated storage via a model property) is encapsulated into the models.
    - Extensive logging (both via Python logging and direct console prints) enhances traceability of operations such as file uploads and error handling.
- **Security**
    - JWT authentication (with the SimpleJWT package) ensures secure API access.
    - CORS is handled using django‑cors‑headers.
    - Settings include production‑ready secure options when DEBUG is set to False.


### Frontend

- **Framework \& Tools**
    - Built with React and TypeScript using Vite for fast development and hot‑module reloading.
    - Uses Tailwind CSS and shadcn/ui design system concepts.
    - Uses React Router for navigation; a dedicated `ProtectedRoute` component validates JWT tokens via an API call on mount.
- **UI Components and Animations**
    - Reusable components (cards, drawers, popovers, tables, etc.) are created using Radix UI primitives mixed with Tailwind CSS.
    - Custom animated text components (HyperText, AuroraText, and Line‑Shadow Text) use motion libraries (e.g., motion/react and Framer Motion) to provide creative, animated effects.
    - The UI exhibits a clean separation of concerns by distinguishing between “container” (stateful) and “presentational” (stateless) components.

---

## Implementation Details

### Backend

- **Authentication Endpoints:**
  Endpoints such as `/api/auth/register/`, `/api/auth/login/`, `/api/auth/setup-mfa/`, and `/api/auth/verify-mfa/` handle user creation, token issuance, and MFA handling.
  The code leverages django‑rest‑framework’s serializers and Django’s built‑in authentication system with adjustments (e.g., using email as the username).
- **File Management:**
  File uploads are managed by the `FileUploadSerializer` that accepts the file itself along with custom encryption metadata (key and IV).
  Storage usage is tracked by associated `UserStorage` instances.
  File sharing endpoints update file records by adding shared users and generating new download links via UUID.
- **Role Upgrade Functionality:**
  A dedicated model (`RoleUpgradeRequest`) and corresponding endpoints allow users to request upgrades (from guest to regular and then to admin) and enable admins to approve/decline or downgrade user roles.
- **Additional Utilities:**
  A custom management command (`create_admin`) is provided to easily bootstrap an admin user.


### Frontend

- **Routing \& Protected Areas:**
  The main `App.tsx` uses React Router to define routes for login (AuthLanding), a dashboard, and a fallback redirect to the dashboard. The `ProtectedRoute` component validates tokens by calling `fileService.getUserData()` before rendering protected views.
- **State \& API Integration:**
  Axios interceptors (set up in `services/auth`) add tokens from local storage to outgoing API requests ensuring that the backend is properly authenticated.
  The file upload and share functionality are integrated into the UI (e.g., via a share drawer component that lets users set expiry days, add emails, and copy the generated link).
- **UI Polish and Animation:**
  UI components are built with a mix of Tailwind CSS and shadcn/ui’s design patterns. Custom animations for text and interactive elements provide a modern look.

---

## Running the Application

### Prerequisites

- Docker and Docker Compose installed
- Node.js (for local frontend development) and Python 3.9+ (if running locally without Docker)

## Running the Application

Since a docker‑compose file is already provided, you can build and run the entire project with the following commands:

1. Build the Docker images: `docker-compose build`
2. Start the containers: `docker-compose up`
3. Go to [http://localhost:5173](http://localhost:5173)

This launches both the Django backend and the React frontend (via a Node container) as defined in the docker‑compose configuration.

## Completed Requirements (as per req.pdf)

Based on the requirements documented in req.pdf, the following functionalities have been implemented:

- Secure user registration and login using JWT with a custom user model.
- MFA setup and verification using TOTP (pyotp) for enhanced security.
- File upload with metadata recording for file encryption (key/IV) and automatic UUID‑based download link generation.
- Storage usage tracking for each user, with allocated storage limits based on user type.
- Role upgrade request and admin‑managed role change mechanisms.
- File sharing endpoints that support adding extra emails and setting link expiration.
- A modern, responsive, and creative frontend with interactive components and animations.
- Comprehensive logging and error handling on key operations (upload, share, delete).

---

## TODO / Future Improvements

While many requirements have been met, there are some areas still pending that will be addressed in future iterations:

1. **Email Notification:**
    - When files are shared, notifications (e.g., via email) for shared file links are not yet triggered.
    - Future work: Integrate an email service to inform recipients that a file has been shared with them.
2. **Testing Suite and Coverage:**
    - The backend tests (e.g., in files/tests.py) and frontend test coverage need to be further extended.
    - Future work: Write extensive unit and integration tests along with CI/CD pipeline integration.
3. **Scheduled Cleanup Tasks:**
    - Automated deletion or archiving of files past their expiry date has not yet been implemented.
    - Future work: Use Django’s background tasks (such as Celery or Django-Q) to routinely clean up expired files.

---
