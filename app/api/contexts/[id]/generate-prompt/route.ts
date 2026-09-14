import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePromptForProvider } from "@/lib/prompts/generators";
import { StructuredContext, AIProvider } from "@/lib/types";
import { z } from "zod";

const schema = z.object({
  provider: z.enum(["chatgpt", "claude", "gemini", "grok", "other", "universal"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const context = await prisma.context.findFirst({
    where: { id: id, userId: session.user.id },
  });

  if (!context) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  const structured = context.structured as unknown as StructuredContext;
  const prompt = generatePromptForProvider(parsed.data.provider as AIProvider, structured);

  return NextResponse.json({ prompt });
}
