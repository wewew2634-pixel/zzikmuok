import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

export default async function InstagramOAuthPage() {
  // Generate state and PKCE code
  const state = randomBytes(16).toString("hex");
  const codeVerifier = randomBytes(32).toString("base64url");

  // Build Instagram OAuth URL
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/auth/oauth/callback`;
  const scope = "user_profile,user_media";

  if (!clientId) {
    // If Instagram OAuth is not configured, redirect back to select page with error
    redirect("/auth/oauth/select?error=instagram_not_configured");
  }

  const oauthUrl = new URL("https://api.instagram.com/oauth/authorize");
  oauthUrl.searchParams.set("client_id", clientId);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("scope", scope);
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", state);

  // Store state and code_verifier in session/cookies (simplified here)
  // In production, use encrypted cookies or secure session storage

  // Redirect to Instagram OAuth
  redirect(oauthUrl.toString());
}
