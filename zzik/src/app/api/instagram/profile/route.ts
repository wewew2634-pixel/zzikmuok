/**
 * Instagram Profile Route
 * GET /api/instagram/profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { instagramAPI } from '@/lib/api-clients';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const profile = await instagramAPI.getUserProfile();

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (err: any) {
    console.error('Instagram profile error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Instagram profile' },
      { status: 500 }
    );
  }
}
