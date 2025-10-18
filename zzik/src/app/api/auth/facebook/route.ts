/**
 * Facebook/Instagram OAuth Login Route
 * GET /api/auth/facebook?type=facebook - Facebook login
 * GET /api/auth/facebook?type=instagram - Instagram login  
 * GET /api/auth/facebook/callback - Handle OAuth callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { facebookOAuth } from '@/lib/api-clients';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const loginType = searchParams.get('type') || 'facebook'; // facebook or instagram

  // Step 1: Redirect to Facebook/Instagram OAuth
  if (!code && !error) {
    const state = crypto.randomUUID();
    
    // Instagram login requires additional scopes
    const scopes = loginType === 'instagram' 
      ? 'email,public_profile,instagram_basic,pages_show_list'
      : 'email,public_profile';
    
    const authUrl = facebookOAuth.getAuthUrl(state, scopes);
    
    return NextResponse.redirect(authUrl);
  }

  // Step 2: Handle OAuth error
  if (error) {
    return NextResponse.json(
      { error: 'OAuth failed', details: error },
      { status: 400 }
    );
  }

  // Step 3: Exchange code for access token
  try {
    const tokenData = await facebookOAuth.exchangeCodeForToken(code!);
    const userInfo = await facebookOAuth.getUserInfo(tokenData.access_token);

    // If Instagram login, get Instagram account info
    let instagramInfo = null;
    if (loginType === 'instagram') {
      try {
        // Get user's pages (Instagram business accounts are linked to pages)
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
        );
        const pagesData = await pagesResponse.json();
        
        // Get Instagram account for the first page
        if (pagesData.data && pagesData.data.length > 0) {
          const pageId = pagesData.data[0].id;
          const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${tokenData.access_token}`
          );
          const igData = await igResponse.json();
          
          if (igData.instagram_business_account) {
            const igAccountId = igData.instagram_business_account.id;
            const igProfileResponse = await fetch(
              `https://graph.facebook.com/v18.0/${igAccountId}?fields=id,username,profile_picture_url&access_token=${tokenData.access_token}`
            );
            instagramInfo = await igProfileResponse.json();
          }
        }
      } catch (igError) {
        console.error('Instagram info fetch error:', igError);
      }
    }

    // TODO: 여기서 사용자 정보를 데이터베이스에 저장하고 세션 생성
    // 예: await createUserSession(userInfo, instagramInfo);

    return NextResponse.json({
      success: true,
      loginType,
      user: {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture?.data?.url,
      },
      instagram: instagramInfo,
    });
  } catch (err) {
    console.error('OAuth error:', err);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
