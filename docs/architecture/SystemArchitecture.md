# System Architecture

This document describes the high-level architecture of the **Construction Labour Management System**.

## 1. Architectural Patterns
- **Frontend**: Clean Architecture using Domain-Driven Modules in React + Vite.
- **Backend**: Layered Clean Architecture (Controller -> Service -> Repository -> Database Model).
- **Communication**: REST APIs (JSON over HTTP) + WebSockets for real-time notifications.

## 2. Component Design Principles
- **Separation of Concerns**: UI, business logic, validation, and data persistence layers are strictly decoupled.
- **Dependency Inversion**: Repositories abstract the database mechanism, allowing easy replacement or scaling.
- **Single Source of Truth**: Modules encapsulate their unique domain state. Reusable visual components reside in `shared/components`.
