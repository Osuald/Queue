/**
 * Artillery Processor for QueueCare Combined System Test
 * Generates unique emails per virtual user to avoid UNIQUE constraint errors
 */

// Global counter for unique ID generation
let idCounter = 0;

/**
 * Setup phase - initialize per-VU unique identifiers
 */
function setup(context) {
  // Generate a unique ID for this VU based on timestamp + counter
  const uniqueId = `${Date.now()}-${++idCounter}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create role-specific test users with guaranteed unique emails
  context.vars.uniqueId = uniqueId;
  context.vars.patientEmail = `patient-${uniqueId}@test.local`;
  context.vars.patientName = `Patient ${idCounter}`;
  context.vars.staffEmail = `staff-${uniqueId}@test.local`;
  context.vars.staffName = `Staff ${idCounter}`;
  context.vars.adminEmail = `admin-${uniqueId}@test.local`;
  context.vars.adminName = `Admin ${idCounter}`;
  context.vars.edgeEmail = `edge-${uniqueId}@test.local`;
  
  console.log(`[VU Setup] Created unique test user: ${uniqueId}`);
}

/**
 * After response hook - log errors for debugging
 */
function afterResponse(requestParams, responseParams, context, ee, next) {
  if (responseParams.statusCode >= 400) {
    console.log(`[${context.vars.patientEmail || 'unknown'}] ${requestParams.method} ${requestParams.url} => ${responseParams.statusCode}`);
    if (responseParams.body) {
      try {
        const body = JSON.parse(responseParams.body);
        if (body.error) {
          console.log(`  Error: ${body.error}`);
        }
      } catch (e) {
        // Not JSON
      }
    }
  }
  return next();
}

module.exports = {
  setup,
  afterResponse
};
