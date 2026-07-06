import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { AI_ACTIONS, AI_SYSTEM_PROMPT, type AiActionKey } from "@/lib/ai/actions";
import { getCurrentUser } from "@/lib/auth";

const requestSchema = z.object({
  action: z.enum(Object.keys(AI_ACTIONS) as [AiActionKey, ...AiActionKey[]]),
  text: z.string().max(20_000),
  // Non-identifying context the model may use (document type, section, age band)
  context: z.string().max(2_000).optional(),
});

export async function POST(req: Request) {
  await getCurrentUser();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI assistance is not configured. Set ANTHROPIC_API_KEY to enable it.",
      },
      { status: 503 },
    );
  }

  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const { action, text, context } = parsed.data;
  if (!text.trim()) {
    return NextResponse.json({ error: "Nothing to work with — write a few words first." }, { status: 400 });
  }

  const client = new Anthropic();
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1500,
    system: AI_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `${AI_ACTIONS[action].instruction}\n\n${context ? `Context: ${context}\n\n` : ""}Text:\n${text}`,
      },
    ],
  });

  const result = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  return NextResponse.json({ text: result });
}
