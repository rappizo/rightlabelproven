# RightLabelProven Next.js Rebuild

This project is a full Next.js rewrite of the current Right Label Proven WordPress site.

## Included

- Public marketing site
- Product verification lookup
- Certification application form
- Contact form
- Blog listing and article pages
- Admin login and session auth
- Admin dashboard
- Product verification management
- Blog management
- Submission management
- Site settings management

## Stack

- Next.js 16
- React 19
- Tailwind CSS
- Server Actions
- JWT cookie auth with `jose`
- Password hashing with `bcryptjs`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Check

```bash
npm run lint
npm run build
```

## Vercel Image Usage

This project is configured with `images.unoptimized = true` in [next.config.ts](G:/RLP/next.config.ts), so `next/image` will not use Vercel's Image Optimization pipeline or consume image transformations.

Seeded marketing images have also been copied into `public/media/` so deployment does not depend on legacy WordPress `wp-content` URLs.

## Supabase Setup

1. Open Supabase and copy your database connection strings from `Project Settings -> Database -> Connection string`.
2. Fill in `.env` with:

```bash
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...db.PROJECT_REF.supabase.co:5432/postgres"
ADMIN_ACCOUNT="admin"
ADMIN_PASSWORD="change-me-before-production"
```

Only `DATABASE_URL` and `DIRECT_URL` are truly required for the current build.
The Supabase URL / anon key / service role key are not needed yet because this project is not using the Supabase SDK or Supabase Auth yet.
`ADMIN_JWT_SECRET` is also optional for local development because the app has a built-in fallback secret. Set it before production deployment.

3. Generate the Prisma client:

```bash
npm run db:generate
```

4. Push the schema to Supabase:

```bash
npm run db:push
```

5. Seed the initial admin/settings/content records:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

After the env values are valid, the admin dashboard will show `Supabase PostgreSQL` as the active data source.

## Admin Access

- Admin URL: `/admin/login`
- Admin credentials are seeded from `ADMIN_ACCOUNT` and `ADMIN_PASSWORD`
- If you omit them, the built-in defaults are:
- Account: `admin`
- Password: `ChangeMe123!`

Change the seeded password before the first real deployment.

## Data Storage

The app now supports two runtime modes:

- Supabase PostgreSQL via Prisma when `DATABASE_URL` is configured
- Local fallback storage via `data/store.json` when Supabase env values are still placeholders or missing

This lets you keep building the UI and actions before the final Supabase credentials are wired in.
