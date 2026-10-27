# FoundIt

FoundIt is a campus lost-and-found application. It helps students and campus staff report lost or found belongings, identify possible matches, and return items through an owner-reviewed claim process.

## Problem and users

Lost belongings are often reported through disconnected chats, notice boards, or word of mouth. FoundIt gives a campus community one place to publish reports, search across them, and coordinate a return while keeping the claimant's explanation and the finder's decision attached to the item.

The primary users are students and staff who lose or find personal items on campus. Each user has an account, and the person who posted a found-item listing is responsible for reviewing claims on it.

## Main workflows

1. **Report and find:** Register or log in, create a LOST or FOUND report, and search/filter the campus listings.
2. **Find possible matches:** The owner of a lost report requests ranked suggestions from active found reports. FoundIt scores category, title, description, location, keywords, and date similarity.
3. **Claim an item:** A signed-in user submits an explanation and identifying details for an active found listing. The same user cannot claim their own report or submit a duplicate active claim.
4. **Review and return:** The listing owner approves or rejects a pending claim. After approval, the owner confirms the return. Claimants and owners can track the status and related notifications.

## Features

- Account registration, login, and logout with hashed passwords and signed sessions
- Lost/found listings with text search, category/type filters, and pagination
- Ranked potential matches for the owner of a lost listing
- Claim explanations and private identifying details
- Owner-only claim review and return confirmation
- User-specific notifications and dashboard counts
- Validation, protected API routes, Helmet headers, CORS, and request rate limiting
- In-memory MongoDB for local development; configured MongoDB is required in production

## Technology and architecture

- **Frontend:** React, React Router, Vite
- **API:** Node.js, Express
- **Persistence:** MongoDB with Mongoose
- **Authentication:** bcryptjs password hashing, JWT verification, HttpOnly cookie
- **Tests:** Node's built-in test runner, Supertest, and an isolated MongoDB Memory Server

The React single-page app calls the Express JSON API. Express owns authentication, authorization, validation, match scoring, claim state transitions, and notifications. In production the same Express service serves the built frontend and API, so the browser uses same-origin API requests and the session cookie can remain `SameSite=Lax`.

## Run locally

Requirements: Node.js 20 or newer and npm.

```powershell
npm install
Copy-Item .env.example .env
```

Set `JWT_SECRET` in `.env` to a random value at least 32 characters long. `MONGODB_URI` may be left blank for local use; the backend then starts an ephemeral MongoDB Memory Server. This local database is erased when the backend stops.

Start both applications:

```powershell
npm run dev
```

- Web app: <http://localhost:5173>
- API health endpoint: <http://localhost:5000/api/health>

The backend may select a nearby port if port 5000 is already in use. If so, set `VITE_API_URL` in `.env` to `http://localhost:<selected-port>/api` and restart the frontend.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000` locally. |
| `MONGODB_URI` | Production | MongoDB connection string. Leave empty only for local ephemeral development. |
| `JWT_SECRET` | Yes | Random signing key with at least 32 characters. Never use the example placeholder in production. |
| `FRONTEND_URL` | No | Allowed frontend origin for credentialed cross-origin development requests; defaults to `http://localhost:5173`. |
| `VITE_API_URL` | No | Frontend API base URL; defaults to `http://localhost:5000/api`. Set to `/api` for the single-origin production deployment. |
| `NODE_ENV` | No | Set to `production` for deployment. Enables secure cookies and serves the production frontend. |

Do not commit `.env` files, production credentials, or database connection strings.

## Tests and production build

```powershell
npm test
npm run build
```

The backend integration test runs against a disposable in-memory database and exercises registration, listing search, match authorization/scoring, claim creation and duplicate prevention, owner-only review, return confirmation, and notifications.

## Deployment

The repository includes a Render Blueprint in [`render.yaml`](./render.yaml) for a single web service. It builds the frontend and serves it from Express alongside the API.

1. Push the project to a GitHub repository you control.
2. Create a MongoDB database in MongoDB Atlas. Configure network access for the deployment and create a database user with a strong password.
3. In Render, create a new Blueprint from the repository and apply `render.yaml`.
4. Set the generated service's `MONGODB_URI` to the Atlas connection string. The Blueprint generates a unique `JWT_SECRET`; keep it private.
5. Wait for the deployment to finish, then verify the deployed root page and `/api/health`.
6. Open the public URL in a private/incognito window and test registration, reporting, matching, claiming, owner review, and return confirmation.

**Deployment status:** This workspace does not yet have a GitHub remote, Render account configuration, or production MongoDB connection string. Therefore no public application URL is available yet. Add the final public URL here after deployment.

## Demo and submission

Record a 3-5 minute demo showing the problem and target users, a lost/found report, matching, the claim-review-return flow, and the deployed application. Upload it somewhere evaluators can access without requesting permission, then add the link here.

Before submitting, provide the project name, student name, problem statement, repository URL, deployed application URL, demo video URL, technology stack, and major features in the official submission form. Verify each link in a private/incognito window before the deadline.

## Project structure

- `backend/src/` - Express API, controllers, models, middleware, and match scoring
- `backend/test/` — API integration tests
- `frontend/src/` — React pages, components, context, and API client
- `render.yaml` — single-service Render deployment blueprint
- `.env.example` — local environment variable template
