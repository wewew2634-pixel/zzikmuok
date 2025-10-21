/**
 * ZZMUK A/B Testing & Experiment Framework
 *
 * Supports:
 * - Pricing experiments (20% vs 22% vs 25% take rates)
 * - Feature flags
 * - Multivariate testing
 *
 * Stop-rule: If 2 cycles show 0% improvement → recommend pivot
 */

export interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate?: Date;
  endDate?: Date;
  successMetric: string; // e.g., 'conversion_rate', 'revenue', 'cac'
  successCriteria: string; // e.g., '>5% improvement'
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // 0.0 to 1.0 (percentage of traffic)
  config: Record<string, any>; // Variant-specific configuration
}

/**
 * Experiment: Pricing Take Rate Test
 *
 * Hypothesis: Higher take rate (25%) maintains conversion with better margins
 * Variants: 20% (control) vs 22% vs 25%
 * Success: Revenue per transaction > +15% with conversion drop < -5%
 */
export const PRICING_EXPERIMENT: Experiment = {
  id: 'pricing-take-rate-2025-01',
  name: 'Take Rate Optimization',
  description: 'Test different platform commission rates',
  hypothesis:
    'Increasing take rate from 20% to 25% will improve revenue without significantly impacting conversion',
  variants: [
    {
      id: 'control',
      name: 'Control (20%)',
      description: 'Current 20% platform fee',
      weight: 0.34,
      config: { takeRate: 0.20 },
    },
    {
      id: 'variant-a',
      name: 'Variant A (22%)',
      description: 'Moderate increase to 22%',
      weight: 0.33,
      config: { takeRate: 0.22 },
    },
    {
      id: 'variant-b',
      name: 'Variant B (25%)',
      description: 'Target take rate of 25%',
      weight: 0.33,
      config: { takeRate: 0.25 },
    },
  ],
  status: 'draft',
  successMetric: 'revenue_per_transaction',
  successCriteria: '>15% improvement, conversion drop <5%',
};

/**
 * Assign a user to an experiment variant
 *
 * Uses deterministic hashing for consistent assignment
 */
export function assignVariant(
  userId: string,
  experiment: Experiment
): ExperimentVariant {
  // Hash user ID to a number between 0 and 1
  const hash = hashString(userId);
  const normalized = hash / 0xffffffff; // Normalize to 0-1

  // Assign to variant based on weights
  let cumulativeWeight = 0;
  for (const variant of experiment.variants) {
    cumulativeWeight += variant.weight;
    if (normalized < cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to last variant (should never happen if weights sum to 1.0)
  return experiment.variants[experiment.variants.length - 1];
}

/**
 * Simple string hash function (FNV-1a)
 */
function hashString(str: string): number {
  let hash = 2166136261; // FNV offset basis

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Get experiment configuration for a user
 *
 * Returns the active experiment variant config
 */
export function getExperimentConfig(
  userId: string,
  experimentId: string
): Record<string, any> | null {
  // In production, fetch experiment from database
  // For now, hardcode pricing experiment
  if (experimentId === PRICING_EXPERIMENT.id) {
    if (PRICING_EXPERIMENT.status !== 'active') {
      return null; // Experiment not active
    }

    const variant = assignVariant(userId, PRICING_EXPERIMENT);
    return variant.config;
  }

  return null;
}

/**
 * Calculate platform fee based on experiment assignment
 *
 * Example usage in transaction creation:
 * const takeRate = getExperimentTakeRate(userId) || 0.20;
 * const platformFee = Math.round(transactionAmount * takeRate);
 */
export function getExperimentTakeRate(userId: string): number {
  const config = getExperimentConfig(userId, PRICING_EXPERIMENT.id);

  if (config && typeof config.takeRate === 'number') {
    return config.takeRate;
  }

  // Default to 20% if no experiment active
  return 0.20;
}

/**
 * Experiment Report Template
 *
 * Use this to generate reports after experiment cycles
 */
export interface ExperimentReport {
  experimentId: string;
  experimentName: string;
  cycleNumber: number;
  startDate: Date;
  endDate: Date;
  variants: {
    id: string;
    name: string;
    metrics: {
      users: number;
      transactions: number;
      revenue: number; // KRW
      conversionRate: number; // %
      avgTransactionValue: number; // KRW
    };
  }[];
  winner: string | null; // Variant ID
  recommendation: 'continue' | 'pivot' | 'scale_winner';
  reasoning: string;
}

/**
 * Analyze experiment results and apply stop-rule
 *
 * Stop-rule: If 2 consecutive cycles show 0% improvement → recommend pivot
 */
export function analyzeExperiment(
  reports: ExperimentReport[]
): {
  shouldContinue: boolean;
  recommendation: string;
} {
  if (reports.length < 2) {
    return {
      shouldContinue: true,
      recommendation: 'Continue experiment - need at least 2 cycles for stop-rule',
    };
  }

  const lastTwoReports = reports.slice(-2);

  // Check if both reports show no improvement (winner is always 'control')
  const noImprovement = lastTwoReports.every(
    (report) => report.winner === 'control' || report.winner === null
  );

  if (noImprovement) {
    return {
      shouldContinue: false,
      recommendation:
        'STOP: 2 consecutive cycles with 0% improvement. Recommend pivot: try different pricing strategy or focus on increasing transaction volume.',
    };
  }

  // Check if we have a consistent winner
  const winners = lastTwoReports.map((r) => r.winner).filter(Boolean);
  if (winners.length === 2 && winners[0] === winners[1]) {
    return {
      shouldContinue: false,
      recommendation: `SCALE: Variant ${winners[0]} consistently outperforms. Recommend scaling to 100% traffic.`,
    };
  }

  return {
    shouldContinue: true,
    recommendation: 'Continue experiment - results inconclusive or mixed',
  };
}
