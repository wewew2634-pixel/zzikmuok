/**
 * Priority Engine
 * 
 * Calculates ROI (Return on Investment) for each issue
 * to determine optimal fix order
 * 
 * Formula: ROI = (Impact × Success Rate) / Effort
 * 
 * @version 1.0.0
 */

import { Issue } from './types';

export interface IssuePriority {
  issue: Issue;
  impact: number;        // Expected score improvement (0-10)
  effort: number;        // Fix difficulty (1-10, lower is easier)
  successRate: number;   // Historical success rate (0-1)
  roi: number;          // Calculated ROI score
  rank: number;         // Final ranking (1 = highest priority)
}

export interface PriorityConfig {
  // Weight factors for ROI calculation
  weights: {
    impact: number;      // Default: 0.5
    successRate: number; // Default: 0.3
    effort: number;      // Default: 0.2
  };
  
  // Historical success rates by category
  historicalData?: {
    [category: string]: {
      successRate: number;
      avgImpact: number;
      avgEffort: number;
    };
  };
}

export class PriorityEngine {
  private config: PriorityConfig;
  
  constructor(config?: Partial<PriorityConfig>) {
    this.config = {
      weights: {
        impact: 0.5,
        successRate: 0.3,
        effort: 0.2,
        ...config?.weights
      },
      historicalData: config?.historicalData || this.getDefaultHistoricalData()
    };
  }
  
  /**
   * Calculate priorities for all issues
   */
  calculatePriorities(issues: Issue[]): IssuePriority[] {
    const priorities: IssuePriority[] = [];
    
    for (const issue of issues) {
      const impact = this.calculateImpact(issue);
      const effort = this.estimateEffort(issue);
      const successRate = this.getSuccessRate(issue);
      const roi = this.calculateROI(impact, effort, successRate);
      
      priorities.push({
        issue,
        impact,
        effort,
        successRate,
        roi,
        rank: 0  // Will be assigned after sorting
      });
    }
    
    // Sort by ROI (descending)
    priorities.sort((a, b) => b.roi - a.roi);
    
    // Assign ranks
    priorities.forEach((p, index) => {
      p.rank = index + 1;
    });
    
    return priorities;
  }
  
  /**
   * Calculate expected impact (score improvement)
   */
  private calculateImpact(issue: Issue): number {
    // Base impact by severity
    const severityImpact = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 2
    }[issue.severity];
    
    // Category multiplier (from scoring engine weights)
    const categoryMultiplier = {
      color: 1.0,      // 20% weight in scoring
      spacing: 0.75,   // 15% weight
      glass: 0.75,     // 15% weight
      typography: 0.5, // 10% weight
      button: 0.5,     // 10% weight
      animation: 0.5,  // 10% weight
      a11y: 0.8,       // Accessibility important
      shadow: 0.1      // 2% weight
    }[issue.category] || 0.5;
    
    // Scope multiplier (how many elements affected)
    let scopeMultiplier = 1.0;
    if (issue.element.includes('all') || issue.element.includes('global')) {
      scopeMultiplier = 1.5;  // Global changes have higher impact
    }
    
    const impact = severityImpact * categoryMultiplier * scopeMultiplier;
    
