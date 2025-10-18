/**
 * TikTok OAuth Login Route
 * GET /api/auth/tiktok - Redirect to TikTok login
 * GET /api/auth/tiktok/callback - Handle OAuth callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { tiktokOAuth } from '@/lib/api-clients';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  // Step 1: Redirect to TikTok OAuth
  if (!code && !error) {
    const csrfState = crypto.randomUUID();
    
    // Request basic user info permission
    const authUrl = tiktokOAuth.getAuthUrl(csrfState, 'user.info.basic');
    
    // Store state in a cookie for verification (in production)
    // For now, we'll just redirect
    return NextResponse.redirect(authUrl);
  }

  // Step 2: Handle OAuth error
  if (error) {
    return NextResponse.json(
      { error: 'TikTok OAuth failed', details: error },
      { status: 400 }
    );
  }

  // Step 3: Exchange code for access token
  try {
    const tokenData = await tiktokOAuth.exchangeCodeForToken(code!);
    
    // Get user info
    const userInfo = await tiktokOAuth.getUserInfo(tokenData.access_token);

    // TODO: 여기서 사용자 정보를 데이터베이스에 저장하고 세션 생성
    // 예: await createUserSession(userInfo.data.user);

    return NextResponse.json({
      success: true,
      provider: 'tiktok',
      user: {
        open_id: userInfo.data?.user?.open_id,
        union_id: userInfo.data?.user?.union_id,
        display_name: userInfo.data?.user?.display_name,
        avatar_url: userInfo.data?.user?.avatar_url,
      },
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
      },
    });
  } catch (err: any) {
    console.error('TikTok OAuth error:', err);
    return NextResponse.json(
      { error: 'Failed to authenticate with TikTok', details: err.message },
      { status: 500 }
    );
  }
}
