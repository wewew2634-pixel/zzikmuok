/**
 * Loop Agent - Analyze Agent
 * 
 * Analyzes screenshots using GPT-4o Vision API
 * Nano-particle level design validation
 * 
 * @version 1.0.0
 */

import OpenAI from 'openai';
import { Screenshot, Analysis, DesignRules, Issue } from './types';
import { ScoringEngine } from './scoring-engine';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class AnalyzeAgent {
  private rules: DesignRules;
  private scoringEngine: ScoringEngine;
  
  constructor(rules: DesignRules) {
    this.rules = rules;
    this.scoringEngine = new ScoringEngine();
  }
  
  /**
   * Analyze all screenshots (sequential for rate limit)
   */
  async analyzeAll(screenshots: Screenshot[]): Promise<Analysis[]> {
    console.log(`🔍 Analyzing ${screenshots.length} screenshots...`);
    
    const analyses: Analysis[] = [];
    
    for (const screenshot of screenshots) {
      const analysis = await this.analyzeScreenshot(screenshot);
      analyses.push(analysis);
      
      console.log(`  ✅ ${analysis.pageName}: ${analysis.overallScore}/100 (${analysis.issues.length} issues)`);
      
      // Rate limit: 60 requests/minute = 1/second
      await this.sleep(1000);
    }
    
    return analyses;
  }
  
  /**
   * Analyze single screenshot with DOM-based scoring
   * GPT-4o Vision only for qualitative descriptions (optional)
   */
  async analyzeScreenshot(screenshot: Screenshot): Promise<Analysis> {
    try {
      // 🆕 USE DOM-BASED SCORING if available (deterministic)
      if (screenshot.domInfo) {
        console.log(`  📊 Using DOM-based scoring for ${screenshot.pageId}`);
        
        const scoringResult = this.scoringEngine.calculateScore(screenshot.domInfo, screenshot.pageId);
        
        // Optional: Get qualitative descriptions from GPT-4o
        let gptStrengths: string[] = [];
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Provide 3-5 brief bullet points about what's GOOD in this UI design (strengths only, no criticisms). Focus on visual polish and user experience.`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/png;base64,${screenshot.buffer.toString('base64')}`,
                      detail: 'low'  // Save tokens
                    }
                  }
                ]
              }
            ],
            max_tokens: 300,
            temperature: 0.3
          });
          
          const content = response.choices[0].message.content;
          if (content) {
            gptStrengths = content.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.replace(/^[-•]\s*/, '').trim());
          }
        } catch (error) {
          console.warn(`  ⚠️  GPT-4o description failed, using DOM data only`);
        }
        
        // Build strengths from rule breakdown
        const domStrengths = scoringResult.breakdown
          .filter(b => b.passed && b.score >= 90)
          .map(b => `✓ ${b.rule}: ${b.details}`);
        
        // Combine strengths
        const allStrengths = [...domStrengths, ...gptStrengths].slice(0, 8);
        
        // Return DOM-based analysis (DETERMINISTIC)
        return {
          pageId: screenshot.pageId,
          pageName: screenshot.pageId,
          overallScore: scoringResult.overallScore,
          passed: scoringResult.overallScore >= 95,
          issues: scoringResult.issues.map((issue, idx) => ({
            id: `${screenshot.pageId}-dom-${idx}`,
            severity: issue.severity,
            category: issue.category as any,
            element: 'Detected via DOM analysis',
            expected: 'Compliance with Linear 2025 rules',
            actual: issue.message,
            suggestion: issue.message,
            autoFixable: issue.autoFixable
          })),
          strengths: allStrengths,
          detectedPatterns: {
            backgroundColor: '#000000',
            glassmorphismCount: screenshot.domInfo.stats.glassmorphismCount,
            exactBlackCount: screenshot.domInfo.stats.exactBlackCount,
            invalidSpacingCount: screenshot.domInfo.stats.invalidSpacingCount,
            invalidAnimationCount: screenshot.domInfo.stats.invalidAnimationCount,
            smallButtonCount: screenshot.domInfo.stats.smallButtonCount
          },
          timestamp: Date.now()
        };
      }
      
      // FALLBACK: GPT-4o Vision (only if no DOM data - shouldn't happen)
      console.warn(`  ⚠️  No DOM data for ${screenshot.pageId}, falling back to GPT-4o Vision`);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt()
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: this.buildAnalysisPrompt(screenshot)
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${screenshot.buffer.toString('base64')}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,  // Deterministic
        response_format: { type: 'json_object' }
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from GPT-4o');
      }
      
      const result = JSON.parse(content);
      
      return {
        pageId: screenshot.pageId,
        pageName: result.pageName || screenshot.pageId,
        overallScore: result.overallScore || 0,
        passed: result.passed || false,
        issues: result.issues || [],
        strengths: result.strengths || [],
        detectedPatterns: result.detectedPatterns || {},
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error(`❌ Analysis failed for ${screenshot.pageId}:`, error);
      
      // Return minimal analysis on error
      return {
        pageId: screenshot.pageId,
        pageName: screenshot.pageId,
        overallScore: 0,
        passed: false,
        issues: [{
          id: 'analysis-error',
          severity: 'critical',
          category: 'color',
          element: 'Page',
          expected: 'Successful analysis',
          actual: 'Analysis failed',
          suggestion: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          autoFixable: false
        }],
        strengths: [],
        detectedPatterns: {},
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Build system prompt with validation rules
   */
  private buildSystemPrompt(): string {
    return `You are a NANO-LEVEL design reviewer for production-grade UI based on Linear mobile dark theme.

VALIDATION RULES:
${JSON.stringify(this.rules, null, 2)}

FOCUS AREAS (나노입자급 검증):

1. Color Palette Precision
   - Background: EXACTLY #000000 (NOT #010101, NOT #0a0a0f)
   - Surface: #1A1A1A for cards/modals
   - Purple: #8B5CF6 → #7C3AED gradient
   - Text: #FFFFFF primary, rgba(255,255,255,0.7) secondary

2. Typography Micro-Details
   - Heading line-height: 1.4 (NOT 1.5)
   - Body line-height: 1.5
   - Interactive min-height: 44px (WCAG)
   - Font size ≥ 16px for inputs (iOS zoom prevention)

3. Spacing Precision (8pt grid)
   - ALL spacing must be multiples of 4px
   - Check: 12px, 16px, 20px, 24px ✅
   - NEVER: 15px, 18px, 22px ❌

4. Button Visual Weight
   - Primary: 100% (purple gradient + shadow)
   - Secondary: 40% (gray background)
   - Ghost: 20% (icon only)

5. Glassmorphism Usage (CRITICAL)
   - ONLY allowed on: bottom navigation
   - PROHIBITED on: cards, modals, buttons
   - Max per screen: 1 (strictly enforced)

6. Shadow Minimalism
   - Prefer borders over shadows
   - Max 2-3 shadow levels only

7. Animation Restraint
   - ONLY: transform, opacity (NOT width/height/top/left)
   - Max duration: 300ms

8. Accessibility (WCAG AA)
   - Text contrast ≥ 4.5:1
   - Touch targets ≥ 44x44px
   - Reduced motion support

OUTPUT FORMAT (JSON):
{
  "pageName": "string",
  "overallScore": 0-100,
  "passed": boolean,
  "issues": [
    {
      "id": "unique-id",
      "severity": "critical" | "high" | "medium" | "low",
      "category": "color" | "typography" | "spacing" | "button" | "glass" | "shadow" | "animation" | "a11y",
      "element": "CSS selector or description",
      "expected": "Expected value/behavior",
      "actual": "What was detected",
      "suggestion": "Specific fix recommendation with code",
      "lineNumbers": [estimated line numbers],
      "autoFixable": boolean
    }
  ],
  "strengths": ["What's good about this page"],
  "detectedPatterns": {
    "backgroundColor": "#000000",
    "primaryPurple": "#8B5CF6",
    "buttonHeights": [48, 52],
    "spacingUnits": [12, 16, 20, 24],
    "glassUsage": ["bottom-nav"],
    "shadowLevels": 2
  }
}

SCORING GUIDE:
- 95-100: Production-ready (Pass)
- 85-94: Minor issues (Warning)
- 75-84: Moderate issues (Fail)
- 0-74: Major issues (Critical Fail)

BE STRICT. This is production code for App Store/Google Play deployment.`;
  }
  
  /**
   * Build analysis prompt for specific page
   */
  private buildAnalysisPrompt(screenshot: Screenshot): string {
    return `Analyze this screenshot against Linear mobile dark theme rules.

Page: ${screenshot.pageId}
URL: ${screenshot.url}
Viewport: ${screenshot.viewport.width}x${screenshot.viewport.height}

Perform nano-particle level validation:
1. Check background is EXACTLY #000000 (not close, EXACT)
2. Verify all spacing is multiples of 4px
3. Count glassmorphism usage (must be ≤ 1)
4. Measure text contrast ratios
5. Validate button heights (48px minimum)
6. Check animation properties (only transform/opacity)

Return JSON with overallScore, issues array, and detectedPatterns.`;
  }
  
  /**
   * Sleep helper for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
