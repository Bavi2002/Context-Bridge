import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StructuredContext } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = await prisma.context.findFirst({
    where: { id: id, userId: session.user.id },
    include: {
      conversation: { select: { sourceAI: true, rawText: false } },
      project: { select: { id: true, name: true } },
      versions: { orderBy: { version: "desc" }, take: 10 },
      sharedLinks: { select: { id: true, token: true, viewCount: true, createdAt: true } },
    },
  });

  if (!context) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  return NextResponse.json({ context });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = await prisma.context.findFirst({
    where: { id: id, userId: session.user.id },
  });

  if (!context) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, structured } = body;

  // Create new version snapshot before updating
  const newVersion = context.currentVersion + 1;
  await prisma.contextVersion.create({
    data: {
      contextId: context.id,
      version: newVersion,
      structured: structured as object,
      changeSummary: body.changeSummary || `Manual edit — version ${newVersion}`,
    },
  });

  const updated = await prisma.context.update({
    where: { id: id },
    data: {
      ...(title && { title }),
      ...(structured && { structured: structured as object }),
      currentVersion: newVersion,
    },
  });

  return NextResponse.json({ context: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const context = await prisma.context.findFirst({
    where: { id: id, userId: session.user.id },
  });

  if (!context) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  await prisma.context.delete({ where: { id: id } });
  return NextResponse.json({ success: true });
}
