/**
 * TikTok Login Kit Setup Guide
 * 
 * This script provides instructions for setting up TikTok OAuth login.
 * Run: npx tsx scripts/setup-tiktok.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🎵 TikTok Login Kit Setup Guide\n');
console.log('═'.repeat(70));

console.log('\n📋 Step 1: Create TikTok Developer Account (5분)\n');
console.log('─'.repeat(70));
console.log('1. Visit: https://developers.tiktok.com/');
console.log('2. Click "Log in" → Use your TikTok account');
console.log('3. Complete developer registration');
console.log('4. Agree to TikTok Developer Terms\n');

console.log('📋 Step 2: Create a New App (3분)\n');
console.log('─'.repeat(70));
console.log('1. Go to: https://developers.tiktok.com/apps');
console.log('2. Click "Create an app"');
console.log('3. Fill in app details:');
console.log('   → App name: ZZIK');
console.log('   → App type: Web App');
console.log('   → Category: Entertainment / Social');
console.log('4. Click "Create"\n');

console.log('📋 Step 3: Configure Login Kit (2분)\n');
console.log('─'.repeat(70));
console.log('1. In your app dashboard, click "Add products"');
console.log('2. Select "Login Kit"');
console.log('3. Configure redirect URI:');
console.log('   Development: http://localhost:3000/api/auth/tiktok/callback');
console.log('   Production: https://yourdomain.com/api/auth/tiktok/callback');
console.log('4. Click "Save"\n');

console.log('📋 Step 4: Get Client Credentials (1분)\n');
console.log('─'.repeat(70));
console.log('1. In app dashboard, go to "Basic Information"');
console.log('2. Copy "Client Key"');
console.log('3. Copy "Client Secret"');
console.log('4. Add to .env.local:\n');
console.log('   TIKTOK_CLIENT_KEY=your_client_key_here');
console.log('   TIKTOK_CLIENT_SECRET=your_client_secret_here\n');

console.log('📋 Step 5: Request Permissions (if needed)\n');
console.log('─'.repeat(70));
console.log('1. Go to "Manage scopes"');
console.log('2. Request "user.info.basic" scope');
console.log('3. Wait for approval (usually instant for basic info)\n');

console.log('═'.repeat(70));
console.log('\n🧪 Test TikTok Login:\n');
console.log('─'.repeat(70));
console.log('1. Update .env.local with your credentials');
console.log('2. Restart dev server: npm run dev');
console.log('3. Visit: http://localhost:3004/api/auth/tiktok');
console.log('4. Login with your TikTok account');
console.log('5. Check the response JSON\n');

console.log('💡 Frontend Integration Example:\n');
console.log('─'.repeat(70));
console.log(`
<button
  onClick={() => {
    window.location.href = '/api/auth/tiktok';
  }}
  className="h-12 px-6 bg-black text-white rounded-lg"
>
  <TikTokIcon className="w-5 h-5 mr-2" />
  TikTok으로 로그인
</button>
`);

console.log('\n📚 API Response Format:\n');
console.log('─'.repeat(70));
console.log(`
{
  "success": true,
  "provider": "tiktok",
  "user": {
    "open_id": "user_tiktok_id",
    "union_id": "union_id",
    "display_name": "사용자 이름",
    "avatar_url": "https://..."
  },
  "tokens": {
    "access_token": "act.xxx",
    "refresh_token": "rft.xxx",
    "expires_in": 86400,
    "token_type": "Bearer"
  }
}
`);

console.log('═'.repeat(70));
console.log('\n⚠️  Important Notes:\n');
console.log('• TikTok tokens expire in 24 hours');
console.log('• Use refresh_token to get new access_token');
console.log('• Store tokens securely in your database');
console.log('• Never expose client_secret in frontend\n');

console.log('📞 Documentation:');
console.log('   https://developers.tiktok.com/doc/login-kit-web\n');

console.log('✨ Once configured, you can use TikTok login!\n');
