# Project Structure

This document details the folder structure, architectural pattern explanations, and software development patterns utilized in the **Construction Labour Management System**.

## 1. Complete Folder Tree

```text
construction-labour-management-system/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── store.js
│   │   │   ├── rootReducer.js
│   │   │   └── App.jsx
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   ├── config/
│   │   │   ├── env.config.js
│   │   │   └── constants.js
│   │   ├── contexts/
│   │   │   ├── ThemeContext.jsx
│   │   │   └── AuthContext.jsx
│   │   ├── helpers/
│   │   │   └── dateHelper.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useDebounce.js
│   │   │   └── useLocalStorage.js
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── SiteManagerLayout.jsx
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── api/
│   │   │   │   │   └── authApi.js
│   │   │   │   ├── components/
│   │   │   │   ├── constants/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.jsx
│   │   │   │   │   └── ResetPasswordPage.jsx
│   │   │   │   ├── services/
│   │   │   │   ├── styles/
│   │   │   │   ├── utils/
│   │   │   │   └── validation/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   │   ├── api/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProjectCard.jsx
│   │   │   │   │   └── ProjectTimeline.jsx
│   │   │   │   ├── constants/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── ProjectList.jsx
│   │   │   │   │   ├── CreateProject.jsx
│   │   │   │   │   ├── EditProject.jsx
│   │   │   │   │   ├── ProjectDetails.jsx
│   │   │   │   │   ├── ProjectOverview.jsx
│   │   │   │   │   ├── ProjectAttendance.jsx
│   │   │   │   │   ├── ProjectLabour.jsx
│   │   │   │   │   ├── ProjectExpenses.jsx
│   │   │   │   │   └── ProjectReports.jsx
│   │   │   │   ├── services/
│   │   │   │   ├── styles/
│   │   │   │   ├── utils/
│   │   │   │   └── validation/
│   │   │   ├── labour/
│   │   │   ├── attendance/
│   │   │   ├── payroll/
│   │   │   ├── expenses/
│   │   │   ├── siteReports/
│   │   │   ├── reports/
│   │   │   ├── analytics/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   ├── company/
│   │   │   └── userManagement/
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   ├── GuardedRoute.jsx
│   │   │   └── paths.js
│   │   ├── services/
│   │   │   ├── apiClient.js
│   │   │   └── socketService.js
│   │   ├── shared/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── Card.jsx
│   │   │   │   │   └── Badge.jsx
│   │   │   │   ├── forms/
│   │   │   │   │   ├── Input.jsx
│   │   │   │   │   ├── Select.jsx
│   │   │   │   │   └── FileUploader.jsx
│   │   │   │   ├── charts/
│   │   │   │   ├── tables/
│   │   │   │   │   ├── Table.jsx
│   │   │   │   │   └── Pagination.jsx
│   │   │   │   ├── modals/
│   │   │   │   ├── layout/
│   │   │   │   ├── feedback/
│   │   │   │   └── navigation/
│   │   │   ├── constants/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── styles/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── styles/
│   │   │   ├── variables.css
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   └── formatter.js
│   │   ├── validators/
│   │   │   └── commonSchema.js
│   │   ├── index.html
│   │   ├── main.jsx
│   │   ├── vite.config.js
│   │   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.config.js
│   │   │   ├── env.config.js
│   │   │   └── logger.config.js
│   │   ├── database/
│   │   │   ├── seeders/
│   │   │   └── migrations/
│   │   ├── emails/
│   │   │   ├── templates/
│   │   │   └── mailer.service.js
│   │   ├── jobs/
│   │   │   ├── agenda.js
│   │   │   └── definitions/
│   │   ├── logs/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── rateLimiter.middleware.js
│   │   │   └── logging.middleware.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── model/
│   │   │   │   ├── route/
│   │   │   │   ├── validator/
│   │   │   │   ├── dto/
│   │   │   │   └── mapper/
│   │   │   ├── projects/
│   │   │   ├── labour/
│   │   │   ├── attendance/
│   │   │   ├── payroll/
│   │   │   ├── expenses/
│   │   │   ├── reports/
│   │   │   ├── analytics/
│   │   │   ├── notifications/
│   │   │   ├── company/
│   │   │   └── users/
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── shared/
│   │   │   └── exceptions/
│   │   ├── socket/
│   │   ├── uploads/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── architecture/
│   │   └── SystemArchitecture.md
│   ├── database/
│   │   └── ERDiagram.md
│   ├── api/
│   │   └── APIReference.md
│   ├── deployment/
│   │   └── DeploymentGuide.md
│   └── ProjectStructure.md
└── README.md
```

## 2. Directory Explanations

### Frontend (`client/src/`)
- **`app/`**: Application bootloader, configures store/state management (e.g. Redux Toolkit/Zustand context setup) and initializes root UI.
- **`config/`**: System validation layer for client variables and base URL parameters.
- **`modules/`**: Feature-Based Domains containing isolated, self-contained business units.
- **`shared/`**: Presentational, stateless UI kits (Atomic Components, common layouts, and utilities) that can be shared across all feature modules.

### Backend (`server/src/`)
- **`modules/`**: Domain modules. Each folder contains its own route hooks, validators, business logic layer (services), data interfaces (repositories), and schemas (models).
- **`middlewares/`**: Interception pipeline providing route security, rate-limiting, error collection, and logging services.
- **`jobs/`**: Offline task manager scheduling computations (e.g., payroll runs) without degrading web server availability.

---

## 3. Why Feature-Based (Domain-Driven) Architecture?

Traditional structures partition components by technical role (e.g. putting all components in `components/`, all pages in `pages/`, etc.). This slows development cycles when applications scale, as code related to a single business concern is scattered. 

Feature-Based architecture isolates concerns within business boundaries, yielding high cohesion and loose coupling.

### Key Architectural Benefits
- **Developer Focus**: High locality of code. Editing a feature requires editing code in only one feature folder.
- **Horizontal Scalability**: The codebase expands by adding folder modules side-by-side, avoiding congested directories.
- **Microservice Readiness**: Clean boundaries mean a module (e.g., `payroll`) can be extracted into its own service without refactoring client dependencies.
