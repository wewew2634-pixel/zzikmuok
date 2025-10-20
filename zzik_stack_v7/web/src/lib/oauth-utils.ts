/**
 * OAuth Utility Functions
 * 
 * Helper functions for OAuth token management and validation.
 * 
 * Phase 4: OAuth Security
 * Created: 2025-10-18
 */

/**
 * Check if token is about to expire (within 3 days)
 * Used to show proactive re-auth warning
 * 
 * @param expiresAt - Token expiry timestamp (milliseconds)
 * @returns True if token expires within 3 days
 */
export function isTokenExpiringSoon(expiresAt: number): boolean {
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  return expiresAt - now < threeDaysInMs;
}

/**
 * Check if token is already expired
 * 
 * @param expiresAt - Token expiry timestamp (milliseconds)
 * @returns True if token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

/**
 * Build OAuth authorization URL for provider
 * 
 * @param provider - 'instagram' | 'tiktok'
 * @param state - CSRF protection state
 * @param baseUrl - Application base URL (optional, uses env var)
 * @returns OAuth authorization URL
 */
export function buildOAuthUrl(
  provider: string,
  state: string,
  baseUrl?: string
): string {
  const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';
  const callbackUrl = `${appUrl}/oauth/callback`;

  if (provider === 'instagram') {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    if (!clientId) {
      throw new Error('INSTAGRAM_CLIENT_ID not configured');
    }

    // Instagram OAuth URL
    // https://developers.facebook.com/docs/instagram-basic-display-api/getting-started
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state,
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  if (provider === 'tiktok') {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    if (!clientKey) {
      throw new Error('TIKTOK_CLIENT_KEY not configured');
    }

    // TikTok OAuth URL
    // https://developers.tiktok.com/doc/login-kit-web/
    const params = new URLSearchParams({
      client_key: clientKey,
      redirect_uri: callbackUrl,
      scope: 'user.info.basic,video.list',
      response_type: 'code',
      state,
    });

    return `https://www.tiktok.com/auth/authorize/?${params.toString()}`;
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
