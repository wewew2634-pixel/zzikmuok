/**
 * API Route: Start Design Loop
 * POST /api/design-loop/start
 * 
 * Starts a new design loop iteration cycle
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLoopAgent } from '@/../../design-system/loop-agent';
import { LoopConfig } from '@/../../design-system/loop-agent/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const config: LoopConfig = {
      mode: body.mode || 'semi-auto',
      maxIterations: body.maxIterations || 10,
      baseUrl: body.baseUrl || process.env.LOOP_BASE_URL || 'http://localhost:3000',
      exitConditions: {
        scoreThreshold: body.exitConditions?.scoreThreshold || 95,
        consecutivePassCount: body.exitConditions?.consecutivePassCount || 2,
        zeroHighIssues: body.exitConditions?.zeroHighIssues ?? true,
      },
      autoFix: body.autoFix ?? (body.mode === 'auto'),
      autoCommit: body.autoCommit ?? false,
      pages: body.pages || [
        {
          id: 'home',
          name: 'Home Page',
          url: '/home',
          waitForSelectors: ['.map-container'],
        },
        {
          id: 'feed',
          name: 'Feed Page',
          url: '/feed',
          waitForSelectors: ['.feed-list'],
        },
        {
          id: 'profile',
          name: 'Profile Page',
          url: '/profile',
          waitForSelectors: ['.profile-header'],
        },
        {
          id: 'search',
          name: 'Search Page',
          url: '/search',
          waitForSelectors: ['.search-input'],
        },
      ],
      rules: body.rules || require('@/../../design-system/loop-agent/default-rules.json'),
    };

    // Validate config
    if (!config.pages || config.pages.length === 0) {
      return NextResponse.json(
        { error: 'At least one page must be specified' },
        { status: 400 }
      );
    }

    if (config.maxIterations < 1 || config.maxIterations > 50) {
      return NextResponse.json(
        { error: 'maxIterations must be between 1 and 50' },
        { status: 400 }
      );
    }

    // Create and start loop agent
    const agent = createLoopAgent(config);
    
    // Start loop asynchronously (don't await - runs in background)
    const loopPromise = agent.start();

    // Return immediately with loop ID
    return NextResponse.json({
      success: true,
      loopId: `loop-${Date.now()}`,
      config: {
        mode: config.mode,
        maxIterations: config.maxIterations,
        pages: config.pages.map(p => ({ id: p.id, name: p.name })),
      },
      message: 'Design loop started successfully',
    });

  } catch (error) {
    console.error('Failed to start design loop:', error);
    return NextResponse.json(
      { error: 'Failed to start design loop', details: String(error) },
      { status: 500 }
    );
  }
}
