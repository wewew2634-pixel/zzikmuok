#!/usr/bin/env node

/**
 * Design Loop 빠른 체크 스크립트
 *
 * 용도: 개발 중 빠르게 Design Loop 실행
 *
 * 사용법:
 *   npm run design:check              # 기본 (개발 모드)
 *   npm run design:check:prod         # 프로덕션 모드
 *   npm run design:check -- --debug   # 디버그 모드
 *   npm run design:check -- --url=http://localhost:3000/page  # 특정 페이지
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 인자 파싱
const args = process.argv.slice(2);
const isDev = !args.includes('--prod');
const isDebug = args.includes('--debug');
const urlArg = args.find(arg => arg.startsWith('--url='));
const testUrl = urlArg ? urlArg.split('=')[1] : null;

// 환경 변수 설정
const envFile = isDev ? '.env.development' : '.env.production';
const envPath = join(__dirname, '..', envFile);

if (!existsSync(envPath)) {
  log(`⚠️  환경 파일이 없습니다: ${envFile}`, 'yellow');
  log(`   .env.development.example을 복사하여 생성하세요.`, 'yellow');
  process.exit(1);
}

log('', 'reset');
log('🎨 ZZMUK Design Loop 체크', 'bright');
log('─'.repeat(50), 'cyan');
log(`모드: ${isDev ? '개발' : '프로덕션'}`, 'cyan');
log(`환경: ${envFile}`, 'cyan');
if (testUrl) {
  log(`URL: ${testUrl}`, 'cyan');
}
if (isDebug) {
  log(`디버그: 활성화`, 'yellow');
}
log('─'.repeat(50), 'cyan');
log('', 'reset');

// Playwright 실행
const playwrightArgs = ['test'];

if (isDebug) {
  playwrightArgs.push('--debug');
}

// 환경 변수
const env = {
  ...process.env,
};

// .env 파일 로드 (간단한 파서)
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// URL 오버라이드
if (testUrl) {
  env.TEST_URL = testUrl;
}

// 디버그 모드
if (isDebug) {
  env.DEBUG = 'true';
}

log('⏳ Playwright 테스트 실행 중...', 'blue');
log('', 'reset');

const playwright = spawn('npx', playwrightArgs, {
  stdio: 'inherit',
  env,
  shell: true,
});

playwright.on('close', (code) => {
  log('', 'reset');
  log('─'.repeat(50), 'cyan');

  if (code === 0) {
    log('✅ Design Loop 체크 완료!', 'green');
    log('', 'reset');
    log('📊 리포트 확인:', 'cyan');
    log('   npx playwright show-report', 'reset');
    log('', 'reset');
  } else {
    log('❌ Design Loop에서 문제를 발견했습니다.', 'red');
    log('', 'reset');
    log('🔍 상세 확인:', 'cyan');
    log('   npx playwright show-report', 'reset');
    log('', 'reset');
    log('🐛 디버그 모드로 재실행:', 'yellow');
    log('   npm run design:check -- --debug', 'reset');
    log('', 'reset');
  }

  log('─'.repeat(50), 'cyan');

  process.exit(code);
});

playwright.on('error', (err) => {
  log(`❌ 실행 오류: ${err.message}`, 'red');
  process.exit(1);
});
