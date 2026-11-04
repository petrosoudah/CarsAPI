# Cars Dashboard

A Next.js and TypeScript frontend for CarsAPI, with Cars/Parts management, English/Arabic/Spanish translations, and light/dark themes.

## Code organization

- `app/`: Next.js routes, root layout, and global Tailwind styles.
- `components/`: Cars/Parts UI, shared layout controls, providers, and UI primitives.
- `hooks/`: reusable React state and request logic.
- `lib/api/`, `lib/validation/`, `lib/i18n/`: HTTP clients, validation, and language storage.
- `practice/`: preserved learning exercises with descriptive filenames.
- `tests/e2e/`: browser regression tests using mocked APIs.

Read the [folder guide](docs/project-structure.md) for file locations and organization rules.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Fonts and reusable theme styles are defined in `app/globals.css`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
