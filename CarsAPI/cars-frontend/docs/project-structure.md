# Frontend structure

Files are grouped by responsibility. Routes stay in `app`, UI lives in `components`, stateful logic lives in `hooks`, and non-UI helpers live in `lib`.

```text
cars-frontend/
├── app/                           Next.js routes and global styles
│   ├── layout.tsx                 Root document and provider composition
│   ├── page.tsx                   Cars dashboard coordinator
│   ├── globals.css                Tailwind theme and reusable classes
│   ├── about/page.tsx
│   ├── cars/[id]/page.tsx
│   ├── cars/[id]/loading.tsx
│   └── parts/page.tsx
├── components/
│   ├── cars/                      Active Cars UI
│   │   ├── CarCard.tsx
│   │   ├── CarList.tsx
│   │   ├── CarFilters.tsx
│   │   ├── CarSearchInput.tsx
│   │   ├── CarPagination.tsx
│   │   ├── CarFormDialog.tsx
│   │   ├── DeleteCarDialog.tsx
│   │   ├── CarDetailsView.tsx
│   │   └── BackToDashboard.tsx
│   ├── parts/                     Parts form and deletion dialog
│   ├── layout/                    Navigation, LanguageSwitcher, ThemeToggle
│   ├── providers/                 AppProviders, LanguageProvider, ThemeProvider
│   └── ui/                        Shared shadcn/Base UI primitives
├── hooks/                         useCars, useCarActions, useTranslatedError
├── lib/
│   ├── api/                       cars-api.ts and parts-api.ts
│   ├── validation/                car-validation.ts and part-validation.ts
│   ├── i18n/                      language-store.ts
│   └── utils.ts                   Shared utility export
├── messages/                      English, Arabic, Spanish dictionaries
├── practice/                      Earlier exercises, separate from active UI
│   ├── components/
│   ├── context/
│   ├── hooks/
│   └── README.md
├── public/                        Static images and assets
├── tests/e2e/                     Cars and Parts browser tests
├── scripts/                       API verification scripts
└── docs/                          Project notes
```

## Where new code belongs

- A URL starts with an `app/.../page.tsx`. Keep route entry points easy to locate.
- Car UI belongs in `components/cars`; Parts UI belongs in `components/parts`.
- Shared navigation and controls belong in `components/layout`.
- App-wide providers belong in `components/providers`. `AppProviders` defines their nesting once.
- A reusable function using React hooks belongs in `hooks` and starts with `use`.
- HTTP clients belong in `lib/api`; pure validation belongs in `lib/validation`.
- Browser language storage belongs in `lib/i18n`; translated text belongs in `messages`.
- Teaching demonstrations belong in `practice` until intentionally integrated into a route.

Use the existing alias across folders:

```tsx
import CarCard from "@/components/cars/CarCard";
import useCars from "@/hooks/useCars";
import { getCars, type Car } from "@/lib/api/cars-api";
```

Keep imports within one folder relative when clearer. Active components should not import exercises or depend on reusable UI located inside a route file.

## Relocated files

| Before | Now |
| --- | --- |
| `app/CarFilter.tsx` | `components/cars/CarSearchInput.tsx` |
| `app/LanguageProvider.tsx`, `app/ThemeProvider.tsx` | `components/providers/` |
| Navigation, language switcher, theme toggle in `components/cars` | `components/layout/` |
| `components/cars/useTranslatedError.ts` | `hooks/useTranslatedError.ts` |
| API files directly under `lib` | `lib/api/` |
| Validation files directly under `lib` | `lib/validation/` |
| `lib/language-store.ts` | `lib/i18n/language-store.ts` |
| `app/file.tsx` | `practice/components/PracticeCar.tsx` |
| `app/file - Copy.tsx` | `practice/components/CarPrice.tsx` |
| Old `app/CarCard.tsx` | `practice/components/LegacyCarCard.tsx` |
| Other exercise components from `app` | `practice/components/` |
| Exercise hooks and username context | `practice/hooks/` and `practice/context/` |

The active dashboard card is `components/cars/CarCard.tsx`. The legacy card is a preserved exercise. Routes and the `@/*` alias are unchanged. Configuration and environment files remain at the frontend root. No backend files were moved.

Reference: [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure).
