# Frontend (Vite + React)

This frontend is a Vite React SPA and can be deployed directly to Vercel.

## Deploy To Vercel

1. Push your code to GitHub.
2. Open Vercel and click `Add New...` -> `Project`.
3. Import this repository.
4. Set `Root Directory` to `Frontend`.
5. Confirm build settings:
   - `Framework Preset`: `Vite`
   - `Build Command`: `npm run build`
   - `Output Directory`: `dist`
6. Add environment variables in Vercel Project Settings:
   - `VITE_API_BASE_URL` = your deployed backend API base URL (example: `https://your-backend-domain/api`)
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth client ID (if using Google login)
7. Deploy.

## Important Notes

- `vercel.json` is configured for SPA routing, so routes like `/products` and `/dashboard` work after refresh.
- If frontend API calls fail after deploy, verify:
  - `VITE_API_BASE_URL` points to a public backend URL.
  - Backend CORS allows your Vercel domain.

## Local Development

```bash
npm install
npm run dev
```
