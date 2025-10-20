/**
 * API Route: Approve Loop Iteration
 * POST /api/design-loop/approve
 * 
 * Manually approve fixes for semi-auto mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { Orchestrator } from '@/../../design-system/loop-agent/orchestrator';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { iteration, approved, suggestions } = body;

    if (typeof iteration !== 'number') {
      return NextResponse.json(
        { error: 'iteration number is required' },
        { status: 400 }
      );
    }

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'approved boolean is required' },
        { status: 400 }
      );
    }

    // Load current state
    const state = await Orchestrator.loadState();
    if (!state) {
      return NextResponse.json(
        { error: 'No active loop found' },
        { status: 404 }
      );
    }

    // Find the iteration
    const iterationData = state.history.iterations.find(
      (iter) => iter.iteration === iteration
    );

    if (!iterationData) {
      return NextResponse.json(
        { error: `Iteration ${iteration} not found` },
        { status: 404 }
      );
    }

    // Process approval
    if (approved) {
      // Apply selected suggestions (if provided)
      const suggestionsToApply = suggestions || iterationData.suggestions
        .filter(s => s.fixType === 'auto')
        .map(s => s.issueId);

      return NextResponse.json({
        success: true,
        message: `Approved ${suggestionsToApply.length} fixes for iteration ${iteration}`,
        applied: suggestionsToApply,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: `Iteration ${iteration} rejected - manual intervention required`,
        status: 'rejected',
      });
    }

  } catch (error) {
    console.error('Failed to approve iteration:', error);
    return NextResponse.json(
      { error: 'Failed to approve iteration', details: String(error) },
      { status: 500 }
    );
  }
}
