import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

export default async function TikTokOAuthPage() {
  // Generate state and code verifier
  const state = randomBytes(16).toString("hex");
  const codeVerifier = randomBytes(32).toString("base64url");

  // Build TikTok OAuth URL
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/auth/oauth/callback`;
  const scope = "user.info.basic,video.list";

  if (!clientKey) {
    // If TikTok OAuth is not configured, redirect back to select page with error
    redirect("/auth/oauth/select?error=tiktok_not_configured");
  }

  const oauthUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  oauthUrl.searchParams.set("client_key", clientKey);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("scope", scope);
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", state);

  // Store state and code_verifier in session/cookies (simplified here)
  // In production, use encrypted cookies or secure session storage

  // Redirect to TikTok OAuth
  redirect(oauthUrl.toString());
}
