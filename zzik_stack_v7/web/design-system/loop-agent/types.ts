/**
 * Loop Agent System - Type Definitions
 * 
 * @version 1.0.0
 * @updated 2025-10-20
 */

// ============================================
// CONFIGURATION
// ============================================

export interface LoopConfig {
  mode: 'auto' | 'semi-auto' | 'manual';
  maxIterations: number;
  baseUrl: string;
  
  exitConditions: {
    scoreThreshold: number;        // 95 = Pass
    consecutivePassCount: number;  // 2회 연속 Pass
    zeroHighIssues: boolean;       // Critical/High 이슈 0개
  };
  
  autoFix: boolean;                // 자동 수정 활성화
  autoCommit: boolean;             // 자동 커밋 (보통 false)
  
  humanApproval?: {
    required: boolean;
    threshold: number;             // 신뢰도 임계값 (0.8 = 80%)
  };
  
  pages: PageConfig[];
  rules: DesignRules;
}

export interface PageConfig {
  id: string;
  url: string;
  name: string;
  group?: string;
  waitForSelectors?: string[];
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
  };
}

// ============================================
// DESIGN RULES
// ============================================

export interface DesignRules {
  version: string;
  colorPalette: ColorPaletteRules;
  typography: TypographyRules;
  spacing: SpacingRules;
  buttons: ButtonRules;
  glassmorphism: GlassmorphismRules;
  shadows: ShadowRules;
  animations: AnimationRules;
  accessibility: AccessibilityRules;
  informationDensity: InformationDensityRules;
  actionHierarchy: ActionHierarchyRules;
  loopValidation: LoopValidationRules;
}

export interface ColorPaletteRules {
  background: {
    primary: { value: string; tolerance: number; validation?: any };
    [key: string]: any;
  };
  purple: any;
  text: any;
  status: any;
  [key: string]: any;
}

export interface TypographyRules {
  fontFamily: any;
  scale: any;
  validation: any;
}

export interface SpacingRules {
  grid: any;
  scale: any;
  validation: any;
  usage: any;
}

export interface ButtonRules {
  primary: any;
  secondary: any;
  ghost: any;
  validation: any;
}

export interface GlassmorphismRules {
  usage: {
    allowed: string[];
    prohibited: string[];
    reason: string;
  };
  validation: {
    maxUsageCount: number;
    message: string;
  };
  [key: string]: any;
}

export interface ShadowRules {
  philosophy: string;
  allowed: any;
  maxLevels: number;
  validation: any;
}

export interface AnimationRules {
  philosophy: string;
  allowed: any;
  prohibited: any;
  validation: any;
}

export interface AccessibilityRules {
  wcagLevel: string;
  requirements: any;
}

export interface InformationDensityRules {
  goldenRatio: any;
  elementsPerScreen: any;
}

export interface ActionHierarchyRules {
  tier1: any;
  tier2: any;
  tier3: any;
}

export interface LoopValidationRules {
  scoreThresholds: {
    pass: number;
    warning: number;
    fail: number;
  };
  issueSeverity: any;
  autoFixable: any;
}

// ============================================
// SCREENSHOTS
// ============================================

export interface Screenshot {
  pageId: string;
  buffer: Buffer;
  url: string;
  timestamp: number;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
  };
  hash?: string;
  domInfo?: DOMInfo;  // 추가: DOM 분석 데이터
}

// DOM 분석 결과
export interface DOMInfo {
  // 배경색 분석
  backgrounds: Array<{
    selector: string;
    color: string;       // rgb(0, 0, 0)
    hex: string;         // #000000
    isExactBlack: boolean;
  }>;
  
  // 간격 분석
  spacing: Array<{
    selector: string;
    property: 'padding' | 'margin';
    value: string;       // "20px"
    pixels: number;      // 20
    isMultipleOf4: boolean;
  }>;
  
  // 타이포그래피 분석
  typography: Array<{
    selector: string;
    fontSize: number;
    lineHeight: number;
    fontWeight: number;
    isHeading: boolean;
    correctLineHeight: boolean;  // 1.4 for heading, 1.5 for body
  }>;
  
  // 글래스모피즘 분석
  glassmorphism: Array<{
    selector: string;
    backdropFilter: string;
    hasBlur: boolean;
  }>;
  
  // 애니메이션 분석
  animations: Array<{
    selector: string;
    properties: string[];  // ['transform', 'opacity']
    hasInvalidProps: boolean;  // width, height 등 금지된 속성
  }>;
  
  // 버튼 분석
  buttons: Array<{
    selector: string;
    height: number;
    paddingY: number;
    paddingX: number;
    borderRadius: number;
    meetsMinHeight: boolean;  // >= 48px
  }>;
  
  // 통계
  stats: {
    totalElements: number;
    exactBlackCount: number;
    invalidSpacingCount: number;
    glassmorphismCount: number;
    invalidAnimationCount: number;
    smallButtonCount: number;
  };
}

