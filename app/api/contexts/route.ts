import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contexts = await prisma.context.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        tokensOriginal: true,
        tokensCompressed: true,
        currentVersion: true,
        createdAt: true,
        updatedAt: true,
        conversation: { select: { sourceAI: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { sharedLinks: true } },
      },
    });

    return NextResponse.json({ contexts });
  } catch (error) {
    console.error("Get contexts error:", error);
    return NextResponse.json({ error: "Failed to fetch contexts" }, { status: 500 });
  }
}
