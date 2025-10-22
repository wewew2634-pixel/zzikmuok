/**
 * SNS 로그인 DB 통합 로직
 * 
 * 🎯 핵심 전략:
 * 1. 같은 이메일이면 자동으로 계정 병합
 * 2. 한 사용자가 여러 SNS 연결 가능
 * 3. SNS 프로필 정보 자동 업데이트
 * 4. Stripe 구독 정보 연동
 */

import { prisma } from './prisma';
// Prisma types unavailable (network blocked during generate)
type User = any;
type Account = any;

export interface SocialProfile {
  provider: 'facebook' | 'instagram' | 'tiktok' | 'google';
  providerAccountId: string;
  email?: string;
  name?: string;
  image?: string;
  username?: string;
  followerCount?: number;
  followingCount?: number;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * SNS 로그인 처리 (계정 병합 로직 포함)
 * 
 * @param profile - SNS 프로필 정보
 * @returns User와 Account 정보
 */
export async function handleSocialLogin(profile: SocialProfile) {
  const { provider, providerAccountId, email, name, image, username, followerCount, followingCount, accessToken, refreshToken, expiresAt } = profile;

  // 1. 이미 연결된 Account가 있는지 확인
  let account = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
    include: {
      user: true,
    },
  });

  if (account) {
    // 기존 계정 업데이트 (토큰, 프로필 정보)
    account = await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        profile_picture: image,
        profile_username: username,
        follower_count: followerCount,
        following_count: followingCount,
      },
      include: {
        user: true,
      },
    });

    // 활동 로그 기록
    await logUserActivity(account.userId, 'login', provider);

    return { user: account.user, account, isNewUser: false };
  }

  // 2. 같은 이메일의 기존 사용자가 있는지 확인 (계정 병합)
  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (existingUser) {
      // 기존 사용자에게 새 SNS 계정 추가
      const newAccount = await prisma.account.create({
        data: {
          userId: existingUser.id,
          type: 'oauth',
          provider,
          providerAccountId,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          profile_picture: image,
          profile_username: username,
          follower_count: followerCount,
          following_count: followingCount,
        },
      });

      // 사용자 프로필 업데이트 (이름, 이미지가 비어있을 경우)
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: existingUser.name || name,
          image: existingUser.image || image,
        },
      });

      // 활동 로그 기록
      await logUserActivity(existingUser.id, 'account_linked', provider, {
        message: `${provider} account linked to existing user`,
      });

      return { user: updatedUser, account: newAccount, isNewUser: false };
    }
  }

  // 3. 완전히 새로운 사용자 생성
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      image,
      username,
      accounts: {
        create: {
          type: 'oauth',
          provider,
          providerAccountId,
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          profile_picture: image,
          profile_username: username,
          follower_count: followerCount,
          following_count: followingCount,
        },
      },
    },
    include: {
      accounts: true,
    },
  });

  // 활동 로그 기록
  await logUserActivity(newUser.id, 'signup', provider, {
    message: `New user signed up with ${provider}`,
  });

  return { user: newUser, account: newUser.accounts[0], isNewUser: true };
}

/**
 * 사용자의 모든 연결된 SNS 계정 조회
 */
export async function getUserAccounts(userId: string) {
  return await prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * 특정 SNS 계정 연결 해제
 */
export async function unlinkAccount(userId: string, provider: string) {
  // 최소 1개의 계정은 남겨야 함
  const accounts = await getUserAccounts(userId);
  
  if (accounts.length <= 1) {
    throw new Error('Cannot unlink the last account');
  }

  const account = await prisma.account.deleteMany({
    where: {
      userId,
      provider,
    },
  });

  // 활동 로그 기록
  await logUserActivity(userId, 'account_unlinked', provider);

  return account;
}

/**
 * 사용자 활동 로그 기록
 */
export async function logUserActivity(
  userId: string,
  type: string,
  provider?: string,
  metadata?: any
) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        type,
        provider,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
}

/**
 * 사용자 프로필 업데이트
 */
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    username?: string;
    bio?: string;
    phone?: string;
    image?: string;
  }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  // 활동 로그 기록
  await logUserActivity(userId, 'profile_update', undefined, {
    updatedFields: Object.keys(data),
  });

  return user;
}

/**
 * Stripe 구독 정보 업데이트
 */
export async function updateUserSubscription(
  userId: string,
  subscription: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    stripeCurrentPeriodEnd?: Date;
  }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: subscription,
  });

  // 활동 로그 기록
  await logUserActivity(userId, 'subscription_change', undefined, {
    subscriptionId: subscription.stripeSubscriptionId,
    priceId: subscription.stripePriceId,
  });

  return user;
}

/**
 * 사용자 조회 (모든 연결된 계정 포함)
 */
export async function getUserWithAccounts(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: {
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
          profile_picture: true,
          profile_username: true,
          follower_count: true,
          following_count: true,
          createdAt: true,
        },
      },
    },
  });
}

/**
 * 이메일로 사용자 조회
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true,
    },
  });
}

/**
 * 사용자 활동 내역 조회
 */
export async function getUserActivityLog(userId: string, limit = 50) {
  return await prisma.userActivity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
