# QueueCare Combined E2E System Testing

## Overview

This unified system test uses **Artillery with Playwright** to perform comprehensive end-to-end testing of the entire QueueCare application stack (React frontend + Node.js/Express backend + SQLite).

Instead of separate API-only and frontend-only tests, this single configuration tests real user workflows across all user roles with real browser interactions.

---

## Test Configuration

**File:** `combined-artillery.yml`  
**Processor:** `combined-flow.js`  
**Test Duration:** ~360 seconds (6 minutes)

### Load Profile
- **Phase 1:** 60s, 5→10 req/s (ramp-up)
- **Phase 2:** 120s, 10→30 req/s (ramp-up)
- **Phase 3:** 120s, 30 req/s (sustained load)
- **Phase 4:** 60s, 10 req/s (cool-down)

---

## Test Scenarios (5 Total)

| # | Scenario | Coverage | Weight | Interactions |
|----|----------|----------|--------|--------------|
| **01** | Frontend Pages | SPA navigation (home, login, register, dashboard) | 15% | Playwright (click, goto) |
| **02** | Patient E2E | Register → Login → Create Appointment | 40% | Playwright (form fill, submit, wait) |
| **03** | Staff E2E | Register → Login → Queue Management | 30% | Playwright (role select, queue view) |
| **04** | Admin E2E | Register → Login → Full Management | 15% | Playwright (create, edit appointments) |
| **05** | Auth Edge Cases | Invalid login, duplicate registration, unauthorized access | 10% | Playwright (error validation) |

---

## Quick Start

### Prerequisites
```bash
npm install artillery artillery-plugin-playwright --save-dev
```

### Step 1: Start Both Servers

**Terminal 1 - Backend (port 5000)**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (port 3000)**
```bash
cd frontend
npm run dev
```

### Step 2: Run Local Test

```bash
# From project root (Queue/)
npx artillery run combined-artillery.yml --output combined-report.json
```

**Output:** `combined-report.json` + live metrics in terminal

### Step 3: Generate HTML Report

```bash
npx artillery report combined-report.json
```

This opens an HTML report in your browser showing:
- Request/response times by endpoint
- Success/failure rates
- Latency percentiles (p50, p95, p99)
- Virtual user behavior
- Error breakdown

---

## Cloud Recording (Artillery Cloud)

### Step 1: Set API Key

```powershell
# PowerShell
$env:ARTILLERY_API_KEY = 'your-api-key-here'

# OR cmd.exe
set ARTILLERY_API_KEY=your-api-key-here
```

### Step 2: Run with Cloud Recording

```bash
npx artillery run combined-artillery.yml `
  --record `
  --key $env:ARTILLERY_API_KEY `
  --output combined-report.json
```

### Step 3: View on Artillery Cloud

After the run completes, you'll see a link:
```
Test report: https://cloud.artillery.io/organizations/.../tests/...
```

Open this link to view:
- Real-time test progress
- Aggregated metrics
- Comparative analysis
- Historical trends

---

## Test Credentials

### Pre-Created Test Users
- **Patient:** `patient1@test.com` / `password123`
- **Staff:** `staff@test.com` / `staffpass`
- **Admin:** `admin@test.com` / `adminpass`

### Dynamic User Generation
Scenarios 02-04 automatically create unique test users with timestamps:
```
patient-{timestamp}@test.com
staff-{timestamp}@test.com
admin-{timestamp}@test.com
```

---

## Processor Functions

**File:** `combined-flow.js`

### Core Functions

#### `setup(context)`
- Initializes Playwright browser page
- Sets viewport (1280x720)
- Configures timeouts

#### `cleanup(context)`
- Closes browser page
- Cleans up resources

#### `frontendPagesFlow(context)`
- Navigates through frontend pages
- Tests SPA routing (/, /login, /register, /dashboard)

#### `patientE2EFlow(context)`
- Registers patient account
- Logs in
- Creates appointment
- Views appointments

#### `staffE2EFlow(context)`
- Registers staff account
- Logs in
- Accesses queue
- Manages queue items

#### `adminE2EFlow(context)`
- Registers admin account
- Logs in
- Creates appointments
- Updates appointments

#### `authEdgeCasesFlow(context)`
- Tests duplicate registration rejection
- Tests invalid login attempts
- Tests unauthorized access blocking

---

## Common Issues & Solutions

### Issue: "Browser not found"
**Solution:** Install Playwright browsers
```bash
npx playwright install
```

### Issue: "Connection refused" on localhost:3000 or :5000
**Solution:** Ensure both servers are running
```bash
# Check processes
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

