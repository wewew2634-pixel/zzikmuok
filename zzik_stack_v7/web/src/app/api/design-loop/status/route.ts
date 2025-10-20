/**
 * API Route: Get Design Loop Status
 * GET /api/design-loop/status
 * 
 * Returns current loop state and progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@/../../design-system/loop-agent/orchestrator';
import * as fs from 'fs/promises';
import * as path from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Load current state from disk
    const state = await Orchestrator.loadState();

    if (!state) {
      return NextResponse.json({
        running: false,
        message: 'No active loop found',
      });
    }

    // Calculate progress
    const totalIterations = state.history.iterations.length;
    const lastIteration = state.history.iterations[totalIterations - 1];
    
    const progress = {
      currentIteration: state.currentIteration,
      totalIterations: totalIterations,
      currentScore: lastIteration?.summary.averageScore || 0,
      scoreHistory: state.history.scores,
      trend: this.calculateTrend(state.history.scores),
      exitReason: state.exitReason,
    };

    const summary = {
      id: state.id,
      running: !state.exitReason,
      progress,
      lastIteration: lastIteration ? {
        iteration: lastIteration.iteration,
        timestamp: lastIteration.timestamp,
        duration: lastIteration.duration,
        score: lastIteration.summary.averageScore,
        totalIssues: lastIteration.summary.totalIssues,
        criticalIssues: lastIteration.summary.criticalIssues,
        autoFixableCount: lastIteration.summary.autoFixableCount,
      } : null,
      improvements: state.history.improvements.slice(-5), // Last 5
      regressions: state.history.regressions.slice(-5), // Last 5
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Failed to get loop status:', error);
    return NextResponse.json(
      { error: 'Failed to get loop status', details: String(error) },
      { status: 500 }
    );
  }
}

function calculateTrend(scores: number[]): 'improving' | 'declining' | 'stagnant' {
  if (scores.length < 2) return 'stagnant';
  
  const recent = scores.slice(-3);
  if (recent.length < 2) return 'stagnant';
  
  const delta = recent[recent.length - 1] - recent[0];
  
  if (delta > 1) return 'improving';
  if (delta < -1) return 'declining';
  return 'stagnant';
}
