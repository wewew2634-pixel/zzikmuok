/**
 * DSAR (Data Subject Access Request) Export Endpoint
 * 
 * Allows users to export all their personal data in machine-readable format (JSON).
 * GDPR Article 20 (Right to Data Portability) compliance.
 * CCPA Section 1798.110 (Right to Know) compliance.
 * 
 * @route POST /api/user/export
 * @auth Session cookie or OAuth token
 * @returns ZIP file with JSON data export
 * 
 * Includes:
 * - User profile
 * - OAuth connections
 * - Synced posts (all metadata)
 * - Settings and preferences
 * - Activity logs (anonymized)
 * 
 * Phase 11: DSAR Self-Service
 * Created: 2025-10-18
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/sqlite';
import JSZip from 'jszip';

interface UserExportData {
  export_metadata: {
    requested_at: string;
    export_version: string;
    user_id: number;
    username: string;
  };
  profile: {
    id: number;
    username: string;
    email: string | null;
    created_at: string;
    last_login_at: string | null;
  };
  oauth_connections: Array<{
    provider: string;
    connected_at: string;
    scope: string;
    expires_at: string | null;
  }>;
  posts: Array<{
    id: number;
    platform: string;
    post_type: string;
    media_url: string;
    caption: string;
    published_at: string;
    metrics: {
      likes: number;
      comments: number;
      views: number;
      engagement_rate: number;
    };
  }>;
  settings: {
    notifications_enabled: boolean;
    email_marketing: boolean;
    data_sharing_consent: boolean;
  };
  activity_logs: Array<{
    event: string;
    timestamp: string;
    // IP and session info anonymized for privacy
  }>;
}

/**
 * Get authenticated user ID from request
 * (Placeholder - integrate with your auth system)
 */
function getAuthenticatedUserId(request: NextRequest): number | null {
  // TODO: Integrate with your authentication system
  // Example: const session = await getSession(request);
  // return session?.userId || null;
  
  // For now, use header-based auth (development only)
  const userId = request.headers.get('x-user-id');
  return userId ? parseInt(userId, 10) : null;
}

/**
 * Export user data
 */
async function exportUserData(userId: number): Promise<UserExportData> {
  const db = getDb();

  // Get user profile
  const user = db
    .prepare('SELECT id, username, email, created_at, last_login_at FROM users WHERE id = ?')
    .get(userId) as any;

  if (!user) {
    throw new Error('User not found');
  }

  // Get OAuth connections (tokens are encrypted, not included in export)
  const oauthConnections = db
    .prepare(`
      SELECT provider, created_at as connected_at, scope, expires_at 
      FROM oauth_tokens 
      WHERE user_id = ?
    `)
    .all(userId) as any[];

  // Get posts
  const posts = db
    .prepare(`
      SELECT 
        id, platform, post_type, media_url, caption, published_at,
        likes, comments, views, engagement_rate
      FROM posts 
      WHERE user_id = ?
      ORDER BY published_at DESC
    `)
    .all(userId) as any[];

  const postsFormatted = posts.map((post) => ({
    id: post.id,
    platform: post.platform,
    post_type: post.post_type,
    media_url: post.media_url,
    caption: post.caption,
    published_at: post.published_at,
    metrics: {
      likes: post.likes,
      comments: post.comments,
      views: post.views,
      engagement_rate: post.engagement_rate,
    },
  }));

  // Get settings
  const settings = db
    .prepare(`
      SELECT notifications_enabled, email_marketing, data_sharing_consent
      FROM user_settings
      WHERE user_id = ?
    `)
    .get(userId) as any;

  // Get activity logs (last 90 days, anonymized)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const activityLogs = db
    .prepare(`
      SELECT event, timestamp
      FROM activity_logs
      WHERE user_id = ? AND timestamp > ?
      ORDER BY timestamp DESC
      LIMIT 1000
    `)
    .all(userId, ninetyDaysAgo) as any[];

  return {
    export_metadata: {
      requested_at: new Date().toISOString(),
      export_version: '1.0',
      user_id: user.id,
      username: user.username,
    },
    profile: {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    },
    oauth_connections: oauthConnections.map((conn) => ({
      provider: conn.provider,
      connected_at: conn.connected_at,
      scope: conn.scope,
      expires_at: conn.expires_at,
    })),
    posts: postsFormatted,
    settings: settings || {
      notifications_enabled: true,
      email_marketing: false,
      data_sharing_consent: false,
    },
    activity_logs: activityLogs.map((log) => ({
      event: log.event,
      timestamp: log.timestamp,
    })),
  };
}

/**
 * Create ZIP file with export data
 */
async function createExportZip(data: UserExportData): Promise<Buffer> {
  const zip = new JSZip();

  // Add README
  zip.file(
    'README.txt',
    `ZZIK 개인정보 수출
===================

이 파일은 GDPR 및 CCPA에 따라 요청하신 개인정보 사본입니다.

포함 파일:
- profile.json: 프로필 정보
- oauth_connections.json: SNS 연동 정보
- posts.json: 게시물 데이터
- settings.json: 설정 정보
- activity_logs.json: 활동 기록

수출 날짜: ${data.export_metadata.requested_at}
수출 버전: ${data.export_metadata.export_version}

문의: support@zzik.app
`
  );

  // Add JSON files
  zip.file('profile.json', JSON.stringify(data.profile, null, 2));
  zip.file('oauth_connections.json', JSON.stringify(data.oauth_connections, null, 2));
  zip.file('posts.json', JSON.stringify(data.posts, null, 2));
  zip.file('settings.json', JSON.stringify(data.settings, null, 2));
  zip.file('activity_logs.json', JSON.stringify(data.activity_logs, null, 2));

  // Generate ZIP
  return await zip.generateAsync({ type: 'nodebuffer' });
}

/**
 * POST /api/user/export
 * 
 * Export user data as ZIP file
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const userId = getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    console.log(`[dsar] Export requested by user ${userId}`);

    // Export user data
    const exportData = await exportUserData(userId);

    // Create ZIP file
    const zipBuffer = await createExportZip(exportData);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `zzik_export_${exportData.profile.username}_${timestamp}.zip`;

    // Return ZIP file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('[dsar] Export failed:', error);

    return NextResponse.json(
      {
        error: 'Export failed',
        message: '데이터 수출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 }
    );
  }
}
