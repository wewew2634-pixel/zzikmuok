// Next.js 15 App Router - OpenAI Streaming Chat API (Fixed)
import OpenAI from "openai";
import { NextRequest } from "next/server";

// Edge Runtime for low latency
export const runtime = "edge";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  history: Message[];
}

// 히스토리 길이 제한
const MAX_HISTORY = 20;

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = (await req.json()) as ChatRequest;
    let { history } = body;

    // Validate history array
    if (!history || !Array.isArray(history)) {
      return new Response(
        JSON.stringify({ error: "Invalid history format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate each message structure
    for (const msg of history) {
      if (
        !msg.role ||
        !msg.content ||
        !["user", "assistant", "system"].includes(msg.role)
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Limit history length (prevent token overflow)
    if (history.length > MAX_HISTORY) {
      history = history.slice(-MAX_HISTORY);
    }

    // Check API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize OpenAI client
    const client = new OpenAI({ apiKey });

    // System message
    const systemMessage: Message = {
      role: "system",
      content:
        "너는 한국어로 짧고 명확하게 답하는 ZZMUK 제품 챗봇이다. " +
        "ZZMUK은 3km 반경 내에서 로컬 숏폼 크리에이터와 상점을 즉시 매칭하고 T+0 정산을 지원하는 플랫폼이다. " +
        "질문이 불명확하면 추가 맥락을 물어봐라.",
    };

    // Call OpenAI Chat Completions API (FIXED: correct API)
    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [systemMessage, ...history],
      max_tokens: 500,
      temperature: 0.7,
    });

    // Create SSE stream
    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        // SSE handshake (comment frame)
        controller.enqueue(encoder.encode(":ok\n\n"));

        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;

            // Handle text delta
            if (delta) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`)
              );
            }

            // Handle stream completion
            if (chunk.choices[0]?.finish_reason) {
              controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
              controller.close();
              break;
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error("Stream error:", errorMessage);
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ message: errorMessage })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    // Return SSE response
    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e: any) {
    console.error("Chat API error:", e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
