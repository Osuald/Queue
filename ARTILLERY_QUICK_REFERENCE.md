# Artillery Quick Reference

## Installation

```bash
# Global installation
npm install -g artillery

# Or add to project
npm install --save-dev artillery
```

## Basic Commands

```bash
# Run a test
artillery run artillery-api.yml

# Run with verbose output
artillery run artillery-api.yml -v

# Run and save report
artillery run artillery-api.yml --output report.json

# Generate HTML report from JSON
artillery report report.json

# View in browser
artillery report report.json --output index.html
```

## Common Scenarios

### Quick API Test (Light Load)
```yaml
config:
  target: "http://localhost:5000/api"
  phases:
    - duration: 30
      arrivalRate: 5  # 5 requests/sec for 30 seconds
```

### Medium Load Test
```yaml
config:
  target: "http://localhost:5000/api"
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 25
    - duration: 60
      arrivalRate: 10
```

### Spike Test (Sudden Traffic Increase)
```yaml
config:
  target: "http://localhost:5000/api"
  phases:
    - duration: 60
      arrivalRate: 5
    - duration: 30
      arrivalRate: 100  # Sudden spike
    - duration: 60
      arrivalRate: 5
```

### Stress Test (Ramp to Breaking Point)
```yaml
config:
  target: "http://localhost:5000/api"
  phases:
    - duration: 600  # 10 minutes total
      arrivalRate: 10
      rampTo: 100    # Gradually increase to 100 req/sec
```

## Test Scenarios (Typical Pattern)

```yaml
scenarios:
  - name: "User Registration"
    weight: 15  # 15% of traffic
    flow:
      - post:
          url: "/auth/register"
          json:
            name: "Test User"
            email: "user-{{ $timestamp }}@test.com"
            password: "password123"
          expect:
            - statusCode: 201

  - name: "Login"
    weight: 25  # 25% of traffic
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "test@test.com"
            password: "password123"
          expect:
            - statusCode: 200
          capture:
            json: "$.token"
            as: "authToken"

  - name: "Get Protected Resource"
    weight: 60  # 60% of traffic
    flow:
      - get:
          url: "/api/appointments"
          headers:
            Authorization: "Bearer {{ authToken }}"
          expect:
            - statusCode: 200
```

## Performance Targets

| Metric | Good | Acceptable | Poor |
|--------|------|-----------|------|
| p95 Response Time | < 200ms | 200-500ms | > 500ms |
| p99 Response Time | < 500ms | 500-1000ms | > 1000ms |
| Error Rate | < 0.5% | 0.5-2% | > 2% |
| Availability | > 99.5% | 99-99.5% | < 99% |
| Throughput | Consistent | Occasional dips | Degrading |

## Expected Results Example

```
Metrics for scenario "API Test" (50 requests/sec):

http.status_code.200:    2450 (98%)
http.status_code.400:    50 (2%)

Response time:
  min: 12ms
  max: 1205ms
  mean: 145ms
  median: 98ms
  p95: 320ms
  p99: 890ms

Requests completed:     2500
Requests failed:        0
RPS sent: 50 / sec

Success rate: 98%
Error rate: 2%
```

## Troubleshooting

### High Error Rates
- Check if servers are running
- Verify endpoints exist
- Check server logs
- Increase timeout: `timeout: 30`

### High Latency
- Check server CPU/memory usage
- Look for database bottlenecks
- Review slow query logs
- Consider caching

### Timeouts
- Increase timeout: `timeout: 60`
- Reduce concurrent users: `arrivalRate: 5`
- Check network connectivity

### Connection Refused
```bash
# Verify backend is running on port 5000
curl http://localhost:5000/api

# Verify frontend is running on port 3000
curl http://localhost:3000
```

## Tips & Tricks

### 1. Use Variables for Dynamic Data
```yaml
config:
  variables:
    baseUrl: "http://localhost:5000"
    testEmail: "test@example.com"

scenarios:
  - flow:
      - post:
          url: "{{ baseUrl }}/api/auth/login"
          json:
            email: "{{ testEmail }}"
```

### 2. Capture Values from Responses
```yaml
- post:
    url: "/auth/login"
    json:
      email: "test@test.com"
      password: "password"
    capture:
      json: "$.token"
      as: "authToken"

- get:
    url: "/api/profile"
    headers:
      Authorization: "Bearer {{ authToken }}"
```

### 3. Add Think Time (User Pause)
```yaml
- get:
    url: "/api/appointments"
  think: 2000  # Wait 2 seconds before next request
```

### 4. Conditional Requests
```yaml
- get:
    url: "/api/appointments"
    expect:
      - statusCode: 200
      - hasProperty: body

# Only execute if previous request succeeded
- get:
    url: "/api/appointments/{{ appointmentId }}"
    ifTrue: "appointmentId"
```

### 5. Extract and Use Values
```yaml
capture:
  json: "$.appointment.id"
  as: "appointmentId"

xpath:
  pattern: "//input[@name='csrf']/@value"
  as: "csrfToken"
```

## Run Full Test Suite

```bash
#!/bin/bash
# Run all tests with reports

echo "Starting API stress test..."
artillery run artillery-api.yml --output api-report.json

echo "Starting Frontend stress test..."
artillery run artillery-frontend.yml --output frontend-report.json

echo "Generating reports..."
artillery report api-report.json --output api-report.html
artillery report frontend-report.json --output frontend-report.html

echo "Tests complete! View reports:"
echo "  - api-report.html"
echo "  - frontend-report.html"
```

## Resources

- [Official Artillery Docs](https://artillery.io)
- [Artillery YAML Syntax](https://artillery.io/docs/reference/test-script-format)
- [Best Practices](https://artillery.io/docs/best-practices)
- [Plugins & Extensions](https://artillery.io/docs/ecosystem)
