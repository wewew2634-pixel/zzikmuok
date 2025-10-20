#!/usr/bin/env tsx
/**
 * CLI Script: Run Design Loop
 * 
 * Usage:
 *   npm run loop:start          # Semi-auto mode (default)
 *   npm run loop:start -- --auto  # Full auto mode
 *   npm run loop:start -- --manual # Manual mode
 *   npm run loop:start -- --iterations 20
 */

import { quickStart } from './index';

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let mode: 'auto' | 'semi-auto' | 'manual' = 'semi-auto';
  let maxIterations = 10;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--auto') {
      mode = 'auto';
    } else if (arg === '--semi-auto') {
      mode = 'semi-auto';
    } else if (arg === '--manual') {
      mode = 'manual';
    } else if (arg === '--iterations' || arg === '-i') {
      maxIterations = parseInt(args[i + 1] || '10', 10);
      i++; // Skip next arg
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                   ZZIK DESIGN LOOP AGENT                   ║');
  console.log('║              Linear 2025 Dark Theme Validator              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📋 Configuration:`);
  console.log(`   Mode: ${mode.toUpperCase()}`);
  console.log(`   Max Iterations: ${maxIterations}`);
  console.log(`   Exit Threshold: 95/100 (2 consecutive)`);
  console.log('');
  console.log('🎯 Validation Rules:');
  console.log('   ✓ TRUE BLACK background (#000000)');
  console.log('   ✓ 8pt grid spacing (multiples of 4px)');
  console.log('   ✓ Line-height rhythm (1.4 headings, 1.5 body)');
  console.log('   ✓ Minimal glassmorphism (≤1 per screen)');
  console.log('   ✓ 60fps animations (transform/opacity only)');
  console.log('   ✓ WCAG AA accessibility (4.5:1 contrast, 48px touch)');
  console.log('');

  try {
    // Override config with CLI args
    process.env.LOOP_MODE = mode;
    process.env.LOOP_MAX_ITERATIONS = maxIterations.toString();

    const result = await quickStart(mode);

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                     LOOP COMPLETED                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`Exit Reason: ${result.exitReason}`);
    console.log(`Total Iterations: ${result.currentIteration}`);
    console.log(`Final Score: ${result.history.scores[result.history.scores.length - 1]?.toFixed(1) || 'N/A'}/100`);
    console.log(`Improvements: ${result.history.improvements.length}`);
    console.log(`Regressions: ${result.history.regressions.length}`);
    console.log('');
    console.log(`📁 State saved to: design-system/loop-agent/.state/loop-state.json`);
    console.log('');

    process.exit(result.exitReason === 'success' ? 0 : 1);

  } catch (error) {
    console.error('');
    console.error('❌ Loop execution failed:');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
ZZIK Design Loop Agent - CLI Help

USAGE:
  npm run loop:start [OPTIONS]

OPTIONS:
  --auto              Full automatic mode (auto-fix all high-confidence issues)
  --semi-auto         Semi-automatic mode (request approval for fixes) [DEFAULT]
  --manual            Manual mode (no auto-fixes, analysis only)
  --iterations, -i N  Maximum number of iterations (default: 10)
  --help, -h          Show this help message

EXAMPLES:
  # Run with default settings (semi-auto, 10 iterations)
  npm run loop:start

  # Run in full auto mode with 20 iterations
  npm run loop:start -- --auto --iterations 20

  # Run in manual mode (analysis only, no fixes)
  npm run loop:start -- --manual

EXIT CONDITIONS:
  The loop will stop when:
  - Score ≥ 95/100 for 2 consecutive iterations
  - Zero critical/high issues detected
  - No improvement for 3 consecutive iterations
  - Maximum iterations reached
  - Significant regression detected (5+ point drop)

OUTPUT:
  - Real-time progress displayed in terminal
  - State saved to: design-system/loop-agent/.state/loop-state.json
  - Screenshots saved to: design-system/loop-agent/.state/screenshots/
  - Full report available via API: GET /api/design-loop/report
  `);
}

// Run if executed directly
if (require.main === module) {
  main();
}
