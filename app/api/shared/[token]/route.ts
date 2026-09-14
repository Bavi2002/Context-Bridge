import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const shared = await prisma.sharedContext.findUnique({
    where: { token: token },
    include: {
      context: {
        select: {
          id: true,
          title: true,
          structured: true,
          tokensOriginal: true,
          tokensCompressed: true,
          updatedAt: true,
          conversation: { select: { sourceAI: true } },
        },
      },
    },
  });

  if (!shared) {
    return NextResponse.json({ error: "Shared context not found" }, { status: 404 });
  }

  // Increment view count
  await prisma.sharedContext.update({
    where: { token: token },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ context: shared.context });
}
