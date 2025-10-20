import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/auth/oauth/select?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`,
        request.url
      )
    );
  }

  // Validate state (in production, verify against stored state)
  if (!state || !code) {
    return NextResponse.redirect(
      new URL("/auth/oauth/select?error=invalid_request", request.url)
    );
  }

  try {
    // TODO: Exchange code for access token
    // TODO: Determine provider (Instagram/TikTok) from state or referer
    // TODO: Store tokens securely
    // TODO: Enqueue data sync job

    // For now, redirect to sync-status with a mock job ID
    const jobId = Math.random().toString(36).substring(7);
    
    return NextResponse.redirect(
      new URL(`/onboarding/sync-status?jobId=${jobId}&provider=instagram`, request.url)
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(
        `/auth/oauth/select?error=callback_failed&description=${encodeURIComponent((err as Error).message)}`,
        request.url
      )
    );
  }
}
