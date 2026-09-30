# SHE Scan (Baddiez)

A personalized food scanning and health safety companion built with React, Vite, TypeScript, and Supabase.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The application uses Supabase for database persistence (user profiles, scan history, and product caching) and authentication.

Copy the `.env.example` file to create your `.env` file:

```bash
cp .env.example .env
```

Open [.env](file:///c:/Users/aanya/Desktop/baddiez/baddiez/.env) and populate it with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Note:** If `.env` is not configured or left with placeholder values, the app automatically falls back to offline local storage (`localStorage`) so you can still test and demo seamlessly.

### 3. Database Schema Setup

To create the required tables (`profiles`, `scans`, `products_cache`) and Row Level Security (RLS) policies:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor**.
3. Run the SQL script located in [`supabase/migrations/001_create_schema.sql`](file:///c:/Users/aanya/Desktop/baddiez/baddiez/supabase/migrations/001_create_schema.sql).

### 4. Run Development Server

```bash
npm run dev
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS & Framer Motion
- **Icons**: Lucide React
- **Database & Auth**: Supabase (@supabase/supabase-js)
- **Data Source**: Open Food Facts API + Barcode Detector

