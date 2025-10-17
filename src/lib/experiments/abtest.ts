/**
 * A/B Test Configuration
 * 
 * P1 Banner vs Toast Experiment
 * - Duration: 7 days
 * - Split: 50/50
 * - KPIs: 
 *   - Conversion rate: +4-9%p
 *   - Churn rate: -5-10%
 *   - Rejection rate: -5-10%
 *   - Banner click rate: ≥35%
 */

export type ExperimentVariant = 'control' | 'treatment';

export interface ABTestConfig {
  experimentId: string;
  name: string;
  startDate: string;
  endDate: string;
  variants: {
    control: {
      name: string;
      weight: number;
      description: string;
    };
    treatment: {
      name: string;
      weight: number;
      description: string;
    };
  };
  kpis: {
    primary: string[];
    secondary: string[];
  };
  stopRule: string;
}

export const P1_BANNER_EXPERIMENT: ABTestConfig = {
  experimentId: 'p1-banner-vs-toast-2025-10',
  name: 'P1 Banner vs Toast Notification',
  startDate: '2025-10-17',
  endDate: '2025-10-24', // 7 days
  variants: {
    control: {
      name: 'Toast Notification',
      weight: 0.5,
      description: 'Transient toast notifications (current implementation)',
    },
    treatment: {
      name: 'Persistent Banner',
      weight: 0.5,
      description: 'Sticky banner with action buttons',
    },
  },
  kpis: {
    primary: [
      'conversion_rate',      // Target: +4-9%p
      'churn_rate',           // Target: -5-10%
      'rejection_rate',       // Target: -5-10%
    ],
    secondary: [
      'banner_click_rate',    // Target: ≥35%
      'guideline_open_rate',
      'time_to_resolution',
      'user_satisfaction',
    ],
  },
  stopRule: 'If improvement < 5%p for 2 consecutive days, pause experiment',
};

/**
 * Assign user to experiment variant
 * Uses consistent hashing based on user ID
 */
export function getExperimentVariant(userId: string, experimentId: string): ExperimentVariant {
  // Simple hash function for consistent assignment
  const hash = Array.from(userId + experimentId).reduce(
    (acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0,
    0
  );
  
  // 50/50 split
  return Math.abs(hash) % 2 === 0 ? 'control' : 'treatment';
}

/**
 * Check if user is in treatment group (should see banners)
 */
export function shouldUseBanner(userId: string): boolean {
  return getExperimentVariant(userId, P1_BANNER_EXPERIMENT.experimentId) === 'treatment';
}

/**
 * Track experiment exposure
 */
export function trackExperimentExposure(
  userId: string,
  experimentId: string,
  variant: ExperimentVariant
): void {
  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('experiment_exposed', {
      user_id: userId,
      experiment_id: experimentId,
      variant,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Log for debugging
  console.log('[A/B Test] User exposed:', {
    userId,
    experimentId,
    variant,
  });
}

/**
 * Calculate experiment statistics
 */
export interface ExperimentStats {
  variant: ExperimentVariant;
  users: number;
  conversions: number;
  conversionRate: number;
  bannerClicks: number;
  bannerClickRate: number;
  rejections: number;
  rejectionRate: number;
  churnEvents: number;
  churnRate: number;
}

export function calculateExperimentStats(
  events: Array<{
    userId: string;
    variant: ExperimentVariant;
    eventType: 'conversion' | 'banner_click' | 'rejection' | 'churn';
    timestamp: string;
  }>
): Record<ExperimentVariant, ExperimentStats> {
  const stats: Record<ExperimentVariant, ExperimentStats> = {
    control: {
      variant: 'control',
      users: 0,
      conversions: 0,
      conversionRate: 0,
      bannerClicks: 0,
      bannerClickRate: 0,
      rejections: 0,
      rejectionRate: 0,
      churnEvents: 0,
      churnRate: 0,
    },
    treatment: {
      variant: 'treatment',
      users: 0,
      conversions: 0,
      conversionRate: 0,
      bannerClicks: 0,
      bannerClickRate: 0,
      rejections: 0,
      rejectionRate: 0,
      churnEvents: 0,
      churnRate: 0,
    },
  };

  // Count unique users per variant
  const uniqueUsers = new Set<string>();
  events.forEach((event) => {
    uniqueUsers.add(`${event.variant}:${event.userId}`);
  });
  
  stats.control.users = Array.from(uniqueUsers).filter((u) => u.startsWith('control:')).length;
  stats.treatment.users = Array.from(uniqueUsers).filter((u) => u.startsWith('treatment:')).length;

  // Aggregate events
  events.forEach((event) => {
    const variantStats = stats[event.variant];
    
    switch (event.eventType) {
      case 'conversion':
        variantStats.conversions++;
        break;
      case 'banner_click':
        variantStats.bannerClicks++;
        break;
      case 'rejection':
        variantStats.rejections++;
        break;
      case 'churn':
        variantStats.churnEvents++;
        break;
    }
  });

  // Calculate rates
  ['control', 'treatment'].forEach((variant) => {
    const v = variant as ExperimentVariant;
    const s = stats[v];
    
    if (s.users > 0) {
      s.conversionRate = (s.conversions / s.users) * 100;
      s.bannerClickRate = (s.bannerClicks / s.users) * 100;
      s.rejectionRate = (s.rejections / s.users) * 100;
      s.churnRate = (s.churnEvents / s.users) * 100;
    }
  });

  return stats;
}

/**
 * Check if stop rule is triggered
 */
export function checkStopRule(
  stats: Record<ExperimentVariant, ExperimentStats>,
  consecutiveDaysBelowThreshold: number
): boolean {
  const improvement = stats.treatment.conversionRate - stats.control.conversionRate;
  
  // Stop if improvement < 5%p for 2 consecutive days
  if (improvement < 5.0 && consecutiveDaysBelowThreshold >= 2) {
    console.warn('[A/B Test] Stop rule triggered: improvement < 5%p for 2 consecutive days');
    return true;
  }
  
  return false;
}