### Issue: "Element not found" errors
**Solution:** The processor uses flexible selectors to handle different UI implementations. If tests fail on element locators, verify:
1. Frontend form field names match the processor assumptions
2. Button text (e.g., "Register", "Login") is present
3. Navigation links are clickable

### Issue: Form validation errors during registration
**Solution:** Ensure timestamps create unique emails each test run (already handled by processor)

### Issue: Low success rate / High errors
**Solution:** 
1. Check backend server logs for SQL errors
2. Verify SQLite database permissions
3. Check `PRAGMA busy_timeout` setting in `backend/src/config/database.js`
4. Increase request timeout in `combined-artillery.yml` config

---

## Performance Baselines

### Healthy Thresholds (from previous runs)
| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Successful Rate | >95% | 90-95% | <90% |
| p95 Latency | <500ms | 500-1000ms | >1000ms |
| p99 Latency | <1000ms | 1000-2000ms | >2000ms |
| Error Rate | <5% | 5-10% | >10% |

### Known Bottlenecks
- **SQLite write contention** under concurrent loads (100+ req/s)
  - *Mitigation:* `PRAGMA busy_timeout = 3000ms` in database.js
- **Single-writer limitation** at peak load
  - *Solution:* Migrate to PostgreSQL/MySQL for production

---

## Next Steps

### For Development
1. Run local tests before committing code changes
2. Monitor error patterns and response times
3. Adjust load phases based on expected production traffic

### For Staging/Production
1. Record tests to Artillery Cloud for historical comparison
2. Set up alert thresholds (e.g., p99 > 2s)
3. Run daily performance regression tests
4. Archive reports for trend analysis

### Infrastructure Improvements
- [ ] Replace SQLite with PostgreSQL
- [ ] Add connection pooling (node-postgres/pg-pool)
- [ ] Implement caching (Redis)
- [ ] Deploy behind load balancer
- [ ] Monitor with APM (DataDog, New Relic)

---

## File Structure

```
Queue/
├── combined-artillery.yml       ← Main test configuration
├── combined-flow.js             ← Playwright processor with all 5 scenarios
├── combined-report.json         ← Generated test results
├── combined-report.html         ← Generated HTML report
├── backend/
│   └── src/
│       ├── server.js            ← Socket timeout config
│       ├── config/database.js   ← SQLite with busy_timeout
│       └── routes/auth.js       ← Error logging
└── frontend/
    └── src/
        ├── App.jsx
        └── pages/
```

---

## Commands Reference

```bash
# Run test locally
npx artillery run combined-artillery.yml --output report.json

# Run test with cloud recording
npx artillery run combined-artillery.yml --record --key $env:ARTILLERY_API_KEY

# Generate HTML report
npx artillery report report.json

# Check test syntax
npx artillery quick combined-artillery.yml

# Run with verbose logging
npx artillery run combined-artillery.yml --verbose

# Run with custom output file
npx artillery run combined-artillery.yml -o my-test-results.json
```

---

## Support

For issues with:
- **Artillery:** [artillery.io](https://artillery.io)
- **Playwright:** [playwright.dev](https://playwright.dev)
- **QueueCare Backend:** Check `backend/src/` logs
- **QueueCare Frontend:** Check browser console (F12)

---

**Last Updated:** May 5, 2026  
**Test Engine:** Artillery 2.x + Playwright  
**Status:** ✅ Production Ready
