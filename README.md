# CarsAPI — Full-Stack Car and Parts Management

A full-stack application built during my GN TEQ internship while learning React, Next.js, ASP.NET Core, and SQL Server.

The application manages cars and spare parts through a React interface connected to a REST API.

## Features

### Cars

- View cars and individual car details.
- Add, edit, and delete cars.
- Toggle availability.
- Search by make or model.
- Filter by availability.
- Server-side pagination with 12 cars per page.
- Optional price and color fields.
- Confirmation before deletion.

### Parts

- View, add, edit, and delete parts.
- Assign a part to a car or leave it unassigned.
- Change or remove a part’s car assignment.
- Server-side pagination with 12 parts per page.
- Confirmation before deletion.
- Retry failed loading and deletion requests.
- Field-level validation and backend error messages.
- Automatic page adjustment after deleting the last item on a page.

**Adding, assigning, editing, or deleting a part does not change the car’s price.**

### Shared Interface

- English, Arabic, and Spanish translations.
- Right-to-left layout for Arabic.
- Saved language preference.
- Light and dark mode with a saved preference.
- Responsive layouts.
- Keyboard-accessible controls and dialogs.
- Loading indicators, empty states, and error feedback.
- Request cancellation when components unmount.
- Disabled controls during pending saves.

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

## Architecture

```text
React / Next.js interface
          |
          | HTTP requests and JSON
          v
ASP.NET Core REST API
          |
          | Validation and MediatR handlers
          v
Entity Framework Core
          |
          v
      SQL Server
```

For example, adding a part follows this flow:

1. The user completes the controlled React form.
2. The frontend validates the input.
3. A POST request sends the details to the API.
4. The backend validates the request.
5. A handler saves the part through Entity Framework Core.
6. SQL Server stores the record.
7. The frontend reloads the list and displays feedback.

## Project Structure

The frontend is inside the backend project folder:

```text
CarsAPI/
├── CarsAPI.csproj
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
    │   ├── cars/[id]/
    │   └── parts/
    ├── components/
    │   ├── cars/
    │   ├── parts/
    │   └── ui/
    ├── lib/
    │   ├── cars-api.ts
    │   ├── parts-api.ts
    │   ├── car-validation.ts
    │   ├── part-validation.ts
    │   └── language-store.ts
    ├── messages/
    │   ├── en.json
    │   ├── ar.json
    │   └── es.json
    ├── tests/e2e/
    │   ├── dashboard.spec.ts
    │   └── parts.spec.ts
    ├── scripts/
    └── playwright.config.ts
```

Additional practice components are retained from earlier lessons.

## Prerequisites

- Node.js compatible with the installed Next.js version.
- npm.
- .NET 10 SDK.
- SQL Server or SQL Server LocalDB.
- Visual Studio or another suitable editor.

## Run Locally

### 1. Configure SQL Server

Set `ConnectionStrings:SqlServerConnection` in the backend’s local configuration.

Example for SQL Server LocalDB:

```json
{
  "ConnectionStrings": {
    "SqlServerConnection": "Server=(localdb)\\MSSQLLocalDB;Database=CarsAPI_DB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

Adjust the connection string for your SQL Server instance.

The backend applies pending Entity Framework Core migrations during startup.

### 2. Start the Backend

From the folder containing `CarsAPI.csproj`:

```powershell
dotnet run --launch-profile https
```

The local HTTPS API address is:

```text
https://localhost:7059
```

If necessary, trust the development certificate:

```powershell
dotnet dev-certs https --trust
```

Restart the backend after changing its endpoints or handlers.

### 3. Configure the Frontend

Open another terminal:

```powershell
cd cars-frontend
npm.cmd ci
```

Create `.env.local` in `cars-frontend`:

```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:7059
```

This is a public API address, not a place for database credentials.

Restart the frontend development server after changing environment variables.

### 4. Start the Frontend

```powershell
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

The backend’s development CORS default permits this frontend origin.

> In this Windows PowerShell setup, use `npm.cmd` and `npx.cmd` if the PowerShell script launchers are blocked.

## Frontend Routes

| Route | Description |
| --- | --- |
| `/` | Cars dashboard |
| `/cars/{id}` | Individual car details |
| `/parts` | Parts management |
| `/about` | About page |

## Main API Endpoints

