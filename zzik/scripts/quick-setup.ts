/**
 * Quick Setup Script for SendGrid and Instagram
 * 
 * This script provides quick URLs and instructions for final setup.
 * Run: npx tsx scripts/quick-setup.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;

console.log('🚀 ZZIK 최종 설정 가이드\n');
console.log('═'.repeat(70));

console.log('\n📧 1. SendGrid 발신자 인증 (2분)\n');
console.log('─'.repeat(70));
console.log('✅ 간단한 방법:');
console.log('   1. 이 URL 열기: https://app.sendgrid.com/settings/sender_auth');
console.log('   2. "Verify a Single Sender" 클릭');
console.log('   3. 이메일 입력: qettapay@gmail.com');
console.log('   4. 나머지 정보 입력 (이름: ZZIK, 주소: Seoul, Korea)');
console.log('   5. 이메일 확인 후 인증 링크 클릭');
console.log('   → 완료! 이메일 발송 즉시 가능\n');

console.log('📸 2. Instagram Access Token 발급 (5분)\n');
console.log('─'.repeat(70));
console.log('✅ 가장 빠른 방법:');
console.log('\n   Step 1: Graph API Explorer 열기');
console.log('   https://developers.facebook.com/tools/explorer/\n');

console.log('   Step 2: 앱 선택');
console.log(`   → "Meta App" 드롭다운 → App ID ${FACEBOOK_APP_ID} 선택\n`);

console.log('   Step 3: User Access Token 생성');
console.log('   → "Generate Access Token" 버튼 클릭');
console.log('   → 로그인 (01083882634 계정)');
console.log('   → 권한 승인\n');

console.log('   Step 4: 권한 추가 (Permissions 탭)');
console.log('   → "Add a Permission" 클릭');
console.log('   → 검색: "instagram_basic" 체크');
console.log('   → 검색: "pages_show_list" 체크');
console.log('   → "Generate Access Token" 다시 클릭\n');

console.log('   Step 5: Long-Lived Token으로 교환');
console.log('   → Graph API Explorer에서 토큰 복사');
console.log('   → 아래 명령어 실행:\n');

if (FACEBOOK_APP_ID) {
  const exchangeCmd = `curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=여기에_복사한_토큰_붙여넣기"`;
  console.log(`   ${exchangeCmd}\n`);
}

console.log('   Step 6: .env.local 업데이트');
console.log('   → 반환된 access_token 값을 복사');
console.log('   → .env.local 파일 열기');
console.log('   → INSTAGRAM_ACCESS_TOKEN=복사한_토큰');
console.log('   → 저장 후 개발 서버 재시작: npm run dev\n');

console.log('═'.repeat(70));
console.log('\n💡 더 빠른 방법 (권장):\n');
console.log('📧 SendGrid: 위 링크에서 2분 안에 완료');
console.log('📸 Instagram: Graph API Explorer에서 5분 안에 완료\n');

console.log('🧪 설정 완료 후 테스트:');
console.log('   npm run test:apis\n');

console.log('📚 자세한 가이드:');
console.log('   SendGrid: npm run setup:sendgrid');
console.log('   Instagram: npm run setup:instagram\n');

console.log('═'.repeat(70));
console.log('\n✨ 설정을 완료하면 모든 API가 작동합니다!\n');
