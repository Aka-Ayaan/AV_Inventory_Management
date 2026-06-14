# AV Inventory Management

React + JSX frontend for an AV inventory system backed by Supabase.

## Initialization

1. Copy [.env.example](.env.example) to `.env` and fill in your Supabase project URL and anon key.
2. Do not rerun [src/assets/schema.sql](src/assets/schema.sql) if your tables already exist; that file is kept here as reference only.
3. Install dependencies if needed:

```bash
npm install
```

4. Start the frontend:

```bash
npm run dev
```

## What this starter includes

- JSX-based React frontend
- Supabase client wrapper in [src/lib/supabase.js](src/lib/supabase.js)
- Dashboard sections for categories, items, and maintenance history
- Supabase schema reference in [src/assets/schema.sql](src/assets/schema.sql)

## `.env` values

Use the values from your Supabase project settings:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
