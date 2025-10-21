/**
 * ZZMUK Matching Engine - PostgreSQL + PostGIS
 *
 * Uses native PostGIS for geographic queries (faster than application-level Haversine)
 * Performance target: p95 < 200ms
 */

import { db } from './db';

export interface MatchQuery {
  userId: string;
  targetRole: 'creator' | 'shop';
  maxDistance?: number; // km, default 3.0
  category?: string;
  minFollowers?: number;
}

export interface MatchCandidate {
  id: string;
  name: string | null;
  username: string | null;
  role: string | null;
  category: string | null;
  latitude: number;
  longitude: number;
  distance: number;
  relevanceScore: number;
  verified: boolean;
  followerCount: number;
  matchReason: {
    categoryMatch: boolean;
    withinDistance: boolean;
    meetsFollowerRequirement: boolean;
    verified: boolean;
  };
}

/**
 * Find matching users using PostGIS geographic queries
 *
 * Performance optimization:
 * 1. ST_DWithin for spatial index usage (fast pre-filter)
 * 2. ST_Distance for exact distance calculation
 * 3. Limit returned rows at database level
 * 4. Single JOIN to get follower counts
 *
 * @param query - Match query parameters
 * @param limit - Maximum results to return
 * @returns Array of matching candidates
 */
export async function findMatches(
  query: MatchQuery,
  limit: number = 20
): Promise<MatchCandidate[]> {
  const startTime = performance.now();

  // Get requesting user's location
  const userRows = await db.query<{
    latitude: number;
    longitude: number;
  }>(
    `
    SELECT
      ST_Y(location::geometry) as latitude,
      ST_X(location::geometry) as longitude
    FROM users
    WHERE id = $1
    `,
    [query.userId]
  );

  if (userRows.length === 0 || !userRows[0].latitude || !userRows[0].longitude) {
    throw new Error('Requesting user does not have location set');
  }

  const { latitude: userLat, longitude: userLon } = userRows[0];
  const maxDistance = query.maxDistance || 3.0;
  const maxDistanceMeters = maxDistance * 1000; // Convert km to meters for PostGIS

  // Build dynamic WHERE clauses
  const whereClauses: string[] = [
    'u.role = $2',
    'u.id != $1',
    `ST_DWithin(
      u.location,
      ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography,
      $5
    )`,
  ];

  const params: any[] = [
    query.userId,
    query.targetRole,
    userLon,
    userLat,
    maxDistanceMeters,
  ];

  let paramIndex = 6;

  if (query.category) {
    whereClauses.push(`u.category = $${paramIndex}`);
    params.push(query.category);
    paramIndex++;
  }

  // Build SQL query with PostGIS functions
  const sql = `
    SELECT
      u.id,
      u.name,
      u.username,
      u.role,
      u.category,
      ST_Y(u.location::geometry) as latitude,
      ST_X(u.location::geometry) as longitude,
      u.verified,
      ST_Distance(
        u.location,
        ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
      ) / 1000.0 as distance, -- Convert meters to km
      COALESCE(SUM(a.follower_count), 0)::INTEGER as follower_count
    FROM users u
    LEFT JOIN accounts a ON a.user_id = u.id
    WHERE ${whereClauses.join(' AND ')}
    GROUP BY u.id, u.name, u.username, u.role, u.category, u.location, u.verified
    HAVING 1=1
      ${query.minFollowers ? `AND COALESCE(SUM(a.follower_count), 0) >= $${paramIndex}` : ''}
    ORDER BY distance ASC
    LIMIT $${query.minFollowers ? paramIndex + 1 : paramIndex}
  `;

  if (query.minFollowers) {
    params.push(query.minFollowers);
    params.push(limit);
  } else {
    params.push(limit);
  }

  // Execute query
  const rows = await db.query<{
    id: string;
    name: string | null;
    username: string | null;
    role: string | null;
    category: string | null;
    latitude: number;
    longitude: number;
    distance: number;
    verified: boolean;
    follower_count: number;
  }>(sql, params);

  // Calculate relevance scores and build results
  const matches: MatchCandidate[] = rows.map((row) => {
    const categoryMatch = query.category
      ? row.category === query.category
      : true;

    const relevanceScore = calculateRelevanceScore({
      distance: row.distance,
      maxDistance,
      categoryMatch,
      followerCount: row.follower_count,
      verified: row.verified,
    });

    return {
      id: row.id,
      name: row.name,
      username: row.username,
      role: row.role,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
      distance: Math.round(row.distance * 100) / 100,
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      verified: row.verified,
      followerCount: row.follower_count,
      matchReason: {
        categoryMatch,
        withinDistance: true,
        meetsFollowerRequirement:
          !query.minFollowers || row.follower_count >= query.minFollowers,
        verified: row.verified,
      },
    };
  });

  // Sort by relevance score (descending)
  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const duration = performance.now() - startTime;
  console.log(
    `[Matching Engine PostGIS] Found ${matches.length} matches in ${duration.toFixed(2)}ms`
  );

  return matches;
}

