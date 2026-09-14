import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePromptForProvider } from "@/lib/prompts/generators";
import { StructuredContext, AIProvider } from "@/lib/types";
import { z } from "zod";

const schema = z.object({
  provider: z.enum(["chatgpt", "claude", "gemini", "grok", "other", "universal"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const shared = await prisma.sharedContext.findUnique({
    where: { token: token },
    include: { context: { select: { structured: true } } },
  });

  if (!shared) {
    return NextResponse.json({ error: "Shared context not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const structured = shared.context.structured as unknown as StructuredContext;
  const prompt = generatePromptForProvider(parsed.data.provider as AIProvider, structured);

  return NextResponse.json({ prompt });
}
