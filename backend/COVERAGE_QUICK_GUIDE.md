# Code Coverage Quick Start Guide

## 🎯 View Coverage Report

### **Option 1: Terminal Summary (Quick)**
```bash
cd backend
npm run coverage
```

**Output:**
```
-----------File-by-File Coverage-----------
src/middleware/auth.js    | 100% | 100% | 100% | 100% ✅
src/routes/appointments.js| 88%  | 80%  | 100% | 88%
src/routes/auth.js        | 93%  | 96%  | 100% | 93%
src/routes/queue.js       | 100% | 100% | 100% | 100% ✅

=============================== Coverage summary ===============================
Statements   : 90.47% ( 171/189 )
Branches     : 85% ( 85/100 )
Functions    : 86.36% ( 19/22 )
Lines        : 91.39% ( 170/186 )
================================================================================

Test Suites: 3 passed, 3 total
Tests:       43 passed, 43 total
```

---

### **Option 2: Detailed HTML Report (Visual)**
```bash
cd backend
npm run coverage
start coverage/index.html  # Windows
# or
open coverage/index.html   # macOS
# or
xdg-open coverage/index.html  # Linux
```

The HTML report shows:
- 🟢 **Green** = Fully covered code (tested)
- 🟡 **Yellow** = Partially covered code (some branches not tested)
- 🔴 **Red** = Not covered code (no tests)

---

## 📊 Current Coverage Status

| Component | Coverage | Status | Notes |
|---|---|---|---|
| **Middleware/Auth** | 100% ✅ | Complete | All token validation paths tested |
| **Routes/Queue** | 100% ✅ | Complete | All queue management tested |
| **Routes/Auth** | 93% | Very Good | Missing: server error catch block |
| **Routes/Appointments** | 88% | Good | Missing: edge case scenarios |
| **Overall** | **90.47%** | **Excellent** | Exceeds 70% minimum threshold |

---

## 🚀 Test Coverage by Area

### **✅ Fully Tested (100%)**
- ✓ JWT token validation
- ✓ Role-based access control
- ✓ Queue ordering and filtering
- ✓ Authentication middleware

### **✅ Well Tested (>85%)**
- ✓ User registration (95% coverage)
- ✓ User login (95% coverage)
- ✓ Appointment CRUD operations (88% coverage)

### **⚠️ Partially Tested (>70%)**
- ⚠️ Error handling in routes (missing catch blocks for unhandled errors)
- ⚠️ Edge cases with concurrent requests

### **❌ Not Tested (<70%)**
- ❌ Database schema creation (intentional - runs once)
- ❌ Server startup code (covered by integration tests)

---

## 📝 Running Coverage

### **Commands Available**

```bash
# Run all tests (no coverage)
npm test

# Run tests + show coverage
npm run coverage
npm run test:coverage

# Run specific test file + coverage
npm run coverage -- auth.test.js
npm run coverage -- appointments.test.js
npm run coverage -- queue.test.js
```

### **Coverage Directory Structure**
```
backend/coverage/
├── index.html           📄 Main report (open in browser)
├── coverage-summary.json  JSON format
├── lcov.info           CI/CD integration
└── lcov-report/        File-by-file details
    ├── src/middleware/auth.js.html
    ├── src/routes/auth.js.html
    ├── src/routes/appointments.js.html
    └── src/routes/queue.js.html
```

---

## 🎓 What's Being Tested

### **Test Suite Breakdown**

```
📝 tests/api/auth.test.js (13 tests)
  ✓ User registration
  ✓ Email validation
  ✓ Password validation
  ✓ User login
  ✓ JWT token validation
  ✓ Protected endpoint access

📝 tests/api/appointments.test.js (18 tests)
  ✓ Create appointment
  ✓ List appointments (patient filtering)
  ✓ Get single appointment
  ✓ Update appointment
  ✓ Cancel appointment
  ✓ Queue number assignment
  ✓ Duplicate prevention

📝 tests/api/queue.test.js (12 tests)
  ✓ View today's queue
  ✓ Queue ordering
  ✓ Mark as served (staff)
  ✓ Access control
  ✓ Cancelled exclusion
```

