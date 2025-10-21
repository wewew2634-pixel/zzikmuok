/**
 * Load Test for ZZMUK Matching API
 *
 * Target: p95 < 200ms with 100 concurrent users
 *
 * Usage:
 *   node scripts/load-test-matching.js
 *
 * Environment variables:
 *   API_URL - Base URL for API (default: http://localhost:3000)
 *   CONCURRENT_USERS - Number of concurrent users (default: 100)
 *   REQUESTS_PER_USER - Requests per user (default: 10)
 */

const http = require('http');
const https = require('https');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '100', 10);
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS_PER_USER || '10', 10);

// Test data
const TEST_USER_IDS = [
  'test-user-1',
  'test-user-2',
  'test-user-3',
  'test-user-4',
  'test-user-5',
];

const TARGET_ROLES = ['creator', 'shop'];
const CATEGORIES = ['beauty', 'food', 'fashion', 'tech'];

// Results tracking
const results = {
  durations: [],
  errors: [],
  total: 0,
  succeeded: 0,
  failed: 0,
};

/**
 * Make a single API request
 */
async function makeRequest() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    // Generate random test data
    const body = JSON.stringify({
      userId: TEST_USER_IDS[Math.floor(Math.random() * TEST_USER_IDS.length)],
      targetRole: TARGET_ROLES[Math.floor(Math.random() * TARGET_ROLES.length)],
      maxDistance: 3.0,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      limit: 20,
    });

    const url = new URL('/api/matching/find', API_URL);
    const protocol = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;
        results.durations.push(duration);
        results.total++;

        if (res.statusCode >= 200 && res.statusCode < 300) {
          results.succeeded++;
          resolve({ duration, statusCode: res.statusCode });
        } else {
          results.failed++;
          results.errors.push({
            statusCode: res.statusCode,
            body: data,
          });
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      results.durations.push(duration);
      results.total++;
      results.failed++;
      results.errors.push({
        message: error.message,
      });
      reject(error);
    });

    req.write(body);
    req.end();
  });
}

/**
 * Calculate percentile
 */
function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.floor(sorted.length * p);
  return sorted[index];
}

/**
 * Run load test
 */
async function runLoadTest() {
  console.log('🚀 ZZMUK Matching API Load Test\n');
  console.log(`Configuration:`);
  console.log(`  API URL: ${API_URL}`);
  console.log(`  Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`  Requests per User: ${REQUESTS_PER_USER}`);
  console.log(`  Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}\n`);

  const startTime = Date.now();

  // Create user simulation promises
  const userSimulations = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    const userRequests = [];
    for (let j = 0; j < REQUESTS_PER_USER; j++) {
      userRequests.push(
        makeRequest().catch((err) => {
          // Errors are already tracked in results
          return { error: err.message };
        })
      );
    }
    userSimulations.push(Promise.all(userRequests));
  }

  // Wait for all simulations to complete
  console.log('⏳ Running load test...\n');
  await Promise.all(userSimulations);

  const totalDuration = Date.now() - startTime;

  // Calculate statistics
  const stats = {
    total: results.total,
    succeeded: results.succeeded,
    failed: results.failed,
    successRate: ((results.succeeded / results.total) * 100).toFixed(2),
    errorRate: ((results.failed / results.total) * 100).toFixed(2),
    duration: {
      min: Math.min(...results.durations),
      max: Math.max(...results.durations),
      avg: (
        results.durations.reduce((a, b) => a + b, 0) / results.durations.length
      ).toFixed(2),
      p50: percentile(results.durations, 0.5),
      p95: percentile(results.durations, 0.95),
      p99: percentile(results.durations, 0.99),
    },
    throughput: (results.total / (totalDuration / 1000)).toFixed(2),
  };

  // Print results
  console.log('✅ Load Test Complete!\n');
  console.log('📊 Results:');
  console.log(`  Total Requests: ${stats.total}`);
  console.log(`  Succeeded: ${stats.succeeded} (${stats.successRate}%)`);
  console.log(`  Failed: ${stats.failed} (${stats.errorRate}%)`);
  console.log(`  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`  Throughput: ${stats.throughput} req/s\n`);

  console.log('⏱️  Response Times (ms):');
  console.log(`  Min: ${stats.duration.min}`);
  console.log(`  Avg: ${stats.duration.avg}`);
  console.log(`  p50: ${stats.duration.p50}`);
  console.log(`  p95: ${stats.duration.p95} ${stats.duration.p95 < 200 ? '✅' : '❌ (target: <200ms)'}`);
  console.log(`  p99: ${stats.duration.p99}`);
  console.log(`  Max: ${stats.duration.max}\n`);

  // Print errors if any
  if (results.errors.length > 0) {
    console.log('❌ Errors:');
    const errorSummary = {};
    results.errors.forEach((err) => {
      const key = err.statusCode || err.message || 'unknown';
      errorSummary[key] = (errorSummary[key] || 0) + 1;
    });
    Object.entries(errorSummary).forEach(([key, count]) => {
      console.log(`  ${key}: ${count}`);
    });
    console.log();
  }

  // Evaluate success
  const p95Target = 200; // ms
  const errorRateTarget = 1.0; // %

  const p95Pass = stats.duration.p95 < p95Target;
  const errorRatePass = parseFloat(stats.errorRate) < errorRateTarget;

  console.log('🎯 Performance Targets:');
  console.log(`  p95 < ${p95Target}ms: ${p95Pass ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Error Rate < ${errorRateTarget}%: ${errorRatePass ? '✅ PASS' : '❌ FAIL'}\n`);

  if (p95Pass && errorRatePass) {
    console.log('🎉 All targets met!');
    process.exit(0);
  } else {
    console.log('⚠️  Performance targets not met. Review and optimize.');
    process.exit(1);
  }
}

// Run the test
runLoadTest().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
