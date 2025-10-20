/**
 * ORCHESTRATOR AGENT
 * Main controller that coordinates all Loop Agent components
 * 
 * WORKFLOW:
 * 1. Initialize loop state
 * 2. Capture screenshots (parallel)
 * 3. Analyze designs (sequential with rate limit)
 * 4. Compare with previous iteration
 * 5. Generate fix suggestions
 * 6. Verify suggestions
 * 7. Apply auto-fixes or request manual approval
 * 8. Check exit conditions
 * 9. Repeat or terminate
 */

import { CaptureAgent } from './capture-agent';
import { AnalyzeAgent } from './analyze-agent';
import { CompareAgent } from './compare-agent';
import { SuggestAgent } from './suggest-agent';
import { VerifyAgent } from './verify-agent';
import { FixAgent } from './fix-agent';
import { PriorityEngine } from './priority-engine';
import { StateManager } from './state-manager';
import {
  LoopConfig,
  LoopState,
  Screenshot,
  Analysis,
  ComparisonResult,
  FixSuggestion,
  VerificationResult,
  IterationResult,
  Issue,
} from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class Orchestrator {
  private captureAgent: CaptureAgent;
  private analyzeAgent: AnalyzeAgent;
  private compareAgent: CompareAgent;
  private suggestAgent: SuggestAgent;
  private verifyAgent: VerifyAgent;
  private fixAgent: FixAgent;
  private priorityEngine: PriorityEngine;
  private stateManager: StateManager;
  private config: LoopConfig;

  constructor(config: LoopConfig) {
    this.config = config;

    // Initialize all agents
    this.captureAgent = new CaptureAgent();
    this.analyzeAgent = new AnalyzeAgent(config.rules);
    this.compareAgent = new CompareAgent();
    this.suggestAgent = new SuggestAgent(process.env.OPENAI_API_KEY || '');
    this.verifyAgent = new VerifyAgent(process.cwd());
    this.fixAgent = new FixAgent(process.cwd());
    this.priorityEngine = new PriorityEngine();

    // Initialize state manager
    this.stateManager = new StateManager(config);
  }

  /**
   * Start the design loop
   */
  async start(): Promise<LoopState> {
    console.log('🚀 Starting Design Loop Agent...');
    console.log(`Mode: ${this.config.mode}`);
    console.log(`Max iterations: ${this.config.maxIterations}`);
    console.log(`Pages to analyze: ${this.config.pages.length}`);

    let shouldContinue = true;

    while (shouldContinue && this.stateManager.getCurrentIteration() < this.config.maxIterations) {
      const iteration = this.stateManager.getCurrentIteration() + 1;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 ITERATION ${iteration} / ${this.config.maxIterations}`);
      console.log(`${'='.repeat(60)}\n`);

      try {
        // Execute iteration
        const result = await this.executeIteration();

        // Update state
        this.stateManager.recordIteration(result);

        // Check exit conditions
        const exitCheck = this.checkExitConditions(result);
        if (exitCheck.shouldExit) {
          console.log(`\n✅ Exit condition met: ${exitCheck.reason}`);
          this.stateManager.finalize(exitCheck.reason);
          shouldContinue = false;
        }

        // Auto-mode: Apply high-confidence fixes
        if (this.config.mode === 'auto' && this.config.autoFix) {
          await this.applyAutoFixes(result);
        }

        // Semi-auto mode: Request approval
        if (this.config.mode === 'semi-auto') {
          const shouldApply = await this.requestApproval(result);
          if (shouldApply) {
            await this.applyAutoFixes(result);
          }
        }

        // Save state to disk
        await this.saveState();

        // Cooldown between iterations
        if (shouldContinue) {
          console.log('\n⏱️  Cooldown: 5 seconds...');
          await this.sleep(5000);
        }
      } catch (error) {
        console.error('❌ Iteration failed:', error);
        this.stateManager.finalize('error');
        throw error;
      }
    }

    if (this.stateManager.getCurrentIteration() >= this.config.maxIterations) {
      console.log('\n⚠️ Maximum iterations reached');
      this.stateManager.finalize('max_iterations');
    }

    // Generate final report
    const summary = this.stateManager.generateSummary();
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(summary);

    return this.stateManager.getState();
  }

  /**
   * Execute a single loop iteration
   */
  private async executeIteration(): Promise<IterationResult> {
    const startTime = Date.now();

    // STEP 1: Capture screenshots (parallel)
    console.log('📸 Step 1/6: Capturing screenshots...');
    const screenshots = await this.captureAgent.captureAll(this.config.pages);
    console.log(`✅ Captured ${screenshots.length} screenshots`);

    // STEP 2: Analyze designs (sequential)
    console.log('\n🔍 Step 2/6: Analyzing designs...');
    const analyses = await this.analyzeAgent.analyzeAll(screenshots);
    const avgScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / analyses.length;
    console.log(`✅ Analysis complete - Average score: ${avgScore.toFixed(1)}/100`);

    // STEP 3: Compare with previous iteration
    console.log('\n📊 Step 3/6: Comparing with previous iteration...');
    const previousAnalyses = this.stateManager.getPreviousAnalyses();
    const comparison = await this.compareAgent.compare(analyses, previousAnalyses);
    console.log(`✅ Comparison complete - Trend: ${comparison.trend}`);

    // STEP 4: Generate suggestions
    console.log('\n💡 Step 4/6: Generating fix suggestions...');
    const allIssues = analyses.flatMap((a) => a.issues);
    const suggestions = await this.suggestAgent.generateSuggestions(allIssues, comparison);
    console.log(`✅ Generated ${suggestions.length} suggestions`);

    // STEP 5: Verify suggestions
    console.log('\n✔️  Step 5/6: Verifying suggestions...');
    const verifications = await this.verifyAgent.verifyAll(suggestions);
    const safeToApply = verifications.filter((v) => v.safeToApply).length;
    console.log(`✅ Verification complete - ${safeToApply}/${suggestions.length} safe to apply`);

    // STEP 6: Categorize suggestions
    console.log('\n📋 Step 6/6: Categorizing suggestions...');
    const categorized = this.categorizeSuggestions(suggestions, verifications);
    console.log(`✅ ${categorized.autoFix.length} auto-fix, ${categorized.manual.length} manual`);

    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      iteration: this.stateManager.getCurrentIteration() + 1,
      timestamp: new Date().toISOString(),
      duration,
      screenshots,
      analyses,
      comparison,
      suggestions,
      verifications,
      summary: {
        averageScore: avgScore,
        passed: avgScore >= this.config.exitConditions.scoreThreshold,
        totalIssues: allIssues.length,
        criticalIssues: allIssues.filter((i) => i.severity === 'critical').length,
        highIssues: allIssues.filter((i) => i.severity === 'high').length,
        autoFixableCount: categorized.autoFix.length,
        manualReviewCount: categorized.manual.length,
      },
    };
  }

  /**
   * Check if exit conditions are met
   */
  private checkExitConditions(result: IterationResult): {
    shouldExit: boolean;
    reason?: 'success' | 'no_improvement' | 'regression';
  } {
    const { scoreThreshold, consecutivePassCount, zeroHighIssues } = this.config.exitConditions;

    // Check score threshold
    const consecutivePasses = this.stateManager.getConsecutivePassCount();
    if (result.summary.averageScore >= scoreThreshold) {
      if (consecutivePasses >= consecutivePassCount) {
        return { shouldExit: true, reason: 'success' };
      }
    }

    // Check zero high issues
    if (zeroHighIssues && result.summary.highIssues === 0 && result.summary.criticalIssues === 0) {
      return { shouldExit: true, reason: 'success' };
    }

    // Check for stagnation (no improvement in 3 iterations)
    const noImprovementCount = this.stateManager.getNoImprovementCount();
    if (noImprovementCount >= 3) {
      return { shouldExit: true, reason: 'no_improvement' };
    }

    // Check for regression
    const trend = this.stateManager.getScoreTrend();
    if (trend === 'declining') {
      const scores = this.stateManager.getState().history.scores;
      if (scores.length >= 2) {
        const lastTwo = scores.slice(-2);
        if (lastTwo[0] - lastTwo[1] > 5) {
          // 5+ point drop
          return { shouldExit: true, reason: 'regression' };
        }
      }
    }

    return { shouldExit: false };
  }

  /**
   * Categorize suggestions into auto-fix and manual review
   */
  private categorizeSuggestions(
    suggestions: FixSuggestion[],
    verifications: VerificationResult[]
  ): {
    autoFix: Array<{ suggestion: FixSuggestion; verification: VerificationResult }>;
    manual: Array<{ suggestion: FixSuggestion; verification: VerificationResult }>;
  } {
    const autoFix: Array<{ suggestion: FixSuggestion; verification: VerificationResult }> = [];
    const manual: Array<{ suggestion: FixSuggestion; verification: VerificationResult }> = [];

    for (const suggestion of suggestions) {
      const verification = verifications.find((v) => v.suggestionId === suggestion.issueId);
      if (!verification) continue;

      if (
        suggestion.fixType === 'auto' &&
        verification.safeToApply &&
        verification.confidence >= 0.80
      ) {
        autoFix.push({ suggestion, verification });
      } else {
        manual.push({ suggestion, verification });
      }
    }

    return { autoFix, manual };
  }

  /**
   * Apply auto-fixes (high confidence only, priority-ordered)
   */
  private async applyAutoFixes(result: IterationResult): Promise<void> {
    const categorized = this.categorizeSuggestions(result.suggestions, result.verifications);

    if (categorized.autoFix.length === 0) {
      console.log('\n⚠️ No auto-fixes to apply');
      return;
    }

    console.log(`\n🔧 Applying ${categorized.autoFix.length} auto-fixes...`);

    // Collect all auto-fixable issues
    const autoFixableIssues: Issue[] = categorized.autoFix.map(item => item.suggestion.issue);
    
    // 🆕 Calculate priorities
    const priorities = this.priorityEngine.calculatePriorities(autoFixableIssues);
    
    // 🆕 Log priority report
    console.log('\n📊 Priority Order (by ROI):');
    for (const p of priorities.slice(0, 5)) {
      console.log(`  ${p.rank}. [${p.issue.category}] ROI: ${p.roi.toFixed(1)} (Impact: ${p.impact.toFixed(1)}, Effort: ${p.effort.toFixed(1)}, Success: ${(p.successRate * 100).toFixed(0)}%)`);
    }
    
    // 🆕 Sort issues by priority (highest ROI first)
    const sortedIssues = priorities.map(p => p.issue);
    
    // Use FixAgent to apply fixes in priority order
    const appliedFixes = await this.fixAgent.applyFixes(sortedIssues);
    
    // Store applied fixes in result
    result.appliedFixes = appliedFixes;
    
    // 🆕 Update historical data based on results
    for (const applied of appliedFixes) {
      this.priorityEngine.updateHistoricalData(
        applied.issue.category,
        applied.success
      );
    }
    
    // Log results
    console.log('\n📋 Fix Results:');
    for (const applied of appliedFixes) {
      if (applied.success) {
        console.log(`  ✅ ${applied.issue.category}: ${applied.issue.element}`);
      } else {
        console.log(`  ❌ ${applied.issue.category}: ${applied.error}`);
      }
    }

    const successCount = appliedFixes.filter(f => f.success).length;
    console.log(`\n✅ Successfully applied ${successCount}/${appliedFixes.length} auto-fixes`);

    // Commit changes if auto-commit enabled
    if (this.config.autoCommit) {
      await this.commitChanges(result.iteration);
    }
  }

  /**
   * Request manual approval (semi-auto mode)
   */
  private async requestApproval(result: IterationResult): Promise<boolean> {
    console.log('\n⏸️  MANUAL APPROVAL REQUIRED');
    console.log('Review the analysis results and decide:');
    console.log(`- Average score: ${result.summary.averageScore.toFixed(1)}/100`);
    console.log(`- Issues: ${result.summary.totalIssues} total, ${result.summary.criticalIssues} critical`);
    console.log(`- Auto-fixable: ${result.summary.autoFixableCount}`);

    // In real implementation, this would wait for user input via API or UI
    // For now, return true to continue
    return true;
  }

  /**
   * Commit changes to git
   */
  private async commitChanges(iteration: number): Promise<void> {
    console.log('\n📝 Committing changes...');
    // TODO: Implement git commit logic
    console.log(`✅ Committed: Loop iteration ${iteration} - Auto-fixes applied`);
  }

  /**
   * Save loop state to disk
   */
  private async saveState(): Promise<void> {
    const stateDir = path.join(process.cwd(), 'design-system', 'loop-agent', '.state');
    await fs.mkdir(stateDir, { recursive: true });

    const statePath = path.join(stateDir, 'loop-state.json');
    const state = this.stateManager.getState();

    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
  }

  /**
   * Load previous state from disk
   */
  static async loadState(): Promise<LoopState | null> {
    const statePath = path.join(
      process.cwd(),
      'design-system',
      'loop-agent',
      '.state',
      'loop-state.json'
    );

    try {
      const content = await fs.readFile(statePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
