/**
 * API Client Utilities
 * 통합된 외부 서비스 클라이언트 초기화 및 헬퍼 함수
 */

import OpenAI from 'openai';

// ============================================
// OpenAI Client
// ============================================
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// Facebook OAuth Helpers
// ============================================
export const facebookOAuth = {
  clientId: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  redirectUri: process.env.FACEBOOK_REDIRECT_URI,

  getAuthUrl: (state?: string, scope?: string) => {
    const params = new URLSearchParams({
      client_id: facebookOAuth.clientId!,
      redirect_uri: facebookOAuth.redirectUri!,
      scope: scope || 'email,public_profile',
      state: state || '',
    });
    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  },

  exchangeCodeForToken: async (code: string) => {
    const params = new URLSearchParams({
      client_id: facebookOAuth.clientId!,
      client_secret: facebookOAuth.clientSecret!,
      redirect_uri: facebookOAuth.redirectUri!,
      code,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to exchange Facebook code for token');
    }

    return response.json();
  },

  getUserInfo: async (accessToken: string) => {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to get Facebook user info');
    }

    return response.json();
  },
};

// ============================================
// Instagram Graph API Helpers
// ============================================
export const instagramAPI = {
  accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,

  getUserProfile: async () => {
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${instagramAPI.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to get Instagram profile');
    }

    return response.json();
  },

  getMediaList: async (limit = 10) => {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}&access_token=${instagramAPI.accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to get Instagram media');
    }

    return response.json();
  },
};

// ============================================
// Stripe Client
// ============================================
// Stripe SDK는 edge runtime을 지원하지 않으므로 
// 필요 시 서버 컴포넌트나 Node.js runtime에서만 import
export const getStripeClient = async () => {
  const Stripe = (await import('stripe')).default;
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-10-28.acacia',
  });
};

export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  priceIds: {
    monthly: process.env.STRIPE_PRICE_ID_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ID_YEARLY,
  },
};

// ============================================
// SendGrid Email Helpers
// ============================================
export const sendGridAPI = {
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourcompany.com',
  fromName: process.env.SENDGRID_FROM_NAME || 'ZZIK',

  sendEmail: async ({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) => {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sendGridAPI.apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: sendGridAPI.fromEmail,
          name: sendGridAPI.fromName,
        },
        subject,
        content: [
          text ? { type: 'text/plain', value: text } : null,
          html ? { type: 'text/html', value: html } : null,
        ].filter(Boolean),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid API error: ${error}`);
    }

    return { success: true };
  },

  sendTemplateEmail: async ({
    to,
    templateId,
    dynamicData,
  }: {
    to: string;
    templateId: string;
    dynamicData?: Record<string, any>;
  }) => {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sendGridAPI.apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            dynamic_template_data: dynamicData || {},
          },
        ],
        from: {
          email: sendGridAPI.fromEmail,
          name: sendGridAPI.fromName,
        },
        template_id: templateId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid Template API error: ${error}`);
    }

    return { success: true };
  },
};

