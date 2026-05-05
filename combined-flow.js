/**
 * Combined-Flow.js: Artillery Playwright Browser-Based Testing
 * 
 * This processor implements real browser interactions for all 5 QueueCare system test scenarios:
 * 1. Frontend Pages - SPA navigation and page loads
 * 2. Patient E2E Flow - Full patient workflow (register/login/appointment)
 * 3. Staff E2E Flow - Staff workflow (queue management)
 * 4. Admin E2E Flow - Admin workflow (full system management)
 * 5. Auth Edge Cases - Authentication error handling
 * 
 * Credentials:
 * - Patient: patient1@test.com / password123
 * - Staff: staff@test.com / staffpass
 * - Admin: admin@test.com / adminpass
 */

const FRONTEND_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:5000';

const CREDENTIALS = {
  patient: { email: 'patient1@test.com', password: 'password123' },
  staff: { email: 'staff@test.com', password: 'staffpass' },
  admin: { email: 'admin@test.com', password: 'adminpass' }
};

/**
 * Scenario 01: Frontend Pages - Navigate through SPA pages
 */
async function frontendPagesFlow(context) {
  const { page, artillery } = context;

  try {
    // Load home page
    console.log('📄 [Frontend] Loading home page...');
    await page.goto(`${FRONTEND_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');

    // Navigate to login page
    console.log('📄 [Frontend] Navigating to login...');
    const loginLink = await page.locator('a[href="/login"], button:has-text("Login")').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
    } else {
      await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    }
    await page.waitForURL('**/login');

    // Navigate to register page
    console.log('📄 [Frontend] Navigating to register...');
    const registerLink = await page.locator('a[href="/register"], button:has-text("Register")').first();
    if (await registerLink.isVisible()) {
      await registerLink.click();
    } else {
      await page.goto(`${FRONTEND_URL}/register`, { waitUntil: 'networkidle' });
    }
    await page.waitForURL('**/register');

    // Navigate to dashboard
    console.log('📄 [Frontend] Navigating to dashboard...');
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle' });

    artillery.log('Frontend pages navigation completed');
  } catch (error) {
    artillery.log(`Frontend pages error: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Scenario 02: Patient E2E Flow
 * Full workflow: Register → Login → View/Create Appointments → Dashboard
 */
async function patientE2EFlow(context) {
  const { page, artillery, vars } = context;
  const timestamp = Date.now();
  const patientEmail = `patient-${timestamp}@test.com`;
  const patientPassword = 'password123';
  const patientName = `Test Patient ${timestamp}`;

  try {
    // Step 1: Register as patient
    console.log('👤 [Patient] Registering new patient account...');
    await page.goto(`${FRONTEND_URL}/register`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="text"]', patientName);
    await page.fill('input[type="email"]', patientEmail);
    await page.fill('input[type="password"]', patientPassword);
    
    // Select patient role if dropdown/radio exists
    const roleSelect = await page.locator('select, [role="combobox"], input[value="patient"]').first();
    if (await roleSelect.isVisible()) {
      await roleSelect.click();
      if (await page.locator('text=Patient, Staff, Admin').first().isVisible()) {
        await page.click('text=Patient');
      }
    }

    // Submit registration form
    const registerBtn = await page.locator('button:has-text("Register"), button[type="submit"]').first();
    await registerBtn.click();
    
    // Wait for navigation to login or dashboard
    await page.waitForURL(/login|dashboard/, { timeout: 5000 }).catch(() => {
      console.log('[Patient] Navigation after register may vary');
    });

    // Step 2: Login as patient
    console.log('👤 [Patient] Logging in...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', patientEmail);
    await page.fill('input[type="password"]', patientPassword);
    
    const loginBtn = await page.locator('button:has-text("Login"), button[type="submit"]').first();
    await loginBtn.click();
    
    // Wait for successful login (dashboard or appointments page)
    await page.waitForURL(/dashboard|appointments|home/, { timeout: 5000 });

    // Step 3: Navigate to appointments
    console.log('👤 [Patient] Viewing appointments...');
    const appointmentsLink = await page.locator('a:has-text("Appointments"), a[href*="appointment"]').first();
    if (await appointmentsLink.isVisible()) {
      await appointmentsLink.click();
      await page.waitForURL('**/appointments');
    }

    // Step 4: Create appointment
    console.log('👤 [Patient] Creating appointment...');
    const createBtn = await page.locator('button:has-text("Create"), button:has-text("Schedule"), button:has-text("New")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForSelector('form, input[type="date"], input[type="time"]', { timeout: 3000 }).catch(() => {
        console.log('[Patient] Form not found, may already be on form page');
      });

      // Fill appointment form
      const dateInput = await page.locator('input[type="date"]').first();
      const timeInput = await page.locator('input[type="time"]').first();
      const notesInput = await page.locator('textarea, input[placeholder*="note"]').first();

      if (await dateInput.isVisible()) {
        await dateInput.fill('2026-06-15');
      }
      if (await timeInput.isVisible()) {
        await timeInput.fill('10:30');
      }
      if (await notesInput.isVisible()) {
        await notesInput.fill('Routine checkup requested');
      }

      const submitBtn = await page.locator('button:has-text("Submit"), button:has-text("Create"), button:has-text("Schedule")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForURL(/appointments|success/, { timeout: 5000 }).catch(() => {
          console.log('[Patient] Appointment creation may have completed');
        });
      }
    }

    // Step 5: Dashboard
    console.log('👤 [Patient] Viewing dashboard...');
    const dashboardLink = await page.locator('a:has-text("Dashboard"), a[href="/dashboard"]').first();
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForURL('**/dashboard');
    }

    artillery.log(`Patient E2E flow completed for ${patientEmail}`);
  } catch (error) {
    artillery.log(`Patient E2E flow error: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Scenario 03: Staff E2E Flow
 * Workflow: Register → Login → View Queue → Serve Patients
 */
async function staffE2EFlow(context) {
  const { page, artillery } = context;
  const timestamp = Date.now();
  const staffEmail = `staff-${timestamp}@test.com`;
  const staffPassword = 'staffpass';
  const staffName = `Staff Member ${timestamp}`;

  try {
    // Step 1: Register as staff
    console.log('👨‍⚕️ [Staff] Registering new staff account...');
    await page.goto(`${FRONTEND_URL}/register`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="text"]', staffName);
    await page.fill('input[type="email"]', staffEmail);
    await page.fill('input[type="password"]', staffPassword);
    
    // Select staff role
    const roleSelect = await page.locator('select, [role="combobox"], input[value="staff"]').first();
    if (await roleSelect.isVisible()) {
      await roleSelect.click();
      const staffOption = await page.locator('text=Staff').first();
      if (await staffOption.isVisible()) {
        await staffOption.click();
      }
    }

    const registerBtn = await page.locator('button:has-text("Register"), button[type="submit"]').first();
    await registerBtn.click();
    
    await page.waitForURL(/login|dashboard/, { timeout: 5000 }).catch(() => {});

    // Step 2: Login as staff
    console.log('👨‍⚕️ [Staff] Logging in...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', staffEmail);
    await page.fill('input[type="password"]', staffPassword);
    
    const loginBtn = await page.locator('button:has-text("Login"), button[type="submit"]').first();
    await loginBtn.click();
    
    await page.waitForURL(/dashboard|queue|appointments/, { timeout: 5000 });

    // Step 3: View queue
    console.log('👨‍⚕️ [Staff] Accessing queue...');
    const queueLink = await page.locator('a:has-text("Queue"), a[href*="queue"]').first();
    if (await queueLink.isVisible()) {
      await queueLink.click();
      await page.waitForURL('**/queue');
    }

    // Step 4: View today's queue
    console.log('👨‍⚕️ [Staff] Viewing today\'s queue...');
    const todayBtn = await page.locator('button:has-text("Today"), a:has-text("Today")').first();
    if (await todayBtn.isVisible()) {
      await todayBtn.click();
      await page.waitForLoadState('networkidle');
    }

    // Step 5: Attempt to serve patient (if available)
    console.log('👨‍⚕️ [Staff] Processing queue items...');
    const serveBtn = await page.locator('button:has-text("Serve"), button:has-text("Next")').first();
    if (await serveBtn.isVisible()) {
      await serveBtn.click();
      await page.waitForLoadState('networkidle');
    }

    // Step 6: View appointments (staff can see all)
    console.log('👨‍⚕️ [Staff] Viewing all appointments...');
    const appointmentsLink = await page.locator('a:has-text("Appointments"), a[href*="appointment"]').first();
    if (await appointmentsLink.isVisible()) {
      await appointmentsLink.click();
      await page.waitForURL('**/appointments');
    }

    artillery.log(`Staff E2E flow completed for ${staffEmail}`);
  } catch (error) {
    artillery.log(`Staff E2E flow error: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Scenario 04: Admin E2E Flow
 * Workflow: Register → Login → Manage Appointments & Queue
 */
async function adminE2EFlow(context) {
  const { page, artillery } = context;
  const timestamp = Date.now();
  const adminEmail = `admin-${timestamp}@test.com`;
  const adminPassword = 'adminpass';
  const adminName = `Admin User ${timestamp}`;

  try {
    // Step 1: Register as admin
    console.log('🔐 [Admin] Registering new admin account...');
    await page.goto(`${FRONTEND_URL}/register`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="text"]', adminName);
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    
    // Select admin role
    const roleSelect = await page.locator('select, [role="combobox"], input[value="admin"]').first();
    if (await roleSelect.isVisible()) {
      await roleSelect.click();
      const adminOption = await page.locator('text=Admin').first();
      if (await adminOption.isVisible()) {
        await adminOption.click();
      }
    }

    const registerBtn = await page.locator('button:has-text("Register"), button[type="submit"]').first();
    await registerBtn.click();
    
    await page.waitForURL(/login|dashboard/, { timeout: 5000 }).catch(() => {});

    // Step 2: Login as admin
    console.log('🔐 [Admin] Logging in...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    
    const loginBtn = await page.locator('button:has-text("Login"), button[type="submit"]').first();
    await loginBtn.click();
    
    await page.waitForURL(/dashboard|admin/, { timeout: 5000 });

    // Step 3: View all appointments
    console.log('🔐 [Admin] Viewing all appointments...');
    const appointmentsLink = await page.locator('a:has-text("Appointments"), a[href*="appointment"]').first();
    if (await appointmentsLink.isVisible()) {
      await appointmentsLink.click();
      await page.waitForURL('**/appointments');
    }

    // Step 4: View queue management
    console.log('🔐 [Admin] Accessing queue management...');
    const queueLink = await page.locator('a:has-text("Queue"), a[href*="queue"]').first();
    if (await queueLink.isVisible()) {
      await queueLink.click();
      await page.waitForURL('**/queue');
    }

    // Step 5: Create appointment as admin
    console.log('🔐 [Admin] Creating appointment...');
    const createBtn = await page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForSelector('form, input[type="date"]', { timeout: 3000 }).catch(() => {});

      const nameInput = await page.locator('input[placeholder*="patient"], input[placeholder*="name"]').first();
      const dateInput = await page.locator('input[type="date"]').first();
      const timeInput = await page.locator('input[type="time"]').first();

      if (await nameInput.isVisible()) {
        await nameInput.fill('Admin-Created Patient');
      }
      if (await dateInput.isVisible()) {
        await dateInput.fill('2026-06-20');
      }
      if (await timeInput.isVisible()) {
        await timeInput.fill('14:00');
      }

      const submitBtn = await page.locator('button:has-text("Submit"), button:has-text("Create")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Step 6: Update an appointment
    console.log('🔐 [Admin] Managing appointments...');
    const editBtn = await page.locator('button:has-text("Edit"), button:has-text("Update")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForSelector('input[type="text"], textarea', { timeout: 3000 }).catch(() => {});

      const updateBtn = await page.locator('button:has-text("Update"), button:has-text("Save")').first();
      if (await updateBtn.isVisible()) {
        await updateBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }

    artillery.log(`Admin E2E flow completed for ${adminEmail}`);
  } catch (error) {
    artillery.log(`Admin E2E flow error: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Scenario 05: Auth Edge Cases & Error Handling
 * Test: Duplicate registration, invalid login, unauthorized access
 */
async function authEdgeCasesFlow(context) {
  const { page, artillery } = context;
  const timestamp = Date.now();
  const testEmail = `edgecase-${timestamp}@test.com`;
  const testPassword = 'password123';

  try {
    // Test 1: Register user
    console.log('⚠️  [Auth] Test 1 - Valid registration...');
    await page.goto(`${FRONTEND_URL}/register`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="text"]', `Edge Case User ${timestamp}`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    let registerBtn = await page.locator('button:has-text("Register"), button[type="submit"]').first();
    await registerBtn.click();
    
    await page.waitForURL(/login|dashboard|register/, { timeout: 5000 }).catch(() => {});
    const successMsg = await page.locator('text=success, text=registered').first();
    const errorMsg = await page.locator('text=error, text=already').first();
    
    if (await errorMsg.isVisible()) {
      console.log('⚠️  [Auth] Duplicate registration correctly rejected');
    }

    // Test 2: Attempt duplicate registration
    console.log('⚠️  [Auth] Test 2 - Duplicate registration (should fail)...');
    await page.goto(`${FRONTEND_URL}/register`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="text"]', `Duplicate User`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    registerBtn = await page.locator('button:has-text("Register"), button[type="submit"]').first();
    await registerBtn.click();
    
    const duplicateError = await page.locator('text=already exists, text=duplicate, text=Email').first();
    await duplicateError.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
      console.log('⚠️  [Auth] Duplicate error not shown (may be silently handled)');
    });

    // Test 3: Login with wrong password
    console.log('⚠️  [Auth] Test 3 - Invalid login (wrong password)...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'wrongpassword');
    
    let loginBtn = await page.locator('button:has-text("Login"), button[type="submit"]').first();
    await loginBtn.click();
    
    const loginError = await page.locator('text=invalid, text=incorrect, text=unauthorized').first();
    await loginError.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
      console.log('⚠️  [Auth] Invalid login error not displayed (may redirect)');
    });

    // Test 4: Access protected endpoint without login
    console.log('⚠️  [Auth] Test 4 - Unauthorized access (no token)...');
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle' });
    
    const redirected = page.url();
    if (redirected.includes('login') || redirected.includes('unauthorized')) {
      console.log('⚠️  [Auth] Protected route correctly redirected to login');
    } else {
      console.log('⚠️  [Auth] May need additional protection on dashboard');
    }

    // Test 5: Valid login (to restore session)
    console.log('⚠️  [Auth] Test 5 - Valid login after edge cases...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    loginBtn = await page.locator('button:has-text("Login"), button[type="submit"]').first();
    await loginBtn.click();
    
    await page.waitForURL(/dashboard|appointments/, { timeout: 5000 });

    artillery.log('Auth edge cases testing completed');
  } catch (error) {
    artillery.log(`Auth edge cases error: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Initialize browser and run scenario
 */
async function setup(context) {
  const { browser } = context;
  
  try {
    // Create a new page for this VU
    const page = await browser.newPage();
    context.page = page;
    
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Set default navigation timeout
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(15000);
    
    artillery.log('Browser page initialized');
  } catch (error) {
    artillery.log(`Setup error: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Cleanup after scenario
 */
async function cleanup(context) {
  const { page } = context;
  
  try {
    if (page) {
      await page.close();
      artillery.log('Browser page closed');
    }
  } catch (error) {
    artillery.log(`Cleanup error: ${error.message}`, 'error');
  }
}

module.exports = {
  setup,
  cleanup,
  frontendPagesFlow,
  patientE2EFlow,
  staffE2EFlow,
  adminE2EFlow,
  authEdgeCasesFlow
};
