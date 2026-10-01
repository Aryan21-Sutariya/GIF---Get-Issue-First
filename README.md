# GIF — Get Issue First

## Introduction

**GIF (Get Issue First)** is an intelligent GitHub monitoring dashboard designed to help open-source contributors and maintainers stay ahead of critical repository activity. Finding the right issues—such as bugs, documentation needs, or bounties—can be overwhelming in fast-moving repositories. GIF solves this by watching your favorite repositories and filtering incoming issues by specific labels in real time.

## Deployed Application
The application is live and accessible at:
https://gif-get-issue-first.vercel.app

## Key Features

- **Public & Private Repository Monitoring**: Securely watch any public or authorized private repository.
- **Precision Label Filtering**: Filter out noise by receiving alerts only when an issue maps to specific tracked labels (e.g., `bug`, `good first issue`).
- **All Issues Mode**: Catch absolutely everything in smaller or high-priority repositories.
- **Real-time Notifications**: Immediate visual alerts deployed to the dashboard via a robust background polling system.
- **Clean Dashboard UI**: Visually stunning and responsive interfaces that integrate dark mode naturally.

## How GIF Works

1. **Authentication**: Sign in via GitHub OAuth to sync your identity and map private repository accesses securely.
2. **Watchlist Configuration**: Add URLs for public or private repositories, and select the specific issue labels you want GIF to monitor.
3. **Webhook Monitoring**: Real-time event webhooks from GitHub ping the GIF backend whenever new issues are triggered. 
4. **Instant Matching**: The system immediately verifies labels against your tracking filters and dispatches alerts directly to your dashboard.

## Tech Stack

**Frontend**
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React (Icons)

**Backend**
- Node.js (Express)
- JWT-based Auth
- GitHub REST API / Webhooks
- Smee (Local Webhook Forwarding)

**Database**
- PostgreSQL (Database)
- Prisma (ORM)

**Browser Extension**
- Manifest V3 Chrome Extension

## Project Structure

```
.
├── backend/          # Express.js REST API and webhook handlers
│   ├── prisma/       # PostgreSQL DB schema and migrations
│   ├── scripts/      # Local webhook tunneling script (smee.js)
│   └── src/          # Core backend logic (routes, middleware, app.js)
├── extension/        # Standalone Chrome browser extension
├── frontend/         # React SPA (Vite) for dashboard configuration
│   └── src/
│       ├── components/ # Reusable UI pieces (Buttons, Modals, Cards)
│       ├── context/    # React context (Auth, Repository data flow)
│       └── pages/      # Top-level Dashboard view logic
└── README.md
```

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- GitHub Account

### Clone the Repository
```bash
git clone https://github.com/Aryan21-Sutariya/GIF---Get-Issue-First.git
cd GIF---Get-Issue-First
```

### Frontend Setup
```bash
cd frontend
npm install
# Configure your frontend .env
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
# Configure your backend .env
npx prisma generate
npx prisma migrate dev
npm start
```

## Environment Variables

### Backend `.env`
- `DATABASE_URL`: Your PostgreSQL connection string.
- `GITHUB_CLIENT_ID`: OAuth Client ID provided by your GitHub App.
- `GITHUB_CLIENT_SECRET`: OAuth Client Secret for authenticating users.
- `GITHUB_WEBHOOK_SECRET`: Secure string used by GitHub to sign payload webhooks matching backend validation.
- `SESSION_SECRET`: Cryptographic secret for signing JWTs.
- `FRONTEND_URL`: URL of your deployed or local frontend (e.g., `http://localhost:5173`).
- `SMEE_WEBHOOK_URL`: (Development Only) Webhook proxy URL to receive local dev payloads.

### Frontend `.env`
- `VITE_API_URL`: Base URL endpoint for backend REST services (e.g., `http://localhost:5000`).

*(Note: Never commit your actual `.env` files exposing these keys.)*

## GitHub App Setup
To run GIF, you need a registered [GitHub Application](https://docs.github.com/en/apps).
1. Provide a `Homepage URL` and a `Callback URL` (`<your-backend>/api/auth/github/callback`).
2. Request **Read-only** scopes for User Information (to authenticate).
3. Check the "Webhooks" configuration and route events to your backend `/api/webhooks/github`, using the exact `GITHUB_WEBHOOK_SECRET`.
4. Ensure the GitHub app is configured to listen to `Issues` events.

## Browser Extension Local Installation
The repository includes an untracked development browser extension capable of injecting dashboard integration directly into Chrome navigation.

1. Navigate to chrome://extensions in your Chrome browser.
2. Ensure **"Developer mode"** is toggled ON (top right).
3. Select **"Load unpacked"**.
4. Choose the `extension/` directory present in this repository. 
5. The GIF icon will now appear in your browser!

## Deployment Overview
- **Frontend**: Designed to map seamlessly onto platforms like Vercel or Netlify via standard Vite build mechanisms (`npm run build`).
- **Backend & Database**: Ready for deployment onto platforms like Render, Heroku, or Fly.io alongside a cloud PostgreSQL provider like Supabase or Neon. 

## Security and Privacy Notes
- Account deletions are implemented natively with Prisma Cascading logic safely destroying associated monitoring tracks, repos, and historical data instantly.
- JWT tokens are strictly isolated in HttpOnly, SameSite-secured cookies safeguarding them from generalized XSS.
- Webhook endpoints strictly validate inbound GitHub `x-hub-signature-256` HMAC payloads to prevent malicious spoofing metrics.

## Known Limitations
- Current polling mechanics rely on efficient silent background API polling logic, prioritizing stability. Deep websocket or SSE (Server-Sent Events) bindings are currently unsupported natively.
- Label selections are currently enforced as an `OR` condition logic per implementation (if any selected labels hit, you'll be notified). 

## Future Improvements
- Refined automated filtering syntax utilizing wildcard or regex selections.
- Real-time SSE integration scaling to handle heavier traffic safely.
- Slack & Discord notification channel integrations. 

## Contributing
As GIF is currently in its core development phases, pull requests are not routinely accepted. If you locate a bug, feel free to report it by creating a standard issue outline.

## License
The project currently has no license and reuse permissions are not yet granted. All rights are reserved to the primary authors.
