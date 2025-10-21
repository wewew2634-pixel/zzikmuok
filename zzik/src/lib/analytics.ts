/**
 * ZZMUK Analytics Middleware
 *
 * Tracks key conversion funnel events:
 * - Signup → Match → Payment
 *
 * Metrics:
 * - CAC (Customer Acquisition Cost in KRW)
 * - Conversion Rate (%)
 * - GMV (Gross Merchandise Value in KRW)
 * - ARPU (Average Revenue Per User in KRW)
 *
 * Privacy: GDPR-compliant, minimal PII, user consent required
 */

import { db } from './db';

export type EventType =
  | 'signup'
  | 'login'
  | 'match_request'
  | 'match_accepted'
  | 'checkout_initiated'
  | 'payment_succeeded'
  | 'payment_failed';

export interface AnalyticsEvent {
  userId: string;
  type: EventType;
  metadata?: Record<string, any>;
  provider?: string; // SNS provider if applicable
}

/**
 * Track an analytics event
 *
 * Stores event in user_activities table for funnel analysis
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    await db.query(
      `
      INSERT INTO user_activities (user_id, type, provider, metadata)
      VALUES ($1, $2, $3, $4)
      `,
      [
        event.userId,
        event.type,
        event.provider || null,
        event.metadata ? JSON.stringify(event.metadata) : null,
      ]
    );
  } catch (error) {
    // Don't fail requests if analytics fails
    console.error('[Analytics] Failed to track event:', error);
  }
}

/**
 * Get conversion funnel metrics for a time period
 *
 * Returns:
 * - Signup count
 * - Match request count
 * - Payment succeeded count
 * - Conversion rates
 */
export async function getConversionFunnel(params: {
  startDate: Date;
  endDate: Date;
}): Promise<{
  signups: number;
  matchRequests: number;
  paymentsSucceeded: number;
  conversionRate: {
    signupToMatch: number; // %
    matchToPayment: number; // %
    overall: number; // %
  };
}> {
  const rows = await db.query<{
    event_type: EventType;
    count: string;
  }>(
    `
    SELECT type as event_type, COUNT(*)::TEXT as count
    FROM user_activities
    WHERE created_at BETWEEN $1 AND $2
      AND type IN ('signup', 'match_request', 'payment_succeeded')
    GROUP BY type
    `,
    [params.startDate, params.endDate]
  );

  const counts: Record<EventType, number> = {
    signup: 0,
    match_request: 0,
    payment_succeeded: 0,
    login: 0,
    match_accepted: 0,
    checkout_initiated: 0,
    payment_failed: 0,
  };

  rows.forEach((row) => {
    counts[row.event_type] = parseInt(row.count, 10);
  });

  const signupToMatch =
    counts.signup > 0
      ? (counts.match_request / counts.signup) * 100
      : 0;
  const matchToPayment =
    counts.match_request > 0
      ? (counts.payment_succeeded / counts.match_request) * 100
      : 0;
  const overall =
    counts.signup > 0
      ? (counts.payment_succeeded / counts.signup) * 100
      : 0;

  return {
    signups: counts.signup,
    matchRequests: counts.match_request,
    paymentsSucceeded: counts.payment_succeeded,
    conversionRate: {
      signupToMatch: Math.round(signupToMatch * 100) / 100,
      matchToPayment: Math.round(matchToPayment * 100) / 100,
      overall: Math.round(overall * 100) / 100,
    },
  };
}

/**
 * Calculate GMV (Gross Merchandise Value) for a period
 *
 * Returns total transaction volume in KRW
 */
export async function getGMV(params: {
  startDate: Date;
  endDate: Date;
}): Promise<{
  totalGMV: number; // KRW
  transactionCount: number;
  averageTransactionValue: number; // KRW
}> {
  const rows = await db.query<{
    total_gmv: string;
    transaction_count: string;
  }>(
    `
    SELECT
      COALESCE(SUM(amount), 0)::TEXT as total_gmv,
      COUNT(*)::TEXT as transaction_count
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
      AND status = 'succeeded'
    `,
    [params.startDate, params.endDate]
  );

  const totalGMV = parseInt(rows[0]?.total_gmv || '0', 10);
  const transactionCount = parseInt(rows[0]?.transaction_count || '0', 10);

  return {
    totalGMV,
    transactionCount,
    averageTransactionValue:
      transactionCount > 0
        ? Math.round(totalGMV / transactionCount)
        : 0,
  };
}

/**
 * Calculate CAC (Customer Acquisition Cost)
 *
 * Formula: Total marketing spend / New signups
 * Marketing spend should be tracked separately
 */
export async function getCAC(params: {
  startDate: Date;
  endDate: Date;
  marketingSpendKRW: number;
}): Promise<{
  cac: number; // KRW per customer
  newSignups: number;
  marketingSpend: number; // KRW
}> {
  const rows = await db.query<{
    new_signups: string;
  }>(
    `
    SELECT COUNT(*)::TEXT as new_signups
    FROM user_activities
    WHERE type = 'signup'
      AND created_at BETWEEN $1 AND $2
    `,
    [params.startDate, params.endDate]
  );

  const newSignups = parseInt(rows[0]?.new_signups || '0', 10);
  const cac =
    newSignups > 0
      ? Math.round(params.marketingSpendKRW / newSignups)
      : 0;

  return {
    cac,
    newSignups,
    marketingSpend: params.marketingSpendKRW,
  };
}

/**
 * Get daily report for business metrics
 *
 * Returns comprehensive metrics for a single day
 */
export async function getDailyReport(date: Date): Promise<{
  date: string;
  signups: number;
  matchRequests: number;
  payments: number;
  gmv: number; // KRW
  platformRevenue: number; // KRW (platform fees)
  conversionRate: number; // %
}> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [funnel, gmvData] = await Promise.all([
    getConversionFunnel({ startDate: startOfDay, endDate: endOfDay }),
    getGMV({ startDate: startOfDay, endDate: endOfDay }),
  ]);

  // Get platform revenue (sum of platform fees)
  const revenueRows = await db.query<{
    platform_revenue: string;
  }>(
    `
    SELECT COALESCE(SUM(platform_fee), 0)::TEXT as platform_revenue
    FROM transactions
    WHERE created_at BETWEEN $1 AND $2
      AND status = 'succeeded'
    `,
    [startOfDay, endOfDay]
  );

  const platformRevenue = parseInt(
    revenueRows[0]?.platform_revenue || '0',
    10
  );

  return {
    date: date.toISOString().split('T')[0],
    signups: funnel.signups,
    matchRequests: funnel.matchRequests,
    payments: funnel.paymentsSucceeded,
    gmv: gmvData.totalGMV,
    platformRevenue,
    conversionRate: funnel.conversionRate.overall,
  };
}
