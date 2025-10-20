"use client";

import { ChatMessage } from "@/lib/assistant-prompts";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-4">
        <div className="rounded-lg bg-[var(--color-surface-raised)]/60 px-4 py-2 text-xs text-[var(--color-text-tertiary)]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm ${
          isUser
            ? "bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)]"
            : "bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]"
        }`}
      >
        {isUser ? "👤" : "🤖"}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[75%] space-y-2 rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[var(--color-accent-primary)] text-[oklch(10%_0_0)]"
            : "border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]"
        }`}
      >
        <div
          className={`text-sm leading-relaxed ${
            isUser
              ? "text-[oklch(10%_0_0)]"
              : "text-[var(--color-text-primary)]"
          }`}
        >
          {/* Markdown-style formatting */}
          {message.content.split("\n").map((line, index) => {
            // Bold text
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={index} className="font-semibold">
                  {line.slice(2, -2)}
                </p>
              );
            }
            // List items
            if (line.trim().startsWith("-")) {
              return (
                <li key={index} className="ml-4">
                  {line.trim().slice(1).trim()}
                </li>
              );
            }
            // Numbers
            if (/^\d+\./.test(line.trim())) {
              return (
                <li key={index} className="ml-4 list-decimal">
                  {line.trim().replace(/^\d+\.\s*/, "")}
                </li>
              );
            }
            // Empty line
            if (line.trim() === "") {
              return <br key={index} />;
            }
            // Regular text
            return <p key={index}>{line}</p>;
          })}
        </div>

        {/* Streaming indicator */}
        {message.isStreaming && (
          <div className="flex items-center gap-1">
            <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-accent-primary)]" />
            <span
              className="size-1.5 animate-pulse rounded-full bg-[var(--color-accent-primary)]"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="size-1.5 animate-pulse rounded-full bg-[var(--color-accent-primary)]"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-xs ${
            isUser
              ? "text-[oklch(10%_0_0)]/60"
              : "text-[var(--color-text-tertiary)]"
          }`}
        >
          {message.timestamp.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
