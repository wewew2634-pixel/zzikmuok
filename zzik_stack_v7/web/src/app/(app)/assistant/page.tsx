"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "@/components/assistant/MessageBubble";
import PromptSuggestions from "@/components/assistant/PromptSuggestions";
import {
  ChatMessage,
  promptSuggestions,
  streamMockResponse,
} from "@/lib/assistant-prompts";

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system-1",
      role: "system",
      content: "ZZIK AI 어시스턴트에 오신 것을 환영합니다",
      timestamp: new Date(),
    },
    {
      id: "assistant-1",
      role: "assistant",
      content:
        "안녕하세요! 👋\n\n저는 ZZIK AI 어시스턴트입니다. 미션 추천, SNS 인사이트 분석, 전략 조언 등을 도와드릴 수 있습니다.\n\n아래 제안 중 하나를 선택하시거나, 자유롭게 질문해주세요!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    // Start streaming response
    const assistantMessageId = `assistant-${Date.now()}`;
    let streamedContent = "";

    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      for await (const chunk of streamMockResponse(text)) {
        streamedContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: streamedContent }
              : msg
          )
        );
      }

      // Finalize streaming
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Streaming error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "죄송합니다. 응답 중 오류가 발생했습니다.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const showSuggestions = messages.length <= 2;

  return (
    <main className="flex h-dvh flex-col bg-[var(--color-surface-base)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 px-6 py-4 backdrop-blur-xl">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent-light)] to-[var(--color-accent-hover)] text-xl">
              🤖
            </div>
            <div>
              <h1 className="text-lg font-semibold">AI 어시스턴트</h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                미션 추천 · 인사이트 분석 · 전략 조언
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="container mx-auto max-w-4xl space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {showSuggestions && !isStreaming && (
            <div className="space-y-4 pt-6">
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                추천 질문
              </p>
              <PromptSuggestions
                suggestions={promptSuggestions.slice(0, 4)}
                onSelect={handleSendMessage}
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/80 px-6 py-4 backdrop-blur-xl">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-end gap-3">
            <div className="flex-1 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-raised)] focus-within:border-[var(--color-accent-primary)] focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)]/20">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                rows={1}
                disabled={isStreaming}
                className="w-full resize-none bg-transparent px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  maxHeight: "120px",
                  minHeight: "48px",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)] shadow-md transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="메시지 전송"
            >
              {isStreaming ? (
                <svg
                  className="size-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
            Enter로 전송 · Shift+Enter로 줄바꿈
          </p>
        </div>
      </div>
    </main>
  );
}
