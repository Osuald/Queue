// Thin re-export module so coverage shows the utilities file.
// Logic remains in the route modules; this file provides a stable import
// path for tests and tooling without duplicating implementation.
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

module.exports = {
	hashPassword: auth.hashPassword,
	verifyPassword: auth.verifyPassword,
	generateToken: auth.generateToken,
	decodeToken: auth.decodeToken,
	getNextQueueNumber: appointments.getNextQueueNumber,
};
