# API Reference

This document highlights the endpoints for the **Construction Labour Management System**.

## Authentication
- `POST /api/v1/auth/login` - Authenticate user & return JWT token.
- `POST /api/v1/auth/register` - Create new admin / manager profiles.

## Projects
- `GET /api/v1/projects` - List all projects.
- `POST /api/v1/projects` - Create new construction project.

## Labour
- `GET /api/v1/labour` - List labour profiles.
- `POST /api/v1/labour` - Onboard new labour.

## Attendance
- `POST /api/v1/attendance/check-in` - Log attendance check-in.
- `POST /api/v1/attendance/check-out` - Log attendance check-out.
