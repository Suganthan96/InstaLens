# InstaLens Technical 
InstaLens is a multi-service Instagram intelligence platform with three deployable units:

- frontend: Next.js 15 App Router application (UI + API proxy/integration routes)
- backend: Express + TypeScript API (OAuth, scraping, AI analysis)
- instalensagent: Mastra workspace for agent and workflow development

This document is implementation-focused and maps directly to the current source layout.

## 1. System Topology

Request path for core analysis:

1. Browser submits username to frontend route.
2. Frontend route proxies to backend profile analyzer.
3. Backend fetches Instagram data from Apify dataset.
4. Backend computes derived metrics (hashtags, mentions, engagement).
5. AI analysis runs through backend or frontend AI route (depending on UI flow).
6. Frontend pushes structured output to cloud integrations.

Key source entrypoints:

- backend server bootstrap: backend/src/server.ts
- backend profile analysis route: backend/src/routes/profile.ts
- backend AI route: backend/src/routes/ai.ts
- frontend proxy route A: frontend/app/api/profile/analyze/route.ts
- frontend proxy route B: frontend/app/api/analyze-instagram/route.ts
- frontend AI route: frontend/app/api/analyze/route.ts
- frontend integration push route: frontend/app/api/integrations/push/route.ts
- frontend integration manager: frontend/lib/integrations/manager.ts

## 2. Repository Layout

High-level tree:

```text
InstaLens/
	backend/
	frontend/
	instalensagent/
```

Backend modules:

- lib/instagram: OAuth and Instagram API client helpers
- lib/apify: dataset-based scraper client and metrics extractors
- lib/ai: Mastra setup and analysis wrappers
- routes: auth, profile, ai route handlers
- lib/validation: Zod schemas + response helpers

Frontend modules:

- app: App Router pages and route handlers
- app/api: server-side API routes (proxy/orchestration/integration)
- lib/ai: orchestrator wrappers
- lib/integrations: provider-specific push implementations

Agent workspace:

- src/mastra/agents: domain agents
- src/mastra/tools: tool wrappers
- src/mastra/workflows: workflow experiments (includes Instagram workflow scaffold)

## 3. Runtime Requirements

- Node.js:
	- frontend/backend: 20+ recommended
	- instalensagent: >= 22.13.0 (declared in instalensagent/package.json)
- Package managers:
	- backend: npm
	- frontend: pnpm 10.x recommended (pnpm lockfile present)
	- instalensagent: npm
- External services for full feature parity:
	- Meta Instagram app credentials
	- Apify actor + dataset + API token
	- Groq API key
	- Optional CRM/data integrations credentials

## 4. Environment Matrix

### 4.1 Backend required variables

Defined in backend/.env.example and validated in backend/src/lib/validation/schemas.ts:

- INSTAGRAM_APP_ID
- INSTAGRAM_APP_SECRET
- INSTAGRAM_REDIRECT_URI
- PORT
- NODE_ENV
- FRONTEND_URL

Used by routes/services (not all schema-validated):

- APIFY_API_TOKEN
- APIFY_ACTOR_ID
- APIFY_DATASET_ID
- GROQ_API_KEY

### 4.2 Frontend variables

Defined in frontend/.env.example and/or route usage:

- BACKEND_URL
- NEXT_PUBLIC_BACKEND_URL
- NEXT_PUBLIC_API_URL
- GROQ_API_KEY
- GOOGLE_CLOUD_PROJECT
- GOOGLE_CLOUD_CREDENTIALS
- HUBSPOT_ACCESS_TOKEN
- MAILCHIMP_API_KEY
- SALESFORCE_INSTANCE_URL
- SALESFORCE_CLIENT_ID
- SALESFORCE_CLIENT_SECRET
- SALESFORCE_USERNAME
- SALESFORCE_PASSWORD
- SALESFORCE_ACCESS_TOKEN
- NEXT_PUBLIC_BIGQUERY_PROJECT_ID
- NEXT_PUBLIC_BIGQUERY_DATASET_ID
- NEXT_PUBLIC_MAILCHIMP_LIST_ID
- NEXT_PUBLIC_SALESFORCE_INSTANCE_URL
- DEFAULT_SPREADSHEET_ID

### 4.3 Critical alignment

Two frontend proxy routes use different fallback backend URLs in code:

- frontend/app/api/profile/analyze/route.ts fallback: http://localhost:3001
- frontend/app/api/analyze-instagram/route.ts fallback: http://localhost:5001

Set explicit environment variables so all routes target the same backend origin.

## 5. Local Development

Open three terminals and run each service independently.

### 5.1 Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Expected:

- Server starts on PORT (common local value: 3001)
- Health endpoint available at /health

### 5.2 Frontend

Recommended (pnpm):

```powershell
cd frontend
pnpm install
pnpm dev
```

Alternative (npm):

```powershell
cd frontend
npm install
npm run dev
```

### 5.3 Mastra agent workspace

```powershell
cd instalensagent
npm install
npm run dev
```

Mastra Studio default URL: http://localhost:4111

## 6. Build and Production Commands

### Backend

```powershell
cd backend
npm run build
npm start
```

### Frontend

```powershell
cd frontend
pnpm build
pnpm start
```

### Agent workspace

```powershell
cd instalensagent
npm run build
npm run start
```

## 7. API Contracts

