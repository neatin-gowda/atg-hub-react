# ATG Hub React — Deployment Guide

## Prerequisites

- Node.js 18+ installed
- GitHub account
- Azure subscription with these resources already created:
  - Static Web App (existing: `victorious-hill-03f078403`)
  - Cosmos DB (existing: `atgemphub-db`)

---

## Step 1: Create New GitHub Repository

```bash
# Option A: Create on GitHub.com
# Go to github.com/new → name: "atg-hub-react" → private → create

# Option B: GitHub CLI
gh repo create atg-hub-react --private
```

## Step 2: Clone and Setup Locally

```bash
git clone https://github.com/YOUR_ORG/atg-hub-react.git
cd atg-hub-react

# Copy all project files into this directory
# (all the files from the React build)

npm install
```

## Step 3: Test Locally

```bash
# Terminal 1: Start the backend (same backend as before)
cd ../atg-emp-hub/backend
func start

# Terminal 2: Start React dev server
cd atg-hub-react
npm run dev
# Opens at http://localhost:3000
```

## Step 4: Create New Azure Static Web App

Since this is a new repo, you need a new Static Web App (or reconfigure the existing one).

### Option A: New Static Web App (Recommended)

1. **Azure Portal** → Create a resource → Static Web App
2. Settings:
   - **Name**: `atg-hub-react-prod`
   - **Region**: UAE North (or closest)
   - **Source**: GitHub
   - **Organisation**: Your GitHub org
   - **Repository**: `atg-hub-react`
   - **Branch**: `main`
   - **Build preset**: Custom
   - **App location**: `/`
   - **API location**: `../atg-emp-hub/backend` (or see Note below)
   - **Output location**: `dist`
3. Click **Create**

### Option B: Reuse Existing Static Web App

1. Azure Portal → Static Web App → `victorious-hill-03f078403`
2. Settings → Source → change to new repo `atg-hub-react`, branch `main`
3. Update build settings:
   - App location: `/`
   - Output location: `dist`
   - API location: (leave empty — backend stays in old repo)

### Note on Backend

The backend API functions (`/api/*`) are in the original `atg-emp-hub` repo. You have two options:

**Option 1 — Copy backend into React repo:**
```bash
mkdir -p atg-hub-react/backend
cp -r atg-emp-hub/backend/* atg-hub-react/backend/
# Then set API location to "backend" in Static Web App config
```

**Option 2 — Separate API deployment (recommended for production):**
- Deploy backend as a standalone Azure Function App
- Update `VITE_API_BASE` env var to point to the Function App URL

## Step 5: Set Environment Variables

In Azure Portal → Static Web App → Environment variables:

| Variable | Value |
|---|---|
| `COSMOS_ENDPOINT` | `https://atgemphub-db.documents.azure.com:443/` |
| `COSMOS_KEY` | Your Cosmos key |
| `COSMOS_DB` | `atgemphub` |
| `JWT_SECRET` | Your JWT secret |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `APP_COMPANY_NAME` | Your company name |
| `APP_NAME` | Hub |
| `APP_TAGLINE` | AI-Powered Employee Workspace |
| `APP_HR_PHONE` | `tel:+971XXXXXXXXX` |

## Step 6: GitHub Actions CI/CD

Azure automatically creates a workflow file. If not, create:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          app_location: "/"
          api_location: "backend"
          output_location: "dist"
```

## Step 7: Deploy

```bash
git add .
git commit -m "Initial React app"
git push origin main
```

GitHub Actions will build and deploy automatically. Check the Actions tab for progress.

## Step 8: Verify

1. Open your Static Web App URL
2. Login should work (same Cosmos DB)
3. All features should function identically to the HTML version
4. Test on mobile — save to home screen as PWA

## Step 9: Custom Domain (Optional)

1. Azure Portal → Static Web App → Custom domains
2. Add your domain (e.g., `hub.yourcompany.com`)
3. Add the CNAME record to your DNS
4. SSL certificate is auto-provisioned

---

## File Structure

```
atg-hub-react/
├── index.html                  # HTML entry (minimal)
├── package.json                # Dependencies
├── vite.config.js              # Build config
├── staticwebapp.config.json    # Azure SWA routing + CSP
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── assets/                 # Icons (add your logo here)
├── src/
│   ├── main.jsx                # Entry — providers + config
│   ├── App.jsx                 # Router + protected routes
│   ├── config.js               # Centralized config (API-loaded)
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth state + API helper
│   │   ├── ThemeContext.jsx    # Dark/light theme
│   │   └── ToastContext.jsx    # Notifications
│   ├── components/
│   │   ├── AppCard.jsx         # Agent/app card
│   │   ├── Avatar.jsx          # User avatar
│   │   ├── BottomNav.jsx       # Bottom navigation
│   │   ├── Carousel.jsx        # Hero carousel
│   │   ├── Icons.jsx           # All SVG icons
│   │   └── LoadingOverlay.jsx  # Auth loading animation
│   ├── pages/
│   │   ├── Login.jsx           # Sign in
│   │   ├── Register.jsx        # Create account
│   │   ├── Home.jsx            # Main dashboard
│   │   ├── Profile.jsx         # User profile + settings
│   │   ├── AllApps.jsx         # App marketplace
│   │   ├── AgentDetail.jsx     # Agent chat view
│   │   ├── VoiceAgent.jsx      # MYHR dual chat+call
│   │   ├── Leave.jsx           # Leave management
│   │   └── GiveKudos.jsx       # Send kudos
│   ├── data/
│   │   └── registry.js         # Apps, Q&A, seed data
│   └── styles/
│       └── tokens.css          # Complete design system
└── backend/                    # (copy from atg-emp-hub)
    └── src-functions/index.js
```

## Updating the Phone Number

No code change needed. In Azure Portal:
1. Go to Static Web App → Environment variables
2. Change `APP_HR_PHONE` to `tel:+971YOURNUMBER`
3. Save — takes effect within 1 minute (cached for current sessions)
