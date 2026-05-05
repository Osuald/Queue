# QueueCare — Clinic Appointment System

This is a full-stack clinic appointment management system built as a QA engineering assessment for Amali Tech.  
**Stack I used:** Node.js + Express + SQLite (backend) · React + Vite (frontend) · Jest + Supertest (API tests) · Playwright (UI tests)

---

## Prerequisites

| Tool    | Minimum version used | How to check |
| ------- | -------------------- | ------------ |
| Node.js | **22.x**             | `node -v`    |
| npm     | 9.x                  | `npm -v`     |

> **Why I chose to use Node.js 22?**  
> For the backend, I used Node.js 22's built-in `node:sqlite` module (`node:sqlite` is a package which was added in v22.5.0).  
> This is an experimental API in Node 22 (stable in Node 23+). The `--experimental-sqlite` flag  
> is passed automatically by all npm scripts — so there is no extra setup needed.  
> No native compilation is required, so `npm install` works on all platforms out of the box.

---

## Project structure

QueueCare/
├── backend/ Node.js + Express REST API
│ ├── src/ Source code
│ ├── tests/ Jest + Supertest API tests
│ └── data/ SQLite database file (auto-created, git-ignored)
├── frontend/ React + Vite SPA
│ └── src/
├── tests/
│ └── ui/ Playwright browser tests
├── playwright.config.js
└── README.md

---

## Installation

### 1. Installing backend dependencies

cd backend
npm install

### 2. Installing frontend dependencies

cd frontend
npm install

### 3. Installing Playwright and root dependencies

# From the project root (QueueCare/)

npm install
npx playwright install chromium

---

## Environment variables

| Variable       | Default                    | Description                                         |
| -------------- | -------------------------- | --------------------------------------------------- |
| `PORT`         | `5000`                     | API server port                                     |
| `JWT_SECRET`   | osuald-kai-iradukunda-2026 | Secret for signing JWT tokens                       |
| `NODE_ENV`     | `development`              | It is set to `test` automatically during `npm test` |
| `FRONTEND_URL` | `http://localhost:3000`    | Allowed CORS origin                                 |

---

## Running the application

**Backend:**

cd backend
npm run dev

API is available at `http://localhost:5000/api`

API is also deployed at `https://queuecare-fr0r.onrender.com`

**Frontend:**

cd frontend
npm run dev

App is available at `http://localhost:3000`

App is also deployed at `https://quecareclinic.vercel.app`

---

## Default test credentials

To test this you can register accounts with any credentials using the form at `/register`.

Here are starting accounts to start with (by register them first using the UI):

| Role    | Email            | Password |
| ------- | ---------------- | -------- |
| Patient | patient@demo.com | demo1234 |
| Staff   | staff@demo.com   | demo1234 |
| Admin   | admin@demo.com   | demo1234 |

---

## Running API tests

API tests use an **in-memory SQLite database** — so that no running server needed.

cd backend
npm test

Expected output:

PASS tests/api/auth.test.js
PASS tests/api/appointments.test.js
PASS tests/api/queue.test.js

Test Suites: 3 passed
Tests: ~40 passed

---

## Running UI tests

To run UI tests we need to run both backend and frontend.  
We can use Playwright config (`playwright.config.js`) which starts both servers automatically.

# From project root

npm run test:ui

# To see the browser (using headed mode):

npx playwright test --headed

# To view the HTML report after a run we can use:

npx playwright show-report

---

## Running all tests

# From project root

npm run test:all

---

## End-to-End System Testing with Artillery + Playwright

Combined E2E testing using **Artillery** for load generation and **Playwright** for real browser interactions. Tests all user workflows (Patient, Staff, Admin) in a single unified test suite.

### Prerequisites

Install Artillery and Playwright plugin:

```bash
npm install --save-dev artillery artillery-plugin-playwright
npx playwright install chromium
```

### Run Combined System Test

**Step 1: Start both servers**
```bash
# Terminal 1 - Backend on port 5000
cd backend
npm run dev

# Terminal 2 - Frontend on port 3000
cd frontend
npm run dev
```

**Step 2: Run the test**
```bash
# From project root, run combined test (local results)
npx artillery run combined-artillery.yml --output combined-report.json
```

**Step 3: View results**
```bash
# Generate HTML report
npx artillery report combined-report.json
```

### With Cloud Recording

```bash
# Set your Artillery API key (get from https://app.artillery.io)
$env:ARTILLERY_API_KEY = 'your-api-key-here'

# Run with cloud recording
npx artillery run combined-artillery.yml `
  --record `
  --key $env:ARTILLERY_API_KEY `
  --output combined-report.json
```

### Test Scenarios (5 Total)

| Scenario | Coverage | Weight | User Type |
|----------|----------|--------|-----------|
| **Frontend Pages** | Home, Login, Register, Dashboard navigation | 15% | Anonymous |
| **Patient E2E** | Register → Login → Create Appointment → Dashboard | 40% | Patient |
| **Staff E2E** | Register → Login → Queue Management | 30% | Staff |
| **Admin E2E** | Register → Login → Full System Management | 15% | Admin |
| **Auth Edge Cases** | Invalid login, duplicate registration, unauthorized access | 10% | Error cases |

### Load Profile

- **Phase 1:** 60s, 5→10 req/s (ramp-up)
- **Phase 2:** 120s, 10→30 req/s (ramp-up)
- **Phase 3:** 120s, 30 req/s (sustained)
- **Phase 4:** 60s, 10 req/s (cool-down)

### Key Metrics Measured

- **Success Rate**: % of requests completing without error
- **Response Times**: p50, p95, p99 latencies
- **Throughput**: Requests per second across all scenarios
- **Browser Interactions**: Page loads, form submissions, navigation
- **Error Distribution**: By endpoint and scenario

### Full Documentation

See [COMBINED_TESTING_GUIDE.md](COMBINED_TESTING_GUIDE.md) for:
- Detailed configuration reference
- Processor function breakdown
- Troubleshooting guide
- Performance baselines
- Infrastructure recommendations

---

## All APIs for reference (quick)

| Method | Endpoint                | Auth                 | Description                           |
| ------ | ----------------------- | -------------------- | ------------------------------------- |
| POST   | `/api/auth/register`    | —                    | Register a new user                   |
| POST   | `/api/auth/login`       | —                    | Login and receive JWT                 |
| GET    | `/api/appointments`     | Bearer               | List appointments (role-filtered)     |
| POST   | `/api/appointments`     | Bearer               | Create appointment                    |
| GET    | `/api/appointments/:id` | Bearer               | Get single appointment                |
| PUT    | `/api/appointments/:id` | Bearer               | Update appointment                    |
| DELETE | `/api/appointments/:id` | Bearer               | Cancel appointment                    |
| GET    | `/api/queue/today`      | Bearer               | Today's queue ordered by queue number |
| PATCH  | `/api/queue/:id/serve`  | Bearer (staff/admin) | Mark patient as served                |
