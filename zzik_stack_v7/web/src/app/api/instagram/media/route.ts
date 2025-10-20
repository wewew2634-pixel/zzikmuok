/**
 * Instagram Media Route
 * GET /api/instagram/media?limit=10
 */

import { NextRequest, NextResponse } from 'next/server';
import { instagramAPI } from '@/lib/api-clients';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const media = await instagramAPI.getMediaList(limit);

    return NextResponse.json({
      success: true,
      media: media.data || [],
    });
  } catch (err: any) {
    console.error('Instagram media error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Instagram media' },
      { status: 500 }
    );
  }
}
