# AVEN

## Local development

Install dependencies and start the Next.js development server:

```sh
npm install
npm run dev
```

## Supabase setup

Create `.env.local` in the project root and set the Supabase project URL and
publishable key. Do not put a service-role or secret key in this frontend app:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Restart Next.js after changing environment variables. Configure the Supabase Auth
URL allow list to include the app's local and deployed URLs, including
`/auth/callback`, `/onboarding`, and `/reset-password` redirects.

Review and run
[`supabase/migrations/20261117000000_create_profiles.sql`](./supabase/migrations/20261117000000_create_profiles.sql)
in the Supabase SQL Editor. The migration creates the profile table, owner-only
Row Level Security policies, and an `updated_at` trigger; it does not delete
existing data.

Email/password registration is available at `/signup`, sign-in at `/login`,
and account recovery from the sign-in page. Enable and configure OAuth providers
in Supabase before adding any social sign-in UI.

## OAuth provider setup

AVEN calls Supabase Auth with these provider IDs and scopes:

| AVEN button | Supabase provider | Requested scopes |
| --- | --- | --- |
| Google | `google` | `openid email profile` |
| Microsoft | `azure` | `email` |
| Apple | `apple` | `name email` |
| GitHub | `github` | `read:user user:email` |

Supabase's provider callback URL for the AVEN project is
`https://qtouxsugkrjvwbzdypye.supabase.co/auth/v1/callback`. Register that exact
URL as the OAuth callback/redirect URI with each provider. In Supabase Dashboard
under Authentication, enable each provider and enter its real credentials.
Provider secrets belong only in Supabase's provider settings, never in AVEN's
browser environment or source files.

Set Supabase's Site URL to the deployed AVEN origin and add these application
redirect URLs to its redirect allow list:

- `http://localhost:3000/auth/callback` for local development
- `https://<your-deployed-aven-domain>/auth/callback` for production
- Any exact preview callback origins that AVEN will use

The callback also handles email confirmation and password recovery. A provider
is not considered configured or tested until its dashboard credentials and
redirect URI are saved and a real provider sign-in succeeds.

## Web search

Search requests use the authenticated `POST /api/search` route. The server-side
Brave Web Search adapter requires `BRAVE_SEARCH_API_KEY` in `.env.local`; the
key is never exposed to the browser. Without it, search returns an explicit
provider-not-configured response instead of sample results.

Search results keep source metadata (title, description, URL, provider, and
source type) separate from the AI answer contract. AI answer generation is not
configured, so no generated answer or citation is returned.