## 7.1 Backend response envelope

Backend utilities in backend/src/lib/validation/errors.ts wrap most responses in:

```json
{
	"success": true,
	"data": {},
	"timestamp": "2026-04-10T00:00:00.000Z"
}
```

Error shape:

```json
{
	"success": false,
	"error": {
		"message": "...",
		"code": "..."
	},
	"timestamp": "2026-04-10T00:00:00.000Z"
}
```

## 7.2 Backend endpoints

- GET /health
- GET /api/auth/instagram
- GET /api/auth/instagram/callback
- POST /api/auth/revoke
- GET /api/profile/me
- POST /api/profile/analyze
- POST /api/ai/analyze

Profile analyze request:

```json
{
	"username": "example_business"
}
```

Profile analyze response data includes:

- profile: account metadata
- posts: normalized post list
- extracted.hashtags: frequency-ranked hashtags
- extracted.mentions: frequency-ranked mentions
- extracted.engagement: totals and averages

## 7.3 Frontend API routes

- POST /api/profile/analyze: transparent proxy to backend profile route
- POST /api/analyze-instagram: proxy + processing time metadata
- POST /api/analyze: AI orchestration using MastraOrchestrator
- POST /api/integrations/push: validates target configs and dispatches push

### Example cURL: proxy analyze

```bash
curl -X POST http://localhost:3000/api/analyze-instagram \
	-H "Content-Type: application/json" \
	-d '{"username":"example_business"}'
```

### Example cURL: integration push

```bash
curl -X POST http://localhost:3000/api/integrations/push \
	-H "Content-Type: application/json" \
	-d '{
		"analysisData": {"username":"example_business"},
		"integrationTargets": ["google_sheets"],
		"credentials": {
			"google_sheets": {
				"spreadsheetId": "sheet_id",
				"sheetName": "Instagram Leads"
			}
		}
	}'
```

## 8. Analysis Pipeline Internals

Backend profile analysis (backend/src/routes/profile.ts):

1. Validate username existence.
2. Validate Apify credentials are configured.
3. Fetch dataset items via Apify client.
4. Filter items by ownerUsername match.
5. Derive hashtags and mentions from captions using regex.
6. Compute engagement aggregates.
7. Return normalized response payload.

AI analysis behavior:

- If GROQ_API_KEY missing, routes return success with warning and null AI fields.
- If orchestration fails, current behavior is often graceful fallback instead of hard failure.
- Development mode may include debug stack traces in response fields.

## 9. Integrations Technical Notes

Integration targets currently wired in frontend/lib/integrations/manager.ts:

- google_sheets
- bigquery
- mailchimp
- salesforce

Validation rules in manager:

- google_sheets requires spreadsheetId and sheetName
- bigquery requires projectId, datasetId, and GOOGLE_CLOUD_CREDENTIALS
- mailchimp requires listId and MAILCHIMP_API_KEY
- salesforce requires instanceUrl and SALESFORCE_ACCESS_TOKEN

Dispatch model:

- Promise.allSettled fan-out
- Per-target status returned as fulfilled/rejected
- Errors are isolated to target-level result objects

## 10. Deployment

## 10.1 Frontend on Vercel

Because frontend has pnpm-lock.yaml and packageManager pinned to pnpm, use pnpm install/build commands in Vercel.

Recommended vercel.json commands:

```json
{
	"installCommand": "pnpm install --frozen-lockfile",
	"buildCommand": "pnpm build"
}
```

Deploy command:

```powershell
cd frontend
npx vercel --prod
```

## 10.2 Backend hosting

Deploy as standard Node service:

- Build command: npm run build
- Start command: npm start
- Port binding: expose process env PORT
- Ensure outbound connectivity to Apify and Groq

Post-deploy:

- set frontend BACKEND_URL and NEXT_PUBLIC_API_URL to backend public URL
- verify /health before functional tests

## 11. Observability and Debugging

Current observability style:

- console logging with emoji-prefixed stage markers in routes
- explicit warnings for missing credentials
- structured success/error wrappers on backend

Recommended production additions:

- centralized structured logging
- request IDs and correlation IDs
- latency/error metrics by route
- alerting on Apify/Groq upstream failure rates

## 12. Testing and Validation

Backend test command exists:

```powershell
cd backend
npm test
```

Quick smoke checks:

1. GET backend /health returns success true.
2. POST frontend /api/analyze-instagram returns profile payload for known username.
3. POST frontend /api/analyze returns success and non-null analysis when GROQ key configured.
4. POST frontend /api/integrations/push returns per-target statuses.

## 13. Known Technical Risks

- Route fallback backend ports differ in frontend proxy handlers.
- Frontend currently uses Next.js 15.1.9 which has an upstream security advisory warning in install output.
- Some documentation references Redis token caching, while runtime currently initializes in-memory token store in backend/src/server.ts.

## 14. Operational Checklist

Before release:

1. Confirm env vars are set in all environments.
2. Align frontend backend URL variables to single origin.
3. Run backend build + tests.
4. Run frontend production build.
5. Validate OAuth callback URL exact match in Meta app config.
6. Validate at least one end-to-end integration push.

After release:

1. Verify backend /health.
2. Run one live username analysis.
3. Confirm AI output path with real GROQ key.
4. Confirm integration push target returns fulfilled status.

