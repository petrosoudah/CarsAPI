# CarsAPI — Full-Stack Car Management App

A car management application built during my GN TEQ internship while learning React, Next.js, and ASP.NET Core.

The frontend communicates with a REST API, which validates requests and stores car records in SQL Server through Entity Framework Core.

## Features

- Add, view, edit, and delete cars.
- Toggle car availability.
- Search by make or model.
- Filter by availability.
- Server-side pagination with 12 cars per page.
- Individual car details pages.
- Optional price and color fields.
- Field-level validation and API error handling.
- Loading states and retry controls.
- English, Arabic, and Spanish interface.
- Right-to-left layout for Arabic.
- Saved language and theme preferences.
- Light and dark mode.
- Responsive layouts and keyboard-accessible dialogs.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Next.js 16 App Router, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui with Base UI |
| Localization | next-intl |
| Themes | next-themes |
| Backend | ASP.NET Core Minimal APIs, C# |
| Request handling | MediatR |
| Validation | FluentValidation |
| Data access | Entity Framework Core |
| Database | SQL Server |
| Browser testing | Playwright |

## How It Works

```text
React / Next.js interface
          |
          | HTTP requests and JSON
          v
ASP.NET Core CarsAPI
          |
          | Validation and request handlers
          v
Entity Framework Core
          |
          v
      SQL Server
```

For example, adding a car follows this sequence:

1. The user fills in the controlled React form.
2. The frontend validates the input.
3. A POST request sends JSON to CarsAPI.
4. The backend validates the request.
5. The handler saves the car through Entity Framework Core.
6. SQL Server stores the record.
7. The frontend reloads the car list.

## Project Structure

The frontend is inside the backend project directory:

```text
CarsAPI/
├── Program.cs
├── Models/
├── Data/
├── Validators/
├── Behaviors/
├── handlers and commands/
├── Migrations/
└── cars-frontend/
    ├── app/
    │   ├── page.tsx
    │   ├── layout.tsx
    │   ├── LanguageProvider.tsx
    │   ├── ThemeProvider.tsx
    │   ├── about/
    │   └── cars/[id]/
    ├── components/
    │   ├── cars/
    │   └── ui/
    ├── lib/
    │   ├── cars-api.ts
    │   ├── car-validation.ts
    │   └── language-store.ts
    ├── messages/
    │   ├── en.json
    │   ├── ar.json
    │   └── es.json
    ├── tests/e2e/
    ├── scripts/check-api.mjs
    ├── .env.example
    └── DEPLOYMENT.md
```

Some additional frontend files are retained as learning exercises.

## Prerequisites

- Node.js compatible with Next.js 16 and npm.
- .NET 10 SDK.
- SQL Server or SQL Server LocalDB.
- Visual Studio or another suitable editor.

## Run Locally

### 1. Configure the database

In the backend configuration, set:

```json
{
  "ConnectionStrings": {
    "SqlServerConnection": "Server=(localdb)\\MSSQLLocalDB;Database=CarsAPI_DB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

Adjust the connection string for your SQL Server instance.

The backend applies pending Entity Framework Core migrations during startup.

Do not commit production credentials.

### 2. Start the backend

From the directory containing `CarsAPI.csproj`:

```powershell
dotnet run --launch-profile https
```

The local HTTPS API address is:

```text
https://localhost:7059
```

If needed, trust the local development certificate:

```powershell
dotnet dev-certs https --trust
```

### 3. Configure the frontend

Open a second terminal:

```powershell
cd cars-frontend
npm.cmd ci
Copy-Item .env.example .env.local
```

If `.env.local` already exists, keep your existing configuration.

Ensure it contains:

```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:7059
```

### 4. Start the frontend

```powershell
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

Restart the frontend development server after changing its environment variables.

> Windows PowerShell users can use `npm.cmd` and `npx.cmd` if the corresponding PowerShell script launchers are blocked.

## Main API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/cars` | Get a filtered page of cars |
| GET | `/cars/{id}` | Get one car |
| POST | `/cars` | Create a car |
| PUT | `/cars/{id}` | Update a car |
| DELETE | `/cars/{id}` | Delete a car |

### Pagination and Filtering

```http
GET /cars?pageNumber=1&pageSize=12&search=Toyota&isAvailable=true
```

Supported query parameters:

| Parameter | Purpose |
| --- | --- |
| `pageNumber` | Requested page, starting at 1 |
| `pageSize` | Records per page, from 1 to 100 |
| `search` | Search make and model |
| `isAvailable` | Filter by availability |

The response body is a car array. The `X-Total-Count` response header contains the total number of matching records.

### Example Create Request

```json
{
  "make": "Toyota",
  "model": "Corolla",
  "year": 2024,
  "horsepower": 150,
  "price": null,
  "isAvailable": true,
  "color": null
}
```

The server generates the car ID.

## Frontend Commands

Run these inside `cars-frontend`:

```powershell
# Development server
npm.cmd run dev

# Lint checks
npm.cmd run lint

# Production build
npm.cmd run build

# Serve the production build
npm.cmd run start

# Browser tests
npm.cmd run test:e2e
```

Build the frontend before running the browser suite.

## Testing

The Playwright suite checks:

- Language and theme persistence.
- Pagination and filtering beyond the first 50 records.
- Availability changes under an active filter.
- Form validation and optional values.
- API field errors and zero-price editing.
- Deleting the last record on a page.
- Keyboard focus and dialog behavior.
- Arabic mobile layout.
- Retry and missing-car handling.

Browser tests intercept API requests and use test data, so they do not modify the real database.

The default browser is installed Microsoft Edge.

### Read-Only API Checks

With the updated backend running:

```powershell
$env:API_CHECK_BASE_URL = "https://localhost:7059"
node scripts/check-api.mjs
```

These checks verify paging, filtering, count headers, invalid paging requests, and CORS without changing car records.

## Localization and Dark Mode

Interface translations are stored in:

```text
messages/en.json
messages/ar.json
messages/es.json
```

Components read translations using `useTranslations`.

Arabic uses right-to-left direction. The selected language is remembered in browser storage.

Dark mode uses `next-themes` and CSS color tokens. It follows the system preference until the user chooses a theme.

Car data and unknown backend messages retain their original text.

## Deployment Notes

The application currently runs locally. Production deployment requires:

- A Node.js host supporting this Next.js application.
- A .NET 10 API host.
- A production SQL Server database.
- HTTPS configuration.
- The deployed API URL and permitted frontend origin.

Set the frontend API URL **before building**:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.example
```

Configure the backend through its hosting environment:

```text
ASPNETCORE_ENVIRONMENT=Production
Cors__AllowedOrigins__0=https://cars.your-domain.example
ConnectionStrings__SqlServerConnection=<production connection string>
```

The frontend API URL is public. Database credentials belong only on the backend.

See `cars-frontend/DEPLOYMENT.md` for additional instructions.

## Learning Outcomes

This project helped me practice:

- JSX, components, props, and callbacks.
- State, events, and controlled forms.
- React hooks and effect cleanup.
- Shared settings through providers.
- Next.js routing, layouts, and dynamic pages.
- Reusable UI components and responsive styling.
- HTTP, JSON, and REST API integration.
- Backend validation and request handlers.
- Entity Framework Core and SQL Server persistence.
- Pagination, localization, dark mode, and browser testing.

## Project Status

Working full-stack application with local frontend, API, and database integration.

Live deployment is a separate next step.
