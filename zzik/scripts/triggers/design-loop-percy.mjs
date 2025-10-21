#!/usr/bin/env node

/**
 * Design Loop with Percy Integration
 *
 * Orchestrates the complete Design Loop:
 * 1. Playwright E2E tests
 * 2. Axe accessibility scanner
 * 3. Percy visual regression
 *
 * Usage:
 *   PERCY_TOKEN=your_token node scripts/triggers/design-loop-percy.mjs
 *
 * Environment:
 *   PERCY_TOKEN - Percy authentication token (required for visual regression)
 *   BASE_URL - Base URL for tests (default: http://localhost:3000)
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  percyToken: process.env.PERCY_TOKEN,
  reportsDir: join(__dirname, '../../.reports'),
  thresholdsFile: join(__dirname, '../../config/thresholds.yml'),
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log('='.repeat(60), 'cyan');
  log(title, 'bright');
  log('='.repeat(60), 'cyan');
  console.log('');
}

/**
 * Run a command and return a promise
 */
function runCommand(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      env: { ...process.env, ...env },
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Check prerequisites
 */
function checkPrerequisites() {
  logSection('Checking Prerequisites');

  // Check if Percy token is set
  if (!CONFIG.percyToken) {
    log('⚠️  WARNING: PERCY_TOKEN not set. Visual regression tests will be skipped.', 'yellow');
    log('   To enable Percy: export PERCY_TOKEN=your_percy_token', 'yellow');
  } else {
    log('✅ Percy token found', 'green');
  }

  // Check if thresholds file exists
  if (!existsSync(CONFIG.thresholdsFile)) {
    log(`⚠️  WARNING: Thresholds file not found: ${CONFIG.thresholdsFile}`, 'yellow');
  } else {
    log('✅ Thresholds configuration found', 'green');
  }

  // Ensure reports directory exists
  if (!existsSync(CONFIG.reportsDir)) {
    mkdirSync(CONFIG.reportsDir, { recursive: true });
    log(`✅ Created reports directory: ${CONFIG.reportsDir}`, 'green');
  } else {
    log('✅ Reports directory exists', 'green');
  }
}

/**
 * Run Playwright tests with Percy
 */
async function runDesignLoop() {
  logSection('Running Design Loop Tests');

  log('Starting Playwright + Percy integration...', 'cyan');

  const env = {
    BASE_URL: CONFIG.baseUrl,
  };

  if (CONFIG.percyToken) {
    env.PERCY_TOKEN = CONFIG.percyToken;
  }

  try {
    if (CONFIG.percyToken) {
      // Run with Percy
      log('🎨 Running with Percy visual regression...', 'blue');
      await runCommand('npx', ['percy', 'exec', '--', 'npx', 'playwright', 'test'], env);
    } else {
      // Run without Percy
      log('📸 Running without Percy (screenshots only)...', 'yellow');
      await runCommand('npx', ['playwright', 'test'], env);
    }

    log('✅ Design Loop tests completed successfully', 'green');
  } catch (error) {
    log('❌ Design Loop tests failed', 'red');
    throw error;
  }
}

/**
 * Generate summary report
 */
function generateSummary() {
  logSection('Design Loop Summary');

  log('📊 Test Results:', 'bright');
  console.log('');

  // Check Playwright report
  const playwrightReportPath = join(__dirname, '../../playwright-report/results.json');
  if (existsSync(playwrightReportPath)) {
    try {
      const report = JSON.parse(readFileSync(playwrightReportPath, 'utf8'));
      const stats = report.stats || {};

      log(`  E2E Tests:`, 'cyan');
      log(`    ✅ Passed: ${stats.expected || 0}`, 'green');
      log(`    ❌ Failed: ${stats.unexpected || 0}`, stats.unexpected > 0 ? 'red' : 'reset');
      log(`    ⏭️  Skipped: ${stats.skipped || 0}`, 'yellow');
      console.log('');
    } catch (error) {
      log(`  E2E Tests: Unable to parse results`, 'yellow');
    }
  } else {
    log(`  E2E Tests: Report not found`, 'yellow');
  }

  // Accessibility summary
  log(`  Accessibility:`, 'cyan');
  log(`    Target: WCAG 2.1 AA, >95% compliance`, 'reset');
  log(`    Check Playwright report for detailed results`, 'reset');
  console.log('');

  // Percy summary
  if (CONFIG.percyToken) {
    log(`  Visual Regression (Percy):`, 'cyan');
    log(`    Threshold: 5% visual difference`, 'reset');
    log(`    🔗 Percy Dashboard: https://percy.io`, 'blue');
  } else {
    log(`  Visual Regression:`, 'cyan');
    log(`    Local screenshots captured (Percy disabled)`, 'yellow');
  }
  console.log('');

  // Reports location
  log(`📁 Reports:`, 'bright');
  log(`  Playwright HTML: playwright-report/index.html`, 'reset');
  log(`  Screenshots: test-results/`, 'reset');
  console.log('');

  // Next steps
  log(`📝 Next Steps:`, 'bright');
  log(`  1. Open Playwright report: npx playwright show-report`, 'reset');
  if (CONFIG.percyToken) {
    log(`  2. Review Percy builds: https://percy.io`, 'reset');
    log(`  3. Approve visual changes in Percy dashboard`, 'reset');
  } else {
    log(`  2. Set PERCY_TOKEN to enable visual regression`, 'reset');
  }
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  log('🚀 ZZMUK Design Loop Starting...', 'bright');
  log(`   Base URL: ${CONFIG.baseUrl}`, 'reset');
  log(`   Percy: ${CONFIG.percyToken ? 'Enabled' : 'Disabled'}`, CONFIG.percyToken ? 'green' : 'yellow');
  console.log('');

  try {
    // 1. Check prerequisites
    checkPrerequisites();

    // 2. Run tests
    await runDesignLoop();

    // 3. Generate summary
    generateSummary();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log(`\n✅ Design Loop completed successfully in ${duration}s`, 'green');
    process.exit(0);
  } catch (error) {
    log(`\n❌ Design Loop failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, runDesignLoop, generateSummary };
