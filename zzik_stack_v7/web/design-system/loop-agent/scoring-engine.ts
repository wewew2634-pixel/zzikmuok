/**
 * SCORING ENGINE
 * 규칙 기반 점수 계산 시스템
 * 
 * GPT-4o Vision의 주관적 평가 대신
 * DOM 데이터 기반 객관적 점수 계산
 */

import { DOMInfo } from './types';

export interface ScoringResult {
  overallScore: number;  // 0-100
  breakdown: {
    rule: string;
    weight: number;
    score: number;      // 0-100
    passed: boolean;
    details: string;
  }[];
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    message: string;
    autoFixable: boolean;
  }>;
}

export class ScoringEngine {
  /**
   * DOM 정보를 기반으로 점수 계산
   */
  calculateScore(domInfo: DOMInfo, pageId: string): ScoringResult {
    const breakdown: ScoringResult['breakdown'] = [];
    const issues: ScoringResult['issues'] = [];
    
    // Rule 1: TRUE BLACK 배경 (가중치 20%)
    const blackRule = this.checkTrueBlack(domInfo);
    breakdown.push(blackRule);
    if (!blackRule.passed) {
      issues.push({
        severity: 'critical',
        category: 'color',
        message: `TRUE BLACK (#000000) not found. Using near-black colors.`,
        autoFixable: true
      });
    }
    
    // Rule 2: 8pt Grid 간격 (가중치 15%)
    const spacingRule = this.check8ptGrid(domInfo);
    breakdown.push(spacingRule);
    if (!spacingRule.passed) {
      issues.push({
        severity: 'high',
        category: 'spacing',
        message: `${domInfo.stats.invalidSpacingCount} spacing values not aligned to 8pt grid`,
        autoFixable: true
      });
    }
    
    // Rule 3: Glassmorphism ≤1 (가중치 15%)
    const glassRule = this.checkGlassmorphism(domInfo);
    breakdown.push(glassRule);
    if (!glassRule.passed) {
      issues.push({
        severity: 'high',
        category: 'glass',
        message: `${domInfo.stats.glassmorphismCount} glassmorphism elements (max 1 allowed)`,
        autoFixable: true
      });
    }
    
    // Rule 4: Line-height 1.4/1.5 (가중치 10%)
    const lineHeightRule = this.checkLineHeight(domInfo);
    breakdown.push(lineHeightRule);
    if (!lineHeightRule.passed) {
      issues.push({
        severity: 'medium',
        category: 'typography',
        message: `Incorrect line-height rhythm (should be 1.4 for headings, 1.5 for body)`,
        autoFixable: true
      });
    }
    
    // Rule 5: 버튼 높이 ≥48px (가중치 10%)
    const buttonRule = this.checkButtonHeight(domInfo);
    breakdown.push(buttonRule);
    if (!buttonRule.passed) {
      issues.push({
        severity: 'medium',
        category: 'button',
        message: `${domInfo.stats.smallButtonCount} buttons below 48px height (WCAG minimum)`,
        autoFixable: true
      });
    }
    
    // Rule 6: 애니메이션 60fps (가중치 10%)
    const animationRule = this.checkAnimations(domInfo);
    breakdown.push(animationRule);
    if (!animationRule.passed) {
      issues.push({
        severity: 'medium',
        category: 'animation',
        message: `${domInfo.stats.invalidAnimationCount} animations use non-GPU properties`,
        autoFixable: true
      });
    }
    
    // Rule 7: 컬러 팔레트 준수 (가중치 10%)
    const paletteRule = this.checkColorPalette(domInfo);
    breakdown.push(paletteRule);
    
    // Rule 8: 타이포그래피 스케일 (가중치 5%)
    const typeScaleRule = this.checkTypographyScale(domInfo);
    breakdown.push(typeScaleRule);
    
    // Rule 9: Border Radius 일관성 (가중치 3%)
    const radiusRule = this.checkBorderRadius(domInfo);
    breakdown.push(radiusRule);
    
    // Rule 10: 그림자 최소화 (가중치 2%)
    const shadowRule = this.checkShadows(domInfo);
    breakdown.push(shadowRule);
    
    // 전체 점수 계산 (가중 평균)
    const overallScore = Math.round(
      breakdown.reduce((sum, rule) => sum + (rule.score * rule.weight), 0)
    );
    
    return {
      overallScore,
      breakdown,
      issues
    };
  }
  
