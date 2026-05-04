# QueueCare — Comprehensive Testing Plan

**Project:** QueueCare Clinic Appointment System  
**Date Created:** May 4, 2026  
**Testing Scope:** Unit Testing, API Testing, System Testing

---

## **A. UNIT TESTING**

Unit tests focus on individual functions and components in isolation.

### **Unit Test Case #1: Password Validation & Hashing**

| Field | Value |
|---|---|
| **Test ID** | UT-001 |
| **Module** | `backend/src/routes/auth.js` - Password hashing logic |
| **Test Name** | Verify bcryptjs hashing and comparison |
| **Preconditions** | bcryptjs library loaded; test database initialized |
| **Test Steps** | 1. Hash password "securePass123" with bcrypt (10 salt rounds)<br>2. Hash the same password again<br>3. Compare both hashes<br>4. Compare hashed password with plaintext "securePass123"<br>5. Compare hashed password with wrong plaintext "wrongPass" |
| **Expected Results** | 1. First hash generated (e.g., `$2a$10$...`)<br>2. Second hash different from first (different salt)<br>3. Both hashes match the plaintext via bcrypt.compare()<br>4. Comparison returns true<br>5. Comparison returns false |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **Unit Test Case #2: Email Validation Format**

| Field | Value |
|---|---|
| **Test ID** | UT-002 |
| **Module** | `backend/src/routes/auth.js` - Email validation |
| **Test Name** | Validate email format with @ symbol |
| **Preconditions** | Email validation function accessible |
| **Test Steps** | 1. Test valid email: `user@example.com`<br>2. Test valid email: `john.doe@clinic.org`<br>3. Test invalid email (no @): `userexample.com`<br>4. Test invalid email (@ at start): `@example.com`<br>5. Test invalid email (multiple @): `user@mail@example.com` |
| **Expected Results** | 1. Valid (contains @)<br>2. Valid (contains @)<br>3. Invalid (error: "Invalid email format")<br>4. Invalid (error: "Invalid email format")<br>5. Invalid (error: "Invalid email format") |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **Unit Test Case #3: Date Format Validation (YYYY-MM-DD)**

| Field | Value |
|---|---|
| **Test ID** | UT-003 |
| **Module** | `backend/src/routes/appointments.js` - Date validation |
| **Test Name** | Validate ISO date format and reject invalid formats |
| **Preconditions** | Date regex `^\d{4}-\d{2}-\d{2}$` and isValidDateStr() function available |
| **Test Steps** | 1. Test valid date: `2026-05-04` (today)<br>2. Test valid date: `2026-12-25` (future)<br>3. Test invalid format: `25/12/2026` (DD/MM/YYYY)<br>4. Test invalid format: `2026-5-4` (missing leading zeros)<br>5. Test invalid date: `2026-02-30` (Feb has 29 days) |
| **Expected Results** | 1. Valid (passes regex & date check)<br>2. Valid (passes regex & date check)<br>3. Invalid (error: "Invalid date format. Use YYYY-MM-DD")<br>4. Invalid (fails regex)<br>5. Invalid (fails date validity check) |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **Unit Test Case #4: Queue Number Generation (MAX + 1 Logic)**

| Field | Value |
|---|---|
| **Test ID** | UT-004 |
| **Module** | `backend/src/routes/appointments.js` - getNextQueueNumber() |
| **Test Name** | Verify queue numbers increment using MAX + 1 |
| **Preconditions** | In-memory test database with 3 appointments on `2026-05-10` with queue_numbers [1, 2, 3] |
| **Test Steps** | 1. Get next queue number for date `2026-05-10`<br>2. Cancel appointment with queue_number 2<br>3. Get next queue number for date `2026-05-10` again<br>4. Create new appointment (should get queue_number 4) |
| **Expected Results** | 1. Returns 4 (MAX 3 + 1)<br>2. Appointment marked as 'cancelled' (count = 2, but MAX still 3)<br>3. Returns 4 (MAX still 3, ignores cancelled)<br>4. New appointment assigned queue_number 4 (gaps from cancellations filled on rebooking) |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **Unit Test Case #5: Role-Based Permission Check**