    // Normalize to 0-10 scale
    return Math.min(10, Math.max(0, impact));
  }
  
  /**
   * Estimate effort required to fix
   */
  private estimateEffort(issue: Issue): number {
    // Base effort by category (empirical data from testing)
    const categoryEffort = {
      color: 1,        // Simple token replacement (proven: 100% success)
      typography: 2,   // Token or inline style change
      spacing: 3,      // Component-level changes needed
      button: 5,       // Component structure modification
      glass: 4,        // CSS refactoring required
      animation: 3,    // CSS property changes
      a11y: 4,         // Multiple attributes/props
      shadow: 2        // CSS changes
    }[issue.category] || 5;
    
    // Complexity multiplier
    let complexityMultiplier = 1.0;
    
    if (!issue.autoFixable) {
      complexityMultiplier = 2.0;  // Manual fixes are harder
    }
    
    if (issue.element.includes('multiple') || issue.element.includes('all')) {
      complexityMultiplier *= 1.5;  // Multi-file changes harder
    }
    
    const effort = categoryEffort * complexityMultiplier;
    
    // Normalize to 1-10 scale (1 = easiest)
    return Math.min(10, Math.max(1, effort));
  }
  
  /**
   * Get historical success rate for this type of fix
   */
  private getSuccessRate(issue: Issue): number {
    const historical = this.config.historicalData?.[issue.category];
    
    if (historical) {
      return historical.successRate;
    }
    
    // Default: estimate based on autoFixable flag
    return issue.autoFixable ? 0.5 : 0.1;
  }
  
  /**
   * Calculate ROI score
   */
  private calculateROI(impact: number, effort: number, successRate: number): number {
    const weights = this.config.weights;
    
    // Weighted formula
    const roi = (
      (impact * weights.impact) +
      (successRate * 10 * weights.successRate) -
      (effort * weights.effort)
    );
    
    return Math.max(0, roi);
  }
  
  /**
   * Get default historical data from loop testing
   */
  private getDefaultHistoricalData() {
    return {
      color: {
        successRate: 1.0,   // 1/1 fixes succeeded (100%)
        avgImpact: 8.0,     // +1.2 points per fix
        avgEffort: 1.0      // Very easy (token replacement)
      },
      typography: {
        successRate: 0.0,   // 0/2 fixes succeeded (0%)
        avgImpact: 5.0,     // Expected moderate impact
        avgEffort: 2.0      // Easy if pattern found
      },
      glass: {
        successRate: 0.0,   // 0/2 fixes succeeded (0%)
        avgImpact: 6.0,     // Good impact (15% weight)
        avgEffort: 4.0      // Moderate difficulty
      },
      button: {
        successRate: 0.0,   // 0/3 fixes succeeded (0%)
        avgImpact: 6.0,     // Good impact (WCAG)
        avgEffort: 5.0      // High difficulty (component changes)
      },
      spacing: {
        successRate: 0.0,   // Not attempted
        avgImpact: 7.0,     // High impact (15% weight)
        avgEffort: 3.0      // Moderate difficulty
      },
      animation: {
        successRate: 0.0,   // Not attempted
        avgImpact: 5.0,     // Moderate impact
        avgEffort: 3.0      // Moderate difficulty
      },
      a11y: {
        successRate: 0.5,   // Estimated
        avgImpact: 7.0,     // High impact (accessibility)
        avgEffort: 4.0      // Moderate difficulty
      },
      shadow: {
        successRate: 0.3,   // Estimated
        avgImpact: 2.0,     // Low impact (2% weight)
        avgEffort: 2.0      // Easy
      }
    };
  }
  
  /**
   * Update historical data with new results
   */
  updateHistoricalData(category: string, success: boolean, impact?: number) {
    if (!this.config.historicalData) {
      this.config.historicalData = {};
    }
    
    if (!this.config.historicalData[category]) {
      this.config.historicalData[category] = {
        successRate: 0,
        avgImpact: 5,
        avgEffort: 5
      };
    }
    
    const data = this.config.historicalData[category];
    
    // Update success rate (exponential moving average)
    const alpha = 0.3; // Weight for new data
    data.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * data.successRate;
    
    // Update impact if provided
    if (impact !== undefined) {
      data.avgImpact = alpha * impact + (1 - alpha) * data.avgImpact;
    }
  }
  
  /**
   * Get top N priority issues
   */
  getTopPriorities(issues: Issue[], n: number = 5): IssuePriority[] {
    const priorities = this.calculatePriorities(issues);
    return priorities.slice(0, n);
  }
  
  /**
   * Generate priority report
   */
  generateReport(priorities: IssuePriority[]): string {
    let report = '\n📊 PRIORITY ANALYSIS REPORT\n';
    report += '=' .repeat(60) + '\n\n';
    
    report += 'Top Priorities (by ROI):\n\n';
    
    for (const p of priorities.slice(0, 10)) {
      report += `${p.rank}. ${p.issue.category.toUpperCase()} - ${p.issue.element}\n`;
      report += `   ROI: ${p.roi.toFixed(2)} | Impact: ${p.impact.toFixed(1)} | Effort: ${p.effort.toFixed(1)} | Success Rate: ${(p.successRate * 100).toFixed(0)}%\n`;
      report += `   Severity: ${p.issue.severity} | Auto-fix: ${p.issue.autoFixable ? 'Yes' : 'No'}\n`;
      report += `   Issue: ${p.issue.actual.substring(0, 80)}...\n\n`;
    }
    
    // Summary statistics
    const avgROI = priorities.reduce((sum, p) => sum + p.roi, 0) / priorities.length;
    const avgImpact = priorities.reduce((sum, p) => sum + p.impact, 0) / priorities.length;
    const avgEffort = priorities.reduce((sum, p) => sum + p.effort, 0) / priorities.length;
    const avgSuccessRate = priorities.reduce((sum, p) => sum + p.successRate, 0) / priorities.length;
    
    report += '\nSummary:\n';
    report += `- Total Issues: ${priorities.length}\n`;
    report += `- Average ROI: ${avgROI.toFixed(2)}\n`;
    report += `- Average Impact: ${avgImpact.toFixed(1)}/10\n`;
    report += `- Average Effort: ${avgEffort.toFixed(1)}/10\n`;
    report += `- Average Success Rate: ${(avgSuccessRate * 100).toFixed(0)}%\n`;
    
    return report;
  }
}
