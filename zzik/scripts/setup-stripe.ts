/**
 * Stripe Price ID Setup Script
 * 
 * This script helps you create subscription prices in Stripe.
 * Run: npx tsx scripts/setup-stripe.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

async function setupStripePrices() {
  console.log('💳 Stripe Price Setup\n');
  console.log('═'.repeat(60));

  if (!STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
    process.exit(1);
  }

  if (!STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.error('⚠️  WARNING: You are using LIVE mode keys!');
    console.error('   Please use TEST mode keys for development.');
    console.error('   TEST keys start with: sk_test_\n');
    process.exit(1);
  }

  console.log('✅ Stripe Configuration:');
  console.log(`   Secret Key: ${STRIPE_SECRET_KEY.slice(0, 15)}...`);
  console.log('   Mode: TEST MODE ✓\n');

  try {
    // Import Stripe dynamically
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });

    console.log('📦 Creating ZZIK Subscription Products...\n');

    // 1. Create Product
    console.log('1️⃣  Creating Product: "ZZIK Premium"');
    const product = await stripe.products.create({
      name: 'ZZIK Premium',
      description: 'Premium subscription for ZZIK platform',
      metadata: {
        type: 'subscription',
        platform: 'zzik',
      },
    });
    console.log(`   ✅ Product created: ${product.id}\n`);

    // 2. Create Monthly Price
    console.log('2️⃣  Creating Monthly Price: ₩9,900/month');
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 9900, // ₩9,900
      currency: 'krw',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      nickname: 'ZZIK Premium Monthly',
      metadata: {
        plan: 'monthly',
      },
    });
    console.log(`   ✅ Monthly Price ID: ${monthlyPrice.id}\n`);

    // 3. Create Yearly Price (with discount)
    console.log('3️⃣  Creating Yearly Price: ₩99,000/year (16% off)');
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 99000, // ₩99,000 (save ₩19,800)
      currency: 'krw',
      recurring: {
        interval: 'year',
        interval_count: 1,
      },
      nickname: 'ZZIK Premium Yearly',
      metadata: {
        plan: 'yearly',
        discount: '16%',
      },
    });
    console.log(`   ✅ Yearly Price ID: ${yearlyPrice.id}\n`);

    // 4. Update .env.local instructions
    console.log('═'.repeat(60));
    console.log('\n✨ Success! Your subscription prices are ready.\n');
    console.log('📋 Add these to your .env.local file:\n');
    console.log(`STRIPE_PRICE_ID_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_ID_YEARLY=${yearlyPrice.id}\n`);

    console.log('🧪 Test Checkout Session:');
    console.log(`\ncurl -X POST http://localhost:3004/api/stripe/checkout \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"priceId":"${monthlyPrice.id}"}'`);
    console.log('\n→ This will return a Stripe Checkout URL\n');

    console.log('💳 Test Card Numbers (TEST MODE):');
    console.log('   Success: 4242 4242 4242 4242');
    console.log('   Decline: 4000 0000 0000 0002');
    console.log('   → Any future expiry date (e.g., 12/34)');
    console.log('   → Any 3-digit CVC\n');

    console.log('📊 View in Stripe Dashboard:');
    console.log('   URL: https://dashboard.stripe.com/test/products\n');

    console.log('═'.repeat(60));
    console.log('\n🎯 Next Steps:');
    console.log('   1. Copy the Price IDs above');
    console.log('   2. Add them to .env.local');
    console.log('   3. Restart your dev server: npm run dev');
    console.log('   4. Test the checkout flow\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📘 Manual Setup Instructions:');
    console.log('1. Go to: https://dashboard.stripe.com/test/products');
    console.log('2. Click "Add product"');
    console.log('3. Enter product details:');
    console.log('   → Name: ZZIK Premium');
    console.log('   → Description: Premium subscription');
    console.log('4. Add pricing:');
    console.log('   → Monthly: ₩9,900 KRW / month');
    console.log('   → Yearly: ₩99,000 KRW / year');
    console.log('5. Copy the Price IDs');
    console.log('6. Update .env.local\n');
  }
}

// Run the script
setupStripePrices();
