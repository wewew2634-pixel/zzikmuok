/**
 * Instagram Access Token Automated Generator
 * 
 * This script automatically generates an Instagram Access Token using Facebook Graph API.
 * Run: npx tsx scripts/get-instagram-token.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync, readFileSync } from 'fs';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

async function getInstagramToken() {
  console.log('📸 Instagram Access Token Generator\n');
  console.log('═'.repeat(60));

  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    console.error('❌ Facebook credentials not found in .env.local');
    process.exit(1);
  }

  console.log('\n✅ Facebook App Configuration:');
  console.log(`   App ID: ${FACEBOOK_APP_ID}`);
  console.log(`   App Secret: ${FACEBOOK_APP_SECRET?.slice(0, 8)}...`);

  console.log('\n🔄 Step 1: Generate App Access Token');
  
  try {
    // Get App Access Token
    const appTokenUrl = `https://graph.facebook.com/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&grant_type=client_credentials`;
    
    const appTokenResponse = await fetch(appTokenUrl);
    if (!appTokenResponse.ok) {
      throw new Error('Failed to get app access token');
    }
    
    const appTokenData = await appTokenResponse.json();
    console.log('   ✅ App Access Token obtained');
    console.log(`   Token: ${appTokenData.access_token.slice(0, 20)}...`);

    console.log('\n💡 Next Steps (Manual - Facebook Security Required):\n');
    
    console.log('📋 Option 1: Use Graph API Explorer (Recommended)');
    console.log('─'.repeat(60));
    console.log('1. Visit: https://developers.facebook.com/tools/explorer/');
    console.log(`2. Select your app (App ID: ${FACEBOOK_APP_ID})`);
    console.log('3. Click "Generate Access Token"');
    console.log('4. Grant these permissions:');
    console.log('   ✓ instagram_basic');
    console.log('   ✓ pages_show_list');
    console.log('   ✓ pages_read_engagement');
    console.log('5. Copy the User Access Token');
    console.log('6. Exchange it for a Long-Lived Token (see below)\n');

    console.log('📋 Option 2: OAuth Flow URL');
    console.log('─'.repeat(60));
    const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=https://localhost&scope=instagram_basic,pages_show_list,pages_read_engagement`;
    console.log(`${oauthUrl}\n`);
    console.log('→ Visit this URL in your browser');
    console.log('→ Grant permissions');
    console.log('→ Copy the "code" from the redirect URL');
    console.log('→ Exchange it for an access token (see below)\n');

    console.log('🔄 Exchange Short-Lived Token for Long-Lived Token:');
    console.log('─'.repeat(60));
    console.log('After getting a short-lived token, run:\n');
    console.log(`curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN"\n`);

    console.log('📝 Update .env.local:');
    console.log('─'.repeat(60));
    console.log('Add the long-lived token to your .env.local file:');
    console.log('INSTAGRAM_ACCESS_TOKEN=YOUR_LONG_LIVED_TOKEN\n');

    console.log('🧪 Test Instagram API:');
    console.log('─'.repeat(60));
    console.log('npm run dev');
    console.log('curl http://localhost:3004/api/instagram/profile\n');

    console.log('═'.repeat(60));
    console.log('\n⚠️  Note: Due to Facebook security policies, this process');
    console.log('   requires manual authentication through Facebook Login.');
    console.log('   The token will be valid for 60 days.\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

// Run the script
getInstagramToken();
