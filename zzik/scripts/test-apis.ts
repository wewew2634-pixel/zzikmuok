/**
 * API Testing Script
 * 
 * This script tests all integrated APIs to verify they're working.
 * Run: npx tsx scripts/test-apis.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

async function testAPI(
  name: string,
  testFn: () => Promise<{ success: boolean; message: string }>
): Promise<void> {
  const start = Date.now();
  try {
    const result = await testFn();
    const duration = Date.now() - start;
    results.push({
      name,
      status: result.success ? 'pass' : 'fail',
      message: result.message,
      duration,
    });
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({
      name,
      status: 'fail',
      message: error.message,
      duration,
    });
  }
}

// Test 1: OpenAI Chat API
async function testOpenAI() {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: '안녕',
      history: [],
    }),
  });

  if (response.ok) {
    return {
      success: true,
      message: 'OpenAI Chat API is working (streaming response received)',
    };
  } else {
    const error = await response.text();
    return { success: false, message: `OpenAI API failed: ${error}` };
  }
}

// Test 2: Stripe API
async function testStripe() {
  const response = await fetch(`${BASE_URL}/api/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId: 'price_test_invalid',
    }),
  });

  const data = await response.json();
  
  // We expect an error about invalid price, which means the API is connected
  if (data.error && data.error.includes('No such price')) {
    return {
      success: true,
      message: 'Stripe API is connected (needs valid price_id)',
    };
  } else if (response.ok) {
    return {
      success: true,
      message: 'Stripe API is working perfectly',
    };
  } else {
    return { success: false, message: `Stripe API failed: ${data.error}` };
  }
}

// Test 3: SendGrid API
async function testSendGrid() {
  const response = await fetch(`${BASE_URL}/api/sendgrid/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'test@example.com',
      subject: 'API Test',
      text: 'Testing SendGrid API',
    }),
  });

  const data = await response.json();

  if (data.error && data.error.includes('verified Sender Identity')) {
    return {
      success: true,
      message: 'SendGrid API is connected (needs sender verification)',
    };
  } else if (data.success) {
    return {
      success: true,
      message: 'SendGrid API is working perfectly',
    };
  } else {
    return { success: false, message: `SendGrid API failed: ${data.error}` };
  }
}

// Test 4: Instagram API
async function testInstagram() {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    return {
      success: false,
      message: 'Instagram Access Token not configured (run setup-instagram script)',
    };
  }

  const response = await fetch(`${BASE_URL}/api/instagram/profile`);
  const data = await response.json();

  if (data.success) {
    return {
      success: true,
      message: `Instagram API is working (user: ${data.profile?.username || 'N/A'})`,
    };
  } else {
    return {
      success: false,
      message: `Instagram API failed: ${data.error}`,
    };
  }
}

// Test 5: Facebook OAuth (just check endpoint availability)
async function testFacebook() {
  if (!process.env.FACEBOOK_APP_ID) {
    return {
      success: false,
      message: 'Facebook App ID not configured',
    };
  }

  return {
    success: true,
    message: 'Facebook OAuth is configured (App ID present)',
  };
}

// Test 6: RapidAPI Instagram (우회)
async function testRapidAPIInstagram() {
  if (!process.env.RAPIDAPI_KEY) {
    return {
      success: false,
      message: 'RapidAPI Key not configured (run npm run setup:rapidapi)',
    };
  }

  const response = await fetch(`${BASE_URL}/api/social/instagram?username=instagram`);
  const data = await response.json();

  if (data.success) {
    return {
      success: true,
      message: `RapidAPI Instagram is working (username: ${data.username})`,
    };
  } else if (data.error === 'RapidAPI key not configured') {
    return {
      success: false,
      message: 'RapidAPI key not configured in .env.local',
    };
  } else {
    return {
      success: false,
      message: `RapidAPI Instagram failed: ${data.message}`,
    };
  }
}

// Test 7: RapidAPI TikTok (우회)
async function testRapidAPITikTok() {
  if (!process.env.RAPIDAPI_KEY) {
    return {
      success: false,
      message: 'RapidAPI Key not configured (run npm run setup:rapidapi)',
    };
  }

  const response = await fetch(`${BASE_URL}/api/social/tiktok?username=tiktok`);
  const data = await response.json();

  if (data.success) {
    return {
      success: true,
      message: `RapidAPI TikTok is working (username: ${data.username})`,
    };
  } else if (data.error === 'RapidAPI key not configured') {
    return {
      success: false,
      message: 'RapidAPI key not configured in .env.local',
    };
  } else {
    return {
      success: false,
      message: `RapidAPI TikTok failed: ${data.message}`,
    };
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 ZZIK API Integration Tests\n');
  console.log('═'.repeat(70));
  console.log(`Base URL: ${BASE_URL}\n`);

  console.log('Running tests...\n');

  await testAPI('OpenAI Chat API', testOpenAI);
  await testAPI('Stripe Payment API', testStripe);
  await testAPI('SendGrid Email API', testSendGrid);
  await testAPI('Facebook OAuth', testFacebook);
  await testAPI('Instagram Graph API', testInstagram);
  await testAPI('RapidAPI Instagram (우회)', testRapidAPIInstagram);
  await testAPI('RapidAPI TikTok (우회)', testRapidAPITikTok);

  // Print results
  console.log('═'.repeat(70));
  console.log('\n📊 Test Results:\n');

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const icon =
      result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
    const duration = result.duration ? `(${result.duration}ms)` : '';

    console.log(`${icon} ${result.name} ${duration}`);
    console.log(`   ${result.message}\n`);

    if (result.status === 'pass') passed++;
    if (result.status === 'fail') failed++;
  });

  console.log('═'.repeat(70));
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Your API integration is ready.\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
    console.log('📘 Quick Fixes:');
    console.log('   → SendGrid: Run "npm run setup:sendgrid"');
    console.log('   → Instagram: Run "npm run setup:instagram"');
    console.log('   → Stripe: Run "npm run setup:stripe"');
    console.log('   → RapidAPI (Instagram & TikTok 우회): Run "npm run setup:rapidapi"\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests();
