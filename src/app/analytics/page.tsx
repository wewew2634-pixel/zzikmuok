'use client';

import React, { useState, useEffect } from 'react';
import {
  P1_BANNER_EXPERIMENT,
  calculateExperimentStats,
  checkStopRule,
  type ExperimentStats,
  type ExperimentVariant,
} from '../../lib/experiments/abtest';
import { trackEvent } from '../../lib/analytics/events';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Record<ExperimentVariant, ExperimentStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [consecutiveDaysBelow, setConsecutiveDaysBelow] = useState(0);
  const [stopRuleTriggered, setStopRuleTriggered] = useState(false);

  useEffect(() => {
    // Track page view
    trackEvent('analytics_dashboard_viewed', {
      experiment_id: P1_BANNER_EXPERIMENT.experimentId,
    });

    // Fetch experiment data
    const fetchExperimentData = async () => {
      try {
        // In production: fetch from API
        // const response = await fetch('/api/experiments/p1-banner-vs-toast-2025-10');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockEvents = [
          // Control group (Toast)
          { userId: 'user1', variant: 'control' as ExperimentVariant, eventType: 'conversion' as const, timestamp: '2025-10-17T10:00:00Z' },
          { userId: 'user2', variant: 'control' as ExperimentVariant, eventType: 'rejection' as const, timestamp: '2025-10-17T11:00:00Z' },
          { userId: 'user3', variant: 'control' as ExperimentVariant, eventType: 'conversion' as const, timestamp: '2025-10-17T12:00:00Z' },
          { userId: 'user4', variant: 'control' as ExperimentVariant, eventType: 'churn' as const, timestamp: '2025-10-17T13:00:00Z' },
          { userId: 'user5', variant: 'control' as ExperimentVariant, eventType: 'conversion' as const, timestamp: '2025-10-17T14:00:00Z' },
          
          // Treatment group (Banner)
          { userId: 'user6', variant: 'treatment' as ExperimentVariant, eventType: 'conversion' as const, timestamp: '2025-10-17T10:00:00Z' },
          { userId: 'user6', variant: 'treatment' as ExperimentVariant, eventType: 'banner_click' as const, timestamp: '2025-10-17T10:05:00Z' },
          { userId: 'user7', variant: 'treatment' as ExperimentVariant, eventType: 'conversion' as const, timestamp: '2025-10-17T11:00:00Z' },
          { userId: 'user7', variant: 'treatment' as ExperimentVariant, eventType: 'banner_click' as const, timestamp: '2025-10-17T11:02:00Z' },
          { userId: 'user8', variant: 'treatment' as ExperimentVariant, eventType: 'conversion' as const, timestamp: '2025-10-17T12:00:00Z' },
          { userId: 'user8', variant: 'treatment' as ExperimentVariant, eventType: 'banner_click' as const, timestamp: '2025-10-17T12:01:00Z' },
          { userId: 'user9', variant: 'treatment' as ExperimentVariant, eventType: 'conversion' as const, timestamp: '2025-10-17T13:00:00Z' },
          { userId: 'user9', variant: 'treatment' as ExperimentVariant, eventType: 'banner_click' as const, timestamp: '2025-10-17T13:03:00Z' },
          { userId: 'user10', variant: 'treatment' as ExperimentVariant, eventType: 'rejection' as const, timestamp: '2025-10-17T14:00:00Z' },
        ];

        const calculatedStats = calculateExperimentStats(mockEvents);
        setStats(calculatedStats);

        // Check stop rule
        const shouldStop = checkStopRule(calculatedStats, consecutiveDaysBelow);
        setStopRuleTriggered(shouldStop);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch experiment data:', error);
        setLoading(false);
      }
    };

    fetchExperimentData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchExperimentData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [consecutiveDaysBelow]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-on-surface-variant">No experiment data available</p>
      </div>
    );
  }

  const improvement = stats.treatment.conversionRate - stats.control.conversionRate;
  const improvementPercentage = stats.control.conversionRate > 0
    ? ((improvement / stats.control.conversionRate) * 100).toFixed(1)
    : 'N/A';

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">A/B Test Analytics</h1>
      <p className="text-on-surface-variant mb-6">
        {P1_BANNER_EXPERIMENT.name} | {P1_BANNER_EXPERIMENT.startDate} ~ {P1_BANNER_EXPERIMENT.endDate}
      </p>

      {/* Stop Rule Alert */}
      {stopRuleTriggered && (
        <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2">⚠️ Stop Rule Triggered</h3>
          <p>
            Improvement &lt; 5%p for 2 consecutive days. Consider pausing experiment and investigating.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Conversion Rate */}
        <div className="bg-surface-container rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-on-surface-variant mb-2">Conversion Rate Improvement</h3>
          <p className={`text-3xl font-bold ${improvement >= 4 ? 'text-green-600' : 'text-orange-600'}`}>
            {improvement >= 0 ? '+' : ''}{improvement.toFixed(2)}%p
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            ({improvementPercentage}% relative) | Target: +4-9%p
          </p>
        </div>

        {/* Banner Click Rate */}
        <div className="bg-surface-container rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-on-surface-variant mb-2">Banner Click Rate</h3>
          <p className={`text-3xl font-bold ${stats.treatment.bannerClickRate >= 35 ? 'text-green-600' : 'text-orange-600'}`}>
            {stats.treatment.bannerClickRate.toFixed(1)}%
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            Target: ≥35%
          </p>
        </div>

        {/* Rejection Rate Change */}
        <div className="bg-surface-container rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-on-surface-variant mb-2">Rejection Rate Change</h3>
          <p className={`text-3xl font-bold ${
            stats.treatment.rejectionRate < stats.control.rejectionRate ? 'text-green-600' : 'text-orange-600'
          }`}>
            {stats.treatment.rejectionRate - stats.control.rejectionRate >= 0 ? '+' : ''}
            {(stats.treatment.rejectionRate - stats.control.rejectionRate).toFixed(2)}%p
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            Target: -5-10%p
          </p>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-surface-container rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Comparison</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 font-medium text-on-surface">Metric</th>
                <th className="py-3 px-4 font-medium text-on-surface">Control (Toast)</th>
                <th className="py-3 px-4 font-medium text-on-surface">Treatment (Banner)</th>
                <th className="py-3 px-4 font-medium text-on-surface">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-3 px-4 text-on-surface-variant">Users</td>
                <td className="py-3 px-4">{stats.control.users}</td>
                <td className="py-3 px-4">{stats.treatment.users}</td>
                <td className="py-3 px-4">
                  {stats.treatment.users - stats.control.users >= 0 ? '+' : ''}
                  {stats.treatment.users - stats.control.users}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-on-surface-variant">Conversions</td>
                <td className="py-3 px-4">{stats.control.conversions}</td>
                <td className="py-3 px-4">{stats.treatment.conversions}</td>
                <td className="py-3 px-4">
                  {stats.treatment.conversions - stats.control.conversions >= 0 ? '+' : ''}
                  {stats.treatment.conversions - stats.control.conversions}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-on-surface-variant">Conversion Rate</td>
                <td className="py-3 px-4">{stats.control.conversionRate.toFixed(2)}%</td>
                <td className="py-3 px-4">{stats.treatment.conversionRate.toFixed(2)}%</td>
                <td className={`py-3 px-4 font-medium ${improvement >= 4 ? 'text-green-600' : 'text-orange-600'}`}>
                  {improvement >= 0 ? '+' : ''}{improvement.toFixed(2)}%p
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-on-surface-variant">Banner Clicks</td>
                <td className="py-3 px-4">N/A</td>
                <td className="py-3 px-4">{stats.treatment.bannerClicks}</td>
                <td className="py-3 px-4">-</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-on-surface-variant">Banner Click Rate</td>
                <td className="py-3 px-4">N/A</td>
                <td className="py-3 px-4">{stats.treatment.bannerClickRate.toFixed(2)}%</td>
                <td className="py-3 px-4">-</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-on-surface-variant">Rejections</td>
                <td className="py-3 px-4">{stats.control.rejections}</td>
                <td className="py-3 px-4">{stats.treatment.rejections}</td>
                <td className="py-3 px-4">
                  {stats.treatment.rejections - stats.control.rejections >= 0 ? '+' : ''}
                  {stats.treatment.rejections - stats.control.rejections}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-on-surface-variant">Rejection Rate</td>
                <td className="py-3 px-4">{stats.control.rejectionRate.toFixed(2)}%</td>
                <td className="py-3 px-4">{stats.treatment.rejectionRate.toFixed(2)}%</td>
                <td className={`py-3 px-4 font-medium ${
                  stats.treatment.rejectionRate < stats.control.rejectionRate ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {stats.treatment.rejectionRate - stats.control.rejectionRate >= 0 ? '+' : ''}
                  {(stats.treatment.rejectionRate - stats.control.rejectionRate).toFixed(2)}%p
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-on-surface-variant">Churn Events</td>
                <td className="py-3 px-4">{stats.control.churnEvents}</td>
                <td className="py-3 px-4">{stats.treatment.churnEvents}</td>
                <td className="py-3 px-4">
                  {stats.treatment.churnEvents - stats.control.churnEvents >= 0 ? '+' : ''}
                  {stats.treatment.churnEvents - stats.control.churnEvents}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-on-surface-variant">Churn Rate</td>
                <td className="py-3 px-4">{stats.control.churnRate.toFixed(2)}%</td>
                <td className="py-3 px-4">{stats.treatment.churnRate.toFixed(2)}%</td>
                <td className={`py-3 px-4 font-medium ${
                  stats.treatment.churnRate < stats.control.churnRate ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {stats.treatment.churnRate - stats.control.churnRate >= 0 ? '+' : ''}
                  {(stats.treatment.churnRate - stats.control.churnRate).toFixed(2)}%p
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Targets */}
      <div className="mt-6 bg-surface-container rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">KPI Targets</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Conversion Rate</span>
            <span className={`font-medium ${improvement >= 4 && improvement <= 9 ? 'text-green-600' : 'text-orange-600'}`}>
              Target: +4-9%p | Current: {improvement >= 0 ? '+' : ''}{improvement.toFixed(2)}%p
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Banner Click Rate</span>
            <span className={`font-medium ${stats.treatment.bannerClickRate >= 35 ? 'text-green-600' : 'text-orange-600'}`}>
              Target: ≥35% | Current: {stats.treatment.bannerClickRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Rejection Rate Reduction</span>
            <span className={`font-medium ${
              (stats.control.rejectionRate - stats.treatment.rejectionRate) >= 5 &&
              (stats.control.rejectionRate - stats.treatment.rejectionRate) <= 10
                ? 'text-green-600'
                : 'text-orange-600'
            }`}>
              Target: -5-10%p | Current: {(stats.control.rejectionRate - stats.treatment.rejectionRate).toFixed(2)}%p
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant">Churn Rate Reduction</span>
            <span className={`font-medium ${
              (stats.control.churnRate - stats.treatment.churnRate) >= 5 &&
              (stats.control.churnRate - stats.treatment.churnRate) <= 10
                ? 'text-green-600'
                : 'text-orange-600'
            }`}>
              Target: -5-10%p | Current: {(stats.control.churnRate - stats.treatment.churnRate).toFixed(2)}%p
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
