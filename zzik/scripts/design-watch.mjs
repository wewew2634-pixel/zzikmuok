#!/usr/bin/env node

/**
 * Design Loop Watch 모드
 *
 * 용도: 파일 변경 감지하여 자동으로 Design Loop 실행
 *
 * 사용법:
 *   npm run design:watch              # 자동 모니터링
 *   npm run design:watch -- --interval=60  # 60초마다
 */

import { spawn } from 'child_process';
import { watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 색상
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString('ko-KR');
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

// 인자 파싱
const args = process.argv.slice(2);
const intervalArg = args.find(arg => arg.startsWith('--interval='));
const interval = intervalArg ? parseInt(intervalArg.split('=')[1]) : 30; // 기본 30초

// 감시할 디렉토리
const srcDir = join(__dirname, '..', 'src');
const testsDir = join(__dirname, '..', 'tests');

let isRunning = false;
let lastRun = Date.now();
let changeDetected = false;

log('', 'reset');
log('👀 ZZMUK Design Loop Watch 모드', 'bright');
log('─'.repeat(60), 'cyan');
log(`감시 중: src/, tests/`, 'cyan');
log(`주기: ${interval}초마다 또는 파일 변경 시`, 'cyan');
log(`종료: Ctrl+C`, 'cyan');
log('─'.repeat(60), 'cyan');
log('', 'reset');

/**
 * Design Loop 실행
 */
function runDesignLoop(reason = '주기적 체크') {
  if (isRunning) {
    log('⏳ 이미 실행 중입니다. 대기 중...', 'yellow');
    return;
  }

  isRunning = true;
  lastRun = Date.now();
  changeDetected = false;

  log('', 'reset');
  log(`🎨 Design Loop 실행 (${reason})`, 'blue');
  log('─'.repeat(60), 'dim');

  const check = spawn('node', [join(__dirname, 'design-check.mjs')], {
    stdio: 'inherit',
    shell: true,
  });

  check.on('close', (code) => {
    isRunning = false;

    if (code === 0) {
      log('✅ 체크 완료', 'green');
    } else {
      log('⚠️  문제 발견됨', 'yellow');
    }

    log('─'.repeat(60), 'dim');
    log('👀 파일 감시 중...', 'cyan');
    log('', 'reset');
  });

  check.on('error', (err) => {
    isRunning = false;
    log(`❌ 오류: ${err.message}`, 'red');
  });
}

/**
 * 파일 변경 감지
 */
function watchFiles(dir, label) {
  try {
    watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      // TypeScript/TSX 파일만 감시
      if (!filename.endsWith('.ts') && !filename.endsWith('.tsx')) {
        return;
      }

      // node_modules 무시
      if (filename.includes('node_modules')) {
        return;
      }

      log(`📝 파일 변경: ${filename}`, 'dim');
      changeDetected = true;

      // 파일 변경 후 5초 대기 (여러 파일 동시 저장 대응)
      setTimeout(() => {
        const timeSinceLastRun = Date.now() - lastRun;
        const minInterval = 10000; // 최소 10초 간격

        if (changeDetected && !isRunning && timeSinceLastRun > minInterval) {
          runDesignLoop('파일 변경 감지');
        }
      }, 5000);
    });

    log(`✅ ${label} 감시 시작`, 'green');
  } catch (err) {
    log(`⚠️  ${label} 감시 실패: ${err.message}`, 'yellow');
  }
}

// 파일 감시 시작
watchFiles(srcDir, 'src/');
watchFiles(testsDir, 'tests/');

// 주기적 체크
setInterval(() => {
  if (!isRunning) {
    runDesignLoop('주기적 체크');
  }
}, interval * 1000);

// 초기 실행
log('⏳ 초기 Design Loop 실행 중...', 'blue');
runDesignLoop('초기 체크');

// Graceful shutdown
process.on('SIGINT', () => {
  log('', 'reset');
  log('👋 Design Loop Watch 종료', 'yellow');
  process.exit(0);
});
