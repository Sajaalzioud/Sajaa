"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2Icon, SparklesIcon, CheckIcon, XIcon } from "lucide-react";
import { AI_ACTIONS, type AiActionKey } from "@/lib/ai/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const REWRITE_ACTIONS: AiActionKey[] = [
  "improve",
  "grammar",
  "professional",
  "summarize",
  "expand",
];
const GENERATE_ACTIONS: AiActionKey[] = [
  "smartGoals",
  "objectives",
  "interventions",
  "activities",
  "homeProgram",
  "clinicalReasoning",
  "recommendations",
];

/**
 * AI assistant attached to a text section. Rewrites are proposed, not applied:
 * the therapist reviews the suggestion and explicitly accepts or discards it.
 */
export function AiToolbar({
  getText,
  context,
  onResult,
}: {
  getText: () => string;
  context: string;
  onResult: (text: string) => void;
}) {
  const [loading, setLoading] = React.useState<AiActionKey | null>(null);
  const [suggestion, setSuggestion] = React.useState<string | null>(null);

  async function run(action: AiActionKey) {
    setLoading(action);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: getText(), context }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "AI request failed");
        return;
      }
      setSuggestion(data.text);
    } catch {
      toast.error("AI request failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-primary" disabled={!!loading}>
            {loading ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SparklesIcon />
            )}
            AI Assist
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Rewrite</DropdownMenuLabel>
          {REWRITE_ACTIONS.map((a) => (
            <DropdownMenuItem key={a} onClick={() => run(a)}>
              {AI_ACTIONS[a].label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Generate from this text</DropdownMenuLabel>
          {GENERATE_ACTIONS.map((a) => (
            <DropdownMenuItem key={a} onClick={() => run(a)}>
              {AI_ACTIONS[a].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {suggestion && (
        <div className="border-primary/40 bg-primary/5 mt-2 rounded-lg border p-3">
          <div className="text-primary mb-1 flex items-center gap-1.5 text-xs font-medium">
            <SparklesIcon className="size-3.5" /> AI suggestion — review before
            accepting
          </div>
          <p className="text-sm whitespace-pre-wrap">{suggestion}</p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onResult(suggestion);
                setSuggestion(null);
              }}
            >
              <CheckIcon /> Use this
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSuggestion(null)}>
              <XIcon /> Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