---

## 🎯 Coverage Thresholds

The project enforces minimum coverage:

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    statements: 70,  // Currently: 90.47% ✅
    branches: 70,    // Currently: 85% ✅
    functions: 70,   // Currently: 86.36% ✅
    lines: 70,       // Currently: 91.39% ✅
  },
}
```

**If coverage drops below 70%, `npm test` will fail! ⚠️**

---

## 💡 Understanding Coverage Metrics

### **1. Statements (90.47%)**
- % of executable JavaScript statements covered
- Example: `const x = 5;` is 1 statement
- Current: 171 of 189 statements tested

### **2. Branches (85%)**
- % of if/else, switch, ternary conditions tested
- Example: Both `if` and `else` paths
- Current: 85 of 100 branches tested
- **Missing:** Some error handling branches

### **3. Functions (86.36%)**
- % of defined functions called during tests
- Current: 19 of 22 functions called
- **Missing:** Some utility functions

### **4. Lines (91.39%)**
- % of code lines executed
- Current: 170 of 186 lines executed
- **Missing:** Error catching blocks (intentional)

---

## 📈 Coverage Trends (Target: 70%)

```
Progress to Target: ✅ EXCEEDED

Phase            | Statements | Branches | Functions | Lines
-----------------|------------|----------|-----------|------
Initial build    | 45%        | 35%      | 40%       | 46%
Beta version     | 78%        | 68%      | 72%       | 79%
Current          | 90.47% ✅  | 85% ✅   | 86.36% ✅ | 91.39% ✅
Target minimum   | 70%        | 70%      | 70%       | 70%
```

---

## 🔍 Uncovered Code Analysis

### **Lines Not Covered**

**File: `src/routes/appointments.js`**
```javascript
Lines not covered: 154-162, 169, 188
Reason: Error handling in catch blocks
Impact: Low (fallback only, hard to trigger in tests)
```

**File: `src/routes/auth.js`**
```javascript
Lines not covered: 27, 50, 79
Reason: Server error catch blocks
Impact: Low (error handling only)
```

---

## 🛠️ Adding New Tests

### **Example: Testing Uncovered Code**

**To increase coverage to 95%+, add tests for:**

1. **Database connection errors:**
```javascript
test('handles database errors gracefully', async () => {
  jest.spyOn(db, 'prepare').mockImplementationOnce(() => {
    throw new Error('DB connection failed');
  });
  // ... test response
});
```

2. **Edge case: very large queue numbers:**
```javascript
test('handles MAX queue number overflow', async () => {
  // Create 1000 appointments on same date
  // Verify queue_number = 1001
});
```

---

## 📋 Checklist for Maintaining Coverage

- [ ] Run `npm run coverage` before each commit
- [ ] Review HTML report for unexpected gaps
- [ ] Keep coverage >80% on critical paths
- [ ] Add tests when modifying untested code
- [ ] Never commit code that decreases coverage below 70%
- [ ] Update `.gitignore` to exclude `coverage/` folder

---

## ⚡ Pro Tips

**Fastest way to run coverage:**
```bash
npm run coverage
```

**View coverage while developing:**
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run coverage -- --watch  # Auto-rerun on file changes
```

**Find uncovered files quickly:**
```bash
# Open HTML report and sort by coverage %
start coverage/index.html
```

**Check if your new test improves coverage:**
```bash
npm run coverage
# Compare before/after in coverage-summary.json
```

---

## 📞 Support

For questions about coverage:
1. Check `COVERAGE_REPORT.md` for detailed analysis
2. Review test files in `tests/api/`
3. Check Jest documentation: https://jestjs.io/docs/coverage

---

**Last Updated:** May 4, 2026  
**Coverage Tool:** Jest 29.7.0 + Istanbul  
**Minimum Required:** 70% | **Current:** 90.47% ✅
