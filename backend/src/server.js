const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Increase timeouts to be more tolerant under load.
// Keep-alive should be slightly lower than headersTimeout.
const KEEP_ALIVE_TIMEOUT = process.env.KEEP_ALIVE_TIMEOUT
  ? Number(process.env.KEEP_ALIVE_TIMEOUT)
  : 65000; // 65s
const HEADERS_TIMEOUT = process.env.HEADERS_TIMEOUT
  ? Number(process.env.HEADERS_TIMEOUT)
  : 75000; // 75s
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT
  ? Number(process.env.REQUEST_TIMEOUT)
  : 120000; // 120s

server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT;
server.headersTimeout = HEADERS_TIMEOUT;
server.setTimeout(REQUEST_TIMEOUT);

server.listen(PORT, () => {
  console.log(`QueueCare API running on http://localhost:${PORT}`);
  console.log(
    `timeouts: keepAlive=${KEEP_ALIVE_TIMEOUT}ms headers=${HEADERS_TIMEOUT}ms request=${REQUEST_TIMEOUT}ms`
  );
});
