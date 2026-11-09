# Cars and Parts Management

A full-stack learning project built during my GN TEQ internship using React, Next.js, ASP.NET Core, and SQL Server.

## Features

### Cars

- Add, edit, delete, and view individual cars.
- Search by make/model and filter by availability.
- Server-side pagination with 12 cars per page.
- TanStack Query caching for pages and details, with query invalidation after saves and deletes.
- Optional price and color.
- Independent availability updates: each card owns its pending/error state.
- Update the affected car locally in a settled All-availability view; refresh when filters or in-flight requests require it.
- Validation, deletion confirmation, unsaved-draft protection, and success/error feedback.

### Parts

- Add, edit, delete, and browse parts with server-side pagination.
- Assign a part to a car, change its assignment, or leave it unassigned.
- Validate fields and retry failed requests.
- Adjust pagination after deleting the last item on a page.
- Reuse cached pages while fetching a different page.

Assigning a part does **not** change the car's price. A car with assigned parts cannot be deleted until those parts are unassigned or deleted.

### Interface

- English, Arabic, and Spanish dictionaries.
- Right-to-left layout for Arabic.
- Saved language preference and light/dark/system themes.
- Responsive layouts, keyboard focus, accessible field feedback, and reduced-motion support.
- Loading, empty, error, retry, and success states.

## Technology

| Frontend | Backend |
| --- | --- |
| Next.js 16 App Router | ASP.NET Core / .NET 10 |
| React 19 and TypeScript | Entity Framework Core |
| Tailwind CSS 4 | SQL Server / LocalDB |
| shadcn/ui with Base UI | MediatR |
| next-intl and next-themes | FluentValidation |
| TanStack Query | Domain value objects and events |
| Playwright | System.Text.Json |
| | OData 9.x |

## Project Structure

Paths below are relative to this repository's root.

```text
CarsAPI.slnx
CarsAPI/
├── Program.cs
├── Controllers/           # OData controllers
├── Domain/                # DDD: Value Objects, Domain Events, Entity base
├── Data/
├── Models/
├── handlers and commands/
├── Validators/
├── Behaviors/
├── Exceptions/
├── Learning/
├── Migrations/
└── cars-frontend/
    ├── app/                 # Routes, layouts, global styles
    ├── components/
    │   ├── cars/            # Cards, list, filters, forms, dialogs
    │   ├── parts/           # Parts form and deletion dialog
    │   ├── layout/          # Navigation and preference controls
    │   ├── providers/       # Theme, language, and query providers
    │   └── ui/              # Shared UI primitives
    ├── hooks/               # useCars, useCarActions, translated errors
    ├── lib/
    │   ├── api/             # HTTP helpers, types, and query keys
    │   ├── validation/      # Pure frontend validation
    │   ├── language-store.ts
    │   └── utils.ts
    ├── messages/            # English, Arabic, Spanish
    ├── practice/            # Earlier React exercises
    ├── public/
    └── tests/e2e/
```

## Frontend Design

- App Router layouts and route files are Server Components. Interactive dashboards, dialogs, and the car details view are Client Components.
- **QueryProvider** supplies one TanStack Query client under the theme and language providers, with a 30-second staleTime.
- **useCars** keeps filters and page number in local state. useQuery owns the fetched page, loading state, error, and cache. The query key includes search, availability, and page.
- **useCarActions** uses a separate useMutation per card and a ref guard against immediate duplicate requests. Forms and deletion dialogs also use mutations.
- Successful saves and deletes invalidate list queries. A settled, unfiltered availability toggle updates one cached car; filtered or in-flight lists are invalidated.
- **CarCard** uses `memo`; stable callbacks and preserved object references let unchanged siblings skip render work.
- Related state is grouped by responsibility into objects.
- Effects debounce search and synchronize browser preferences. The query function passes TanStack Query's cancellation signal to fetch.
- API helpers and validation stay separate from presentation.

Splitting files organizes responsibilities. It does not automatically enable lazy loading or prevent every render.

## Run Locally

### Requirements

- Windows with SQL Server LocalDB, or a configured SQL Server connection.
- .NET 10 SDK.
- Node.js 20.9 or newer and npm.
- Microsoft Edge for the default browser-test configuration.

### 1. Start the API

From the repository root, in PowerShell:

```powershell
cd CarsAPI
dotnet restore
dotnet dev-certs https --trust
dotnet run --launch-profile https -p:TypeScriptCompileBlocked=true
```

