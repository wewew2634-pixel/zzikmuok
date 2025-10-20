import { NextRequest, NextResponse } from 'next/server';
import { generateState } from '@/lib/crypto';
import { buildOAuthUrl } from '@/lib/oauth-utils';

/**
 * POST /api/auth/reauth
 * 
 * Triggers OAuth re-authentication flow for expired tokens
 * Used when access token is expired or about to expire (3 days warning)
 * 
 * @param request.body.provider - 'instagram' | 'tiktok'
 * @param request.body.userId - Current user ID (from session)
 * 
 * @returns Redirect URL to OAuth provider
 * 
 * @example
 * ```typescript
 * // Client-side usage
 * const response = await fetch('/api/auth/reauth', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ provider: 'instagram' }),
 * });
 * const { redirectUrl } = await response.json();
 * window.location.href = redirectUrl;
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider } = body;

    // Validate provider
    if (!provider || !['instagram', 'tiktok'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "instagram" or "tiktok"' },
        { status: 400 }
      );
    }

    // Generate CSRF protection state
    const state = generateState();

    // TODO: Store state in session/database for validation in callback
    // For now, encode provider in state for callback identification
    const stateWithProvider = `${state}:${provider}:reauth`;

    // Build OAuth redirect URL
    const redirectUrl = buildOAuthUrl(provider, stateWithProvider);

    return NextResponse.json({
      redirectUrl,
      state: stateWithProvider,
    });
  } catch (error) {
    console.error('Reauth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate re-authentication' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/reauth?provider=instagram
 * 
 * Alternative: Direct redirect to OAuth provider
 * Useful for simple link-based re-authentication
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get('provider');

  // Validate provider
  if (!provider || !['instagram', 'tiktok'].includes(provider)) {
    return NextResponse.redirect(
      new URL('/oauth/select?error=invalid_provider', request.url)
    );
  }

  // Generate state
  const state = generateState();
  const stateWithProvider = `${state}:${provider}:reauth`;

  // TODO: Store state in session for validation

  // Build OAuth URL
  const oauthUrl = buildOAuthUrl(provider, stateWithProvider);

  return NextResponse.redirect(oauthUrl);
}
