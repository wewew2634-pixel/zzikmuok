/**
 * COMPARE AGENT
 * Compares current analysis with previous iteration to detect improvements/regressions
 * 
 * KEY RESPONSIBILITIES:
 * 1. Score trend analysis (improving, declining, stagnant)
 * 2. Issue-level comparison (resolved, new, persisting)
 * 3. Pattern detection (recurring issues, systematic problems)
 * 4. Regression detection (score drops, new critical issues)
 */

import { Analysis, Issue, Improvement, Regression, ComparisonResult } from './types';

export class CompareAgent {
  /**
   * Compare current analysis with previous iteration
   */
  async compare(
    currentAnalyses: Analysis[],
    previousAnalyses: Analysis[] | null
  ): Promise<ComparisonResult> {
    if (!previousAnalyses) {
      return this.generateInitialResult(currentAnalyses);
    }

    const improvements: Improvement[] = [];
    const regressions: Regression[] = [];
    const persistingIssues: Issue[] = [];
    const newIssues: Issue[] = [];
    const resolvedIssues: Issue[] = [];

    for (const currentAnalysis of currentAnalyses) {
      const previousAnalysis = previousAnalyses.find(
        (a) => a.pageId === currentAnalysis.pageId
      );

      if (!previousAnalysis) {
        // New page added
        newIssues.push(...currentAnalysis.issues);
        continue;
      }

      // Score comparison
      const scoreDelta = currentAnalysis.overallScore - previousAnalysis.overallScore;
      
      if (scoreDelta > 0) {
        improvements.push({
          pageId: currentAnalysis.pageId,
          metric: 'overallScore',
          previousValue: previousAnalysis.overallScore,
          currentValue: currentAnalysis.overallScore,
          delta: scoreDelta,
          timestamp: new Date().toISOString(),
        });
      } else if (scoreDelta < 0) {
        regressions.push({
          pageId: currentAnalysis.pageId,
          metric: 'overallScore',
          previousValue: previousAnalysis.overallScore,
          currentValue: currentAnalysis.overallScore,
          delta: scoreDelta,
          timestamp: new Date().toISOString(),
        });
      }

      // Issue-level comparison
      const comparison = this.compareIssues(
        currentAnalysis.issues,
        previousAnalysis.issues
      );

      resolvedIssues.push(...comparison.resolved.map(i => ({ ...i, pageId: currentAnalysis.pageId })));
      newIssues.push(...comparison.new.map(i => ({ ...i, pageId: currentAnalysis.pageId })));
      persistingIssues.push(...comparison.persisting.map(i => ({ ...i, pageId: currentAnalysis.pageId })));
    }

    // Overall scores
    const currentAvgScore = this.calculateAverageScore(currentAnalyses);
    const previousAvgScore = this.calculateAverageScore(previousAnalyses);
    const overallDelta = currentAvgScore - previousAvgScore;

    // Trend analysis
    const trend = this.analyzeTrend(overallDelta);

    return {
      overallDelta,
      currentAvgScore,
      previousAvgScore,
      trend,
      improvements,
      regressions,
      summary: {
        resolvedCount: resolvedIssues.length,
        newIssueCount: newIssues.length,
        persistingCount: persistingIssues.length,
        criticalRegressions: regressions.filter(r => Math.abs(r.delta) >= 5).length,
        significantImprovements: improvements.filter(i => i.delta >= 5).length,
      },
      details: {
        resolvedIssues,
        newIssues,
        persistingIssues,
      },
    };
  }

  /**
   * Compare issue lists to detect resolved, new, and persisting issues
   */
  private compareIssues(
    currentIssues: Issue[],
    previousIssues: Issue[]
  ): {
    resolved: Issue[];
    new: Issue[];
    persisting: Issue[];
  } {
    const resolved: Issue[] = [];
    const newIssues: Issue[] = [];
    const persisting: Issue[] = [];

    // Find resolved issues
    for (const prevIssue of previousIssues) {
      const stillExists = currentIssues.some(
        (curr) => this.isSameIssue(curr, prevIssue)
      );
      if (!stillExists) {
        resolved.push(prevIssue);
      }
    }

    // Find new and persisting issues
    for (const currIssue of currentIssues) {
      const existedBefore = previousIssues.some(
        (prev) => this.isSameIssue(currIssue, prev)
      );
      if (existedBefore) {
        persisting.push(currIssue);
      } else {
        newIssues.push(currIssue);
      }
    }

    return { resolved, new: newIssues, persisting };
  }

  /**
   * Check if two issues are the same (by category, element, and expected value)
   */
  private isSameIssue(issue1: Issue, issue2: Issue): boolean {
    return (
      issue1.category === issue2.category &&
      issue1.element === issue2.element &&
      issue1.expected === issue2.expected
    );
  }

  /**
   * Calculate average score across all pages
   */
  private calculateAverageScore(analyses: Analysis[]): number {
    if (analyses.length === 0) return 0;
    const sum = analyses.reduce((acc, a) => acc + a.overallScore, 0);
    return Math.round((sum / analyses.length) * 10) / 10; // Round to 1 decimal
  }

  /**
   * Analyze trend based on score delta
   */
  private analyzeTrend(
    delta: number
  ): 'improving' | 'declining' | 'stagnant' {
    if (delta > 1) return 'improving';
    if (delta < -1) return 'declining';
    return 'stagnant';
  }

  /**
   * Generate initial result for first iteration (no previous data)
   */
  private generateInitialResult(currentAnalyses: Analysis[]): ComparisonResult {
    const currentAvgScore = this.calculateAverageScore(currentAnalyses);
    const allIssues = currentAnalyses.flatMap(a => 
      a.issues.map(issue => ({ ...issue, pageId: a.pageId }))
    );

    return {
      overallDelta: 0,
      currentAvgScore,
      previousAvgScore: 0,
      trend: 'stagnant',
      improvements: [],
      regressions: [],
      summary: {
        resolvedCount: 0,
        newIssueCount: allIssues.length,
        persistingCount: 0,
        criticalRegressions: 0,
        significantImprovements: 0,
      },
      details: {
        resolvedIssues: [],
        newIssues: allIssues,
        persistingIssues: [],
      },
    };
  }

  /**
   * Detect recurring patterns across multiple iterations
   */
  detectRecurringPatterns(
    comparisonHistory: ComparisonResult[]
  ): {
    recurringIssues: Array<{ issue: Issue; occurrenceCount: number }>;
    systematicProblems: string[];
  } {
    const issueFrequency = new Map<string, { issue: Issue; count: number }>();

    // Count issue occurrences
    for (const comparison of comparisonHistory) {
      for (const issue of comparison.details.persistingIssues) {
        const key = `${issue.category}:${issue.element}`;
        const existing = issueFrequency.get(key);
        if (existing) {
          existing.count++;
        } else {
          issueFrequency.set(key, { issue, count: 1 });
        }
      }
    }

    // Filter recurring issues (appeared in 3+ iterations)
    const recurringIssues = Array.from(issueFrequency.values())
      .filter((item) => item.count >= 3)
      .map((item) => ({
        issue: item.issue,
        occurrenceCount: item.count,
      }))
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount);

    // Detect systematic problems (category appears frequently)
    const categoryFrequency = new Map<string, number>();
    for (const item of issueFrequency.values()) {
      const category = item.issue.category;
      categoryFrequency.set(category, (categoryFrequency.get(category) || 0) + item.count);
    }

    const systematicProblems = Array.from(categoryFrequency.entries())
      .filter(([_, count]) => count >= 5)
      .map(([category]) => category);

    return { recurringIssues, systematicProblems };
  }
}
