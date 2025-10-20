/**
 * API Route: Generate Loop Report
 * GET /api/design-loop/report
 * 
 * Generates comprehensive report of loop execution
 */

import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@/../../design-system/loop-agent/orchestrator';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const state = await Orchestrator.loadState();

    if (!state) {
      return NextResponse.json(
        { error: 'No loop data found' },
        { status: 404 }
      );
    }

    // Generate comprehensive report
    const report = {
      id: state.id,
      executionSummary: {
        totalIterations: state.history.iterations.length,
        exitReason: state.exitReason,
        totalDuration: state.history.iterations.reduce((sum, iter) => sum + iter.duration, 0),
        finalScore: state.history.scores[state.history.scores.length - 1] || 0,
        initialScore: state.history.scores[0] || 0,
        improvement: ((state.history.scores[state.history.scores.length - 1] || 0) - 
                     (state.history.scores[0] || 0)),
      },
      
      scoreProgression: {
        scores: state.history.scores,
        trend: this.analyzeTrend(state.history.scores),
        bestScore: Math.max(...state.history.scores),
        worstScore: Math.min(...state.history.scores),
        averageScore: state.history.scores.reduce((a, b) => a + b, 0) / state.history.scores.length,
      },

      improvements: {
        total: state.history.improvements.length,
        byMetric: this.groupByMetric(state.history.improvements),
        topImprovements: state.history.improvements
          .sort((a, b) => b.delta - a.delta)
          .slice(0, 10),
      },

      regressions: {
        total: state.history.regressions.length,
        byMetric: this.groupByMetric(state.history.regressions),
        topRegressions: state.history.regressions
          .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
          .slice(0, 10),
      },

      iterationDetails: state.history.iterations.map(iter => ({
        iteration: iter.iteration,
        timestamp: iter.timestamp,
        duration: iter.duration,
        score: iter.summary.averageScore,
        issues: {
          total: iter.summary.totalIssues,
          critical: iter.summary.criticalIssues,
          high: iter.summary.highIssues,
        },
        fixes: {
          autoFixed: iter.summary.autoFixableCount,
          manualReview: iter.summary.manualReviewCount,
        },
      })),

      issueAnalysis: this.analyzeIssues(state),
    };

    return NextResponse.json(report);

  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: String(error) },
      { status: 500 }
    );
  }
}

function analyzeTrend(scores: number[]): {
  overall: 'improving' | 'declining' | 'stagnant';
  consistency: 'stable' | 'volatile';
} {
  if (scores.length < 2) {
    return { overall: 'stagnant', consistency: 'stable' };
  }

  const first = scores[0];
  const last = scores[scores.length - 1];
  const delta = last - first;

  let overall: 'improving' | 'declining' | 'stagnant';
  if (delta > 5) overall = 'improving';
  else if (delta < -5) overall = 'declining';
  else overall = 'stagnant';

  // Calculate volatility
  const changes = [];
  for (let i = 1; i < scores.length; i++) {
    changes.push(Math.abs(scores[i] - scores[i - 1]));
  }
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const consistency = avgChange > 5 ? 'volatile' : 'stable';

  return { overall, consistency };
}

function groupByMetric(items: Array<{ metric: string; delta: number }>): Record<string, number> {
  const grouped: Record<string, number> = {};
  for (const item of items) {
    grouped[item.metric] = (grouped[item.metric] || 0) + 1;
  }
  return grouped;
}

function analyzeIssues(state: any): {
  totalIssuesDetected: number;
  totalIssuesResolved: number;
  issuesByCategory: Record<string, number>;
  mostCommonIssues: Array<{ category: string; count: number }>;
} {
  const allIssues = state.history.iterations.flatMap((iter: any) =>
    iter.analyses?.flatMap((analysis: any) => analysis.issues || []) || []
  );

  const issuesByCategory: Record<string, number> = {};
  for (const issue of allIssues) {
    issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1;
  }

  const mostCommonIssues = Object.entries(issuesByCategory)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalIssuesDetected: allIssues.length,
    totalIssuesResolved: 0, // TODO: Calculate from comparison results
    issuesByCategory,
    mostCommonIssues,
  };
}