// ============================================
// RapidAPI - Instagram & TikTok 우회 (Unofficial)
// ============================================
// ⚠️  공식 API 대신 RapidAPI의 서드파티 API 사용
// 로그인 없이 공개 데이터 접근 가능
export const rapidAPI = {
  apiKey: process.env.RAPIDAPI_KEY,
  instagramHost: process.env.RAPIDAPI_INSTAGRAM_HOST || 'tokapi-mobile-version.p.rapidapi.com',
  tiktokHost: process.env.RAPIDAPI_TIKTOK_HOST || 'tiktok-api23.p.rapidapi.com',

  // Instagram - 사용자 프로필 조회 (username으로)
  getInstagramProfile: async (username: string) => {
    try {
      const response = await fetch(
        `https://${rapidAPI.instagramHost}/v1/user/info?username=${username}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': rapidAPI.apiKey!,
            'x-rapidapi-host': rapidAPI.instagramHost,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('RapidAPI Instagram profile error:', error);
      throw error;
    }
  },

  // Instagram - 사용자 포스트 조회
  getInstagramPosts: async (username: string, count = 12) => {
    try {
      const response = await fetch(
        `https://${rapidAPI.instagramHost}/v1/user/posts?username=${username}&count=${count}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': rapidAPI.apiKey!,
            'x-rapidapi-host': rapidAPI.instagramHost,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('RapidAPI Instagram posts error:', error);
      throw error;
    }
  },

  // TikTok - 사용자 프로필 조회 (username으로)
  getTikTokProfile: async (username: string) => {
    try {
      const response = await fetch(
        `https://${rapidAPI.tiktokHost}/api/user/info?username=${username}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': rapidAPI.apiKey!,
            'x-rapidapi-host': rapidAPI.tiktokHost,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('RapidAPI TikTok profile error:', error);
      throw error;
    }
  },

  // TikTok - 사용자 비디오 조회
  getTikTokVideos: async (username: string, count = 12) => {
    try {
      const response = await fetch(
        `https://${rapidAPI.tiktokHost}/api/user/posts?username=${username}&count=${count}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': rapidAPI.apiKey!,
            'x-rapidapi-host': rapidAPI.tiktokHost,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('RapidAPI TikTok videos error:', error);
      throw error;
    }
  },

  // Instagram - 검색 (해시태그, 위치 등)
  searchInstagram: async (query: string, type: 'hashtag' | 'place' | 'user' = 'user') => {
    try {
      const response = await fetch(
        `https://${rapidAPI.instagramHost}/v1/search?q=${encodeURIComponent(query)}&type=${type}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': rapidAPI.apiKey!,
            'x-rapidapi-host': rapidAPI.instagramHost,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Instagram search error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('RapidAPI Instagram search error:', error);
      throw error;
    }
  },

  // TikTok - 검색
  searchTikTok: async (query: string, type: 'user' | 'video' | 'hashtag' = 'user') => {
    try {
      const response = await fetch(
        `https://${rapidAPI.tiktokHost}/api/search?q=${encodeURIComponent(query)}&type=${type}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': rapidAPI.apiKey!,
            'x-rapidapi-host': rapidAPI.tiktokHost,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`TikTok search error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('RapidAPI TikTok search error:', error);
      throw error;
    }
  },
};

// ============================================
// TikTok Login Kit Helpers (공식 OAuth - 선택사항)
// ============================================
export const tiktokOAuth = {
  clientKey: process.env.TIKTOK_CLIENT_KEY,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  redirectUri: process.env.TIKTOK_REDIRECT_URI,

  getAuthUrl: (state: string, scope?: string) => {
    const csrfState = state || Math.random().toString(36).substring(7);
    const scopes = scope || 'user.info.basic';
    
    const params = new URLSearchParams({
      client_key: tiktokOAuth.clientKey!,
      scope: scopes,
      response_type: 'code',
      redirect_uri: tiktokOAuth.redirectUri!,
      state: csrfState,
    });
    
    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  },

  exchangeCodeForToken: async (code: string) => {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: tiktokOAuth.clientKey!,
        client_secret: tiktokOAuth.clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: tiktokOAuth.redirectUri!,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange TikTok code for token');
    }

    return response.json();
  },

  getUserInfo: async (accessToken: string) => {
    const response = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get TikTok user info');
    }

    return response.json();
  },

  refreshToken: async (refreshToken: string) => {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: tiktokOAuth.clientKey!,
        client_secret: tiktokOAuth.clientSecret!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh TikTok token');
    }

    return response.json();
  },
};

// ============================================
// Environment Validation
// ============================================
export const validateEnvironment = () => {
  const required = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  };

  const optional = {
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    COUPANG_ACCESS_KEY: process.env.COUPANG_ACCESS_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  const missingOptional = Object.entries(optional)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingOptional.length > 0) {
    console.warn(
      `⚠️  Missing optional environment variables: ${missingOptional.join(', ')}`
    );
  }

  return {
    valid: true,
    missing: missingOptional,
  };
};