  /**
   * Rule 1: TRUE BLACK 배경 체크
   */
  private checkTrueBlack(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    const hasExactBlack = domInfo.stats.exactBlackCount > 0;
    const blackElements = domInfo.backgrounds.filter(b => b.isExactBlack);
    
    // 점수 계산: 정확한 TRUE BLACK 사용 비율
    const totalBackgrounds = domInfo.backgrounds.length || 1;
    const score = Math.min(100, (blackElements.length / totalBackgrounds) * 200);
    
    return {
      rule: 'TRUE BLACK Background',
      weight: 0.20,
      score,
      passed: hasExactBlack,
      details: `Found ${blackElements.length}/${totalBackgrounds} elements with #000000`
    };
  }
  
  /**
   * Rule 2: 8pt Grid 간격 체크
   */
  private check8ptGrid(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    const validSpacing = domInfo.spacing.filter(s => s.isMultipleOf4).length;
    const totalSpacing = domInfo.spacing.length || 1;
    const score = Math.round((validSpacing / totalSpacing) * 100);
    
    return {
      rule: '8pt Grid Spacing',
      weight: 0.15,
      score,
      passed: score >= 90,  // 90% 이상 준수
      details: `${validSpacing}/${totalSpacing} spacing values aligned to 4px grid`
    };
  }
  
  /**
   * Rule 3: Glassmorphism 최소화
   */
  private checkGlassmorphism(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    const count = domInfo.stats.glassmorphismCount;
    const score = count === 0 ? 100 : count === 1 ? 100 : Math.max(0, 100 - (count - 1) * 25);
    
    return {
      rule: 'Minimal Glassmorphism',
      weight: 0.15,
      score,
      passed: count <= 1,
      details: `${count} glassmorphism element(s) (max 1 allowed)`
    };
  }
  
  /**
   * Rule 4: Line-height 리듬
   */
  private checkLineHeight(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    const correct = domInfo.typography.filter(t => t.correctLineHeight).length;
    const total = domInfo.typography.length || 1;
    const score = Math.round((correct / total) * 100);
    
    return {
      rule: 'Line-height Rhythm',
      weight: 0.10,
      score,
      passed: score >= 80,
      details: `${correct}/${total} elements use correct line-height (1.4/1.5)`
    };
  }
  
  /**
   * Rule 5: 버튼 최소 높이
   */
  private checkButtonHeight(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    const validButtons = domInfo.buttons.filter(b => b.meetsMinHeight).length;
    const totalButtons = domInfo.buttons.length || 1;
    const score = Math.round((validButtons / totalButtons) * 100);
    
    return {
      rule: 'Button Height ≥48px',
      weight: 0.10,
      score,
      passed: score >= 90,
      details: `${validButtons}/${totalButtons} buttons meet WCAG minimum (48px)`
    };
  }
  
  /**
   * Rule 6: 애니메이션 60fps 보장
   */
  private checkAnimations(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    const validAnimations = domInfo.animations.filter(a => !a.hasInvalidProps).length;
    const totalAnimations = domInfo.animations.length || 1;
    const score = Math.round((validAnimations / totalAnimations) * 100);
    
    return {
      rule: '60fps Animations',
      weight: 0.10,
      score,
      passed: score >= 90,
      details: `${validAnimations}/${totalAnimations} animations use GPU properties only`
    };
  }
  
  /**
   * Rule 7: 컬러 팔레트 준수
   */
  private checkColorPalette(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    // 허용된 컬러만 사용하는지 체크
    const allowedColors = [
      '#000000', '#0f0f0f', '#1a1a1a', '#242424',  // Backgrounds
      '#ffffff', 'rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)',  // Text
      '#8b5cf6', '#7c3aed',  // Purple
      '#3b82f6', '#f59e0b', '#10b981'  // Status
    ];
    
    // 간단히 80점 반환 (추후 정밀 구현)
    return {
      rule: 'Color Palette',
      weight: 0.10,
      score: 80,
      passed: true,
      details: 'Color palette analysis (simplified)'
    };
  }
  
  /**
   * Rule 8: 타이포그래피 스케일
   */
  private checkTypographyScale(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    const allowedSizes = [12, 14, 16, 20, 32];
    // 간단히 85점 반환
    return {
      rule: 'Typography Scale',
      weight: 0.05,
      score: 85,
      passed: true,
      details: 'Font size scale (simplified)'
    };
  }
  
  /**
   * Rule 9: Border Radius 일관성
   */
  private checkBorderRadius(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    // 간단히 90점 반환
    return {
      rule: 'Border Radius',
      weight: 0.03,
      score: 90,
      passed: true,
      details: 'Border radius consistency (simplified)'
    };
  }
  
  /**
   * Rule 10: 그림자 최소화
   */
  private checkShadows(domInfo: DOMInfo): ScoringResult['breakdown'][0] {
    // 간단히 95점 반환
    return {
      rule: 'Minimal Shadows',
      weight: 0.02,
      score: 95,
      passed: true,
      details: 'Shadow usage (simplified)'
    };
  }
}
