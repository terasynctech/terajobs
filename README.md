# TeraJobs starter

A React + Vite frontend starter for TeraJobs by TeraSyncTech, designed for GitHub Pages with Supabase as the backend.

## Included in this first foundation
- Responsive job portal landing page
- Sample job cards and keyword/city filtering
- Supabase client configuration
- Initial Supabase SQL schema for profiles, companies, jobs, applications and saved jobs
- Private candidate resume storage bucket with initial access policies

**Important:** This is the initial foundation, not the finished recruitment system. Candidate authentication screens, profile editing, resume upload UI, employer workflows, admin tools, OTP and production-grade access review are the next implementation steps.

## 1. Install and run locally
Install Node.js LTS, then in this folder run:

```bash
npm install
npm run dev
```

## 2. Create Supabase project
In Supabase, create a separate project for TeraJobs. Open SQL Editor and run `supabase/schema.sql`.

Copy `.env.example` to `.env.local`, then fill in:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (or publishable key)

Never put a service-role or secret key in frontend environment variables.

## 3. GitHub Pages
Create a GitHub repository named `terajobs`, upload the project files, and enable GitHub Actions / Pages deployment. The Vite base path is set to `/terajobs/`; change it if your repository name differs.

For GitHub Actions deployment, add repository secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

A workflow file can be added in the next step once the final repository name and account URL are confirmed.
