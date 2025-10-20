/**
 * SNS 로그인 DB 통합 API
 * 
 * POST /api/auth/social-login
 * 
 * 🎯 기능:
 * - SNS 로그인 정보를 DB에 저장
 * - 같은 이메일이면 자동 계정 병합
 * - 사용자 세션 생성
 * 
 * ⚠️  Node.js Runtime 사용 (Prisma 지원)
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleSocialLogin, getUserWithAccounts } from '@/lib/auth-db';

// Node.js runtime 사용 (Prisma 때문에)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      provider,
      providerAccountId,
      email,
      name,
      image,
      username,
      followerCount,
      followingCount,
      accessToken,
      refreshToken,
      expiresAt,
    } = body;

    // 필수 필드 검증
    if (!provider || !providerAccountId) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'provider and providerAccountId are required',
        },
        { status: 400 }
      );
    }

    // DB에 사용자 정보 저장/업데이트
    const result = await handleSocialLogin({
      provider,
      providerAccountId,
      email,
      name,
      image,
      username,
      followerCount,
      followingCount,
      accessToken,
      refreshToken,
      expiresAt,
    });

    // 세션 생성 (실제 프로덕션에서는 JWT 또는 세션 쿠키 사용)
    // TODO: 실제 세션 생성 로직 추가
    const sessionToken = generateSessionToken(result.user.id);

    return NextResponse.json({
      success: true,
      isNewUser: result.isNewUser,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        image: result.user.image,
        username: result.user.username,
      },
      account: {
        provider: result.account.provider,
        profilePicture: result.account.profile_picture,
        profileUsername: result.account.profile_username,
        followerCount: result.account.follower_count,
        followingCount: result.account.following_count,
      },
      sessionToken,
      message: result.isNewUser
        ? `Welcome! New account created with ${provider}`
        : `Welcome back! Logged in with ${provider}`,
    });
  } catch (error: any) {
    console.error('Social login error:', error);
    
    return NextResponse.json(
      {
        error: 'Social login failed',
        message: error.message || 'Failed to process social login',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/social-login?userId=xxx
 * 사용자 정보 조회 (연결된 모든 SNS 계정 포함)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const user = await getUserWithAccounts(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        username: user.username,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      accounts: user.accounts.map((account) => ({
        id: account.id,
        provider: account.provider,
        profilePicture: account.profile_picture,
        profileUsername: account.profile_username,
        followerCount: account.follower_count,
        followingCount: account.following_count,
        connectedAt: account.createdAt,
      })),
      totalAccounts: user.accounts.length,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get user',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 간단한 세션 토큰 생성 (실제 프로덕션에서는 JWT 사용)
 */
function generateSessionToken(userId: string): string {
  // 실제로는 JWT 또는 secure random token 사용
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
}