/**
 * Calculate relevance score (0.0 to 1.0)
 *
 * Scoring factors:
 * - Distance: 40% weight (closer = higher score)
 * - Category match: 30% weight
 * - Follower count: 20% weight (logarithmic scale)
 * - Verification: 10% weight
 */
function calculateRelevanceScore(params: {
  distance: number;
  maxDistance: number;
  categoryMatch: boolean;
  followerCount: number;
  verified: boolean;
}): number {
  // Distance score (inverse: closer = higher)
  const distanceScore = Math.max(
    0,
    1 - params.distance / params.maxDistance
  );

  // Category score
  const categoryScore = params.categoryMatch ? 1.0 : 0.0;

  // Follower score (logarithmic: 0 = 0.0, 10k+ = 1.0)
  const followerScore = Math.min(
    1.0,
    Math.log10(params.followerCount + 1) / 4
  );

  // Verification score
  const verificationScore = params.verified ? 1.0 : 0.0;

  // Weighted average
  const totalScore =
    distanceScore * 0.4 +
    categoryScore * 0.3 +
    followerScore * 0.2 +
    verificationScore * 0.1;

  return totalScore;
}

/**
 * Create a match request and store it in the database
 */
export async function createMatchRequest(query: MatchQuery): Promise<{
  id: string;
  userId: string;
  targetRole: string;
  status: string;
  expiresAt: Date;
}> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Expire in 24 hours

  const rows = await db.query<{
    id: string;
    user_id: string;
    target_role: string;
    status: string;
    expires_at: Date;
  }>(
    `
    INSERT INTO match_requests (
      user_id,
      target_role,
      max_distance,
      category,
      min_followers,
      status,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5, 'processing', $6)
    RETURNING id, user_id, target_role, status, expires_at
    `,
    [
      query.userId,
      query.targetRole,
      query.maxDistance || 3.0,
      query.category || null,
      query.minFollowers || null,
      expiresAt,
    ]
  );

  return {
    id: rows[0].id,
    userId: rows[0].user_id,
    targetRole: rows[0].target_role,
    status: rows[0].status,
    expiresAt: rows[0].expires_at,
  };
}

/**
 * Store match results in the database
 */
export async function storeMatchResults(
  matchRequestId: string,
  matches: MatchCandidate[]
): Promise<void> {
  if (matches.length === 0) {
    // Update request status even if no matches found
    await db.query(
      `
      UPDATE match_requests
      SET status = 'completed', results_count = 0
      WHERE id = $1
      `,
      [matchRequestId]
    );
    return;
  }

  // Use a transaction for consistency
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Insert match results
    for (const match of matches) {
      await client.query(
        `
        INSERT INTO match_results (
          match_request_id,
          target_user_id,
          distance,
          relevance_score,
          match_reason,
          status
        )
        VALUES ($1, $2, $3, $4, $5, 'pending')
        `,
        [
          matchRequestId,
          match.id,
          match.distance,
          match.relevanceScore,
          JSON.stringify(match.matchReason),
        ]
      );
    }

    // Update match request
    await client.query(
      `
      UPDATE match_requests
      SET status = 'completed', results_count = $2
      WHERE id = $1
      `,
      [matchRequestId, matches.length]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
