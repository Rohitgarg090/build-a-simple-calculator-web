# Data Model — Calculator Web App

> **Core calculator functionality requires zero database tables.**  
> The schema below is **optional** and activates only when `NEXT_PUBLIC_ENABLE_HISTORY=true` and Supabase credentials are provided.

---

## Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────┐
│                    calculations                     │
├──────────────┬──────────────┬───────────────────────┤
│ Column       │ Type         │ Constraints           │
├──────────────┼──────────────┼───────────────────────┤
│ id           │ UUID         │ PK, DEFAULT uuid()    │
│ expression   │ TEXT         │ NOT NULL              │
│ result       │ VARCHAR(64)  │ NOT NULL              │
│ session_id   │ UUID         │ NULLABLE, INDEX       │
│ created_at   │ TIMESTAMPTZ  │ NOT NULL, DEFAULT NOW │
└──────────────┴──────────────┴───────────────────────┘

  No foreign keys — fully standalone, no auth dependency.
```

---

## Table Descriptions

### `calculations`

Each row represents one evaluated arithmetic expression.

| Column       | Type         | Description                                                                 |
|--------------|--------------|-----------------------------------------------------------------------------|
| `id`         | `UUID`       | Auto-generated primary key.                                                 |
| `expression` | `TEXT`       | The full expression string shown in the calculator display, e.g. `7 * 8`.  |
| `result`     | `VARCHAR(64)`| The evaluated answer. Stored as text to handle decimals and error strings.  |
| `session_id` | `UUID`       | Optional client-generated UUID (from `localStorage`) for grouping history. |
| `created_at` | `TIMESTAMPTZ`| UTC timestamp auto-set on insert.                                           |

---

## Indexes

| Name                        | Column(s)    | Purpose                                            |
|-----------------------------|--------------|----------------------------------------------------|
| `idx_calculations_session`  | `session_id` | Fast lookup of all calculations for one session.  |
| `idx_calculations_created`  | `created_at` | Efficient chronological sorting / pagination.     |

---

## Row Level Security (Supabase)

| Policy                    | Role                    | Operation | Rule         |
|---------------------------|-------------------------|-----------|--------------|
| `anon_insert_calculations`| `anon`, `authenticated` | INSERT    | `WITH CHECK (true)` — open insert |
| `anon_select_calculations`| `anon`, `authenticated` | SELECT    | `USING (true)` — open read        |

History data is non-sensitive (no PII), so both policies are intentionally permissive.  
If privacy is needed, replace `USING (true)` with `USING (session_id = current_setting('app.session_id')::uuid)`.

---

## Data Flow

```
 [Browser]
    │
    │  1. User enters expression → calculator evaluates locally (no DB)
    │
    │  2. (Optional) POST /api/history  ──►  Supabase `calculations` table
    │
    │  3. (Optional) GET  /api/history  ◄──  rows filtered by session_id
    │
    └─ session_id stored in localStorage (generated once, never expires)
```

---

## Environment Variables

```env
# Required for Supabase history feature
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Feature flag — set to "true" to enable history persistence
NEXT_PUBLIC_ENABLE_HISTORY=false
```

---

## Design Decisions

1. **No auth dependency** — `session_id` is a client-generated UUID, eliminating the need for user accounts while still grouping history meaningfully.
2. **Result as string** — Arithmetic results can be decimals, very large integers, or error messages (`"Error: Div by 0"`). A `VARCHAR(64)` string covers all cases without precision loss.
3. **Single table** — The calculator domain is intentionally simple. One table is the correct scope; over-engineering with operation-type enums or user tables is unnecessary.
4. **Feature-flagged** — The entire persistence layer is opt-in, keeping the default deployment zero-dependency and instantly deployable to Vercel without any database setup.
