import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createContextProcessor } from "@/lib/ai/processor";
import { z } from "zod";

const analyzeSchema = z.object({
  title: z.string().min(1).max(200),
  sourceAI: z.string().default("unknown"),
  rawText: z.string().min(10).max(200000),
  projectId: z.string().optional(),
  mode: z.enum(["full", "balanced", "compact"]).default("balanced"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, sourceAI, rawText, projectId } = parsed.data;

    const processor = createContextProcessor();
    const { structured, stats } = await processor.analyzeConversation(rawText, title);

    // Save conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        rawText,
        sourceAI,
      },
    });

    // Save context
    const context = await prisma.context.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        conversationId: conversation.id,
        title: structured.title || title,
        structured: structured as object,
        tokensOriginal: stats.tokensOriginal,
        tokensCompressed: stats.tokensCompressed,
        currentVersion: 1,
      },
    });

    // Create first version snapshot
    await prisma.contextVersion.create({
      data: {
        contextId: context.id,
        version: 1,
        structured: structured as object,
        changeSummary: "Initial analysis",
      },
    });

    return NextResponse.json({
      context: {
        id: context.id,
        title: context.title,
        structured,
        stats,
      },
    });
  } catch (error) {
    console.error("Context analyze error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
