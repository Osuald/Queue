

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../src/routes/auth');
const appointments = require('../src/routes/appointments');

const { hashPassword, verifyPassword, generateToken, decodeToken } = auth;
const { getNextQueueNumber } = appointments;

const JWT_SECRET = 'queuecare_secret_key';

describe('TC-U01: Password Hashing', () => {
  test('hashed password is NOT equal to the plain text input', () => {
    const plain = 'MySecret123';
    const hashed = hashPassword(plain);

    expect(hashed).not.toBe(plain);
  });

  test('hashed password starts with bcrypt identifier $2b$', () => {
    const hashed = hashPassword('MySecret123');

    // Different bcrypt implementations may use $2a$, $2b$ or $2y$ prefixes; accept any $2 variant
    expect(/^\$2[aby]\$/.test(hashed)).toBe(true);
  });

  test('correct password matches the hash (bcrypt verify)', () => {
    const hashed = hashPassword('MySecret123');

    expect(verifyPassword('MySecret123', hashed)).toBe(true);
  });

  test('wrong password does NOT match the hash', () => {
    const hashed = hashPassword('MySecret123');

    expect(verifyPassword('WrongPassword', hashed)).toBe(false);
  });
});

// =============================================================
// TC-U02: JWT Token Generation
// Function: generateToken()
// Confirms token is created with correct user payload
// =============================================================
describe('TC-U02: JWT Token Generation', () => {
  test('generateToken returns a non-empty string', () => {
    const token = generateToken({ id: 1, role: 'patient' });

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('decoded token contains correct user id', () => {
    const token = generateToken({ id: 1, role: 'patient' });
    const decoded = decodeToken(token);

    expect(decoded.id).toBe(1);
  });

  test('decoded token contains correct user role', () => {
    const token = generateToken({ id: 1, role: 'patient' });
    const decoded = decodeToken(token);

    expect(decoded.role).toBe('patient');
  });

  test('staff token carries role staff in payload', () => {
    const token = generateToken({ id: 2, role: 'staff' });
    const decoded = decodeToken(token);

    expect(decoded.role).toBe('staff');
  });

  test('token signed with wrong secret is rejected', () => {
    const fakeToken = jwt.sign({ id: 99, role: 'admin' }, 'wrong_secret');

    expect(() => decodeToken(fakeToken)).toThrow();
  });
});

// =============================================================
// TC-U03: Queue Number Assignment
// Function: getNextQueueNumber()
// Confirms queue numbers increment correctly per date
// =============================================================
describe('TC-U03: Queue Number Assignment', () => {
  test('first booking on a date gets queue number 1', () => {
    const existingAppointments = []; 
    const queueNum = getNextQueueNumber(existingAppointments, '2026-06-01');

    expect(queueNum).toBe(1);
  });

  test('second booking on same date gets queue number 2', () => {
    const existingAppointments = [
      { date: '2026-06-01', status: 'pending' },
    ];
    const queueNum = getNextQueueNumber(existingAppointments, '2026-06-01');

    expect(queueNum).toBe(2);
  });

  test('third booking on same date gets queue number 3', () => {
    const existingAppointments = [
      { date: '2026-06-01', status: 'pending' },
      { date: '2026-06-01', status: 'pending' },
    ];
    const queueNum = getNextQueueNumber(existingAppointments, '2026-06-01');

    expect(queueNum).toBe(3);
  });

  test('cancelled appointments are excluded from queue count', () => {
    const existingAppointments = [
      { date: '2026-06-01', status: 'cancelled' }, // should NOT count
      { date: '2026-06-01', status: 'pending' },   // counts as 1
    ];
    const queueNum = getNextQueueNumber(existingAppointments, '2026-06-01');

    // Only 1 active appointment, so next is 2
    expect(queueNum).toBe(2);
  });

  test('appointments on different dates do not affect queue count', () => {
    const existingAppointments = [
      { date: '2026-05-01', status: 'pending' }, // different date
      { date: '2026-05-01', status: 'pending' }, // different date
    ];
    const queueNum = getNextQueueNumber(existingAppointments, '2026-06-01');

    // No appointments on 2026-06-01, so first = 1
    expect(queueNum).toBe(1);
  });
});