/**
 * Loop Agent - State Manager
 * 
 * Manages loop state, history, and persistence
 * 
 * @version 1.0.0
 */

import { 
  LoopState, 
  LoopConfig, 
  IterationResult,
  Analysis,
  Suggestion,
  Comparison
} from './types';

export class StateManager {
  private state: LoopState;
  
  constructor(config: LoopConfig) {
    this.state = this.initializeState(config);
  }
  
  private initializeState(config: LoopConfig): LoopState {
    return {
      id: this.generateId(),
      startTime: Date.now(),
      currentIteration: 0,
      maxIterations: config.maxIterations,
      config,
      rules: config.rules,
      history: {
        iterations: [],
        scores: [],
        improvements: [],
        regressions: []
      }
    };
  }
  
  private generateId(): string {
    return `loop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // ============================================
  // GETTERS
  // ============================================
  
  getState(): LoopState {
    return { ...this.state };
  }
  
  getCurrentIteration(): number {
    return this.state.currentIteration;
  }
  
  getHistory(): LoopState['history'] {
    return this.state.history;
  }
  
  getLastIteration(): IterationResult | undefined {
    return this.state.history.iterations[this.state.history.iterations.length - 1];
  }
  
  getLastAnalysis(): Analysis[] | undefined {
    const lastIteration = this.getLastIteration();
    return lastIteration?.analysis;
  }
  
  // ============================================
  // SETTERS
  // ============================================
  
  incrementIteration(): void {
    this.state.currentIteration++;
  }
  
  setCurrentAnalysis(analysis: Analysis[]): void {
    this.state.currentAnalysis = analysis;
  }
  
  setCurrentSuggestions(suggestions: Suggestion[]): void {
    this.state.currentSuggestions = suggestions;
  }
  
  setExitReason(reason: LoopState['exitReason']): void {
    this.state.exitReason = reason;
  }
  
  finalize(reason: LoopState['exitReason']): void {
    this.state.exitReason = reason;
    this.state.endTime = Date.now();
  }
  
  // ============================================
  // HISTORY
  // ============================================
  
  addIteration(iteration: IterationResult): void {
    this.state.history.iterations.push(iteration);
    this.state.history.scores.push(iteration.summary.averageScore);
    
    // Store improvements
    if (iteration.comparison?.improvements && iteration.comparison.improvements.length > 0) {
      this.state.history.improvements.push(...iteration.comparison.improvements);
    }
    
    // Store regressions
    if (iteration.comparison?.regressions && iteration.comparison.regressions.length > 0) {
      this.state.history.regressions.push(...iteration.comparison.regressions);
    }
  }
  
  recordIteration(result: IterationResult): void {
    this.addIteration(result);
    this.incrementIteration();
  }
  
  getPreviousAnalyses(): Analysis[] | null {
    const lastIteration = this.getLastIteration();
    return lastIteration?.analyses || null;
  }
  
  // ============================================
  // ANALYSIS
  // ============================================
  
  getAverageScore(): number {
    if (this.state.history.scores.length === 0) return 0;
    return this.state.history.scores.reduce((a, b) => a + b, 0) / this.state.history.scores.length;
  }
  
  getScoreTrend(): 'improving' | 'declining' | 'stagnant' | 'unknown' {
    const scores = this.state.history.scores;
    if (scores.length < 2) return 'unknown';
    
    const lastThree = scores.slice(-3);
    if (lastThree.length < 2) return 'unknown';
    
    const isImproving = lastThree.every((score, i) => 
      i === 0 || score >= lastThree[i - 1]
    );
    
    const isDeclining = lastThree.every((score, i) =>
      i === 0 || score <= lastThree[i - 1]
    );
    
    if (isImproving && lastThree[lastThree.length - 1] > lastThree[0]) {
      return 'improving';
    }
    
    if (isDeclining && lastThree[lastThree.length - 1] < lastThree[0]) {
      return 'declining';
    }
    
    return 'stagnant';
  }
  
  hasImprovement(): boolean {
    const scores = this.state.history.scores;
    if (scores.length < 2) return false;
    
    return scores[scores.length - 1] > scores[scores.length - 2];
  }
  
  getConsecutivePassCount(): number {
    const iterations = this.state.history.iterations;
    if (iterations.length === 0) return 0;
    
    let count = 0;
    for (let i = iterations.length - 1; i >= 0; i--) {
      if (iterations[i].averageScore >= this.state.config.exitConditions.scoreThreshold) {
        count++;
      } else {
        break;
      }
    }
    
    return count;
  }
  
  getNoImprovementCount(): number {
    const scores = this.state.history.scores;
    if (scores.length < 2) return 0;
    
    let count = 0;
    for (let i = scores.length - 1; i > 0; i--) {
      if (Math.abs(scores[i] - scores[i - 1]) < 1) { // Less than 1 point change
        count++;
      } else {
        break;
      }
    }
    
    return count;
  }
  
  // ============================================
  // PERSISTENCE (Optional - Future enhancement)
  // ============================================
  
  serialize(): string {
    return JSON.stringify(this.state, null, 2);
  }
  
  static deserialize(data: string): LoopState {
    return JSON.parse(data);
  }
  
  async saveToFile(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, this.serialize(), 'utf-8');
  }
  
  static async loadFromFile(filePath: string): Promise<LoopState> {
    const fs = await import('fs/promises');
    const data = await fs.readFile(filePath, 'utf-8');
    return StateManager.deserialize(data);
  }
  
  // ============================================
  // REPORTING
  // ============================================
  
  generateSummary(): string {
    const iterations = this.state.history.iterations.length;
    const avgScore = this.getAverageScore().toFixed(1);
    const trend = this.getScoreTrend();
    const improvements = this.state.history.improvements.length;
    const regressions = this.state.history.regressions.length;
    
    return `
Loop Summary:
- Iterations: ${iterations}
- Average Score: ${avgScore}
- Trend: ${trend}
- Improvements: ${improvements}
- Regressions: ${regressions}
- Exit Reason: ${this.state.exitReason || 'In progress'}
    `.trim();
  }
}
