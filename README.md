# BlackRoad AI Dashboard

**Live at:** [ai.blackroad.io](https://ai.blackroad.io)

**Copyright 2024-2026 BlackRoad OS, Inc. All Rights Reserved.**
Proprietary software — see [LICENSE](./LICENSE) for terms.

## Features

- 9 AI agents across 3 distributed Raspberry Pi devices
- Real-time agent status monitoring (100% operational)
- Interactive chat interface with each agent
- Team organization: Infrastructure, Creative, Coding
- Self-healing deployment with automatic rollback
- Security scanning via CodeQL and dependency review

## Agent Network

### Infrastructure Team — Lucidia Device

| Agent | Role | Model |
|-------|------|-------|
| Lucidia | Systems Lead | tinyllama |
| Marcus | Product Manager | llama3.2:3b |
| Viktor | Senior Developer | codellama:7b |
| Sophia | Data Analyst | gemma2:2b |

### Creative Team — Cecilia Device

| Agent | Role | Model |
|-------|------|-------|
| CECE | Creative Lead | cece |
| Luna | UX Designer | llama3.2:3b |
| Dante | Backend Engineer | codellama:7b |

### Coding Team — Aria Device

| Agent | Role | Model |
|-------|------|-------|
| Aria-Prime | Code Specialist | qwen2.5-coder:3b |
| Aria-Tiny | Quick Responder | tinyllama |

## Tech Stack

- **Framework:** Next.js 14.2.21 (Static Export)
- **Language:** TypeScript 5.7.3
- **Runtime:** React 18.3.1
- **Hosting:** Cloudflare Pages + Workers
- **CI/CD:** GitHub Actions (SHA-pinned)
- **Monitoring:** Self-healing workflow (30-min intervals)
- **Security:** CodeQL, npm audit, Dependabot

## Development

```bash
# Install dependencies
npm install

# Start dev server on port 3030
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build
```

## Deployment

Deployments are automated via GitHub Actions on push to `main`:

1. **CI** — Builds, type-checks, and validates output
2. **Auto Deploy** — Deploys to Cloudflare Pages (static) + Workers (API)
3. **Health Check** — Validates `/api/health` endpoint post-deploy
4. **Self-Healing** — Monitors every 30 minutes, auto-rollbacks on failure

### Manual Deploy

```bash
# Build and deploy to Cloudflare Pages
npm run deploy

# Deploy worker separately
cd workers && npx wrangler deploy
```

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API authentication |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |
| `DEPLOY_URL` | Production URL for health checks |
| `RAILWAY_TOKEN` | Railway deployment (fallback) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth (if enabled) |

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| CI | Push, PR | Build validation and type checking |
| Auto Deploy | Push to main | Deploy to Cloudflare Pages + Workers |
| Security Scan | Push, PR, weekly | CodeQL analysis + dependency scanning |
| Self-Healing | Every 30 min | Health monitoring + auto-rollback |
| Automerge | Dependabot PRs | Auto-merge patch/minor dependency updates |

## API Endpoints (Cloudflare Worker)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check — returns service status |
| `/api/status` | GET | Agent network status by team |
| `/api/tasks` | POST | Queue long-running tasks |

## Project Structure

```
blackroad-ai-dashboard/
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── automerge.yml
│       ├── auto-deploy.yml
│       ├── ci.yml
│       ├── security-scan.yml
│       └── self-healing.yml
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── workers/
│   ├── health.ts
│   └── wrangler.toml
├── .gitignore
├── LICENSE
├── README.md
├── next.config.js
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## License

**PROPRIETARY** — BlackRoad OS, Inc. All Rights Reserved.

This software is not open source. No license is granted without explicit written authorization from BlackRoad OS, Inc. See [LICENSE](./LICENSE) for the full proprietary license terms.

Stripe products, domain portfolio, and all associated assets are property of BlackRoad OS, Inc.
