import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(
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
    include: { sharedLinks: true },
  });

  if (!context) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  // If already shared, return existing token
  const existing = context.sharedLinks[0];
  if (existing) {
    return NextResponse.json({ token: existing.token, isExisting: true });
  }

  const token = nanoid(12);
  const shared = await prisma.sharedContext.create({
    data: {
      contextId: context.id,
      userId: session.user.id,
      token,
    },
  });

  return NextResponse.json({ token: shared.token, isExisting: false });
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

  await prisma.sharedContext.deleteMany({
    where: { contextId: id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
