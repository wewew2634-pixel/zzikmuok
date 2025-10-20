/**
 * SSE Progress Endpoint for Real-Time Sync Updates
 * 
 * Provides Server-Sent Events stream for onboarding sync progress.
 * Implements 90-second timeout detection with graceful degradation.
 * 
 * @route GET /api/onboarding/sync/[jobId]
 * @returns ReadableStream with SSE events
 * 
 * @example
 * ```typescript
 * const eventSource = new EventSource(`/api/onboarding/sync/${jobId}`);
 * eventSource.addEventListener('progress', (e) => {
 *   const data = JSON.parse(e.data);
 *   console.log(data.phase, data.progress);
 * });
 * ```
 * 
 * Event Types:
 * - progress: { phase: string, progress: number, message: string }
 * - complete: { success: true, message: string }
 * - error: { error: string, message: string }
 * - timeout: { warning: true, message: string }
 * 
 * Security:
 * - Validates jobId format (UUID v4)
 * - Implements 90s connection timeout
 * - Prevents memory leaks with cleanup handlers
 * 
 * Phase 5: SSE Progress Tracking
 * Created: 2025-10-18
 */

import { NextRequest, NextResponse } from 'next/server';

const TIMEOUT_MS = 90000; // 90 seconds
const HEARTBEAT_INTERVAL_MS = 15000; // 15 seconds

interface ProgressEvent {
  phase: string;
  progress: number;
  message: string;
  timestamp: number;
}

interface CompleteEvent {
  success: boolean;
  message: string;
  timestamp: number;
}

interface ErrorEvent {
  error: string;
  message: string;
  timestamp: number;
}

interface TimeoutEvent {
  warning: true;
  message: string;
  timestamp: number;
}

type SyncEvent = ProgressEvent | CompleteEvent | ErrorEvent | TimeoutEvent;

/**
 * Validates UUID v4 format for jobId
 */
function isValidJobId(jobId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(jobId);
}

/**
 * Simulates sync progress for demonstration
 * In production, this would subscribe to Redis pub/sub or database polling
 */
async function* generateSyncEvents(jobId: string): AsyncGenerator<SyncEvent> {
  const phases = [
    { name: 'reels', label: '릴스', duration: 30 },
    { name: 'stories', label: '스토리', duration: 20 },
    { name: 'insights', label: '프로필 인사이트', duration: 20 },
  ];

  try {
    for (const phase of phases) {
      // Simulate phase progress
      for (let progress = 0; progress <= 100; progress += 10) {
        yield {
          phase: phase.name,
          progress,
          message: `${phase.label} 데이터 동기화 중... (${progress}%)`,
          timestamp: Date.now(),
        };

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, phase.duration * 10));
      }
    }

    // Completion event
    yield {
      success: true,
      message: '모든 데이터 동기화가 완료되었습니다.',
      timestamp: Date.now(),
    };
  } catch (error) {
    // Error event
    yield {
      error: 'SYNC_ERROR',
      message: '데이터 동기화 중 오류가 발생했습니다.',
      timestamp: Date.now(),
    };
  }
}

/**
 * GET /api/onboarding/sync/[jobId]
 * 
 * Returns SSE stream with sync progress updates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  // Validate jobId format
  if (!isValidJobId(jobId)) {
    return NextResponse.json(
      { error: 'Invalid jobId format. Expected UUID v4.' },
      { status: 400 }
    );
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  let timeoutId: NodeJS.Timeout | null = null;
  let heartbeatId: NodeJS.Timeout | null = null;
  let streamClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send SSE event
      const sendEvent = (eventType: string, data: any) => {
        if (streamClosed) return;

        const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Setup 90s timeout
      timeoutId = setTimeout(() => {
        if (streamClosed) return;

        // Send timeout warning event
        sendEvent('timeout', {
          warning: true,
          message: '네트워크가 지연되고 있습니다. 작업은 백그라운드에서 계속됩니다.',
          timestamp: Date.now(),
        });

        // Keep connection open for graceful client handling
        // Client can choose to close or wait for completion
      }, TIMEOUT_MS);

      // Setup heartbeat to keep connection alive
      heartbeatId = setInterval(() => {
        if (streamClosed) return;
        sendEvent('heartbeat', { timestamp: Date.now() });
      }, HEARTBEAT_INTERVAL_MS);

      // Send initial connection event
      sendEvent('connected', {
        jobId,
        message: '동기화 시작',
        timestamp: Date.now(),
      });

      try {
        // Generate sync events
        for await (const event of generateSyncEvents(jobId)) {
          if (streamClosed) break;

          if ('phase' in event) {
            sendEvent('progress', event);
          } else if ('success' in event) {
            sendEvent('complete', event);
            break; // End stream on completion
          } else if ('error' in event) {
            sendEvent('error', event);
            break; // End stream on error
          }
        }
      } catch (error) {
        if (!streamClosed) {
          sendEvent('error', {
            error: 'STREAM_ERROR',
            message: '스트림 처리 중 오류가 발생했습니다.',
            timestamp: Date.now(),
          });
        }
      } finally {
        // Cleanup
        if (timeoutId) clearTimeout(timeoutId);
        if (heartbeatId) clearInterval(heartbeatId);
        streamClosed = true;
        
        // Close the stream
        try {
          controller.close();
        } catch (e) {
          // Stream already closed
        }
      }
    },

    cancel() {
      // Client closed connection
      streamClosed = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (heartbeatId) clearInterval(heartbeatId);
    },
  });

  // Return SSE response with proper headers
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
