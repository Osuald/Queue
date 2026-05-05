# Artillery Stress Testing Guide for QueueCare

This guide explains how to use Artillery to stress-test the QueueCare system and measure performance metrics like response time, availability, reliability, and throughput.

## What is Artillery?

Artillery is a modern, powerful, and easy-to-use load testing and stress testing tool. It can:
- Simulate thousands of concurrent users
- Measure response times and latency
- Test API endpoints and full web applications
- Generate detailed performance reports
- Identify bottlenecks and performance issues

## Installation

If not already installed, add Artillery to the project:

```bash
npm install -g artillery
```

Or add it as a dev dependency:

```bash
npm install --save-dev artillery
```

## Configuration Files

### `artillery-api.yml`
Tests the backend API endpoints with realistic scenarios:
- **Auth Flow**: Registration and login (10% of traffic)
- **Authenticated API**: Get/create appointments (60% of traffic)
- **Queue Operations**: Staff queue access (30% of traffic)

**Load Profile**:
- Warm up: 5 req/s for 60 seconds
- Ramp up: 20 req/s for 120 seconds
- Spike: 50 req/s for 60 seconds
- Cool down: 10 req/s for 60 seconds

### `artillery-frontend.yml`
Tests the frontend application:
- **Page Load & Navigation**: Login flow (40% of traffic)
- **Dashboard & Appointments**: Key pages (40% of traffic)
- **Static Assets**: Asset loading simulation (20% of traffic)

**Load Profile**:
- Warm up: 3 req/s for 30 seconds
- Ramp up: 15 req/s for 90 seconds
- Peak: 30 req/s for 60 seconds
- Cool down: 5 req/s for 30 seconds

## Running the Tests

### Prerequisites
Ensure both backend and frontend are running:

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Run API Stress Test

```bash
# Basic run
artillery run artillery-api.yml

# Run with HTML report output
artillery run artillery-api.yml --output api-report.json
artillery report api-report.json

# Run with more detailed output
artillery run artillery-api.yml -v

# Run for a longer duration (multiply phases by time)
artillery run artillery-api.yml --ramp 2
```

### Run Frontend Stress Test

```bash
# Basic run
artillery run artillery-frontend.yml

# With report
artillery run artillery-frontend.yml --output frontend-report.json
artillery report frontend-report.json
```

### Run Both Tests (Sequential)

```bash
# Run API test first, then frontend
artillery run artillery-api.yml --output api-report.json && \
artillery run artillery-frontend.yml --output frontend-report.json && \
artillery report api-report.json && \
artillery report frontend-report.json
```

## Key Metrics to Monitor

### 1. **Response Time (Latency)**
- **p95**: 95th percentile response time (should be < 500ms)
- **p99**: 99th percentile response time (should be < 1000ms)
- **mean**: Average response time
- **min/max**: Minimum and maximum response times

### 2. **Throughput**
- **Requests per second (RPS)**: How many requests the system handles per second
- **Completed requests**: Total successful requests
- **Failed requests**: Requests that timed out or returned errors

### 3. **Availability**
- **Success rate**: Percentage of successful responses (should be 99%+)
- **Error rate**: Percentage of failed requests (should be < 1%)
- **Timeout rate**: Requests that exceeded time limit

### 4. **Reliability**
- **Consistency of response times**: Low variance is better
- **Error distribution**: Are errors consistent or sporadic?
- **System stability**: Does performance degrade as load increases?

## Interpreting Results

### Sample Report Output

```
✓ http.codes.200: 4525 (93.8%)
✓ http.codes.201: 325 (6.7%)
✓ http.codes.400: 50 (1.0%)
✓ http.codes.401: 25 (0.5%)
...

Latency:
  min: 10
  max: 5230
  mean: 145.2
  median: 98
  p95: 321
  p99: 1205

Requests/sec: 23.4
Codes:
  2xx: 4850
  4xx: 75
  5xx: 0

```

### What to Look For

- ✓ **Good**: p95 < 500ms, p99 < 1000ms, error rate < 1%
- ⚠️ **Moderate**: p95 500-1000ms, p99 1000-2000ms, error rate 1-5%
- ✗ **Poor**: p95 > 1000ms, p99 > 2000ms, error rate > 5%

## Custom Scenarios

Edit `artillery-api.yml` or `artillery-frontend.yml` to add custom scenarios:

```yaml
scenarios:
  - name: "Custom Scenario"
    weight: 25  # 25% of traffic
    flow:
      - get:
          url: "/api/custom-endpoint"
          expect:
            - statusCode: 200
```

## Advanced Options

### Rate Limiting
Simulate rate-limited users:

```yaml
config:
  phases:
    - duration: 60
      arrivalRate: 10
      rampTo: 50  # Gradually increase from 10 to 50
```

### Request Delays
Add think time between requests:

```yaml
- get:
    url: "/api/data"
  think: 2000  # Wait 2 seconds before next request
```

### Custom Headers & Auth

```yaml
- get:
    url: "/api/protected"
    headers:
      Authorization: "Bearer {{ authToken }}"
      X-Custom-Header: "value"
```

## Performance Tuning Tips

1. **Database**: Ensure proper indexing on frequently queried columns
2. **Caching**: Implement caching for static responses
3. **Connection pooling**: Use connection pools for database connections
4. **Load balancing**: Distribute traffic across multiple instances
5. **Rate limiting**: Implement rate limiting to prevent abuse
6. **Monitoring**: Use APM tools to identify bottlenecks

## Troubleshooting

### "Connection refused"
- Ensure backend/frontend servers are running
- Check that ports 5000 and 3000 are accessible

### "High error rates"
- Check server logs for errors
- Verify database is responsive
- Check available system memory

### "Timeouts"
- Increase timeout in config: `timeout: 30` (seconds)
- Check server CPU/memory usage
- Optimize slow endpoints

## Next Steps

1. Run baseline tests against current system
2. Identify bottlenecks
3. Implement optimizations
4. Re-run tests to measure improvement
5. Establish performance SLAs based on results

---

**Resources**:
- [Artillery Docs](https://artillery.io)
- [Artillery Best Practices](https://artillery.io/docs/best-practices)
