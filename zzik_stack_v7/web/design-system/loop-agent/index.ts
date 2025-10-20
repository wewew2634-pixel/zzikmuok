/**
 * LOOP AGENT - Main Entry Point
 * 
 * Usage:
 *   import { createLoopAgent } from './design-system/loop-agent';
 * 
 *   const agent = createLoopAgent({
 *     mode: 'semi-auto',
 *     maxIterations: 10,
 *     pages: [...],
 *     rules: {...}
 *   });
 * 
 *   const result = await agent.start();
 */

export { Orchestrator } from './orchestrator';
export { CaptureAgent } from './capture-agent';
export { AnalyzeAgent } from './analyze-agent';
export { CompareAgent } from './compare-agent';
export { SuggestAgent } from './suggest-agent';
export { VerifyAgent } from './verify-agent';
export { FixAgent } from './fix-agent';
export { PriorityEngine } from './priority-engine';
export { ComponentFinder } from './component-finder';
export { StateManager } from './state-manager';

export * from './types';

import { Orchestrator } from './orchestrator';
import { LoopConfig } from './types';

/**
 * Create a new Loop Agent instance
 */
export function createLoopAgent(config: LoopConfig): Orchestrator {
  return new Orchestrator(config);
}

/**
 * Quick start with default configuration
 */
export async function quickStart(mode: 'auto' | 'semi-auto' | 'manual' = 'semi-auto') {
  const config: LoopConfig = {
    mode,
    maxIterations: 10,
    baseUrl: process.env.LOOP_BASE_URL || 'http://localhost:3000',
    exitConditions: {
      scoreThreshold: 95,
      consecutivePassCount: 2,
      zeroHighIssues: true,
    },
    autoFix: mode === 'auto',
    autoCommit: false, // Safety: Manual commit by default
    pages: [
      {
        id: 'home',
        name: 'Home Page',
        url: `${process.env.LOOP_BASE_URL || 'http://localhost:3000'}/`,
        waitForSelectors: [],
      },
      {
        id: 'matching',
        name: 'Matching Page',
        url: `${process.env.LOOP_BASE_URL || 'http://localhost:3000'}/matching`,
        waitForSelectors: [],
      },
      {
        id: 'assistant',
        name: 'Assistant Page',
        url: `${process.env.LOOP_BASE_URL || 'http://localhost:3000'}/assistant`,
        waitForSelectors: [],
      },
      {
        id: 'analytics',
        name: 'Analytics Page',
        url: `${process.env.LOOP_BASE_URL || 'http://localhost:3000'}/analytics`,
        waitForSelectors: [],
      },
    ],
    rules: {
      colors: {
        background: {
          primary: '#000000', // EXACT TRUE BLACK
          surface100: '#0F0F0F',
          surface200: '#1A1A1A',
          surface300: '#242424',
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
          muted: 'rgba(255, 255, 255, 0.5)',
        },
        brand: {
          purpleVibrant: '#8B5CF6',
          purpleDeep: '#7C3AED',
        },
        status: {
          todo: '#3B82F6',
          progress: '#F59E0B',
          done: '#10B981',
        },
      },
      typography: {
        fontFamily: {
          sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
        },
        lineHeight: {
          heading: 1.4,
          body: 1.5,
        },
        fontSize: {
          xl: 32,
          lg: 20,
          base: 16,
          sm: 14,
          xs: 12,
        },
      },
      spacing: {
        base: 4,
        scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
        semantic: {
          cardPadding: 20,
          listItemPadding: 16,
          screenPadding: 16,
          buttonPaddingY: 14,
          buttonPaddingX: 24,
        },
      },
      components: {
        button: {
          minHeight: 48,
          borderRadius: 12,
          paddingY: 14,
          paddingX: 24,
        },
        card: {
          borderRadius: 16,
          padding: 20,
          backgroundColor: '#1A1A1A',
        },
        modal: {
          borderRadius: 16,
          backgroundColor: '#1A1A1A',
          minContrast: 21,
        },
      },
      glassmorphism: {
        maxPerScreen: 1,
        allowedElements: ['bottom-nav', 'map-overlay', 'chat-bubble'],
        blur: 20,
        saturation: 150,
      },
      animations: {
        allowedProperties: ['transform', 'opacity'],
        maxDuration: 300,
        preferredEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      accessibility: {
        minContrast: 4.5, // WCAG AA
        minTouchTarget: 44,
        comfortableTouchTarget: 48,
      },
    },
  };

  const agent = createLoopAgent(config);
  return await agent.start();
}
