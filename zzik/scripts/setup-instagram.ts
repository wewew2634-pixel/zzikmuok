/**
 * Instagram Access Token Setup Guide
 * 
 * This script helps you get an Instagram Access Token for the Graph API.
 * Run: npx tsx scripts/setup-instagram.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

console.log('📸 Instagram Access Token Setup Guide\n');
console.log('═'.repeat(60));

if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
  console.error('❌ Facebook credentials not found in .env.local');
  process.exit(1);
}

console.log('\n✅ Facebook App Configuration:');
console.log(`   App ID: ${FACEBOOK_APP_ID}`);
console.log(`   App Secret: ${FACEBOOK_APP_SECRET?.slice(0, 8)}...`);

console.log('\n📋 Step-by-Step Instructions:\n');

console.log('1️⃣  Open Facebook Graph API Explorer');
console.log('   URL: https://developers.facebook.com/tools/explorer/');
console.log('   → Make sure you\'re logged in as: 01083882634\n');

console.log('2️⃣  Select Your App');
console.log(`   → Choose "My Apps" → Select App ID: ${FACEBOOK_APP_ID}\n`);

console.log('3️⃣  Get User Access Token');
console.log('   → Click "Generate Access Token" button');
console.log('   → Grant permissions when prompted\n');

console.log('4️⃣  Add Instagram Permissions');
console.log('   → Click "Permissions" tab');
console.log('   → Search and add these permissions:');
console.log('      ✓ instagram_basic');
console.log('      ✓ instagram_manage_insights');
console.log('      ✓ pages_show_list');
console.log('      ✓ pages_read_engagement\n');

console.log('5️⃣  Get Long-Lived Token');
console.log('   → Copy the short-lived token from Graph API Explorer');
console.log('   → Run the following command:\n');

const exchangeUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN`;

console.log(`   curl "${exchangeUrl}"\n`);
console.log('   → This gives you a long-lived token (60 days)\n');

console.log('6️⃣  Get Instagram Business Account ID');
console.log('   → Use the long-lived token:');
console.log('   curl "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_LONG_LIVED_TOKEN"\n');
console.log('   → Find your Instagram Business Account ID from response\n');

console.log('7️⃣  Get Instagram User Access Token');
console.log('   curl "https://graph.facebook.com/v18.0/{IG_BUSINESS_ACCOUNT_ID}?fields=id,username&access_token=YOUR_LONG_LIVED_TOKEN"\n');

console.log('8️⃣  Update .env.local');
console.log('   → Add the token to your .env.local file:');
console.log('   INSTAGRAM_ACCESS_TOKEN=YOUR_LONG_LIVED_TOKEN\n');

console.log('9️⃣  Restart Your Dev Server');
console.log('   npm run dev\n');

console.log('🔟  Test Instagram API');
console.log('   curl http://localhost:3004/api/instagram/profile\n');

console.log('═'.repeat(60));
console.log('\n💡 Quick Alternative (Recommended):\n');
console.log('   Instead of manual steps, you can:');
console.log('   1. Visit: https://developers.facebook.com/tools/explorer/');
console.log(`   2. Select App: ${FACEBOOK_APP_ID}`);
console.log('   3. Click "Generate Access Token"');
console.log('   4. Grant Instagram permissions');
console.log('   5. Copy the token immediately');
console.log('   6. Update .env.local with the token\n');

console.log('⏰ Token Lifetime:');
console.log('   → Short-lived: 1 hour');
console.log('   → Long-lived: 60 days');
console.log('   → You need to refresh it every 60 days\n');

console.log('📞 Need Help?');
console.log('   → Instagram Account: qetta_t');
console.log('   → Facebook Account: 01083882634');
console.log('   → Docs: https://developers.facebook.com/docs/instagram-basic-display-api/getting-started\n');

console.log('✨ After Setup:');
console.log('   → GET /api/instagram/profile - Get profile info');
console.log('   → GET /api/instagram/media - Get recent posts\n');