| Field | Value |
|---|---|
| **Test ID** | UT-005 |
| **Module** | `backend/src/middleware/auth.js` - requireRole() |
| **Test Name** | Verify role-based access control middleware |
| **Preconditions** | requireRole('staff', 'admin') middleware function available; user object with role property |
| **Test Steps** | 1. Call middleware with user role = 'patient'<br>2. Call middleware with user role = 'staff'<br>3. Call middleware with user role = 'admin'<br>4. Call middleware with user role = 'invalid' |
| **Expected Results** | 1. Returns 403 "Insufficient permissions"<br>2. Calls next() (allows access)<br>3. Calls next() (allows access)<br>4. Returns 403 "Insufficient permissions" |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **Unit Test Case #6: JWT Token Generation & Expiry**

| Field | Value |
|---|---|
| **Test ID** | UT-006 |
| **Module** | `backend/src/routes/auth.js` - generateToken() |
| **Test Name** | Verify JWT token generation with 24h expiry |
| **Preconditions** | User object: `{id: 1, email: 'test@example.com', role: 'patient', name: 'Test User'}`; JWT_SECRET set |
| **Test Steps** | 1. Generate token using generateToken(user)<br>2. Decode token (without verification)<br>3. Check payload contains user data<br>4. Check exp claim exists and equals ~24 hours from now<br>5. Verify token with JWT_SECRET<br>6. Wait and verify token expires after 24h |
| **Expected Results** | 1. Token generated (JWT format: `header.payload.signature`)<br>2. Payload decoded successfully<br>3. Contains {id, email, role, name}<br>4. exp ≈ current time + 86400 seconds<br>5. Verification passes<br>6. Verification fails with "token expired" after 24h |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

## **B. API TESTING**

API tests focus on endpoint behavior, request/response validation, and status codes.

### **API Test Case #1: User Registration - Successful**

