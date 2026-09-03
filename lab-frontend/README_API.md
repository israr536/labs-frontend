Backend Integration (local development)

This project can talk to the lab-backend API. These instructions are documentation only and do not change app behavior.

- Set API base URL via Vite env file. Create `./.env` or `./.env.local` in the frontend project with:

```bash
VITE_API_URL=http://localhost:3000
# Optional: Sentry DSN for production error logging
VITE_SENTRY_DSN=
```

- To run the backend (from the repo root `lab-backend`):

```bash
cd lab-backend
# install deps if needed
npm install
# start in dev
npm run start:dev
```

- To run the frontend (from `labs-frontend/lab-frontend`):

```bash
cd labs-frontend/lab-frontend
npm install
npm run dev
```

- Login: use the `POST /auth/login` endpoint on the backend. The frontend `Login` page will store returned `accessToken` and `refreshToken` in `localStorage` under `lab_access_token` and `lab_refresh_token`.

- Production notes:
  - For improved security, prefer HTTP-only cookies for tokens instead of `localStorage`.
  - Configure `VITE_SENTRY_DSN` in your CI/CD environment to enable Sentry error reporting.