// ============================================
// ANALYSIS
// ============================================

export interface Analysis {
  pageId: string;
  pageName: string;
  overallScore: number;
  passed: boolean;
  issues: Issue[];
  strengths: string[];
  detectedPatterns: DetectedPatterns;
  timestamp: number;
}

export interface Issue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'color' | 'typography' | 'spacing' | 'button' | 'glass' | 'shadow' | 'animation' | 'a11y';
  element: string;
  expected: string;
  actual: string;
  suggestion: string;
  lineNumbers?: number[];
  autoFixable: boolean;
}

export interface DetectedPatterns {
  backgroundColor?: string;
  primaryPurple?: string;
  buttonHeights?: number[];
  spacingUnits?: number[];
  glassUsage?: string[];
  shadowLevels?: number;
  [key: string]: any;
}

// ============================================
// COMPARISON
// ============================================

export interface Comparison {
  isFirstRun: boolean;
  improvements: Improvement[];
  regressions: Regression[];
  newIssues: Issue[];
  resolvedIssues?: Issue[];
  scoreChange?: ScoreChange;
}

export interface Improvement {
  pageId: string;
  scoreIncrease: number;
  resolvedIssues: Issue[];
}

export interface Regression {
  pageId: string;
  scoreDecrease: number;
  newIssues: Issue[];
}

export interface ScoreChange {
  previous: number;
  current: number;
  delta: number;
}

// ============================================
// SUGGESTIONS
// ============================================

export interface Suggestion {
  issue: Issue;
  type: 'auto-fixable' | 'manual';
  fix?: CodeFix;
  guide?: string;
  confidence: number;
}

export interface CodeFix {
  filePath: string;
  oldCode: string;
  newCode: string;
  explanation: string;
}

// Additional types for suggest-agent
export interface FixSuggestion {
  issueId: string;
  issue: Issue;
  fixType: 'auto' | 'manual';
  confidence: number;
  patches: string[];
  reasoning: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  requiresVerification: boolean;
}

export interface ComparisonResult {
  isFirstRun: boolean;
  currentAvgScore: number;
  previousAvgScore?: number;
  trend: 'improving' | 'stagnant' | 'regressing';
  details: {
    improvements: Improvement[];
    regressions: Regression[];
    newIssues: Issue[];
    resolvedIssues: Issue[];
    persistingIssues: Issue[];
  };
}

// ============================================
// VERIFICATION
// ============================================

export interface Verification {
  totalSuggestions: number;
  verified: number;
  failed: number;
  results: VerificationResult[];
}

export interface VerificationResult {
  suggestionId: string;
  success: boolean;
  checks?: {
    syntax: boolean;
    logic: boolean;
    regression: boolean;
  };
  error?: string;
}

// ============================================
// LOOP STATE
// ============================================

export interface LoopState {
  id: string;
  startTime: number;
  currentIteration: number;
  maxIterations: number;
  
  config: LoopConfig;
  rules: DesignRules;
  
  history: {
    iterations: IterationResult[];
    scores: number[];
    improvements: Improvement[];
    regressions: Regression[];
  };
  
  currentAnalysis?: Analysis[];
  currentSuggestions?: Suggestion[];
  
  exitReason?: 'success' | 'max_iterations' | 'no_improvement' | 'regression' | 'manual_stop';
}

export interface IterationResult {
  iteration: number;
  timestamp: number;
  
  screenshots: Screenshot[];
  analysis: Analysis[];
  comparison: Comparison;
  suggestions: Suggestion[];
  verification: Verification;
  
  averageScore: number;
  passRate: number;
  
  appliedFixes: AppliedFix[];
  duration: number;
}

export interface AppliedFix {
  issue: Issue;
  fix: CodeFix;
  success: boolean;
  error?: string;
}

// ============================================
// LOOP RESULT
// ============================================

export interface LoopResult {
  id: string;
  startTime: number;
  endTime: number;
  totalDuration: number;
  
  iterations: number;
  finalScore: number;
  exitReason: string;
  
  initialAnalysis: Analysis[];
  finalAnalysis: Analysis[];
  
  resolvedIssues: Issue[];
  remainingIssues: Issue[];
  
  history: LoopState['history'];
  
  report: {
    summary: string;
    improvements: string[];
    learnings: string[];
    recommendations: string[];
  };
}

// ============================================
// PATTERNS & LEARNING
// ============================================

export interface Pattern {
  type: 'repeating-issue' | 'stagnation' | 'hotspot';
  description: string;
  suggestion: string;
  category?: string;
  frequency?: number;
}

export interface FixSuccessStats {
  category: string;
  successRate: number;
  confidence: number;
}

export interface RuleAdjustment {
  rule: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
}

// ============================================
// HISTORY
// ============================================

export interface LoopHistory {
  iterations: IterationResult[];
}
