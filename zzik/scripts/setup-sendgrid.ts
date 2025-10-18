/**
 * SendGrid Sender Verification Setup Script
 * 
 * This script helps you verify your sender email address in SendGrid.
 * Run: npx tsx scripts/setup-sendgrid.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'qettapay@gmail.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'ZZIK';

async function verifySender() {
  if (!SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    process.exit(1);
  }

  console.log('📧 SendGrid Sender Verification Setup\n');
  console.log(`From Email: ${FROM_EMAIL}`);
  console.log(`From Name: ${FROM_NAME}\n`);

  try {
    // 1. Check existing verified senders
    console.log('🔍 Checking existing verified senders...');
    const listResponse = await fetch(
      'https://api.sendgrid.com/v3/verified_senders',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!listResponse.ok) {
      throw new Error(`Failed to list verified senders: ${await listResponse.text()}`);
    }

    const existingSenders = await listResponse.json();
    const isVerified = existingSenders.results?.some(
      (sender: any) => sender.from_email === FROM_EMAIL && sender.verified
    );

    if (isVerified) {
      console.log(`✅ ${FROM_EMAIL} is already verified!\n`);
      console.log('🎉 You can start sending emails immediately.');
      return;
    }

    const isPending = existingSenders.results?.some(
      (sender: any) => sender.from_email === FROM_EMAIL && !sender.verified
    );

    if (isPending) {
      console.log(`⏳ ${FROM_EMAIL} verification is pending.`);
      console.log('📬 Please check your email inbox for the verification link.\n');
      return;
    }

    // 2. Create new sender verification request
    console.log('📝 Creating sender verification request...');
    const createResponse = await fetch(
      'https://api.sendgrid.com/v3/verified_senders',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: FROM_NAME,
          from_email: FROM_EMAIL,
          from_name: FROM_NAME,
          reply_to: FROM_EMAIL,
          reply_to_name: FROM_NAME,
          address: 'Seoul, South Korea',
          address2: '',
          city: 'Seoul',
          state: 'Seoul',
          zip: '06000',
          country: 'South Korea',
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create sender: ${error}`);
    }

    const result = await createResponse.json();
    console.log('\n✅ Sender verification request created!');
    console.log(`\n📬 Verification email sent to: ${FROM_EMAIL}`);
    console.log('\n📋 Next steps:');
    console.log('1. Check your email inbox (qettapay@gmail.com)');
    console.log('2. Click the verification link in the email');
    console.log('3. Run this script again to confirm verification\n');
    console.log('🎯 Once verified, you can send emails through SendGrid API!');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📘 Manual verification steps:');
    console.log('1. Go to: https://app.sendgrid.com/settings/sender_auth');
    console.log('2. Click "Verify a Single Sender"');
    console.log(`3. Enter email: ${FROM_EMAIL}`);
    console.log('4. Complete the verification form');
    console.log('5. Check your email for verification link\n');
  }
}

// Run the script
verifySender();
