/**
 * 데이터베이스 시드 (테스트 데이터)
 * 
 * 실행: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 테스트 사용자 1: 여러 SNS 계정 연결
  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser',
      image: 'https://i.pravatar.cc/150?u=test',
      bio: 'This is a test user with multiple social accounts',
      accounts: {
        create: [
          {
            type: 'oauth',
            provider: 'facebook',
            providerAccountId: 'fb_test_123',
            profile_picture: 'https://i.pravatar.cc/150?u=fb',
            profile_username: 'testuser_fb',
            follower_count: 1234,
            following_count: 567,
          },
          {
            type: 'oauth',
            provider: 'instagram',
            providerAccountId: 'ig_test_456',
            profile_picture: 'https://i.pravatar.cc/150?u=ig',
            profile_username: 'testuser_ig',
            follower_count: 5678,
            following_count: 890,
          },
          {
            type: 'oauth',
            provider: 'tiktok',
            providerAccountId: 'tt_test_789',
            profile_picture: 'https://i.pravatar.cc/150?u=tt',
            profile_username: 'testuser_tt',
            follower_count: 10000,
            following_count: 100,
          },
        ],
      },
    },
  });

  console.log('✅ Created user 1 with 3 social accounts:', user1.email);

  // 테스트 사용자 2: 단일 SNS 계정
  const user2 = await prisma.user.upsert({
    where: { email: 'single@example.com' },
    update: {},
    create: {
      email: 'single@example.com',
      name: 'Single Account User',
      username: 'singleuser',
      image: 'https://i.pravatar.cc/150?u=single',
      accounts: {
        create: {
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google_test_999',
          profile_picture: 'https://i.pravatar.cc/150?u=google',
          profile_username: 'singleuser_google',
        },
      },
    },
  });

  console.log('✅ Created user 2 with 1 social account:', user2.email);

  // 활동 로그 추가
  await prisma.userActivity.createMany({
    data: [
      {
        userId: user1.id,
        type: 'signup',
        provider: 'facebook',
        metadata: { message: 'User signed up with Facebook' },
      },
      {
        userId: user1.id,
        type: 'account_linked',
        provider: 'instagram',
        metadata: { message: 'Instagram account linked' },
      },
      {
        userId: user1.id,
        type: 'account_linked',
        provider: 'tiktok',
        metadata: { message: 'TikTok account linked' },
      },
      {
        userId: user2.id,
        type: 'signup',
        provider: 'google',
        metadata: { message: 'User signed up with Google' },
      },
    ],
  });

  console.log('✅ Created activity logs');

  console.log('🎉 Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