| Field | Value |
|---|---|
| **Test ID** | AT-001 |
| **Endpoint** | `POST /api/auth/register` |
| **Test Name** | Register new user with valid credentials |
| **Preconditions** | API server running; email `newuser@test.com` not in database |
| **Request** | ```json<br>{<br>  "name": "John Doe",<br>  "email": "newuser@test.com",<br>  "password": "securePass123",<br>  "role": "patient"<br>}<br>``` |
| **Expected Response** | **Status:** 201 Created<br>**Body:**<br>```json<br>{<br>  "message": "Registration successful",<br>  "user": {<br>    "id": 1,<br>    "name": "John Doe",<br>    "email": "newuser@test.com",<br>    "role": "patient"<br>  },<br>  "token": "eyJhbGc..." (JWT)<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #2: User Registration - Duplicate Email**

| Field | Value |
|---|---|
| **Test ID** | AT-002 |
| **Endpoint** | `POST /api/auth/register` |
| **Test Name** | Reject registration with existing email |
| **Preconditions** | User `existing@test.com` already registered in database |
| **Request** | ```json<br>{<br>  "name": "Jane Doe",<br>  "email": "existing@test.com",<br>  "password": "password123",<br>  "role": "patient"<br>}<br>``` |
| **Expected Response** | **Status:** 400 Bad Request<br>**Body:**<br>```json<br>{<br>  "error": "Email already registered"<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #3: User Login - Valid Credentials**

| Field | Value |
|---|---|
| **Test ID** | AT-003 |
| **Endpoint** | `POST /api/auth/login` |
| **Test Name** | Login with correct email and password |
| **Preconditions** | User exists: email = `user@test.com`, password = `password123` (bcrypt hashed in DB) |
| **Request** | ```json<br>{<br>  "email": "user@test.com",<br>  "password": "password123"<br>}<br>``` |
| **Expected Response** | **Status:** 200 OK<br>**Body:**<br>```json<br>{<br>  "token": "eyJhbGc..." (valid JWT),<br>  "user": {<br>    "id": 1,<br>    "name": "Test User",<br>    "email": "user@test.com",<br>    "role": "patient"<br>  }<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #4: User Login - Invalid Password**

| Field | Value |
|---|---|
| **Test ID** | AT-004 |
| **Endpoint** | `POST /api/auth/login` |
| **Test Name** | Reject login with wrong password |
| **Preconditions** | User exists: email = `user@test.com`, correct password = `password123` |
| **Request** | ```json<br>{<br>  "email": "user@test.com",<br>  "password": "wrongPassword"<br>}<br>``` |
| **Expected Response** | **Status:** 401 Unauthorized<br>**Body:**<br>```json<br>{<br>  "error": "Invalid credentials"<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #5: Create Appointment - Successful**

| Field | Value |
|---|---|
| **Test ID** | AT-005 |
| **Endpoint** | `POST /api/appointments` |
| **Test Name** | Create new appointment with valid data |
| **Preconditions** | User logged in; token = valid JWT; date = `2026-05-15` (future) |
| **Request** | **Headers:** `Authorization: Bearer <valid_token>`<br>**Body:**<br>```json<br>{<br>  "doctor": "Dr. Smith",<br>  "date": "2026-05-15",<br>  "reason": "General checkup"<br>}<br>``` |
| **Expected Response** | **Status:** 201 Created<br>**Body:**<br>```json<br>{<br>  "message": "Appointment created",<br>  "appointment": {<br>    "id": 5,<br>    "patient_id": 1,<br>    "doctor": "Dr. Smith",<br>    "date": "2026-05-15",<br>    "reason": "General checkup",<br>    "status": "pending",<br>    "queue_number": 1,<br>    "created_at": "2026-05-04T10:30:00Z",<br>    "updated_at": "2026-05-04T10:30:00Z"<br>  }<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #6: Create Appointment - Duplicate Date**

| Field | Value |
|---|---|
| **Test ID** | AT-006 |
| **Endpoint** | `POST /api/appointments` |
| **Test Name** | Reject duplicate appointment on same date |
| **Preconditions** | User has appointment on `2026-05-15`; token = valid JWT |
| **Request** | **Headers:** `Authorization: Bearer <valid_token>`<br>**Body:**<br>```json<br>{<br>  "doctor": "Dr. Jones",<br>  "date": "2026-05-15",<br>  "reason": "Follow-up"<br>}<br>``` |
| **Expected Response** | **Status:** 409 Conflict<br>**Body:**<br>```json<br>{<br>  "error": "You already have an appointment on this date"<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #7: Get Appointments - Patient Role Filtering**

| Field | Value |
|---|---|
| **Test ID** | AT-007 |
| **Endpoint** | `GET /api/appointments` |
| **Test Name** | Patient sees only their own appointments |
| **Preconditions** | Patient user logged in; patient has 2 appointments; other patients have 5 appointments total<br>Token = valid JWT (role = 'patient') |
| **Request** | **Headers:** `Authorization: Bearer <patient_token>` |
| **Expected Response** | **Status:** 200 OK<br>**Body:**<br>```json<br>{<br>  "appointments": [<br>    {<br>      "id": 1,<br>      "patient_id": 1,<br>      "doctor": "Dr. Smith",<br>      "date": "2026-05-10",<br>      "reason": "Checkup",<br>      "status": "pending",<br>      "queue_number": 1<br>    },<br>    {<br>      "id": 2,<br>      "patient_id": 1,<br>      "doctor": "Dr. Jones",<br>      "date": "2026-05-15",<br>      "reason": "Follow-up",<br>      "status": "pending",<br>      "queue_number": 2<br>    }<br>  ]<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #8: Get Appointments - Staff Role Sees All**

| Field | Value |
|---|---|
| **Test ID** | AT-008 |
| **Endpoint** | `GET /api/appointments` |
| **Test Name** | Staff sees all appointments with patient details |
| **Preconditions** | Staff user logged in; 5 total appointments in database<br>Token = valid JWT (role = 'staff') |
| **Request** | **Headers:** `Authorization: Bearer <staff_token>` |
| **Expected Response** | **Status:** 200 OK<br>**Body:** Returns all 5 appointments with `patient_name` and `patient_email` fields included<br>```json<br>{<br>  "appointments": [<br>    {<br>      "id": 1,<br>      "patient_id": 1,<br>      "patient_name": "John Doe",<br>      "patient_email": "john@test.com",<br>      "doctor": "Dr. Smith",<br>      "date": "2026-05-10"<br>    },<br>    ...<br>  ]<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #9: Update Appointment - Reschedule**

| Field | Value |
|---|---|
| **Test ID** | AT-009 |
| **Endpoint** | `PUT /api/appointments/:id` |
| **Test Name** | Update appointment date and reassign queue number |
| **Preconditions** | Patient appointment ID = 1, current date = `2026-05-10`, queue_number = 1<br>No appointment exists on `2026-05-20`; token = valid JWT |
| **Request** | **Headers:** `Authorization: Bearer <patient_token>`<br>**URL:** `/api/appointments/1`<br>**Body:**<br>```json<br>{<br>  "doctor": "Dr. Smith",<br>  "date": "2026-05-20",<br>  "reason": "Updated checkup"<br>}<br>``` |
| **Expected Response** | **Status:** 200 OK<br>**Body:**<br>```json<br>{<br>  "message": "Appointment updated",<br>  "appointment": {<br>    "id": 1,<br>    "patient_id": 1,<br>    "doctor": "Dr. Smith",<br>    "date": "2026-05-20",<br>    "reason": "Updated checkup",<br>    "queue_number": 1 (or appropriate for new date),<br>    "updated_at": "2026-05-04T11:00:00Z"<br>  }<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #10: Cancel Appointment**

| Field | Value |
|---|---|
| **Test ID** | AT-010 |
| **Endpoint** | `DELETE /api/appointments/:id` |
| **Test Name** | Cancel appointment (set status to 'cancelled') |
| **Preconditions** | Patient appointment ID = 1, status = 'pending'; token = valid JWT |
| **Request** | **Headers:** `Authorization: Bearer <patient_token>`<br>**URL:** `/api/appointments/1` |
| **Expected Response** | **Status:** 200 OK<br>**Body:**<br>```json<br>{<br>  "message": "Appointment cancelled",<br>  "appointment": {<br>    "id": 1,<br>    "patient_id": 1,<br>    "status": "cancelled",<br>    "updated_at": "2026-05-04T11:15:00Z"<br>  }<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #11: View Today's Queue**

| Field | Value |
|---|---|
| **Test ID** | AT-011 |
| **Endpoint** | `GET /api/queue/today` |
| **Test Name** | Retrieve today's queue ordered by queue_number |
| **Preconditions** | 3 appointments on today (`2026-05-04`) with queue_numbers [1, 2, 3] and status 'pending'<br>1 appointment today with status 'cancelled' (should be excluded)<br>Token = valid JWT |
| **Request** | **Headers:** `Authorization: Bearer <any_valid_token>` |
| **Expected Response** | **Status:** 200 OK<br>**Body:**<br>```json<br>{<br>  "queue": [<br>    {<br>      "id": 1,<br>      "queue_number": 1,<br>      "patient_name": "John Doe",<br>      "patient_email": "john@test.com",<br>      "doctor": "Dr. Smith",<br>      "status": "pending"<br>    },<br>    {<br>      "id": 2,<br>      "queue_number": 2,<br>      "patient_name": "Jane Doe",<br>      "patient_email": "jane@test.com",<br>      "doctor": "Dr. Jones",<br>      "status": "pending"<br>    },<br>    {<br>      "id": 3,<br>      "queue_number": 3,<br>      "patient_name": "Bob Smith",<br>      "patient_email": "bob@test.com",br>      "doctor": "Dr. Brown",<br>      "status": "pending"<br>    }<br>  ],<br>  "date": "2026-05-04"<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #12: Mark Patient as Served (Staff)**

| Field | Value |
|---|---|
| **Test ID** | AT-012 |
| **Endpoint** | `PATCH /api/queue/:id/serve` |
| **Test Name** | Staff marks patient as served |
| **Preconditions** | Staff user logged in; appointment ID = 1, status = 'pending'<br>Token = valid JWT (role = 'staff') |
| **Request** | **Headers:** `Authorization: Bearer <staff_token>`<br>**URL:** `/api/queue/1/serve` |
| **Expected Response** | **Status:** 200 OK<br>**Body:**<br>```json<br>{<br>  "message": "Patient marked as served",<br>  "appointment": {<br>    "id": 1,<br>    "queue_number": 1,<br>    "patient_name": "John Doe",<br>    "status": "served",<br>    "updated_at": "2026-05-04T11:30:00Z"<br>  }<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #13: Mark as Served - Patient Denied (Authorization)**

| Field | Value |
|---|---|
| **Test ID** | AT-013 |
| **Endpoint** | `PATCH /api/queue/:id/serve` |
| **Test Name** | Patient cannot mark appointments as served |
| **Preconditions** | Patient user logged in; appointment ID = 1, status = 'pending'<br>Token = valid JWT (role = 'patient') |
| **Request** | **Headers:** `Authorization: Bearer <patient_token>`<br>**URL:** `/api/queue/1/serve` |
| **Expected Response** | **Status:** 403 Forbidden<br>**Body:**<br>```json<br>{<br>  "error": "Insufficient permissions"<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #14: Unauthorized Request - Missing Token**

| Field | Value |
|---|---|
| **Test ID** | AT-014 |
| **Endpoint** | `GET /api/appointments` |
| **Test Name** | Request without JWT token rejected |
| **Preconditions** | API server running |
| **Request** | **Headers:** None (no Authorization header)<br>**URL:** `/api/appointments` |
| **Expected Response** | **Status:** 401 Unauthorized<br>**Body:**<br>```json<br>{<br>  "error": "No token provided"<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **API Test Case #15: Invalid Token**

| Field | Value |
|---|---|
| **Test ID** | AT-015 |
| **Endpoint** | `GET /api/appointments` |
| **Test Name** | Request with invalid/malformed JWT rejected |
| **Preconditions** | API server running |
| **Request** | **Headers:** `Authorization: Bearer invalid.malformed.token`<br>**URL:** `/api/appointments` |
| **Expected Response** | **Status:** 401 Unauthorized<br>**Body:**<br>```json<br>{<br>  "error": "Invalid or expired token"<br>}<br>``` |
| **Actual Response** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

## **C. SYSTEM TESTING**

System tests focus on end-to-end workflows, integration, and user scenarios.

### **System Test Case #1: Complete User Workflow - Patient Booking & Cancellation**

| Field | Value |
|---|---|
| **Test ID** | ST-001 |
| **Test Name** | End-to-end patient appointment booking and cancellation |
| **Scope** | Frontend (React) + Backend API + Database (SQLite) |
| **Preconditions** | Application running locally (frontend: localhost:3000, backend: localhost:5000)<br>Fresh test database<br>Browsers: Chrome/Firefox/Safari |
| **Test Steps** | 1. Navigate to `http://localhost:3000`<br>2. Click "Register" link<br>3. Fill form: name="John Patient", email="john.patient@test.com", password="password123", role="patient"<br>4. Click "Register" button → redirects to Dashboard<br>5. Dashboard displays: "Welcome, John Patient"<br>6. Click "Book Appointment" button<br>7. Fill form: doctor="Dr. Smith", date="2026-05-20", reason="General checkup"<br>8. Click "Book" → redirects to Appointments list<br>9. Verify appointment appears in list with queue_number=1, status="pending"<br>10. Click "Cancel" button on appointment<br>11. Confirm cancellation in modal<br>12. Verify status changes to "cancelled"<br>13. Logout and verify redirect to Login page |
| **Expected Results** | ✓ Registration successful, token stored in localStorage<br>✓ Dashboard displays user name correctly<br>✓ Appointment form validates required fields<br>✓ Appointment created with queue_number=1, status="pending"<br>✓ Appointment appears in both Upcoming and History sections (after cancel)<br>✓ Status badge updates to "cancelled"<br>✓ Logout clears localStorage and redirects to login<br>✓ No errors in browser console |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **System Test Case #2: Staff Queue Management Workflow**

| Field | Value |
|---|---|
| **Test ID** | ST-002 |
| **Test Name** | Staff member manages queue and marks patients as served |
| **Scope** | Frontend (React) + Backend API + Database (SQLite) |
| **Preconditions** | Backend & frontend running<br>3 patients registered with appointments on today (`2026-05-04`):<br>- Patient 1: Dr. Smith, queue_number=1<br>- Patient 2: Dr. Jones, queue_number=2<br>- Patient 3: Dr. Brown, queue_number=3 |
| **Test Steps** | 1. Register staff account: email="staff@clinic.com", password="staff123", role="staff"<br>2. Login with staff credentials<br>3. Navigate to "Queue Management" page<br>4. Verify queue displays 3 waiting patients in order (queue_number 1, 2, 3)<br>5. Click "Mark as Served" for Patient 1<br>6. Verify Patient 1 status changes to "served"<br>7. Verify queue shows 2 waiting, 1 served (progress: 33%)<br>8. Click "Mark as Served" for Patient 2<br>9. Verify queue shows 1 waiting, 2 served (progress: 66%)<br>10. Verify queue_numbers remain in order [1, 2, 3] (not renumbered)<br>11. Refresh page and verify state persists<br>12. Verify served patients listed separately at bottom |
| **Expected Results** | ✓ Staff account created successfully<br>✓ Staff login works; redirects to Dashboard<br>✓ Queue Management page visible (patient role doesn't have access)<br>✓ Initial queue: 3 pending appointments<br>✓ After serving Patient 1: status="served", queue_number still 1<br>✓ Stats update: 2 waiting, 1 served, 33% progress<br>✓ After serving Patient 2: status="served", queue_number still 2<br>✓ Queue numbers unchanged (no reordering)<br>✓ State persists after page refresh<br>✓ Served patients section shows updates correctly |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **System Test Case #3: Multi-User Concurrent Appointment Booking**

| Field | Value |
|---|---|
| **Test ID** | ST-003 |
| **Test Name** | Multiple patients book appointments simultaneously without conflicts |
| **Scope** | Frontend (React) + Backend API + Database (SQLite) |
| **Preconditions** | Backend & frontend running<br>Test with 3 browser windows/tabs<br>3 patient accounts pre-registered |
| **Test Steps** | 1. Open 3 browser tabs (Patient A, Patient B, Patient C)<br>2. Login each patient in separate tab<br>3. All 3 patients navigate to "Book Appointment" simultaneously<br>4. Patient A fills: doctor="Dr. Smith", date="2026-05-20", reason="Checkup"<br>5. Patient B fills: doctor="Dr. Smith", date="2026-05-20", reason="Consultation"<br>6. Patient C fills: doctor="Dr. Jones", date="2026-05-20", reason="Exam"<br>7. Patient A submits first (within 1 second)<br>8. Patient B submits (within 2 seconds of A)<br>9. Patient C submits (within 3 seconds of A)<br>10. Verify all 3 appointments created with unique queue_numbers<br>11. Check DB directly for correct queue_numbers assigned |
| **Expected Results** | ✓ All 3 appointments created successfully<br>✓ No 409 Conflict errors<br>✓ Queue_numbers assigned correctly:<br>  - Patient A (Dr. Smith, 2026-05-20): queue_number=1<br>  - Patient B (Dr. Smith, 2026-05-20): queue_number=2<br>  - Patient C (Dr. Jones, 2026-05-20): queue_number=1 (different doctor)<br>✓ Each patient sees their appointment in their list<br>✓ Staff sees all 3 appointments in queue management<br>✓ No data loss or corruption<br>✓ No race condition issues |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **System Test Case #4: Appointment Reschedule & Queue Recalculation**

| Field | Value |
|---|---|
| **Test ID** | ST-004 |
| **Test Name** | Patient reschedules appointment; queue numbers recalculate correctly |
| **Scope** | Frontend (React) + Backend API + Database (SQLite) |
| **Preconditions** | Patient has appointment ID=1 on 2026-05-20, queue_number=1<br>Another patient has appointment ID=2 on 2026-05-20, queue_number=2<br>Backend & frontend running |
| **Test Steps** | 1. Patient logs in and navigates to Appointments<br>2. Appointment 1 displayed with status="pending", date="2026-05-20", queue_number=1<br>3. Click "Edit" button<br>4. Change date from "2026-05-20" to "2026-05-25"<br>5. Keep doctor and reason unchanged<br>6. Click "Update"<br>7. Verify redirect to Appointments list<br>8. Check appointment date updated to 2026-05-25<br>9. Verify queue_number on 2026-05-20: Patient 2 now has queue_number=1<br>10. Verify queue_number on 2026-05-25: Patient 1 has new queue_number (based on other appointments that day)<br>11. Staff views queue for 2026-05-20: only Patient 2 listed<br>12. Staff views queue for 2026-05-25: Patient 1 listed with correct queue_number |
| **Expected Results** | ✓ Edit form loads with current appointment data<br>✓ Date change allowed (future date)<br>✓ Appointment updated on backend<br>✓ Duplicate date check: No error (different date)<br>✓ Queue_number reassigned on 2026-05-25 (MAX of that day + 1)<br>✓ Queue_number on 2026-05-20 recalculated (Patient 2 now queue_number=1)<br>✓ Staff queue view reflects changes correctly<br>✓ All queue_numbers remain unique per date<br>✓ UI updates without full page refresh |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **System Test Case #5: Role-Based Access & Security**

| Field | Value |
|---|---|
| **Test ID** | ST-005 |
| **Test Name** | Verify role-based access control across UI and API |
| **Scope** | Frontend (React) + Backend API |
| **Preconditions** | 3 users created: patient, staff, admin<br>Backend & frontend running |
| **Test Steps** | **Patient Role:**<br>1. Login as patient<br>2. Verify can access: Dashboard, Appointments, Book Appointment, Edit own appointments<br>3. Verify cannot access: Queue Management page<br>4. Attempt direct URL access to `/queue` → redirected to dashboard<br>5. Attempt API call `PATCH /api/queue/1/serve` → 403 Forbidden<br><br>**Staff Role:**<br>6. Login as staff<br>7. Verify can access: Dashboard, Appointments (all), Queue Management<br>8. Verify can mark patients as served<br>9. Verify can view all appointments with patient names<br><br>**Admin Role:**<br>10. Login as admin<br>11. Verify all staff permissions work<br>12. Verify can also mark patients as served<br><br>**Unauthenticated:**<br>13. Clear localStorage (logout)<br>14. Attempt API call without token → 401 Unauthorized<br>15. Attempt to access `/dashboard` → redirected to `/login` |
| **Expected Results** | ✓ Patient sees only own appointments in list<br>✓ Patient cannot access Queue Management link in nav<br>✓ Patient direct URL access to `/queue` → redirects to dashboard<br>✓ Patient API calls to staff-only endpoints → 403 Forbidden<br>✓ Staff can view all appointments with patient details<br>✓ Staff can use Queue Management page<br>✓ Staff can mark patients as served<br>✓ Admin inherits all staff permissions<br>✓ Unauthenticated requests → 401 Unauthorized<br>✓ Protected routes redirect to login automatically<br>✓ No sensitive data leaks between roles |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **System Test Case #6: Error Handling & Recovery**

| Field | Value |
|---|---|
| **Test ID** | ST-006 |
| **Test Name** | System handles errors gracefully and allows recovery |
| **Scope** | Frontend (React) + Backend API |
| **Preconditions** | Backend & frontend running; network connectivity available |
| **Test Steps** | 1. Test missing required fields:<br>   - Login with empty email → field error displays<br>   - Register with empty password → field error displays<br>   - Book appointment with no doctor → field error displays<br>2. Test invalid date formats:<br>   - Enter "25/12/2026" → error: "Invalid date format"<br>   - Enter "2026-5-4" → error: "Invalid date format"<br>3. Test booking in past:<br>   - Try to book for "2000-01-01" → error: "Cannot book in past"<br>4. Test duplicate booking:<br>   - Book appointment on "2026-05-20"<br>   - Try to book again on same date → error: "Already have appointment on this date"<br>5. Test database error (simulate):<br>   - Stop backend server<br>   - Attempt to load appointments → error alert displays<br>   - Refresh backend<br>   - Retry → successfully loads (recovery)<br>6. Test invalid token (simulate):<br>   - Manually modify token in localStorage<br>   - Try to access protected route → redirected to login<br>   - Clear localStorage and verify clean logout |
| **Expected Results** | ✓ All field-level validation errors display correctly<br>✓ Date validation prevents invalid formats<br>✓ Past date rejection prevents user error<br>✓ Duplicate appointment prevents double-booking<br>✓ Network error: user-friendly alert displays<br>✓ Error state allows retry (button/link provided)<br>✓ System recovers after service unavailability<br>✓ Token validation rejects malformed JWT<br>✓ 401 response triggers logout and redirect<br>✓ No sensitive error details in UI (e.g., SQL errors hidden)<br>✓ User can recover from all error states |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **System Test Case #7: Authentication & Session Management**

| Field | Value |
|---|---|
| **Test ID** | ST-007 |
| **Test Name** | JWT token lifecycle and session persistence |
| **Scope** | Frontend (React) + Backend API |
| **Preconditions** | Backend & frontend running; user registered |
| **Test Steps** | 1. Login successfully<br>2. Verify token stored in localStorage<br>3. Refresh page (F5)<br>4. Verify user stays logged in (Dashboard loads without re-login)<br>5. Open DevTools → Application → Local Storage<br>6. Verify `token` and `user` keys exist<br>7. Copy token and check expiry claim (exp field in JWT)<br>8. Simulate token expiration by:<br>   - Modify exp to a past timestamp<br>   - Save modified token to localStorage<br>9. Try to access protected endpoint<br>10. Verify 401 response and auto-redirect to login<br>11. Verify localStorage cleared after logout<br>12. Verify closing browser tab and reopening:<br>    - If localStorage persists (normal): user still logged in<br>    - Logout explicitly and verify clean session |
| **Expected Results** | ✓ Token generated and stored in localStorage after login<br>✓ Token persists across page refreshes<br>✓ User session maintained after refresh<br>✓ Token contains correct payload (id, email, role, name)<br>✓ Token expires after 24 hours (exp claim validation)<br>✓ Expired token triggers 401 response from API<br>✓ 401 response causes auto-logout and redirect to login<br>✓ localStorage cleared after logout<br>✓ New login generates new fresh token<br>✓ Session persists across browser tabs (shared localStorage)<br>✓ Closing all tabs/browser preserves localStorage (unless cleared)<br>✓ Explicit logout clears all session data |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

### **System Test Case #8: Database Data Integrity**

| Field | Value |
|---|---|
| **Test ID** | ST-008 |
| **Test Name** | Database maintains data integrity with constraints |
| **Scope** | Backend API + SQLite Database |
| **Preconditions** | Backend running; fresh test database |
| **Test Steps** | 1. Attempt to insert invalid role via direct DB query<br>   - Run: `INSERT INTO users (name, email, password, role) VALUES ('Test', 'test@test.com', 'hashed', 'invalid_role')`<br>   - Verify insertion fails (CHECK constraint)<br>2. Attempt to insert invalid appointment status<br>   - Run: `INSERT INTO appointments (..., status) VALUES ('unknown_status')`<br>   - Verify insertion fails (CHECK constraint)<br>3. Attempt to create appointment with non-existent patient<br>   - Run: `INSERT INTO appointments (patient_id, ...) VALUES (99999, ...)`<br>   - Verify insertion fails (FOREIGN KEY constraint)<br>4. Test cascade behavior:<br>   - Delete a user and verify appointments aren't orphaned (or handle accordingly)<br>5. Test unique email constraint:<br>   - Create user 1 with email "unique@test.com"<br>   - Attempt to create user 2 with same email<br>   - Verify second creation fails<br>6. Create 5 appointments on same date, verify queue_numbers [1,2,3,4,5]<br>7. Cancel appointment with queue_number 3<br>8. Create new appointment on same date<br>9. Verify new appointment gets queue_number 6 (not 3)<br>10. Verify all status transitions are valid in DB |
| **Expected Results** | ✓ Invalid role rejected by CHECK constraint<br>✓ Invalid status rejected by CHECK constraint<br>✓ Orphan appointments prevented by FOREIGN KEY<br>✓ Unique email constraint enforced<br>✓ Queue_numbers assigned sequentially per date<br>✓ Cancellations don't leave orphaned records<br>✓ Queue_number gaps preserved (MAX + 1 logic works)<br>✓ Data relationships remain consistent<br>✓ No duplicate emails in users table<br>✓ All appointments linked to valid patient_ids<br>✓ Database integrity verified via constraints |
| **Actual Results** | *(To be filled during execution)* |
| **Status** | *(Pass/Fail)* |

---

## **Test Execution Summary**

### **Test Coverage by Type**

| Test Type | Test Cases | Total Coverage |
|---|---|---|
| **Unit Testing** | UT-001 to UT-006 | 6 test cases |
| **API Testing** | AT-001 to AT-015 | 15 test cases |
| **System Testing** | ST-001 to ST-008 | 8 test cases |
| **TOTAL** | **29 test cases** | **Complete end-to-end coverage** |

### **Coverage Areas**

✅ **Authentication & Authorization** (8 tests)  
✅ **Appointment CRUD Operations** (10 tests)  
✅ **Queue Management** (4 tests)  
✅ **Data Validation** (3 tests)  
✅ **Error Handling** (2 tests)  
✅ **Role-Based Access Control** (2 tests)  

---

## **Test Execution Instructions**

### **Running Unit Tests**
```bash
cd backend
npm test
```

### **Running API Tests Manually**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Run tests
cd backend
npm test -- auth.test.js
npm test -- appointments.test.js
npm test -- queue.test.js
```

### **Running System Tests (Playwright)**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Run Playwright tests
npm run test:e2e
```

---

**Document Version:** 1.0  
**Last Updated:** May 4, 2026  
**Author:** QA Testing Team