The API uses `https://localhost:7059` and `http://localhost:5104`.

The default database is `CarsAPI_DB` on `(localdb)\MSSQLLocalDB`. Configure `ConnectionStrings:SqlServerConnection` for another SQL Server. Startup applies EF Core migrations, so the database server must be available.

The TypeScript flag skips legacy backend-project TypeScript compilation entries; the Next.js frontend is checked and built separately.

### 2. Start the Frontend

Open another terminal at the repository root:

```powershell
cd CarsAPI/cars-frontend
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Set the following in `.env.local`:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://localhost:7059
```

Open [http://localhost:3000](http://localhost:3000).

Use `npm.cmd` and `npx.cmd` if PowerShell blocks the corresponding script launchers. The API's CORS configuration must allow the frontend origin.

## Main API Endpoints

### REST (CQRS via MediatR)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/cars` | Search, availability filtering, pagination |
| GET | `/cars/{id}` | Car details |
| POST | `/cars` | Create a car |
| PUT | `/cars/{id}` | Update a car |
| DELETE | `/cars/{id}` | Delete an unassigned car |
| GET | `/parts/list` | Paginated parts |
| GET | `/parts/{id}` | Part details |
| POST | `/parts/add` | Create a part |
| PUT | `/parts/{id}` | Update a part or assignment |
| DELETE | `/parts/{id}` | Delete a part |

Paginated responses include `X-Total-Count`. Car IDs are integers; part IDs are GUIDs.

### OData

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/odata/Cars` | Queryable cars with `$filter`, `$select`, `$orderby`, `$expand`, `$count`, `$top`, `$skip` |
| GET | `/odata/Parts` | Queryable parts with supported OData query options |

Examples:
- `/odata/Cars?$filter=IsAvailable eq true&$orderby=YearValue desc&$top=5`
- `/odata/Cars?$select=Make,Model,PriceAmount&$count=true`
- `/odata/Cars?$expand=Parts($select=Manufacturer,Description)`

## Backend Learning Topics

- **Exception handling:** malformed JSON and validation errors return 400, relationship conflicts return 409, and unexpected failures are logged with generic Problem Details.
- **Serialization:** JSON requests use primitive year, horsepower, and price values; handlers create value objects. REST car responses contain nested value objects, which the frontend API helper converts to its flat Car type.
- **TransactionScope:** a development-only exercise groups car and part creation across two saves and observes prepare, commit, and rollback notifications.

```http
POST /learning/transaction-scope?simulateFailure=false
POST /learning/transaction-scope?simulateFailure=true
```

The first commits practice records. The second intentionally fails before `Complete()` so the transaction rolls back. This exercise writes to the configured database and is available only in Development.

A dependency-injection `CreateScope()` manages service lifetimes; it does not provide a database transaction.

## OData

The project implements OData 9.x with these configured query options:

- **`$filter`** — server-side filtering (e.g., `YearValue gt 2020`, `contains(Model,'Civic')`)
- **`$select`** — projection to reduce payload (e.g., `Make,Model,PriceAmount`)
- **`$orderby`** — server-side sorting (e.g., `YearValue desc,PriceAmount asc`)
- **`$expand`** — include navigation properties (e.g., `Parts($select=Manufacturer)`)
- **`$count`** — total count in `@odata.count`
- **`$top` / `$skip`** — paging (max top 100, default page size 50)

Configured in `Program.cs` with `AddOData` and an EDM model exposing Cars and Parts. The keyless CarPartsView is excluded. The OData model exposes mapped primitive fields such as YearValue and PriceAmount so supported filters can translate to SQL. Controllers in `Controllers/CarsODataController.cs` and `PartsODataController.cs` use `[EnableQuery]`. The dashboard still uses the REST endpoints.

## Domain-Driven Design (DDD)

The project demonstrates core DDD patterns implemented incrementally:

### Value Objects (`Domain/ValueObjects/`)
- **`Price`** — immutable `readonly record struct` with currency, arithmetic, comparison operators, and implicit decimal conversions. The HTTP commands use primitive numbers because these conversions do not make a JSON number bind directly to a value-object parameter.
- **`Year`** — range-validated (1886 to current year + 1)
- **`Horsepower`** — positive-only validated
- EF Core maps primitive YearValue, HorsepowerValue, and PriceAmount properties to the existing SQL columns; the domain value-object properties are not mapped directly.

### Domain Events (`Domain/Events/`)
- `CarCreated`, `CarUpdated`, `CarPriceChanged`, `CarSold`, `CarAvailable`, `PartInstalled`
- All implement `IDomainEvent` with `OccurredAt` timestamp
- Published via `DomainEventDispatcher` using MediatR `IPublisher`

### Entity Base Class (`Domain/Common/Entity.cs`)
- Tracks domain events in `_domainEvents` collection
- `AddDomainEvent`, `ClearDomainEvents`, `DomainEvents` accessor

### Rich Domain Model (`Models/Cars.cs`)
- Inherits from `Entity`
- Private setters (encapsulation), private parameterless constructor for EF Core
- Factory method: `Cars.Create(...)` emits `CarCreated` event
- Domain methods: `UpdateDetails`, `ChangePrice`, `MarkSold`, `MarkAvailable`, `InstallPart` — each emits appropriate domain event
- Handlers delegate to entity methods instead of setting properties directly

### Event Dispatching
- `DomainEventDispatcher` registered as Scoped in DI
- `AppDbContext.SaveChangesAsync` overridden to collect entities with events and dispatch after successful save

## Wider Backend Internship Learning

Alongside this dashboard, I built a separate **car-maintenance workshop** project with `Cars.Domain`, `Cars.Application`, `Cars.Infrastructure`, `Cars.Api`, and `Cars.Domain.UnitTests`.

The workshop is separate from this repository's dashboard API. These lessons describe my broader internship work; its workshop models and event middleware are not features of the dashboard API.

### C# and .NET

- Records and value equality, sealed classes, access modifiers, and nullable types.
- Private constructors and static factories that return `ErrorOr<T>`.
- Guard clauses, primary constructors, asynchronous handlers, and collection expressions.
- Encapsulated collections and named business errors.

### Architecture and DDD

- Layer responsibilities and inward dependency design.
- Entities, value objects, aggregates, roots, factories, and repositories.
- Business invariants, domain services, and application orchestration.
- Workshop models: `Mechanic`, `WorkOrder`, `Part`, `Money`, and `EstimateLine`.
- Aggregate references by ID and domain events for completing or cancelling work.
- Trade-offs between transaction consistency and deferred reactions.

### Persistence and Request Processing

- EF Core configuration classes, owned values/collections, enum conversions, private-field mapping, and computed-property exclusions.
- Provider selection, schema creation versus migrations, and change tracking.
- Dependency injection lifetimes and sharing a scoped DbContext through an `IUnitOfWork` interface.
- MediatR request handlers versus notification handlers and assembly registration.
- Minimal APIs, HTTP error mapping, middleware, and per-request event queues.

The workshop's saved configuration uses SQL Server LocalDB and resets its practice database at startup. SQLite was also explored as a learning option.

Its event middleware experiments with publishing notifications and committing in `Response.OnCompleted`. Because this callback runs after the response is sent, a later failure cannot change that response. This is a learning implementation, not a durable outbox or guaranteed event-delivery mechanism. [Microsoft documents this callback timing](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.httpresponse.oncompleted).

### Testing and Working Habits

- xUnit `Fact`, `Theory`, `InlineData`, and Arrange–Act–Assert.
- Testing domain rules and failure paths.
- Fake repositories, counters, and unit-of-work implementations for isolated handler tests.
- Checking setup failures, meaningful assertions, and state/event behavior.
- Debugging exceptions, reading build errors, using breakpoints, and keeping Git checkpoints.

Strategic design, bounded contexts, context maps, integration events, and the outbox remain future learning topics. The workshop tests were not rerun for this documentation update.

## Verification

Run from `CarsAPI/cars-frontend`:

```powershell
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build -- --webpack
npm.cmd run test:e2e
```

The latest frontend refactor passed TypeScript, ESLint, and a webpack production build. A full browser run passed 26 of 28 scenarios; the two paging scenarios passed after a fix in a targeted rerun. The complete suite was not rerun together after that last fix.

The browser suite starts the production frontend on port 3100 and intercepts API calls. It verifies interface behavior without writing to the real database. On 9 November, the backend build passed and disposable local SQL Server requests exercised car and part writes, validation responses, and OData reads.

The webpack build was used because the default Turbopack build encountered a CSS worker startup issue in the development environment.

## Project Scope

This is a local full-stack learning application. Authentication and deployment are outside the completed scope. Interface translations use maintained dictionaries rather than a runtime machine-translation service.
