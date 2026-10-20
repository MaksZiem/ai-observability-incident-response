"use client";

import { useOptimistic, useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/features/analysis/actions";
import type { ChatMessage, ChatRole } from "@/features/analysis/types";

const ROLE_LABELS: Record<ChatRole, string> = {
  user: "You",
  assistant: "Assistant",
};

const SUGGESTIONS = [
  "Why did latency increase?",
  "What changed before the errors started?",
  "Which service is most likely involved?",
];

type IncidentChatProps = {
  projectId: string;
  incidentId: string;
  messages: ChatMessage[];
};

export function IncidentChat({
  projectId,
  incidentId,
  messages,
}: IncidentChatProps) {
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [visible, addQuestion] = useOptimistic(
    messages,
    (current, question: string): ChatMessage[] => [
      ...current,
      {
        id: "pending",
        incidentId,
        role: "user",
        content: question,
        authorId: null,
        model: null,
        createdAt: new Date().toISOString(),
      },
    ],
  );
  const waiting = visible.length > messages.length;

  async function send(formData: FormData) {
    const question = String(formData.get("message") ?? "").trim();
    if (!question) return;

    setError(null);
    addQuestion(question);
    const result = await askAssistant(projectId, incidentId, question);
    setError(result.error);
    setDraft(result.error ? question : "");
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.length === 0 ? (
        <ul className="flex flex-col gap-1 text-[13px] text-fg-muted">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion}>“{suggestion}”</li>
          ))}
        </ul>
      ) : (
        <ol className="flex max-h-[480px] flex-col overflow-y-auto text-[13px]">
          {visible.map((message) => (
            <li
              key={message.id}
              className="flex flex-col gap-1 border-b border-border py-2.5 first:pt-0 last:border-b-0"
            >
              <span
                className={`text-xs font-medium ${
                  message.role === "assistant" ? "text-accent" : "text-fg-muted"
                }`}
              >
                {ROLE_LABELS[message.role]}
              </span>
              <p className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </li>
          ))}
          {waiting && (
            <li className="py-2.5 text-xs text-fg-muted" aria-live="polite">
              Waiting for the assistant…
            </li>
          )}
        </ol>
      )}

      <form action={send} className="flex flex-col gap-2">
        <label className="sr-only" htmlFor="incident-question">
          Question
        </label>
        <Textarea
          id="incident-question"
          name="message"
          rows={2}
          maxLength={2000}
          placeholder="Ask about this incident"
          defaultValue={draft}
          required
        />
        <div className="flex items-center justify-between gap-3">
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
          <SubmitButton pendingLabel="Asking…">Ask</SubmitButton>
        </div>
      </form>
    </div>
  );
}
