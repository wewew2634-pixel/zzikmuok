/**
 * ZZMUK Matching Engine
 *
 * Core matching algorithm for creator × shop matching within 3km radius.
 * Includes relevance scoring based on multiple factors:
 * - Distance (closer = better)
 * - Category match
 * - Follower count (for creators)
 * - Engagement rate (if available)
 * - Verification status
 */

import { calculateDistance, getBoundingBox } from './geo-utils';
import { prisma } from './prisma';

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
 * Find matching users based on geographic proximity and relevance
 *
 * Performance target: p95 < 200ms
 *
 * Algorithm:
 * 1. Use bounding box to pre-filter candidates (fast DB query)
 * 2. Calculate exact distance using Haversine (for candidates in box)
 * 3. Apply filters (distance, category, followers)
 * 4. Calculate relevance score
 * 5. Sort by score descending
 * 6. Return top N results
 */
export async function findMatches(
  query: MatchQuery,
  limit: number = 20
): Promise<MatchCandidate[]> {
  const startTime = performance.now();

  // Get the requesting user's location
  const requestingUser = await prisma.user.findUnique({
    where: { id: query.userId },
    select: { latitude: true, longitude: true },
  });

  if (
    !requestingUser ||
    requestingUser.latitude === null ||
    requestingUser.longitude === null
  ) {
    throw new Error('Requesting user does not have location set');
  }

  const { latitude: userLat, longitude: userLon } = requestingUser;
  const maxDistance = query.maxDistance || 3.0;

  // Step 1: Get bounding box for efficient DB query
  const bbox = getBoundingBox(userLat, userLon, maxDistance);

  // Step 2: Query candidates within bounding box
  const candidates = await prisma.user.findMany({
    where: {
      role: query.targetRole,
      latitude: {
        gte: bbox.minLat,
        lte: bbox.maxLat,
      },
      longitude: {
        gte: bbox.minLon,
        lte: bbox.maxLon,
      },
      id: {
        not: query.userId, // Exclude self
      },
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      category: true,
      latitude: true,
      longitude: true,
      verified: true,
      accounts: {
        select: {
          follower_count: true,
          following_count: true,
        },
      },
    },
  });

  // Step 3 & 4: Calculate distance, apply filters, score relevance
  const matches: MatchCandidate[] = [];

  for (const candidate of candidates) {
    if (candidate.latitude === null || candidate.longitude === null) {
      continue;
    }

    // Calculate exact distance
    const distance = calculateDistance(
      userLat,
      userLon,
      candidate.latitude,
      candidate.longitude
    );

    // Filter by distance
    if (distance > maxDistance) {
      continue;
    }

    // Calculate total follower count from all connected accounts
    const totalFollowers = candidate.accounts.reduce(
      (sum: number, account: any) => sum + (account.follower_count || 0),
      0
    );

    // Filter by minimum followers if specified
    if (query.minFollowers && totalFollowers < query.minFollowers) {
      continue;
    }

    // Filter by category if specified
    const categoryMatch = query.category
      ? candidate.category === query.category
      : false;
    if (query.category && !categoryMatch) {
      continue;
    }

    // Calculate relevance score
    const relevanceScore = calculateRelevanceScore({
      distance,
      maxDistance,
      categoryMatch: categoryMatch || !query.category,
      followerCount: totalFollowers,
      verified: candidate.verified,
    });

    matches.push({
      id: candidate.id,
      name: candidate.name,
      username: candidate.username,
      role: candidate.role,
      category: candidate.category,
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      distance: Math.round(distance * 100) / 100, // Round to 2 decimals
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      verified: candidate.verified,
      followerCount: totalFollowers,
      matchReason: {
        categoryMatch: categoryMatch || !query.category,
        withinDistance: true,
        meetsFollowerRequirement: !query.minFollowers || totalFollowers >= query.minFollowers,
        verified: candidate.verified,
      },
    });
  }

  // Step 5: Sort by relevance score (descending)
  matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Step 6: Return top N results
  const results = matches.slice(0, limit);

  const duration = performance.now() - startTime;
  console.log(
    `[Matching Engine] Found ${results.length} matches in ${duration.toFixed(2)}ms`
  );

  return results;
}

/**
 * Calculate relevance score (0.0 to 1.0)
 *
 * Scoring factors:
 * - Distance: 40% weight (closer = higher score)
 * - Category match: 30% weight
 * - Follower count: 20% weight
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
  // 0km = 1.0, maxDistance km = 0.0
  const distanceScore = 1 - params.distance / params.maxDistance;

  // Category score
  const categoryScore = params.categoryMatch ? 1.0 : 0.0;

  // Follower score (logarithmic scale)
  // 0 followers = 0.0, 10k+ followers = 1.0
  const followerScore = Math.min(1.0, Math.log10(params.followerCount + 1) / 4);

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
 *
 * This initiates the matching process and stores the request for tracking
 */
export async function createMatchRequest(query: MatchQuery) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Expire in 24 hours

  const matchRequest = await prisma.matchRequest.create({
    data: {
      userId: query.userId,
      targetRole: query.targetRole,
      maxDistance: query.maxDistance || 3.0,
      category: query.category,
      minFollowers: query.minFollowers,
      status: 'processing',
      expiresAt,
    },
  });

  return matchRequest;
}

/**
 * Store match results in the database
 */
export async function storeMatchResults(
  matchRequestId: string,
  matches: MatchCandidate[]
) {
  // Create match results in batch
  const results = await prisma.matchResult.createMany({
    data: matches.map((match) => ({
      matchRequestId,
      targetUserId: match.id,
      distance: match.distance,
      relevanceScore: match.relevanceScore,
      matchReason: match.matchReason,
      status: 'pending',
    })),
  });

  // Update match request status
  await prisma.matchRequest.update({
    where: { id: matchRequestId },
    data: {
      status: 'completed',
      resultsCount: matches.length,
    },
  });

  return results;
}