### Cars

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/cars` | Read a filtered page of cars |
| GET | `/cars/{id}` | Read one car |
| POST | `/cars` | Create a car |
| PUT | `/cars/{id}` | Update a car |
| DELETE | `/cars/{id}` | Delete a car |

Car IDs are numeric.

### Parts

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/parts/list` | Read a page of parts |
| GET | `/parts/{id}` | Read one part |
| POST | `/parts/add` | Create a part |
| PUT | `/parts/{id}` | Update a part |
| DELETE | `/parts/{id}` | Delete a part |

Part IDs are GUIDs represented as strings in JSON.

Successful deletion returns `204 No Content`. A missing record returns `404 Not Found`.

## Pagination

Both dashboards display 12 records per page.

The list endpoints accept:

```text
pageNumber
pageSize
```

Example:

```http
GET /parts/list?pageNumber=2&pageSize=12
```

The response body contains the current page’s array. The `X-Total-Count` header contains the total number of matching records.

The Cars endpoint additionally supports search and availability filtering:

```http
GET /cars?pageNumber=1&pageSize=12&search=Toyota&isAvailable=true
```

Car filters are applied before pagination.

## Example Requests

### Create a Car

```http
POST /cars
Content-Type: application/json
```

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

### Create an Unassigned Part

```http
POST /parts/add
Content-Type: application/json
```

```json
{
  "manufacturer": "Bosch",
  "description": "Brake pads",
  "price": 25.5,
  "carId": null
}
```

To assign the part, replace `null` with an existing numeric car ID.

The backend generates IDs for new records.

## Validation and Error Handling

- Frontend validation checks user input before submission.
- Backend validators enforce request rules independently.
- Backend field errors appear beside the relevant form inputs.
- Failed saves preserve the draft.
- Loading failures offer Retry controls.
- Pending requests disable conflicting actions.
- Deletion requires confirmation.
- Unknown backend messages retain their original wording.

## Localization and Themes

Translation dictionaries are stored in:

```text
messages/en.json
messages/ar.json
messages/es.json
```

Components use `useTranslations` to read the selected dictionary.

Arabic updates the document language and reading direction. Base UI controls receive the same direction.

Language selection is saved in browser storage. Dark mode uses `next-themes` and shared CSS color tokens.

Manufacturer names, descriptions, car names, and other saved data remain as entered.

## Commands

Run these inside `cars-frontend`:

```powershell
# Start development mode
npm.cmd run dev

# Run lint checks
npm.cmd run lint

# Create a production build
npm.cmd run build

# Serve that build locally
npm.cmd run start

# Run browser tests
npm.cmd run test:e2e
```

Build the frontend before running the browser suite.

## Testing

The project has **23 browser scenarios** covering Cars and Parts.

Coverage includes:

- Language and theme persistence.
- Pagination and boundary controls.
- Search and availability filtering for cars.
- Creating and editing records.
- Assigned and unassigned parts.
- Zero-price values.
- Local and backend field validation.
- Failed requests and Retry controls.
- Disabled controls during pending operations.
- Deletion confirmation and cancellation.
- Deleting the last item on a page.
- Records already deleted by another client.
- Keyboard focus behavior.
- Arabic mobile layouts and translated dialogs.

Browser tests intercept API requests and use test data, so they do not modify the real database.

Playwright starts the production frontend on port 3100 and uses installed Microsoft Edge by default.

The optional `scripts/check-part-deletion.mjs` integration check verifies the real DELETE endpoint against an explicitly configured test API. It creates a uniquely marked temporary part, removes it, and checks that the associated car’s price stays unchanged.

## Learning Outcomes

This project helped me practice:

- JSX and reusable components.
- Props, callbacks, and lifted state.
- State, events, and controlled forms.
- React hooks and effect cleanup.
- Context and shared providers.
- Next.js routes, layouts, and dynamic pages.
- Responsive styling and accessible controls.
- HTTP, JSON, and REST API integration.
- Backend validation and request handlers.
- Entity Framework Core and SQL Server persistence.
- Server-side pagination.
- Localization and dark mode.
- Browser and API integration testing.

## Project Status

The core local Cars and Parts application is complete.

Both sections support Create, Read, Update, and Delete operations. Frontend and backend builds, code checks, browser scenarios, and the Parts DELETE integration check have passed.
