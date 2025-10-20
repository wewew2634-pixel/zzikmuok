"use client";

import { PromptSuggestion } from "@/lib/assistant-prompts";

interface PromptSuggestionsProps {
  suggestions: PromptSuggestion[];
  onSelect: (prompt: string) => void;
}

export default function PromptSuggestions({
  suggestions,
  onSelect,
}: PromptSuggestionsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          onClick={() => onSelect(suggestion.prompt)}
          className="group flex flex-col items-start gap-2 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-surface-elevated)]/60 p-4 text-left transition-all duration-200 hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-elevated)]"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              {suggestion.icon}
            </span>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {suggestion.title}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {suggestion.description}
          </p>
        </button>
      ))}
    </div>
  );
}
